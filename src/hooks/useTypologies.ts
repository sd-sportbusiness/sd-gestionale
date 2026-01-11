import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Typology } from '../types';
import toast from 'react-hot-toast';

export function useTypologies() {
  const [typologies, setTypologies] = useState<Typology[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTypologies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('typologies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTypologies(data || []);
    } catch (error) {
      console.error('Error fetching typologies:', error);
      toast.error('Errore nel caricamento tipologie');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypologies();
  }, [fetchTypologies]);

  const createTypology = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('typologies')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      setTypologies((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Tipologia creata');
      return data;
    } catch (error: unknown) {
      console.error('Error creating typology:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        toast.error('Tipologia già esistente');
      } else {
        toast.error('Errore nella creazione');
      }
      return null;
    }
  };

  const updateTypology = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('typologies')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTypologies((prev) =>
        prev.map((t) => (t.id === id ? data : t)).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success('Tipologia aggiornata');
      return data;
    } catch (error: unknown) {
      console.error('Error updating typology:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        toast.error('Tipologia già esistente');
      } else {
        toast.error('Errore nell\'aggiornamento');
      }
      return null;
    }
  };

  const deleteTypology = async (id: string) => {
    try {
      const { error } = await supabase.from('typologies').delete().eq('id', id);
      if (error) throw error;
      setTypologies((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tipologia eliminata');
      return true;
    } catch (error) {
      console.error('Error deleting typology:', error);
      toast.error('Errore nell\'eliminazione');
      return false;
    }
  };

  return {
    typologies,
    isLoading,
    fetchTypologies,
    createTypology,
    updateTypology,
    deleteTypology,
  };
}
