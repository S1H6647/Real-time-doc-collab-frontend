import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../api/services';
import { FileText, MoreVertical, Plus, Search, Calendar, User, Loader2, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function DocumentList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentApi.list().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: () => documentApi.create({ title: 'Untitled Document', content: '' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/documents/${data.data.id}`);
      toast.success('New document created');
    },
    onError: () => toast.error('Failed to create document'),
  });

  const filteredDocs = Array.isArray(documents) ? documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-medium">Loading your documents...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-2">
          <FileX className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Failed to load documents</h2>
        <p className="text-slate-400 max-w-sm">There was an error while trying to fetch your documents. Please try again later.</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
          className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Documents</h1>
          <p className="text-slate-400 mt-1 font-medium">Work together on your documents in real-time.</p>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          New Document
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all shadow-sm"
          placeholder="Search by title..."
        />
      </div>

      {filteredDocs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium">No documents found.</p>
          <button 
            onClick={() => createMutation.mutate()}
            className="text-blue-500 hover:underline mt-2 font-semibold"
          >
            Create your first document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocs?.map((doc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 hover:bg-slate-900 transition-all group relative cursor-pointer"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-500">
                  <FileText className="w-6 h-6" />
                </div>
                <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-100 mb-2 truncate group-hover:text-blue-500 transition-colors">
                {doc.title}
              </h2>
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed font-medium">
                {doc.description || 'No description provided for this document.'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800 font-medium">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{doc.ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
