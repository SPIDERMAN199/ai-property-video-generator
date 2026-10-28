import math
import shutil
import logging
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from sqlalchemy.orm import Session

from app.core.config import SAMPLE_IMAGES_PATH, UPLOADS_PATH
from app.models.project import Project, ProjectImage, ProjectScript, StoryboardScene
from app.services.ai_service import ai_script_service
from app.services.storyboard_service import storyboard_service

logger = logging.getLogger(__name__)

SAMPLE_SPECS = [
    {
        "name": "exterior_facade.jpg",
        "title": "Modern Exterior Facade",
        "subtitle": "Contemporary Architectural Design with Glass Balconies",
        "primary_color": (30, 41, 59),
        "secondary_color": (51, 65, 85),
        "accent": (212, 175, 55),
        "sky_color": (254, 215, 170), # Warm sunset gradient
    },
    {
        "name": "living_room.jpg",
        "title": "Spacious Living Room",
        "subtitle": "Floor-to-Ceiling Windows & Natural Sunlight",
        "primary_color": (248, 250, 252),
        "secondary_color": (226, 232, 240),
        "accent": (49, 87, 213),
        "sky_color": (241, 245, 249),
    },
    {
        "name": "master_bedroom.jpg",
        "title": "Master Bedroom Suite",
        "subtitle": "Warm Hardwood Floors & Designer Lighting",
        "primary_color": (28, 25, 23),
        "secondary_color": (68, 64, 60),
        "accent": (217, 119, 6),
        "sky_color": (254, 243, 199),
    },
    {
        "name": "modular_kitchen.jpg",
        "title": "Chef's Modular Kitchen",
        "subtitle": "Quartz Countertops & Premium Built-In Appliances",
        "primary_color": (15, 23, 42),
        "secondary_color": (30, 41, 59),
        "accent": (16, 185, 129),
        "sky_color": (207, 250, 254),
    },
    {
        "name": "balcony_view.jpg",
        "title": "Scenic Open Balcony",
        "subtitle": "Unobstructed Views of Lush Greenery & Sunset",
        "primary_color": (12, 74, 110),
        "secondary_color": (3, 105, 161),
        "accent": (255, 112, 67),
        "sky_color": (253, 186, 116),
    }
]

def generate_architectural_demo_image(spec: dict, output_path: Path):
    """Generates an aesthetic architectural demo property photo (1920x1080)."""
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), spec["primary_color"])
    draw = ImageDraw.Draw(img)

    # 1. Background atmospheric gradient
    sky = spec["sky_color"]
    base = spec["secondary_color"]
    for y in range(h):
        ratio = y / h
        r = int(sky[0] * (1 - ratio) + base[0] * ratio)
        g = int(sky[1] * (1 - ratio) + base[1] * ratio)
        b = int(sky[2] * (1 - ratio) + base[2] * ratio)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # 2. Modern architectural building structures / interior silhouettes
    # Wall geometry
    draw.polygon([(0, int(h * 0.3)), (w, int(h * 0.2)), (w, h), (0, h)], fill=spec["primary_color"])
    
    # Modern window pillars and warm lights
    for col in range(6):
        x0 = int(w * 0.12 + col * (w * 0.14))
        y0 = int(h * 0.28 + (col % 2) * 20)
        x1 = x0 + int(w * 0.09)
        y1 = int(h * 0.72)
        # Window frame
        draw.rectangle([x0, y0, x1, y1], fill=(255, 255, 255, 30), outline=(255, 255, 255, 120), width=3)
        # Interior warm ambient glow
        draw.rectangle([x0 + 10, y0 + 10, x1 - 10, y1 - 10], fill=spec["accent"])

    # Floor / ground plane
    draw.rectangle([0, int(h * 0.75), w, h], fill=(20, 24, 33))
    
    # Accent perspective lines (wood deck / marble floor effect)
    for i in range(12):
        lx = int(w * 0.5 + (i - 6) * 180)
        draw.line([(int(w * 0.5), int(h * 0.75)), (lx, h)], fill=(45, 55, 72), width=2)

    # Architectural badge label on the image
    badge_bg = (15, 23, 42, 220)
    draw.rectangle([100, 100, 800, 260], fill=badge_bg, outline=spec["accent"], width=3)
    
    # Text in badge
    try:
        font_large = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 44)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 24)
        font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
    except Exception:
        font_large = font_sub = font_pill = ImageFont.load_default()

    draw.rectangle([140, 125, 420, 160], fill=spec["accent"])
    draw.text((155, 132), "DEMO PROPERTY PHOTO", fill=(255, 255, 255), font=font_pill)
    draw.text((140, 175), spec["title"], fill=(255, 255, 255), font=font_large)
    draw.text((140, 225), spec["subtitle"], fill=(203, 213, 225), font=font_sub)

    # Save image
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(output_path), "JPEG", quality=95)
    logger.info(f"Generated sample image: {output_path}")

def ensure_sample_assets():
    """Generates all 5 demo property images if missing."""
    SAMPLE_IMAGES_PATH.mkdir(parents=True, exist_ok=True)
    for spec in SAMPLE_SPECS:
        target = SAMPLE_IMAGES_PATH / spec["name"]
        if not target.exists() or target.stat().st_size < 1000:
            generate_architectural_demo_image(spec, target)

class SampleService:
    @staticmethod
    def load_skyline_sample(db: Session) -> Project:
        """Loads or resets the official 'Skyline Residency, Chandigarh' demo project."""
        ensure_sample_assets()

        # Check if existing sample project exists
        existing = db.query(Project).filter(Project.name == "Skyline Residency").first()
        if existing:
            # Return existing or update
            return existing

        # Create new Skyline Residency demo project
        project = Project(
            name="Skyline Residency",
            location="Chandigarh, Punjab",
            price=8500000.0,
            price_formatted="₹85 Lakh",
            property_type="Apartment",
            bedrooms=2,
            bathrooms=2,
            area=1250.0,
            area_unit="sq ft",
            key_features='["Spacious Living Room", "Modern Kitchen", "Comfortable Bedrooms", "Natural Lighting", "Scenic Balcony"]',
            description="Exclusively presented demonstration property featuring contemporary design, open living spaces, and premium urban connectivity in the heart of Chandigarh.",
            agent_name="Realty Assistant Showcase",
            agent_phone="+91 98765 43210",
            website_url="https://realtyassistant.in",
            cta_text="Contact us today to schedule an exclusive site visit.",
            status="draft"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # Copy sample images into project upload directory
        for i, spec in enumerate(SAMPLE_SPECS):
            src_file = SAMPLE_IMAGES_PATH / spec["name"]
            if not src_file.exists():
                generate_architectural_demo_image(spec, src_file)
            
            dest_filename = f"{project.id}_{spec['name']}"
            dest_path = UPLOADS_PATH / dest_filename
            shutil.copyfile(src_file, dest_path)

            img_record = ProjectImage(
                project_id=project.id,
                filename=dest_filename,
                original_name=spec["name"],
                file_path=str(dest_path),
                sort_order=i,
                width=1920,
                height=1080
            )
            db.add(img_record)

        db.commit()
        db.refresh(project)

        # Generate Script
        project_dict = {
            "name": project.name,
            "location": project.location,
            "property_type": project.property_type,
            "price_formatted": project.price_formatted,
            "bedrooms": project.bedrooms,
            "bathrooms": project.bathrooms,
            "area": project.area,
            "area_unit": project.area_unit,
            "key_features": project.get_features_list(),
            "cta_text": project.cta_text,
            "agent_name": project.agent_name,
            "agent_phone": project.agent_phone
        }
        script_out = ai_script_service.generate_script(project_dict)

        import json
        script_record = ProjectScript(
            project_id=project.id,
            opening_headline=script_out.opening_headline,
            property_intro=script_out.property_intro,
            feature_captions=json.dumps(script_out.feature_captions),
            closing_cta=script_out.closing_cta,
            narration_script=script_out.narration_script,
            provider_used=script_out.provider_used
        )
        db.add(script_record)
        project.status = "script_ready"
        db.commit()

        # Generate Storyboard Scenes
        images_data = [
            {"id": img.id, "url": f"/api/uploads/{img.filename}"}
            for img in project.images
        ]
        scenes = storyboard_service.create_storyboard(
            images=images_data,
            script_data=script_out.model_dump(),
            project_data=project_dict,
            target_duration_seconds=20.0
        )

        for sc in scenes:
            scene_row = StoryboardScene(
                project_id=project.id,
                scene_number=sc.scene_number,
                image_id=sc.image_id,
                duration=sc.duration,
                caption=sc.caption,
                badge=sc.badge,
                transition=sc.transition,
                narration_text=sc.narration_text
            )
            db.add(scene_row)

        project.status = "storyboard_ready"
        db.commit()
        db.refresh(project)

        logger.info(f"Loaded demo project Skyline Residency with ID: {project.id}")
        return project

sample_service = SampleService()
