import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import ChatWidget from './ChatWidget';

export default function ChatTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-white text-brand-primary border-2 border-brand-primary p-4 rounded-full shadow-lg hover:bg-brand-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200 hover:scale-110"
        aria-label="Open chat support"
        data-testid="chat-trigger"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Widget Modal */}
      {open && (
        <ChatWidget 
          onClose={() => setOpen(false)}
          data-testid="chat-widget"
        />
      )}
    </>
  );
} 