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
