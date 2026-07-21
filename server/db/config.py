import os
from supabase import create_client, Client
from dotenv import load_dotenv


_env_loaded = load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

_client: Client | None = None


def get_supabase_client() -> Client:
    """Returns a cached, process-wide client so requests reuse one warm
    connection pool instead of paying a fresh TCP+TLS handshake (~1-1.5s)
    on every call — this function is called dozens of times per request
    across the service layer."""
    global _client
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.")
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client
