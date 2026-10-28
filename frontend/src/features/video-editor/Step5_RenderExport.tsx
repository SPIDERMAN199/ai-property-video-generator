import React, { useState, useEffect } from 'react';
import {
  Download,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Share2,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  FileVideo,
  Play
} from 'lucide-react';
import { RenderJob, Project } from '../../types';
import { api } from '../../services/api';

interface Step5Props {
  project: Project;
  settings: {
    aspect_ratio: '9:16' | '16:9' | '1:1';
    resolution: '720p' | '1080p';
    duration_preset: '20s' | '30s' | '40s';
    template: 'luxury' | 'minimal' | 'showcase';
    include_music: boolean;
    music_volume: number;
    include_narration: boolean;
  };
  onBack: () => void;
  onDone: () => void;
}

export const Step5_RenderExport: React.FC<Step5Props> = ({
  project,
  settings,
  onBack,
  onDone,
}) => {
  const [renderJob, setRenderJob] = useState<RenderJob | null>(project.latest_render || null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // If latest render exists and is already completed, show it. Otherwise if no render or failed, allow starting.
  const handleStartRender = async () => {
    try {
      setIsStarting(true);
      setErrorMsg('');
      const job = await api.startRender(project.id, settings);
      setRenderJob(job);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch video rendering.');
    } finally {
      setIsStarting(false);
    }
  };

  // Poll render progress while queued or processing
  useEffect(() => {
    let interval: any = null;
    if (renderJob && (renderJob.status === 'queued' || renderJob.status === 'processing')) {
      interval = setInterval(async () => {
        try {
          const freshJob = await api.getRenderStatus(renderJob.id);
          setRenderJob(freshJob);
          if (freshJob.status === 'completed' || freshJob.status === 'failed') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Failed to poll render status', err);
        }
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [renderJob]);

  // Format file size
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const downloadUrl = renderJob?.id ? api.getDownloadUrl(renderJob.id) : '';

  const handleShareWhatsApp = () => {
    const text = `Take a look at this property video for ${project.name} in ${project.location} (${project.price_formatted}): ${window.location.origin}${downloadUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${downloadUrl}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5EAF2]">
        <h2 className="text-xl font-bold text-[#14233B]">Step 5: Export & Download MP4 Video</h2>
        <p className="text-sm text-[#68758A]">
          Generate an authentic, high-definition H.264 MP4 video powered by FFmpeg with stylish text overlays and audio.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Case 1: No render started yet or user wants to render new configuration */}
      {(!renderJob || renderJob.status === 'failed') && (
        <div className="p-8 bg-white border border-[#E5EAF2] rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center mx-auto shadow-sm">
            <Film className="w-8 h-8 text-[#3157D5]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-[#14233B]">Ready to Render Video</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Your property details, {project.images.length} scenes, {settings.template} theme, and audio track are configured.
            </p>
          </div>

          {/* Configuration Summary Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#F6F8FC] border border-[#E5EAF2] rounded-full text-xs font-semibold text-[#14233B]">
              Aspect Ratio: {settings.aspect_ratio}
            </span>
            <span className="px-3 py-1 bg-[#F6F8FC] border border-[#E5EAF2] rounded-full text-xs font-semibold text-[#14233B]">
              Resolution: {settings.resolution}
            </span>
            <span className="px-3 py-1 bg-[#F6F8FC] border border-[#E5EAF2] rounded-full text-xs font-semibold text-[#14233B]">
              Duration: {settings.duration_preset}
            </span>
            <span className="px-3 py-1 bg-[#F6F8FC] border border-[#E5EAF2] rounded-full text-xs font-semibold text-[#14233B]">
              Theme: {settings.template.toUpperCase()}
            </span>
          </div>

          {renderJob?.status === 'failed' && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg max-w-lg mx-auto">
              Previous render attempt failed: {renderJob.error_message}. You can retry now.
            </div>
          )}

          <div>
            <button
              type="button"
              disabled={isStarting}
              onClick={handleStartRender}
              className="px-8 py-3 bg-[#3157D5] hover:bg-[#2846b0] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] inline-flex items-center gap-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Render Job...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start MP4 Video Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Render in progress (Queued or Processing) */}
      {renderJob && (renderJob.status === 'queued' || renderJob.status === 'processing') && (
        <div className="p-8 bg-white border border-[#E5EAF2] rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-[#3157D5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#14233B]">
              {renderJob.status === 'queued' ? 'Render Job Queued...' : 'Rendering Real MP4 Video...'}
            </h3>
            <p className="text-xs text-[#68758A]">
              Applying Ken Burns motion, compositing graphic cards, and mixing audio with FFmpeg.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#14233B]">
              <span>Pipeline Progress</span>
              <span className="text-[#3157D5]">{renderJob.progress}%</span>
            </div>
            <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden p-0.5 border border-[#E5EAF2]">
              <div
                className="h-full bg-[#3157D5] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, renderJob.progress)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#68758A] italic">
              * Progress updates in real-time from server background worker.
            </p>
          </div>
        </div>
      )}

      {/* Case 3: Completed Render - Video Player & Direct Download */}
      {renderJob && renderJob.status === 'completed' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-[#16845B]" />
              <span>Video Export Complete! Your MP4 is ready to stream and download.</span>
            </div>
            <button
              type="button"
              onClick={handleStartRender}
              className="text-xs font-bold text-[#16845B] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-render</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* HTML5 Video Player */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="w-full bg-[#0F172A] rounded-2xl overflow-hidden shadow-xl border border-[#14233B] flex items-center justify-center p-2">
                <video
                  controls
                  autoPlay
                  loop
                  playsInline
                  src={downloadUrl}
                  className={`rounded-xl object-contain max-h-[460px] ${
                    settings.aspect_ratio === '9:16' ? 'w-64' : 'w-full'
                  }`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Video File Specifications & Actions */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-5 bg-white border border-[#E5EAF2] rounded-2xl space-y-3.5">
                <h4 className="text-xs font-bold text-[#14233B] uppercase tracking-wider">
                  Video Specifications
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#68758A]">Property Name</span>
                    <span className="font-semibold text-[#14233B]">{project.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#68758A]">Aspect Ratio</span>
                    <span className="font-semibold text-[#14233B]">{renderJob.aspect_ratio}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#68758A]">Resolution</span>
                    <span className="font-semibold text-[#14233B]">{renderJob.resolution} (H.264)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#68758A]">Actual Runtime</span>
                    <span className="font-semibold text-[#14233B]">{renderJob.actual_duration?.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                    <span className="text-[#68758A]">File Size</span>
                    <span className="font-semibold text-[#14233B]">{formatBytes(renderJob.file_size_bytes)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#68758A]">Audio Track</span>
                    <span className="font-semibold text-[#14233B]">AAC Stereo 192k</span>
                  </div>
                </div>

                {/* Primary Download Button */}
                <div className="pt-2">
                  <a
                    href={downloadUrl}
                    download
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#16845B] hover:bg-[#13714e] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP4 Video</span>
                  </a>
                </div>

                {/* Secondary Sharing Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F6F8FC] hover:bg-[#E5EAF2] text-[#14233B] text-xs font-semibold rounded-lg border border-[#E5EAF2] transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#16845B]" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F6F8FC] hover:bg-[#E5EAF2] text-[#14233B] text-xs font-semibold rounded-lg border border-[#E5EAF2] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onDone}
                  className="w-full py-2.5 bg-[#14233B] hover:bg-[#203454] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
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
          <span>Back to Storyboard</span>
        </button>

        <button
          type="button"
          onClick={onDone}
          className="px-6 py-2.5 text-sm font-semibold text-[#68758A] hover:text-[#14233B]"
        >
          Finish & Go to Projects
        </button>
      </div>
    </div>
  );
};
