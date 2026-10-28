import logging
from typing import Any
from app.schemas.project import StoryboardSceneSchema

logger = logging.getLogger(__name__)

class StoryboardService:
    @staticmethod
    def create_storyboard(
        images: list[dict[str, Any]],
        script_data: dict[str, Any],
        project_data: dict[str, Any],
        target_duration_seconds: float = 20.0
    ) -> list[StoryboardSceneSchema]:
        """
        Distributes uploaded images and script captions into structured scenes,
        allocating precise durations to match the target runtime.
        """
        if not images:
            return []

        num_scenes = len(images)
        base_duration = round(target_duration_seconds / num_scenes, 2)
        
        feature_captions = script_data.get("feature_captions", [])
        opening_headline = script_data.get("opening_headline", project_data.get("name", "Featured Property"))
        property_intro = script_data.get("property_intro", "")
        closing_cta = script_data.get("closing_cta", project_data.get("cta_text", "Contact us today"))
        prop_type = project_data.get("property_type", "Residential")
        price = project_data.get("price_formatted", "")
        location = project_data.get("location", "")

        standard_badges = [
            "Prime Location",
            "Living Spaces",
            "Master Suite",
            "Modern Kitchen",
            "Interior Highlights",
            "Architecture",
            "Lifestyle"
        ]

        scenes: list[StoryboardSceneSchema] = []
        allocated_time = 0.0

        for i, img in enumerate(images):
            scene_num = i + 1
            # Duration calculation
            if scene_num == num_scenes:
                # Last scene takes any rounding difference
                dur = round(target_duration_seconds - allocated_time, 2)
                if dur < 2.0:
                    dur = 3.0
            else:
                dur = base_duration
                allocated_time += dur

            if scene_num == 1:
                # Opening Hero Scene
                caption = opening_headline
                badge = f"{prop_type.upper()} • {location.upper()}" if location else prop_type.upper()
                transition = "fade"
                narration = property_intro or f"Welcome to {project_data.get('name', 'this home')}."
            elif scene_num == num_scenes:
                # Closing CTA Scene
                caption = f"{price} • {closing_cta}" if price else closing_cta
                badge = "EXCLUSIVE OPPORTUNITY"
                transition = "fade"
                narration = closing_cta
            else:
                # Middle Feature Scenes
                caption_idx = (i - 1) % max(1, len(feature_captions))
                caption = feature_captions[caption_idx] if feature_captions else f"Thoughtful Design & Finishes"
                badge_idx = (i - 1) % len(standard_badges)
                badge = standard_badges[badge_idx].upper()
                transition = "crossfade"
                narration = caption

            scene = StoryboardSceneSchema(
                scene_number=scene_num,
                image_id=str(img.get("id", "")),
                image_url=img.get("url", ""),
                duration=max(2.0, dur),
                caption=caption,
                badge=badge,
                transition=transition,
                narration_text=narration
            )
            scenes.append(scene)

        return scenes

storyboard_service = StoryboardService()
