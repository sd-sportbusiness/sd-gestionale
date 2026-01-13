import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Modal } from '../../components/Modal';
import { ContactForm } from '../Rubrica/ContactForm';
import type { Product, Category, Brand, Typology, Contact } from '../../types';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage, formatFileSize, type CompressionResult } from '../../lib/imageCompression';
import { uploadProductImage, compressImage as compressForUpload } from '../../lib/storage';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  typologies: Typology[];
  suppliers: Contact[];
  onSubmit: (data: Partial<Product>, saveToInventory?: boolean) => void;
  onCancel: () => void;
  onAddBrand: (name: string) => Promise<Brand | null>;
  onAddTypology: (name: string) => Promise<Typology | null>;
  onAddCategory: (name: string) => Promise<Category | null>;
  onAddSupplier: (data: Partial<Contact>) => Promise<Contact | null>;
  initialBarcode?: string;
  showSaveToInventoryOption?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ProductForm({
  product,
  categories,
  brands,
  typologies,
  suppliers,
  onSubmit,
  onCancel,
  onAddBrand,
  onAddTypology,
  onAddCategory,
  onAddSupplier,
  initialBarcode,
  showSaveToInventoryOption = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    barcode: initialBarcode || '',
    brand_id: '',
    name: '',
    description: '',
    category_id: '',
    typology_id: '',
    supplier_id: '',
    size: '',
    flavor: '',
    purchase_price: 0,
    sale_price: 0,
    stock: 0,
    min_stock: 5,
    availability: 'both' as 'store_only' | 'online_only' | 'both',
    online_link: '',
  });

  const [imageData, setImageData] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [showTypologyModal, setShowTypologyModal] = useState(false);
  const [newTypologyName, setNewTypologyName] = useState('');
  const [isAddingTypology, setIsAddingTypology] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [saveToInventory, setSaveToInventory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode || '',
        brand_id: product.brand_id || '',
        name: product.name,
        description: product.description || '',
        category_id: product.category_id || '',
        typology_id: product.typology_id || '',
        supplier_id: product.supplier_id || '',
        size: product.size || '',
        flavor: product.flavor || '',
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        stock: product.stock,
        min_stock: product.min_stock,
        availability: product.availability,
        online_link: product.online_link || '',
      });
      setImageData(product.image_data || null);
      setImageUrl(product.image_url || null);
    } else if (initialBarcode) {
      setFormData((prev) => ({ ...prev, barcode: initialBarcode }));
    }
  }, [product, initialBarcode]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === formData.category_id);
  }, [categories, formData.category_id]);

  const isAbbigliamento = selectedCategory?.name?.toLowerCase() === 'abbigliamento';
  const isIntegratori = selectedCategory?.name?.toLowerCase() === 'integratori';

  const handleFileChange = useCallback(async (file: File) => {
    console.log('File selezionato:', file.name, 'Tipo:', file.type, 'Dimensione:', file.size);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`Formato non supportato (${file.type}). Usa JPG, PNG o WEBP.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Immagine troppo grande (${formatFileSize(file.size)}). Massimo 10MB.`);
      return;
    }

    setIsCompressing(true);

    try {
      // Comprimi l'immagine
      const compressedFile = await compressForUpload(file, 800, 0.7);
      
      // Upload su Supabase Storage
      const tempId = product?.id || `temp-${Date.now()}`;
      const url = await uploadProductImage(compressedFile, tempId);

      if (url) {
        setImageUrl(url);
        setImageData(null);
        toast.success('Immagine caricata con successo');
      } else {
        toast.error('Errore nel caricamento immagine');
      }
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      toast.error(`Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setIsCompressing(false);
    }
  }, [product?.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [handleFileChange]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [handleFileChange]
  );

  const handleRemoveImage = useCallback(() => {
    setImageData(null);
    setImageUrl(null);
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setShowBrandModal(true);
    } else {
      setFormData({ ...formData, brand_id: value });
    }
  };

  const handleAddNewBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    setIsAddingBrand(true);
    const newBrand = await onAddBrand(newBrandName.trim());
    setIsAddingBrand(false);

    if (newBrand) {
      setFormData({ ...formData, brand_id: newBrand.id });
      setShowBrandModal(false);
      setNewBrandName('');
    }
  };

  const handleTypologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setShowTypologyModal(true);
    } else {
      setFormData({ ...formData, typology_id: value });
    }
  };

  const handleAddNewTypology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypologyName.trim()) return;

    setIsAddingTypology(true);
    const newTypology = await onAddTypology(newTypologyName.trim());
    setIsAddingTypology(false);

    if (newTypology) {
      setFormData({ ...formData, typology_id: newTypology.id });
      setShowTypologyModal(false);
      setNewTypologyName('');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setShowCategoryModal(true);
    } else {
      setFormData({ ...formData, category_id: value });
    }
  };

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAddingCategory(true);
    const newCategory = await onAddCategory(newCategoryName.trim());
    setIsAddingCategory(false);

    if (newCategory) {
      setFormData({ ...formData, category_id: newCategory.id });
      setShowCategoryModal(false);
      setNewCategoryName('');
    }
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__add_new__') {
      setShowSupplierModal(true);
    } else {
      setFormData({ ...formData, supplier_id: value });
    }
  };

  const handleAddNewSupplier = async (data: Partial<Contact>) => {
    setIsAddingSupplier(true);
    const newSupplier = await onAddSupplier({ ...data, type: 'fornitore' });
    setIsAddingSupplier(false);

    if (newSupplier) {
      setFormData({ ...formData, supplier_id: newSupplier.id });
      setShowSupplierModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      barcode: formData.barcode || null,
      brand_id: formData.brand_id || null,
      description: formData.description || null,
      category_id: formData.category_id || null,
      typology_id: formData.typology_id || null,
      supplier_id: formData.supplier_id || null,
      size: isAbbigliamento ? (formData.size || null) : null,
      flavor: isIntegratori ? (formData.flavor || null) : null,
      online_link: formData.online_link || null,
      image_data: imageUrl ? null : imageData,
      image_url: imageUrl,
    }, saveToInventory);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Codice a barre (EAN)
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. 8001234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Brand / Marca
            </label>
            <select
              value={formData.brand_id}
              onChange={handleBrandChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
            >
              <option value="">Seleziona brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
              <option value="__add_new__" className="text-primary-600 font-medium">
                + Aggiungi nuovo brand
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome prodotto *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            placeholder="Es. Scarpe da running"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Descrizione
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
            placeholder="Descrizione del prodotto..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoria
            </label>
            <select
              value={formData.category_id}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
            >
              <option value="">Seleziona categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__add_new__" className="text-primary-600 font-medium">
                + Aggiungi nuova categoria
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tipologia
            </label>
            <select
              value={formData.typology_id}
              onChange={handleTypologyChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
            >
              <option value="">Seleziona tipologia</option>
              {typologies.map((typ) => (
                <option key={typ.id} value={typ.id}>
                  {typ.name}
                </option>
              ))}
              <option value="__add_new__" className="text-primary-600 font-medium">
                + Aggiungi nuova tipologia
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fornitore
          </label>
          <select
            value={formData.supplier_id}
            onChange={handleSupplierChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Seleziona fornitore</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.company_name}
              </option>
            ))}
            <option value="__add_new__" className="text-primary-600 font-medium">
              + Aggiungi nuovo fornitore
            </option>
          </select>
        </div>

        {isAbbigliamento && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Taglia
            </label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. S, M, L, XL, 42, 44..."
            />
          </div>
        )}

        {isIntegratori && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gusto
            </label>
            <input
              type="text"
              value={formData.flavor}
              onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. Cioccolato, Vaniglia, Fragola..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Prezzo di acquisto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Prezzo di vendita *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) =>
                  setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantità in stock
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Soglia sottoscorta
            </label>
            <input
              type="number"
              min="0"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Disponibilità *
          </label>
          <select
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value as 'store_only' | 'online_only' | 'both' })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
            required
          >
            <option value="both">Negozio + Online</option>
            <option value="store_only">Solo Negozio</option>
            <option value="online_only">Solo Online</option>
          </select>
        </div>

        {(formData.availability === 'online_only' || formData.availability === 'both') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Link acquisto online
            </label>
            <input
              type="url"
              value={formData.online_link}
              onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="https://..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Immagine prodotto
          </label>

          {isCompressing ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="text-sm font-medium text-gray-700">
                  Compressione in corso...
                </p>
              </div>
            </div>
          ) : (imageData || imageUrl) ? (
            <div className="relative">
              <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={imageUrl || imageData || ''}
                  alt="Anteprima"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              {compressionInfo && (
                <div className="mt-2 text-xs text-gray-500 text-center space-y-1">
                  <p>
                    Dimensione: {formatFileSize(compressionInfo.compressedSize)}
                    {compressionInfo.compressionRatio > 0 && (
                      <span className="text-success-600 ml-1">
                        (-{compressionInfo.compressionRatio}%)
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400">
                    Clicca X per rimuovere l'immagine
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`p-3 rounded-full ${
                    isDragging ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                >
                  {isDragging ? (
                    <Upload size={24} className="text-primary-600" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Rilascia qui' : 'Trascina immagine qui'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">oppure clicca per selezionare</p>
                </div>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WEBP - Max 10MB<br />
                  L'immagine sara automaticamente ottimizzata
                </p>
              </div>
            </div>
          )}
        </div>

        {showSaveToInventoryOption && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToInventory}
                onChange={(e) => setSaveToInventory(e.target.checked)}
                className="w-5 h-5 text-primary-500 focus:ring-primary-500 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Salva nel magazzino
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {saveToInventory 
                    ? 'Il prodotto verrà aggiunto al magazzino in modo permanente'
                    : 'Il prodotto verrà usato solo per questa transazione (temporaneo)'}
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
          >
            {product ? 'Aggiorna' : (showSaveToInventoryOption ? 'Aggiungi al carrello' : 'Aggiungi')}
          </button>
        </div>
      </form>

      <Modal
        isOpen={showBrandModal}
        onClose={() => {
          setShowBrandModal(false);
          setNewBrandName('');
        }}
        title="Nuovo brand"
      >
        <form onSubmit={handleAddNewBrand} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome brand *
            </label>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. Nike"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowBrandModal(false);
                setNewBrandName('');
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isAddingBrand}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isAddingBrand}
            >
              {isAddingBrand ? (
                'Creazione...'
              ) : (
                <>
                  <Plus size={18} />
                  Crea
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showTypologyModal}
        onClose={() => {
          setShowTypologyModal(false);
          setNewTypologyName('');
        }}
        title="Nuova tipologia"
      >
        <form onSubmit={handleAddNewTypology} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome tipologia *
            </label>
            <input
              type="text"
              value={newTypologyName}
              onChange={(e) => setNewTypologyName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. Proteine"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowTypologyModal(false);
                setNewTypologyName('');
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isAddingTypology}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isAddingTypology}
            >
              {isAddingTypology ? (
                'Creazione...'
              ) : (
                <>
                  <Plus size={18} />
                  Crea
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setNewCategoryName('');
        }}
        title="Nuova categoria"
      >
        <form onSubmit={handleAddNewCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome categoria *
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="Es. Abbigliamento"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategoryName('');
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isAddingCategory}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isAddingCategory}
            >
              {isAddingCategory ? (
                'Creazione...'
              ) : (
                <>
                  <Plus size={18} />
                  Crea
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Nuovo fornitore"
        size="lg"
      >
        <ContactForm
          onSubmit={handleAddNewSupplier}
          onCancel={() => setShowSupplierModal(false)}
          fixedType="fornitore"
        />
      </Modal>
    </>
  );
}
