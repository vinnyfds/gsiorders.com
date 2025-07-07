import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface ChatWidgetProps {
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help you with any questions about our products. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: 'gsiorders',
          pageContext: 'chat-widget',
          userQuestion: inputText
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let botResponse = '';
      const botMessageId = (Date.now() + 1).toString();
      
      // Add initial bot message
      setMessages(prev => [...prev, {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date()
      }]);

      let isJson = false;
      // Stream the response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        botResponse += chunk;
      }
      // Try to parse as JSON and extract 'response' field
      let displayText = botResponse;
      try {
        const parsed = JSON.parse(botResponse);
        if (parsed && typeof parsed.response === 'string') {
          displayText = parsed.response;
          isJson = true;
        }
      } catch {}
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, text: displayText }
          : msg
      ));

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-white border-2 border-brand-primary rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-primary bg-brand-primary text-white rounded-t-2xl">
          <span className="font-semibold">AI Chat Support</span>
          <button onClick={onClose} aria-label="Close chat" className="text-white hover:text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-full p-1">
            <X size={20} />
          </button>
        </div>
        {/* Messages */}
        <div className="flex flex-col gap-2 p-4 max-h-96 overflow-y-auto bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.sender === 'user'
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }
            >
              <div
                className={
                  msg.sender === 'user'
                    ? 'max-w-xs bg-brand-accent/10 text-brand-primary rounded-xl px-4 py-2 shadow-sm self-end'
                    : 'max-w-xs bg-white text-gray-900 rounded-xl px-4 py-2 shadow-sm self-start border border-gray-200'
                }
                aria-label={msg.sender === 'user' ? 'Your message' : 'AI reply'}
              >
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              disabled={isLoading}
              data-testid="chat-input"
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="chat-send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 