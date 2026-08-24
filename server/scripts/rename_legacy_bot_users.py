"""One-off migration: rename leftover "Bot Buyer #####" / "@hype.bot" users
(created before simulate_activity.py was renamed to generate real-looking
names) to real-sounding Indian names and emails, matching the current
convention used by simulate_activity.py.

Usage (from server/, with the venv active):
    python scripts/rename_legacy_bot_users.py --dry-run
    python scripts/rename_legacy_bot_users.py
"""

import argparse
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from db.config import get_supabase_client  # noqa: E402

EMAIL_DOMAIN = "members.hype.test"

FIRST_NAMES = (
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
    "Krishna", "Ishaan", "Rohan", "Karan", "Aryan", "Dhruv", "Kabir", "Rudra",
    "Yash", "Aditi", "Ananya", "Diya", "Ishita", "Kavya", "Meera", "Myra",
    "Navya", "Pari", "Riya", "Saanvi", "Sara", "Tara", "Vanya", "Zara",
    "Priya", "Neha", "Pooja", "Sneha", "Anjali", "Divya", "Kritika", "Nikita",
    "Rahul", "Amit", "Vikram", "Rajesh", "Suresh", "Manish", "Deepak", "Gaurav",
    "Sanjay", "Anil", "Varun", "Nikhil", "Siddharth", "Abhishek", "Harsh", "Kunal",
)
LAST_NAMES = (
    "Sharma", "Verma", "Gupta", "Kumar", "Singh", "Patel", "Shah", "Mehta",
    "Reddy", "Rao", "Nair", "Iyer", "Menon", "Pillai", "Chawla", "Malhotra",
    "Kapoor", "Khanna", "Bhatia", "Chopra", "Agarwal", "Bansal", "Jain", "Saxena",
    "Mishra", "Pandey", "Tiwari", "Yadav", "Chauhan", "Rathore", "Joshi", "Desai",
)


def find_legacy_bot_users(db) -> list[dict]:
    res = (
        db.table("users")
        .select("id, name, email")
        .or_("email.ilike.%@hype.bot,name.ilike.Bot Buyer%")
        .execute()
    )
    return res.data or []


def main() -> None:
    parser = argparse.ArgumentParser(description="Rename leftover bot-named/emailed users to real-looking ones.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    db = get_supabase_client()
    legacy = find_legacy_bot_users(db)
    print(f"Found {len(legacy)} legacy bot-named users.")
    if not legacy:
        return

    existing_emails = {u["email"] for u in db.table("users").select("email").execute().data or []}

    updated = 0
    for user in legacy:
        while True:
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            suffix = random.randint(100, 9999)
            email = f"{first.lower()}.{last.lower()}{suffix}@{EMAIL_DOMAIN}"
            if email not in existing_emails:
                break
        existing_emails.add(email)
        name = f"{first} {last}"

        if args.dry_run:
            print(f"[dry-run] {user['name']} <{user['email']}>  ->  {name} <{email}>")
        else:
            db.table("users").update({"name": name, "email": email}).eq("id", user["id"]).execute()
        updated += 1

    print(f"{'Would update' if args.dry_run else 'Updated'} {updated} users.")


if __name__ == "__main__":
    main()
