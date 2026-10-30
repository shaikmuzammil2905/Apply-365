import { CustomerUser } from '../types/auth';
import { CustomerApplication } from '../types/application';

const USERS_STORAGE_KEY = 'apply365_customer_users_v1';
const CURRENT_SESSION_KEY = 'apply365_customer_session_v1';
const DB_NAME = 'Apply365_Customer_DB';
const DB_VERSION = 1;
const APPLICATIONS_STORE = 'customer_applications';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(APPLICATIONS_STORE)) {
        const store = db.createObjectStore(APPLICATIONS_STORE, { keyPath: 'id' });
        store.createIndex('customerId', 'customerId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ==========================================
// 1. CUSTOMER USERS (AUTH)
// ==========================================

export function getStoredUsers(): CustomerUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored users:', err);
    return [];
  }
}

export function saveStoredUsers(users: CustomerUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving stored users:', err);
  }
}

export function getCurrentSession(): { user: CustomerUser; token: string } | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.user || !session.token) return null;
    return session;
  } catch (err) {
    console.error('Error reading current session:', err);
    return null;
  }
}

export function saveCurrentSession(user: CustomerUser, token: string): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify({ user, token }));
  } catch (err) {
    console.error('Error saving current session:', err);
  }
}

export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (err) {
    console.error('Error clearing current session:', err);
  }
}

// Simple hash for password demo/local persistence
export function hashPassword(plain: string): string {
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    const char = plain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_sec';
}

// ==========================================
// 2. CUSTOMER APPLICATIONS (ISOLATED PER USER)
// ==========================================

const LOCAL_FALLBACK_KEY = 'apply365_apps_fallback_v1';

function getFallbackApps(): CustomerApplication[] {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFallbackApps(apps: CustomerApplication[]): void {
  try {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(apps));
  } catch (e) {
    console.warn('LocalStorage limit reached for apps fallback', e);
  }
}

export async function saveApplication(app: CustomerApplication): Promise<void> {
  // Always update in IndexedDB first
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(APPLICATIONS_STORE, 'readwrite');
      const store = tx.objectStore(APPLICATIONS_STORE);
      const req = store.put(app);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, using localStorage fallback', err);
  }

  // Also maintain in fallback for redundancy
  const fallback = getFallbackApps().filter((item) => item.id !== app.id);
  fallback.push(app);
  saveFallbackApps(fallback);
}

export async function getCustomerApplications(customerId: string): Promise<CustomerApplication[]> {
  if (!customerId) return [];

  try {
    const db = await openDB();
    const apps: CustomerApplication[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(APPLICATIONS_STORE, 'readonly');
      const store = tx.objectStore(APPLICATIONS_STORE);
      const index = store.index('customerId');
      const req = index.getAll(customerId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (apps && apps.length > 0) {
      return apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  } catch (err) {
    console.warn('IndexedDB read failed, checking fallback', err);
  }

  // Fallback
  const fallback = getFallbackApps().filter((item) => item.customerId === customerId);
  return fallback.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getApplicationById(id: string, customerId: string): Promise<CustomerApplication | null> {
  if (!id || !customerId) return null;

  try {
    const db = await openDB();
    const app: CustomerApplication | null = await new Promise((resolve, reject) => {
      const tx = db.transaction(APPLICATIONS_STORE, 'readonly');
      const store = tx.objectStore(APPLICATIONS_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    // Enforce strict customer data isolation!
    if (app && app.customerId === customerId) {
      return app;
    }
  } catch (err) {
    console.warn('IndexedDB get failed, checking fallback', err);
  }

  const fallback = getFallbackApps().find((item) => item.id === id && item.customerId === customerId);
  return fallback || null;
}
