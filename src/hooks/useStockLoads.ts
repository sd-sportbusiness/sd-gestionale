import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { StockLoad, StockLoadItem, LoadItem } from '../types';
import toast from 'react-hot-toast';

export function useStockLoads() {
  const [stockLoads, setStockLoads] = useState<StockLoad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStockLoads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stock_loads')
        .select(`
          *,
          items:stock_load_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockLoads(data || []);
    } catch (error) {
      console.error('Error fetching stock loads:', error);
      toast.error('Errore nel caricamento carichi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockLoads();
  }, [fetchStockLoads]);

  const createStockLoad = async (items: LoadItem[]) => {
    try {
      const totalItems = items.length;
      const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = items.reduce(
        (sum, item) => sum + item.product.purchase_price * item.quantity,
        0
      );

      const { data: load, error: loadError } = await supabase
        .from('stock_loads')
        .insert([{ total_items: totalItems, total_pieces: totalPieces, total_value: totalValue }])
        .select()
        .single();

      if (loadError) throw loadError;

      const loadItems: Partial<StockLoadItem>[] = items.map((item) => ({
        load_id: load.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_barcode: item.product.barcode,
        quantity: item.quantity,
        unit_cost: item.product.purchase_price,
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('stock_load_items')
        .insert(loadItems)
        .select();

      if (itemsError) throw itemsError;

      for (const item of items) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock + item.quantity })
          .eq('id', item.product.id);
      }

      const completeLoad = { ...load, items: createdItems };
      setStockLoads((prev) => [completeLoad, ...prev]);
      toast.success('Carico registrato');
      return completeLoad;
    } catch (error) {
      console.error('Error creating stock load:', error);
      toast.error('Errore nella registrazione del carico');
      return null;
    }
  };

  const getLoadsByDateRange = (startDate: Date, endDate: Date) => {
    return stockLoads.filter((load) => {
      const loadDate = new Date(load.created_at);
      return loadDate >= startDate && loadDate <= endDate;
    });
  };

  return {
    stockLoads,
    isLoading,
    fetchStockLoads,
    createStockLoad,
    getLoadsByDateRange,
  };
}
