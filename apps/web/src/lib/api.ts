import type {
  ItemWithTags,
  Project,
  ProjectWithCount,
  DevLog,
  PaginatedResponse,
  ItemType,
  ItemStatus,
} from '@grovsnotes/shared';

// When running inside Tauri, window.__TAURI__ is defined (if configured) or we can check the user agent / protocol.
// A simpler way: Tauri intercepts localhost or tauri:// protocols.
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;
const BASE_URL = isTauri ? 'https://grovsnotes.duckdns.org/api' : '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  items: {
    create(data: { title: string; content?: string; type?: ItemType; projectId?: string }) {
      return request<ItemWithTags>('/items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    list(params?: {
      type?: ItemType;
      status?: ItemStatus;
      project?: string;
      tag?: string;
      limit?: number;
      cursor?: string;
    }) {
      const search = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) search.set(key, String(value));
        });
      }
      const qs = search.toString();
      return request<PaginatedResponse<ItemWithTags>>(`/items${qs ? `?${qs}` : ''}`);
    },
    get(id: string) {
      return request<ItemWithTags>(`/items/${id}`);
    },
    update(id: string, data: Partial<{ title: string; content: string; type: ItemType; status: ItemStatus; projectId: string | null }>) {
      return request<ItemWithTags>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete(id: string) {
      return request<void>(`/items/${id}`, { method: 'DELETE' });
    },
  },
  projects: {
    list() {
      return request<ProjectWithCount[]>('/projects');
    },
    create(data: { name: string; color?: string; icon?: string }) {
      return request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });
    },
    update(id: string, data: Partial<{ name: string; color: string; icon: string }>) {
      return request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete(id: string) {
      return request<void>(`/projects/${id}`, { method: 'DELETE' });
    },
  },
  devLogs: {
    list(params?: { repo?: string; branch?: string; from?: string; to?: string; limit?: number; cursor?: string }) {
      const search = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) search.set(key, String(value));
        });
      }
      const qs = search.toString();
      return request<PaginatedResponse<DevLog>>(`/dev-logs${qs ? `?${qs}` : ''}`);
    },
  },
  search(q: string) {
    return request<{ items: ItemWithTags[]; devLogs: DevLog[] }>(`/search?q=${encodeURIComponent(q)}`);
  },
};
