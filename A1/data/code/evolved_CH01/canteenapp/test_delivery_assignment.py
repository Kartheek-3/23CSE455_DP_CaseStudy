"""CH01 tests: real ORM, baseline routes and admin/CSRF decorators."""
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import OperationalError
from django.test import Client, TestCase
from django.urls import reverse

from .delivery_assignment import (
    AssignmentError, DeliveryAssignmentPolicy, DeliveryAssignmentService,
    LeastWorkloadAssignmentPolicy, ManualAssignmentPolicy, get_assignment_policy,
)
from .models import CustomUser, DeliveryPerson, Order, Restaurant


class AssignmentFixtures(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = CustomUser.objects.create_user(
            username='admin', email='admin@example.test', is_superuser=True, role='admin')
        cls.customer = CustomUser.objects.create_user(
            username='customer', email='customer@example.test', role='user')
        cls.permission, _ = Permission.objects.get_or_create(
            codename='is_deliveryperson',
            content_type=ContentType.objects.get_for_model(DeliveryPerson),
            defaults={'name': 'Can access delivery-specific features'})
        cls.first = cls.person('first')
        cls.second = cls.person('second')

    @classmethod
    def person(cls, name, permission=True, **kwargs):
        values = dict(username=name, email=f'{name}@example.test', role='delivery_person')
        values.update(kwargs)
        person = DeliveryPerson.objects.create_user(**values)
        if permission:
            person.user_permissions.add(cls.permission)
        return person

    def order(self, **kwargs):
        values = dict(order_id=f'CH01-{Order.objects.count() + 1}', user=self.customer,
                      total_price=Decimal('10.00'), delivery_type='delivery',
                      status='confirmed', customer_status='confirmed')
        values.update(kwargs)
        return Order.objects.create(**values)

    def assign(self, order, policy='least_workload', email=None):
        return DeliveryAssignmentService(get_assignment_policy(policy)).assign(order.order_id, email=email)


class PolicyTests(AssignmentFixtures):
    def test_registry_returns_interchangeable_policies(self):
        self.assertIsInstance(get_assignment_policy('manual'), ManualAssignmentPolicy)
        self.assertIsInstance(get_assignment_policy('least_workload'), LeastWorkloadAssignmentPolicy)
        self.assertIsInstance(get_assignment_policy('manual'), DeliveryAssignmentPolicy)

    def test_context_delegates_to_supplied_strategy(self):
        second = self.second

        class SelectSecond(DeliveryAssignmentPolicy):
            def select(self, candidates, *, email=None):
                return candidates.get(pk=second.pk)

        order = self.order()
        result = DeliveryAssignmentService(SelectSecond()).assign(order.order_id)
        self.assertEqual(result.delivery_person, second)

    def test_manual_honours_selection_even_with_higher_workload(self):
        self.order(delivery_person=self.second, status='shipped')
        order = self.order()
        self.assign(order, 'manual', self.second.email)
        order.refresh_from_db()
        self.assertEqual(order.delivery_person, self.second)
        self.assertEqual(order.status, 'shipped')

    def test_automatic_chooses_fewer_unfinished_orders(self):
        self.order(delivery_person=self.first, status='shipped')
        self.assertEqual(self.assign(self.order()).delivery_person, self.second)

    def test_zero_load_tie_uses_lowest_primary_key(self):
        self.assertLess(self.first.pk, self.second.pk)
        self.assertEqual(self.assign(self.order()).delivery_person, self.first)

    def test_nonzero_load_tie_uses_lowest_primary_key(self):
        for person in (self.first, self.second):
            self.order(delivery_person=person, status='shipped')
        self.assertEqual(self.assign(self.order()).delivery_person, self.first)

    def test_terminal_orders_and_non_delivery_orders_do_not_count(self):
        for status in ('delivered', 'cancelled'):
            self.order(delivery_person=self.first, status=status)
        self.order(delivery_person=self.first, delivery_type='pickup', status='confirmed')
        self.assertEqual(self.assign(self.order()).delivery_person, self.first)

    def test_all_nonterminal_delivery_statuses_count(self):
        for status in ('pending', 'confirmed', 'prepared', 'shipped', 'legacy-status'):
            with self.subTest(status=status):
                Order.objects.all().delete()
                self.order(delivery_person=self.first, status=status)
                self.assertEqual(self.assign(self.order()).delivery_person, self.second)

    def test_next_assignment_uses_updated_workload(self):
        self.assertEqual(self.assign(self.order()).delivery_person, self.first)
        self.assertEqual(self.assign(self.order()).delivery_person, self.second)

    def test_manual_rejects_ineligible_accounts_without_mutating_order(self):
        candidates = [self.person('inactive', is_active=False),
                      self.person('wrong-role', role='user'),
                      self.person('superuser', is_superuser=True),
                      self.person('no-permission', permission=False)]
        for person in candidates:
            with self.subTest(person=person.username):
                order = self.order()
                with self.assertRaises(AssignmentError):
                    self.assign(order, 'manual', person.email)
                order.refresh_from_db()
                self.assertIsNone(order.delivery_person)
                self.assertEqual(order.status, 'confirmed')

    def test_automatic_excludes_each_ineligible_account(self):
        for changes in ({'is_active': False}, {'role': 'user'}, {'is_superuser': True}):
            with self.subTest(changes=changes):
                self.first.is_active, self.first.role, self.first.is_superuser = True, 'delivery_person', False
                for key, value in changes.items():
                    setattr(self.first, key, value)
                self.first.save()
                order = self.order()
                self.assertEqual(self.assign(order).delivery_person, self.second)
                order.delete()
        self.first.is_active, self.first.role, self.first.is_superuser = True, 'delivery_person', False
        self.first.save()
        self.first.user_permissions.clear()
        self.assertEqual(self.assign(self.order()).delivery_person, self.second)

    def test_group_permission_is_eligible(self):
        self.first.user_permissions.clear()
        group = Group.objects.create(name='delivery')
        group.permissions.add(self.permission)
        self.first.groups.add(group)
        self.assertEqual(self.assign(self.order(), 'manual', self.first.email).delivery_person, self.first)

    def test_multiple_permission_paths_do_not_inflate_load(self):
        for name in ('one', 'two'):
            group = Group.objects.create(name=name)
            group.permissions.add(self.permission)
            self.first.groups.add(group)
        self.order(delivery_person=self.first, status='shipped')
        self.order(delivery_person=self.second, status='shipped')
        self.assertEqual(self.assign(self.order()).delivery_person, self.first)

    def test_permission_from_another_app_does_not_qualify(self):
        self.first.user_permissions.clear()
        other_type = ContentType.objects.get_for_model(Group)
        other_permission = Permission.objects.create(codename='is_deliveryperson', name='Other', content_type=other_type)
        self.first.user_permissions.add(other_permission)
        self.assertEqual(self.assign(self.order()).delivery_person, self.second)

    def test_no_eligible_candidates(self):
        DeliveryPerson.objects.update(is_active=False)
        order = self.order()
        with self.assertRaises(AssignmentError) as error:
            self.assign(order)
        self.assertEqual(error.exception.status, 409)
        order.refresh_from_db()
        self.assertIsNone(order.delivery_person)

    def test_regular_user_is_not_a_delivery_candidate(self):
        self.customer.user_permissions.add(self.permission)
        with self.assertRaises(AssignmentError):
            self.assign(self.order(), 'manual', self.customer.email)

    def test_ineligible_orders_are_not_changed(self):
        for changes in ({'delivery_type': 'pickup'}, {'delivery_type': 'dining'},
                        {'status': 'pending'}, {'status': 'delivered'}, {'status': 'cancelled'},
                        {'status': 'shipped'}, {'customer_status': 'pending'},
                        {'delivery_person': self.first}):
            with self.subTest(changes=changes):
                order = self.order(**changes)
                before = (order.status, order.delivery_person_id)
                with self.assertRaises(AssignmentError) as error:
                    self.assign(order)
                self.assertEqual(error.exception.status, 409)
                order.refresh_from_db()
                self.assertEqual((order.status, order.delivery_person_id), before)

    def test_repeated_assignment_cannot_overwrite_first_assignment(self):
        order = self.order()
        self.assign(order, 'manual', self.first.email)
        with self.assertRaises(AssignmentError):
            self.assign(order, 'manual', self.second.email)
        order.refresh_from_db()
        self.assertEqual(order.delivery_person, self.first)


class AssignmentEndpointTests(AssignmentFixtures):
    def setUp(self):
        self.client.force_login(self.admin, backend='django.contrib.auth.backends.ModelBackend')
        self.url = reverse('adminassignordertodelivery')
        self.target = self.order()

    def post(self, **kwargs):
        return self.client.post(self.url, {'order_id': self.target.order_id, **kwargs}, content_type='application/json')

    def test_legacy_manual_payload_and_existing_event(self):
        with patch('canteenapp.views._notify_delivery_assignment') as notify:
            with self.captureOnCommitCallbacks(execute=True):
                response = self.post(delivery_personnel=self.second.email)
            notify.assert_called_once_with(self.second.pk, self.target.order_id)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(response.json()['policy'], 'manual')
        self.target.refresh_from_db()
        self.assertEqual(self.target.delivery_person, self.second)

    def test_automatic_payload_does_not_require_email(self):
        response = self.post(policy='least_workload')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['delivery_personnel'], self.first.email)

    def test_automatic_does_not_use_stale_manual_selection(self):
        response = self.post(policy='least_workload', delivery_personnel=self.second.email)
        self.assertEqual(response.json()['delivery_personnel'], self.first.email)

    def test_invalid_json_and_non_object_bodies(self):
        for body in ('{broken', 'null', '[]', '42', '"text"', b'\xff'):
            with self.subTest(body=body):
                response = self.client.post(self.url, body, content_type='application/json')
                self.assertEqual(response.status_code, 400)
                self.assertFalse(response.json()['success'])

    def test_invalid_policy(self):
        for policy in ('unknown', '', None, [], {}):
            with self.subTest(policy=policy):
                self.assertEqual(self.post(policy=policy).status_code, 400)

    def test_invalid_order_id(self):
        for order_id in ('', ' ', None, [], {}, 12):
            with self.subTest(order_id=order_id):
                self.assertEqual(self.post(order_id=order_id).status_code, 400)

    def test_missing_order(self):
        response = self.post(order_id='not-an-order', policy='least_workload')
        self.assertEqual(response.status_code, 404)

    def test_invalid_or_missing_manual_selection(self):
        for value in ('missing@example.test', '', None, [], {}, 12):
            with self.subTest(value=value):
                self.assertEqual(self.post(delivery_personnel=value).status_code, 400)
        self.assertEqual(self.post().status_code, 400)

    def test_inactive_manual_selection(self):
        self.first.is_active = False
        self.first.save()
        self.assertEqual(self.post(delivery_personnel=self.first.email).status_code, 400)

    def test_no_candidates_returns_conflict_without_notification(self):
        DeliveryPerson.objects.update(is_active=False)
        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            response = self.post(policy='least_workload')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(callbacks, [])
        self.target.refresh_from_db()
        self.assertEqual(self.target.status, 'confirmed')

    def test_database_failure_is_retryable_and_does_not_expose_details(self):
        with patch('canteenapp.views.DeliveryAssignmentService.assign', side_effect=OperationalError('internal detail')):
            with self.assertLogs('canteenapp.views', level='ERROR'):
                response = self.post(policy='least_workload')
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('internal detail', response.content.decode())

    def test_notification_failure_does_not_claim_assignment_failed(self):
        with patch('canteenapp.views._notify_delivery_assignment', side_effect=RuntimeError('offline')):
            with self.assertLogs('django.test', level='ERROR'):
                with self.captureOnCommitCallbacks(execute=True):
                    response = self.post(policy='least_workload')
        self.assertEqual(response.status_code, 200)
        self.target.refresh_from_db()
        self.assertEqual(self.target.status, 'shipped')

    def test_actual_inmemory_channel_receives_preserved_event(self):
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        from canteenapp.views import _notify_delivery_assignment
        layer = get_channel_layer()
        channel = async_to_sync(layer.new_channel)()
        async_to_sync(layer.group_add)(f'delivery_person_{self.first.pk}', channel)
        _notify_delivery_assignment(self.first.pk, self.target.order_id)
        self.assertEqual(async_to_sync(layer.receive)(channel), {'type': 'new_order', 'order_id': self.target.order_id})
        async_to_sync(layer.group_discard)(f'delivery_person_{self.first.pk}', channel)

    def test_get_not_allowed(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)

    def test_non_admin_cannot_assign(self):
        self.client.force_login(self.customer, backend='django.contrib.auth.backends.ModelBackend')
        self.assertEqual(self.post(policy='least_workload').status_code, 302)
        self.target.refresh_from_db()
        self.assertIsNone(self.target.delivery_person)

    def test_anonymous_cannot_assign(self):
        self.client.logout()
        self.assertEqual(self.post(policy='least_workload').status_code, 302)

    def test_csrf_is_enforced(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.admin, backend='django.contrib.auth.backends.ModelBackend')
        response = client.post(self.url, {'order_id': self.target.order_id, 'policy': 'least_workload'}, content_type='application/json')
        self.assertEqual(response.status_code, 403)

    def test_admin_template_contains_both_policies(self):
        response = self.client.get(reverse('adminassignorder'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'value="manual"')
        self.assertContains(response, 'value="least_workload"')
        self.assertContains(response, 'id="deliverypersonnel"')

    def test_assignment_dropdown_filters_without_changing_general_personnel_list(self):
        inactive = self.person('inactive-dropdown', is_active=False)
        url = reverse('admingetdeliverypersonnels')
        filtered = self.client.get(url, {'eligible_for_assignment': '1'})
        self.assertEqual(filtered.status_code, 200)
        self.assertEqual({p['email'] for p in filtered.json()['data']}, {self.first.email, self.second.email})
        unfiltered = self.client.get(url)
        self.assertIn(inactive.email, {p['email'] for p in unfiltered.json()['data']})

    def test_queue_to_assignment_flow_removes_assigned_order(self):
        restaurant = Restaurant.objects.create_user(
            username='restaurant', email='restaurant@example.test',
            role='restaurant', restaurant_name='Test canteen')
        self.target.restaurant = restaurant
        self.target.save()
        queue_url = reverse('admingettobeassignedorders')
        before = self.client.get(queue_url)
        self.assertEqual(before.status_code, 200)
        self.assertEqual([row['order_id'] for row in before.json()['orders']], [self.target.order_id])
        response = self.post(delivery_personnel=self.second.email)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(queue_url).json()['orders'], [])

    def test_manual_flow_with_real_csrf_token(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.admin, backend='django.contrib.auth.backends.ModelBackend')
        page = client.get(reverse('adminassignorder'))
        self.assertEqual(page.status_code, 200)
        token = client.cookies['csrftoken'].value
        response = client.post(self.url,
            {'order_id': self.target.order_id, 'delivery_personnel': self.second.email},
            content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 200)
        self.target.refresh_from_db()
        self.assertEqual(self.target.delivery_person, self.second)
