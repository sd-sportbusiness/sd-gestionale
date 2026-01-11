import { Header } from '../components/Header';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { useStockLoads } from '../hooks/useStockLoads';
import { useContacts } from '../hooks/useContacts';
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';

export function Dashboard() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { stockLoads } = useStockLoads();
  const { customers, suppliers } = useContacts();

  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlySales = sales.filter((s) => {
    const date = new Date(s.created_at);
    return date >= monthStart && date <= monthEnd;
  });

  const monthlyLoads = stockLoads.filter((l) => {
    const date = new Date(l.created_at);
    return date >= monthStart && date <= monthEnd;
  });

  const totalRevenue = monthlySales.reduce((sum, s) => sum + s.total, 0);
  const totalCosts = monthlyLoads.reduce((sum, l) => sum + l.total_value, 0);
  const margin = totalRevenue - totalCosts;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const stats = [
    {
      label: 'Prodotti totali',
      value: products.length,
      icon: Package,
      color: 'bg-primary-500',
      lightColor: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      label: 'Vendite del mese',
      value: monthlySales.length,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Clienti',
      value: customers.length,
      icon: Users,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Sottoscorta',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'bg-danger-500',
      lightColor: 'bg-danger-50',
      textColor: 'text-danger-600',
    },
  ];

  const topProducts = [...products]
    .sort((a, b) => {
      const salesA = sales.reduce((sum, s) => {
        const items = s.items || [];
        return sum + items.filter((i) => i.product_id === a.id).reduce((q, i) => q + i.quantity, 0);
      }, 0);
      const salesB = sales.reduce((sum, s) => {
        const items = s.items || [];
        return sum + items.filter((i) => i.product_id === b.id).reduce((q, i) => q + i.quantity, 0);
      }, 0);
      return salesB - salesA;
    })
    .slice(0, 5);

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-8">
        <div className="mb-8">
          <p className="text-gray-500">
            {format(now, "EEEE d MMMM yyyy", { locale: it })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.lightColor} p-3 rounded-xl`}>
                  <stat.icon size={24} className={stat.textColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-50 p-2 rounded-lg">
                <TrendingUp size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendite del mese</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {monthlySales.length} transazioni
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-danger-50 p-2 rounded-lg">
                <TrendingDown size={20} className="text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Acquisti del mese</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCosts)}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {monthlyLoads.length} carichi
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`${margin >= 0 ? 'bg-emerald-50' : 'bg-danger-50'} p-2 rounded-lg`}>
                <DollarSign size={20} className={margin >= 0 ? 'text-emerald-600' : 'text-danger-600'} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Margine lordo</p>
                <p className={`text-2xl font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-danger-600'}`}>
                  {formatCurrency(margin)}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {totalRevenue > 0 ? ((margin / totalRevenue) * 100).toFixed(1) : 0}% di margine
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prodotti in sottoscorta</h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">Nessun prodotto in sottoscorta</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-danger-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-danger-600">{product.stock} pz</p>
                      <p className="text-xs text-gray-500">min: {product.min_stock}</p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    + altri {lowStockProducts.length - 5} prodotti
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prodotti piu venduti</h3>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => {
                  const totalSold = sales.reduce((sum, s) => {
                    const items = s.items || [];
                    return (
                      sum + items.filter((i) => i.product_id === product.id).reduce((q, i) => q + i.quantity, 0)
                    );
                  }, 0);

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary-600">
                        <span className="font-semibold">{totalSold}</span>
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo rapido</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Fornitori</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Valore magazzino</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(products.reduce((sum, p) => sum + p.purchase_price * p.stock, 0))}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Pezzi totali</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Media vendita</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlySales.length > 0 ? totalRevenue / monthlySales.length : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
