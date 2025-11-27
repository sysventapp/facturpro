
import React, { useState, useEffect } from 'react';
import { Product, CartItem, Invoice, InvoiceType, Client, Company, SunatResponse, IgvType, UnitCode, PaymentMethod } from './types';
import { sendBillToSunat } from './services/sunatService';
import { calculateTotals } from './utils/calculations';
import { 
  dbGetClients, dbCreateClient, 
  dbGetProducts, dbCreateProduct, 
  dbGetInvoices, dbCreateInvoice,
  dbGetCompany, dbSaveCompany
} from './services/dbService';

// Components
import Layout from './components/Layout';
import InventoryModal from './components/InventoryModal';
import InvoiceReceipt from './components/InvoiceReceipt';
import SalesHistory from './components/SalesHistory';
import ClientModal from './components/ClientModal';

// Views
import Dashboard from './views/Dashboard';
import PointOfSale from './views/PointOfSale';
import Inventory from './views/Inventory';
import Clients from './views/Clients';
import Settings from './views/Settings';
import { Loader2 } from 'lucide-react';

// Fallback data only if DB is empty
const INITIAL_COMPANY: Company = {
  ruc: '20123456789',
  razonSocial: 'MI EMPRESA DEMO S.A.C.',
  address: 'Av. Pruebas 123, Lima',
  ubigeo: '150101',
  solUser: 'MODDATOS', 
  solPass: 'MODDATOS', 
  apiToken: 'sk_1788.HCItQaSi85wlaVxswQnuEhnf7hJIRVB3', 
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  serieFactura: 'F001',
  serieBoleta: 'B001'
};

export default function App() {
  // Global State
  const [view, setView] = useState('DASHBOARD');
  const [isLoading, setIsLoading] = useState(true);
  
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modals
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);

  // --- LOAD DATA FROM SUPABASE ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [dbClients, dbProducts, dbInvoices, dbCompany] = await Promise.all([
          dbGetClients(),
          dbGetProducts(),
          dbGetInvoices(),
          dbGetCompany()
        ]);

        if (dbClients) setClients(dbClients);
        if (dbProducts) setProducts(dbProducts);
        if (dbInvoices) setInvoiceHistory(dbInvoices);
        if (dbCompany) setCompany(dbCompany);

      } catch (error: any) {
        console.error("Error crítico cargando datos:", error.message || error);
        // No fallar totalmente, permitir usar la app vacía
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- ACTIONS ---

  const handleSaveCompany = async (newCompany: Company) => {
    setCompany(newCompany);
    try {
        await dbSaveCompany(newCompany);
    } catch (e) {
        console.error("Error guardando empresa", e);
        alert("Error al guardar configuración en la nube");
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      return existing 
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      // Optimistic update
      const tempId = Math.random().toString(36);
      const tempProduct = { ...newProductData, id: tempId };
      setProducts(prev => [...prev, tempProduct]);
      
      // DB Save
      const savedProduct = await dbCreateProduct(newProductData);
      
      // Replace temp with real ID
      setProducts(prev => prev.map(p => p.id === tempId ? savedProduct : p));
    } catch (e) {
      console.error(e);
      alert("Error al guardar producto en base de datos");
    }
  };

  const handleAddClient = async (newClient: Client): Promise<Client> => { // Changed to async
    try {
      // Save to DB first to get ID
      const savedClient = await dbCreateClient(newClient);
      setClients(prev => [savedClient, ...prev]);
      return savedClient;
    } catch (e) {
      console.error(e);
      alert("Error al guardar cliente");
      return newClient; // Fallback
    }
  };

  // Wrapper para handleAddClient que sea compatible con la firma sincrona del componente si es necesario,
  // pero PointOfSale ya espera promesa o puede manejarlo.
  const handleAddClientWrapper = (newClient: Client) => {
      // Esta función se pasa a componentes que esperan retorno inmediato
      // Hacemos optimistic update
      const tempClient = { ...newClient, id: 'temp-' + Date.now() };
      setClients(prev => [tempClient, ...prev]);
      
      // Async DB save
      dbCreateClient(newClient).then(saved => {
          setClients(prev => prev.map(c => c.id === tempClient.id ? saved : c));
      });
      
      return tempClient;
  };

  const handleCheckout = async (docType: InvoiceType, client: Client, paymentMethod: PaymentMethod) => {
    // 1. Prepare Data
    let serie = 'NV01';
    if (docType === InvoiceType.BOLETA) serie = company.serieBoleta;
    if (docType === InvoiceType.FACTURA) serie = company.serieFactura;
    
    // Calcular correlativo basado en historial (filtrar por tipo)
    const lastInvoice = invoiceHistory.filter(inv => inv.type === docType).sort((a,b) => b.correlativo - a.correlativo)[0];
    const nextCorrelativo = lastInvoice ? lastInvoice.correlativo + 1 : 1;
    const totals = calculateTotals(cart);

    const tempInvoice: Invoice = {
      id: 'temp-id', // Will be replaced by DB
      serie, correlativo: nextCorrelativo, 
      type: docType,
      client: client,
      paymentMethod: paymentMethod,
      items: [...cart], totals, date: new Date().toISOString(),
      qrCodeData: '', sunatStatus: 'PENDING'
    };

    // 2. Process with SUNAT Service (Simulated)
    let response: SunatResponse;
    if (docType === InvoiceType.NOTA_VENTA) {
      response = { success: true, description: 'Nota de Venta generada.', xmlSigned: '', hash: '' };
      await new Promise(r => setTimeout(r, 500));
    } else {
      response = await sendBillToSunat(tempInvoice, company);
    }

    // 3. Finalize Object
    const finalInvoice = {
      ...tempInvoice,
      sunatStatus: docType === InvoiceType.NOTA_VENTA ? 'INTERNAL' : (response.success ? 'ACCEPTED' : 'REJECTED'),
      sunatResponse: response,
      qrCodeData: `${company.ruc}|${docType}|${serie}|${String(tempInvoice.correlativo).padStart(8, '0')}|${totals.igv.toFixed(2)}|${totals.total.toFixed(2)}|${tempInvoice.date.split('T')[0]}|${client.docType}|${client.docNumber}|${response.hash || ''}|`
    } as Invoice;

    // 4. Save to DB & State
    try {
        await dbCreateInvoice(finalInvoice);
        // Recargamos facturas para tener el ID real o usamos el local
        setGeneratedInvoice(finalInvoice);
        setInvoiceHistory(prev => [finalInvoice, ...prev]);
        setCart([]);
    } catch (e) {
        console.error("Error guardando venta en DB:", e);
        alert("La venta se procesó en SUNAT (Simulado) pero falló al guardar en base de datos local.");
    }
  };

  if (isLoading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
              <Loader2 size={48} className="animate-spin mb-4 text-sunat-primary" />
              <p>Conectando con Supabase...</p>
          </div>
      );
  }

  return (
    <Layout currentView={view} setView={setView} company={company}>
      {view === 'DASHBOARD' && (
        <Dashboard 
          invoices={invoiceHistory} 
          products={products} 
          clients={clients} 
          onNavigateToPos={() => setView('POS')} 
        />
      )}
      
      {view === 'POS' && (
        <PointOfSale 
          products={products}
          clients={clients}
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          onCheckout={handleCheckout}
          onAddClient={handleAddClientWrapper}
        />
      )}

      {view === 'INVENTORY' && (
        <Inventory 
          products={products} 
          onOpenModal={() => setIsInventoryModalOpen(true)} 
        />
      )}

      {view === 'HISTORY' && (
        <SalesHistory 
          invoices={invoiceHistory} 
          onViewReceipt={setGeneratedInvoice} 
        />
      )}

      {view === 'CLIENTS' && (
        <Clients clients={clients} onOpenModal={() => setIsClientModalOpen(true)} />
      )}

      {view === 'SETTINGS' && (
        <Settings company={company} setCompany={handleSaveCompany} />
      )}

      {/* Global Modals */}
      <InventoryModal 
        isOpen={isInventoryModalOpen} 
        onClose={() => setIsInventoryModalOpen(false)} 
        onSave={handleAddProduct} 
      />

      <ClientModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleAddClientWrapper}
        apiToken={company.apiToken || ''}
      />
      
      {generatedInvoice && (
        <InvoiceReceipt 
          invoice={generatedInvoice} 
          company={company} 
          onClose={() => setGeneratedInvoice(null)} 
        />
      )}
    </Layout>
  );
}
