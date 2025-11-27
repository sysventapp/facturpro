
import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { X, Search, Loader2, Save } from 'lucide-react';
import { searchClient } from '../services/clientService';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  apiToken: string;
  initialData?: Client | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, apiToken, initialData }) => {
  const [docType, setDocType] = useState<'DNI' | 'RUC' | '-'>('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDocType(initialData.docType);
      setDocNumber(initialData.docNumber);
      setName(initialData.name);
      setAddress(initialData.address);
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setDocType('DNI');
    setDocNumber('');
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
  };

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!docNumber || docType === '-') return;
    
    setIsSearching(true);
    try {
      const result = await searchClient(docType as 'DNI'|'RUC', docNumber, apiToken);
      if (result) {
        if (result.name) setName(result.name);
        if (result.address) setAddress(result.address);
      } else {
        alert('No se encontraron datos en la API. Por favor ingrese manualmente.');
      }
    } catch (e) {
      alert('Error de conexión con la API.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('El nombre es obligatorio');
      return;
    }
    
    onSave({
      docType,
      docNumber: docNumber || '-', // Default to dash if empty
      name: name.toUpperCase(),
      address: address.toUpperCase(),
      phone,
      email
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Doc Type Selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['DNI', 'RUC', '-'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => { setDocType(type); setDocNumber(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${docType === type ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {type === '-' ? 'SIN DOC' : type}
              </button>
            ))}
          </div>

          {/* Doc Number & Search */}
          {docType !== '-' && (
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1">NÚMERO DE DOCUMENTO</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={docType === 'DNI' ? 8 : 11}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder={docType === 'DNI' ? '8 dígitos' : '11 dígitos'}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !docNumber}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">RAZÓN SOCIAL / NOMBRE</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              placeholder="Nombre del cliente"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">DIRECCIÓN (Opcional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              placeholder="Av. Principal 123..."
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">TELÉFONO</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="999..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="cliente@mail.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Save size={18} />
            GUARDAR CLIENTE
          </button>

        </form>
      </div>
    </div>
  );
};

export default ClientModal;
