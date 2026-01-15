import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ProductForm } from './ProductForm';
import { StockLoadModal } from './StockLoadModal';
import { useProducts } from '../../hooks/useProducts';
import { useStockLoads } from '../../hooks/useStockLoads';
import { useTypologies } from '../../hooks/useTypologies';
import { useContacts } from '../../hooks/useContacts';
import type { Product, LoadItem } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Truck,
} from 'lucide-react';

export function Magazzino() {
  const [searchParams] = useSearchParams();
  const { products, categories, brands, addProduct, updateProduct, deleteProduct, getProductByBarcodeAsync, fetchProducts, addBrand, addCategory } =
    useProducts();
  const { createStockLoad } = useStockLoads();
  const { typologies, createTypology } = useTypologies();
  const { suppliers, addContact } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typologyFilter, setTypologyFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [showLowStock, setShowLowStock] = useState(searchParams.get('filter') === 'lowstock');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const brandName = product.brandData?.name || product.brand || '';
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
      const matchesTypology = !typologyFilter || product.typology_id === typologyFilter;
      const matchesAvailability = !availabilityFilter || product.availability === availabilityFilter;
      const matchesSupplier = !supplierFilter || product.supplier_id === supplierFilter;
      const matchesLowStock = !showLowStock || product.stock < product.min_stock;

      return matchesSearch && matchesCategory && matchesTypology && matchesAvailability && matchesSupplier && matchesLowStock;
    });
  }, [products, searchQuery, categoryFilter, typologyFilter, availabilityFilter, supplierFilter, showLowStock]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleSubmitProduct = async (data: Partial<Product>) => {
    if (editingProduct?.id) {
      await updateProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleConfirmLoad = async (items: LoadItem[]) => {
    await createStockLoad(items);
    await fetchProducts();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

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

  const lowStockCount = products.filter((p) => p.stock < p.min_stock).length;

  return (
    <div>
      <Header title="Magazzino" />

      <div className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotto, brand, barcode..."
                className="w-80 pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
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
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="">Tutte le tipologie</option>
              {typologies.map((typ) => (
                <option key={typ.id} value={typ.id}>
                  {typ.name}
                </option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="">Tutti i fornitori</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.company_name}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            >
              <option value="">Tutte le disponibilità</option>
              <option value="both">Negozio + Online</option>
              <option value="store_only">Solo Negozio</option>
              <option value="online_only">Solo Online</option>
            </select>

            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                showLowStock
                  ? 'bg-danger-100 text-danger-700 border border-danger-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle size={18} />
              Sottoscorta ({lowStockCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Truck size={20} />
              Carica Merce
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Plus size={20} />
              Nuovo Prodotto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={48} className="mb-3" />
              <p className="text-lg">Nessun prodotto trovato</p>
              <p className="text-sm">Modifica i filtri o aggiungi un nuovo prodotto</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    Prodotto
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    Categoria
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    Tipologia
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    Fornitore
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    Disponibilita
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    P. Acquisto
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    P. Vendita
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock < product.min_stock;
                  const availabilityBadge = getAvailabilityBadge(product.availability);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isLowStock ? 'bg-danger-50/50' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.image_data || product.image_url ? (
                            <img
                              src={product.image_data || product.image_url || ''}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              {product.brandData?.name || product.brand}
                              {product.barcode && ` - ${product.barcode}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                          {product.category?.name || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 text-sm rounded-lg">
                          {product.typology?.name || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">
                          {product.supplier?.company_name || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${availabilityBadge.className}`}>
                          {availabilityBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-900">
                        {formatCurrency(product.purchase_price)}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-900">
                        {formatCurrency(product.sale_price)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isLowStock && (
                            <AlertTriangle size={16} className="text-danger-500" />
                          )}
                          <span
                            className={`font-semibold ${
                              isLowStock ? 'text-danger-600' : 'text-gray-900'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <span className="text-sm text-gray-400">/ {product.min_stock}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifica"
                          >
                            <Edit2 size={18} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <Trash2 size={18} className="text-gray-500 hover:text-danger-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <p>
            {filteredProducts.length} prodotti{' '}
            {searchQuery || categoryFilter || typologyFilter || availabilityFilter || supplierFilter || showLowStock ? '(filtrati)' : ''}
          </p>
          <p>
            Valore totale magazzino:{' '}
            <span className="font-semibold text-gray-900">
              {formatCurrency(
                products.reduce((sum, p) => sum + p.purchase_price * p.stock, 0)
              )}
            </span>
          </p>
        </div>
      </div>

      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct?.id ? 'Modifica prodotto' : 'Nuovo prodotto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          brands={brands}
          typologies={typologies}
          suppliers={suppliers}
          onSubmit={handleSubmitProduct}
          onCancel={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onAddBrand={addBrand}
          onAddTypology={createTypology}
          onAddCategory={addCategory}
          onAddSupplier={addContact}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Elimina prodotto"
        message={`Sei sicuro di voler eliminare "${productToDelete?.name}"? Questa azione non puo essere annullata.`}
        confirmText="Elimina"
        variant="danger"
      />

      <StockLoadModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        getProductByBarcode={getProductByBarcodeAsync}
        onConfirmLoad={handleConfirmLoad}
        onCreateProduct={addProduct}
        categories={categories}
        brands={brands}
        typologies={typologies}
        suppliers={suppliers}
        onAddBrand={addBrand}
        onAddTypology={createTypology}
        onAddCategory={addCategory}
        onAddSupplier={addContact}
      />
    </div>
  );
}
