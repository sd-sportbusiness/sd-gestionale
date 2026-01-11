import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Contact } from '../types';
import toast from 'react-hot-toast';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('company_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Errore nel caricamento contatti');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (error) throw error;
      setContacts((prev) => [...prev, data].sort((a, b) => a.company_name.localeCompare(b.company_name)));
      toast.success('Contatto aggiunto');
      return data;
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Errore nell\'aggiunta del contatto');
      return null;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success('Contatto aggiornato');
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Errore nell\'aggiornamento del contatto');
      return null;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);

      if (error) throw error;
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success('Contatto eliminato');
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Errore nell\'eliminazione del contatto');
      return false;
    }
  };

  const customers = contacts.filter((c) => c.type === 'cliente');
  const suppliers = contacts.filter((c) => c.type === 'fornitore');

  return {
    contacts,
    customers,
    suppliers,
    isLoading,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
  };
}
