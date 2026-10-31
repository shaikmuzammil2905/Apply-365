import React, { useState, useEffect } from 'react';
import { getLeads, updateLeadStatus } from '../../services/dataSyncService';
import { Lead, LeadStatus } from '../../types/admin';
import { 
  Inbox, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar, 
  Paperclip, 
  CheckCircle, 
  Clock, 
  X, 
  ExternalLink,
  MessageSquare,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

const statusColors: Record<LeadStatus, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  contacted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  waiting_for_customer: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  converted: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const AdminLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  const loadLeads = async () => {
    const list = await getLeads();
    setLeads(list);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setAdminNotes(lead.adminNotes || '');
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    await updateLeadStatus(selectedLead.id, newStatus, adminNotes);
    setSelectedLead(prev => prev ? { ...prev, status: newStatus, adminNotes } : null);
    await loadLeads();
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    await updateLeadStatus(selectedLead.id, selectedLead.status, adminNotes);
    setSelectedLead(prev => prev ? { ...prev, adminNotes } : null);
    await loadLeads();
  };

  const filtered = leads.filter(l => {
    const matchesSearch = 
      l.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.mobile.includes(searchQuery) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.targetTitle && l.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#104A96]" />
            <span>Customer Leads & Inquiries</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Incoming customer submissions from course registration forms, service enquiries and instant callback requests.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            {leads.filter(l => l.status === 'new').length} New Enquiries
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            {leads.length} Total
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['all', 'new', 'contacted', 'in_progress', 'converted', 'closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors shrink-0 ${
                statusFilter === st 
                  ? 'bg-[#104A96] text-white shadow-xs' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No leads found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Lead ID & Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Service / Course</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lead) => {
                  const style = statusColors[lead.status] || statusColors.new;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div className="font-bold text-slate-900">{lead.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.mobile}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                        {lead.targetTitle || 'General Assistance'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                          {lead.leadType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                          {lead.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenLead(lead)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#104A96] hover:bg-blue-100 font-bold transition-colors"
                        >
                          Review Lead
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedLead.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedLead.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Mobile Number:</span>
                <a href={`tel:${selectedLead.mobile}`} className="font-bold text-[#104A96] hover:underline flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedLead.mobile}</span>
                </a>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email Address:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {selectedLead.email || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Subject / Service:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {selectedLead.targetTitle || 'General Enquiry'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Submitted At:</span>
                <span className="font-mono text-slate-600 mt-0.5 block">
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Customer Message / Notes:</span>
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                {selectedLead.message || 'No additional message provided.'}
              </div>
            </div>

            {/* Uploaded Attachments / Documents / Images (PHASE 8 & 9) */}
            {selectedLead.attachments && selectedLead.attachments.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submitted Files & Supporting Documents ({selectedLead.attachments.length}):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedLead.attachments.map((att, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {att.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || att.type.includes('image') ? (
                          <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {att.name || `Attachment ${idx + 1}`}
                        </span>
                      </div>

                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-md bg-[#104A96] text-white text-[11px] font-bold hover:bg-[#07366F] shrink-0"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Selector & Internal Notes */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Update Lead Status:</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['new', 'contacted', 'in_progress', 'converted', 'closed', 'rejected'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                        selectedLead.status === st 
                          ? 'bg-[#104A96] text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Internal Admin Follow-up Notes:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Called customer, requested Aadhaar copy on WhatsApp..."
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
