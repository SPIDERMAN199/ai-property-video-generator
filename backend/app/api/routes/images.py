import os
import uuid
import logging
from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from PIL import Image

from app.core.config import settings, UPLOADS_PATH
from app.models.project import get_db, Project, ProjectImage
from app.schemas.project import ImageResponse, ImageReorderRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects/{project_id}/images", tags=["Images"])

@router.post("", response_model=List[ImageResponse], status_code=status.HTTP_201_CREATED)
async def upload_images(
    project_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    current_count = len(project.images)
    if current_count + len(files) > 8:
        raise HTTPException(
            status_code=400,
            detail=f"Upload limit exceeded. A project can have at most 8 images (current: {current_count}, incoming: {len(files)})."
        )

    saved_images = []
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    for file in files:
        # Check extension
        ext = Path(file.filename or "").suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        # Read content
        content = await file.read()
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' exceeds max size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # Validate with Pillow
        try:
            import io
            with Image.open(io.BytesIO(content)) as pil_img:
                pil_img.verify()
            
            # Re-open to read dimensions after verify
            with Image.open(io.BytesIO(content)) as pil_img:
                width, height = pil_img.size
        except Exception as e:
            logger.warning(f"Corrupt image file '{file.filename}': {e}")
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' is corrupted or not a valid image."
            )

        # Save to disk
        unique_name = f"{project_id}_{uuid.uuid4().hex[:8]}_{Path(file.filename or 'photo').name}"
        save_path = UPLOADS_PATH / unique_name
        with open(save_path, "wb") as f:
            f.write(content)

        img_record = ProjectImage(
            project_id=project_id,
            filename=unique_name,
            original_name=file.filename or "image.jpg",
            file_path=str(save_path),
            sort_order=current_count + len(saved_images),
            width=width,
            height=height
        )
        db.add(img_record)
        saved_images.append(img_record)

    db.commit()
    for img in saved_images:
        db.refresh(img)

    return [
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
        ) for img in saved_images
    ]

@router.put("/reorder", response_model=List[ImageResponse])
def reorder_images(
    project_id: str,
    payload: ImageReorderRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    img_map = {img.id: img for img in project.images}
    for new_idx, img_id in enumerate(payload.image_ids):
        if img_id in img_map:
            img_map[img_id].sort_order = new_idx

    db.commit()
    db.refresh(project)

    sorted_imgs = sorted(project.images, key=lambda x: x.sort_order)
    return [
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
        ) for img in sorted_imgs
    ]

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    project_id: str,
    image_id: str,
    db: Session = Depends(get_db)
):
    img = db.query(ProjectImage).filter(
        ProjectImage.id == image_id,
        ProjectImage.project_id == project_id
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        if os.path.exists(img.file_path):
            os.remove(img.file_path)
    except Exception as e:
        logger.warning(f"Error removing image file: {e}")

    db.delete(img)
    db.commit()
    return None
