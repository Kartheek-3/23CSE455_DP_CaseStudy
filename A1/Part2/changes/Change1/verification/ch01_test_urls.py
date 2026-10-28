"""Use all real project routes; suppress unrelated PhonePe startup telemetry."""
from unittest.mock import patch

with patch('phonepe.sdk.pg.payments.v1.payment_client.PhonePePaymentClient'):
    from canteen.urls import urlpatterns
