import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      <div className="bg-white border-b border-slate-100 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: 2026 | Apply365 — Services for People
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-950 font-medium">
              By accessing Apply365 website or utilizing our advisory services, you acknowledge and agree that Apply365 is a private consultancy assisting with documentation preparation and does not possess authority to grant official government sanctions or approvals.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Facilitation and Advisory Scope</h2>
            <p>
              Apply365 provides professional guidance, document pre-verification, and technical assistance for citizens and enterprises filing applications on public portals (such as UIDAI, NSDL, ECI, Udyam, Labour Dept, EPFO, and ESIC). All decisions regarding acceptance, processing duration, rejection, and final card/certificate dispatch reside exclusively with the designated government authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Customer Accuracy Warranty</h2>
            <p>
              You warrant that all information, declarations, and proof documents provided to Apply365 are authentic, true, and legally valid. Apply365 will not assist in filing fraudulent, counterfeit, or misrepresented documentation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Advisory Fees & Government Charges</h2>
            <p>
              Any service fees charged by Apply365 compensate for documentation review, typing, portal assistance, and tracking support. Official statutory fees (such as NSDL PAN fees, state labour challans, or UIDAI revision fees) are statutory government charges where applicable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Limitation of Liability</h2>
            <p>
              Apply365 shall not be held liable for delays caused by official portal downtimes, server maintenance of statutory databases, postal dispatch delays by India Post, or rejection caused by prior departmental holds or mismatches in government archives.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">5. Governing Law and Jurisdiction</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

