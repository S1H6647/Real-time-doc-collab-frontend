import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold italic">C</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-50 text-center mb-2">{title}</h1>
          <p className="text-slate-400 text-center mb-8">Collaborate in real-time, everywhere.</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
