import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Modal } from '../../components/Modal';
import { useProducts } from '../../hooks/useProducts';
import { useTypologies } from '../../hooks/useTypologies';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';
import { Search, Package, LogOut, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export function Catalogo() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { products, categories } = useProducts();
  const { typologies } = useTypologies();
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typologyFilter, setTypologyFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
      const matchesTypology = !typologyFilter || product.typology_id === typologyFilter;
      const matchesAvailability = !availabilityFilter || product.availability === availabilityFilter;

      return matchesSearch && matchesCategory && matchesTypology && matchesAvailability;
    });
  }, [products, searchQuery, categoryFilter, typologyFilter, availabilityFilter]);

  const handleLogout = () => {
    logout();
    toast.success('Disconnesso');
    navigate('/login');
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'both':
        return { label: 'Negozio + Online', className: 'bg-emerald-100 text-emerald-700' };
      case 'store_only':
        return { label: 'Solo Negozio', className: 'bg-blue-100 text-blue-700' };
      case 'online_only':
        return { label: 'Solo Online', className: 'bg-amber-100 text-amber-700' };
      default:
        return { label: 'N/A', className: 'bg-gray-100 text-gray-700' };
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock > 0) {
      return { label: 'Disponibile', className: 'bg-emerald-100 text-emerald-700' };
    }
    return { label: 'Non disponibile', className: 'bg-gray-100 text-gray-500' };
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Benvenuto, <span className="font-medium">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogo Prodotti</h1>
          <p className="text-gray-500">Sfoglia il nostro catalogo di articoli sportivi e benessere</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca prodotto..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          >
            <option value="">Tutte le categorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={typologyFilter}
            onChange={(e) => setTypologyFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          >
            <option value="">Tutte le tipologie</option>
            {typologies.map((typ) => (
              <option key={typ.id} value={typ.id}>
                {typ.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          >
            <option value="">Tutte le disponibilità</option>
            <option value="both">Negozio + Online</option>
            <option value="store_only">Solo Negozio</option>
            <option value="online_only">Solo Online</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={64} className="mb-4" />
            <p className="text-xl">Nessun prodotto trovato</p>
            <p className="text-sm">Prova a modificare i filtri di ricerca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const availabilityBadge = getAvailabilityBadge(product.availability);
              const stockBadge = getStockBadge(product.stock);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image_url || product.image_data ? (
                        <img
                          src={product.image_url || product.image_data || ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={64} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.category && (
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg">
                            {product.category.name}
                          </span>
                        )}
                        <span className={`px-2 py-1 backdrop-blur-sm text-xs font-medium rounded-lg ${availabilityBadge.className}`}>
                          {availabilityBadge.label}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 backdrop-blur-sm text-xs font-medium rounded-lg ${stockBadge.className}`}>
                          {stockBadge.label}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      {product.brand && (
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {product.brand}
                        </p>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.typology && (
                        <p className="text-xs text-cyan-600 mb-1">
                          {product.typology.name}
                        </p>
                      )}
                      {product.category?.name?.toLowerCase() === 'abbigliamento' && product.size && (
                        <p className="text-xs text-gray-500 mb-1">
                          Taglia: {product.size}
                        </p>
                      )}
                      {product.category?.name?.toLowerCase() === 'integratori' && product.flavor && (
                        <p className="text-xs text-gray-500 mb-1">
                          Gusto: {product.flavor}
                        </p>
                      )}
                    </div>
                  </div>
                  {product.online_link && (
                    <div className="px-4 pb-4 mt-auto">
                      <a
                        href={product.online_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors"
                      >
                        <ShoppingBag size={18} />
                        Acquista Online
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || ''}
        size="lg"
      >
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {selectedProduct.image_url || selectedProduct.image_data ? (
                <img
                  src={selectedProduct.image_url || selectedProduct.image_data || ''}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={96} className="text-gray-300" />
                </div>
              )}
            </div>
            <div>
              {selectedProduct.brand && (
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  {selectedProduct.brand}
                </p>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedProduct.name}
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProduct.category && (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                    {selectedProduct.category.name}
                  </span>
                )}
                {selectedProduct.typology && (
                  <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-700 text-sm rounded-lg">
                    {selectedProduct.typology.name}
                  </span>
                )}
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-lg ${getAvailabilityBadge(selectedProduct.availability).className}`}>
                  {getAvailabilityBadge(selectedProduct.availability).label}
                </span>
              </div>

              {selectedProduct.category?.name?.toLowerCase() === 'abbigliamento' && selectedProduct.size && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Taglia:</span> {selectedProduct.size}
                </p>
              )}

              {selectedProduct.category?.name?.toLowerCase() === 'integratori' && selectedProduct.flavor && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Gusto:</span> {selectedProduct.flavor}
                </p>
              )}

              {selectedProduct.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">Stato:</p>
                  <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getStockBadge(selectedProduct.stock).className}`}>
                    {getStockBadge(selectedProduct.stock).label}
                  </span>
                </div>
              </div>

              {selectedProduct.online_link && (
                <div className="mt-6">
                  <a
                    href={selectedProduct.online_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    <ShoppingBag size={20} />
                    Acquista Online
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
