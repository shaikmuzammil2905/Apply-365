import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '../../services/dataSyncService';
import { ActivityLog } from '../../types/admin';
import { History, Search, Clock, ShieldCheck, User } from 'lucide-react';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getActivityLogs().then(setLogs);
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
    l.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#104A96]" />
            <span>Administrative Audit & Activity Logs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chronological audit trail of all system modifications, publications, logins and lead events.
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          {logs.length} Recorded Events
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search activity by action or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    {log.entityType}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-md truncate">
                    {log.details || 'System event recorded'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{log.adminEmail}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

