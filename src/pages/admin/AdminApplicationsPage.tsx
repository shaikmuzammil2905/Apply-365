import React, { useState, useEffect } from 'react';
import { getAllApplications, updateApplicationStatus } from '../../services/dataSyncService';
import { CustomerApplication } from '../../types/application';
import { 
  FileText, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink,
  Download,
  Eye,
  ShieldCheck
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<CustomerApplication | null>(null);

  const loadApps = async () => {
    const list = await getAllApplications();
    setApplications(list);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleStatusChange = async (status: CustomerApplication['status']) => {
    if (!selectedApp) return;
    await updateApplicationStatus(selectedApp.id, status);
    setSelectedApp(prev => prev ? { ...prev, status } : null);
    await loadApps();
  };

  const filtered = applications.filter(a => {
    const matchesSearch = 
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerMobile.includes(searchQuery) ||
      a.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#104A96]" />
            <span>Service Applications Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review detailed statutory service applications, applicant profiles, and inspect uploaded identity documents.
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-[#104A96]">
          {applications.length} Total Submissions
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, applicant name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['all', 'submitted', 'under_review', 'document_verified', 'processing', 'completed', 'rejected'].map((st) => (
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No applications found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#104A96]">
                      {app.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{app.customerMobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.serviceTitle}</div>
                      <div className="text-slate-400 text-[10px]">{app.serviceType || 'Standard'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {app.documents.filter(d => d.status === 'uploaded' || d.fileUrl).length} Uploaded
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(app.createdAt || app.submissionDate || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#104A96] border border-blue-200 uppercase">
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-[#104A96] text-white hover:bg-[#07366F] font-bold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92dvh] overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedApp.id}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedApp.serviceTitle} Application
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
              
              {/* Applicant Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Applicant Name:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.customerMobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.customerEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Request Type:</span>
                  <span className="font-bold text-[#104A96] mt-0.5 block">{selectedApp.serviceType || 'Standard'}</span>
                </div>
              </div>

              {/* Dynamic Form Data Submitted */}
              {selectedApp.formData && Object.keys(selectedApp.formData).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Submitted Form Fields:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedApp.formData).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{k}</span>
                        <span className="font-semibold text-slate-800 break-words">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">
                  Uploaded Identity Proofs & Supporting Documents ({selectedApp.documents.length}):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                        <span className={`text-[10px] font-semibold ${doc.fileUrl ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {doc.fileUrl ? 'Uploaded & Verified' : 'Pending Upload'}
                        </span>
                      </div>
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-[#104A96] text-white text-[11px] font-bold hover:bg-[#07366F] shrink-0"
                        >
                          Inspect
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No File</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Change Status */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Change Status:</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['submitted', 'under_review', 'document_verified', 'processing', 'completed', 'rejected'] as any[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                        selectedApp.status === st 
                          ? 'bg-[#104A96] text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
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
