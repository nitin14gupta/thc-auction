import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from core.config import settings


def _send(to_email: str, subject: str, body: str) -> None:
    message = MIMEMultipart()
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP credentials are not configured.")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, message.as_string())


def send_otp_email(to_email: str, name: str, otp: str) -> None:
    subject = "Your HYPE. password reset code"
    body = f"""Hi {name},

Your password reset code is:

    {otp}

This code expires in {settings.OTP_EXPIRE_MINUTES} minutes. If you didn't request this, you can safely ignore this email.

— HYPE.
"""
    _send(to_email, subject, body)


def send_listing_created_email(to_email: str, name: str, product_name: str) -> None:
    subject = "Your HYPE. listing was created"
    body = f"""Hi {name},

Your listing for "{product_name}" has been submitted and is now pending review.
We'll email you as soon as it's been reviewed.

— HYPE.
"""
    _send(to_email, subject, body)


def send_listing_accepted_email(
    to_email: str,
    name: str,
    product_name: str,
    auction_start_at: str | None,
    starting_price: float | None,
) -> None:
    when = auction_start_at or "to be announced"
    price = f"₹{starting_price:,.0f}" if starting_price else "to be announced"
    subject = "Your HYPE. listing was accepted"
    body = f"""Hi {name},

Great news — your listing for "{product_name}" has been accepted!

Auction starts: {when}
Starting price: {price}

— HYPE.
"""
    _send(to_email, subject, body)


def send_auction_won_email(to_email: str, name: str, product_name: str, amount: float, deadline_minutes: int) -> None:
    subject = f"You won \"{product_name}\" — pay within {deadline_minutes} minutes"
    body = f"""Hi {name},

Congratulations — you won the auction for "{product_name}" at ₹{amount:,.0f}!

You have {deadline_minutes} minutes to complete payment, or the item goes to the next highest bidder (or is marked unsold if there isn't one). Head to My Orders on HYPE. to pay now.

— HYPE.
"""
    _send(to_email, subject, body)


def send_payment_reminder_email(to_email: str, name: str, product_name: str, minutes_remaining: int) -> None:
    subject = f"{minutes_remaining} minutes left to pay for \"{product_name}\""
    body = f"""Hi {name},

Reminder — you have about {minutes_remaining} minutes left to complete payment for "{product_name}" before it goes to the next highest bidder.

Head to My Orders on HYPE. to pay now.

— HYPE.
"""
    _send(to_email, subject, body)


def send_payment_expired_reassigned_email(to_email: str, name: str, product_name: str) -> None:
    subject = f"Your payment window for \"{product_name}\" has expired"
    body = f"""Hi {name},

Your 2-hour payment window for "{product_name}" has passed without payment, so the win has moved on to the next highest bidder.

— HYPE.
"""
    _send(to_email, subject, body)


def send_payment_expired_unsold_email(to_email: str, name: str, product_name: str) -> None:
    subject = f"Your payment window for \"{product_name}\" has expired"
    body = f"""Hi {name},

Your 2-hour payment window for "{product_name}" has passed without payment. There were no other bidders, so this listing is now marked unsold.

— HYPE.
"""
    _send(to_email, subject, body)


def send_payment_confirmed_email(to_email: str, name: str, product_name: str, amount: float) -> None:
    subject = f"Payment confirmed for \"{product_name}\""
    body = f"""Hi {name},

We've received your payment of ₹{amount:,.0f} for "{product_name}". The seller will be in touch about delivery.

— HYPE.
"""
    _send(to_email, subject, body)


def send_item_sold_paid_email(to_email: str, name: str, product_name: str, amount: float) -> None:
    subject = f"\"{product_name}\" is paid for — time to ship"
    body = f"""Hi {name},

The buyer for your listing "{product_name}" has paid ₹{amount:,.0f}. Please prepare the item for shipment.

— HYPE.
"""
    _send(to_email, subject, body)
