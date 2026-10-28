import React from 'react';
import {
  Film,
  Plus,
  Sparkles,
  Clock,
  HardDrive,
  CheckCircle2,
  Play,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  Layers,
  MapPin,
  IndianRupee,
  FileVideo
} from 'lucide-react';
import { Project, DashboardStats } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  projects: Project[];
  stats: DashboardStats | null;
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
  onLoadSample: () => void;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  stats,
  onNewProject,
  onOpenProject,
  onLoadSample,
  onRefresh,
}) => {
  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this video project?')) return;
    try {
      await api.deleteProject(projectId);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#14233B] to-[#1E3A8A] rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7043]" />
            <span>Automated Real Estate Video Production</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            AI Property Video Studio
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Turn real-estate property listings into professional, marketing-ready MP4 reels with stylish text overlays, smooth transitions, and background music in minutes.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7043] hover:bg-[#f45d2e] text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Video</span>
            </button>
            <button
              onClick={onLoadSample}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-colors border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Load Skyline Residency Demo</span>
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-[-40px] top-[-40px] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="p-5 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#68758A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#14233B]">{stats?.total_projects ?? projects.length}</p>
          <span className="text-[11px] text-[#68758A]">In active workspace</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#68758A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Videos</span>
            <div className="w-8 h-8 rounded-lg bg-[#16845B]/10 text-[#16845B] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#14233B]">{stats?.completed_videos ?? 0}</p>
          <span className="text-[11px] text-[#16845B] font-semibold">Rendered & ready</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#68758A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">This Week</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF7043]/10 text-[#FF7043] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#14233B]">{stats?.videos_this_week ?? 0}</p>
          <span className="text-[11px] text-[#68758A]">Last 7 days activity</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#68758A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Used</span>
            <div className="w-8 h-8 rounded-lg bg-[#14233B]/10 text-[#14233B] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#14233B]">{stats?.total_storage_mb ?? 0} MB</p>
          <span className="text-[11px] text-[#68758A]">Uploads & MP4 renders</span>
        </div>
      </div>

      {/* Recent Video Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#14233B]">Recent Video Projects</h2>
          <span className="text-xs font-medium text-[#68758A]">
            Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 bg-white border border-dashed border-[#E5EAF2] rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F6F8FC] border border-[#E5EAF2] flex items-center justify-center mx-auto text-[#68758A]">
              <Film className="w-8 h-8" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="font-bold text-base text-[#14233B]">No Video Projects Yet</h3>
              <p className="text-xs text-[#68758A]">
                Start by creating your first property video or load the Skyline Residency sample demonstration.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onNewProject}
                className="px-4 py-2 bg-[#3157D5] hover:bg-[#2846b0] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Create Video
              </button>
              <button
                onClick={onLoadSample}
                className="px-4 py-2 bg-[#F6F8FC] hover:bg-[#E5EAF2] text-[#14233B] text-xs font-semibold rounded-lg border border-[#E5EAF2] transition-colors"
              >
                Load Sample Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const heroImage = project.images?.[0];
              const isRendered = project.latest_render?.status === 'completed';

              return (
                <div
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  className="group bg-white border border-[#E5EAF2] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="aspect-video w-full bg-[#14233B]/5 overflow-hidden relative">
                      {heroImage ? (
                        <img
                          src={heroImage.url}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#68758A]">
                          No photos uploaded
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {isRendered ? (
                          <span className="bg-[#16845B] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Rendered MP4</span>
                          </span>
                        ) : project.status === 'storyboard_ready' ? (
                          <span className="bg-[#3157D5] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                            Storyboard Ready
                          </span>
                        ) : project.status === 'script_ready' ? (
                          <span className="bg-[#FF7043] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                            Script Ready
                          </span>
                        ) : (
                          <span className="bg-[#68758A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Photo Count */}
                      <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {project.images.length} Photos
                      </span>
                    </div>

                    {/* Project Metadata */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#14233B] group-hover:text-[#3157D5] transition-colors truncate">
                          {project.name}
                        </h3>
                        <span className="font-extrabold text-xs text-[#14233B] shrink-0 bg-[#F6F8FC] px-2 py-0.5 rounded border border-[#E5EAF2]">
                          {project.price_formatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#68758A]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FF7043]" />
                        <span className="truncate">{project.location}</span>
                      </div>

                      <p className="text-[11px] text-[#68758A] line-clamp-2">
                        {project.property_type} • {project.bedrooms ? `${project.bedrooms} BHK • ` : ''}
                        {project.area ? `${project.area} ${project.area_unit}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-[#F6F8FC] border-t border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-[10px] text-[#68758A]">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      {isRendered && project.latest_render && (
                        <a
                          href={api.getDownloadUrl(project.latest_render.id)}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-[#16845B] hover:bg-emerald-50 rounded"
                          title="Download MP4"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-1.5 text-[#68758A] hover:text-[#C2413B] hover:bg-red-50 rounded"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-[#3157D5] hover:bg-blue-50 rounded ml-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
