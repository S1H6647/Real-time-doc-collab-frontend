import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  UserPlus, 
  Loader2, 
  ShieldCheck,
  UserX,
  Zap,
  Activity,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers().then(res => res.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-medium">Crunching admin data...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Today', value: stats?.activeToday || '0', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Documents Created', value: stats?.totalDocs || '0', icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Collaboration Events', value: stats?.eventsToday || '0', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight flex items-center gap-3">
            Admin Console <ShieldCheck className="w-8 h-8 text-blue-500" />
          </h1>
          <p className="text-slate-400 mt-1 font-medium italic">Manage platform resources and user access controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-950/20 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-100 mt-1.5">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-200">User Management</h2>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold py-2.5 px-6 rounded-xl transition-all border border-slate-700 active:scale-95">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left uppercase tracking-tighter">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 absolute opacity-0 -z-50">{/* accessibility spacer */}</tr>
              <tr className="bg-slate-950/30">
                <th className="px-8 py-6 text-sm font-black text-slate-500 tracking-widest">User Details</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 tracking-widest">Role Type</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 tracking-widest">Status</th>
                <th className="px-8 py-6 text-sm font-black text-slate-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {Array.isArray(users) && users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 border-2 border-slate-700 rounded-2xl flex items-center justify-center font-bold text-slate-400 text-lg shadow-inner group-hover:border-blue-600 transition-colors">
                        {(u.firstName?.[0] || '')}{(u.lastName?.[0] || '')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-200 tracking-tight">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-slate-500 font-semibold lowercase tracking-normal">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                     <span className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Active
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700">
                        <Shield className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(u.id)}
                        className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
