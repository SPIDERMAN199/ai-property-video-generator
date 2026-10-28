import React from 'react';
import { Film, CheckCircle2, AlertCircle, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNewProject: () => void;
  onLoadSample: () => void;
  ffmpegAvailable: boolean;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewProject,
  onLoadSample,
  ffmpegAvailable,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#E5EAF2] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#14233B] flex items-center justify-center text-white shadow-sm">
          <Film className="w-5 h-5 text-[#FF7043]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-[#14233B] tracking-tight">REALTY ASSISTANT</span>
            <span className="bg-[#3157D5]/10 text-[#3157D5] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Studio
            </span>
          </div>
          <p className="text-xs text-[#68758A]">AI Property Video Generator</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Readiness Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6F8FC] border border-[#E5EAF2] text-xs font-medium text-[#172033]">
          {ffmpegAvailable ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
              <span>FFmpeg 7.1 Pipeline Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-[#C2413B]" />
              <span>FFmpeg Not Detected</span>
            </>
          )}
        </div>

        {/* Demo Loader Button */}
        <button
          onClick={onLoadSample}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#14233B] bg-[#F6F8FC] hover:bg-[#E5EAF2] rounded-lg transition-colors border border-[#E5EAF2]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF7043]" />
          <span>Load Sample (Skyline Residency)</span>
        </button>

        {/* Create Video Action */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3157D5] hover:bg-[#2846b0] rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Video</span>
        </button>
      </div>
    </header>
  );
};
