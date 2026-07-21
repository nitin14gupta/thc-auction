import razorpay

from core.config import settings


class RazorpayClientWrapper:
    def __init__(self):
        self._client: razorpay.Client | None = None

    @property
    def client(self) -> razorpay.Client:
        if self._client is None:
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                raise RuntimeError("Razorpay credentials are not configured.")
            self._client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        return self._client

    def create_order(self, amount_rupees: float, receipt: str) -> dict:
        return self.client.order.create(
            {
                "amount": int(round(amount_rupees * 100)),
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1,
            }
        )

    def verify_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        try:
            self.client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
            return True
        except razorpay.errors.SignatureVerificationError:
            return False


razorpay_client = RazorpayClientWrapper()
