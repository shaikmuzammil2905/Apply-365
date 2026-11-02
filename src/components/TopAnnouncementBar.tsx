import React from 'react';
import { Megaphone, Sparkles, PhoneCall, ArrowRight } from 'lucide-react';
import { useWebsiteSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';

export const TopAnnouncementBar: React.FC = () => {
  const { settings } = useWebsiteSettings();

  const phone = settings.phone || '+91 91219 92365';
  const tagline = settings.tagline || 'Fast, Secure & Verified Statutory Assistance Across India';

  const tickerItems = [
    `🇮🇳 Official Portal Updates: ${tagline}`,
    '📢 Aadhaar Card: Instant Guidance for Address Updates, Biometric Booking & UIDAI Seva Kendras',
    '💳 PAN Card: Fresh Application, Minor to Major & Correction Filing Assistance (NSDL / UTI)',
    '🏛️ MSME Udyam Registration: Government Certificate Support for Micro, Small & Medium Businesses',
    '⚖️ Labour License: Commercial Shop & Establishment Registration Documentation',
    '📑 EPFO / UAN: Member KYC Verification, Passbook & PF Withdrawal Claim Assistance',
    '🛡️ 100% Verified Statutory Assistance | Dedicated Case Executives',
    `📞 Need Help? Call Our Direct Helpline: ${phone}`,
    '💬 24x7 WhatsApp Helpdesk Available'
  ];

  return (
    <div className="relative bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#0A3D78] text-white text-[11px] sm:text-xs font-medium overflow-hidden border-b border-indigo-400/20 shadow-xs z-50 select-none">
      <div className="max-w-7xl mx-auto flex items-center h-8 sm:h-9">
        
        {/* Left Fixed Badge */}
        <div className="relative z-10 flex items-center gap-1.5 px-3 sm:px-4 h-full bg-[#3B1578] shadow-md shrink-0 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] border-r border-indigo-400/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span className="text-white hidden xs:inline">Updates</span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="flex-1 overflow-hidden relative flex items-center h-full">
          {/* Gradient fade edge left */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#4C1D95] to-transparent z-10 pointer-events-none" />

          {/* Marquee Content repeated twice for infinite seamless loop */}
          <div className="animate-ticker-marquee flex items-center whitespace-nowrap">
            <div className="flex items-center gap-8 px-4">
              {tickerItems.map((item, index) => (
                <span key={`a-${index}`} className="flex items-center gap-3 text-slate-100 hover:text-amber-200 transition-colors">
                  <span>{item}</span>
                  <span className="text-indigo-300/60 font-bold">•</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-8 px-4" aria-hidden="true">
              {tickerItems.map((item, index) => (
                <span key={`b-${index}`} className="flex items-center gap-3 text-slate-100 hover:text-amber-200 transition-colors">
                  <span>{item}</span>
                  <span className="text-indigo-300/60 font-bold">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Gradient fade edge right */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A3D78] to-transparent z-10 pointer-events-none" />
        </div>

        {/* Right CTA Button (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex items-center gap-2 px-3 h-full bg-[#083060] border-l border-indigo-400/30 shrink-0">
          <Link 
            to="/services" 
            className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition-colors"
          >
            <span>Explore Services</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  );
};
