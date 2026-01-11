import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { X, Tag } from 'lucide-react';
import type { Product, AppliedDiscount } from '../../types';
import { useDiscountCodes } from '../../hooks/useDiscountCodes';
import toast from 'react-hot-toast';

interface ProductDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  unitPrice: number;
  quantity: number;
  existingDiscounts: AppliedDiscount[];
  onApplyDiscount: (discount: AppliedDiscount) => void;
}

export function ProductDiscountModal({
  isOpen,
  onClose,
  product,
  unitPrice,
  quantity,
  existingDiscounts,
  onApplyDiscount,
}: ProductDiscountModalProps) {
  const [discountInput, setDiscountInput] = useState('');
  const { validateCode } = useDiscountCodes();

  const handleApply = () => {
    if (!discountInput.trim()) return;

    const code = validateCode(discountInput.trim());

    if (!code) {
      toast.error('Codice sconto non valido o scaduto');
      return;
    }

    if (code.applies_to !== 'product') {
      toast.error('Questo codice si applica all\'intero carrello');
      return;
    }

    if (existingDiscounts.some((d) => d.code === code.code)) {
      toast.error('Codice già applicato a questo prodotto');
      return;
    }

    const appliedDiscount: AppliedDiscount = {
      code: code.code,
      type: code.type,
      value: code.value,
    };

    onApplyDiscount(appliedDiscount);
    toast.success(`Sconto ${code.type === 'percentage' ? `${code.value}%` : `€${code.value}`} applicato`);
    setDiscountInput('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Applica sconto al prodotto" size="sm">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {quantity} x €{unitPrice.toFixed(2)} = €{(unitPrice * quantity).toFixed(2)}
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag size={16} />
            Codice sconto prodotto
          </label>
          <input
            type="text"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Inserisci codice..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            Annulla
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Tag size={18} />
            Applica
          </button>
        </div>
      </div>
    </Modal>
  );
}
