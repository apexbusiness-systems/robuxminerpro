import { useState, useEffect } from 'react';

export default function Mentor() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chat-transcript');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  const handleSafety = (message: string): string | null => {
    const lowerMsg = message.toLowerCase();
    const forbidden = [
      /\bfree\s+robux\b/i,
      /\brobux[\W_]*generator\b/i,
      /\brobux[\W_]*min(e|ing)\b/i,
      /\bfree\s+membership\b/i,
      /\bhack/i,
      /\bcheat/i
    ];
    
    if (forbidden.some(pattern => pattern.test(lowerMsg))) {
      return "We only teach official ways to get Robux. Learn more at help.roblox.com.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    
    try {
      const response = await fetch('https://huaxdvjartkzlgjlzwzg.supabase.co/functions/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to get AI response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const finalMessages = [...messages, userMsg, { role: 'assistant' as const, content: assistantContent }];
      localStorage.setItem('chat-transcript', JSON.stringify(finalMessages));
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}