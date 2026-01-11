import { useState, useEffect } from 'react';
import type { Return, CompanySettings, ReturnReason } from '../../types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ReturnReceiptProps {
  returnData: Return;
  settings: CompanySettings | null;
}

const REASON_LABELS: Record<ReturnReason, string> = {
  defective_product: 'Prodotto difettoso',
  wrong_product: 'Prodotto errato',
  size_change: 'Cambio taglia/modello',
  customer_regret: 'Ripensamento cliente',
  other: 'Altro',
};

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

export function ReturnReceipt({ returnData, settings }: ReturnReceiptProps) {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  useEffect(() => {
    convertImageToBase64('/logo_sd.jpeg').then(setLogoBase64);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="return-receipt bg-white p-8 max-w-md mx-auto">
      <div className="receipt-header text-center mb-3">
        {logoBase64 && (
          <div className="flex justify-center mb-2">
            <img src={logoBase64} alt="Logo" className="receipt-logo h-16 w-auto" />
          </div>
        )}
        <div className="receipt-line">================================================</div>
        <h1 className="font-bold text-lg mt-2">
          {settings?.company_name || 'SD BENESSERE & SPORT'}
        </h1>
        <p className="text-sm">{settings?.tagline || 'Since 1984'}</p>
        {settings?.address && <p className="text-xs mt-1">{settings.address}</p>}
        {settings?.phone && <p className="text-xs">Tel: {settings.phone}</p>}
        {settings?.vat && <p className="text-xs">P.IVA: {settings.vat}</p>}
        <div className="receipt-line mt-2">------------------------------------------------</div>
      </div>

      <div className="receipt-info text-center mb-3">
        <h2 className="font-bold text-base text-amber-600">SCONTRINO RESO</h2>
        <p className="text-sm">N. R-{String(returnData.return_number).padStart(4, '0')}</p>
        <p className="text-xs">
          Data: {format(new Date(returnData.created_at), 'dd/MM/yyyy', { locale: it })} {' '}
          Ora: {format(new Date(returnData.created_at), 'HH:mm', { locale: it })}
        </p>
        <div className="receipt-line mt-2">------------------------------------------------</div>
      </div>

      {returnData.customer && (
        <div className="mb-3">
          <p className="text-sm">Cliente: {returnData.customer.company_name}</p>
          <div className="receipt-line mt-2">------------------------------------------------</div>
        </div>
      )}

      <div className="mb-3">
        <p className="text-sm">Motivo: {REASON_LABELS[returnData.reason]}</p>
        {returnData.notes && (
          <p className="text-xs text-gray-500 mt-1">Note: {returnData.notes}</p>
        )}
        <div className="receipt-line mt-2">------------------------------------------------</div>
      </div>

      <div className="receipt-items mb-3">
        {returnData.items?.map((item) => (
          <div key={item.id} className="mb-4">
            <p className="font-medium text-sm mb-1">{item.product_name}</p>
            <div className="text-xs space-y-0.5 ml-2">
              <div className="flex justify-between">
                <span>  Prezzo:</span>
                <span>{formatCurrency(item.unit_price)}</span>
              </div>
              <div className="flex justify-between">
                <span>  Qta: {item.quantity}</span>
                <span></span>
              </div>
              <div className="flex justify-between font-medium text-amber-600">
                <span>  Subtotale:</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="receipt-line">------------------------------------------------</div>
      </div>

      <div className="receipt-totals mb-3 text-sm">
        <div className="receipt-line my-1">------------------------------------------------</div>
        <div className="flex justify-between font-bold text-base text-amber-600">
          <span>TOTALE RESO:</span>
          <span>{formatCurrency(returnData.total)}</span>
        </div>
        <div className="receipt-line mt-1">------------------------------------------------</div>
      </div>

      <div className="receipt-footer text-center">
        <p className="font-medium text-sm">Merce restituita a magazzino</p>
        {settings?.website && (
          <p className="text-xs mt-1">{settings.website}</p>
        )}
        <div className="receipt-line mt-2">================================================</div>
        <p className="text-xs mt-2 text-gray-500">Documento proforma</p>
      </div>
    </div>
  );
}
