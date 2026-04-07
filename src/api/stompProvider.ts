import { Client, IFrame } from '@stomp/stompjs';
import { toast } from 'react-hot-toast';

export interface PresenceEvent {
  documentId: number;
  userId: string;
  email: string;
  type: 'JOINED' | 'LEFT';
  activeEditors: string[];
}

export interface DocumentEditEvent {
  documentId: number;
  editorId: string;
  editorEmail: string;
  content: string;
}

export class StompProvider {
  private url: string;
  private documentId: string;
  private token: string | null;
  private client: Client | null = null;
  private destroyed = false;
  private retryCount = 0;
  private readonly maxRetries = 5;

  private onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void;
  private onEditReceived?: (event: DocumentEditEvent) => void;
  private onPresenceUpdate?: (event: PresenceEvent) => void;

  constructor(url: string, documentId: string, options: { 
    token?: string | null, 
    onStatusChange: (status: any) => void,
    onEditReceived?: (event: DocumentEditEvent) => void,
    onPresenceUpdate?: (event: PresenceEvent) => void
  }) {
    this.url = url;
    this.documentId = documentId;
    this.token = options.token || null;
    this.onStatusChange = options.onStatusChange;
    this.onEditReceived = options.onEditReceived;
    this.onPresenceUpdate = options.onPresenceUpdate;

    this.connect();
  }

  private connect() {
    this.onStatusChange('connecting');

    const wsUrl = this.url.startsWith('http')
      ? this.url.replace(/^http/, 'ws').replace(/^https/, 'wss')
      : this.url;

    this.client = new Client({
      webSocketFactory: () => new WebSocket(`${wsUrl}?token=${this.token || ''}`),
      debug: (msg) => console.log(msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,

      onConnect: () => {
        this.onStatusChange('connected');
        this.retryCount = 0;

        // Join the document
        this.client?.publish({
          destination: '/app/document.join',
          body: JSON.stringify({ documentId: parseInt(this.documentId) })
        });

        // Subscribe to edits
        this.client?.subscribe(`/topic/document.${this.documentId}.edits`, (message) => {
          const event: DocumentEditEvent = JSON.parse(message.body);
          this.onEditReceived?.(event);
        });

        // Subscribe to presence
        this.client?.subscribe(`/topic/document.${this.documentId}.presence`, (message) => {
          const event: PresenceEvent = JSON.parse(message.body);
          this.onPresenceUpdate?.(event);
        });
      },

      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame.headers['message']);
      },

      onWebSocketClose: () => {
        if (this.destroyed) return;
        this.onStatusChange('disconnected');
        
        if (this.retryCount >= this.maxRetries) {
          toast.error('Connection to server lost. Please refresh the page.');
          this.client?.deactivate();
        } else {
          this.retryCount++;
        }
      },
    });

    this.client.activate();
  }

  public sendEdit(content: string) {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/document.edit',
        body: JSON.stringify({ 
          documentId: parseInt(this.documentId),
          content 
        }),
      });
    }
  }

  public leave() {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/document.leave',
        body: JSON.stringify({ documentId: parseInt(this.documentId) })
      });
    }
  }

  public destroy() {
    this.destroyed = true;
    this.leave();
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.warn('STOMP disconnect error:', e);
      }
    }
  }
}

