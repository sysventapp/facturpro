
import React, { useState } from 'react';
import { Building, Server, Search, MessageSquare } from 'lucide-react';
import { Company } from '../types';

interface SettingsProps {
  company: Company;
  setCompany: (c: Company) => void;
}

const Settings: React.FC<SettingsProps> = ({ company, setCompany }) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'APIS'>('COMPANY');

  return (
    <div className="p-6 lg:p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sistema</h2>
        
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('COMPANY')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'COMPANY' ? 'border-b-2 border-sunat-primary text-sunat-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            <Building size={18} /> Empresa
          </button>
          <button onClick={() => setActiveTab('APIS')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'APIS' ? 'border-b-2 border-sunat-primary text-sunat-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            <Server size={18} /> APIs y Servicios
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'COMPANY' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Datos Generales</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <div className="flex gap-2">
                    <input value={company.logoUrl || ''} onChange={e => setCompany({...company, logoUrl: e.target.value})} className="flex-1 p-2 border rounded focus:ring-2 focus:ring-sunat-primary outline-none text-sm" placeholder="https://ejemplo.com/logo.png" />
                    {company.logoUrl && <img src={company.logoUrl} alt="Preview" className="h-10 w-10 object-contain border rounded bg-gray-50" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Ingresa una URL pública de tu imagen</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                    <input value={company.ruc} onChange={e => setCompany({...company, ruc: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-sunat-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                    <input value={company.razonSocial} onChange={e => setCompany({...company, razonSocial: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-sunat-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal</label>
                  <input value={company.address} onChange={e => setCompany({...company, address: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-sunat-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario SOL (Sunat)</label>
                    <input value={company.solUser} onChange={e => setCompany({...company, solUser: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clave SOL</label>
                    <input type="password" value={company.solPass} onChange={e => setCompany({...company, solPass: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serie Factura</label>
                    <input value={company.serieFactura} onChange={e => setCompany({...company, serieFactura: e.target.value})} className="w-full p-2 border rounded bg-gray-50 font-mono text-sm" placeholder="F001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serie Boleta</label>
                    <input value={company.serieBoleta} onChange={e => setCompany({...company, serieBoleta: e.target.value})} className="w-full p-2 border rounded bg-gray-50 font-mono text-sm" placeholder="B001" />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-sm text-gray-700 mb-2">Certificado Digital (.pfx)</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                    <p className="text-xs text-gray-400 mb-2">La firma digital debe realizarse en backend.</p>
                    <button disabled className="text-gray-400 text-xs font-medium border border-gray-200 px-3 py-2 rounded bg-white cursor-not-allowed">Subir Certificado (Solo Producción)</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'APIS' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2"><Search size={20} /> Consulta DNI / RUC</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token de API (Decolecta / ApisPeru)</label>
                    <input value={company.apiToken || ''} onChange={e => setCompany({...company, apiToken: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-sunat-primary outline-none font-mono text-sm" placeholder="sk_..." />
                    <p className="text-xs text-gray-500 mt-1">Este token se usará para autocompletar clientes en el POS.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2 text-green-700"><MessageSquare size={20} /> WhatsApp API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID de Instancia</label>
                    <input value={company.whatsappInstance || ''} onChange={e => setCompany({...company, whatsappInstance: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ej. instance12345" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token de WhatsApp</label>
                    <input value={company.whatsappToken || ''} onChange={e => setCompany({...company, whatsappToken: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="Token de acceso" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100">
                  <p>Configuración preparada para futuras integraciones de envío de comprobantes por WhatsApp.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
