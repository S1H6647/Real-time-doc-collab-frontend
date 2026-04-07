import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../../api/services';
import { format } from 'date-fns';
import { 
  X, 
  History as HistoryIcon,
  Clock,
  RotateCcw,
  Loader2,
  FileClock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export default function HistoryDrawer({ isOpen, onClose, documentId }: HistoryDrawerProps) {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['document-history', documentId],
    queryFn: () => documentApi.getHistory(documentId).then(res => res.data),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto" 
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-y-0 right-0 w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-3xl pointer-events-auto"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                <HistoryIcon className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">History</h2>
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Edit Timeline</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest">Fetching timeline...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileClock className="w-6 h-6 text-rose-500" />
                </div>
                <p className="text-slate-400 font-medium">Failed to load history</p>
              </div>
            ) : (!history?.entries || history.entries.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <HistoryIcon className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium">No history found</p>
              </div>
            ) : (
              <div className="relative space-y-6">
                <div className="absolute left-4 top-2 bottom-0 w-px bg-slate-800" />
                
  {history.entries.map((item: any) => (
                  <div key={item.id} className="relative pl-10 group">
                    <div className="absolute left-1.5 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-4 border-slate-800 group-hover:border-violet-600 transition-all z-10" />
                    
                    <div className="bg-slate-850/50 p-4 rounded-3xl border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all group-hover:shadow-[0_10px_20px_-10px_rgba(139,92,246,0.3)]">
                      <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-700">
                             {item.editorName[0].toUpperCase()}
                           </div>
                           <span className="text-sm font-bold text-slate-200">{item.editorName}</span>
                         </div>
                         <button className="p-1.5 text-slate-600 hover:text-violet-500 rounded-lg hover:bg-violet-600/10 transition-all" title="Restore this version">
                           <RotateCcw className="w-4 h-4" />
                         </button>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-medium leading-relaxed italic mb-3">"{item.summary}"</p>
                      
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(item.editedAt), 'MMM d, HH:mm:ss')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-800 bg-slate-900/50">
            <button className="w-full py-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold rounded-2xl transition-all border border-slate-750 flex items-center justify-center gap-2">
              <HistoryIcon className="w-5 h-5" />
              View Full Timeline
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
