import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Sale, SaleItem, CartItem, AppliedDiscount, CancellationReason } from '../types';
import toast from 'react-hot-toast';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:contacts(*),
          price_list:price_lists(*),
          items:sale_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Errore nel caricamento vendite');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const createSale = async (
    cart: CartItem[],
    customerId: string | null,
    priceListId: string | null,
    cartDiscounts: AppliedDiscount[]
  ) => {
    try {
      const itemsSubtotal = cart.reduce((sum, item) => {
        const itemTotal = item.unit_price * item.quantity;
        const itemDiscountAmount = (item.discounts || []).reduce((s, d) => s + (d.amount || 0), 0);
        return sum + (itemTotal - itemDiscountAmount);
      }, 0);

      const cartDiscountAmount = cartDiscounts.reduce((sum, d) => sum + (d.amount || 0), 0);
      const total = itemsSubtotal - cartDiscountAmount;

      const legacyDiscountCode = cartDiscounts.length > 0 ? cartDiscounts[0].code : null;
      const legacyDiscountAmount = cartDiscountAmount;

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            customer_id: customerId,
            price_list_id: priceListId,
            subtotal: itemsSubtotal,
            discount_code: legacyDiscountCode,
            discount_amount: legacyDiscountAmount,
            cart_discounts: JSON.stringify(cartDiscounts),
            total,
          },
        ])
        .select(`
          *,
          customer:contacts(*),
          price_list:price_lists(*)
        `)
        .single();

      if (saleError) throw saleError;

      const saleItems: Partial<SaleItem>[] = cart.map((item) => {
        const itemTotal = item.unit_price * item.quantity;
        const itemDiscountAmount = (item.discounts || []).reduce((s, d) => s + (d.amount || 0), 0);

        return {
          sale_id: sale.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_barcode: item.product.barcode,
          quantity: item.quantity,
          original_price: item.product.sale_price,
          unit_price: item.unit_price,
          discounts: JSON.stringify(item.discounts || []),
          subtotal: itemTotal - itemDiscountAmount,
        };
      });

      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)
        .select();

      if (itemsError) throw itemsError;

      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);
      }

      const completeSale = {
        ...sale,
        items,
        cart_discounts: cartDiscounts,
      };
      setSales((prev) => [completeSale, ...prev]);
      toast.success('Vendita registrata');
      return completeSale;
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Errore nella registrazione della vendita');
      return null;
    }
  };

  const getSalesByDateRange = (startDate: Date, endDate: Date) => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  const cancelSale = async (
    saleId: string,
    reason: CancellationReason,
    notes: string,
    issueRefund: boolean
  ): Promise<Sale | null> => {
    try {
      const sale = sales.find((s) => s.id === saleId);
      if (!sale) {
        toast.error('Vendita non trovata');
        return null;
      }

      if (sale.status === 'cancelled') {
        toast.error('Vendita gia annullata');
        return null;
      }

      let refundNumber: number | null = null;
      if (issueRefund) {
        const { data: seqData, error: seqError } = await supabase.rpc('nextval', {
          seq_name: 'refund_number_seq',
        });

        if (seqError) {
          const { data: maxRefund } = await supabase
            .from('sales')
            .select('refund_number')
            .not('refund_number', 'is', null)
            .order('refund_number', { ascending: false })
            .limit(1)
            .maybeSingle();

          refundNumber = (maxRefund?.refund_number || 0) + 1;
        } else {
          refundNumber = seqData;
        }
      }

      const { data: updatedSale, error: updateError } = await supabase
        .from('sales')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          cancellation_notes: notes || null,
          refund_issued: issueRefund,
          refund_number: refundNumber,
        })
        .eq('id', saleId)
        .select(`
          *,
          customer:contacts(*),
          price_list:price_lists(*),
          items:sale_items(*)
        `)
        .single();

      if (updateError) throw updateError;

      if (sale.items && sale.items.length > 0) {
        for (const item of sale.items) {
          if (item.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .maybeSingle();

            if (product) {
              await supabase
                .from('products')
                .update({ stock: product.stock + item.quantity })
                .eq('id', item.product_id);
            }
          }
        }
      }

      setSales((prev) =>
        prev.map((s) => (s.id === saleId ? updatedSale : s))
      );

      toast.success('Vendita annullata');
      return updatedSale;
    } catch (error) {
      console.error('Error cancelling sale:', error);
      toast.error('Errore nell\'annullamento della vendita');
      return null;
    }
  };

  return {
    sales,
    isLoading,
    fetchSales,
    createSale,
    getSalesByDateRange,
    cancelSale,
  };
}
