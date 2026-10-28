import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Project, ImageItem, ScriptData, StoryboardScene } from '../../types';
import { api } from '../../services/api';
import { Step1_PropertyDetails } from './Step1_PropertyDetails';
import { Step2_ImageUploader } from './Step2_ImageUploader';
import { Step3_VideoCustomizer } from './Step3_VideoCustomizer';
import { Step4_StoryboardEditor } from './Step4_StoryboardEditor';
import { Step5_RenderExport } from './Step5_RenderExport';

interface VideoWizardProps {
  initialProject?: Project | null;
  onDone: () => void;
  onLoadSample: () => void;
}

const STEPS = [
  { id: 1, title: 'Details', desc: 'Property Info' },
  { id: 2, title: 'Photos', desc: '4–8 Images' },
  { id: 3, title: 'Customize', desc: 'Style & Aspect' },
  { id: 4, title: 'Storyboard', desc: 'AI Script' },
  { id: 5, title: 'Export', desc: 'Download MP4' },
];

export const VideoWizard: React.FC<VideoWizardProps> = ({
  initialProject,
  onDone,
  onLoadSample,
}) => {
  const [currentStep, setCurrentStep] = useState(initialProject ? (initialProject.latest_render ? 5 : 2) : 1);
  const [project, setProject] = useState<Project | null>(initialProject || null);
  const [images, setImages] = useState<ImageItem[]>(initialProject?.images || []);
  const [script, setScript] = useState<ScriptData | null>(initialProject?.script || null);
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>(initialProject?.storyboard || []);

  const [customization, setCustomization] = useState({
    aspect_ratio: (initialProject?.latest_render?.aspect_ratio || '9:16') as '9:16' | '16:9' | '1:1',
    resolution: (initialProject?.latest_render?.resolution || '1080p') as '720p' | '1080p',
    duration_preset: (initialProject?.latest_render?.duration_preset || '20s') as '20s' | '30s' | '40s',
    template: (initialProject?.latest_render?.template || 'luxury') as 'luxury' | 'minimal' | 'showcase',
    include_music: initialProject?.latest_render?.include_music ?? true,
    music_volume: initialProject?.latest_render?.music_volume ?? 0.35,
    include_narration: initialProject?.latest_render?.include_narration ?? true,
  });

  // Step 1: Save or create project
  const handleStep1Submit = async (data: Partial<Project>) => {
    try {
      if (project?.id) {
        const updated = await api.updateProject(project.id, data);
        setProject(updated);
      } else {
        const created = await api.createProject(data);
        setProject(created);
      }
      setCurrentStep(2);
    } catch (err: any) {
      alert(`Error saving project: ${err.message}`);
    }
  };

  // Step 2: Uploads done
  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  // Step 3: Customization done
  const handleStep3Next = () => {
    setCurrentStep(4);
  };

  // Step 4: Storyboard done
  const handleStep4Next = () => {
    setCurrentStep(5);
  };

  const getTargetDurationNumber = () => {
    if (customization.duration_preset === '40s') return 40.0;
    if (customization.duration_preset === '30s') return 30.0;
    return 20.0;
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Stepper Progress Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-5 gap-2 relative">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = isCompleted || (project && step.id <= 2) || (images.length >= 4 && step.id <= 4);

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && setCurrentStep(step.id)}
                className={`text-left group relative p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-[#3157D5] bg-[#3157D5]/5 shadow-sm'
                    : isCompleted
                    ? 'border-[#E5EAF2] bg-white hover:border-[#3157D5]/50'
                    : 'border-[#E5EAF2] bg-white opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-[#16845B] text-white'
                        : isCurrent
                        ? 'bg-[#3157D5] text-white'
                        : 'bg-[#F1F5F9] text-[#68758A]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isCurrent ? 'text-[#3157D5]' : 'text-[#14233B]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="text-[10px] text-[#68758A] truncate hidden sm:block">
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-[#E5EAF2] rounded-2xl p-6 sm:p-8 shadow-sm">
        {currentStep === 1 && (
          <Step1_PropertyDetails
            initialData={project || undefined}
            onNext={handleStep1Submit}
            onLoadSample={onLoadSample}
          />
        )}

        {currentStep === 2 && project && (
          <Step2_ImageUploader
            projectId={project.id}
            images={images}
            onImagesChange={setImages}
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1)}
            onLoadSample={onLoadSample}
          />
        )}

        {currentStep === 3 && (
          <Step3_VideoCustomizer
            settings={customization}
            onChange={setCustomization}
            onNext={handleStep3Next}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && project && (
          <Step4_StoryboardEditor
            projectId={project.id}
            images={images}
            script={script}
            storyboard={storyboard}
            targetDuration={getTargetDurationNumber()}
            template={customization.template}
            aspectRatio={customization.aspect_ratio}
            onScriptChange={setScript}
            onStoryboardChange={setStoryboard}
            onNext={handleStep4Next}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && project && (
          <Step5_RenderExport
            project={{ ...project, images, script, storyboard }}
            settings={customization}
            onBack={() => setCurrentStep(4)}
            onDone={onDone}
          />
        )}
      </div>
    </div>
  );
};
