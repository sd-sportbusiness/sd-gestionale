import { useState, useEffect } from 'react';
import type { Contact } from '../../types';

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: Partial<Contact>) => void;
  onCancel: () => void;
  fixedType?: 'cliente' | 'fornitore';
}

export function ContactForm({ contact, onSubmit, onCancel, fixedType }: ContactFormProps) {
  const [formData, setFormData] = useState({
    type: (fixedType || 'cliente') as 'cliente' | 'fornitore',
    company_name: '',
    vat: '',
    fiscal_code: '',
    address: '',
    city: '',
    postal_code: '',
    province: '',
    phone: '',
    mobile: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        type: fixedType || contact.type,
        company_name: contact.company_name,
        vat: contact.vat || '',
        fiscal_code: contact.fiscal_code || '',
        address: contact.address || '',
        city: contact.city || '',
        postal_code: contact.postal_code || '',
        province: contact.province || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        email: contact.email || '',
        notes: contact.notes || '',
      });
    }
  }, [contact, fixedType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      vat: formData.vat || null,
      fiscal_code: formData.fiscal_code || null,
      address: formData.address || null,
      city: formData.city || null,
      postal_code: formData.postal_code || null,
      province: formData.province || null,
      phone: formData.phone || null,
      mobile: formData.mobile || null,
      email: formData.email || null,
      notes: formData.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!fixedType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipologia *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="cliente"
                checked={formData.type === 'cliente'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'cliente' | 'fornitore' })
                }
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">Cliente</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="fornitore"
                checked={formData.type === 'fornitore'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'cliente' | 'fornitore' })
                }
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">Fornitore</span>
            </label>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Ragione sociale / Nome *
        </label>
        <input
          type="text"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Partita IVA</label>
          <input
            type="text"
            value={formData.vat}
            onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Codice Fiscale</label>
          <input
            type="text"
            value={formData.fiscal_code}
            onChange={(e) => setFormData({ ...formData, fiscal_code: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Indirizzo</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          placeholder="Via, numero civico"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">CAP</label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Citta</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            maxLength={2}
            placeholder="Es. MI"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cellulare</label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Note</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
        />
      </div>

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
          {contact ? 'Aggiorna' : 'Aggiungi'}
        </button>
      </div>
    </form>
  );
}
