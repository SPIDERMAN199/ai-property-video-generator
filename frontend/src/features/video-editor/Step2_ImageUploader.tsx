import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { ImageItem } from '../../types';
import { api } from '../../services/api';

interface Step2Props {
  projectId: string;
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  onLoadSample: () => void;
}

export const Step2_ImageUploader: React.FC<Step2Props> = ({
  projectId,
  images,
  onImagesChange,
  onNext,
  onBack,
  onLoadSample
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg('');

    const fileList = Array.from(files);
    
    // Check max count
    if (images.length + fileList.length > 8) {
      setErrorMsg(`Maximum 8 images allowed. You can only add ${8 - images.length} more.`);
      return;
    }

    // Client-side format validation
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    for (const f of fileList) {
      const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
      if (!allowed.includes(ext)) {
        setErrorMsg(`Unsupported file '${f.name}'. Allowed formats: JPG, JPEG, PNG, WebP.`);
        return;
      }
      if (f.size > 15 * 1024 * 1024) {
        setErrorMsg(`File '${f.name}' exceeds the 15MB size limit.`);
        return;
      }
    }

    try {
      setIsUploading(true);
      const newImages = await api.uploadImages(projectId, fileList);
      onImagesChange([...images, ...newImages]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload images. Please check the file format.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await api.deleteImage(projectId, imageId);
      onImagesChange(images.filter((img) => img.id !== imageId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete image.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    onImagesChange(reordered);
    try {
      await api.reorderImages(projectId, reordered.map((img) => img.id));
    } catch (err) {
      console.error('Failed to sync reordering on server', err);
    }
  };

  const canProceed = images.length >= 4 && images.length <= 8;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAF2]">
        <div>
          <h2 className="text-xl font-bold text-[#14233B]">Step 2: Upload Property Images</h2>
          <p className="text-sm text-[#68758A]">
            Upload 4 to 8 high-resolution photos. These images will be sequenced into video scenes.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#3157D5] bg-[#3157D5]/10 hover:bg-[#3157D5]/20 rounded-lg transition-colors border border-[#3157D5]/20 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load 5 Demo Property Photos</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-[#3157D5] bg-[#3157D5]/5'
            : 'border-[#CBD5E1] bg-white hover:border-[#3157D5]/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center mx-auto mb-3">
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>
        <p className="text-sm font-semibold text-[#14233B]">
          {isUploading ? 'Uploading and validating photos...' : 'Click to browse or drag and drop property photos'}
        </p>
        <p className="text-xs text-[#68758A] mt-1">
          Supports JPG, JPEG, PNG, and WebP (up to 15MB each)
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6F8FC] border border-[#E5EAF2] text-xs font-medium text-[#14233B]">
          <span>Requirement: 4 to 8 images</span>
          <span className="font-bold text-[#3157D5]">({images.length} uploaded)</span>
        </div>
      </div>

      {/* Uploaded Images Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#14233B] uppercase tracking-wider">
            Storyboard Photos ({images.length} / 8)
          </h3>
          <div className="flex items-center gap-1.5 text-xs">
            {images.length < 4 ? (
              <span className="text-[#C2413B] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Add {4 - images.length} more to continue
              </span>
            ) : (
              <span className="text-[#16845B] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Minimum image requirement satisfied
              </span>
            )}
          </div>
        </div>

        {images.length === 0 ? (
          <div className="p-8 border border-dashed border-[#E5EAF2] rounded-xl text-center text-sm text-[#68758A]">
            No images uploaded yet. Upload at least 4 photos or click &quot;Load 5 Demo Property Photos&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative bg-white border border-[#E5EAF2] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image Preview */}
                <div className="aspect-video w-full bg-[#14233B]/5 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.original_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Sequence Badge */}
                  <span className="absolute top-2 left-2 bg-[#14233B]/80 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    Scene {idx + 1}
                  </span>
                </div>

                {/* Info & Reorder Controls */}
                <div className="p-2.5 flex items-center justify-between bg-white border-t border-[#E5EAF2]">
                  <span className="text-xs text-[#172033] font-medium truncate max-w-[100px]" title={img.original_name}>
                    {img.original_name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 text-[#68758A] hover:text-[#3157D5] disabled:opacity-30 disabled:hover:text-[#68758A] rounded hover:bg-[#F6F8FC]"
                      title="Move Earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 text-[#68758A] hover:text-[#3157D5] disabled:opacity-30 disabled:hover:text-[#68758A] rounded hover:bg-[#F6F8FC]"
                      title="Move Later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="p-1 text-[#C2413B] hover:bg-red-50 rounded ml-1"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-[#E5EAF2] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#14233B] bg-[#F6F8FC] hover:bg-[#E5EAF2] rounded-lg transition-colors border border-[#E5EAF2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </button>

        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${
            canProceed
              ? 'bg-[#3157D5] hover:bg-[#2846b0] text-white active:scale-[0.98]'
              : 'bg-[#E5EAF2] text-[#68758A] cursor-not-allowed'
          }`}
        >
          <span>Continue to Customization</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
