import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TemplatesPage } from './pages/TemplatesPage';
import { SettingsPage } from './pages/SettingsPage';
import { VideoWizard } from './features/video-editor/VideoWizard';
import { Project, DashboardStats } from './types';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'projects' | 'templates' | 'settings'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [ffmpegAvailable, setFfmpegAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [projList, statsData, healthData] = await Promise.all([
        api.getProjects(),
        api.getStats().catch(() => null),
        api.getHealth().catch(() => ({ ffmpeg_available: false })),
      ]);
      setProjects(projList);
      if (statsData) setStats(statsData);
      setFfmpegAvailable(healthData.ffmpeg_available);
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleNewProject = () => {
    setActiveProject(null);
    setCurrentView('create');
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setCurrentView('create');
  };

  const handleLoadSample = async () => {
    try {
      setLoading(true);
      const demoProject = await api.loadSampleProject();
      setActiveProject(demoProject);
      await refreshData();
      setCurrentView('create');
    } catch (err: any) {
      alert(`Error loading sample: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col font-sans">
      {/* Top Brand Header */}
      <Navbar
        onNewProject={handleNewProject}
        onLoadSample={handleLoadSample}
        ffmpegAvailable={ffmpegAvailable}
        activeView={currentView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view: string) => {
            if (view === 'create') {
              handleNewProject();
            } else {
              setCurrentView(view as any);
            }
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <Dashboard
              projects={projects}
              stats={stats}
              onNewProject={handleNewProject}
              onOpenProject={handleOpenProject}
              onLoadSample={handleLoadSample}
              onRefresh={refreshData}
            />
          )}

          {currentView === 'create' && (
            <VideoWizard
              initialProject={activeProject}
              onDone={() => {
                refreshData();
                setCurrentView('dashboard');
              }}
              onLoadSample={handleLoadSample}
            />
          )}

          {currentView === 'projects' && (
            <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF2]">
                <div>
                  <h1 className="text-2xl font-bold text-[#14233B]">My Video Projects</h1>
                  <p className="text-sm text-[#68758A] mt-1">
                    Manage and download all your real estate marketing videos.
                  </p>
                </div>
                <button
                  onClick={handleNewProject}
                  className="px-4 py-2 bg-[#3157D5] hover:bg-[#2846b0] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  + Create Video
                </button>
              </div>

              <Dashboard
                projects={projects}
                stats={stats}
                onNewProject={handleNewProject}
                onOpenProject={handleOpenProject}
                onLoadSample={handleLoadSample}
                onRefresh={refreshData}
              />
            </div>
          )}

          {currentView === 'templates' && (
            <TemplatesPage
              onUseTemplate={() => {
                handleNewProject();
              }}
            />
          )}

          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
