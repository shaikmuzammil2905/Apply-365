import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getCourses, 
  getServices, 
  getLeads, 
  getAllApplications, 
  getActivityLogs 
} from '../../services/dataSyncService';
import { Course, Lead, ActivityLog } from '../../types/admin';
import { ServiceDetail } from '../../types/services';
import { CustomerApplication } from '../../types/application';
import { 
  GraduationCap, 
  Layers, 
  Inbox, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Image, 
  Settings, 
  History,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [c, s, l, a, lg] = await Promise.all([
        getCourses(),
        getServices(),
        getLeads(),
        getAllApplications(),
        getActivityLogs()
      ]);
      setCourses(c);
      setServices(s);
      setLeads(l);
      setApplications(a);
      setLogs(lg);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time events
    const handleSync = () => loadData();
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const publishedCoursesCount = courses.filter(c => c.isPublished).length;
  const pendingAppsCount = applications.filter(a => 
    ['submitted', 'under_review', 'under review', 'draft', 'action required'].includes(String(a.status).toLowerCase())
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#104A96] to-[#07366F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#FF8500_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply365 Super Admin Center</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            System Operations & Content Center
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            All modifications made to courses, services, and homepage content instantly synchronize with the public Apply365 website.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF8500] hover:bg-[#e67700] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add / Manage Courses</span>
            </Link>

            <Link
              to="/admin/leads"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-xs"
            >
              <Inbox className="w-4 h-4" />
              <span>Review Incoming Leads ({newLeadsCount} New)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Leads */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center font-bold">
              <Inbox className="w-5 h-5" />
            </div>
            {newLeadsCount > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                {newLeadsCount} New
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {leads.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Total Customer Leads
          </p>
        </div>

        {/* Total Applications */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8500] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
              {pendingAppsCount} Pending
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {applications.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Service Applications
          </p>
        </div>

        {/* Courses */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
              {publishedCoursesCount} Live
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {courses.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Total Available Courses
          </p>
        </div>

        {/* Services */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              Active
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {services.length}
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Government & Business Services
          </p>
        </div>

      </div>

      {/* Main Grid: Recent Leads & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Recent Leads (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Customer Leads & Inquiries
              </h3>
              <p className="text-xs text-slate-500">
                Real-time submissions from contact forms, course registrations and callback triggers.
              </p>
            </div>
            <Link
              to="/admin/leads"
              className="text-xs font-bold text-[#104A96] hover:text-[#07366F] inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No customer leads received yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {lead.customerName}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lead.status === 'new' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lead.mobile} • {lead.targetTitle || lead.leadType.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to="/admin/leads"
                      className="text-xs font-bold text-[#104A96] hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Realtime Activity Audit Stream (1 col) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Activity Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Chronological system actions
              </p>
            </div>
            <Link
              to="/admin/activity-logs"
              className="text-xs font-bold text-[#104A96] hover:text-[#07366F]"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#104A96] shrink-0 mt-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 leading-tight">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {log.details || log.entityType}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
