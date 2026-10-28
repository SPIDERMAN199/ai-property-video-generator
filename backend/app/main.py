import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings, UPLOADS_PATH, RENDERS_PATH
from app.models.project import init_db
from app.services.audio_service import ensure_default_bgm_track
from app.services.sample_service import ensure_sample_assets
from app.api.routes import health, projects, images, script, storyboard, render

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("realty_assistant_studio")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing SQLite database schema...")
    init_db()
    logger.info("Checking default audio assets...")
    ensure_default_bgm_track()
    logger.info("Checking sample demo image assets...")
    ensure_sample_assets()
    logger.info("AI Property Video Studio backend ready!")
    yield
    # Shutdown tasks
    logger.info("AI Property Video Studio backend shutting down.")

app = FastAPI(
    title="AI Property Video Studio by Realty Assistant",
    description="Enterprise-grade AI Marketing Video Generator for Real Estate",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev servers and previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_PATH)), name="uploads")

# Include Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(script.router, prefix="/api")
app.include_router(storyboard.router, prefix="/api")
app.include_router(render.router, prefix="/api")

@app.get("/")
def root_status():
    return {
        "app": "AI Property Video Studio by Realty Assistant",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
