from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    filename: str
    original_name: str
    file_path: str
    url: str
    sort_order: int
    width: int
    height: int
    created_at: datetime

class ImageReorderRequest(BaseModel):
    image_ids: list[str]

class ScriptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    opening_headline: str
    property_intro: str
    feature_captions: list[str]
    closing_cta: str
    narration_script: str
    provider_used: str
    created_at: datetime

class ScriptUpdateRequest(BaseModel):
    opening_headline: str = Field(..., min_length=2, max_length=255)
    property_intro: str = Field(..., min_length=5)
    feature_captions: list[str] = Field(default_factory=list)
    closing_cta: str = Field(..., min_length=2, max_length=255)
    narration_script: str = Field(default="")

class StoryboardSceneSchema(BaseModel):
    id: Optional[str] = None
    scene_number: int
    image_id: str
    image_url: Optional[str] = None
    duration: float = Field(default=4.0, ge=1.0, le=15.0)
    caption: str = Field(default="", max_length=255)
    badge: str = Field(default="", max_length=100)
    transition: str = Field(default="fade")
    narration_text: Optional[str] = Field(default="")

class StoryboardUpdateRequest(BaseModel):
    scenes: list[StoryboardSceneSchema]

class RenderRequest(BaseModel):
    aspect_ratio: str = Field(default="9:16", pattern="^(9:16|16:9|1:1)$")
    resolution: str = Field(default="1080p", pattern="^(720p|1080p)$")
    duration_preset: str = Field(default="20s", pattern="^(20s|30s|40s)$")
    template: str = Field(default="luxury", pattern="^(luxury|minimal|showcase)$")
    include_music: bool = True
    music_volume: float = Field(default=0.35, ge=0.0, le=1.0)
    include_narration: bool = True

class RenderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    status: str
    progress: int
    aspect_ratio: str
    resolution: str
    duration_preset: str
    template: str
    include_music: bool
    music_volume: float
    include_narration: bool
    output_video_path: Optional[str] = None
    output_video_url: Optional[str] = None
    file_size_bytes: Optional[int] = 0
    actual_duration: Optional[float] = 0.0
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    location: str = Field(..., min_length=2, max_length=200)
    price: float = Field(default=0.0, ge=0.0)
    price_formatted: Optional[str] = ""
    property_type: str = Field(default="Apartment")
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    area_unit: Optional[str] = "sq ft"
    key_features: list[str] = Field(default_factory=list)
    description: Optional[str] = ""
    agent_name: Optional[str] = ""
    agent_phone: Optional[str] = ""
    website_url: Optional[str] = ""
    cta_text: str = Field(default="Contact us today to schedule a private tour.")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    price_formatted: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    area_unit: Optional[str] = None
    key_features: Optional[list[str]] = None
    description: Optional[str] = None
    agent_name: Optional[str] = None
    agent_phone: Optional[str] = None
    website_url: Optional[str] = None
    cta_text: Optional[str] = None

class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    images: list[ImageResponse] = []
    script: Optional[ScriptResponse] = None
    storyboard: list[StoryboardSceneSchema] = []
    latest_render: Optional[RenderResponse] = None

class DashboardStatsResponse(BaseModel):
    total_projects: int
    completed_videos: int
    videos_this_week: int
    total_storage_mb: float
    ffmpeg_available: bool
