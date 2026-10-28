import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.project import get_db, Project, StoryboardScene
from app.schemas.project import StoryboardSceneSchema, StoryboardUpdateRequest
from app.services.ai_service import ai_script_service
from app.services.storyboard_service import storyboard_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects/{project_id}/storyboard", tags=["Storyboard"])

@router.post("", response_model=List[StoryboardSceneSchema])
def generate_storyboard(
    project_id: str,
    duration: float = Query(20.0, ge=10.0, le=60.0),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sorted_images = sorted(project.images, key=lambda x: x.sort_order)
    if len(sorted_images) < 4:
        raise HTTPException(
            status_code=400,
            detail=f"At least 4 property images are required to generate a video storyboard (currently have {len(sorted_images)}). Please upload additional photos."
        )

    project_data = {
        "name": project.name,
        "location": project.location,
        "price_formatted": project.price_formatted,
        "property_type": project.property_type,
        "bedrooms": project.bedrooms,
        "bathrooms": project.bathrooms,
        "area": project.area,
        "area_unit": project.area_unit,
        "key_features": project.get_features_list(),
        "cta_text": project.cta_text,
        "agent_name": project.agent_name,
        "agent_phone": project.agent_phone
    }

    # If script does not exist yet, generate it first
    if not project.script:
        script_out = ai_script_service.generate_script(project_data)
        from app.models.project import ProjectScript
        script_rec = ProjectScript(
            project_id=project.id,
            opening_headline=script_out.opening_headline,
            property_intro=script_out.property_intro,
            feature_captions=json.dumps(script_out.feature_captions),
            closing_cta=script_out.closing_cta,
            narration_script=script_out.narration_script,
            provider_used=script_out.provider_used
        )
        db.add(script_rec)
        db.commit()
        db.refresh(project)

    script_data = {
        "opening_headline": project.script.opening_headline,
        "property_intro": project.script.property_intro,
        "feature_captions": project.script.get_captions_list(),
        "closing_cta": project.script.closing_cta,
        "narration_script": project.script.narration_script
    }

    images_data = [
        {"id": img.id, "url": f"/api/uploads/{img.filename}"}
        for img in sorted_images
    ]

    new_scenes = storyboard_service.create_storyboard(
        images=images_data,
        script_data=script_data,
        project_data=project_data,
        target_duration_seconds=duration
    )

    # Clear existing storyboard scenes
    db.query(StoryboardScene).filter(StoryboardScene.project_id == project_id).delete()

    created_scenes = []
    for sc in new_scenes:
        row = StoryboardScene(
            project_id=project_id,
            scene_number=sc.scene_number,
            image_id=sc.image_id,
            duration=sc.duration,
            caption=sc.caption,
            badge=sc.badge,
            transition=sc.transition,
            narration_text=sc.narration_text
        )
        db.add(row)
        created_scenes.append(row)

    project.status = "storyboard_ready"
    db.commit()

    img_url_map = {img.id: f"/api/uploads/{img.filename}" for img in project.images}
    return [
        StoryboardSceneSchema(
            id=s.id,
            scene_number=s.scene_number,
            image_id=s.image_id,
            image_url=img_url_map.get(s.image_id, ""),
            duration=s.duration,
            caption=s.caption,
            badge=s.badge,
            transition=s.transition,
            narration_text=s.narration_text
        ) for s in created_scenes
    ]

@router.get("", response_model=List[StoryboardSceneSchema])
def get_storyboard(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scenes = sorted(project.storyboard, key=lambda s: s.scene_number)
    img_url_map = {img.id: f"/api/uploads/{img.filename}" for img in project.images}
    return [
        StoryboardSceneSchema(
            id=s.id,
            scene_number=s.scene_number,
            image_id=s.image_id,
            image_url=img_url_map.get(s.image_id, ""),
            duration=s.duration,
            caption=s.caption,
            badge=s.badge,
            transition=s.transition,
            narration_text=s.narration_text
        ) for s in scenes
    ]

@router.put("", response_model=List[StoryboardSceneSchema])
def update_storyboard(
    project_id: str,
    payload: StoryboardUpdateRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Replace with updated scenes
    db.query(StoryboardScene).filter(StoryboardScene.project_id == project_id).delete()

    created_scenes = []
    for i, sc in enumerate(payload.scenes):
        row = StoryboardScene(
            project_id=project_id,
            scene_number=i + 1,
            image_id=sc.image_id,
            duration=sc.duration,
            caption=sc.caption,
            badge=sc.badge,
            transition=sc.transition,
            narration_text=sc.narration_text
        )
        db.add(row)
        created_scenes.append(row)

    db.commit()

    img_url_map = {img.id: f"/api/uploads/{img.filename}" for img in project.images}
    return [
        StoryboardSceneSchema(
            id=s.id,
            scene_number=s.scene_number,
            image_id=s.image_id,
            image_url=img_url_map.get(s.image_id, ""),
            duration=s.duration,
            caption=s.caption,
            badge=s.badge,
            transition=s.transition,
            narration_text=s.narration_text
        ) for s in created_scenes
    ]
