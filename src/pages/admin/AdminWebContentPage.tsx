import React, { useState, useEffect } from 'react';
import { getWebsiteContent, saveWebsiteContent } from '../../services/dataSyncService';
import { WebsiteContent } from '../../types/admin';
import { Edit3, Save, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

export const AdminWebContentPage: React.FC = () => {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getWebsiteContent().then(setContent);
  }, []);

  const handleHeroChange = (field: string, val: string) => {
    if (!content) return;
    setContent({
      ...content,
      hero: {
        ...content.hero,
        [field]: val
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await saveWebsiteContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!content) {
    return <div className="p-8 text-center text-slate-500">Loading website content...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-[#104A96]" />
            <span>Website Copy & Content Editor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modify hero copy, call-to-actions and trust indicators. Updates publish immediately to the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Website content updated and published to the live public site!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Homepage Hero Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                1. Homepage Hero Banner & Headings
              </h3>
              <p className="text-xs text-slate-500">
                The top prominent section visitors see on desktop and mobile.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-[#FF8500]" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eyebrow / Badge Text</label>
              <input
                type="text"
                value={content.hero.badge}
                onChange={(e) => handleHeroChange('badge', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Headline Line 1 (Blue)</label>
                <input
                  type="text"
                  value={content.hero.headlinePart1}
                  onChange={(e) => handleHeroChange('headlinePart1', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none font-bold text-[#104A96]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Headline Line 2 (Orange)</label>
                <input
                  type="text"
                  value={content.hero.headlinePart2}
                  onChange={(e) => handleHeroChange('headlinePart2', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none font-bold text-[#FF8500]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description Paragraph</label>
              <textarea
                rows={3}
                value={content.hero.description}
                onChange={(e) => handleHeroChange('description', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={content.hero.primaryButtonText}
                  onChange={(e) => handleHeroChange('primaryButtonText', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Secondary CTA Button Label</label>
                <input
                  type="text"
                  value={content.hero.secondaryButtonText}
                  onChange={(e) => handleHeroChange('secondaryButtonText', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Trust Indicators */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              2. Trust Badges & Guarantee Indicators
            </h3>
            <p className="text-xs text-slate-500">
              The 4 credibility badges displayed under the hero headline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.trustIndicators.map((ti, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Badge {idx + 1} Title</label>
                  <input
                    type="text"
                    value={ti.title}
                    onChange={(e) => {
                      const updated = [...content.trustIndicators];
                      updated[idx].title = e.target.value;
                      setContent({ ...content, trustIndicators: updated });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Description</label>
                  <input
                    type="text"
                    value={ti.description || ''}
                    onChange={(e) => {
                      const updated = [...content.trustIndicators];
                      updated[idx].description = e.target.value;
                      setContent({ ...content, trustIndicators: updated });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. About Section Highlights */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              3. About Us & Track Record Highlights
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Track Record: Years in Operation</label>
              <input
                type="text"
                value={content.aboutSection.yearsOfExcellence}
                onChange={(e) => setContent({ ...content, aboutSection: { ...content.aboutSection, yearsOfExcellence: e.target.value } })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Total Satisfied Clients Count</label>
              <input
                type="text"
                value={content.aboutSection.satisfiedClients}
                onChange={(e) => setContent({ ...content, aboutSection: { ...content.aboutSection, satisfiedClients: e.target.value } })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
