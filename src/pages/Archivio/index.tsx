import { useState, useMemo } from 'react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { useSales } from '../../hooks/useSales';
import { useStockLoads } from '../../hooks/useStockLoads';
import { useReturns } from '../../hooks/useReturns';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { RefundReceipt } from './RefundReceipt';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Sale, CancellationReason, Return, ReturnReason } from '../../types';
import {
  ShoppingCart,
  Truck,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  DollarSign,
  BarChart3,
  XCircle,
  Info,
  Printer,
  RotateCcw,
} from 'lucide-react';

type DateRange = 'today' | 'week' | 'month' | 'custom';
type ActiveTab = 'sales' | 'returns' | 'loads' | 'summary';
type StatusFilter = 'all' | 'completed' | 'cancelled';

const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  defective_product: 'Prodotto difettoso',
  wrong_product: 'Prodotto errato',
  size_change: 'Cambio taglia/modello',
  customer_regret: 'Ripensamento cliente',
  other: 'Altro',
};

const CANCELLATION_REASONS: { value: CancellationReason; label: string }[] = [
  { value: 'customer_request', label: 'Richiesta cliente' },
  { value: 'defective_product', label: 'Prodotto difettoso' },
  { value: 'cashier_error', label: 'Errore di cassa' },
  { value: 'wrong_product', label: 'Prodotto errato' },
  { value: 'other', label: 'Altro' },
];

export function Archivio() {
  const { sales, cancelSale } = useSales();
  const { stockLoads } = useStockLoads();
  const { returns } = useReturns();
  const { settings } = useCompanySettings();

  const [activeTab, setActiveTab] = useState<ActiveTab>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);

  const [cancelModalSale, setCancelModalSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState<CancellationReason | ''>('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [issueRefund, setIssueRefund] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [infoModalSale, setInfoModalSale] = useState<Sale | null>(null);
  const [refundModalSale, setRefundModalSale] = useState<Sale | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();

    switch (dateRange) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case 'week':
        return { startDate: startOfWeek(now, { locale: it }), endDate: endOfWeek(now, { locale: it }) };
      case 'month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'custom':
        return {
          startDate: customStartDate ? startOfDay(new Date(customStartDate)) : subDays(now, 30),
          endDate: customEndDate ? endOfDay(new Date(customEndDate)) : now,
        };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  }, [dateRange, customStartDate, customEndDate]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.created_at);
      const inDateRange = saleDate >= startDate && saleDate <= endDate;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && sale.status !== 'cancelled') ||
        (statusFilter === 'cancelled' && sale.status === 'cancelled');
      return inDateRange && matchesStatus;
    });
  }, [sales, startDate, endDate, statusFilter]);

  const filteredLoads = useMemo(() => {
    return stockLoads.filter((load) => {
      const loadDate = new Date(load.created_at);
      return loadDate >= startDate && loadDate <= endDate;
    });
  }, [stockLoads, startDate, endDate]);

  const filteredReturns = useMemo(() => {
    return returns.filter((ret) => {
      const returnDate = new Date(ret.created_at);
      return returnDate >= startDate && returnDate <= endDate;
    });
  }, [returns, startDate, endDate]);

  const filteredCompletedSales = useMemo(() => {
    return filteredSales.filter((sale) => sale.status !== 'cancelled');
  }, [filteredSales]);

  const totalReturns = filteredReturns.reduce((sum, r) => sum + r.total, 0);
  const totalSalesRevenue = filteredCompletedSales.reduce((sum, s) => sum + s.total, 0);
  const totalLoadsCost = filteredLoads.reduce((sum, l) => sum + l.total_value, 0);
  const margin = totalSalesRevenue - totalLoadsCost;
  const avgSaleValue = filteredCompletedSales.length > 0 ? totalSalesRevenue / filteredCompletedSales.length : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const handleOpenCancelModal = (sale: Sale, e: React.MouseEvent) => {
    e.stopPropagation();
    setCancelModalSale(sale);
    setCancelReason('');
    setCancelNotes('');
    setIssueRefund(false);
  };

  const handleCloseCancelModal = () => {
    setCancelModalSale(null);
    setCancelReason('');
    setCancelNotes('');
    setIssueRefund(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalSale || !cancelReason) return;

    setIsProcessing(true);
    const result = await cancelSale(cancelModalSale.id, cancelReason, cancelNotes, issueRefund);
    setIsProcessing(false);

    if (result && issueRefund) {
      setRefundModalSale(result);
    }
    handleCloseCancelModal();
  };

  const handlePrintRefund = () => {
    const receiptElement = document.querySelector('.refund-receipt');
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
        <title>Nota di Rimborso</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.3;
            width: 80mm;
            padding: 4mm;
            background: white;
            color: black;
          }
          img { max-height: 40px; width: auto; display: block; margin: 0 auto; }
          .receipt-line { font-size: 10px; line-height: 1; letter-spacing: -0.5px; }
          .receipt-header, .receipt-info, .receipt-footer { text-align: center; }
          .receipt-items, .receipt-totals { margin: 8px 0; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
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
          .text-gray-500 { color: #666; }
          .text-danger-600 { color: #dc2626; }
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
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  const getReasonLabel = (reason: CancellationReason | null) => {
    if (!reason) return '-';
    return CANCELLATION_REASONS.find((r) => r.value === reason)?.label || reason;
  };

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredCompletedSales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const key = item.product_id || item.product_name;
        if (!productSales[key]) {
          productSales[key] = { name: item.product_name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.subtotal;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredCompletedSales]);

  return (
    <div>
      <Header title="Archivio" />

      <div className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart size={18} />
              Vendite
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                activeTab === 'returns'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <RotateCcw size={18} />
              Resi
            </button>
            <button
              onClick={() => setActiveTab('loads')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                activeTab === 'loads'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Truck size={18} />
              Carichi
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                activeTab === 'summary'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={18} />
              Riepilogo
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="today">Oggi</option>
              <option value="week">Questa settimana</option>
              <option value="month">Questo mese</option>
              <option value="custom">Personalizzato</option>
            </select>

            {activeTab === 'sales' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              >
                <option value="all">Tutte</option>
                <option value="completed">Completate</option>
                <option value="cancelled">Annullate</option>
              </select>
            )}

            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary-100 p-1.5 rounded-lg">
                  <ShoppingCart size={16} className="text-primary-600" />
                </div>
                <p className="text-xs text-gray-500">Vendite</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{filteredCompletedSales.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-emerald-100 p-1.5 rounded-lg">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <p className="text-xs text-gray-500">Tot. Vendite</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSalesRevenue)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-100 p-1.5 rounded-lg">
                  <RotateCcw size={16} className="text-amber-600" />
                </div>
                <p className="text-xs text-gray-500">Resi</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{filteredReturns.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-100 p-1.5 rounded-lg">
                  <DollarSign size={16} className="text-amber-600" />
                </div>
                <p className="text-xs text-gray-500">Tot. Resi</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalReturns)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <Truck size={16} className="text-blue-600" />
                </div>
                <p className="text-xs text-gray-500">Carichi</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{filteredLoads.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <DollarSign size={16} className="text-blue-600" />
                </div>
                <p className="text-xs text-gray-500">Tot. Carichi</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLoadsCost)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${margin >= 0 ? 'bg-emerald-100' : 'bg-danger-100'}`}>
                  <TrendingUp size={16} className={margin >= 0 ? 'text-emerald-600' : 'text-danger-600'} />
                </div>
                <p className="text-xs text-gray-500">Margine</p>
              </div>
              <p className={`text-2xl font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-danger-600'}`}>
                {formatCurrency(margin)}
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'sales' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filteredSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ShoppingCart size={48} className="mb-3" />
                <p className="text-lg">Nessuna vendita nel periodo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSales.map((sale) => {
                  const isCancelled = sale.status === 'cancelled';

                  return (
                    <div key={sale.id} className={isCancelled ? 'bg-danger-50' : ''}>
                      <div
                        onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                        className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                          isCancelled ? 'hover:bg-danger-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isCancelled ? 'bg-danger-100' : 'bg-primary-100'}`}>
                            <ShoppingCart size={20} className={isCancelled ? 'text-danger-600' : 'text-primary-600'} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                Vendita #{String(sale.sale_number).padStart(4, '0')}
                              </p>
                              {isCancelled && (
                                <span className="px-2 py-0.5 bg-danger-500 text-white text-xs font-medium rounded-full">
                                  ANNULLATA
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {format(new Date(sale.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {sale.customer?.company_name || 'Cliente generico'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {sale.items?.reduce((sum, i) => sum + i.quantity, 0)} articoli
                            </p>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className={`font-bold text-lg ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {formatCurrency(sale.total)}
                            </p>
                            {sale.discount_amount > 0 && !isCancelled && (
                              <p className="text-xs text-danger-600">
                                Sconto: -{formatCurrency(sale.discount_amount)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isCancelled ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInfoModalSale(sale);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Dettagli annullamento"
                              >
                                <Info size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleOpenCancelModal(sale, e)}
                                className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                title="Annulla vendita"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            {expandedSaleId === sale.id ? (
                              <ChevronDown size={20} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={20} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      {expandedSaleId === sale.id && (
                        <div className={`px-6 py-4 border-t ${isCancelled ? 'bg-danger-50/50 border-danger-100' : 'bg-gray-50 border-gray-100'}`}>
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-gray-500 uppercase">
                                <th className="text-left pb-2">Prodotto</th>
                                <th className="text-center pb-2">Qta</th>
                                <th className="text-right pb-2">Prezzo</th>
                                <th className="text-right pb-2">Totale</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {sale.items?.map((item) => (
                                <tr key={item.id} className="text-sm">
                                  <td className="py-2">
                                    <p className={`font-medium ${isCancelled ? 'text-gray-500' : 'text-gray-900'}`}>
                                      {item.product_name}
                                    </p>
                                    <p className="text-gray-400 text-xs">{item.product_barcode}</p>
                                  </td>
                                  <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                  <td className="py-2 text-right text-gray-600">
                                    {formatCurrency(item.unit_price)}
                                  </td>
                                  <td className={`py-2 text-right font-medium ${isCancelled ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {formatCurrency(item.subtotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filteredReturns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-amber-400">
                <RotateCcw size={48} className="mb-3" />
                <p className="text-lg text-amber-600">Nessun reso nel periodo</p>
              </div>
            ) : (
              <div className="divide-y divide-amber-100">
                {filteredReturns.map((ret) => (
                  <div key={ret.id} className="bg-amber-50/30">
                    <div
                      onClick={() => setExpandedReturnId(expandedReturnId === ret.id ? null : ret.id)}
                      className="p-4 hover:bg-amber-50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <RotateCcw size={20} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Reso R-{String(ret.return_number).padStart(4, '0')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(ret.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {ret.customer?.company_name || 'Cliente generico'}
                          </p>
                          <p className="text-sm text-amber-600">
                            {RETURN_REASON_LABELS[ret.reason]}
                          </p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="font-bold text-lg text-amber-600">
                            {formatCurrency(ret.total)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {ret.items?.reduce((sum, i) => sum + i.quantity, 0)} articoli
                          </p>
                        </div>
                        {expandedReturnId === ret.id ? (
                          <ChevronDown size={20} className="text-amber-400" />
                        ) : (
                          <ChevronRight size={20} className="text-amber-400" />
                        )}
                      </div>
                    </div>
                    {expandedReturnId === ret.id && (
                      <div className="bg-amber-50/50 px-6 py-4 border-t border-amber-100">
                        {ret.notes && (
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Note:</span> {ret.notes}
                          </p>
                        )}
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-amber-600 uppercase">
                              <th className="text-left pb-2">Prodotto</th>
                              <th className="text-center pb-2">Qta</th>
                              <th className="text-right pb-2">Prezzo</th>
                              <th className="text-right pb-2">Totale</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-200">
                            {ret.items?.map((item) => (
                              <tr key={item.id} className="text-sm">
                                <td className="py-2">
                                  <p className="font-medium text-gray-900">{item.product_name}</p>
                                  <p className="text-gray-400 text-xs">{item.product_barcode}</p>
                                </td>
                                <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-2 text-right text-gray-600">
                                  {formatCurrency(item.unit_price)}
                                </td>
                                <td className="py-2 text-right font-medium text-amber-600">
                                  {formatCurrency(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'loads' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filteredLoads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Truck size={48} className="mb-3" />
                <p className="text-lg">Nessun carico nel periodo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLoads.map((load) => (
                  <div key={load.id}>
                    <div
                      onClick={() => setExpandedLoadId(expandedLoadId === load.id ? null : load.id)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Carico #{String(load.load_number).padStart(4, '0')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(load.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{load.total_items} articoli</p>
                          <p className="text-sm text-gray-400">{load.total_pieces} pezzi</p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="font-bold text-lg text-gray-900">
                            {formatCurrency(load.total_value)}
                          </p>
                        </div>
                        {expandedLoadId === load.id ? (
                          <ChevronDown size={20} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    {expandedLoadId === load.id && (
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-gray-500 uppercase">
                              <th className="text-left pb-2">Prodotto</th>
                              <th className="text-center pb-2">Qta</th>
                              <th className="text-right pb-2">Costo unit.</th>
                              <th className="text-right pb-2">Totale</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {load.items?.map((item) => (
                              <tr key={item.id} className="text-sm">
                                <td className="py-2">
                                  <p className="font-medium text-gray-900">{item.product_name}</p>
                                  <p className="text-gray-400 text-xs">{item.product_barcode}</p>
                                </td>
                                <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-2 text-right text-gray-600">
                                  {formatCurrency(item.unit_cost)}
                                </td>
                                <td className="py-2 text-right font-medium text-gray-900">
                                  {formatCurrency(item.unit_cost * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche vendite</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Totale vendite</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalSalesRevenue)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Numero transazioni</span>
                  <span className="font-bold text-gray-900">{filteredCompletedSales.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Media per vendita</span>
                  <span className="font-bold text-gray-900">{formatCurrency(avgSaleValue)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Totale sconti applicati</span>
                  <span className="font-bold text-danger-600">
                    -{formatCurrency(filteredCompletedSales.reduce((sum, s) => sum + s.discount_amount, 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche carichi</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Totale investito</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalLoadsCost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Numero carichi</span>
                  <span className="font-bold text-gray-900">{filteredLoads.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Pezzi caricati</span>
                  <span className="font-bold text-gray-900">
                    {filteredLoads.reduce((sum, l) => sum + l.total_pieces, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Media per carico</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(filteredLoads.length > 0 ? totalLoadsCost / filteredLoads.length : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prodotti più venduti</h3>
              {topProducts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nessun dato disponibile</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{product.quantity} venduti</p>
                        </div>
                        <p className="font-bold text-gray-900 min-w-[100px] text-right">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!cancelModalSale}
        onClose={handleCloseCancelModal}
        title={`Annulla Vendita #${String(cancelModalSale?.sale_number || 0).padStart(4, '0')}`}
        size="md"
      >
        {cancelModalSale && (
          <div className="space-y-4">
            <p className="text-gray-600">Sei sicuro di voler annullare questa vendita?</p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-medium text-gray-900">
                  {cancelModalSale.customer?.company_name || 'Cliente generico'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(cancelModalSale.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Totale:</span>
                <span className="font-bold text-gray-900">{formatCurrency(cancelModalSale.total)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Prodotti che verranno ripristinati in magazzino:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {cancelModalSale.items?.map((item) => (
                  <li key={item.id}>
                    - {item.product_name} ({item.quantity} pz)
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo annullamento *
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value as CancellationReason)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              >
                <option value="">Seleziona motivo...</option>
                {CANCELLATION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (opzionale)
              </label>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Aggiungi note..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={issueRefund}
                onChange={(e) => setIssueRefund(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Emetti documento di rimborso</span>
            </label>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseCancelModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason || isProcessing}
                className="flex-1 px-4 py-2.5 bg-danger-500 text-white font-medium rounded-xl hover:bg-danger-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Elaborazione...' : 'Conferma Annullamento'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!infoModalSale}
        onClose={() => setInfoModalSale(null)}
        title="Dettagli Annullamento"
        size="sm"
      >
        {infoModalSale && (
          <div className="space-y-4">
            <div className="bg-danger-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vendita:</span>
                <span className="font-medium text-gray-900">
                  #{String(infoModalSale.sale_number).padStart(4, '0')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data annullamento:</span>
                <span className="font-medium text-gray-900">
                  {infoModalSale.cancelled_at
                    ? format(new Date(infoModalSale.cancelled_at), "d MMMM yyyy, HH:mm", { locale: it })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Motivo:</span>
                <span className="font-medium text-gray-900">
                  {getReasonLabel(infoModalSale.cancellation_reason)}
                </span>
              </div>
              {infoModalSale.cancellation_notes && (
                <div className="text-sm">
                  <span className="text-gray-500 block mb-1">Note:</span>
                  <p className="text-gray-900">{infoModalSale.cancellation_notes}</p>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rimborso emesso:</span>
                <span className={`font-medium ${infoModalSale.refund_issued ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {infoModalSale.refund_issued ? `Si (R-${String(infoModalSale.refund_number).padStart(4, '0')})` : 'No'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setInfoModalSale(null)}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Chiudi
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!refundModalSale}
        onClose={() => setRefundModalSale(null)}
        title="Nota di Rimborso"
        size="md"
      >
        {refundModalSale && (
          <div>
            <RefundReceipt sale={refundModalSale} settings={settings} />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRefundModalSale(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={handlePrintRefund}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
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
