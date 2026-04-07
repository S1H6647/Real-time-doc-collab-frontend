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
  userId: string;
  userName: string;
  contentSnapshot: string;
  timestamp: string;
  changeDescription: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
