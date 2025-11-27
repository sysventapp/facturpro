
import React, { useState } from 'react';
import { Search, ShoppingCart, Trash2, Loader2, CreditCard, StickyNote, User, X, Plus, Wallet, AlertCircle } from 'lucide-react';
import { Product, CartItem, InvoiceType, InvoiceTotals, Client, PaymentMethod } from '../types';
import { calculateTotals } from '../utils/calculations';
import ClientModal from '../components/ClientModal';

interface PointOfSaleProps {
  products: Product[];
  clients: Client[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  onCheckout: (docType: InvoiceType, client: Client, paymentMethod: PaymentMethod) => Promise<void>;
  onAddClient: (client: Client) => Client;
}

const PointOfSale: React.FC<PointOfSaleProps> = ({ 
  products, clients, cart, addToCart, removeFromCart, updateQuantity, onCheckout, onAddClient
}) => {
  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<InvoiceType>(InvoiceType.BOLETA);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CONTADO);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Client Management State
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentTotals: InvoiceTotals = calculateTotals(cart);

  // Filter clients for Omnibox
  const filteredClients = clientSearchTerm 
    ? clients.filter(c => 
        c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
        c.docNumber.includes(clientSearchTerm) ||
        (c.phone && c.phone.includes(clientSearchTerm))
      ).slice(0, 5) 
    : [];

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearchTerm('');
    setErrorMessage(null); // Limpiar error al seleccionar
    
    // Auto-switch invoice type based on selection
    if (client.docType === 'RUC') setSelectedDocType(InvoiceType.FACTURA);
    else if (client.docType === 'DNI') setSelectedDocType(InvoiceType.BOLETA);
  };

  const handleNewClientSave = (newClient: Client) => {
    const saved = onAddClient(newClient);
    handleSelectClient(saved);
  };

  const handleCheckoutClick = async () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage("El carrito está vacío. Agregue productos para continuar.");
      return;
    }
    
    // VALIDACIÓN 1: Cliente seleccionado
    if (!selectedClient) {
      setErrorMessage("⚠️ Debe escoger un cliente para procesar la venta. Use el buscador o el botón (+) para agregar uno.");
      return;
    }

    // VALIDACIÓN 2: Nombre Obligatorio
    if (!selectedClient.name || selectedClient.name.trim() === '' || selectedClient.name === '-') {
      setErrorMessage("Debe asignar un nombre válido al cliente antes de terminar la venta.");
      return;
    }

    // STRICT VALIDATION
    if (selectedDocType === InvoiceType.FACTURA && selectedClient.docType !== 'RUC') {
      setErrorMessage("Para emitir FACTURA, el cliente debe tener RUC.");
      return;
    }
    if (selectedDocType === InvoiceType.BOLETA && selectedClient.docType === '-') {
      if (!confirm("El cliente seleccionado no tiene documento. ¿Desea emitir BOLETA de todos modos? (Solo permitido para montos bajos)")) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      await onCheckout(selectedDocType, selectedClient, paymentMethod);
      // Reset after success
      setSelectedClient(null);
      setSelectedDocType(InvoiceType.BOLETA);
      setPaymentMethod(PaymentMethod.CONTADO);
      setErrorMessage(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocurrió un error al procesar la venta.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Product List Section */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100 flex flex-col">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar producto por nombre o código..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-sunat-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
              <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer border border-gray-100 group flex flex-col h-full transition-all hover:-translate-y-1">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{product.category}</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">S/ {product.price.toFixed(2)}</span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 mb-1 leading-snug">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                </div>
                <button className="mt-3 w-full bg-blue-50 text-sunat-primary py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    + AGREGAR
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Cart & Client */}
      <div className="w-96 bg-white shadow-2xl flex flex-col border-l border-gray-200 z-20 h-full">
          
          {/* 1. Header: Document Type Selection */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-2">
              <button onClick={() => setSelectedDocType(InvoiceType.BOLETA)} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${selectedDocType === InvoiceType.BOLETA ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>BOLETA</button>
              <button onClick={() => setSelectedDocType(InvoiceType.FACTURA)} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${selectedDocType === InvoiceType.FACTURA ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>FACTURA</button>
              <button onClick={() => setSelectedDocType(InvoiceType.NOTA_VENTA)} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${selectedDocType === InvoiceType.NOTA_VENTA ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>N. VENTA</button>
            </div>
          </div>

          {/* 2. Client Section - NEW OMNIBOX & CARD */}
          <div className="p-4 bg-blue-50/50 border-b border-gray-200 relative">
             {!selectedClient ? (
               <div className="relative">
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        value={clientSearchTerm}
                        onChange={(e) => {
                          setClientSearchTerm(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Buscar Cliente (DNI, RUC, Nombre...)"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunat-primary outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => setIsClientModalOpen(true)}
                      className="bg-sunat-primary text-white p-2 rounded-lg hover:bg-blue-700 shadow-sm"
                      title="Nuevo Cliente"
                    >
                      <Plus size={20} />
                    </button>
                 </div>
                 
                 {/* Autocomplete Dropdown */}
                 {clientSearchTerm && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 max-h-48 overflow-y-auto z-50">
                     {filteredClients.length > 0 ? (
                       filteredClients.map(client => (
                         <div 
                           key={client.id} 
                           onClick={() => handleSelectClient(client)}
                           className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                         >
                           <div className="font-bold text-sm text-gray-800">{client.name}</div>
                           <div className="text-xs text-gray-500 flex gap-2">
                             <span className="font-mono bg-gray-100 px-1 rounded">{client.docType}: {client.docNumber}</span>
                             {client.phone && <span>📞 {client.phone}</span>}
                           </div>
                         </div>
                       ))
                     ) : (
                       <div onClick={() => setIsClientModalOpen(true)} className="p-3 text-center text-blue-600 hover:bg-blue-50 cursor-pointer text-sm font-medium">
                         + Registrar nuevo "{clientSearchTerm}"
                       </div>
                     )}
                   </div>
                 )}
               </div>
             ) : (
               // Selected Client Card
               <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm relative group animate-in fade-in zoom-in duration-200">
                 <button 
                   onClick={() => setSelectedClient(null)} 
                   className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1"
                 >
                   <X size={16} />
                 </button>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                     <User size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-sm text-gray-900 truncate">{selectedClient.name}</h4>
                     <p className="text-xs text-gray-500 font-mono">{selectedClient.docType}: {selectedClient.docNumber}</p>
                     {selectedClient.address && <p className="text-[10px] text-gray-400 truncate">{selectedClient.address}</p>}
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* 3. Cart Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                  <ShoppingCart className="mb-2 opacity-20" size={40} />
                  <p>Agregue productos</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm group">
                  <div className="flex-1 pr-2">
                    <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                        <span className="font-mono bg-gray-100 px-1 rounded">{item.unitCode || 'NIU'}</span> S/ {item.price.toFixed(2)} unit.
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 h-full rounded-l-lg">-</button>
                        <span className="text-xs w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 text-gray-500 hover:text-green-500 hover:bg-gray-100 h-full rounded-r-lg">+</button>
                    </div>
                    <div className="text-right min-w-[60px]">
                        <div className="font-bold text-gray-900">S/ {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 4. Footer: Totals & Action */}
          <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            
            {/* Payment Method Selector */}
            <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-1"><Wallet size={14} /> Forma Pago:</span>
                <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-sunat-primary bg-gray-50"
                >
                    <option value={PaymentMethod.CONTADO}>Contado</option>
                    <option value={PaymentMethod.CREDITO}>Crédito</option>
                </select>
            </div>

            <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Op. Gravada</span>
                    <span>S/ {currentTotals.gravada.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>I.G.V. (18%)</span>
                    <span>S/ {currentTotals.igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-dashed pt-2 mt-2">
                    <span>TOTAL A PAGAR</span>
                    <span>S/ {currentTotals.total.toFixed(2)}</span>
                </div>
            </div>
            
            {/* MENSAJE DE ERROR EN LUGAR DE ALERT */}
            {errorMessage && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start animate-in slide-in-from-bottom-2">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-red-700 font-medium leading-tight whitespace-pre-line">{errorMessage}</p>
              </div>
            )}

            <button 
                onClick={handleCheckoutClick} 
                disabled={isProcessing} 
                className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${selectedDocType === InvoiceType.NOTA_VENTA ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gradient-to-r from-sunat-primary to-blue-600 hover:from-blue-700 hover:to-blue-800'}`}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : (selectedDocType === InvoiceType.NOTA_VENTA ? <StickyNote /> : <CreditCard />)} 
              {selectedDocType === InvoiceType.NOTA_VENTA ? 'GENERAR NOTA' : 'REGISTRAR'}
            </button>
          </div>

          {/* Hidden Client Modal - Triggered via state */}
          <ClientModal 
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            onSave={handleNewClientSave}
            apiToken={localStorage.getItem('apiToken') || 'sk_1788.HCItQaSi85wlaVxswQnuEhnf7hJIRVB3'} 
          />
      </div>
    </div>
  );
};

export default PointOfSale;
