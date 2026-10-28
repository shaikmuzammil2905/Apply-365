import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { servicesData } from '../data/servicesData';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('aadhaar');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and contact phone number.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const selectedServiceObj = servicesData.find(s => s.id === service);

  const getWhatsAppContactUrl = () => {
    const text = `Hi Apply365, my name is ${name || 'Customer'}. I am contacting you regarding ${selectedServiceObj?.title || 'Documentation Services'}. ${message ? 'Message: ' + message : ''}`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-100 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />

          <div className="mt-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold uppercase tracking-wider mb-2">
              <Phone className="w-3.5 h-3.5" />
              <span>We Are Here to Assist You</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Contact Apply365
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Have questions about document requirements, authority procedures, or current application status? Get in touch with our friendly support team.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Contact Information & Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">
                Direct Contact Channels
              </h2>

              <div className="space-y-4">
                
                {/* Phone Call */}
                <a 
                  href="tel:+919876543210"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8FBFF] hover:bg-blue-50 border border-blue-100/60 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#104A96] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Support</div>
                    <div className="text-base font-bold text-slate-900">+91 98765 43210</div>
                    <div className="text-xs text-slate-500 mt-0.5">Click to dial directly</div>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  href="https://wa.me/919876543210?text=Hi%20Apply365,%20I%20have%20an%20enquiry%20regarding%20documentation%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">WhatsApp Chat</div>
                    <div className="text-base font-bold text-emerald-950">+91 98765 43210</div>
                    <div className="text-xs text-emerald-700 mt-0.5">Instant response during working hours</div>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:support@apply365.in"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8FBFF] hover:bg-blue-50 border border-blue-100/60 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#07366F] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Enquiries</div>
                    <div className="text-base font-bold text-slate-900">support@apply365.in</div>
                    <div className="text-xs text-slate-500 mt-0.5">For corporate or complex queries</div>
                  </div>
                </a>

              </div>

              {/* Working Hours & Address */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-[#FF8500] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Working Hours</strong>
                    <span>Monday to Saturday: 9:30 AM – 7:00 PM IST (Closed on Public Holidays)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-[#FF8500] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Service Coverage Hub</strong>
                    <span>Andhra Pradesh & Telangana Regional Assistance Network</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Contact Enquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
              
              {submitted ? (
                <div className="text-center py-10 space-y-5">
                  <div className="w-16 h-16 bg-emerald-100 text-[#35A936] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Thank You for Reaching Out!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    We have received your message regarding <strong>{selectedServiceObj?.title}</strong>. For instant reply, you can also send this directly via WhatsApp.
                  </p>
                  
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getWhatsAppContactUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Continue on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl text-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Send an Enquiry</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Fill out the form below and an Apply365 documentation advisor will assist you.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S. Venkat Rao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Interested Service
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                      >
                        {servicesData.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      How Can We Help? (Optional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share any questions about document proofs or specific assistance required..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Enquiry Message</span>
                    </button>

                    <a
                      href={getWhatsAppContactUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-5 rounded-xl transition-colors text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>

                  <div className="pt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#35A936]" />
                    <span>Your contact information is strictly confidential and never shared with third parties.</span>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
