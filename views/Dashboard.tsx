
import React from 'react';
import { CreditCard, FileText, Package, Users } from 'lucide-react';
import { Invoice, Product, Client, InvoiceType } from '../types';

interface DashboardProps {
  invoices: Invoice[];
  products: Product[];
  clients: Client[];
  onNavigateToPos: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, products, clients, onNavigateToPos }) => {
  const totalSales = invoices.reduce((a, b) => a + b.totals.total, 0);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
        <p className="text-gray-500">Resumen general de su negocio hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Ventas del Día', val: `S/ ${totalSales.toFixed(2)}`, color: 'blue', icon: CreditCard },
          { label: 'Comprobantes', val: invoices.length, color: 'purple', icon: FileText },
          { label: 'Productos', val: products.length, color: 'orange', icon: Package },
          { label: 'Clientes', val: clients.length, color: 'green', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.val}</h3>
            </div>
            <div className={`p-3 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Ventas Recientes</h3>
          {invoices.length === 0 ? <p className="text-gray-400 text-sm">No hay datos recientes.</p> : (
            <div className="space-y-4">
              {invoices.slice(-5).reverse().map(inv => (
                <div key={inv.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{inv.client.name}</p>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-bold px-1 rounded ${inv.type === InvoiceType.NOTA_VENTA ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>{inv.serie}-{inv.correlativo}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">S/ {inv.totals.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 bg-gradient-to-br from-sunat-primary to-blue-800 text-white">
          <h3 className="font-bold text-lg mb-2">Bienvenido al Sistema Base</h3>
          <p className="text-blue-100 text-sm mb-6">Esta plantilla está configurada para el entorno BETA de SUNAT (MODDATOS).</p>
          <button onClick={onNavigateToPos} className="bg-white text-sunat-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
            Ir al Punto de Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
