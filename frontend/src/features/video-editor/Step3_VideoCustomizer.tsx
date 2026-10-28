import React from 'react';
import { Smartphone, Monitor, Square, Clock, Music, Mic, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface CustomizationSettings {
  aspect_ratio: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  duration_preset: '20s' | '30s' | '40s';
  template: 'luxury' | 'minimal' | 'showcase';
  include_music: boolean;
  music_volume: number;
  include_narration: boolean;
}

interface Step3Props {
  settings: CustomizationSettings;
  onChange: (settings: CustomizationSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3_VideoCustomizer: React.FC<Step3Props> = ({
  settings,
  onChange,
  onNext,
  onBack,
}) => {
  const update = (patch: Partial<CustomizationSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const templates = [
    {
      id: 'luxury' as const,
      name: 'Luxury Estate',
      desc: 'Deep obsidian & navy with rich gold accents, high-contrast badges, and cinematic serif titles.',
      bgClass: 'bg-gradient-to-br from-[#0F172A] to-[#1E293B]',
      accentColor: '#D4AF37',
      badgeText: 'GOLD LUXURY',
      textColor: 'text-white',
    },
    {
      id: 'minimal' as const,
      name: 'Modern Minimal',
      desc: 'Crisp white cards, slate typography, royal blue pills, and modern clean lines.',
      bgClass: 'bg-gradient-to-br from-white to-[#F1F5F9] border border-[#CBD5E1]',
      accentColor: '#3157D5',
      badgeText: 'ROYAL MINIMAL',
      textColor: 'text-[#1E293B]',
    },
    {
      id: 'showcase' as const,
      name: 'Premium Property Showcase',
      desc: 'Dark navy glassmorphic container with energetic coral accents and high-impact price pills.',
      bgClass: 'bg-gradient-to-br from-[#14233B] to-[#172033]',
      accentColor: '#FF7043',
      badgeText: 'CORAL SHOWCASE',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5EAF2]">
        <h2 className="text-xl font-bold text-[#14233B]">Step 3: Customize Video Studio</h2>
        <p className="text-sm text-[#68758A]">
          Configure aspect ratio, duration, visual template, and audio mixing for your marketing campaign.
        </p>
      </div>

      {/* 1. Aspect Ratio Selector */}
      <div>
        <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-3">
          1. Target Format & Aspect Ratio
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 9:16 Vertical */}
          <button
            type="button"
            onClick={() => update({ aspect_ratio: '9:16' })}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              settings.aspect_ratio === '9:16'
                ? 'border-[#3157D5] bg-[#3157D5]/5 shadow-sm ring-1 ring-[#3157D5]'
                : 'border-[#E5EAF2] bg-white hover:border-[#CBD5E1]'
            }`}
          >
            {settings.aspect_ratio === '9:16' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#3157D5] text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-[#14233B] block">Vertical (9:16)</span>
                <span className="text-[11px] font-semibold text-[#FF7043]">Most Popular</span>
              </div>
            </div>
            <p className="text-xs text-[#68758A]">
              Optimized for Instagram Reels, YouTube Shorts, and WhatsApp Status updates.
            </p>
          </button>

          {/* 16:9 Landscape */}
          <button
            type="button"
            onClick={() => update({ aspect_ratio: '16:9' })}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              settings.aspect_ratio === '16:9'
                ? 'border-[#3157D5] bg-[#3157D5]/5 shadow-sm ring-1 ring-[#3157D5]'
                : 'border-[#E5EAF2] bg-white hover:border-[#CBD5E1]'
            }`}
          >
            {settings.aspect_ratio === '16:9' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#3157D5] text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-[#14233B] block">Landscape (16:9)</span>
                <span className="text-[11px] text-[#68758A]">Desktop & TV</span>
              </div>
            </div>
            <p className="text-xs text-[#68758A]">
              Ideal for YouTube video listings, property websites, and office presentations.
            </p>
          </button>

          {/* 1:1 Square */}
          <button
            type="button"
            onClick={() => update({ aspect_ratio: '1:1' })}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              settings.aspect_ratio === '1:1'
                ? 'border-[#3157D5] bg-[#3157D5]/5 shadow-sm ring-1 ring-[#3157D5]'
                : 'border-[#E5EAF2] bg-white hover:border-[#CBD5E1]'
            }`}
          >
            {settings.aspect_ratio === '1:1' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#3157D5] text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center">
                <Square className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-[#14233B] block">Square (1:1)</span>
                <span className="text-[11px] text-[#68758A]">Social Feeds</span>
              </div>
            </div>
            <p className="text-xs text-[#68758A]">
              Standard format for Facebook, LinkedIn, and Instagram carousel feeds.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Visual Template Selector */}
      <div>
        <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-3">
          2. Visual Template & Brand Aesthetic
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {templates.map((tmpl) => {
            const isSelected = settings.template === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => update({ template: tmpl.id })}
                className={`cursor-pointer rounded-2xl overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-[#3157D5] shadow-md ring-2 ring-[#3157D5]'
                    : 'border-[#E5EAF2] hover:border-[#CBD5E1] bg-white'
                }`}
              >
                {/* Visual Preview Mockup Card */}
                <div className={`p-4 h-36 flex flex-col justify-between ${tmpl.bgClass} relative`}>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider"
                      style={{ backgroundColor: `${tmpl.accentColor}25`, color: tmpl.accentColor, border: `1px solid ${tmpl.accentColor}50` }}
                    >
                      {tmpl.badgeText}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#3157D5] text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${tmpl.textColor} leading-tight`}>
                      Skyline Residency
                    </p>
                    <p className="text-[11px] opacity-80" style={{ color: tmpl.accentColor }}>
                      ₹85 Lakh • Chandigarh
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 bg-white">
                  <span className="font-bold text-sm text-[#14233B] block mb-1">{tmpl.name}</span>
                  <p className="text-xs text-[#68758A] leading-relaxed">{tmpl.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Duration & Resolution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white border border-[#E5EAF2] rounded-2xl">
        <div>
          <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
            Target Video Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['20s', '30s', '40s'] as const).map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => update({ duration_preset: dur })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  settings.duration_preset === dur
                    ? 'bg-[#14233B] text-white border-[#14233B]'
                    : 'bg-[#F6F8FC] text-[#68758A] border-[#E5EAF2] hover:bg-[#E5EAF2]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{dur}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#68758A] mt-2">
            20s is optimal for quick social engagement; 40s provides detailed feature tours.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
            Export Quality
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['720p', '1080p'] as const).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => update({ resolution: res })}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  settings.resolution === res
                    ? 'bg-[#3157D5] text-white border-[#3157D5]'
                    : 'bg-[#F6F8FC] text-[#68758A] border-[#E5EAF2] hover:bg-[#E5EAF2]'
                }`}
              >
                {res === '1080p' ? '1080p Full HD' : '720p Fast HD'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#68758A] mt-2">
            Both resolutions render at 30 FPS H.264 MP4 with AAC stereo audio.
          </p>
        </div>
      </div>

      {/* 4. Audio & Narration */}
      <div className="p-5 bg-white border border-[#E5EAF2] rounded-2xl space-y-4">
        <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider">
          Audio & Speech Options
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Background Music */}
          <div className="p-4 rounded-xl bg-[#F6F8FC] border border-[#E5EAF2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#3157D5]" />
                <span className="text-sm font-semibold text-[#14233B]">Background Music</span>
              </div>
              <input
                type="checkbox"
                checked={settings.include_music}
                onChange={(e) => update({ include_music: e.target.checked })}
                className="w-4 h-4 accent-[#3157D5] rounded cursor-pointer"
              />
            </div>
            {settings.include_music && (
              <div>
                <div className="flex items-center justify-between text-xs text-[#68758A] mb-1">
                  <span>Music Volume</span>
                  <span>{Math.round(settings.music_volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.music_volume}
                  onChange={(e) => update({ music_volume: parseFloat(e.target.value) })}
                  className="w-full accent-[#3157D5]"
                />
                <p className="text-[11px] text-[#68758A] mt-1">
                  Includes royalty-free ambient harmonic track with smooth fade-in/out.
                </p>
              </div>
            )}
          </div>

          {/* Voice Narration */}
          <div className="p-4 rounded-xl bg-[#F6F8FC] border border-[#E5EAF2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#FF7043]" />
                <span className="text-sm font-semibold text-[#14233B]">AI Voice Narration</span>
              </div>
              <input
                type="checkbox"
                checked={settings.include_narration}
                onChange={(e) => update({ include_narration: e.target.checked })}
                className="w-4 h-4 accent-[#FF7043] rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Synthesizes voiceover presentation describing property highlights, timed with scene transitions and audio ducking.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-[#E5EAF2] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#14233B] bg-[#F6F8FC] hover:bg-[#E5EAF2] rounded-lg transition-colors border border-[#E5EAF2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Photos</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#3157D5] hover:bg-[#2846b0] rounded-lg transition-all shadow-sm active:scale-[0.98]"
        >
          <span>Continue to Script & Storyboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
