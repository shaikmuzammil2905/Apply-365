import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings } from '../types/admin';
import { getWebsiteSettings, INITIAL_WEBSITE_SETTINGS } from '../services/dataSyncService';

interface SettingsContextType {
  settings: WebsiteSettings;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: INITIAL_WEBSITE_SETTINGS,
  refreshSettings: async () => {},
  isLoading: true
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_WEBSITE_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await getWebsiteSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Failed to fetch website settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleSync = (event: any) => {
      if (!event.detail || event.detail.type === 'website_settings' || !event.detail.type) {
        fetchSettings();
      }
    };

    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useWebsiteSettings = () => useContext(SettingsContext);

