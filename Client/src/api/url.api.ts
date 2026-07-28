import api from './auth.api';

export interface UrlItem {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUrls {
  data: UrlItem[];
  total: number;
  totalClicks: number;
  activeDomains: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const urlApi = {
  shorten: (originalUrl: string, customCode?: string) =>
    api.post<UrlItem>('/url/shorten', { originalUrl, customCode }),

  getMyUrls: (page: number, limit: number, search?: string) =>
    api.get<PaginatedUrls>('/url', {
      params: { page, limit, search: search || undefined },
    }),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/url/${id}`),
};
