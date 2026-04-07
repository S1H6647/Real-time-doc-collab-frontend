import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { StompProvider, DocumentEditEvent, PresenceEvent } from '../../api/stompProvider';
import { useAuthStore } from '../auth/authStore';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void;
  onPresenceUpdate?: (emails: string[]) => void;
}

export default function Editor({ documentId, initialContent, onStatusChange, onPresenceUpdate }: EditorProps) {
  const { token, user } = useAuthStore();
  const [provider, setProvider] = useState<StompProvider | null>(null);
  
  // Use a ref for the editor to avoid dependency cycles
  const editorRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: initialContent,
    onUpdate({ editor }) {
      const content = editor.getHTML();
      if (provider) {
        provider.sendEdit(content);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-full text-slate-300 min-h-[calc(100vh-200px)] px-8 py-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl transition-all',
        placeholder: 'Start typing here...'
      },
    }
  }, [provider]);

  // Keep editorRef in sync
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const handleEditReceived = useCallback((event: DocumentEditEvent) => {
    // Use email for deduplication (always a plain string, not UUID)
    if (event.editorEmail === user?.email) return;
    
    const currentEditor = editorRef.current;
    if (!currentEditor) return;

    const currentHTML = currentEditor.getHTML();
    if (currentHTML !== event.content) {
      currentEditor.commands.setContent(event.content, false);
    }
  }, [user?.email]);

  // Stable callbacks for the provider
  const callbacksRef = useRef({ onStatusChange, onPresenceUpdate, handleEditReceived });
  useEffect(() => {
    callbacksRef.current = { onStatusChange, onPresenceUpdate, handleEditReceived };
  });

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws';
    const sockUrl = wsBase.replace('wss://', 'https://').replace('ws://', 'http://');
    
    const newProvider = new StompProvider(
      sockUrl, 
      documentId, 
      { 
        token,
        onStatusChange: (status) => callbacksRef.current.onStatusChange?.(status),
        onEditReceived: (event) => callbacksRef.current.handleEditReceived(event),
        onPresenceUpdate: (event: PresenceEvent) => {
           callbacksRef.current.onPresenceUpdate?.(event.activeEditors);
        }
      }
    );

    setProvider(newProvider);

    return () => {
      newProvider.destroy();
    };
  }, [documentId, token]); // Stable dependencies

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
