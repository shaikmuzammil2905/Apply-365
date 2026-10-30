import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07366F] text-slate-200 pt-16 pb-12 border-t-4 border-[#FF8500]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-blue-900/60">
          
          {/* Brand & Introduction (4 cols) - Clean transparent logo, zero patchwork */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block transition-transform duration-200 hover:scale-[1.02]">
              <img 
                src="/apply365_logo_white.png" 
                alt="Apply365 — Services for People" 
                className="h-11 sm:h-12 w-auto object-contain filter drop-shadow"
              />
            </Link>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Apply365</strong> — Services for People. We provide fast, dependable, and hassle-free document preparation, verification, and procedural guidance for essential Indian civic and commercial documentation.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-xs bg-white/10 text-blue-200 px-3 py-1 rounded-full border border-white/10">
                100% Confidential
              </span>
              <span className="text-xs bg-white/10 text-blue-200 px-3 py-1 rounded-full border border-white/10">
                Transparent Guidance
              </span>
              <span className="text-xs bg-white/10 text-blue-200 px-3 py-1 rounded-full border border-white/10">
                People-First Service
              </span>
            </div>
          </div>

          {/* All Seven Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-[#FF8500]">
              Our Documentation Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/aadhaar" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>Aadhaar Card Update</span>
                </Link>
              </li>
              <li>
                <Link to="/services/pan-card" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>New PAN & Correction</span>
                </Link>
              </li>
              <li>
                <Link to="/services/voter-id" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>Voter ID Card Enrolment</span>
                </Link>
              </li>
              <li>
                <Link to="/services/msme" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>MSME / Udyam Registration</span>
                </Link>
              </li>
              <li>
                <Link to="/services/labour-license" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>Labour License (Shops & Est.)</span>
                </Link>
              </li>
              <li>
                <Link to="/services/uan-pf" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>UAN / PF KYC & Claims</span>
                </Link>
              </li>
              <li>
                <Link to="/services/esi" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>ESI Details & Family Update</span>
                </Link>
              </li>
              <li>
                <Link to="/services/passport" className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>Passport Service Assistance</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Resources (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-[#FF8500]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-300 hover:text-white transition-colors">
                  All Services (Overview)
                </Link>
              </li>
              <li>
                <Link to="/documents-required" className="text-slate-300 hover:text-white transition-colors font-semibold text-emerald-400">
                  Documents Required Checklist
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-slate-300 hover:text-white transition-colors text-amber-300 font-semibold">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-base tracking-wide uppercase text-xs text-[#FF8500]">
              Get In Touch
            </h4>
            
            <div className="space-y-2.5 text-sm text-slate-300">
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#FF8500] shrink-0" />
                <span>+91 98765 43210</span>
              </a>

              <a 
                href="https://wa.me/919876543210?text=Hi%20Apply365,%20I%20need%20assistance%20with%20documentation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 transition-colors border border-emerald-800/40"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp Helpline</span>
              </a>

              <a 
                href="mailto:support@apply365.in" 
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4 text-[#FF8500] shrink-0" />
                <span>support@apply365.in</span>
              </a>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                <Clock className="w-4 h-4 text-[#FF8500] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-xs">Working Hours</div>
                  <div className="text-xs text-slate-300">Mon – Sat: 9:30 AM – 7:00 PM IST</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                <MapPin className="w-4 h-4 text-[#FF8500] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  Andhra Pradesh & Telangana Support Hub
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Regulatory & Disclaimer Notice */}
        <div className="py-6 border-b border-blue-900/60 text-xs text-slate-400 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FF8500] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-300">Important Disclaimer:</strong> Apply365 is a private document assistance and facilitation service provider. We are NOT a government body, UIDAI, Income Tax Department, Election Commission, Ministry of MSME, Labour Department, EPFO, or ESIC. We provide documentation guidance, data validation, and procedural facilitation to assist individuals and businesses. Final approval, certificate issuance, and card dispatches are exclusively subject to the statutory rules and discretion of the respective government authorities.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-white">Apply365</strong>. All rights reserved. <span className="text-[#FF8500]">Services for People.</span>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Help Desk
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

