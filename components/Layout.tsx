
import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingCart, FileText, Package, Users, Settings, 
  Store, TestTube2, LogOut, Menu, Bell, User 
} from 'lucide-react';
import { Company } from '../types';

interface LayoutProps {
  currentView: string;
  setView: (view: any) => void;
  company: Company;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, company, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setView(id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        currentView === id 
          ? 'bg-blue-50 text-sunat-primary border-r-4 border-sunat-primary' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Store className="text-sunat-primary mr-2" size={28} />
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">FactuPeru</h1>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">SISTEMA BASE</span>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>
          <SidebarItem id="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="POS" icon={ShoppingCart} label="Punto de Venta" />
          <SidebarItem id="HISTORY" icon={FileText} label="Historial y CDR" />
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestión</div>
          <SidebarItem id="INVENTORY" icon={Package} label="Inventario" />
          <SidebarItem id="CLIENTS" icon={Users} label="Clientes" />
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sistema</div>
          <SidebarItem id="SETTINGS" icon={Settings} label="Configuración" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
           <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
             <div className="flex items-center gap-2 text-orange-700 font-bold text-xs mb-1">
               <TestTube2 size={14} /> MODO BETA
             </div>
             <p className="text-[10px] text-orange-600 leading-tight">
               Conectado al entorno de pruebas de SUNAT (Beta). User: {company.solUser}.
             </p>
           </div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-sunat-primary text-white flex items-center justify-center font-bold">A</div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
               <p className="text-xs text-gray-500 truncate">admin@empresa.com</p>
             </div>
             <button className="text-gray-400 hover:text-red-500"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* HEADER */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-gray-600 rounded-md hover:bg-gray-100">
                <Menu size={24} />
             </button>
             <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">
                <TestTube2 size={14} /> SUNAT BETA (PRUEBAS)
             </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden md:inline">Empresa:</span>
            <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                {company.logoUrl && <img src={company.logoUrl} className="w-5 h-5 object-contain" alt="logo" />}
                {company.razonSocial}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1"></div>
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
               <User size={20} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* VIEW CONTAINER */}
        <main className="flex-1 overflow-hidden relative">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
