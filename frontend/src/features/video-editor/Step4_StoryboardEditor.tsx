import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { ScriptData, StoryboardScene, ImageItem } from '../../types';
import { api } from '../../services/api';

interface Step4Props {
  projectId: string;
  images: ImageItem[];
  script: ScriptData | null;
  storyboard: StoryboardScene[];
  targetDuration: number;
  template: 'luxury' | 'minimal' | 'showcase';
  aspectRatio: '9:16' | '16:9' | '1:1';
  onScriptChange: (script: ScriptData) => void;
  onStoryboardChange: (scenes: StoryboardScene[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4_StoryboardEditor: React.FC<Step4Props> = ({
  projectId,
  images,
  script,
  storyboard,
  targetDuration,
  template,
  aspectRatio,
  onScriptChange,
  onStoryboardChange,
  onNext,
  onBack,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'storyboard' | 'script'>('storyboard');

  // Simulated Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);

  // Script editing state
  const [headline, setHeadline] = useState(script?.opening_headline || '');
  const [intro, setIntro] = useState(script?.property_intro || '');
  const [cta, setCta] = useState(script?.closing_cta || '');
  const [narration, setNarration] = useState(script?.narration_script || '');

  // Load or generate storyboard if empty
  useEffect(() => {
    if (storyboard.length === 0 && images.length >= 4) {
      handleGenerateStoryboard();
    }
  }, []);

  const handleGenerateStoryboard = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg('');
      const newScenes = await api.generateStoryboard(projectId, targetDuration);
      onStoryboardChange(newScenes);

      // Also refresh script
      const freshScript = await api.generateScript(projectId);
      onScriptChange(freshScript);
      setHeadline(freshScript.opening_headline);
      setIntro(freshScript.property_intro);
      setCta(freshScript.closing_cta);
      setNarration(freshScript.narration_script);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate storyboard.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveScript = async () => {
    try {
      const updated = await api.updateScript(projectId, {
        opening_headline: headline,
        property_intro: intro,
        closing_cta: cta,
        narration_script: narration,
        feature_captions: script?.feature_captions || [],
      });
      onScriptChange(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save script.');
    }
  };

  const handleUpdateScene = (index: number, patch: Partial<StoryboardScene>) => {
    const updated = [...storyboard];
    updated[index] = { ...updated[index], ...patch };
    onStoryboardChange(updated);
  };

  const handleSaveStoryboard = async () => {
    try {
      await api.updateStoryboard(projectId, storyboard);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save storyboard modifications.');
    }
  };

  // Simulated Storyboard Playback Loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && storyboard.length > 0) {
      const currentScene = storyboard[currentSceneIndex] || storyboard[0];
      const sceneDurMs = (currentScene.duration || 4.0) * 1000;
      const stepMs = 50;

      interval = setInterval(() => {
        setSceneProgress((prev) => {
          const next = prev + (stepMs / sceneDurMs) * 100;
          if (next >= 100) {
            // Next scene
            if (currentSceneIndex < storyboard.length - 1) {
              setCurrentSceneIndex((c) => c + 1);
              return 0;
            } else {
              // Loop back to start
              setCurrentSceneIndex(0);
              return 0;
            }
          }
          return next;
        });
      }, stepMs);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSceneIndex, storyboard]);

  const activeScene = storyboard[currentSceneIndex] || storyboard[0];
  const activeImage = images.find((img) => img.id === activeScene?.image_id) || images[0];

  // Aspect ratio preview frame classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'w-72 h-[480px]'
      : aspectRatio === '1:1'
      ? 'w-96 h-96'
      : 'w-full max-w-lg aspect-video';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAF2]">
        <div>
          <h2 className="text-xl font-bold text-[#14233B]">Step 4: AI Storyboard & Live Preview</h2>
          <p className="text-sm text-[#68758A]">
            Review scene captions, timing, and preview the simulated storyboard before launching the MP4 export.
          </p>
        </div>
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateStoryboard}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#3157D5] bg-[#3157D5]/10 hover:bg-[#3157D5]/20 rounded-lg transition-colors border border-[#3157D5]/20 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGenerating ? 'Regenerating...' : 'Regenerate Storyboard'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EAF2]">
        <button
          type="button"
          onClick={() => setActiveTab('storyboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'storyboard'
              ? 'border-[#3157D5] text-[#3157D5]'
              : 'border-transparent text-[#68758A] hover:text-[#14233B]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Scene Storyboard & Preview ({storyboard.length} Scenes)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'script'
              ? 'border-[#3157D5] text-[#3157D5]'
              : 'border-transparent text-[#68758A] hover:text-[#14233B]'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>AI Marketing Script</span>
        </button>
      </div>

      {activeTab === 'storyboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Simulated Preview Player */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full mb-2 flex items-center justify-between text-xs text-[#68758A]">
              <span className="font-bold uppercase tracking-wider text-[#14233B] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#3157D5]" />
                Simulated Storyboard Preview
              </span>
              <span>{aspectRatio} Format</span>
            </div>

            {/* Video Canvas Container */}
            <div
              className={`relative bg-[#0F172A] rounded-2xl overflow-hidden shadow-xl border-4 border-[#14233B] flex items-center justify-center ${aspectClass}`}
            >
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt="Scene preview"
                  className="w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div className="text-white text-xs">No image loaded</div>
              )}

              {/* Dark bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

              {/* Top Watermark Pill */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D4AF37] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#D4AF37]/50 shadow">
                  {template === 'luxury'
                    ? 'REALTY ASSISTANT • LUXURY'
                    : template === 'showcase'
                    ? 'REALTY ASSISTANT • SHOWCASE'
                    : 'REALTY ASSISTANT'}
                </span>
                <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
                  {currentSceneIndex + 1} / {storyboard.length}
                </span>
              </div>

              {/* Bottom Card Overlay Mockup */}
              {activeScene && (
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg space-y-1">
                  {activeScene.badge && (
                    <span
                      className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase mb-0.5"
                      style={{
                        backgroundColor:
                          template === 'luxury'
                            ? '#D4AF37'
                            : template === 'showcase'
                            ? '#FF7043'
                            : '#3157D5',
                        color: template === 'luxury' ? '#000' : '#FFF',
                      }}
                    >
                      {activeScene.badge}
                    </span>
                  )}
                  <p className="font-bold text-xs sm:text-sm leading-snug line-clamp-2">
                    {activeScene.caption}
                  </p>
                </div>
              )}
            </div>

            {/* Playback Controls & Timeline Scrubber */}
            <div className="w-full max-w-lg mt-3 p-3 bg-white border border-[#E5EAF2] rounded-xl space-y-2">
              {/* Scene Progress Indicators */}
              <div className="grid grid-flow-col gap-1.5 h-1.5 w-full">
                {storyboard.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentSceneIndex(i);
                      setSceneProgress(0);
                    }}
                    className={`h-full rounded-full cursor-pointer transition-colors ${
                      i < currentSceneIndex
                        ? 'bg-[#3157D5]'
                        : i === currentSceneIndex
                        ? 'bg-[#FF7043]'
                        : 'bg-[#E5EAF2]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-[#14233B] text-white flex items-center justify-center hover:bg-[#3157D5] transition-colors shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSceneIndex(0);
                      setSceneProgress(0);
                    }}
                    className="p-1.5 text-[#68758A] hover:text-[#14233B] rounded hover:bg-[#F6F8FC]"
                    title="Reset Preview"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-semibold text-[#14233B]">
                    Scene {currentSceneIndex + 1} of {storyboard.length}
                  </span>
                </div>

                <span className="text-xs text-[#68758A]">
                  Scene Duration: {activeScene?.duration || 4.0}s
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#68758A] mt-2 text-center">
              * This simulated player flips through photos & captions before rendering the final high-definition MP4 in Step 5.
            </p>
          </div>

          {/* Right: Scene Customization List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#14233B] uppercase tracking-wider">
                Scene Sequence & Captions
              </span>
              <button
                type="button"
                onClick={handleSaveStoryboard}
                className="text-xs font-semibold text-[#3157D5] hover:underline"
              >
                Save Storyboard Changes
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {storyboard.map((scene, idx) => {
                const img = images.find((im) => im.id === scene.image_id) || images[idx % images.length];
                const isCurrent = currentSceneIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentSceneIndex(idx);
                      setSceneProgress(0);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-[#3157D5] bg-[#3157D5]/5 shadow-sm ring-1 ring-[#3157D5]'
                        : 'border-[#E5EAF2] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded-lg bg-[#14233B]/10 overflow-hidden shrink-0 border border-[#E5EAF2]">
                        {img ? (
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px]">No img</div>
                        )}
                      </div>

                      {/* Scene Edit Inputs */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#14233B]">
                            Scene {scene.scene_number}: {idx === 0 ? 'Hero Opener' : idx === storyboard.length - 1 ? 'Final CTA' : 'Feature Tour'}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-[#68758A]">
                            <Clock className="w-3 h-3" />
                            <span>{scene.duration}s</span>
                          </div>
                        </div>

                        {/* Caption input */}
                        <div>
                          <input
                            type="text"
                            value={scene.caption}
                            onChange={(e) => handleUpdateScene(idx, { caption: e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5EAF2] rounded focus:outline-none focus:border-[#3157D5]"
                            placeholder="Scene caption"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={scene.badge}
                            onChange={(e) => handleUpdateScene(idx, { badge: e.target.value })}
                            className="w-1/2 px-2 py-1 text-[11px] bg-white border border-[#E5EAF2] rounded focus:outline-none focus:border-[#3157D5]"
                            placeholder="Category badge"
                          />
                          <select
                            value={scene.duration}
                            onChange={(e) => handleUpdateScene(idx, { duration: parseFloat(e.target.value) })}
                            className="w-1/2 px-2 py-1 text-[11px] bg-white border border-[#E5EAF2] rounded focus:outline-none focus:border-[#3157D5]"
                          >
                            <option value="2.5">2.5 seconds</option>
                            <option value="3.0">3.0 seconds</option>
                            <option value="4.0">4.0 seconds</option>
                            <option value="5.0">5.0 seconds</option>
                            <option value="6.0">6.0 seconds</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* AI Marketing Script Tab */
        <div className="space-y-4 bg-white p-6 border border-[#E5EAF2] rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
            <div>
              <h3 className="text-sm font-bold text-[#14233B]">Generated Marketing Copy & Script</h3>
              <p className="text-xs text-[#68758A]">
                Generated strictly from user-provided property facts without hallucinated amenities.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#16845B] bg-[#16845B]/10 px-2.5 py-1 rounded-full">
              Anti-Hallucination Verified
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Opening Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Property Introduction</label>
            <textarea
              rows={2}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1">Closing Call-To-Action</label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1">
              Voiceover Narration Script
            </label>
            <textarea
              rows={3}
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveScript}
              className="px-4 py-2 bg-[#14233B] hover:bg-[#203454] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Save Script Changes
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-6 border-t border-[#E5EAF2] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#14233B] bg-[#F6F8FC] hover:bg-[#E5EAF2] rounded-lg transition-colors border border-[#E5EAF2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customization</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#3157D5] hover:bg-[#2846b0] rounded-lg transition-all shadow-sm active:scale-[0.98]"
        >
          <span>Continue to Export & Download</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
