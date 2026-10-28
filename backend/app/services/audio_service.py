import math
import struct
import wave
import logging
from pathlib import Path
from typing import Optional
from app.core.config import AUDIO_ASSETS_PATH

logger = logging.getLogger(__name__)

DEFAULT_BGM_PATH = AUDIO_ASSETS_PATH / "ambient_property.wav"

def ensure_default_bgm_track() -> Path:
    """
    Generates a 30-second soothing ambient corporate harmonic loop if not already present.
    Pure Python wave synthesis - zero dependencies, 100% royalty free, offline.
    """
    if DEFAULT_BGM_PATH.exists() and DEFAULT_BGM_PATH.stat().st_size > 10000:
        return DEFAULT_BGM_PATH

    sample_rate = 44100
    duration_sec = 32
    total_samples = sample_rate * duration_sec
    num_channels = 2  # Stereo

    # Chord progression (frequencies in Hz): Fmaj9 -> G6 -> Am7 -> Cmaj7
    chords = [
        [174.61, 220.00, 261.63, 329.63, 392.00],  # F, A, C, E, G
        [196.00, 246.94, 293.66, 392.00, 440.00],  # G, B, D, G, A
        [220.00, 261.63, 329.63, 392.00, 523.25],  # A, C, E, G, C
        [130.81, 196.00, 261.63, 329.63, 392.00],  # C, G, C, E, G
    ]
    chord_duration = duration_sec / len(chords)  # 8 seconds per chord

    with wave.open(str(DEFAULT_BGM_PATH), "w") as wav_file:
        wav_file.setnchannels(num_channels)
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        for i in range(total_samples):
            t = i / sample_rate
            chord_idx = int((t % duration_sec) / chord_duration) % len(chords)
            active_chord = chords[chord_idx]
            
            # Subtle envelope within chord
            chord_pos = (t % chord_duration) / chord_duration
            envelope = math.sin(math.pi * min(1.0, chord_pos * 4)) * (1.0 - 0.4 * chord_pos)

            # Global fade in / fade out
            global_fade = 1.0
            if t < 2.0:
                global_fade = t / 2.0
            elif t > duration_sec - 2.0:
                global_fade = (duration_sec - t) / 2.0

            left_sample = 0.0
            right_sample = 0.0

            for note_idx, freq in enumerate(active_chord):
                # Gentle warm harmonic tone
                val = math.sin(2.0 * math.pi * freq * t) * 0.4
                val += math.sin(4.0 * math.pi * freq * t) * 0.1  # Octave overtone
                
                # Stereo panning per note
                pan = (note_idx / (len(active_chord) - 1))  # 0.0 to 1.0
                left_sample += val * (1.0 - pan * 0.5)
                right_sample += val * (0.5 + pan * 0.5)

            # Master volume scaling
            gain = 0.18 * envelope * global_fade / len(active_chord)
            left_int = int(max(-32767, min(32767, left_sample * gain * 32767)))
            right_int = int(max(-32767, min(32767, right_sample * gain * 32767)))

            frames.extend(struct.pack("<hh", left_int, right_int))

        wav_file.writeframes(frames)
    
    logger.info(f"Synthesized ambient BGM track: {DEFAULT_BGM_PATH}")
    return DEFAULT_BGM_PATH

class AudioService:
    def __init__(self):
        # Guarantee default BGM exists
        try:
            self.default_bgm = ensure_default_bgm_track()
        except Exception as e:
            logger.warning(f"Could not synthesize BGM track: {e}")
            self.default_bgm = None

    def get_bgm_path(self, custom_path: Optional[str] = None) -> Optional[str]:
        if custom_path and Path(custom_path).exists():
            return custom_path
        if self.default_bgm and self.default_bgm.exists():
            return str(self.default_bgm)
        return None

    def generate_narration(self, text: str, output_path: str) -> bool:
        """
        Synthesizes offline voiceover narration using Windows SAPI5 via pyttsx3.
        Returns True on success, False if unavailable.
        """
        if not text or not text.strip():
            return False
        
        try:
            import pyttsx3
            engine = pyttsx3.init()
            # Set slightly slower, professional real-estate presentation pace
            engine.setProperty("rate", 145)
            engine.setProperty("volume", 1.0)
            engine.save_to_file(text.strip(), output_path)
            engine.runAndWait()
            
            p = Path(output_path)
            if p.exists() and p.stat().st_size > 1000:
                return True
            return False
        except Exception as e:
            logger.warning(f"Voice narration generation failed: {e}")
            return False

audio_service = AudioService()
