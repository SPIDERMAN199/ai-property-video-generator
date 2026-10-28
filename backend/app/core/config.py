import os
import shutil
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    
    # AI Config
    AI_PROVIDER: str = "template"
    AI_API_KEY: str = ""
    
    # Storage
    STORAGE_DIR: str = "storage"
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: list[str] = [".jpg", ".jpeg", ".png", ".webp"]
    
    # Video
    FFMPEG_PATH: str = ""

    model_config = {"env_file": ".env", "extra": "allow"}

settings = Settings()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
APP_DIR = Path(__file__).resolve().parent.parent
STORAGE_PATH = BASE_DIR / settings.STORAGE_DIR
UPLOADS_PATH = STORAGE_PATH / "uploads"
RENDERS_PATH = STORAGE_PATH / "renders"
ASSETS_PATH = APP_DIR / "assets"
AUDIO_ASSETS_PATH = ASSETS_PATH / "audio"
SAMPLE_IMAGES_PATH = ASSETS_PATH / "sample_images"

# Ensure runtime directories exist
UPLOADS_PATH.mkdir(parents=True, exist_ok=True)
RENDERS_PATH.mkdir(parents=True, exist_ok=True)
AUDIO_ASSETS_PATH.mkdir(parents=True, exist_ok=True)
SAMPLE_IMAGES_PATH.mkdir(parents=True, exist_ok=True)

def get_ffmpeg_binary() -> str:
    """Finds FFmpeg executable via setting, system PATH, or imageio-ffmpeg."""
    if settings.FFMPEG_PATH and os.path.isfile(settings.FFMPEG_PATH):
        return settings.FFMPEG_PATH
    
    system_path = shutil.which("ffmpeg")
    if system_path:
        return system_path
    
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return ""
