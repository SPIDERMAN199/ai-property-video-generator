import { Project, DashboardStats, ImageItem, ScriptData, StoryboardScene, RenderJob } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(!options.body || typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Health & Stats
  getHealth: () => request<{ status: string; ffmpeg_available: boolean; ffmpeg_path?: string }>('/health'),
  getStats: () => request<DashboardStats>('/stats'),

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) => request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, {
    method: 'DELETE',
  }),
  loadSampleProject: () => request<Project>('/projects/sample/load', {
    method: 'POST',
  }),

  // Images
  uploadImages: async (projectId: string, files: File[]): Promise<ImageItem[]> => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return request<ImageItem[]>(`/projects/${projectId}/images`, {
      method: 'POST',
      body: formData,
    });
  },
  reorderImages: (projectId: string, imageIds: string[]) => request<ImageItem[]>(`/projects/${projectId}/images/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ image_ids: imageIds }),
  }),
  deleteImage: (projectId: string, imageId: string) => request<void>(`/projects/${projectId}/images/${imageId}`, {
    method: 'DELETE',
  }),

  // Script
  generateScript: (projectId: string, provider?: string) => request<ScriptData>(`/projects/${projectId}/generate-script${provider ? `?provider=${provider}` : ''}`, {
    method: 'POST',
  }),
  updateScript: (projectId: string, data: Partial<ScriptData>) => request<ScriptData>(`/projects/${projectId}/script`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Storyboard
  generateStoryboard: (projectId: string, duration: number = 20) => request<StoryboardScene[]>(`/projects/${projectId}/storyboard?duration=${duration}`, {
    method: 'POST',
  }),
  updateStoryboard: (projectId: string, scenes: StoryboardScene[]) => request<StoryboardScene[]>(`/projects/${projectId}/storyboard`, {
    method: 'PUT',
    body: JSON.stringify({ scenes }),
  }),

  // Render & Download
  startRender: (projectId: string, settings: {
    aspect_ratio: string;
    resolution: string;
    duration_preset: string;
    template: string;
    include_music: boolean;
    music_volume: number;
    include_narration: boolean;
  }) => request<RenderJob>(`/projects/${projectId}/render`, {
    method: 'POST',
    body: JSON.stringify(settings),
  }),
  getRenderStatus: (renderId: string) => request<RenderJob>(`/renders/${renderId}`),
  getDownloadUrl: (renderId: string) => `${API_BASE}/renders/${renderId}/download`,
};
