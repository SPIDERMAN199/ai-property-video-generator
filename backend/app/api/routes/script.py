import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.project import get_db, Project, ProjectScript
from app.schemas.project import ScriptResponse, ScriptUpdateRequest
from app.services.ai_service import ai_script_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects/{project_id}", tags=["Script Generation"])

@router.post("/generate-script", response_model=ScriptResponse)
def generate_script(
    project_id: str,
    provider: Optional[str] = None,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

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

    script_out = ai_script_service.generate_script(project_data, force_provider=provider)

    # Check if script row already exists
    script_rec = db.query(ProjectScript).filter(ProjectScript.project_id == project_id).first()
    if not script_rec:
        script_rec = ProjectScript(
            project_id=project_id,
            opening_headline=script_out.opening_headline,
            property_intro=script_out.property_intro,
            feature_captions=json.dumps(script_out.feature_captions),
            closing_cta=script_out.closing_cta,
            narration_script=script_out.narration_script,
            provider_used=script_out.provider_used
        )
        db.add(script_rec)
    else:
        script_rec.opening_headline = script_out.opening_headline
        script_rec.property_intro = script_out.property_intro
        script_rec.feature_captions = json.dumps(script_out.feature_captions)
        script_rec.closing_cta = script_out.closing_cta
        script_rec.narration_script = script_out.narration_script
        script_rec.provider_used = script_out.provider_used

    if project.status == "draft":
        project.status = "script_ready"

    db.commit()
    db.refresh(script_rec)

    return ScriptResponse(
        id=script_rec.id,
        project_id=script_rec.project_id,
        opening_headline=script_rec.opening_headline,
        property_intro=script_rec.property_intro,
        feature_captions=script_rec.get_captions_list(),
        closing_cta=script_rec.closing_cta,
        narration_script=script_rec.narration_script,
        provider_used=script_rec.provider_used,
        created_at=script_rec.created_at
    )

@router.get("/script", response_model=ScriptResponse)
def get_script(project_id: str, db: Session = Depends(get_db)):
    script_rec = db.query(ProjectScript).filter(ProjectScript.project_id == project_id).first()
    if not script_rec:
        raise HTTPException(status_code=404, detail="Script has not been generated for this project yet")
    return ScriptResponse(
        id=script_rec.id,
        project_id=script_rec.project_id,
        opening_headline=script_rec.opening_headline,
        property_intro=script_rec.property_intro,
        feature_captions=script_rec.get_captions_list(),
        closing_cta=script_rec.closing_cta,
        narration_script=script_rec.narration_script,
        provider_used=script_rec.provider_used,
        created_at=script_rec.created_at
    )

@router.put("/script", response_model=ScriptResponse)
def update_script(
    project_id: str,
    payload: ScriptUpdateRequest,
    db: Session = Depends(get_db)
):
    script_rec = db.query(ProjectScript).filter(ProjectScript.project_id == project_id).first()
    if not script_rec:
        raise HTTPException(status_code=404, detail="Script not found")

    script_rec.opening_headline = payload.opening_headline
    script_rec.property_intro = payload.property_intro
    script_rec.feature_captions = json.dumps(payload.feature_captions)
    script_rec.closing_cta = payload.closing_cta
    script_rec.narration_script = payload.narration_script

    db.commit()
    db.refresh(script_rec)

    return ScriptResponse(
        id=script_rec.id,
        project_id=script_rec.project_id,
        opening_headline=script_rec.opening_headline,
        property_intro=script_rec.property_intro,
        feature_captions=script_rec.get_captions_list(),
        closing_cta=script_rec.closing_cta,
        narration_script=script_rec.narration_script,
        provider_used=script_rec.provider_used,
        created_at=script_rec.created_at
    )
