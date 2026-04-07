import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { toast } from 'react-hot-toast';

export class StompProvider {
  private url: string;
  private documentId: string;
  private ydoc: Y.Doc;
  private token: string | null;
  private client: Stomp.Client | null = null;
  private destroyed = false;
  private retryCount = 0;
  private readonly maxRetries = 5;
  public awareness: awarenessProtocol.Awareness;
  private onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void;

  constructor(url: string, documentId: string, ydoc: Y.Doc, options: { token?: string | null, onStatusChange: (status: any) => void }) {
    this.url = url;
    this.documentId = documentId;
    this.ydoc = ydoc;
    this.token = options.token || null;
    this.awareness = new awarenessProtocol.Awareness(ydoc);
    this.onStatusChange = options.onStatusChange;

    this.connect();

    // Listen for local changes to the doc and send them to the backend
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        this.sendUpdate(update);
      }
    });

    // Handle awareness updates
    this.awareness.on('update', ({ added, updated, removed }: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const update = awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients);
      this.sendAwareness(update);
    });
  }

  private connect() {
    this.onStatusChange('connecting');
    const wsUrlWithToken = `${this.url}?token=${this.token || ''}`;
    const socket = new SockJS(wsUrlWithToken);
    this.client = Stomp.over(socket);
    this.client.debug = () => {}; // Disable console logging

    this.client.connect({}, 
      () => {
        this.onStatusChange('connected');
        this.retryCount = 0; // Reset retry count upon successful connection
        
        // Subscribe to document updates
        this.client?.subscribe(`/topic/documents/${this.documentId}`, (message) => {
          const update = Uint8Array.from(JSON.parse(message.body));
          Y.applyUpdate(this.ydoc, update, this);
        });

        // Subscribe to awareness updates
        this.client?.subscribe(`/topic/documents/${this.documentId}/awareness`, (message) => {
          const update = Uint8Array.from(JSON.parse(message.body));
          awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);
        });
      }, 
      (error) => {
        if (this.destroyed) return;
        console.error('STOMP Connection error:', error);
        this.onStatusChange('disconnected');

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          const delay = Math.pow(2, this.retryCount) * 1000;
          console.log(`Reconnecting in ${delay/1000}s (Attempt ${this.retryCount}/${this.maxRetries})`);
          
          setTimeout(() => {
            if (!this.destroyed) this.connect();
          }, delay);
        } else {
          console.error('Max STOMP connection retries reached. Stopping.');
          toast.error('Connection to server lost. Please refresh the page.');
        }
      }
    );
  }

  private sendUpdate(update: Uint8Array) {
    if (this.client?.connected) {
      this.client.send(
        `/app/documents/${this.documentId}/update`, 
        {}, 
        JSON.stringify(Array.from(update))
      );
    }
  }

  private sendAwareness(update: Uint8Array) {
    if (this.client?.connected) {
      this.client.send(
        `/app/documents/${this.documentId}/awareness`, 
        {}, 
        JSON.stringify(Array.from(update))
      );
    }
  }

  public destroy() {
    this.destroyed = true;
    if (this.client && this.client.connected) {
      try {
        this.client.disconnect(() => {
          this.onStatusChange('disconnected');
        });
      } catch (e) {
        console.warn('STOMP disconnect error:', e);
      }
    }
    this.awareness.destroy();
  }
}
