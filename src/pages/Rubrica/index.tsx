import { useState, useMemo } from 'react';
import { Header } from '../../components/Header';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ContactForm } from './ContactForm';
import { useContacts } from '../../hooks/useContacts';
import type { Contact } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export function Rubrica() {
  const { contacts, addContact, updateContact, deleteContact } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cliente' | 'fornitore'>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || contact.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [contacts, searchQuery, typeFilter]);

  const handleAddContact = () => {
    setEditingContact(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (contactToDelete) {
      await deleteContact(contactToDelete.id);
      setContactToDelete(null);
      if (selectedContact?.id === contactToDelete.id) {
        setSelectedContact(null);
      }
    }
  };

  const handleSubmitContact = async (data: Partial<Contact>) => {
    if (editingContact) {
      await updateContact(editingContact.id, data);
    } else {
      await addContact(data);
    }
    setShowContactModal(false);
    setEditingContact(null);
  };

  const customerCount = contacts.filter((c) => c.type === 'cliente').length;
  const supplierCount = contacts.filter((c) => c.type === 'fornitore').length;

  return (
    <div>
      <Header title="Rubrica" />

      <div className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca contatto..."
                className="w-80 pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tutti ({contacts.length})
              </button>
              <button
                onClick={() => setTypeFilter('cliente')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                  typeFilter === 'cliente'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Clienti ({customerCount})
              </button>
              <button
                onClick={() => setTypeFilter('fornitore')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                  typeFilter === 'fornitore'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Fornitori ({supplierCount})
              </button>
            </div>
          </div>

          <button
            onClick={handleAddContact}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Plus size={20} />
            Nuovo Contatto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Users size={48} className="mb-3" />
                  <p className="text-lg">Nessun contatto trovato</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              contact.type === 'cliente'
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {contact.type === 'cliente' ? (
                              <Users size={20} />
                            ) : (
                              <Building2 size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.company_name}</p>
                            <p className="text-sm text-gray-500">
                              {contact.type === 'cliente' ? 'Cliente' : 'Fornitore'}
                              {contact.city && ` - ${contact.city}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditContact(contact);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact);
                            }}
                            className="p-2 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-gray-500 hover:text-danger-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedContact ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedContact.type === 'cliente'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {selectedContact.type === 'cliente' ? (
                      <Users size={24} />
                    ) : (
                      <Building2 size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedContact.company_name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedContact.type === 'cliente'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {selectedContact.type === 'cliente' ? 'Cliente' : 'Fornitore'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedContact.vat && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                        Partita IVA
                      </p>
                      <p className="text-gray-900">{selectedContact.vat}</p>
                    </div>
                  )}

                  {selectedContact.fiscal_code && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                        Codice Fiscale
                      </p>
                      <p className="text-gray-900">{selectedContact.fiscal_code}</p>
                    </div>
                  )}

                  {(selectedContact.address || selectedContact.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        {selectedContact.address && (
                          <p className="text-gray-900">{selectedContact.address}</p>
                        )}
                        <p className="text-gray-600">
                          {[
                            selectedContact.postal_code,
                            selectedContact.city,
                            selectedContact.province,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-gray-400" />
                      <a
                        href={`tel:${selectedContact.phone}`}
                        className="text-primary-600 hover:underline"
                      >
                        {selectedContact.phone}
                      </a>
                    </div>
                  )}

                  {selectedContact.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-gray-400" />
                      <a
                        href={`tel:${selectedContact.mobile}`}
                        className="text-primary-600 hover:underline"
                      >
                        {selectedContact.mobile}
                      </a>
                    </div>
                  )}

                  {selectedContact.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-gray-400" />
                      <a
                        href={`mailto:${selectedContact.email}`}
                        className="text-primary-600 hover:underline"
                      >
                        {selectedContact.email}
                      </a>
                    </div>
                  )}

                  {selectedContact.notes && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Note</p>
                      <p className="text-gray-600 text-sm">{selectedContact.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEditContact(selectedContact)}
                    className="w-full px-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Modifica contatto
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-gray-400 h-64">
                <Users size={32} className="mb-2" />
                <p>Seleziona un contatto</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Modifica contatto' : 'Nuovo contatto'}
        size="lg"
      >
        <ContactForm
          contact={editingContact}
          onSubmit={handleSubmitContact}
          onCancel={() => {
            setShowContactModal(false);
            setEditingContact(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Elimina contatto"
        message={`Sei sicuro di voler eliminare "${contactToDelete?.company_name}"? Questa azione non puo essere annullata.`}
        confirmText="Elimina"
        variant="danger"
      />
    </div>
  );
}
