import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * ApplyPage Router Component
 * Automatically redirects legacy /apply?service=... requests directly to the 
 * dedicated service application form at /apply/:serviceSlug (e.g., /apply/aadhaar, /apply/esi).
 * This eliminates the redundant "Step 1: Select Your Service" step completely.
 */
export const ApplyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const rawService = searchParams.get('service') || 'aadhaar';
    let slug = rawService.toLowerCase().trim();

    // Friendly aliases
    if (slug === 'pan') slug = 'pan-card';
    if (slug === 'voter') slug = 'voter-id';
    if (slug === 'pf' || slug === 'uan') slug = 'uan-pf';
    if (slug === 'labour') slug = 'labour-license';

    // Redirect to direct application route
    navigate(`/apply/${slug}`, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFBFD] px-4">
      <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-sm text-center">
        <div className="w-10 h-10 border-4 border-[#104A96] border-t-transparent rounded-full animate-spin" />
        <h3 className="text-base font-bold text-slate-800">Opening Application Form</h3>
        <p className="text-xs text-slate-500">
          Directly loading your required fields and document upload options...
        </p>
      </div>
    </div>
  );
};
