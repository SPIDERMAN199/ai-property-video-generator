# AI Property Video Studio by Realty Assistant
> **Automated Enterprise Real-Estate Video Generation Pipeline**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-7.1-007808.svg?logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![License](https://img.shields.io/badge/License-Proprietary-14233B.svg)]()

---

## 1. Project Overview

Real estate marketing teams frequently possess high-quality property photos and spec sheets, but manually compiling them into engaging promotional reels for Instagram Reels, YouTube Shorts, and WhatsApp Status is time-consuming and expensive.

**AI Property Video Studio by Realty Assistant** is a full-stack real-estate marketing SaaS application that automates this workflow end-to-end:
1. **Property Details Intake**: Captures property specifications with full Indian currency support (₹ Lakh & ₹ Crore auto-formatting).
2. **Photo Management**: Validates, optimizes, and sequences 4 to 8 property images.
3. **AI Script Generation**: Produces headline, intro, feature highlights, and call-to-action copy strictly from provided facts (100% anti-hallucination guarantee).
4. **Automated Storyboard**: Arranges images into timed scenes with badges, captions, and transition cues.
5. **Video Customization Studio**: Configures multi-aspect ratios (`9:16` vertical, `16:9` landscape, `1:1` square), 720p/1080p resolutions, durations (20s/30s/40s), and 3 visual templates.
6. **Live Simulated Preview**: Allows users to preview and test their storyboard before rendering.
7. **FFmpeg Video Pipeline**: Generates genuine H.264 MP4 videos with Ken Burns zoom motion, crossfades, semi-transparent high-contrast typography cards, ambient background music, and voiceover narration.
8. **In-Browser Playback & Direct Download**: Plays completed MP4 files directly in the browser and provides one-click downloads and WhatsApp sharing.

---

## 2. Brand Identity & Visual Design

Inspired by the Realty Assistant design brief:
- **Primary Navy**: `#14233B` (Text & Primary Navigation)
- **Royal Blue**: `#3157D5` (Primary Interactive Actions)
- **Coral Accent**: `#FF7043` (Highlights, Badges & CTA Buttons)
- **Soft Background**: `#F6F8FC`
- **Surface**: `#FFFFFF`
- **Typography**: Inter / Segoe UI modern sans-serif

### Visual Templates
The engine provides three meaningfully distinct video designs:
1. **Luxury Estate**: Deep obsidian & navy background with rich gold accents (`#D4AF37`), gold-trimmed cards, dark vignette, and refined serif typography.
2. **Modern Minimal**: Pure white cards (`#FFFFFF`), slate typography, and royal blue badges (`#3157D5`).
3. **Premium Property Showcase**: Warm navy surfaces with high-impact coral pills (`#FF7043`) and bold price tags.

---

## 3. Technology Stack

### Frontend
- **React 19 & Vite 8**: High-performance single page application.
- **TypeScript**: Strict end-to-end typing.
- **Tailwind CSS v4**: Utility-first responsive design.
- **Lucide React**: Clean enterprise iconography.
- **HTML5 Video**: Native browser playback for exported MP4 files.

### Backend
- **Python 3.14 & FastAPI**: Asynchronous REST API architecture.
- **Pydantic v2**: Strict schema validation and serialized responses.
- **SQLAlchemy 2.0 & SQLite**: Persistent local project database (`storage/realty_studio.db`).
- **Pillow (PIL)**: High-resolution cover-fit cropping, vignette gradients, and typography card compositing.
- **FFmpeg 7.1 (via `imageio-ffmpeg` or system PATH)**: Video rendering with Ken Burns motion, crossfade transitions, and audio mixing.
- **pyttsx3 & Windows SAPI5**: Offline text-to-speech voiceover narration synthesis.
- **Pure Python Wave Synthesis**: Royalty-free ambient corporate background music loop.

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       React 19 Frontend                     │
│  Dashboard • 5-Step Wizard • Simulated Player • MP4 Player  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST / FormData
┌──────────────────────────────▼──────────────────────────────┐
│                      FastAPI Backend                        │
│   /api/health • /api/projects • /api/renders • /api/sample   │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│  AI Script  │         │ Storyboard  │         │ Video & TTS │
│  Fallback   │         │   Engine    │         │  Pipeline   │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                       │
                                          ┌────────────▼───────────┐
                                          │   FFmpeg 7.1 Pipeline  │
                                          │ Ken Burns • Overlays   │
                                          │ BGM Loop • SAPI5 Voice │
                                          └────────────┬───────────┘
                                                       │
                                          ┌────────────▼───────────┐
                                          │ Storage: MP4 & Thumbs  │
                                          │ storage/renders/*.mp4  │
                                          └────────────────────────┘
```

---

## 5. Prerequisites & FFmpeg Setup

### System Requirements
- Windows 10/11 (or macOS / Linux).
- Python 3.10+ installed.
- Node.js 18+ and npm installed.

### FFmpeg Setup
FFmpeg is automatically bundled via `imageio-ffmpeg` (installs a standalone FFmpeg 7.1 binary on Windows). If you have a system FFmpeg installed on PATH, the application detects and uses it automatically. You can also specify a custom path in `.env` via `FFMPEG_PATH`.

---

## 6. Installation & Quick Start

### Option A: 1-Click Launch (Windows)
Double-click `run-dev.bat` or run the PowerShell script:
```powershell
.\run-dev.ps1
```

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at `http://127.0.0.1:8000`  
Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend Studio will be running at `http://localhost:5173`

---

## 7. How to Test the Complete End-to-End Workflow

1. Open `http://localhost:5173` in your browser.
2. Click **"Load Sample (Skyline Residency)"** in the top navigation or on the dashboard.
   - This automatically creates the sample project: "Skyline Residency, Chandigarh" (₹85 Lakh, 2 BHK Apartment).
   - Generates and attaches 5 architectural demonstration property photos.
   - Generates the marketing script and 5 timed storyboard scenes.
3. Review and edit property details in **Step 1** (or keep defaults) and click **Continue**.
4. In **Step 2 (Photos)**, view the 5 photos, try reordering them or removing photos, then click **Continue**.
5. In **Step 3 (Customize)**, choose your preferred aspect ratio (`9:16` vertical, `16:9` landscape, or `1:1` square), duration (`20s`), and visual template (`Luxury Estate`, `Modern Minimal`, or `Showcase`).
6. In **Step 4 (Storyboard)**, click **Play** on the simulated preview player to watch the live sequence of photos and captions, or edit scene captions. Click **Continue**.
7. In **Step 5 (Export)**, click **"Start MP4 Video Export"**.
8. Watch the live progress bar update as FFmpeg composites frames, applies Ken Burns zooms, and mixes background audio.
9. When complete, watch the genuine rendered MP4 in the browser player!
10. Click **"Download MP4 Video"** to save the actual video file to your machine.

---

## 8. Sample Output File

A pre-rendered sample video is included in the project:
- **Location**: `demo_output/Skyline_Residency_Luxury_Reel.mp4`
- **Format**: MP4 (ISO Base Media)
- **Dimensions**: 720x1280 (Vertical 9:16)
- **Video Codec**: H.264 (High Profile, 30 FPS)
- **Audio Codec**: AAC Stereo 44.1kHz (Mixed BGM + SAPI5 voice narration)
- **Duration**: 20.00 seconds exact

---

## 9. AI Deterministic Fallback Engine

The AI script generation service employs a strict anti-hallucination architecture:
- If `AI_API_KEY` is not provided in `.env`, the system defaults to `DeterministicTemplateScriptGenerator`.
- **Anti-Hallucination Guard**: It strictly uses only properties, dimensions, prices, and features provided by the user. It never invents unverified amenities, distances from landmarks, investment yields, or legal approvals.
- If bedrooms, bathrooms, or area are provided, it synthesizes factual captions (e.g. `Sprawling 1250 sq ft Layout`, `2 Well-Appointed Bedrooms`).
- Generates Indian currency representations (e.g., `₹85 Lakh`, `₹1.5 Cr`).
- All scripts remain 100% editable by the user before rendering.

---

## 10. Automated Testing

Run the automated backend test suite:
```bash
cd backend
python -m pytest tests/test_api.py -v
```
Tests verify:
- Health check & FFmpeg availability.
- SQLite project CRUD operations & Indian price formatting.
- Image validation (extensions, corruption, max 8 limit).
- AI script generation & schema compliance.
- Storyboard scene timing & duration distribution.
- Real FFmpeg rendering pipeline creating a non-empty MP4.
- Video download streaming endpoint.

Test the frontend build:
```bash
cd frontend
npm run build
```

---

## 11. Project Structure

```
ai-property-video-generator/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # REST API endpoints (health, projects, images, script, storyboard, render)
│   │   ├── core/               # App configuration & FFmpeg detection
│   │   ├── models/             # SQLAlchemy SQLite data models
│   │   ├── schemas/            # Pydantic v2 validation schemas
│   │   ├── services/
│   │   │   ├── ai_service.py           # Provider abstraction & deterministic fallback
│   │   │   ├── audio_service.py        # Ambient music loop & pyttsx3 speech
│   │   │   ├── sample_service.py       # Skyline Residency demo project & photo generator
│   │   │   ├── storyboard_service.py   # Scene distribution & duration allocation
│   │   │   └── video_service.py        # Complete FFmpeg rendering pipeline
│   │   └── main.py             # FastAPI entrypoint & CORS middleware
│   ├── storage/
│   │   ├── uploads/            # Uploaded property images
│   │   ├── renders/            # Exported MP4 videos
│   │   └── realty_studio.db    # SQLite persistence
│   ├── tests/                  # Automated pytest suite
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar
│   │   ├── features/video-editor/
│   │   │   ├── Step1_PropertyDetails.tsx
│   │   │   ├── Step2_ImageUploader.tsx
│   │   │   ├── Step3_VideoCustomizer.tsx
│   │   │   ├── Step4_StoryboardEditor.tsx
│   │   │   ├── Step5_RenderExport.tsx
│   │   │   └── VideoWizard.tsx
│   │   ├── pages/              # Dashboard, Templates, Settings
│   │   ├── services/api.ts     # Type-safe API client
│   │   ├── types/index.ts      # Data interfaces
│   │   ├── App.tsx             # Main coordinator
│   │   └── index.css           # Tailwind v4 styles
│   ├── package.json
│   └── vite.config.ts
├── demo_output/
│   └── Skyline_Residency_Luxury_Reel.mp4   # Verified sample MP4 export
├── run-dev.bat                 # Windows CMD startup script
├── run-dev.ps1                 # Windows PowerShell startup script
├── .env.example
└── README.md
```

---

## 12. Troubleshooting & Limitations

- **FFmpeg not detected**: Ensure `imageio-ffmpeg` is installed via `pip install imageio-ffmpeg` (bundled in requirements.txt), or install system FFmpeg and set `FFMPEG_PATH` in `.env`.
- **Text-to-Speech**: On Windows, `pyttsx3` uses Windows SAPI5 offline. If running on a headless Linux server without speech drivers, the video pipeline automatically falls back to background music without failing.
- **Concurrent Renders**: To protect developer laptop resources, each project is limited to one active render at a time.
