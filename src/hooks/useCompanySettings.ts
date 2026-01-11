import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CompanySettings } from '../types';
import toast from 'react-hot-toast';

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    try {
      if (!settings?.id) {
        const { data, error } = await supabase
          .from('company_settings')
          .insert([updates])
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
        toast.success('Impostazioni salvate');
        return data;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      toast.success('Impostazioni aggiornate');
      return data;
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast.error('Errore nel salvataggio delle impostazioni');
      return null;
    }
  };

  return {
    settings,
    isLoading,
    fetchSettings,
    updateSettings,
  };
}
