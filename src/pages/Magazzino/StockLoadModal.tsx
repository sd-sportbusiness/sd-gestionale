import { useState, useRef, useEffect } from 'react';
import { X, Barcode, Plus, Minus, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { Product, LoadItem, Brand, Typology, Contact, Category } from '../../types';
import { Modal } from '../../components/Modal';
import { ProductForm } from './ProductForm';
import toast from 'react-hot-toast';

interface StockLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  getProductByBarcode: (barcode: string) => Promise<Product | null>;
  onConfirmLoad: (items: LoadItem[]) => Promise<void>;
  onCreateProduct: (data: Partial<Product>) => Promise<Product | null>;
  categories: Category[];
  brands: Brand[];
  typologies: Typology[];
  suppliers: Contact[];
  onAddBrand: (name: string) => Promise<Brand | null>;
  onAddTypology: (name: string) => Promise<Typology | null>;
  onAddCategory: (name: string) => Promise<Category | null>;
  onAddSupplier: (data: Partial<Contact>) => Promise<Contact | null>;
}

export function StockLoadModal({
  isOpen,
  onClose,
  getProductByBarcode,
  onConfirmLoad,
  onCreateProduct,
  categories,
  brands,
  typologies,
  suppliers,
  onAddBrand,
  onAddTypology,
  onAddCategory,
  onAddSupplier,
}: StockLoadModalProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [quantityPerScan, setQuantityPerScan] = useState(1);
  const [loadItems, setLoadItems] = useState<LoadItem[]>([]);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim() || isSearching) return;

    const searchBarcode = barcodeInput.trim();
    setIsSearching(true);
    setBarcodeInput('');

    try {
      const product = await getProductByBarcode(searchBarcode);

      if (product) {
        const existingIndex = loadItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex >= 0) {
          setLoadItems((prev) =>
            prev.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantity: item.quantity + quantityPerScan }
                : item
            )
          );
          toast.success(`+${quantityPerScan} ${product.name}`);
        } else {
          setLoadItems((prev) => [...prev, { product, quantity: quantityPerScan }]);
          toast.success(`${product.name} aggiunto`);
        }
        setNotFoundBarcode(null);
      } else {
        setNotFoundBarcode(searchBarcode);
        setNewProductBarcode(searchBarcode);
        toast.error('Prodotto non trovato');
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      toast.error('Errore nella ricerca');
    } finally {
      setIsSearching(false);
      inputRef.current?.focus();
    }
  };

  const handleCreateProduct = () => {
    setShowNewProductModal(true);
    setNotFoundBarcode(null);
  };

  const handleProductCreated = async (data: Partial<Product>) => {
    const newProduct = await onCreateProduct(data);
    if (newProduct) {
      setLoadItems((prev) => [...prev, { product: newProduct, quantity: quantityPerScan }]);
      setShowNewProductModal(false);
      setNewProductBarcode('');
      inputRef.current?.focus();
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setLoadItems((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setLoadItems((prev) =>
        prev.map((item, idx) => (idx === index ? { ...item, quantity } : item))
      );
    }
  };

  const removeItem = (index: number) => {
    setLoadItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirm = async () => {
    if (loadItems.length === 0) return;
    await onConfirmLoad(loadItems);
    setLoadItems([]);
    onClose();
  };

  const handleCancel = () => {
    setLoadItems([]);
    setNotFoundBarcode(null);
    onClose();
  };

  const totalPieces = loadItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = loadItems.reduce(
    (sum, item) => sum + item.product.purchase_price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleCancel} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-xl">
                  <Barcode size={24} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Carico Merce</h2>
                  <p className="text-sm text-gray-500">Scansiona i prodotti da caricare</p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <Barcode size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-lg"
                    placeholder="Scansiona o inserisci codice a barre..."
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3">
                  <span className="text-sm text-gray-500">Qta:</span>
                  <input
                    type="number"
                    min="1"
                    value={quantityPerScan}
                    onChange={(e) => setQuantityPerScan(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Cercando...
                    </>
                  ) : (
                    'Cerca'
                  )}
                </button>
              </form>

              {notFoundBarcode && (
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-yellow-600" />
                    <span className="text-yellow-800">
                      Prodotto non trovato: <strong>{notFoundBarcode}</strong>
                    </span>
                  </div>
                  <button
                    onClick={handleCreateProduct}
                    className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Crea prodotto
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto px-6">
              {loadItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Barcode size={48} className="mb-3" />
                  <p>Scansiona un prodotto per iniziare</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Prodotto
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Quantita
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Costo
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadItems.map((item, index) => (
                      <tr key={item.product.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.product.barcode} - {item.product.brand}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Minus size={18} className="text-gray-600" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemQuantity(index, parseInt(e.target.value) || 1)
                              }
                              className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Plus size={18} className="text-gray-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          €{(item.product.purchase_price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1.5 hover:bg-danger-50 text-gray-400 hover:text-danger-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Articoli</p>
                    <p className="text-xl font-bold text-gray-900">{loadItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pezzi totali</p>
                    <p className="text-xl font-bold text-gray-900">{totalPieces}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valore totale</p>
                    <p className="text-xl font-bold text-primary-600">€{totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-white transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loadItems.length === 0}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Conferma Carico
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        title="Nuovo prodotto"
        size="lg"
      >
        <ProductForm
          categories={categories}
          brands={brands}
          typologies={typologies}
          suppliers={suppliers}
          onSubmit={handleProductCreated}
          onCancel={() => setShowNewProductModal(false)}
          onAddBrand={onAddBrand}
          onAddTypology={onAddTypology}
          onAddCategory={onAddCategory}
          onAddSupplier={onAddSupplier}
          initialBarcode={newProductBarcode}
        />
      </Modal>
    </>
  );
}
