import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DiscountCode } from '../types';
import toast from 'react-hot-toast';

export function useDiscountCodes() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscountCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscountCodes(data || []);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      toast.error('Errore nel caricamento codici sconto');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscountCodes();
  }, [fetchDiscountCodes]);

  const addDiscountCode = async (code: Partial<DiscountCode>) => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert([code])
        .select()
        .single();

      if (error) throw error;
      setDiscountCodes((prev) => [data, ...prev]);
      toast.success('Codice sconto creato');
      return data;
    } catch (error) {
      console.error('Error adding discount code:', error);
      toast.error('Errore nella creazione del codice sconto');
      return null;
    }
  };

  const updateDiscountCode = async (id: string, updates: Partial<DiscountCode>) => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setDiscountCodes((prev) => prev.map((dc) => (dc.id === id ? data : dc)));
      toast.success('Codice sconto aggiornato');
      return data;
    } catch (error) {
      console.error('Error updating discount code:', error);
      toast.error('Errore nell\'aggiornamento del codice sconto');
      return null;
    }
  };

  const deleteDiscountCode = async (id: string) => {
    try {
      const { error } = await supabase.from('discount_codes').delete().eq('id', id);

      if (error) throw error;
      setDiscountCodes((prev) => prev.filter((dc) => dc.id !== id));
      toast.success('Codice sconto eliminato');
      return true;
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast.error('Errore nell\'eliminazione del codice sconto');
      return false;
    }
  };

  const validateCode = (code: string) => {
    const discountCode = discountCodes.find(
      (dc) =>
        dc.code.toLowerCase() === code.toLowerCase() &&
        dc.is_active &&
        (!dc.expiry_date || new Date(dc.expiry_date) > new Date())
    );
    return discountCode || null;
  };

  const calculateDiscount = (code: DiscountCode, subtotal: number) => {
    if (code.type === 'percentage') {
      return (subtotal * code.value) / 100;
    }
    return Math.min(code.value, subtotal);
  };

  return {
    discountCodes,
    isLoading,
    fetchDiscountCodes,
    addDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
    validateCode,
    calculateDiscount,
  };
}
