import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AdminUser } from '../types/admin';
import { logActivity } from '../services/dataSyncService';

interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  updateAdminProfile: (fullName: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
}

const ADMIN_SESSION_KEY = 'apply365_admin_session_v1';
const ADMIN_CREDENTIALS_KEY = 'apply365_admin_credentials_v1';

// Initial provisioned Super Admin credentials
const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'admin-super-365',
  email: 'admin@apply365.in',
  fullName: 'Super Administrator',
  role: 'super_admin',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const DEFAULT_SUPER_ADMIN_PASSWORD = 'Apply365@Admin2026';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed && parsed.user && parsed.user.role === 'super_admin') {
          setCurrentAdmin(parsed.user);
        }
      }
    } catch (e) {
      console.warn('Error reading admin session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. First attempt Supabase Auth if provisioned
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data?.user) {
        // Check role or metadata
        const adminObj: AdminUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName: data.user.user_metadata?.full_name || 'Super Administrator',
          role: 'super_admin',
          isActive: true,
        };
        setCurrentAdmin(adminObj);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user: adminObj, token: data.session?.access_token }));
        await logActivity('Admin Login', 'auth', adminObj.id, `Supabase authenticated: ${adminObj.email}`);
        return { success: true };
      }
    } catch (err) {
      // Supabase auth fallback
    }

    // 2. Check administrative credentials store
    let storedAdminPassword = localStorage.getItem(ADMIN_CREDENTIALS_KEY) || DEFAULT_SUPER_ADMIN_PASSWORD;

    if (cleanEmail === DEFAULT_SUPER_ADMIN.email && password === storedAdminPassword) {
      const adminObj: AdminUser = {
        ...DEFAULT_SUPER_ADMIN,
        email: cleanEmail,
      };
      setCurrentAdmin(adminObj);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user: adminObj, token: `adm_tok_${Date.now()}` }));
      await logActivity('Admin Login', 'auth', adminObj.id, `Admin signed in: ${adminObj.email}`);
      return { success: true };
    }

    return { success: false, error: 'Invalid administrative email or password. Please check your credentials.' };
  };

  const logoutAdmin = () => {
    if (currentAdmin) {
      logActivity('Admin Logout', 'auth', currentAdmin.id, `Admin logged out: ${currentAdmin.email}`);
    }
    setCurrentAdmin(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    supabase.auth.signOut().catch(() => {});
  };

  const updateAdminProfile = async (fullName: string, newPassword?: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentAdmin) return { success: false, error: 'Not authenticated' };

    const updated = { ...currentAdmin, fullName };
    setCurrentAdmin(updated);
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user: updated, token: `adm_tok_${Date.now()}` }));

    if (newPassword && newPassword.length >= 6) {
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, newPassword);
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch {
        // non-blocking
      }
    }

    await logActivity('Admin Profile Updated', 'auth', currentAdmin.id, 'Admin updated credentials/profile');
    return { success: true };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentAdmin,
        isAdminAuthenticated: !!currentAdmin && currentAdmin.role === 'super_admin',
        isLoading,
        loginAdmin,
        logoutAdmin,
        updateAdminProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
