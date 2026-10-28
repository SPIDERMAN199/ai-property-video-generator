import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cpu,
  Mic,
  Music,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const SettingsPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [h, s] = await Promise.all([api.getHealth(), api.getStats()]);
      setHealthData(h);
      setStatsData(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF2]">
        <div>
          <h1 className="text-2xl font-bold text-[#14233B]">System & Engine Settings</h1>
          <p className="text-sm text-[#68758A] mt-1">
            Real-time status of backend video encoding pipelines, storage, and AI providers.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#14233B] bg-white hover:bg-[#F6F8FC] border border-[#E5EAF2] rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FFmpeg Video Pipeline Status */}
        <div className="p-6 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#14233B]">Video Processing Pipeline</h3>
              <p className="text-xs text-[#68758A]">FFmpeg 7.1 Architecture</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">FFmpeg Status</span>
              {healthData?.ffmpeg_available ? (
                <span className="font-semibold text-[#16845B] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Installed & Ready
                </span>
              ) : (
                <span className="font-semibold text-[#C2413B] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Missing
                </span>
              )}
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Video Codec</span>
              <span className="font-semibold text-[#14233B]">libx264 (H.264 High Profile)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Frame Rate</span>
              <span className="font-semibold text-[#14233B]">30 FPS Smooth Motion</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68758A]">Hardware Acceleration</span>
              <span className="font-semibold text-[#14233B]">Enabled (CPU / Fast Preset)</span>
            </div>
          </div>
        </div>

        {/* AI & Content Engine Status */}
        <div className="p-6 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7043]/10 text-[#FF7043] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#14233B]">AI Content Generation</h3>
              <p className="text-xs text-[#68758A]">Provider & Fallback Safety</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Active Provider</span>
              <span className="font-semibold text-[#14233B]">Deterministic Local Fallback</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Hallucination Guard</span>
              <span className="font-semibold text-[#16845B]">100% Strict User Facts Only</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">External API Required</span>
              <span className="font-semibold text-[#14233B]">No (Full offline autonomy)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68758A]">Indian Currency Support</span>
              <span className="font-semibold text-[#14233B]">₹ Lakh & ₹ Crore Auto-formatting</span>
            </div>
          </div>
        </div>

        {/* Audio Mixing & TTS */}
        <div className="p-6 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#14233B]">Audio & Narration Engine</h3>
              <p className="text-xs text-[#68758A]">Speech Synthesis & Mixing</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Narration Voice Engine</span>
              <span className="font-semibold text-[#14233B]">Windows SAPI5 (pyttsx3 Offline)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Ambient BGM Loop</span>
              <span className="font-semibold text-[#14233B]">Royalty-Free Corporate Ambient</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Audio Ducking</span>
              <span className="font-semibold text-[#16845B]">Automatic 20% duck under voice</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68758A]">Export Audio Codec</span>
              <span className="font-semibold text-[#14233B]">AAC Stereo 44.1kHz 192kbps</span>
            </div>
          </div>
        </div>

        {/* Storage & Database */}
        <div className="p-6 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#14233B]">Local Persistence & Storage</h3>
              <p className="text-xs text-[#68758A]">SQLite & File Storage</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Database Engine</span>
              <span className="font-semibold text-[#14233B]">SQLite (realty_studio.db)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Storage Consumption</span>
              <span className="font-semibold text-[#14233B]">{statsData?.total_storage_mb ?? 0} MB</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#68758A]">Completed Video Files</span>
              <span className="font-semibold text-[#14233B]">{statsData?.completed_videos ?? 0} MP4s</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#68758A]">Upload Max Limit</span>
              <span className="font-semibold text-[#14233B]">15 MB per image (JPG/PNG/WebP)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
