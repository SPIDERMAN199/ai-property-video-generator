import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import get_db, Project, ProjectImage, ProjectScript, StoryboardScene, RenderJob
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ImageResponse,
    ScriptResponse, StoryboardSceneSchema, RenderResponse
)
from app.services.sample_service import sample_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects", tags=["Projects"])

def format_inr_price(price: float) -> str:
    if price <= 0:
        return "Price on Request"
    if price >= 10000000:
        cr = price / 10000000
        return f"₹{cr:.2f}".rstrip('0').rstrip('.') + " Cr"
    elif price >= 100000:
        lakh = price / 100000
        return f"₹{lakh:.2f}".rstrip('0').rstrip('.') + " Lakh"
    else:
        return f"₹{int(price):,}"

def map_project_to_response(proj: Project) -> ProjectResponse:
    # Map images
    images_dto = [
        ImageResponse(
            id=img.id,
            project_id=img.project_id,
            filename=img.filename,
            original_name=img.original_name,
            file_path=img.file_path,
            url=f"/api/uploads/{img.filename}",
            sort_order=img.sort_order,
            width=img.width,
            height=img.height,
            created_at=img.created_at
        ) for img in proj.images
    ]

    # Map script
    script_dto = None
    if proj.script:
        script_dto = ScriptResponse(
            id=proj.script.id,
            project_id=proj.script.project_id,
            opening_headline=proj.script.opening_headline,
            property_intro=proj.script.property_intro,
            feature_captions=proj.script.get_captions_list(),
            closing_cta=proj.script.closing_cta,
            narration_script=proj.script.narration_script,
            provider_used=proj.script.provider_used,
            created_at=proj.script.created_at
        )

    # Map storyboard
    img_url_map = {img.id: f"/api/uploads/{img.filename}" for img in proj.images}
    storyboard_dto = [
        StoryboardSceneSchema(
            id=sc.id,
            scene_number=sc.scene_number,
            image_id=sc.image_id,
            image_url=img_url_map.get(sc.image_id, ""),
            duration=sc.duration,
            caption=sc.caption,
            badge=sc.badge,
            transition=sc.transition,
            narration_text=sc.narration_text
        ) for sc in proj.storyboard
    ]

    # Map latest render
    latest_render_dto = None
    if proj.renders:
        lr = proj.renders[0]
        latest_render_dto = RenderResponse(
            id=lr.id,
            project_id=lr.project_id,
            status=lr.status,
            progress=lr.progress,
            aspect_ratio=lr.aspect_ratio,
            resolution=lr.resolution,
            duration_preset=lr.duration_preset,
            template=lr.template,
            include_music=lr.include_music,
            music_volume=lr.music_volume,
            include_narration=lr.include_narration,
            output_video_path=lr.output_video_path,
            output_video_url=lr.output_video_url,
            file_size_bytes=lr.file_size_bytes,
            actual_duration=lr.actual_duration,
            error_message=lr.error_message,
            created_at=lr.created_at,
            completed_at=lr.completed_at
        )

    return ProjectResponse(
        id=proj.id,
        name=proj.name,
        location=proj.location,
        price=proj.price,
        price_formatted=proj.price_formatted or format_inr_price(proj.price),
        property_type=proj.property_type,
        bedrooms=proj.bedrooms,
        bathrooms=proj.bathrooms,
        area=proj.area,
        area_unit=proj.area_unit,
        key_features=proj.get_features_list(),
        description=proj.description,
        agent_name=proj.agent_name,
        agent_phone=proj.agent_phone,
        website_url=proj.website_url,
        cta_text=proj.cta_text,
        status=proj.status,
        created_at=proj.created_at,
        updated_at=proj.updated_at,
        images=images_dto,
        script=script_dto,
        storyboard=storyboard_dto,
        latest_render=latest_render_dto
    )

@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [map_project_to_response(p) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    formatted = payload.price_formatted or format_inr_price(payload.price)
    
    project = Project(
        name=payload.name,
        location=payload.location,
        price=payload.price,
        price_formatted=formatted,
        property_type=payload.property_type,
        bedrooms=payload.bedrooms,
        bathrooms=payload.bathrooms,
        area=payload.area,
        area_unit=payload.area_unit,
        key_features=json.dumps(payload.key_features),
        description=payload.description or "",
        agent_name=payload.agent_name or "",
        agent_phone=payload.agent_phone or "",
        website_url=payload.website_url or "",
        cta_text=payload.cta_text,
        status="draft"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return map_project_to_response(project)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return map_project_to_response(project)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "key_features" in update_data:
        update_data["key_features"] = json.dumps(update_data["key_features"])
    if "price" in update_data and not update_data.get("price_formatted"):
        update_data["price_formatted"] = format_inr_price(update_data["price"])

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return map_project_to_response(project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Clean up associated image files
    for img in project.images:
        try:
            import os
            if os.path.exists(img.file_path):
                os.remove(img.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete image file {img.file_path}: {e}")

    # Clean up associated render files
    for r in project.renders:
        try:
            import os
            if r.output_video_path and os.path.exists(r.output_video_path):
                os.remove(r.output_video_path)
        except Exception as e:
            logger.warning(f"Failed to delete render file {r.output_video_path}: {e}")

    db.delete(project)
    db.commit()
    return None

@router.post("/sample/load", response_model=ProjectResponse)
def load_sample_project(db: Session = Depends(get_db)):
    project = sample_service.load_skyline_sample(db)
    return map_project_to_response(project)
