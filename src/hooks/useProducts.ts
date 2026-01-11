import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category, Brand } from '../types';
import toast from 'react-hot-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brandData:brands(*),
          typology:typologies(*),
          supplier:contacts(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Errore nel caricamento prodotti');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

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
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [fetchProducts, fetchCategories, fetchBrands]);

  const addProduct = async (product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select(`*, category:categories(*), brandData:brands(*), typology:typologies(*), supplier:contacts(*)`)
        .single();

      if (error) throw error;
      setProducts((prev) => [data, ...prev]);
      toast.success('Prodotto aggiunto');
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Errore nell\'aggiunta del prodotto');
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`*, category:categories(*), brandData:brands(*), typology:typologies(*), supplier:contacts(*)`)
        .single();

      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
      toast.success('Prodotto aggiornato');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Errore nell\'aggiornamento del prodotto');
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Prodotto eliminato');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Errore nell\'eliminazione del prodotto');
      return false;
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return false;

      const { error } = await supabase
        .from('products')
        .update({ stock: product.stock + quantity, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: p.stock + quantity } : p))
      );
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Errore nell\'aggiornamento dello stock');
      return false;
    }
  };

  const getProductByBarcode = useCallback(
    (barcode: string): Product | undefined => {
      if (!barcode || !barcode.trim()) return undefined;
      const cleanBarcode = barcode.trim().toLowerCase();
      return products.find(
        (p) => p.barcode && p.barcode.trim().toLowerCase() === cleanBarcode
      );
    },
    [products]
  );

  const getProductByBarcodeAsync = useCallback(async (barcode: string): Promise<Product | null> => {
    if (!barcode || !barcode.trim()) return null;
    const cleanBarcode = barcode.trim();

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(*), brandData:brands(*), typology:typologies(*), supplier:contacts(*)`)
        .eq('barcode', cleanBarcode)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      return null;
    }
  }, []);

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Categoria aggiunta');
      return data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      if (error?.code === '23505') {
        toast.error('Categoria gia esistente');
      } else {
        toast.error('Errore nell\'aggiunta della categoria');
      }
      return null;
    }
  };

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

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Categoria eliminata');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Errore nell\'eliminazione della categoria');
      return false;
    }
  };

  return {
    products,
    categories,
    brands,
    isLoading,
    fetchProducts,
    fetchBrands,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getProductByBarcode,
    getProductByBarcodeAsync,
    addCategory,
    deleteCategory,
    addBrand,
  };
}
