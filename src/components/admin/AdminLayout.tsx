import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Layers, 
  Inbox, 
  Users, 
  FileText, 
  Image, 
  Edit3, 
  Settings, 
  History, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck,
  Database,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Courses', path: '/admin/courses', icon: GraduationCap },
  { name: 'Services', path: '/admin/services', icon: Layers },
  { name: 'Leads & Enquiries', path: '/admin/leads', icon: Inbox },
  { name: 'Applications', path: '/admin/applications', icon: FileText },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Media Library', path: '/admin/media', icon: Image },
  { name: 'Website Content', path: '/admin/website-content', icon: Edit3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentAdmin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col antialiased font-sans text-slate-800">
      
      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">Apply365</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF8500] text-white uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <div className="flex-grow flex relative">
        
        {/* Desktop Sidebar & Mobile Drawer */}
        <aside
          className={`
            fixed lg:sticky top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            h-screen
          `}
        >
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#104A96] to-[#07366F] border border-blue-500/40 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#FF8500]" />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white tracking-tight leading-tight">
                  Apply365
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Super Admin
                  </span>
                </div>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group
                    ${isActive 
                      ? 'bg-[#104A96] text-white shadow-md font-bold' 
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FF8500]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick System Status & Admin Profile Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Supabase Sync</span>
              </div>
              <span className="text-emerald-400 font-bold text-[10px]">LIVE</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-white truncate">
                  {currentAdmin?.fullName || 'Super Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentAdmin?.email || 'admin@apply365.in'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout from Admin Panel"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar for Desktop */}
          <header className="hidden lg:flex items-center justify-between bg-white px-8 py-3.5 border-b border-slate-200/80 shadow-xs sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Super Admin Panel</span>
                <span className="text-slate-300">/</span>
                <span className="text-[#104A96] font-bold capitalize">
                  {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#104A96] bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <span>View Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-black shadow-xs">
                  SA
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentAdmin?.fullName || 'Super Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Role: Super Admin
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
};
