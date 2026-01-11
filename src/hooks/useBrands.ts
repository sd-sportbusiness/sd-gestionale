import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Brand } from '../types';
import toast from 'react-hot-toast';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const addBrand = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      setBrands((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Brand aggiunto');
      return data;
    } catch (error: any) {
      console.error('Error adding brand:', error);
      if (error?.code === '23505') {
        toast.error('Brand gia esistente');
      } else {
        toast.error('Errore nell\'aggiunta del brand');
      }
      return null;
    }
  };

  const updateBrand = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setBrands((prev) =>
        prev.map((b) => (b.id === id ? data : b)).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success('Brand aggiornato');
      return data;
    } catch (error: any) {
      console.error('Error updating brand:', error);
      if (error?.code === '23505') {
        toast.error('Brand gia esistente');
      } else {
        toast.error('Errore nell\'aggiornamento del brand');
      }
      return null;
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);

      if (error) throw error;
      setBrands((prev) => prev.filter((b) => b.id !== id));
      toast.success('Brand eliminato');
      return true;
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Errore nell\'eliminazione del brand');
      return false;
    }
  };

  return {
    brands,
    isLoading,
    fetchBrands,
    addBrand,
    updateBrand,
    deleteBrand,
  };
}
