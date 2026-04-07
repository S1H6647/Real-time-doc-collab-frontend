import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collaboratorApi } from '../../api/services';
import type { Collaborator, DocumentRole } from '../../types';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Mail, 
  Trash2, 
  Loader2,
  UserPlus,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  collaborators: Collaborator[];
}

export default function CollaboratorsModal({ isOpen, onClose, documentId, collaborators }: CollaboratorsModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<DocumentRole>('EDITOR');

  const addMutation = useMutation({
    mutationFn: () => collaboratorApi.add(documentId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      setEmail('');
      toast.success('Collaborator added');
    },
    onError: () => toast.error('Failed to add collaborator'),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => collaboratorApi.remove(documentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      toast.success('Collaborator removed');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: DocumentRole }) => 
      collaboratorApi.update(documentId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      toast.success('Role updated');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Collaborators</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Collaborator Form */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">Invite People</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as DocumentRole)}
                className="bg-slate-850 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                disabled={!email || addMutation.isPending}
                onClick={() => addMutation.mutate()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {addMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">Current Collaborators</label>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {Array.isArray(collaborators) && collaborators.map((collaborator) => (
                <div key={collaborator.userId} className="flex items-center justify-between p-4 bg-slate-850/50 rounded-2xl border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                      {(collaborator.userName?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 leading-none">{collaborator.userName || 'Unknown User'}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{collaborator.userEmail || 'No email'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={collaborator.role}
                      onChange={(e) => updateRoleMutation.mutate({ userId: collaborator.userId, role: e.target.value as DocumentRole })}
                      disabled={collaborator.role === 'OWNER'}
                      className="bg-transparent text-xs font-bold text-slate-400 outline-none hover:text-blue-500 cursor-pointer disabled:cursor-default"
                    >
                      <option value="OWNER" disabled>Owner</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    
                    {collaborator.role !== 'OWNER' && (
                      <button 
                        onClick={() => removeMutation.mutate(collaborator.userId)}
                        className="p-1.5 text-slate-600 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
