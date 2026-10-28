import os
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.models.project import get_db, Project, RenderJob
from app.schemas.project import RenderRequest, RenderResponse
from app.services.video_service import video_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Video Rendering"])

@router.post("/projects/{project_id}/render", response_model=RenderResponse, status_code=status.HTTP_202_ACCEPTED)
def start_render_job(
    project_id: str,
    payload: RenderRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.storyboard:
        raise HTTPException(
            status_code=400,
            detail="Cannot render video: No storyboard scenes generated. Please generate the storyboard first."
        )

    # Check for active running render to prevent duplicate job collisions
    active_job = db.query(RenderJob).filter(
        RenderJob.project_id == project_id,
        RenderJob.status.in_(["queued", "processing"])
    ).first()

    if active_job:
        # Return currently active render instead of creating duplicates
        return RenderResponse(
            id=active_job.id,
            project_id=active_job.project_id,
            status=active_job.status,
            progress=active_job.progress,
            aspect_ratio=active_job.aspect_ratio,
            resolution=active_job.resolution,
            duration_preset=active_job.duration_preset,
            template=active_job.template,
            include_music=active_job.include_music,
            music_volume=active_job.music_volume,
            include_narration=active_job.include_narration,
            output_video_path=active_job.output_video_path,
            output_video_url=active_job.output_video_url,
            file_size_bytes=active_job.file_size_bytes,
            actual_duration=active_job.actual_duration,
            error_message=active_job.error_message,
            created_at=active_job.created_at,
            completed_at=active_job.completed_at
        )

    # Create new render job
    new_job = RenderJob(
        project_id=project_id,
        status="queued",
        progress=0,
        aspect_ratio=payload.aspect_ratio,
        resolution=payload.resolution,
        duration_preset=payload.duration_preset,
        template=payload.template,
        include_music=payload.include_music,
        music_volume=payload.music_volume,
        include_narration=payload.include_narration
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Launch background render worker
    video_service.start_render_background(new_job.id)

    return RenderResponse(
        id=new_job.id,
        project_id=new_job.project_id,
        status=new_job.status,
        progress=new_job.progress,
        aspect_ratio=new_job.aspect_ratio,
        resolution=new_job.resolution,
        duration_preset=new_job.duration_preset,
        template=new_job.template,
        include_music=new_job.include_music,
        music_volume=new_job.music_volume,
        include_narration=new_job.include_narration,
        output_video_path=new_job.output_video_path,
        output_video_url=new_job.output_video_url,
        file_size_bytes=new_job.file_size_bytes,
        actual_duration=new_job.actual_duration,
        error_message=new_job.error_message,
        created_at=new_job.created_at,
        completed_at=new_job.completed_at
    )

@router.get("/renders/{render_id}", response_model=RenderResponse)
def get_render_status(render_id: str, db: Session = Depends(get_db)):
    job = db.query(RenderJob).filter(RenderJob.id == render_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Render job not found")

    return RenderResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        progress=job.progress,
        aspect_ratio=job.aspect_ratio,
        resolution=job.resolution,
        duration_preset=job.duration_preset,
        template=job.template,
        include_music=job.include_music,
        music_volume=job.music_volume,
        include_narration=job.include_narration,
        output_video_path=job.output_video_path,
        output_video_url=f"/api/renders/{job.id}/download" if job.status == "completed" else None,
        file_size_bytes=job.file_size_bytes,
        actual_duration=job.actual_duration,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at
    )

@router.get("/renders/{render_id}/download")
def download_rendered_video(render_id: str, db: Session = Depends(get_db)):
    job = db.query(RenderJob).filter(RenderJob.id == render_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Render job not found")

    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Video is not ready for download. Current status: '{job.status}'"
        )

    if not job.output_video_path or not os.path.isfile(job.output_video_path):
        raise HTTPException(status_code=404, detail="Rendered video file not found on disk")

    file_path = Path(job.output_video_path)
    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=file_path.name,
        headers={"Accept-Ranges": "bytes"}
    )
