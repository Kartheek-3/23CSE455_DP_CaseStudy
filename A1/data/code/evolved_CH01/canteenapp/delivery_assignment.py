"""CH01: interchangeable policies for the existing admin assignment workflow."""

from abc import ABC, abstractmethod

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from .models import DeliveryPerson, Order


class AssignmentError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def eligible_delivery_people():
    """Active delivery accounts allowed into the baseline delivery application.

    is_active describes the account, not real-time availability. Accept the
    baseline delivery permission whether granted directly or through a group.
    """
    permission = Q(
        user_permissions__codename="is_deliveryperson",
        user_permissions__content_type__app_label="canteenapp",
    ) | Q(
        groups__permissions__codename="is_deliveryperson",
        groups__permissions__content_type__app_label="canteenapp",
    )
    return DeliveryPerson.objects.filter(
        is_active=True, is_superuser=False, role="delivery_person"
    ).filter(permission).distinct()


class DeliveryAssignmentPolicy(ABC):
    @abstractmethod
    def select(self, candidates, *, email=None):
        """Return one eligible DeliveryPerson, or raise AssignmentError."""


class ManualAssignmentPolicy(DeliveryAssignmentPolicy):
    def select(self, candidates, *, email=None):
        if not isinstance(email, str) or not email.strip():
            raise AssignmentError("Select a delivery person for manual assignment.")
        person = candidates.filter(email=email.strip()).first()
        if person is None:
            raise AssignmentError("Selected delivery person does not exist or is ineligible.")
        return person


class LeastWorkloadAssignmentPolicy(DeliveryAssignmentPolicy):
    def select(self, candidates, *, email=None):
        # Count all non-terminal delivery orders, including unfamiliar status
        # values conservatively. Historical delivered/cancelled work is excluded.
        person = candidates.annotate(
            active_order_count=Count(
                "orders_as_delivery_person",
                filter=Q(orders_as_delivery_person__delivery_type="delivery")
                & ~Q(orders_as_delivery_person__status__in=("delivered", "cancelled")),
                distinct=True,
            )
        ).order_by("active_order_count", "pk").first()
        if person is None:
            raise AssignmentError("No eligible delivery people are available.", 409)
        return person


POLICIES = {
    "manual": ManualAssignmentPolicy(),
    "least_workload": LeastWorkloadAssignmentPolicy(),
}


def get_assignment_policy(name):
    if not isinstance(name, str) or name not in POLICIES:
        raise AssignmentError("Unknown delivery assignment policy.")
    return POLICIES[name]


class DeliveryAssignmentService:
    """Context: delegate selection, then persist the shared state transition."""

    def __init__(self, policy: DeliveryAssignmentPolicy):
        self.policy = policy

    @transaction.atomic
    def assign(self, order_id, *, email=None):
        if not isinstance(order_id, str) or not order_id.strip():
            raise AssignmentError("A valid order_id is required.")
        try:
            order = Order.objects.select_for_update().get(order_id=order_id.strip())
        except Order.DoesNotExist:
            raise AssignmentError("Order does not exist.", 404) from None
        # Match the assignment screen's queue, and prevent stale requests from
        # overwriting another assignment or reviving terminal orders.
        assignable = Order.objects.filter(
            pk=order.pk, delivery_type="delivery", status="confirmed",
            customer_status="confirmed", delivery_person__isnull=True,
        )
        if not assignable.exists():
            raise AssignmentError("Order is no longer eligible for assignment.", 409)
        person = self.policy.select(eligible_delivery_people(), email=email)
        updated_at = timezone.now()
        # Guard the write as well: SQLite does not implement SELECT FOR UPDATE.
        if assignable.update(delivery_person=person, status="shipped", updated_at=updated_at) != 1:
            raise AssignmentError("Order changed; reload before assigning again.", 409)
        order.delivery_person = person
        order.status = "shipped"
        order.updated_at = updated_at
        return order
