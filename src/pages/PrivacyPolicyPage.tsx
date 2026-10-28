import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      <div className="bg-white border-b border-slate-100 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: 2026 | Apply365 — Services for People
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#104A96] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-950 font-medium">
              Apply365 treats user data privacy with paramount care. We never harvest, sell, or disclose personal customer identity proofs to unauthorized third parties or marketing brokers.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Nature of Our Services</h2>
            <p>
              Apply365 is an independent, private documentation assistance and advisory service. We are not a government agency, nor are we affiliated with UIDAI, the Income Tax Department, Election Commission of India, EPFO, ESIC, or the Ministry of MSME. All references to government forms and guidelines are strictly informational and aimed at procedural facilitation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
            <p>
              When you submit an application or contact us, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Contact coordinates: Full name, mobile phone number, WhatsApp contact, city/town, and optional email address.</li>
              <li>Service specifications: The specific civic or business document assistance you requested (e.g., Aadhaar address update, PAN card correction, MSME registration).</li>
              <li>Document confirmation status: Confirmation of possession of required proof documents.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Authentication Secrets & OTP Protection</h2>
            <p className="text-emerald-900 font-semibold bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              Apply365 strictly adheres to the principle of Zero Secret Storage. We will NEVER ask you to provide, nor do we store, your Aadhaar OTPs, bank ATM PINs, net banking passwords, or biometric credentials. All two-factor authentications occur directly between you and the respective official statutory portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Use of Your Contact Information</h2>
            <p>
              The information provided by you is utilized exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Communicate directly with you via Phone or WhatsApp regarding your specific service request.</li>
              <li>Validate document checklist compliance prior to filing.</li>
              <li>Notify you of official application status, appointment dates, or reference numbers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Document Storage and Deletion</h2>
            <p>
              Any supporting paperwork reviewed during consultation is maintained only for the duration required to complete procedural guidance. You maintain the right to request immediate deletion of your contact records by emailing <a href="mailto:support@apply365.in" className="text-[#104A96] underline font-medium">support@apply365.in</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">6. Contact for Privacy Matters</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, please contact our Privacy Team at <a href="mailto:support@apply365.in" className="text-[#104A96] underline font-medium">support@apply365.in</a> or call +91 98765 43210.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

