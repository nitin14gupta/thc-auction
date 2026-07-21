from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routes.analytics_routes import router as analytics_router
from routes.auth_routes import router as auth_router
from routes.listing_routes import router as listing_router
from routes.newsletter_routes import router as newsletter_router
from routes.order_routes import router as order_router
from routes.product_routes import router as product_router

app = FastAPI(title="HYPE. API", version="1.0.0")

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


@app.get("/health")
def health():
    return {"status": "ok"}
