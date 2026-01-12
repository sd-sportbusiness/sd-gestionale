import { forwardRef, useState, useEffect } from 'react';
import type { Sale, CompanySettings, AppliedDiscount } from '../../types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ReceiptProps {
  sale: Sale;
  settings: CompanySettings | null;
}

const convertImageToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale, settings }, ref) => {
    const [logoBase64, setLogoBase64] = useState<string | null>(null);

    useEffect(() => {
      convertImageToBase64('/logo_sd.jpeg').then(setLogoBase64);
    }, []);

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
        value
      );

    const parseDiscounts = (discounts: string | AppliedDiscount[] | undefined): AppliedDiscount[] => {
      if (!discounts) return [];
      if (Array.isArray(discounts)) return discounts;
      try {
        return JSON.parse(discounts);
      } catch {
        return [];
      }
    };

    const cartDiscounts = parseDiscounts(sale.cart_discounts);

    return (
      <div
        ref={ref}
        className="receipt bg-white p-8 max-w-md mx-auto"
      >
        <div className="receipt-header text-center mb-3">
          {logoBase64 && (
            <div className="flex justify-center mb-2">
              <img src={logoBase64} alt="Logo" className="receipt-logo h-16 w-auto" />
            </div>
          )}
          <div className="receipt-line">================================================</div>
          <h1 className="font-bold text-xl mt-2">
            {settings?.company_name || 'SD BENESSERE & SPORT'}
          </h1>
          <p className="text-base">{settings?.tagline || 'Since 1984'}</p>
          {settings?.address && <p className="text-sm mt-1">{settings.address}</p>}
          {settings?.phone && <p className="text-sm">Tel: {settings.phone}</p>}
          {settings?.vat && <p className="text-sm">P.IVA: {settings.vat}</p>}
          <div className="receipt-line mt-2">------------------------------------------------</div>
        </div>

        <div className="receipt-info text-center mb-3">
          <h2 className="font-bold text-lg">SCONTRINO PROFORMA</h2>
          <p className="text-base">N° #{String(sale.sale_number).padStart(4, '0')}</p>
          <p className="text-sm">
            Data: {format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: it })} {' '}
            Ora: {format(new Date(sale.created_at), 'HH:mm', { locale: it })}
          </p>
          <div className="receipt-line mt-2">------------------------------------------------</div>
        </div>

        {sale.customer && (
          <div className="mb-3">
            <p className="text-base">
              Cliente: {sale.customer.company_name}
            </p>
            <div className="receipt-line mt-2">------------------------------------------------</div>
          </div>
        )}

        {sale.price_list && (
          <div className="mb-3">
            <p className="text-base font-medium">
              Listino: {sale.price_list.name}
            </p>
            <div className="receipt-line mt-2">------------------------------------------------</div>
          </div>
        )}

        <div className="receipt-items mb-3">
          {sale.items?.map((item) => {
            const itemDiscounts = parseDiscounts(item.discounts);
            const originalPrice = item.original_price ?? item.unit_price;
            const listPrice = item.unit_price;
            const hasListDiscount = originalPrice > listPrice;
            const listDiscountAmount = hasListDiscount ? originalPrice - listPrice : 0;
            const hasCodeDiscounts = itemDiscounts.length > 0;
            const finalPricePerUnit = item.subtotal / item.quantity;
            const hasAnyDiscount = hasListDiscount || hasCodeDiscounts;

            return (
              <div key={item.id} className="mb-4">
                <p className="font-medium text-base mb-1">{item.product_name}</p>
                <div className="text-sm space-y-0.5 ml-2">
                  {hasListDiscount ? (
                    <>
                      <div className="flex justify-between">
                        <span>  Prezzo originale:</span>
                        <span>{formatCurrency(originalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>  Prezzo listino:</span>
                        <span>{formatCurrency(listPrice)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>  Sconto listino:</span>
                        <span>-{formatCurrency(listDiscountAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>  Prezzo:</span>
                      <span>{formatCurrency(listPrice)}</span>
                    </div>
                  )}
                  {hasCodeDiscounts && itemDiscounts.map((discount, idx) => (
                    <div key={idx} className="flex justify-between text-green-600">
                      <span>  Codice {discount.code} ({discount.type === 'percentage' ? `-${discount.value}%` : `-${formatCurrency(discount.value)}`}):</span>
                      <span>-{formatCurrency(discount.amount || 0)}</span>
                    </div>
                  ))}
                  {hasAnyDiscount && (
                    <div className="flex justify-between">
                      <span>  Prezzo finale:</span>
                      <span>{formatCurrency(finalPricePerUnit)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>  Qta: {item.quantity}</span>
                    <span></span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>  Subtotale:</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="receipt-line">------------------------------------------------</div>
        </div>

        <div className="receipt-totals mb-3 text-base">
          <div className="flex justify-between mb-1">
            <span>SUBTOTALE:</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {cartDiscounts.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-1">Sconti carrello:</p>
              {cartDiscounts.map((discount, idx) => (
                <div key={idx} className="flex justify-between text-green-600 ml-2">
                  <span>Codice {discount.code} ({discount.type === 'percentage' ? `-${discount.value}%` : `-${formatCurrency(discount.value)}`}):</span>
                  <span>-{formatCurrency(discount.amount || 0)}</span>
                </div>
              ))}
            </div>
          )}
          {sale.discount_amount > 0 && cartDiscounts.length === 0 && (
            <div className="flex justify-between mb-1 text-green-600">
              <span>Sconto:</span>
              <span>-{formatCurrency(sale.discount_amount)}</span>
            </div>
          )}
          <div className="receipt-line my-1">------------------------------------------------</div>
          <div className="flex justify-between font-bold text-lg">
            <span>TOTALE:</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          <div className="receipt-line mt-1">------------------------------------------------</div>
        </div>

        <div className="receipt-footer text-center">
          <p className="font-medium text-base">Grazie per l'acquisto!</p>
          {settings?.website && (
            <p className="text-sm mt-1">{settings.website}</p>
          )}
          <div className="receipt-line mt-2">================================================</div>
          <p className="text-sm mt-2 text-gray-500">Documento proforma</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
