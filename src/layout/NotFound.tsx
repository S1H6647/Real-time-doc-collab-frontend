import { Link } from 'react-router-dom';
import { FileQuestion, LayoutDashboard, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 blur-[100px] pointer-events-none">
        <div className="w-[800px] h-[800px] bg-blue-600 rounded-full animate-pulse transition-all"></div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative mb-12 inline-block"
        >
          <div className="p-8 bg-blue-600 rounded-[3rem] shadow-[0_20px_80px_-20px_rgba(37,99,235,0.6)] relative z-20">
            <FileQuestion className="w-24 h-24 text-white" />
          </div>
          <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-[4rem] z-10"></div>
          <div className="absolute -top-12 -right-12 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl rotate-12">
             <span className="text-4xl font-black text-rose-500 italic">404</span>
          </div>
        </motion.div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight mb-6 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent uppercase italic">
          Lost in Space?
        </h1>
        
        <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-md mx-auto italic">
           The page you are looking for has been archived, moved, or simply never existed in this dimension.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link
             to="/"
             className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
           >
             <LayoutDashboard className="w-5 h-5" />
             Go Home
           </Link>
           <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-black rounded-2xl transition-all border border-slate-800 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm italic group">
             <Search className="group-hover:scale-125 transition-transform w-5 h-5" />
             Find Page
           </button>
        </div>
        
        <div className="mt-20 pt-10 border-t border-slate-900 flex flex-wrap justify-center gap-8 text-slate-600 text-xs font-black uppercase tracking-widest">
            <span className="hover:text-blue-500 transition-colors cursor-pointer italic">Help Desk</span>
            <span className="hover:text-blue-500 transition-colors cursor-pointer italic">Status Page</span>
            <span className="hover:text-blue-500 transition-colors cursor-pointer italic">Contact Admin</span>
        </div>
      </div>
    </div>
  );
}
