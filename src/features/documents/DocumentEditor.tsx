import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, collaboratorApi } from '../../api/services';
import { 
  ChevronLeft, 
  Save, 
  Users, 
  History as HistoryIcon, 
  Loader2, 
  Share2, 
  Trash2, 
  MoreVertical,
  CheckCircle2,
  CloudOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Editor from './Editor';
import CollaboratorsModal from './CollaboratorsModal';
import HistoryDrawer from './HistoryDrawer';
import { useAuthStore } from '../auth/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [isCollabModalOpen, setCollabModalOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  const { data: document, isLoading, isError } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.get(id!).then(res => res.data),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => documentApi.update(id!, data),
    onSuccess: () => {
      setLastSaved(new Date());
      setSaving(false);
    },
    onError: () => {
      toast.error('Failed to save changes');
      setSaving(false);
    }
  });

  const handleAutoSave = (content: string) => {
    setSaving(true);
    updateMutation.mutate({ content });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-medium">Loading document...</p>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <h2 className="text-2xl font-bold text-slate-200">Document not found</h2>
        <p className="text-slate-400">The document you are looking for does not exist or you do not have permission to view it.</p>
        <button 
          onClick={() => navigate('/documents')}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const isOwner = document.ownerId === user?.id;

  return (
    <div className="h-full flex flex-col -m-8">
      {/* Editor Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <button 
            onClick={() => navigate('/documents')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0 pr-4">
            <input
              defaultValue={document.title}
              onBlur={(e) => updateMutation.mutate({ title: e.target.value })}
              className="bg-transparent border-none text-lg font-bold text-slate-100 focus:ring-0 outline-none w-full truncate hover:bg-slate-800/50 rounded px-2 -mx-2 transition-all cursor-text"
              placeholder="Document Title"
            />
            <div className="flex items-center gap-2 mt-0.5">
               <div className="flex items-center gap-1.5 transition-all">
                  {connectionStatus === 'connected' ? (
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      Live
                    </div>
                  ) : connectionStatus === 'connecting' ? (
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <CloudOff className="w-2.5 h-2.5" />
                      Offline
                    </div>
                  )}
               </div>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-2">
                 {isSaving ? 'Saving...' : lastSaved ? `Saved ${format(lastSaved, 'HH:mm')}` : 'Ready'}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setCollabModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Collaborators</span>
          </button>
          
          <button 
            onClick={() => setHistoryOpen(true)}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
            title="History"
          >
            <HistoryIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>

          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Editor Content Area */}
      <div className="flex-1 relative bg-slate-900/30 overflow-hidden">
        <Editor 
          documentId={id!} 
          initialContent={document.content} 
          onAutoSave={handleAutoSave}
          onStatusChange={setConnectionStatus}
        />
      </div>

      <CollaboratorsModal 
        isOpen={isCollabModalOpen} 
        onClose={() => setCollabModalOpen(false)} 
        documentId={id!}
        collaborators={document.collaborators}
      />
      
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setHistoryOpen(false)} 
        documentId={id!}
      />
    </div>
  );
}
