
import React from 'react';
import { Client } from '../types';
import { Plus } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  onOpenModal: () => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, onOpenModal }) => {
  return (
    <div className="p-6 lg:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cartera de Clientes</h2>
            <div className="text-sm text-gray-500">Gestión de base de datos de clientes</div>
          </div>
          <button 
            onClick={onOpenModal} 
            className="bg-sunat-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex gap-2 items-center"
          >
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Documento</th>
              <th className="px-6 py-3">Razón Social / Nombre</th>
              <th className="px-6 py-3">Dirección</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((c, i) => (
              <tr key={c.id || i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 flex flex-col">
                  <span>{c.docNumber}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{c.docType}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{c.name}</td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{c.address || '-'}</td>
                <td className="px-6 py-4 text-gray-500">{c.phone || '-'}</td>
                <td className="px-6 py-4 text-right text-blue-600 hover:underline cursor-pointer">Editar</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
