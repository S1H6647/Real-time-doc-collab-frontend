import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import {
  FileText,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notificationApi } from '../api/services';
import { format } from 'date-fns';

export default function AppLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNotifyOpen, setNotifyOpen] = useState(false);

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list().then(res => res.data),
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationApi.getUnreadCount().then(res => res.data),
    refetchInterval: 30000,
  });

  const notifications = notificationData?.content || [];
  const unreadCount = unreadData?.unread || 0;

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      // Invalidate queries to refresh UI
    }
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { label: 'Documents', path: '/documents', icon: FileText },
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin', path: '/admin', icon: LayoutDashboard }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic">C</div>
                <span className="font-bold text-xl tracking-tight">Collab</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <span className="text-sm font-bold text-slate-400 uppercase">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="hidden sm:flex relative items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                placeholder="Search..."
                className="bg-slate-800/50 border border-slate-700 rounded-full py-1.5 pl-9 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotifyOpen(!isNotifyOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white border-2 border-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-slate-200">Notifications</h3>
                      <button 
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-blue-500 hover:underline font-bold uppercase tracking-widest disabled:opacity-50"
                        disabled={unreadCount === 0}
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 italic text-sm">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-4 hover:bg-slate-850/50 border-b border-slate-800/50 cursor-pointer group transition-all">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-800 text-slate-500' : 'bg-blue-600/10 text-blue-500'}`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${n.read ? 'text-slate-500' : 'text-slate-200 font-medium'}`}>{n.message}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-bold">{format(new Date(n.createdAt), 'MMM d, HH:mm')}</p>
                              </div>
                              {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full self-center"></div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg group">
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
