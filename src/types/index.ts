export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export type DocumentRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface Document {
  id: string;
  title: string;
  content: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Collaborator {
  userId: string;
  userEmail: string;
  userName: string;
  role: DocumentRole;
}

export interface DocumentWithCollaborators extends Document {
  collaborators: Collaborator[];
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  editorId: string;
  editorName: string;
  contentSnapshot: string;
  editedAt: string;
  summary: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
