import React from 'react';
import { MessageSquare } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <aside 
      aria-label="Contact options"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 floating-actions"
    >
      <a
        href="https://wa.me/919876543210?text=Hi%20Apply365,%20I%20need%20assistance%20with%20documentation%20services"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        title="Chat with Apply365 documentation advisor"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-1">
          Chat with Us
        </span>
        <MessageSquare className="w-5 h-5 fill-white/20" />
      </a>
    </aside>
  );
};
