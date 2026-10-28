import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import get_ffmpeg_binary, STORAGE_PATH
from app.models.project import get_db, Project, RenderJob
from app.schemas.project import DashboardStatsResponse

router = APIRouter(tags=["Health & Stats"])

@router.get("/health")
def check_health():
    ffmpeg_bin = get_ffmpeg_binary()
    ffmpeg_ok = bool(ffmpeg_bin and os.path.isfile(ffmpeg_bin))
    return {
        "status": "healthy",
        "app_name": "AI Property Video Studio by Realty Assistant",
        "version": "1.0.0",
        "ffmpeg_available": ffmpeg_ok,
        "ffmpeg_path": ffmpeg_bin if ffmpeg_ok else None,
        "storage_ready": STORAGE_PATH.exists(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    completed_videos = db.query(func.count(RenderJob.id)).filter(RenderJob.status == "completed").scalar() or 0
    
    # Videos created in past 7 days
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    videos_this_week = db.query(func.count(RenderJob.id)).filter(
        RenderJob.status == "completed",
        RenderJob.created_at >= one_week_ago
    ).scalar() or 0

    # Calculate storage size
    total_bytes = 0
    if STORAGE_PATH.exists():
        for dirpath, _, filenames in os.walk(STORAGE_PATH):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                try:
                    total_bytes += os.path.getsize(fp)
                except Exception:
                    pass

    storage_mb = round(total_bytes / (1024 * 1024), 2)
    ffmpeg_ok = bool(get_ffmpeg_binary())

    return DashboardStatsResponse(
        total_projects=total_projects,
        completed_videos=completed_videos,
        videos_this_week=videos_this_week,
        total_storage_mb=storage_mb,
        ffmpeg_available=ffmpeg_ok
    )
