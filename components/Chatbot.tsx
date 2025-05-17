'use client';

import { useState } from 'react';
import { BotIcon, SendHorizonal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I’m your assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([...newMessages, data.reply]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Could not reach the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 z-50 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <X /> : <BotIcon />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 w-[320px] h-[420px] bg-white rounded-xl shadow-xl border flex flex-col z-50">
          <div className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-t-xl">
            Smart Bot
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] p-2 rounded-md ${
                  msg.role === 'user' ? 'ml-auto bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="text-xs text-gray-500">Thinking...</div>}
          </div>
          <div className="p-2 border-t flex items-center gap-2">
            <input
              className="flex-1 text-sm border px-2 py-1 rounded-md"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button size="icon" onClick={sendMessage} disabled={loading}>
              <SendHorizonal size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
