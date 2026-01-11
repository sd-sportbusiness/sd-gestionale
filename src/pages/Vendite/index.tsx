import { useState, useRef, useEffect, useMemo } from 'react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { Receipt } from './Receipt';
import { ReturnReceipt } from './ReturnReceipt';
import { ProductDiscountModal } from './ProductDiscountModal';
import { useProducts } from '../../hooks/useProducts';
import { useContacts } from '../../hooks/useContacts';
import { usePriceLists } from '../../hooks/usePriceLists';
import { useDiscountCodes } from '../../hooks/useDiscountCodes';
import { useSales } from '../../hooks/useSales';
import { useReturns } from '../../hooks/useReturns';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { useCartStore } from '../../store/cartStore';
import type { Sale, AppliedDiscount, Return, ReturnCartItem, ReturnReason } from '../../types';
import {
  Barcode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Check,
  X,
  Tag,
  User,
  Printer,
  RotateCcw,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Mode = 'sale' | 'return';

const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'defective_product', label: 'Prodotto difettoso' },
  { value: 'wrong_product', label: 'Prodotto errato' },
  { value: 'size_change', label: 'Cambio taglia/modello' },
  { value: 'customer_regret', label: 'Ripensamento cliente' },
  { value: 'other', label: 'Altro' },
];

export function Vendite() {
  const { getProductByBarcode, fetchProducts } = useProducts();
  const { customers } = useContacts();
  const { activePriceLists, defaultPriceList, getProductPrice } = usePriceLists();
  const { validateCode } = useDiscountCodes();
  const { createSale } = useSales();
  const { createReturn } = useReturns();
  const { settings } = useCompanySettings();

  const {
    cart,
    selectedCustomerId,
    selectedPriceListId,
    cartDiscounts,
    setCart,
    setCustomerId,
    setPriceListId,
    addCartDiscount,
    removeCartDiscount,
    addProductDiscount,
    removeProductDiscount,
    clearCart,
  } = useCartStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [cartDiscountInput, setCartDiscountInput] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<string | null>(
    null
  );

  const [mode, setMode] = useState<Mode>('sale');
  const [returnCart, setReturnCart] = useState<ReturnCartItem[]>([]);
  const [returnCustomerId, setReturnCustomerId] = useState('');
  const [returnReason, setReturnReason] = useState<ReturnReason | ''>('');
  const [returnNotes, setReturnNotes] = useState('');
  const [showReturnReceipt, setShowReturnReceipt] = useState(false);
  const [completedReturn, setCompletedReturn] = useState<Return | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultPriceList && !selectedPriceListId) {
      setPriceListId(defaultPriceList.id);
    }
  }, [defaultPriceList, selectedPriceListId, setPriceListId]);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const calculateDiscountAmount = (
    discount: AppliedDiscount,
    baseAmount: number
  ): number => {
    if (discount.type === 'percentage') {
      return (baseAmount * discount.value) / 100;
    }
    return Math.min(discount.value, baseAmount);
  };

  const calculateItemTotal = (
    unitPrice: number,
    quantity: number,
    discounts: AppliedDiscount[] = []
  ): { original: number; discounted: number; discountAmount: number } => {
    const original = unitPrice * quantity;
    let discountAmount = 0;

    discounts.forEach((discount) => {
      const itemBaseAmount = original - discountAmount;
      discountAmount += calculateDiscountAmount(discount, itemBaseAmount);
    });

    return {
      original,
      discounted: original - discountAmount,
      discountAmount,
    };
  };

  const totals = useMemo(() => {
    const itemsSubtotal = cart.reduce((sum, item) => {
      const { discounted } = calculateItemTotal(
        item.unit_price,
        item.quantity,
        item.discounts
      );
      return sum + discounted;
    }, 0);

    let cartDiscountAmount = 0;
    cartDiscounts.forEach((discount) => {
      const baseAmount = itemsSubtotal - cartDiscountAmount;
      cartDiscountAmount += calculateDiscountAmount(discount, baseAmount);
    });

    const total = itemsSubtotal - cartDiscountAmount;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      itemsSubtotal,
      cartDiscountAmount,
      total,
      totalItems,
    };
  }, [cart, cartDiscounts]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = getProductByBarcode(barcodeInput.trim());

    if (product) {
      if (product.stock <= 0) {
        toast.error('Prodotto non disponibile in magazzino');
        setBarcodeInput('');
        return;
      }

      const priceListId = selectedPriceListId || defaultPriceList?.id || '';
      const unitPrice = getProductPrice(product.id, priceListId, product.sale_price);

      const existingIndex = cart.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        const currentQty = cart[existingIndex].quantity;
        if (currentQty >= product.stock) {
          toast.error('Quantita massima raggiunta');
          setBarcodeInput('');
          return;
        }
        setCart(
          cart.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        setCart([...cart, { product, quantity: 1, unit_price: unitPrice }]);
      }
      toast.success(`${product.name} aggiunto`);
    } else {
      toast.error('Prodotto non trovato');
    }

    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((_, idx) => idx !== index));
    } else {
      const item = cart[index];
      if (quantity > item.product.stock) {
        toast.error('Quantita non disponibile');
        return;
      }
      setCart(cart.map((item, idx) => (idx === index ? { ...item, quantity } : item)));
    }
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, idx) => idx !== index));
  };

  const applyCartDiscount = () => {
    if (!cartDiscountInput.trim()) return;

    const code = validateCode(cartDiscountInput.trim());
    if (!code) {
      toast.error('Codice sconto non valido o scaduto');
      setCartDiscountInput('');
      return;
    }

    if (code.applies_to !== 'cart') {
      toast.error('Questo codice si applica ai singoli prodotti');
      setCartDiscountInput('');
      return;
    }

    if (cartDiscounts.some((d) => d.code === code.code)) {
      toast.error('Codice già applicato');
      setCartDiscountInput('');
      return;
    }

    const appliedDiscount: AppliedDiscount = {
      code: code.code,
      type: code.type,
      value: code.value,
    };

    addCartDiscount(appliedDiscount);
    toast.success(
      `Sconto ${code.type === 'percentage' ? `${code.value}%` : `€${code.value}`} applicato al carrello`
    );
    setCartDiscountInput('');
  };

  const handleApplyProductDiscount = (productId: string, discount: AppliedDiscount) => {
    addProductDiscount(productId, discount);
    setSelectedProductForDiscount(null);
  };

  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      toast.error('Aggiungi almeno un prodotto');
      return;
    }

    const cartWithAmounts = cart.map((item) => {
      const { discountAmount } = calculateItemTotal(
        item.unit_price,
        item.quantity,
        item.discounts
      );

      const discountsWithAmounts = (item.discounts || []).map((discount, index) => {
        const previousDiscounts = (item.discounts || []).slice(0, index);
        const baseAmount = item.unit_price * item.quantity - previousDiscounts.reduce((sum, d) => {
          return sum + calculateDiscountAmount(d, item.unit_price * item.quantity);
        }, 0);

        return {
          ...discount,
          amount: calculateDiscountAmount(discount, baseAmount),
        };
      });

      return {
        ...item,
        discounts: discountsWithAmounts,
      };
    });

    const cartDiscountsWithAmounts = cartDiscounts.map((discount, index) => {
      const previousDiscounts = cartDiscounts.slice(0, index);
      const baseAmount = totals.itemsSubtotal - previousDiscounts.reduce((sum, d) => {
        return sum + calculateDiscountAmount(d, totals.itemsSubtotal);
      }, 0);

      return {
        ...discount,
        amount: calculateDiscountAmount(discount, baseAmount),
      };
    });

    const sale = await createSale(
      cartWithAmounts,
      selectedCustomerId || null,
      selectedPriceListId || null,
      cartDiscountsWithAmounts
    );

    if (sale) {
      setCompletedSale(sale);
      setShowReceipt(true);
      clearCart();
      await fetchProducts();
    }
  };

  const handleCancelSale = () => {
    clearCart();
    barcodeInputRef.current?.focus();
  };

  const handleReturnBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = getProductByBarcode(barcodeInput.trim());

    if (product) {
      const existingIndex = returnCart.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        setReturnCart(
          returnCart.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        setReturnCart([...returnCart, { product, quantity: 1, unit_price: product.sale_price }]);
      }
      toast.success(`${product.name} aggiunto al reso`);
    } else {
      toast.error('Prodotto non trovato');
    }

    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  };

  const updateReturnItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setReturnCart(returnCart.filter((_, idx) => idx !== index));
    } else {
      setReturnCart(returnCart.map((item, idx) => (idx === index ? { ...item, quantity } : item)));
    }
  };

  const removeReturnItem = (index: number) => {
    setReturnCart(returnCart.filter((_, idx) => idx !== index));
  };

  const returnTotals = useMemo(() => {
    const total = returnCart.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity;
    }, 0);
    const totalItems = returnCart.reduce((sum, item) => sum + item.quantity, 0);
    return { total, totalItems };
  }, [returnCart]);

  const handleConfirmReturn = async () => {
    if (returnCart.length === 0) {
      toast.error('Aggiungi almeno un prodotto');
      return;
    }

    if (!returnReason) {
      toast.error('Seleziona un motivo per il reso');
      return;
    }

    const returnData = await createReturn(
      returnCart,
      returnCustomerId || null,
      returnReason,
      returnNotes || null
    );

    if (returnData) {
      setCompletedReturn(returnData);
      setShowReturnReceipt(true);
      setReturnCart([]);
      setReturnCustomerId('');
      setReturnReason('');
      setReturnNotes('');
      await fetchProducts();
    }
  };

  const handleCancelReturn = () => {
    setReturnCart([]);
    setReturnCustomerId('');
    setReturnReason('');
    setReturnNotes('');
    barcodeInputRef.current?.focus();
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    if (mode === 'sale' && cart.length > 0) {
      if (!confirm('Hai prodotti nel carrello. Vuoi cambiare modalita?')) return;
      clearCart();
    }
    if (mode === 'return' && returnCart.length > 0) {
      if (!confirm('Hai prodotti nel reso. Vuoi cambiare modalita?')) return;
      handleCancelReturn();
    }
    setMode(newMode);
    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  };

  const handlePrintReturn = () => {
    const receiptElement = document.querySelector('.return-receipt');
    if (!receiptElement) return;

    const receiptHTML = receiptElement.innerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scontrino Reso</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px; line-height: 1.3;
            width: 80mm; padding: 4mm;
            background: white; color: black;
          }
          img { max-height: 40px; width: auto; display: block; margin: 0 auto; }
          .receipt-line { font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 1; letter-spacing: -0.5px; }
          .receipt-header, .receipt-info, .receipt-footer { text-align: center; }
          .receipt-items, .receipt-totals { margin: 8px 0; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          .text-lg { font-size: 14px; }
          .text-base { font-size: 12px; }
          .text-sm { font-size: 11px; }
          .text-xs { font-size: 10px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .my-1 { margin-top: 4px; margin-bottom: 4px; }
          .ml-2 { margin-left: 8px; }
          .text-gray-500 { color: #666; }
          .text-amber-600 { color: #d97706; }
          @page { size: 80mm auto; margin: 0; }
        </style>
      </head>
      <body>${receiptHTML}</body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => { document.body.removeChild(iframe); }, 1000);
      }, 250);
    };
  };

  const handlePrint = () => {
    const receiptElement = document.querySelector('.receipt');
    if (!receiptElement) return;

    const receiptHTML = receiptElement.innerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scontrino</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.3;
            width: 80mm;
            padding: 4mm;
            background: white;
            color: black;
          }
          img {
            max-height: 40px;
            width: auto;
            display: block;
            margin: 0 auto;
          }
          .receipt-line {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10px;
            line-height: 1;
            letter-spacing: -0.5px;
          }
          .receipt-header,
          .receipt-info,
          .receipt-footer {
            text-align: center;
          }
          .receipt-items {
            margin: 8px 0;
          }
          .receipt-totals {
            margin: 8px 0;
          }
          .flex {
            display: flex;
          }
          .justify-between {
            justify-content: space-between;
          }
          .justify-center {
            justify-content: center;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .font-bold {
            font-weight: bold;
          }
          .font-medium {
            font-weight: 500;
          }
          .text-lg {
            font-size: 14px;
          }
          .text-base {
            font-size: 12px;
          }
          .text-sm {
            font-size: 11px;
          }
          .text-xs {
            font-size: 10px;
          }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .my-1 { margin-top: 4px; margin-bottom: 4px; }
          .ml-4 { margin-left: 16px; }
          .mr-2 { margin-right: 8px; }
          .line-through {
            text-decoration: line-through;
          }
          .text-gray-400, .text-gray-500 {
            color: #666;
          }
          .text-green-600 {
            color: #059669;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${receiptHTML}
      </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const selectedProduct = cart.find((item) => item.product.id === selectedProductForDiscount);

  return (
    <div className="no-print">
      <Header title={mode === 'sale' ? 'Vendite' : 'Reso Prodotti'} />

      <div className="p-8">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => handleModeChange('sale')}
            className={`flex-1 px-6 py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'sale'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart size={20} />
            VENDITA
          </button>
          <button
            onClick={() => handleModeChange('return')}
            className={`flex-1 px-6 py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'return'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <RotateCcw size={20} />
            RESO
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-260px)]">
          <div className="lg:col-span-3 flex flex-col">
            <form onSubmit={mode === 'sale' ? handleBarcodeSubmit : handleReturnBarcodeSubmit} className="mb-4">
              <div className="relative">
                <Barcode
                  size={20}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${mode === 'return' ? 'text-amber-400' : 'text-gray-400'}`}
                />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder={mode === 'sale' ? 'Scansiona codice a barre...' : 'Scansiona prodotto da rendere...'}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:ring-2 focus:border-transparent transition-all outline-none text-lg ${
                    mode === 'return' ? 'border-amber-200 focus:ring-amber-500' : 'border-gray-200 focus:ring-primary-500'
                  }`}
                  autoFocus
                />
              </div>
            </form>

            <div className={`bg-white rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col ${mode === 'return' ? 'border-2 border-amber-200' : ''}`}>
              {mode === 'sale' ? (
                cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart size={64} className="mb-4" />
                    <p className="text-lg">Carrello vuoto</p>
                    <p className="text-sm">Scansiona un prodotto per iniziare</p>
                  </div>
                ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Prodotto
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Prezzo
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Qta
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Totale
                        </th>
                        <th className="w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cart.map((item, index) => {
                        const { original, discounted } = calculateItemTotal(
                          item.unit_price,
                          item.quantity,
                          item.discounts
                        );
                        const hasDiscount = item.discounts && item.discounts.length > 0;

                        return (
                          <tr key={item.product.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-500">{item.product.barcode}</p>
                              {hasDiscount && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {item.discounts?.map((discount) => (
                                    <button
                                      key={discount.code}
                                      onClick={() =>
                                        removeProductDiscount(item.product.id, discount.code)
                                      }
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                      {discount.code}
                                      <X size={12} />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Minus size={18} className="text-gray-600" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Plus size={18} className="text-gray-600" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {hasDiscount && (
                                <p className="text-sm text-gray-400 line-through">
                                  {formatCurrency(original)}
                                </p>
                              )}
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(discounted)}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setSelectedProductForDiscount(item.product.id)}
                                  className="p-1.5 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                                  title="Applica sconto"
                                >
                                  <Tag size={18} />
                                </button>
                                <button
                                  onClick={() => removeItem(index)}
                                  className="p-1.5 hover:bg-danger-50 text-gray-400 hover:text-danger-600 rounded-lg transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                )
              ) : (
                returnCart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-amber-400">
                    <RotateCcw size={64} className="mb-4" />
                    <p className="text-lg text-amber-600">Prodotti da rendere</p>
                    <p className="text-sm text-amber-500">Scansiona un prodotto per iniziare</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
                      <p className="text-sm font-semibold text-amber-700">PRODOTTI DA RENDERE</p>
                    </div>
                    <table className="w-full">
                      <thead className="bg-amber-50 sticky top-0">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 uppercase">Prodotto</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-amber-600 uppercase">Prezzo</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-amber-600 uppercase">Qta</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-amber-600 uppercase">Totale</th>
                          <th className="w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {returnCart.map((item, index) => {
                          const itemTotal = item.unit_price * item.quantity;
                          return (
                            <tr key={item.product.id} className="hover:bg-amber-50">
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-500">{item.product.barcode}</p>
                              </td>
                              <td className="py-3 px-4 text-center text-gray-600">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => updateReturnItemQuantity(index, item.quantity - 1)}
                                    className="p-1 hover:bg-amber-200 rounded-lg transition-colors"
                                  >
                                    <Minus size={18} className="text-amber-600" />
                                  </button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateReturnItemQuantity(index, item.quantity + 1)}
                                    className="p-1 hover:bg-amber-200 rounded-lg transition-colors"
                                  >
                                    <Plus size={18} className="text-amber-600" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <p className="font-semibold text-amber-600">-{formatCurrency(itemTotal)}</p>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => removeReturnItem(index)}
                                  className="p-1.5 hover:bg-danger-50 text-gray-400 hover:text-danger-600 rounded-lg transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {mode === 'sale' ? (
            <>
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Cliente
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Seleziona cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} />
                  Listino
                </label>
                <select
                  value={selectedPriceListId}
                  onChange={(e) => setPriceListId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Listino standard</option>
                  {activePriceLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name} {list.is_default && '(predefinito)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} />
                  Codice sconto carrello
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cartDiscountInput}
                    onChange={(e) => setCartDiscountInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && applyCartDiscount()}
                    placeholder="Inserisci codice..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                  <button
                    onClick={applyCartDiscount}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Applica
                  </button>
                </div>
                {cartDiscounts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Sconti carrello applicati:
                    </p>
                    {cartDiscounts.map((discount) => (
                      <div
                        key={discount.code}
                        className="flex items-center justify-between bg-primary-50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm font-medium text-primary-900">
                          {discount.code} (
                          {discount.type === 'percentage' ? `${discount.value}%` : `€${discount.value}`}
                          )
                        </span>
                        <button
                          onClick={() => removeCartDiscount(discount.code)}
                          className="p-1 hover:bg-primary-100 text-primary-600 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Articoli:</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pezzi totali:</span>
                  <span>{totals.totalItems}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotale:</span>
                  <span>{formatCurrency(totals.itemsSubtotal)}</span>
                </div>
                {totals.cartDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Sconti carrello:</span>
                    <span>-{formatCurrency(totals.cartDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>TOTALE:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSale}
                disabled={cart.length === 0}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <X size={20} />
                Annulla
              </button>
              <button
                onClick={handleConfirmSale}
                disabled={cart.length === 0}
                className="flex-1 px-4 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Conferma Vendita
              </button>
            </div>
            </>
            ) : (
            <>
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border-2 border-amber-200">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
                  <User size={16} />
                  Cliente (opzionale)
                </label>
                <select
                  value={returnCustomerId}
                  onChange={(e) => setReturnCustomerId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Seleziona cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
                  <FileText size={16} />
                  Motivo reso *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                  className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Seleziona motivo</option>
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-amber-700 mb-2">
                  <FileText size={16} />
                  Note (opzionale)
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Note aggiuntive sul reso..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 border-2 border-amber-200">
              <h3 className="text-lg font-semibold text-amber-700 mb-4">Riepilogo Reso</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Articoli:</span>
                  <span>{returnCart.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pezzi totali:</span>
                  <span>{returnTotals.totalItems}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-amber-600 pt-3 border-t border-amber-200">
                  <span>TOTALE RESO:</span>
                  <span>-{formatCurrency(returnTotals.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelReturn}
                disabled={returnCart.length === 0}
                className="flex-1 px-4 py-3 border border-amber-200 text-amber-700 font-medium rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <X size={20} />
                Annulla
              </button>
              <button
                onClick={handleConfirmReturn}
                disabled={returnCart.length === 0 || !returnReason}
                className="flex-1 px-4 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Conferma Reso
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductDiscountModal
          isOpen={!!selectedProductForDiscount}
          onClose={() => setSelectedProductForDiscount(null)}
          product={selectedProduct.product}
          unitPrice={selectedProduct.unit_price}
          quantity={selectedProduct.quantity}
          existingDiscounts={selectedProduct.discounts || []}
          onApplyDiscount={(discount) =>
            handleApplyProductDiscount(selectedProduct.product.id, discount)
          }
        />
      )}

      <Modal
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setCompletedSale(null);
          barcodeInputRef.current?.focus();
        }}
        title="Scontrino Proforma"
        size="md"
      >
        {completedSale && (
          <div>
            <Receipt sale={completedSale} settings={settings} />
            <div className="flex gap-3 mt-6 no-print">
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setCompletedSale(null);
                  barcodeInputRef.current?.focus();
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Stampa
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showReturnReceipt}
        onClose={() => {
          setShowReturnReceipt(false);
          setCompletedReturn(null);
          barcodeInputRef.current?.focus();
        }}
        title="Scontrino Reso"
        size="md"
      >
        {completedReturn && (
          <div>
            <ReturnReceipt returnData={completedReturn} settings={settings} />
            <div className="flex gap-3 mt-6 no-print">
              <button
                onClick={() => {
                  setShowReturnReceipt(false);
                  setCompletedReturn(null);
                  barcodeInputRef.current?.focus();
                }}
                className="flex-1 px-4 py-2.5 border border-amber-200 text-amber-700 font-medium rounded-xl hover:bg-amber-50 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={handlePrintReturn}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Stampa
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
