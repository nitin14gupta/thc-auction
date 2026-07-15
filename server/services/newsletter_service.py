from db.config import get_supabase_client


def subscribe(email: str) -> bool:
    """Returns True if this is a new subscription, False if already subscribed."""
    db = get_supabase_client()
    email = email.lower()

    existing = db.table("newsletter_subscribers").select("id").eq("email", email).limit(1).execute()
    if existing.data:
        return False

    db.table("newsletter_subscribers").insert({"email": email}).execute()
    return True
