import os
import time
import shutil
import logging
import threading
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from app.core.config import get_ffmpeg_binary, RENDERS_PATH
from app.models.project import SessionLocal, RenderJob, Project, ProjectImage, StoryboardScene
from app.services.audio_service import audio_service

logger = logging.getLogger(__name__)

# Resolution presets
RESOLUTIONS = {
    "9:16": {"1080p": (1080, 1920), "720p": (720, 1280)},
    "16:9": {"1080p": (1920, 1080), "720p": (1280, 720)},
    "1:1":  {"1080p": (1080, 1080), "720p": (720, 720)},
}

# Template color schemes
TEMPLATES = {
    "luxury": {
        "name": "Luxury Estate",
        "card_bg": (15, 23, 42, 230),       # Deep Obsidian
        "accent": (212, 175, 55),            # Rich Gold
        "badge_bg": (26, 38, 64, 255),
        "badge_text": (245, 215, 120),
        "text_primary": (255, 255, 255),
        "text_secondary": (200, 210, 225),
        "border_color": (212, 175, 55, 180),
        "watermark_tag": "REALTY ASSISTANT • LUXURY",
    },
    "minimal": {
        "name": "Modern Minimal",
        "card_bg": (255, 255, 255, 240),    # Pure Clean White
        "accent": (49, 87, 213),             # Royal Blue
        "badge_bg": (49, 87, 213, 255),
        "badge_text": (255, 255, 255),
        "text_primary": (20, 32, 51),        # Slate Dark
        "text_secondary": (100, 116, 139),
        "border_color": (226, 232, 240, 255),
        "watermark_tag": "REALTY ASSISTANT",
    },
    "showcase": {
        "name": "Premium Property Showcase",
        "card_bg": (20, 30, 50, 235),       # Dark Slate Navy
        "accent": (255, 112, 67),            # Vibrant Coral
        "badge_bg": (255, 112, 67, 255),
        "badge_text": (255, 255, 255),
        "text_primary": (255, 255, 255),
        "text_secondary": (220, 230, 242),
        "border_color": (255, 112, 67, 180),
        "watermark_tag": "REALTY ASSISTANT • SHOWCASE",
    }
}

def load_fonts(scale_factor: float = 1.0) -> Tuple[ImageFont.ImageFont, ImageFont.ImageFont, ImageFont.ImageFont]:
    """Loads scalable Segoe UI or Arial fonts, falling back to default."""
    font_candidates = [
        ("C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/segoeui.ttf"),
        ("C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf"),
        ("C:/Windows/Fonts/calibrib.ttf", "C:/Windows/Fonts/calibri.ttf"),
    ]
    
    title_size = int(38 * scale_factor)
    badge_size = int(20 * scale_factor)
    body_size = int(24 * scale_factor)

    for bold_path, regular_path in font_candidates:
        if os.path.isfile(bold_path) and os.path.isfile(regular_path):
            try:
                title_font = ImageFont.truetype(bold_path, title_size)
                badge_font = ImageFont.truetype(bold_path, badge_size)
                body_font = ImageFont.truetype(regular_path, body_size)
                return title_font, badge_font, body_font
            except Exception:
                continue

    # Fallback default
    default = ImageFont.load_default()
    return default, default, default

def wrap_text(text: str, font: ImageFont.ImageFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    """Wraps text cleanly within a pixel bounding width."""
    words = text.split()
    if not words:
        return []
    
    lines = []
    current_line = []

    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                lines.append(word)
    if current_line:
        lines.append(" ".join(current_line))
    return lines

class VideoService:
    @staticmethod
    def composite_scene_frame(
        image_path: str,
        scene_data: dict,
        total_scenes: int,
        template_name: str,
        target_size: Tuple[int, int]
    ) -> Image.Image:
        """
        Preprocesses photo with cover-fit crop and draws premium branding card overlays.
        """
        target_w, target_h = target_size
        scale_factor = target_w / 1080.0
        theme = TEMPLATES.get(template_name, TEMPLATES["luxury"])

        # 1. Open and resize/crop base image (Cover fit)
        try:
            with Image.open(image_path) as src_img:
                src_w, src_h = src_img.size
                src_ratio = src_w / src_h
                target_ratio = target_w / target_h

                if src_ratio > target_ratio:
                    # Wider: scale by height, crop horizontal
                    new_h = target_h
                    new_w = int(target_h * src_ratio)
                else:
                    # Taller: scale by width, crop vertical
                    new_w = target_w
                    new_h = int(target_w / src_ratio)

                scaled = src_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # Center crop
                left = (new_w - target_w) // 2
                top = (new_h - target_h) // 2
                frame = scaled.crop((left, top, left + target_w, top + target_h)).convert("RGBA")
        except Exception as e:
            logger.warning(f"Failed to load image {image_path}: {e}. Creating fallback card.")
            frame = Image.new("RGBA", (target_w, target_h), (20, 35, 59, 255))

        # 2. Add subtle dark gradient overlay at top and bottom for readability
        gradient = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
        grad_draw = ImageDraw.Draw(gradient)
        
        # Bottom gradient
        bottom_grad_height = int(target_h * 0.45)
        for y in range(bottom_grad_height):
            alpha = int(190 * (y / bottom_grad_height))
            y_pos = target_h - bottom_grad_height + y
            grad_draw.line([(0, y_pos), (target_w, y_pos)], fill=(0, 0, 0, alpha))
            
        # Top gradient
        top_grad_height = int(target_h * 0.15)
        for y in range(top_grad_height):
            alpha = int(140 * (1.0 - (y / top_grad_height)))
            grad_draw.line([(0, y), (target_w, y)], fill=(0, 0, 0, alpha))

        frame = Image.alpha_composite(frame, gradient)

        # 3. Create graphics overlay layer
        overlay = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        title_font, badge_font, body_font = load_fonts(scale_factor)

        # A. Top Brand Watermark
        margin_x = int(50 * scale_factor)
        top_y = int(45 * scale_factor)
        brand_text = theme["watermark_tag"]
        scene_count_text = f"{scene_data.get('scene_number', 1):02d} / {total_scenes:02d}"

        # Draw brand pill
        brand_bbox = draw.textbbox((0, 0), brand_text, font=badge_font)
        brand_w = brand_bbox[2] - brand_bbox[0]
        brand_h = brand_bbox[3] - brand_bbox[1]
        
        pill_pad_x = int(18 * scale_factor)
        pill_pad_y = int(8 * scale_factor)
        draw.rounded_rectangle(
            [margin_x, top_y, margin_x + brand_w + pill_pad_x * 2, top_y + brand_h + pill_pad_y * 2],
            radius=int(16 * scale_factor),
            fill=(10, 15, 25, 200),
            outline=theme["accent"],
            width=max(1, int(2 * scale_factor))
        )
        draw.text(
            (margin_x + pill_pad_x, top_y + pill_pad_y),
            brand_text,
            fill=theme["accent"],
            font=badge_font
        )

        # Scene Counter (Right aligned)
        counter_bbox = draw.textbbox((0, 0), scene_count_text, font=badge_font)
        counter_w = counter_bbox[2] - counter_bbox[0]
        counter_x = target_w - margin_x - counter_w - pill_pad_x * 2
        draw.rounded_rectangle(
            [counter_x, top_y, counter_x + counter_w + pill_pad_x * 2, top_y + brand_h + pill_pad_y * 2],
            radius=int(16 * scale_factor),
            fill=(10, 15, 25, 180)
        )
        draw.text(
            (counter_x + pill_pad_x, top_y + pill_pad_y),
            scene_count_text,
            fill=(255, 255, 255, 230),
            font=badge_font
        )

        # B. Bottom Information Card
        card_margin = int(40 * scale_factor)
        card_w = target_w - (card_margin * 2)
        card_bottom = target_h - int(60 * scale_factor)
        
        # Parse scene text
        badge_text = scene_data.get("badge", "").upper().strip()
        caption_text = scene_data.get("caption", "").strip()

        # Wrap caption text
        max_text_w = card_w - int(80 * scale_factor)
        caption_lines = wrap_text(caption_text, title_font, max_text_w, draw)[:3]

        line_height = int(48 * scale_factor)
        text_block_height = len(caption_lines) * line_height
        card_pad = int(35 * scale_factor)
        badge_height = int(36 * scale_factor) if badge_text else 0
        badge_spacing = int(16 * scale_factor) if badge_text else 0

        card_h = card_pad * 2 + badge_height + badge_spacing + text_block_height
        card_top = card_bottom - card_h

        # Draw bottom card container with rounded corners and border
        card_rect = [card_margin, card_top, card_margin + card_w, card_bottom]
        draw.rounded_rectangle(
            card_rect,
            radius=int(24 * scale_factor),
            fill=theme["card_bg"],
            outline=theme["border_color"],
            width=max(1, int(2 * scale_factor))
        )

        # Draw Accent line on top edge of card
        draw.line(
            [(card_margin + int(40 * scale_factor), card_top), (card_margin + card_w - int(40 * scale_factor), card_top)],
            fill=theme["accent"],
            width=max(2, int(3 * scale_factor))
        )

        cur_y = card_top + card_pad

        # Draw Category Badge Pill
        if badge_text:
            b_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
            bw = b_bbox[2] - b_bbox[0]
            bh = b_bbox[3] - b_bbox[1]
            bx = card_margin + card_pad
            by = cur_y
            b_pad_x = int(16 * scale_factor)
            b_pad_y = int(6 * scale_factor)

            draw.rounded_rectangle(
                [bx, by, bx + bw + b_pad_x * 2, by + bh + b_pad_y * 2],
                radius=int(12 * scale_factor),
                fill=theme["badge_bg"]
            )
            draw.text(
                (bx + b_pad_x, by + b_pad_y),
                badge_text,
                fill=theme["badge_text"],
                font=badge_font
            )
            cur_y += bh + b_pad_y * 2 + badge_spacing

        # Draw Caption lines
        for line in caption_lines:
            draw.text(
                (card_margin + card_pad, cur_y),
                line,
                fill=theme["text_primary"],
                font=title_font
            )
            cur_y += line_height

        final_composite = Image.alpha_composite(frame, overlay).convert("RGB")
        return final_composite

    @classmethod
    def start_render_background(cls, job_id: str):
        """Dispatches video rendering job in a background thread."""
        thread = threading.Thread(target=cls._execute_render_job, args=(job_id,), daemon=True)
        thread.start()

    @classmethod
    def _execute_render_job(cls, job_id: str):
        """Worker executing the complete FFmpeg rendering pipeline."""
        db = SessionLocal()
        temp_dir = None
        try:
            job: Optional[RenderJob] = db.query(RenderJob).filter(RenderJob.id == job_id).first()
            if not job:
                logger.error(f"Render job {job_id} not found")
                return

            project: Optional[Project] = db.query(Project).filter(Project.id == job.project_id).first()
            if not project:
                job.status = "failed"
                job.error_message = "Project record not found."
                db.commit()
                return

            ffmpeg_bin = get_ffmpeg_binary()
            if not ffmpeg_bin or not os.path.isfile(ffmpeg_bin):
                job.status = "failed"
                job.error_message = "FFmpeg executable is not configured or missing on server."
                db.commit()
                return

            # Update status to processing
            job.status = "processing"
            job.progress = 10
            db.commit()

            # Target specifications
            target_size = RESOLUTIONS.get(job.aspect_ratio, RESOLUTIONS["9:16"]).get(job.resolution, (1080, 1920))
            scenes = sorted(project.storyboard, key=lambda s: s.scene_number)
            if not scenes:
                job.status = "failed"
                job.error_message = "No storyboard scenes found for rendering."
                db.commit()
                return

            # Lookup images mapping
            img_map = {img.id: img.file_path for img in project.images}
            total_scenes = len(scenes)

            temp_dir = tempfile.mkdtemp(prefix=f"render_{job_id}_")
            temp_path = Path(temp_dir)
            
            job.progress = 25
            db.commit()

            # 1. Composite each scene slide image
            rendered_scene_files = []
            for i, scene in enumerate(scenes):
                img_path = img_map.get(scene.image_id)
                if not img_path or not os.path.isfile(img_path):
                    # Use first available image if specific id missing
                    if project.images:
                        img_path = project.images[0].file_path
                
                scene_dict = {
                    "scene_number": scene.scene_number,
                    "badge": scene.badge,
                    "caption": scene.caption,
                    "duration": scene.duration
                }
                
                slide = cls.composite_scene_frame(
                    img_path or "",
                    scene_dict,
                    total_scenes,
                    job.template,
                    target_size
                )
                
                slide_path = temp_path / f"scene_{i:03d}.jpg"
                slide.save(str(slide_path), "JPEG", quality=95)
                rendered_scene_files.append((slide_path, scene.duration))

            job.progress = 45
            db.commit()

            # 2. Render each scene clip with Ken Burns motion & fade transition
            w, h = target_size
            scene_clips = []
            for i, (slide_file, duration) in enumerate(rendered_scene_files):
                clip_out = temp_path / f"clip_{i:03d}.mp4"
                dur = max(2.0, float(duration))
                fps = 30
                total_frames = int(dur * fps)
                
                # Subtle Ken Burns zoom
                vf_filters = [
                    f"zoompan=z='min(zoom+0.0008,1.06)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={w}x{h}:fps={fps}",
                    f"fade=t=in:st=0:d=0.4",
                    f"fade=t=out:st={dur - 0.4:.2f}:d=0.4"
                ]
                vf_str = ",".join(vf_filters)

                cmd = [
                    ffmpeg_bin, "-y",
                    "-loop", "1",
                    "-i", str(slide_file),
                    "-vf", vf_str,
                    "-t", f"{dur:.2f}",
                    "-c:v", "libx264",
                    "-pix_fmt", "yuv420p",
                    "-preset", "fast",
                    str(clip_out)
                ]

                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
                if proc.returncode != 0 or not clip_out.exists():
                    logger.error(f"Scene {i} render failed: {proc.stderr}")
                    raise RuntimeError(f"FFmpeg failed rendering scene {i+1}: {proc.stderr[-200:]}")
                
                scene_clips.append(clip_out)

            job.progress = 70
            db.commit()

            # 3. Concatenate scene clips
            concat_txt = temp_path / "concat.txt"
            with open(concat_txt, "w") as f:
                for clip in scene_clips:
                    f.write(f"file '{clip.resolve().as_posix()}'\n")

            video_only_out = temp_path / "video_merged.mp4"
            concat_cmd = [
                ffmpeg_bin, "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", str(concat_txt),
                "-c", "copy",
                str(video_only_out)
            ]
            proc = subprocess.run(concat_cmd, capture_output=True, text=True, timeout=120)
            if proc.returncode != 0 or not video_only_out.exists():
                raise RuntimeError(f"Concatenation failed: {proc.stderr[-200:]}")

            total_duration = sum(dur for _, dur in rendered_scene_files)

            job.progress = 85
            db.commit()

            # 4. Handle Audio (Voice Narration & Ambient Background Music)
            narration_wav = None
            if job.include_narration and project.script and project.script.narration_script:
                narr_file = temp_path / "narration.wav"
                success = audio_service.generate_narration(project.script.narration_script, str(narr_file))
                if success and narr_file.exists():
                    narration_wav = narr_file

            bgm_wav = None
            if job.include_music:
                bgm_path = audio_service.get_bgm_path()
                if bgm_path and os.path.isfile(bgm_path):
                    bgm_wav = bgm_path

            # Output filename in storage/renders
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            clean_proj_name = "".join(c for c in project.name if c.isalnum() or c in (' ', '_', '-')).strip()
            clean_proj_name = clean_proj_name.replace(" ", "_")[:30] or "Property"
            output_filename = f"{clean_proj_name}_{job.aspect_ratio.replace(':', 'x')}_{timestamp_str}.mp4"
            final_mp4_path = RENDERS_PATH / output_filename

            # 5. Final Audio & Video Merge
            merge_cmd = [ffmpeg_bin, "-y", "-i", str(video_only_out)]
            
            if bgm_wav and narration_wav:
                # Both BGM and Voiceover
                bgm_vol = max(0.05, min(0.6, job.music_volume * 0.5))  # Duck music under voice
                merge_cmd.extend([
                    "-stream_loop", "-1", "-i", str(bgm_wav),
                    "-i", str(narration_wav),
                    "-filter_complex",
                    f"[1:a]volume={bgm_vol:.2f},afade=t=in:ss=0:d=1,afade=t=out:st={total_duration-1.5:.2f}:d=1.5[bgm];"
                    f"[2:a]volume=1.0[narr];"
                    f"[bgm][narr]amix=inputs=2:duration=first:dropout_transition=2[aout]",
                    "-map", "0:v",
                    "-map", "[aout]",
                    "-c:v", "copy",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-t", f"{total_duration:.2f}",
                    str(final_mp4_path)
                ])
            elif bgm_wav:
                # Background music only
                bgm_vol = max(0.1, min(1.0, job.music_volume))
                merge_cmd.extend([
                    "-stream_loop", "-1", "-i", str(bgm_wav),
                    "-filter_complex",
                    f"[1:a]volume={bgm_vol:.2f},afade=t=in:ss=0:d=1,afade=t=out:st={total_duration-1.5:.2f}:d=1.5[aout]",
                    "-map", "0:v",
                    "-map", "[aout]",
                    "-c:v", "copy",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-t", f"{total_duration:.2f}",
                    str(final_mp4_path)
                ])
            elif narration_wav:
                # Narration only
                merge_cmd.extend([
                    "-i", str(narration_wav),
                    "-map", "0:v",
                    "-map", "1:a",
                    "-c:v", "copy",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-t", f"{total_duration:.2f}",
                    str(final_mp4_path)
                ])
            else:
                # Silent video copy
                merge_cmd.extend([
                    "-c", "copy",
                    "-t", f"{total_duration:.2f}",
                    str(final_mp4_path)
                ])

            proc = subprocess.run(merge_cmd, capture_output=True, text=True, timeout=120)
            if proc.returncode != 0 or not final_mp4_path.exists():
                raise RuntimeError(f"Audio/video merge failed: {proc.stderr[-200:]}")

            file_size = final_mp4_path.stat().st_size
            if file_size < 1000:
                raise RuntimeError("Generated MP4 file is corrupted or empty.")

            # Update job record with successful completion
            job.status = "completed"
            job.progress = 100
            job.output_video_path = str(final_mp4_path)
            job.output_video_url = f"/api/renders/{job.id}/download"
            job.file_size_bytes = file_size
            job.actual_duration = total_duration
            job.completed_at = datetime.now(timezone.utc)
            project.status = "rendered"
            db.commit()

            logger.info(f"Render completed successfully: {final_mp4_path} ({file_size} bytes)")

        except Exception as e:
            logger.exception(f"Render job {job_id} failed: {e}")
            try:
                job = db.query(RenderJob).filter(RenderJob.id == job_id).first()
                if job:
                    job.status = "failed"
                    job.error_message = str(e)
                    db.commit()
            except Exception:
                pass
        finally:
            db.close()
            # Clean up temporary directory safely
            if temp_dir and os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                except Exception as e:
                    logger.warning(f"Failed to remove temp dir {temp_dir}: {e}")

video_service = VideoService()
