import { Bell, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProducts } from '../hooks/useProducts';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const { products } = useProducts();
  const navigate = useNavigate();

  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {lowStockProducts.length > 0 && (
          <button
            onClick={() => navigate('/magazzino?filter=lowstock')}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <Bell size={22} className="text-gray-500 group-hover:text-gray-700" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 bg-danger-500 text-white text-xs font-semibold rounded-full px-1">
              {lowStockProducts.length}
            </span>
          </button>
        )}

        {lowStockProducts.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-danger-50 text-danger-700 px-3 py-1.5 rounded-lg text-sm">
            <AlertTriangle size={16} />
            <span>{lowStockProducts.length} prodotti in sottoscorta</span>
          </div>
        )}

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
