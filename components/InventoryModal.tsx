import React, { useState } from 'react';
import { Product, IgvType, UnitCode } from '../types';
import { X, Wand2, Loader2 } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [igvType, setIgvType] = useState<IgvType>(IgvType.GRAVADO);
  const [unitCode, setUnitCode] = useState<UnitCode>(UnitCode.NIU);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDescription = async () => {
    if (!name || !category) {
      alert("Por favor ingresa nombre y categoría para generar una descripción.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(name, category);
    setDescription(desc);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      igvType,
      unitCode
    });
    // Reset form
    setName('');
    setCategory('');
    setPrice('');
    setStock('');
    setDescription('');
    setIgvType(IgvType.GRAVADO);
    setUnitCode(UnitCode.NIU);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-sunat-primary px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg">Nuevo Producto</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none"
              placeholder="Ej. Gaseosa Inka Cola 500ml"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Abarrotes">Abarrotes</option>
                <option value="Snacks">Snacks</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Servicios">Servicios</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad Medida</label>
              <select
                required
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value as UnitCode)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none"
              >
                <option value={UnitCode.NIU}>Unidad (NIU)</option>
                <option value={UnitCode.ZZ}>Servicio (ZZ)</option>
                <option value={UnitCode.KGM}>Kilos (KGM)</option>
                <option value={UnitCode.LTR}>Litros (LTR)</option>
                <option value={UnitCode.BX}>Caja (BX)</option>
                <option value={UnitCode.GLL}>Galones (GLL)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario (S/)</label>
              <input
                type="number"
                required
                min="0.10"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Impuesto (IGV)</label>
              <select
                required
                value={igvType}
                onChange={(e) => setIgvType(e.target.value as IgvType)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none text-sm"
              >
                <option value={IgvType.GRAVADO}>Gravado (18% IGV)</option>
                <option value={IgvType.EXONERADO}>Exonerado (0% IGV)</option>
                <option value={IgvType.INAFECTO}>Inafecto (0% IGV)</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                Gravado: Mayoría de productos. Exonerado: Libros, productos agrícolas.
              </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Descripción (IA)</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-purple-600 font-semibold hover:text-purple-800 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />}
                Generar con Gemini
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-sunat-primary focus:outline-none text-sm"
              placeholder="Descripción automática o manual..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sunat-primary text-white rounded hover:bg-blue-700 font-medium shadow-sm"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;