import { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { useProducts } from '../../hooks/useProducts';
import { useDiscountCodes } from '../../hooks/useDiscountCodes';
import { useBrands } from '../../hooks/useBrands';
import { useTypologies } from '../../hooks/useTypologies';
import type { DiscountCode, Brand, Category, Typology } from '../../types';
import {
  Building2,
  Save,
  Tag,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  Percent,
  DollarSign,
  Bookmark,
  Layers,
} from 'lucide-react';

export function Impostazioni() {
  const { settings, updateSettings } = useCompanySettings();
  const { categories, addCategory, deleteCategory } = useProducts();
  const { discountCodes, addDiscountCode, updateDiscountCode, deleteDiscountCode } =
    useDiscountCodes();
  const { brands, addBrand, updateBrand, deleteBrand } = useBrands();
  const { typologies, createTypology, updateTypology, deleteTypology } = useTypologies();

  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    tagline: '',
    website: '',
    address: '',
    phone: '',
    email: '',
    vat: '',
  });

  const [newCategory, setNewCategory] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: '' });
  const [showBrandDeleteConfirm, setShowBrandDeleteConfirm] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [newTypologyName, setNewTypologyName] = useState('');
  const [showTypologyModal, setShowTypologyModal] = useState(false);
  const [editingTypology, setEditingTypology] = useState<Typology | null>(null);
  const [typologyForm, setTypologyForm] = useState({ name: '' });
  const [showTypologyDeleteConfirm, setShowTypologyDeleteConfirm] = useState(false);
  const [typologyToDelete, setTypologyToDelete] = useState<Typology | null>(null);

  const [discountForm, setDiscountForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    applies_to: 'cart' as 'cart' | 'product',
    expiry_date: '',
    is_active: true,
  });

  useEffect(() => {
    if (settings) {
      setCompanyForm({
        company_name: settings.company_name || '',
        tagline: settings.tagline || '',
        website: settings.website || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        vat: settings.vat || '',
      });
    }
  }, [settings]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(companyForm);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await addCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowCategoryDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  const handleAddBrandQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    await addBrand(newBrandName.trim());
    setNewBrandName('');
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({ name: brand.name });
    setShowBrandModal(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setBrandToDelete(brand);
    setShowBrandDeleteConfirm(true);
  };

  const confirmDeleteBrand = async () => {
    if (brandToDelete) {
      await deleteBrand(brandToDelete.id);
      setBrandToDelete(null);
    }
  };

  const handleSubmitBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return;

    if (editingBrand) {
      await updateBrand(editingBrand.id, brandForm.name.trim());
    } else {
      await addBrand(brandForm.name.trim());
    }
    setShowBrandModal(false);
    setEditingBrand(null);
    setBrandForm({ name: '' });
  };

  const handleAddTypologyQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypologyName.trim()) return;
    await createTypology(newTypologyName.trim());
    setNewTypologyName('');
  };

  const handleEditTypology = (typology: Typology) => {
    setEditingTypology(typology);
    setTypologyForm({ name: typology.name });
    setShowTypologyModal(true);
  };

  const handleDeleteTypology = (typology: Typology) => {
    setTypologyToDelete(typology);
    setShowTypologyDeleteConfirm(true);
  };

  const confirmDeleteTypology = async () => {
    if (typologyToDelete) {
      await deleteTypology(typologyToDelete.id);
      setTypologyToDelete(null);
    }
  };

  const handleSubmitTypology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typologyForm.name.trim()) return;

    if (editingTypology) {
      await updateTypology(editingTypology.id, typologyForm.name.trim());
    } else {
      await createTypology(typologyForm.name.trim());
    }
    setShowTypologyModal(false);
    setEditingTypology(null);
    setTypologyForm({ name: '' });
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setDiscountForm({
      code: '',
      type: 'percentage',
      value: 0,
      applies_to: 'cart',
      expiry_date: '',
      is_active: true,
    });
    setShowDiscountModal(true);
  };

  const handleEditDiscount = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setDiscountForm({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      applies_to: discount.applies_to,
      expiry_date: discount.expiry_date ? discount.expiry_date.split('T')[0] : '',
      is_active: discount.is_active,
    });
    setShowDiscountModal(true);
  };

  const handleDeleteDiscount = (discount: DiscountCode) => {
    setDiscountToDelete(discount);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDiscount = async () => {
    if (discountToDelete) {
      await deleteDiscountCode(discountToDelete.id);
      setDiscountToDelete(null);
    }
  };

  const handleSubmitDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...discountForm,
      expiry_date: discountForm.expiry_date ? new Date(discountForm.expiry_date).toISOString() : null,
    };

    if (editingDiscount) {
      await updateDiscountCode(editingDiscount.id, data);
    } else {
      await addDiscountCode(data);
    }
    setShowDiscountModal(false);
    setEditingDiscount(null);
  };

  return (
    <div>
      <Header title="Impostazioni" />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary-100 p-2 rounded-xl">
                <Building2 size={24} className="text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Dati aziendali</h2>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome azienda
                </label>
                <input
                  type="text"
                  value={companyForm.company_name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, company_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={companyForm.tagline}
                  onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sito web
                </label>
                <input
                  type="text"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={companyForm.vat}
                  onChange={(e) => setCompanyForm({ ...companyForm, vat: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Salva
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <FolderPlus size={24} className="text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Categorie</h2>
                </div>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nuova categoria..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </form>

              {categories.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nessuna categoria</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm group"
                    >
                      {cat.name}
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-0.5 hover:bg-gray-200 rounded transition-colors opacity-60 hover:opacity-100"
                        title="Elimina categoria"
                      >
                        <Trash2 size={14} className="text-gray-500 hover:text-danger-600" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <Bookmark size={24} className="text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Brand / Marche</h2>
                </div>
              </div>

              <form onSubmit={handleAddBrandQuick} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Nuovo brand..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </form>

              {brands.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nessun brand</p>
              ) : (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="font-medium text-gray-900">{brand.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand)}
                          className="p-1.5 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-gray-500 hover:text-danger-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-100 p-2 rounded-xl">
                    <Layers size={24} className="text-cyan-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Tipologie</h2>
                </div>
              </div>

              <form onSubmit={handleAddTypologyQuick} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTypologyName}
                  onChange={(e) => setNewTypologyName(e.target.value)}
                  placeholder="Nuova tipologia..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </form>

              {typologies.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nessuna tipologia</p>
              ) : (
                <div className="space-y-2">
                  {typologies.map((typology) => (
                    <div
                      key={typology.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="font-medium text-gray-900">{typology.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTypology(typology)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteTypology(typology)}
                          className="p-1.5 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-gray-500 hover:text-danger-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <Tag size={24} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Codici sconto</h2>
                </div>
                <button
                  onClick={handleAddDiscount}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus size={16} />
                  Nuovo
                </button>
              </div>

              {discountCodes.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nessun codice sconto</p>
              ) : (
                <div className="space-y-2">
                  {discountCodes.map((discount) => (
                    <div
                      key={discount.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg ${
                            discount.type === 'percentage'
                              ? 'bg-emerald-100'
                              : 'bg-blue-100'
                          }`}
                        >
                          {discount.type === 'percentage' ? (
                            <Percent
                              size={16}
                              className="text-emerald-600"
                            />
                          ) : (
                            <DollarSign size={16} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{discount.code}</p>
                          <p className="text-sm text-gray-500">
                            {discount.type === 'percentage'
                              ? `${discount.value}%`
                              : `€${discount.value.toFixed(2)}`}
                            {' - '}
                            {discount.applies_to === 'cart' ? 'Carrello' : 'Prodotto'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            discount.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {discount.is_active ? 'Attivo' : 'Inattivo'}
                        </span>
                        <button
                          onClick={() => handleEditDiscount(discount)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscount(discount)}
                          className="p-1.5 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-gray-500 hover:text-danger-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDiscountModal}
        onClose={() => {
          setShowDiscountModal(false);
          setEditingDiscount(null);
        }}
        title={editingDiscount ? 'Modifica codice sconto' : 'Nuovo codice sconto'}
      >
        <form onSubmit={handleSubmitDiscount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Codice *
            </label>
            <input
              type="text"
              value={discountForm.code}
              onChange={(e) =>
                setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. SCONTO10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo sconto
              </label>
              <select
                value={discountForm.type}
                onChange={(e) =>
                  setDiscountForm({
                    ...discountForm,
                    type: e.target.value as 'percentage' | 'fixed',
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
              >
                <option value="percentage">Percentuale (%)</option>
                <option value="fixed">Valore fisso (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valore
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discountForm.value}
                onChange={(e) =>
                  setDiscountForm({ ...discountForm, value: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Applicabile a
            </label>
            <select
              value={discountForm.applies_to}
              onChange={(e) =>
                setDiscountForm({
                  ...discountForm,
                  applies_to: e.target.value as 'cart' | 'product',
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
            >
              <option value="cart">Tutto il carrello</option>
              <option value="product">Singolo prodotto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data scadenza
            </label>
            <input
              type="date"
              value={discountForm.expiry_date}
              onChange={(e) => setDiscountForm({ ...discountForm, expiry_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={discountForm.is_active}
                onChange={(e) =>
                  setDiscountForm({ ...discountForm, is_active: e.target.checked })
                }
                className="w-4 h-4 text-primary-500 focus:ring-primary-500 rounded"
              />
              <span className="text-sm text-gray-700">Codice attivo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowDiscountModal(false);
                setEditingDiscount(null);
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              {editingDiscount ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showBrandModal}
        onClose={() => {
          setShowBrandModal(false);
          setEditingBrand(null);
          setBrandForm({ name: '' });
        }}
        title={editingBrand ? 'Modifica brand' : 'Nuovo brand'}
      >
        <form onSubmit={handleSubmitBrand} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome brand *
            </label>
            <input
              type="text"
              value={brandForm.name}
              onChange={(e) => setBrandForm({ name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. Nike"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowBrandModal(false);
                setEditingBrand(null);
                setBrandForm({ name: '' });
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              {editingBrand ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteDiscount}
        title="Elimina codice sconto"
        message={`Sei sicuro di voler eliminare il codice "${discountToDelete?.code}"?`}
        confirmText="Elimina"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showBrandDeleteConfirm}
        onClose={() => setShowBrandDeleteConfirm(false)}
        onConfirm={confirmDeleteBrand}
        title="Elimina brand"
        message={`Sei sicuro di voler eliminare il brand "${brandToDelete?.name}"?`}
        confirmText="Elimina"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showCategoryDeleteConfirm}
        onClose={() => setShowCategoryDeleteConfirm(false)}
        onConfirm={confirmDeleteCategory}
        title="Elimina categoria"
        message={`Sei sicuro di voler eliminare la categoria "${categoryToDelete?.name}"? I prodotti associati perderanno questa categoria.`}
        confirmText="Elimina"
        variant="danger"
      />

      <Modal
        isOpen={showTypologyModal}
        onClose={() => {
          setShowTypologyModal(false);
          setEditingTypology(null);
          setTypologyForm({ name: '' });
        }}
        title={editingTypology ? 'Modifica tipologia' : 'Nuova tipologia'}
      >
        <form onSubmit={handleSubmitTypology} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome tipologia *
            </label>
            <input
              type="text"
              value={typologyForm.name}
              onChange={(e) => setTypologyForm({ name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. Proteine"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowTypologyModal(false);
                setEditingTypology(null);
                setTypologyForm({ name: '' });
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              {editingTypology ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showTypologyDeleteConfirm}
        onClose={() => setShowTypologyDeleteConfirm(false)}
        onConfirm={confirmDeleteTypology}
        title="Elimina tipologia"
        message={`Sei sicuro di voler eliminare la tipologia "${typologyToDelete?.name}"? I prodotti associati perderanno questa tipologia.`}
        confirmText="Elimina"
        variant="danger"
      />
    </div>
  );
}
