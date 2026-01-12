import { useState } from 'react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { usePriceLists } from '../../hooks/usePriceLists';
import { useProducts } from '../../hooks/useProducts';
import type { PriceList } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Tag,
  Search,
  Check,
} from 'lucide-react';

export function Listini() {
  const { priceLists, addPriceList, updatePriceList, deletePriceList, setDefaultPriceList, setPriceForProduct, getProductPrice } =
    usePriceLists();
  const { products } = useProducts();

  const [showListModal, setShowListModal] = useState(false);
  const [editingList, setEditingList] = useState<PriceList | null>(null);
  const [selectedList, setSelectedList] = useState<PriceList | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<PriceList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const handleAddList = () => {
    setEditingList(null);
    setFormData({ name: '', description: '', is_active: true });
    setShowListModal(true);
  };

  const handleEditList = (list: PriceList) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      is_active: list.is_active,
    });
    setShowListModal(true);
  };

  const handleDeleteList = (list: PriceList) => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (listToDelete) {
      await deletePriceList(listToDelete.id);
      if (selectedList?.id === listToDelete.id) {
        setSelectedList(null);
      }
      setListToDelete(null);
    }
  };

  const handleSubmitList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingList) {
      await updatePriceList(editingList.id, formData);
    } else {
      await addPriceList(formData);
    }
    setShowListModal(false);
    setEditingList(null);
  };

  const handleSetDefault = async (list: PriceList) => {
    await setDefaultPriceList(list.id);
  };

  const handlePriceChange = async (productId: string, price: string) => {
    if (!selectedList) return;
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      await setPriceForProduct(selectedList.id, productId, numericPrice);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div>
      <Header title="Listini Prezzi" />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Listini</h2>
              <button
                onClick={handleAddList}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus size={16} />
                Nuovo
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {priceLists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Tag size={32} className="mb-2" />
                  <p>Nessun listino</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {priceLists.map((list) => (
                    <div
                      key={list.id}
                      onClick={() => setSelectedList(list)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedList?.id === list.id
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {list.is_default && (
                            <Star
                              size={16}
                              className="text-yellow-500 fill-yellow-500"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{list.name}</p>
                            <p className="text-sm text-gray-500">
                              {list.is_active ? 'Attivo' : 'Non attivo'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!list.is_default && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(list);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Imposta come predefinito"
                            >
                              <Star size={16} className="text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditList(list);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifica"
                          >
                            <Edit2 size={16} className="text-gray-400" />
                          </button>
                          {!list.is_default && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list);
                              }}
                              className="p-1.5 hover:bg-danger-50 rounded-lg transition-colors"
                              title="Elimina"
                            >
                              <Trash2 size={16} className="text-gray-400 hover:text-danger-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedList ? (
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 p-2 rounded-xl">
                        <Tag size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedList.name}
                        </h2>
                        {selectedList.description && (
                          <p className="text-sm text-gray-500">
                            {selectedList.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedList.is_default && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-lg">
                          <Star size={12} className="fill-yellow-500" />
                          Predefinito
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          selectedList.is_active
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedList.is_active ? 'Attivo' : 'Non attivo'}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cerca prodotto..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-auto max-h-[600px]">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">
                          Prodotto
                        </th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase">
                          Prezzo base
                        </th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase">
                          Prezzo listino
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => {
                        const customPrice = getProductPrice(
                          product.id,
                          selectedList.id,
                          product.sale_price
                        );
                        const hasCustomPrice = customPrice !== product.sale_price;

                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="py-3 px-6">
                              <p className="font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {product.brand}
                              </p>
                            </td>
                            <td className="py-3 px-6 text-right text-gray-500">
                              {formatCurrency(product.sale_price)}
                            </td>
                            <td className="py-3 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-gray-500">€</span>
                                <input
                                  key={`${product.id}-${selectedList.id}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  defaultValue={customPrice.toFixed(2)}
                                  onBlur={(e) =>
                                    handlePriceChange(product.id, e.target.value)
                                  }
                                  className={`w-24 px-2 py-1 border rounded-lg text-right focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                                    hasCustomPrice
                                      ? 'border-primary-300 bg-primary-50'
                                      : 'border-gray-200'
                                  }`}
                                />
                                {hasCustomPrice && (
                                  <Check
                                    size={16}
                                    className="text-primary-500"
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-gray-400">
                <Tag size={48} className="mb-3" />
                <p className="text-lg">Seleziona un listino</p>
                <p className="text-sm">per visualizzare e modificare i prezzi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showListModal}
        onClose={() => {
          setShowListModal(false);
          setEditingList(null);
        }}
        title={editingList ? 'Modifica listino' : 'Nuovo listino'}
      >
        <form onSubmit={handleSubmitList} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome listino *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-primary-500 focus:ring-primary-500 rounded"
              />
              <span className="text-sm text-gray-700">Listino attivo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowListModal(false);
                setEditingList(null);
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              {editingList ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Elimina listino"
        message={`Sei sicuro di voler eliminare "${listToDelete?.name}"? Questa azione non puo essere annullata.`}
        confirmText="Elimina"
        variant="danger"
      />
    </div>
  );
}
