import apiClient from '../api/apiClient';
import type { Document, DocumentWithCollaborators, User, Notification, PaginatedResponse } from '../types';

// Auth API
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  // me endpoint is missing in backend, but we can potentially use a profile endpoint if added later
};

// Documents API
export const documentApi = {
  list: (params?: any) => apiClient.get<Document[]>('/documents', { params }),
  get: (id: string) => apiClient.get<DocumentWithCollaborators>(`/documents/${id}`),
  create: (data: { title: string, content?: string }) => apiClient.post<Document>('/documents', data),
  updateTitle: (id: string, title: string) => apiClient.patch(`/documents/${id}`, { title }),
  editContent: (id: string, content: string) => apiClient.patch(`/documents/${id}/content`, { content }),
  save: (id: string, data: { title?: string, content?: string }) => apiClient.put<Document>(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
  getHistory: (id: string) => apiClient.get<any>(`/documents/${id}/history`),
};

// Collaborator API
export const collaboratorApi = {
  list: (docId: string) => apiClient.get(`/documents/${docId}/collaborators`),
  add: (docId: string, email: string, role: string) => 
    apiClient.post(`/documents/${docId}/collaborators`, { email, role }),
  update: (docId: string, userId: string, role: string) => 
    apiClient.patch(`/documents/${docId}/collaborators/${userId}/role`, { role }),
  remove: (docId: string, userId: string) => 
    apiClient.delete(`/documents/${docId}/collaborators/${userId}`),
};

// Notifications API
export const notificationApi = {
  list: (page = 0, size = 20) => apiClient.get<PaginatedResponse<Notification>>('/notifications', { params: { page, size } }),
  getUnreadCount: () => apiClient.get<{ unread: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

// Admin API
export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  listUsers: () => apiClient.get<User[]>('/admin/users'),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
};

