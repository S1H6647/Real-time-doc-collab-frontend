import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { StompProvider } from '../../api/stompProvider';
import { useAuthStore } from '../auth/authStore';
import { useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Terminal,
} from 'lucide-react';

interface EditorProps {
  documentId: string;
  initialContent: string;
  onAutoSave: (content: string) => void;
  onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void;
}

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Editor({ documentId, initialContent, onAutoSave, onStatusChange }: EditorProps) {
  const { user, token } = useAuthStore();
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<StompProvider | null>(null);

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws';
    // Remove wss:// if we are using SockJS which usually starts with http/https
    const sockUrl = wsBase.replace('wss://', 'https://').replace('ws://', 'http://');
    
    const newProvider = new StompProvider(
      sockUrl, 
      documentId, 
      ydoc, 
      { 
        token,
        onStatusChange: (status: any) => onStatusChange?.(status) 
      }
    );

    setProvider(newProvider);

    return () => {
      newProvider.destroy();
      ydoc.destroy();
    };
  }, [documentId, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Collaboration handles history
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      ...(provider ? [
        CollaborationCursor.configure({
          provider,
          user: {
            name: user?.name || 'Anonymous',
            color: colors[Math.floor(Math.random() * colors.length)],
          },
        })
      ] : []),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      const content = editor.getHTML();
      // Yjs handles real-time sync, but we might want to trigger auto-save for database persistence
      onAutoSave(content);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-full text-slate-300 min-h-[calc(100vh-200px)] px-8 py-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl transition-all',
        placeholder: 'Start typing here...'
      },
    }
  }, [provider, user]);

  if (!editor) return null;

  const MenuBar = () => {
    return (
      <div className="sticky top-0 z-10 bg-slate-950/40 backdrop-blur-sm border-b border-slate-800 p-2 flex flex-wrap gap-1 justify-center max-w-4xl mx-auto rounded-b-2xl shadow-xl mb-8">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('strike') ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-800 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-800 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('orderedList') ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('codeBlock') ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Terminal className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-800 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-20"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-20"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-20 mt-4">
      <MenuBar />
      <EditorContent editor={editor} />
    </div>
  );
}
