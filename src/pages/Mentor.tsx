import { useState, useEffect } from 'react';

export default function Mentor() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Load transcript from IndexedDB/localStorage
    const saved = localStorage.getItem('chat-transcript');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  const handleSafety = (message: string): string | null => {
    const forbidden = ['free robux', 'robux generator', 'free membership', 'hack', 'cheat', 'generator'];
    if (forbidden.some(term => message.toLowerCase().includes(term))) {
      return "I can't help with that. For legitimate Robux information, visit https://roblox.com/support. Remember, Roblox has stated that 'free Robux or membership generators' are scams.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const safetyCheck = handleSafety(input);
    if (safetyCheck) {
      const newMessages = [...messages, 
        { role: 'user' as const, content: input },
        { role: 'assistant' as const, content: safetyCheck }
      ];
      setMessages(newMessages);
      localStorage.setItem('chat-transcript', JSON.stringify(newMessages));
      setInput('');
      return;
    }

    const newMessages = [...messages, 
      { role: 'user' as const, content: input },
      { role: 'assistant' as const, content: 'I can help you with legitimate strategies and tips for RobuxMinerPro. What would you like to know about optimizing your mining sessions?' }
    ];
    setMessages(newMessages);
    localStorage.setItem('chat-transcript', JSON.stringify(newMessages));
    setInput('');
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Strategy Assistant</h1>
      
      <div className="bg-card border rounded-lg h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-muted-foreground text-center py-8">
              Ask me about legitimate strategies for RobuxMinerPro!
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-16' : 'bg-muted mr-16'}`}>
              <div className="font-medium mb-1">{msg.role === 'user' ? 'You' : 'AI Assistant'}</div>
              {msg.content}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 border-t">
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about strategies, tips, or optimization..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}