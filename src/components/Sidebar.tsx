import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  ShoppingCart,
  Archive,
  Settings,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../store/authStore';
import { useProducts } from '../hooks/useProducts';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/magazzino', icon: Package, label: 'Magazzino' },
  { path: '/rubrica', icon: Users, label: 'Rubrica' },
  { path: '/listini', icon: Tag, label: 'Listini' },
  { path: '/vendite', icon: ShoppingCart, label: 'Vendite' },
  { path: '/archivio', icon: Archive, label: 'Archivio' },
  { path: '/impostazioni', icon: Settings, label: 'Impostazioni' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { products } = useProducts();

  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length;

  const handleLogout = () => {
    logout();
    toast.success('Disconnesso');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <Logo size="md" />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
            {item.path === '/magazzino' && lowStockCount > 0 && (
              <span className="ml-auto flex items-center gap-1 bg-danger-100 text-danger-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                <AlertTriangle size={12} />
                {lowStockCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span>Esci</span>
        </button>
      </div>
    </aside>
  );
}
