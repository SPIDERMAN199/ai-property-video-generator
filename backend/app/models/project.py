import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.core.config import STORAGE_PATH

DB_PATH = STORAGE_PATH / "realty_studio.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    location = Column(String(200), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    price_formatted = Column(String(100), nullable=False, default="")
    property_type = Column(String(100), nullable=False, default="Apartment")
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    area = Column(Float, nullable=True)
    area_unit = Column(String(50), nullable=True, default="sq ft")
    key_features = Column(Text, nullable=False, default="[]")  # JSON string list
    description = Column(Text, nullable=True, default="")
    agent_name = Column(String(150), nullable=True, default="")
    agent_phone = Column(String(50), nullable=True, default="")
    website_url = Column(String(255), nullable=True, default="")
    cta_text = Column(String(200), nullable=False, default="Contact us today to schedule a private tour.")
    status = Column(String(50), nullable=False, default="draft")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan", order_by="ProjectImage.sort_order")
    script = relationship("ProjectScript", back_populates="project", uselist=False, cascade="all, delete-orphan")
    storyboard = relationship("StoryboardScene", back_populates="project", cascade="all, delete-orphan", order_by="StoryboardScene.scene_number")
    renders = relationship("RenderJob", back_populates="project", cascade="all, delete-orphan", order_by="RenderJob.created_at.desc()")

    def get_features_list(self) -> list[str]:
        try:
            return json.loads(self.key_features)
        except Exception:
            return [f.strip() for f in self.key_features.split(",") if f.strip()]

class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="images")

class ProjectScript(Base):
    __tablename__ = "project_scripts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    opening_headline = Column(String(255), nullable=False)
    property_intro = Column(Text, nullable=False)
    feature_captions = Column(Text, nullable=False, default="[]")  # JSON string list
    closing_cta = Column(String(255), nullable=False)
    narration_script = Column(Text, nullable=False, default="")
    provider_used = Column(String(50), nullable=False, default="template")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="script")

    def get_captions_list(self) -> list[str]:
        try:
            return json.loads(self.feature_captions)
        except Exception:
            return []

class StoryboardScene(Base):
    __tablename__ = "storyboard_scenes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    scene_number = Column(Integer, nullable=False)
    image_id = Column(String(36), nullable=False)
    duration = Column(Float, nullable=False, default=4.0)
    caption = Column(String(255), nullable=False, default="")
    badge = Column(String(100), nullable=False, default="")
    transition = Column(String(50), nullable=False, default="fade")
    narration_text = Column(Text, nullable=True, default="")

    project = relationship("Project", back_populates="storyboard")

class RenderJob(Base):
    __tablename__ = "render_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="queued")  # queued, processing, completed, failed
    progress = Column(Integer, nullable=False, default=0)  # 0 to 100
    aspect_ratio = Column(String(20), nullable=False, default="9:16")  # 9:16, 16:9, 1:1
    resolution = Column(String(20), nullable=False, default="1080p")  # 720p, 1080p
    duration_preset = Column(String(20), nullable=False, default="20s")  # 20s, 30s, 40s
    template = Column(String(50), nullable=False, default="luxury")  # luxury, minimal, showcase
    include_music = Column(Boolean, nullable=False, default=True)
    music_volume = Column(Float, nullable=False, default=0.35)
    include_narration = Column(Boolean, nullable=False, default=True)
    output_video_path = Column(String(500), nullable=True, default="")
    output_video_url = Column(String(500), nullable=True, default="")
    file_size_bytes = Column(Integer, nullable=True, default=0)
    actual_duration = Column(Float, nullable=True, default=0.0)
    error_message = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="renders")

def init_db():
    Base.metadata.create_all(bind=engine)
