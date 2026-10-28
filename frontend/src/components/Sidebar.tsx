import React from 'react';
import { LayoutDashboard, Video, FolderKanban, Palette, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Video', icon: Video },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E5EAF2] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-[#68758A] uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#14233B] text-white shadow-sm'
                      : 'text-[#68758A] hover:text-[#172033] hover:bg-[#F6F8FC]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF7043]' : 'text-[#68758A]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F6F8FC] border border-[#E5EAF2]">
          <span className="text-[11px] font-bold text-[#3157D5] uppercase tracking-wider block mb-1">
            Marketing Ready
          </span>
          <p className="text-xs text-[#68758A] leading-relaxed">
            Export optimized MP4 reels for Instagram, WhatsApp status, and YouTube Shorts.
          </p>
        </div>
      </div>

      <div className="border-t border-[#E5EAF2] pt-4 px-2">
        <p className="text-[11px] text-[#68758A]">Realty Assistant v1.0.0</p>
        <p className="text-[10px] text-[#68758A]/80 mt-0.5">Enterprise Multimedia Suite</p>
      </div>
    </aside>
  );
};
