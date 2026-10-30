import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, AuthResponse } from '../types/auth';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getCurrentSession, 
  saveCurrentSession, 
  clearCurrentSession,
  hashPassword 
} from '../services/dbService';

interface AuthContextType {
  currentUser: CustomerUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrMobile: string, plainPassword: string) => Promise<AuthResponse>;
  register: (name: string, mobile: string, email: string, plainPassword: string) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (emailOrMobile: string, newPlainPassword: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<CustomerUser>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from storage
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session.user);
    }
    setLoading(false);
  }, []);

  // Customer Registration
  const register = async (
    name: string, 
    mobile: string, 
    email: string, 
    plainPassword: string
  ): Promise<AuthResponse> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    if (!trimmedName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (cleanMobile.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!plainPassword || plainPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const users = getStoredUsers();
    
    // Check if email or mobile already registered
    const existing = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail || u.mobile === cleanMobile
    );

    if (existing) {
      return { 
        success: false, 
        message: 'An account with this email or mobile number already exists. Please log in.' 
      };
    }

    const newUser: CustomerUser = {
      id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: trimmedName,
      email: trimmedEmail,
      mobile: cleanMobile,
      passwordHash: hashPassword(plainPassword),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Automatically establish authenticated session
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    saveCurrentSession(newUser, token);
    setCurrentUser(newUser);

    return { 
      success: true, 
      message: 'Account created successfully! Welcome to Apply365.',
      user: newUser,
      token
    };
  };

  // Customer Login
  const login = async (emailOrMobile: string, plainPassword: string): Promise<AuthResponse> => {
    const query = emailOrMobile.trim().toLowerCase();
    const cleanMobile = query.replace(/\D/g, '').slice(-10);

    if (!query) {
      return { success: false, message: 'Please enter your registered email or mobile number.' };
    }
    if (!plainPassword) {
      return { success: false, message: 'Please enter your password.' };
    }

    const users = getStoredUsers();
    const targetUser = users.find((u) => {
      return u.email.toLowerCase() === query || (cleanMobile.length === 10 && u.mobile === cleanMobile);
    });

    if (!targetUser) {
      return { 
        success: false, 
        message: 'No registered customer account found with this email or mobile. Please register first.' 
      };
    }

    const inputHash = hashPassword(plainPassword);
    if (targetUser.passwordHash !== inputHash) {
      return { 
        success: false, 
        message: 'Incorrect password. Please verify and try again or use Forgot Password.' 
      };
    }

    // Update lastLogin
    targetUser.lastLogin = new Date().toISOString();
    saveStoredUsers(users);

    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    saveCurrentSession(targetUser, token);
    setCurrentUser(targetUser);

    return {
      success: true,
      message: `Welcome back, ${targetUser.name}!`,
      user: targetUser,
      token
    };
  };

  // Customer Logout
  const logout = () => {
    clearCurrentSession();
    setCurrentUser(null);
  };

  // Forgot Password
  const forgotPassword = async (emailOrMobile: string, newPlainPassword: string): Promise<AuthResponse> => {
    const query = emailOrMobile.trim().toLowerCase();
    const cleanMobile = query.replace(/\D/g, '').slice(-10);

    if (!query) {
      return { success: false, message: 'Please enter your registered email or mobile number.' };
    }
    if (!newPlainPassword || newPlainPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const users = getStoredUsers();
    const targetUserIndex = users.findIndex((u) => {
      return u.email.toLowerCase() === query || (cleanMobile.length === 10 && u.mobile === cleanMobile);
    });

    if (targetUserIndex === -1) {
      return { 
        success: false, 
        message: 'No registered customer account found with this email or mobile number.' 
      };
    }

    // Update password
    users[targetUserIndex].passwordHash = hashPassword(newPlainPassword);
    saveStoredUsers(users);

    // If currently logged in as this user, update session
    if (currentUser && currentUser.id === users[targetUserIndex].id) {
      const updatedUser = users[targetUserIndex];
      setCurrentUser(updatedUser);
      saveCurrentSession(updatedUser, 'token_' + Date.now());
    }

    return {
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    };
  };

  // Update Profile
  const updateProfile = async (updates: Partial<CustomerUser>): Promise<AuthResponse> => {
    if (!currentUser) {
      return { success: false, message: 'No active customer session.' };
    }

    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx === -1) {
      return { success: false, message: 'Customer record not found.' };
    }

    const updatedUser = { ...users[idx], ...updates };
    users[idx] = updatedUser;
    saveStoredUsers(users);
    saveCurrentSession(updatedUser, 'token_' + Date.now());
    setCurrentUser(updatedUser);

    return {
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
