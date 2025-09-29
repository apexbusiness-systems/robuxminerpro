import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ChatDockProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDock({ isOpen, onClose }: ChatDockProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const dialogRef = useFocusTrap(isOpen);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSafety = (message: string): string | null => {
    const forbidden = ['free robux', 'robux generator', 'free membership', 'hack', 'cheat'];
    if (forbidden.some(term => message.toLowerCase().includes(term))) {
      return "I can't help with that. For legitimate Robux information, visit https://roblox.com/support";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const safetyCheck = handleSafety(input);
    if (safetyCheck) {
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'assistant', content: safetyCheck }
      ]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, 
      { role: 'user', content: input },
      { role: 'assistant', content: 'I can help you with legitimate strategies and tips for RobuxMinerPro.' }
    ]);
    setInput('');

    // Store transcript locally
    localStorage.setItem('chat-transcript', JSON.stringify(messages));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4">
      <div 
        ref={dialogRef}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="chat-title"
        className="chat-widget border rounded-lg w-96 h-96 flex flex-col shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="chat-title" className="font-semibold">AI Strategy Assistant</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'primary-button ml-8' : 'bg-muted mr-8'}`}>
              {msg.content}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me for safe Robux tips."
              className="flex-1 px-3 py-2 border rounded bg-input text-foreground"
              aria-label="Chat message input"
            />
            <Button type="submit" className="primary-button">Send</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}