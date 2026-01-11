import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Return, ReturnItem, ReturnCartItem, ReturnReason } from '../types';
import toast from 'react-hot-toast';

export function useReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReturns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          customer:contacts(*),
          items:return_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Errore nel caricamento resi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const createReturn = async (
    cart: ReturnCartItem[],
    customerId: string | null,
    reason: ReturnReason,
    notes: string | null
  ) => {
    try {
      const total = cart.reduce((sum, item) => {
        return sum - (item.unit_price * item.quantity);
      }, 0);

      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert([
          {
            customer_id: customerId || null,
            reason,
            notes: notes || null,
            total,
          },
        ])
        .select(`
          *,
          customer:contacts(*)
        `)
        .single();

      if (returnError) throw returnError;

      const returnItems: Partial<ReturnItem>[] = cart.map((item) => ({
        return_id: returnData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_barcode: item.product.barcode,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: -(item.unit_price * item.quantity),
      }));

      const { data: items, error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems)
        .select();

      if (itemsError) throw itemsError;

      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock + item.quantity })
          .eq('id', item.product.id);
      }

      const completeReturn = {
        ...returnData,
        items,
      };
      setReturns((prev) => [completeReturn, ...prev]);
      toast.success('Reso registrato');
      return completeReturn;
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error('Errore nella registrazione del reso');
      return null;
    }
  };

  const getReturnsByDateRange = (startDate: Date, endDate: Date) => {
    return returns.filter((ret) => {
      const returnDate = new Date(ret.created_at);
      return returnDate >= startDate && returnDate <= endDate;
    });
  };

  return {
    returns,
    isLoading,
    fetchReturns,
    createReturn,
    getReturnsByDateRange,
  };
}
