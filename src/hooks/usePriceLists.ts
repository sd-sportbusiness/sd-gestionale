import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PriceList, PriceListItem } from '../types';
import toast from 'react-hot-toast';

export function usePriceLists() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [priceListItems, setPriceListItems] = useState<PriceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPriceLists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('price_lists')
        .select('*')
        .order('name');

      if (error) throw error;
      setPriceLists(data || []);
    } catch (error) {
      console.error('Error fetching price lists:', error);
      toast.error('Errore nel caricamento listini');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPriceListItems = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('price_list_items').select('*');

      if (error) throw error;
      setPriceListItems(data || []);
    } catch (error) {
      console.error('Error fetching price list items:', error);
    }
  }, []);

  useEffect(() => {
    fetchPriceLists();
    fetchPriceListItems();
  }, [fetchPriceLists, fetchPriceListItems]);

  const addPriceList = async (priceList: Partial<PriceList>) => {
    try {
      const { data, error } = await supabase
        .from('price_lists')
        .insert([priceList])
        .select()
        .single();

      if (error) throw error;
      setPriceLists((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Listino creato');
      return data;
    } catch (error) {
      console.error('Error adding price list:', error);
      toast.error('Errore nella creazione del listino');
      return null;
    }
  };

  const updatePriceList = async (id: string, updates: Partial<PriceList>) => {
    try {
      const { data, error } = await supabase
        .from('price_lists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPriceLists((prev) => prev.map((pl) => (pl.id === id ? data : pl)));
      toast.success('Listino aggiornato');
      return data;
    } catch (error) {
      console.error('Error updating price list:', error);
      toast.error('Errore nell\'aggiornamento del listino');
      return null;
    }
  };

  const deletePriceList = async (id: string) => {
    try {
      const { error } = await supabase.from('price_lists').delete().eq('id', id);

      if (error) throw error;
      setPriceLists((prev) => prev.filter((pl) => pl.id !== id));
      toast.success('Listino eliminato');
      return true;
    } catch (error) {
      console.error('Error deleting price list:', error);
      toast.error('Errore nell\'eliminazione del listino');
      return false;
    }
  };

  const setDefaultPriceList = async (id: string) => {
    try {
      await supabase.from('price_lists').update({ is_default: false }).neq('id', id);

      const { error } = await supabase
        .from('price_lists')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setPriceLists((prev) =>
        prev.map((pl) => ({ ...pl, is_default: pl.id === id }))
      );
      toast.success('Listino predefinito aggiornato');
      return true;
    } catch (error) {
      console.error('Error setting default price list:', error);
      toast.error('Errore nell\'impostazione del listino predefinito');
      return false;
    }
  };

  const setPriceForProduct = async (priceListId: string, productId: string, customPrice: number) => {
    try {
      const existing = priceListItems.find(
        (item) => item.price_list_id === priceListId && item.product_id === productId
      );

      if (existing) {
        const { error } = await supabase
          .from('price_list_items')
          .update({ custom_price: customPrice, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
        setPriceListItems((prev) =>
          prev.map((item) =>
            item.id === existing.id ? { ...item, custom_price: customPrice } : item
          )
        );
      } else {
        const { data, error } = await supabase
          .from('price_list_items')
          .insert([{ price_list_id: priceListId, product_id: productId, custom_price: customPrice }])
          .select()
          .single();

        if (error) throw error;
        setPriceListItems((prev) => [...prev, data]);
      }
      return true;
    } catch (error) {
      console.error('Error setting price:', error);
      toast.error('Errore nell\'impostazione del prezzo');
      return false;
    }
  };

  const getProductPrice = (productId: string, priceListId: string, basePrice: number) => {
    const item = priceListItems.find(
      (i) => i.price_list_id === priceListId && i.product_id === productId
    );
    return item ? item.custom_price : basePrice;
  };

  const defaultPriceList = priceLists.find((pl) => pl.is_default);
  const activePriceLists = priceLists.filter((pl) => pl.is_active);

  return {
    priceLists,
    activePriceLists,
    defaultPriceList,
    priceListItems,
    isLoading,
    fetchPriceLists,
    addPriceList,
    updatePriceList,
    deletePriceList,
    setDefaultPriceList,
    setPriceForProduct,
    getProductPrice,
  };
}
