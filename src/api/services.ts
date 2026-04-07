import apiClient from '../api/apiClient';
import type { Document, DocumentWithCollaborators, User, DocumentHistory, Notification } from '../types';

// Auth API
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  me: () => apiClient.get<User>('/auth/me'),
};

// Documents API
export const documentApi = {
  list: (params?: any) => apiClient.get<Document[]>('/documents', { params }),
  get: (id: string) => apiClient.get<DocumentWithCollaborators>(`/documents/${id}`),
  create: (data: Partial<Document>) => apiClient.post<Document>('/documents', data),
  update: (id: string, data: Partial<Document>) => apiClient.put<Document>(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
  archive: (id: string) => apiClient.post(`/documents/${id}/archive`),
  getHistory: (id: string) => apiClient.get<DocumentHistory[]>(`/documents/${id}/history`),
};

// Collaborator API
export const collaboratorApi = {
  add: (docId: string, email: string, role: string) => 
    apiClient.post(`/documents/${docId}/collaborators`, { email, role }),
  update: (docId: string, userId: string, role: string) => 
    apiClient.put(`/documents/${docId}/collaborators/${userId}`, { role }),
  remove: (docId: string, userId: string) => 
    apiClient.delete(`/documents/${docId}/collaborators/${userId}`),
};

// Notifications API
export const notificationApi = {
  list: () => apiClient.get<Notification[]>('/notifications'),
  markAsRead: (id: string) => apiClient.post(`/notifications/${id}/read`),
};

// Admin API
export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  listUsers: () => apiClient.get<User[]>('/admin/users'),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
};
