import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      className="fixed bottom-6 left-6 z-40 w-11 h-11 bg-white hover:bg-slate-100 text-[#104A96] rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#104A96] floating-actions"
      aria-label="Scroll back to top"
    >
      <ChevronUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
};
