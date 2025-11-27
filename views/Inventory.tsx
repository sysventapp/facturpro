
import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onOpenModal: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onOpenModal }) => {
  return (
    <div className="p-6 lg:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Inventario</h2>
          <button onClick={onOpenModal} className="bg-sunat-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex gap-2 items-center">
            <Plus size={16} /> Nuevo
          </button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3 text-right">Precio</th>
              <th className="px-6 py-3">Unidad</th>
              <th className="px-6 py-3">Impuesto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4 text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{p.category}</span></td>
                <td className="px-6 py-4">{p.stock}</td>
                <td className="px-6 py-4 text-right font-medium">S/ {p.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-xs text-gray-500 font-mono">{p.unitCode || 'NIU'}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{p.igvType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
