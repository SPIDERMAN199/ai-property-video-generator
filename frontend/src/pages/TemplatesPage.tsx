import React from 'react';
import { Palette, Check, Sparkles, Smartphone, Monitor } from 'lucide-react';

interface TemplatesPageProps {
  onUseTemplate: (templateId: string) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onUseTemplate }) => {
  const templates = [
    {
      id: 'luxury',
      name: 'Luxury Estate',
      tagline: 'Timeless Luxury for High-End Villas, Penthouses & Estates',
      colors: ['#0F172A', '#1E293B', '#D4AF37', '#FFFFFF'],
      description:
        'Engineered for premium real estate marketing. Features deep obsidian backgrounds, gold-trimmed cards, elegant serif typography, subtle vignette gradients, and refined watermark branding.',
      idealFor: ['Luxury Villas & Mansions', 'Penthouse Suites', 'Gated Golf Communities', 'High-Net-Worth Portfolios'],
      previewBg: 'bg-gradient-to-br from-[#0F172A] via-[#14233B] to-[#1E293B]',
      accent: '#D4AF37',
      pillBg: '#D4AF3720',
      pillText: '#D4AF37',
    },
    {
      id: 'minimal',
      name: 'Modern Minimal',
      tagline: 'Clean, Crisp Urban Aesthetic for City Apartments & Studios',
      colors: ['#FFFFFF', '#F8FAFC', '#3157D5', '#172033'],
      description:
        'Built for modern urban listings. Uses high-contrast pure white containers, subtle slate shadows, royal blue pill badges, and contemporary sans-serif typography for maximum readability.',
      idealFor: ['City Apartments & Condos', 'Studio Living', 'New Construction High-Rises', 'Urban Rental Portfolios'],
      previewBg: 'bg-gradient-to-br from-white via-[#F8FAFC] to-[#F1F5F9] border border-[#CBD5E1]',
      accent: '#3157D5',
      pillBg: '#3157D515',
      pillText: '#3157D5',
    },
    {
      id: 'showcase',
      name: 'Premium Property Showcase',
      tagline: 'Vibrant & Dynamic Styling for Commercial & Fast-Moving Residential',
      colors: ['#14233B', '#FF7043', '#16845B', '#FFFFFF'],
      description:
        'Energetic visual design utilizing navy surfaces accented by bold coral pills, dynamic price tags, and high-visibility calls-to-action that capture social media attention on Instagram and WhatsApp.',
      idealFor: ['Commercial Real Estate', 'Office Spaces', 'Retail Showrooms', 'Exclusive Pre-Launch Projects'],
      previewBg: 'bg-gradient-to-br from-[#14233B] via-[#172540] to-[#1E3A8A]',
      accent: '#FF7043',
      pillBg: '#FF704325',
      pillText: '#FF7043',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#14233B]">Video Design Templates</h1>
        <p className="text-sm text-[#68758A] mt-1">
          Explore the three distinct visual styles used by the FFmpeg video rendering engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white border border-[#E5EAF2] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Visual Preview Box */}
              <div className={`p-6 h-56 flex flex-col justify-between ${tmpl.previewBg} relative`}>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{ backgroundColor: tmpl.pillBg, color: tmpl.pillText, border: `1px solid ${tmpl.accent}40` }}
                  >
                    {tmpl.name}
                  </span>
                  <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded">
                    30 FPS H.264
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider block" style={{ color: tmpl.accent }}>
                    FEATURED LISTING
                  </span>
                  <p className="font-bold text-sm leading-snug">Skyline Residency, Chandigarh</p>
                  <p className="text-xs opacity-90">₹85 Lakh • 2 BHK Luxury Living</p>
                </div>
              </div>

              {/* Description & Specs */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-base text-[#14233B]">{tmpl.name}</h3>
                  <p className="text-xs text-[#3157D5] font-semibold mt-0.5">{tmpl.tagline}</p>
                </div>

                <p className="text-xs text-[#68758A] leading-relaxed">{tmpl.description}</p>

                {/* Color Palette Swatches */}
                <div>
                  <span className="text-[11px] font-bold text-[#14233B] uppercase tracking-wider block mb-2">
                    Color Palette
                  </span>
                  <div className="flex items-center gap-2">
                    {tmpl.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-7 h-7 rounded-lg border border-black/10 shadow-inner"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Best For Tags */}
                <div>
                  <span className="text-[11px] font-bold text-[#14233B] uppercase tracking-wider block mb-2">
                    Recommended For
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.idealFor.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 bg-[#F6F8FC] border border-[#E5EAF2] rounded-lg text-[#172033]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="p-6 bg-[#F6F8FC] border-t border-[#E5EAF2]">
              <button
                type="button"
                onClick={() => onUseTemplate(tmpl.id)}
                className="w-full py-2.5 bg-[#14233B] hover:bg-[#3157D5] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Create Video With This Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
