import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routes.analytics_routes import router as analytics_router
from routes.auth_routes import router as auth_router
from routes.listing_routes import router as listing_router
from routes.newsletter_routes import router as newsletter_router
from routes.order_routes import router as order_router
from routes.payout_routes import router as payout_router
from routes.product_routes import router as product_router

SWEEP_INTERVAL_SECONDS = 60


async def _order_sweep_loop() -> None:
    from services.order_service import sweep_pending_orders

    while True:
        try:
            await asyncio.to_thread(sweep_pending_orders)
        except Exception:
            pass  # A failed sweep just means the next one (60s later) picks up where it left off.
        await asyncio.sleep(SWEEP_INTERVAL_SECONDS)


async def _auction_sweep_loop() -> None:
    from services.auction_service import sweep_pending_auctions

    while True:
        try:
            await asyncio.to_thread(sweep_pending_auctions)
        except Exception:
            pass  # A failed sweep just means the next one (60s later) picks up where it left off.
        await asyncio.sleep(SWEEP_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Payment reminders/expiry need to fire even if nobody has a page open
    # that happens to read the affected order — see order_service.sweep_pending_orders.
    order_task = asyncio.create_task(_order_sweep_loop())
    # Auctions past their close time need to flip to sold/unsold even if
    # nobody browses Live — see auction_service.sweep_pending_auctions. This
    # also keeps that endpoint fast: it no longer has to examine (and
    # potentially close, with the order/email side effects that triggers) a
    # backlog of overdue listings on someone's page load.
    auction_task = asyncio.create_task(_auction_sweep_loop())
    yield
    order_task.cancel()
    auction_task.cancel()


app = FastAPI(title="HYPE. API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(product_router)
app.include_router(listing_router)
app.include_router(newsletter_router)
app.include_router(order_router)
app.include_router(analytics_router)
app.include_router(payout_router)


@app.get("/health")
def health():
    return {"status": "ok"}
