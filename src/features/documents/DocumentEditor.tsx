import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { documentApi } from '../../api/services';
import { 
  ChevronLeft, 
  Users, 
  History as HistoryIcon, 
  Loader2, 
  Share2, 
  CloudOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import Editor from './Editor';
import CollaboratorsModal from './CollaboratorsModal';
import HistoryDrawer from './HistoryDrawer';
import { format } from 'date-fns';

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isCollabModalOpen, setCollabModalOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  const [presenceEmails, setPresenceEmails] = useState<string[]>([]);

  const { data: document, isLoading, isError } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.get(id!).then(res => res.data),
  });


  const updateTitleMutation = useMutation({
    mutationFn: (title: string) => documentApi.updateTitle(id!, title),
    onSuccess: () => {
      setLastSaved(new Date());
    },
    onError: () => {
      toast.error('Failed to update title');
    }
  });

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
              onBlur={(e) => updateTitleMutation.mutate(e.target.value)}
              className="bg-transparent border-none text-lg font-bold text-slate-100 focus:ring-0 outline-none w-full truncate hover:bg-slate-800/50 rounded px-2 -mx-2 transition-all cursor-text"
              placeholder="Document Title"
            />
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className={`flex items-center gap-1.5 ${status === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {status}
              </span>
              <span className="text-slate-400">
                {lastSaved ? `Last saved ${format(lastSaved, 'HH:mm:ss')}` : 'All changes saved'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4 overflow-hidden">
            {presenceEmails.map((email, i) => (
              <div 
                key={email}
                title={email}
                className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                style={{ zIndex: 10 - i }}
              >
                {email[0]}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setCollabModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all border border-slate-700"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Collaborators</span>
          </button>
          
          <button 
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all border border-slate-700"
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 relative bg-slate-950 p-8 pt-4">
        {status === 'disconnected' && (
          <div className="absolute top-6 right-6 z-10 bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold backdrop-blur-md">
            <CloudOff className="w-4 h-4" />
            Connection lost. Attempting to reconnect...
          </div>
        )}
        <Editor 
          documentId={id!} 
          initialContent={document.content} 
          onStatusChange={setStatus}
          onPresenceUpdate={setPresenceEmails}
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
