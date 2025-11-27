
import React, { useState } from 'react';
import { Invoice, InvoiceType, Company } from '../types';
import { Printer, CheckCircle2, AlertTriangle, FileText, Download, Building2, MessageCircle, Send, Loader2 } from 'lucide-react';
import { sendInvoiceViaWhatsApp, generateWhatsAppLink } from '../services/whatsappService';

interface InvoiceReceiptProps {
  invoice: Invoice;
  company: Company;
  onClose: () => void;
}

const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({ invoice, company, onClose }) => {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendingWpp, setSendingWpp] = useState(false);
  
  const handleDownloadXML = () => {
    if (invoice.sunatResponse?.xmlSigned) {
      const blob = new Blob([invoice.sunatResponse.xmlSigned], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.ruc}-${invoice.type}-${invoice.serie}-${invoice.correlativo}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phoneNumber) return;
    
    setSendingWpp(true);
    
    // Try API send
    const result = await sendInvoiceViaWhatsApp(invoice, company, phoneNumber);
    
    setSendingWpp(false);
    
    if (result.success) {
        alert('Mensaje enviado (Simulado/API)');
        setShowPhoneInput(false);
    } else {
        // Fallback to Web Link if API fails or not configured
        if(confirm(`El envío automático falló: ${result.message}\n¿Desea abrir WhatsApp Web en su lugar?`)) {
            const link = generateWhatsAppLink(invoice, company, phoneNumber);
            window.open(link, '_blank');
            setShowPhoneInput(false);
        }
    }
  };

  const { totals } = invoice;

  // Título del documento
  const getDocTitle = () => {
    switch (invoice.type) {
        case InvoiceType.FACTURA: return 'FACTURA ELECTRÓNICA';
        case InvoiceType.BOLETA: return 'BOLETA DE VENTA ELECTRÓNICA';
        case InvoiceType.NOTA_VENTA: return 'NOTA DE VENTA';
        default: return 'COMPROBANTE';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Actions */}
        <div className="bg-gray-100 p-2 border-b">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    {invoice.sunatStatus === 'ACCEPTED' ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} /> ACEPTADO SUNAT
                    </span>
                    ) : invoice.sunatStatus === 'INTERNAL' ? (
                        <span className="flex items-center gap-1 text-gray-600 text-xs font-bold bg-gray-200 px-2 py-1 rounded-full">
                        <FileText size={12} /> USO INTERNO
                        </span>
                    ) : (
                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded-full">
                        <AlertTriangle size={12} /> RECHAZADO
                    </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 px-3 bg-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-400 transition-colors"
                >
                    Cerrar
                </button>
            </div>

            <div className="flex gap-2 justify-center">
                <button
                    onClick={() => setShowPhoneInput(!showPhoneInput)}
                    className={`flex-1 p-2 flex items-center justify-center gap-2 rounded transition-colors text-xs font-bold ${showPhoneInput ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    title="Enviar por WhatsApp"
                >
                    <MessageCircle size={16} /> WhatsApp
                </button>
                {invoice.type !== InvoiceType.NOTA_VENTA && (
                    <button
                    onClick={handleDownloadXML}
                    className="flex-1 p-2 bg-gray-200 text-gray-700 flex items-center justify-center gap-2 rounded hover:bg-gray-300 transition-colors text-xs font-bold"
                    title="Descargar XML UBL"
                    >
                    <FileText size={16} /> XML
                    </button>
                )}
                <button
                onClick={() => window.print()}
                className="flex-1 p-2 bg-blue-600 text-white flex items-center justify-center gap-2 rounded hover:bg-blue-700 transition-colors text-xs font-bold"
                title="Imprimir"
                >
                <Printer size={16} /> Imprimir
                </button>
            </div>

            {/* WhatsApp Input Slide-down */}
            {showPhoneInput && (
                <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                    <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="51999888777"
                        className="flex-1 border border-green-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        autoFocus
                    />
                    <button 
                        onClick={handleSendWhatsApp}
                        disabled={!phoneNumber || sendingWpp}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 text-sm font-bold"
                    >
                        {sendingWpp ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Enviar
                    </button>
                </div>
            )}
        </div>

        {/* Receipt Content - Scrollable */}
        <div className="p-6 overflow-y-auto font-mono text-sm leading-tight printable-area bg-white flex-1">
          {/* Header */}
          <div className="text-center mb-6">
            {company.logoUrl ? (
                <div className="flex justify-center mb-2">
                    <img src={company.logoUrl} alt="Logo" className="h-16 object-contain" />
                </div>
            ) : (
                <div className="flex justify-center mb-2 text-gray-300">
                    <Building2 size={40} />
                </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-900">{company.razonSocial}</h2>
            <p className="text-xs">RUC: {company.ruc}</p>
            <p className="text-xs">{company.address}</p>
            <p className="text-xs">Telf: (01) 555-1234</p>
            
            <div className="border-2 border-dashed border-gray-300 my-4 p-2 rounded">
              <h3 className="font-bold text-lg">
                {getDocTitle()}
              </h3>
              <p className="text-lg">{invoice.serie}-{String(invoice.correlativo).padStart(8, '0')}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-4 text-xs border-b border-gray-200 pb-2">
            <div className="grid grid-cols-[80px_1fr] gap-1">
              <span className="font-bold">Fecha:</span> <span>{new Date(invoice.date).toLocaleString()}</span>
              <span className="font-bold">Cliente:</span> <span>{invoice.client.name}</span>
              <span className="font-bold">{invoice.client.docType}:</span> <span>{invoice.client.docNumber}</span>
              <span className="font-bold">Dirección:</span> <span>{invoice.client.address || '-'}</span>
              <span className="font-bold">Moneda:</span> <span>SOLES</span>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-1">Cant.</th>
                <th className="text-left py-1">Descripción</th>
                <th className="text-right py-1">P.Unit</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1 align-top">{item.quantity}</td>
                  <td className="py-1 align-top">{item.name}</td>
                  <td className="py-1 align-top text-right">{item.price.toFixed(2)}</td>
                  <td className="py-1 align-top text-right">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="border-t border-black pt-2 mb-6 space-y-1">
            {totals.gravada > 0 && (
                <div className="flex justify-between text-xs">
                    <span>Op. Gravada:</span>
                    <span>S/ {totals.gravada.toFixed(2)}</span>
                </div>
            )}
            {totals.exonerada > 0 && (
                <div className="flex justify-between text-xs">
                    <span>Op. Exonerada:</span>
                    <span>S/ {totals.exonerada.toFixed(2)}</span>
                </div>
            )}
            {totals.inafecta > 0 && (
                <div className="flex justify-between text-xs">
                    <span>Op. Inafecta:</span>
                    <span>S/ {totals.inafecta.toFixed(2)}</span>
                </div>
            )}
            
            <div className="flex justify-between text-xs">
              <span>I.G.V. (18%):</span>
              <span>S/ {totals.igv.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold text-base mt-2 border-t border-dashed pt-1">
              <span>IMPORTE TOTAL:</span>
              <span>S/ {totals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer / Legal */}
          <div className="text-center text-[10px] text-gray-500 space-y-2">
            {invoice.type !== InvoiceType.NOTA_VENTA ? (
                <>
                    <p>Representación impresa de la {getDocTitle()}.</p>
                    <p>Autorizado mediante Resolución de Intendencia N° 034-005-0005315</p>
                    
                    {invoice.sunatResponse?.hash && (
                        <p className="font-mono text-[9px] break-all border p-1 rounded bg-gray-50 mt-2">
                            <strong>Hash Firma (Resumen):</strong><br/>
                            {invoice.sunatResponse.hash}
                        </p>
                    )}

                    {/* Simulated QR */}
                    <div className="flex justify-center my-4">
                    <div className="w-24 h-24 bg-white border border-gray-200 p-1">
                        <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invoice.qrCodeData)}`} 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                        />
                    </div>
                    </div>
                    
                    <p className="font-semibold">{invoice.sunatResponse?.description}</p>
                </>
            ) : (
                <div className="border border-gray-300 p-2 rounded bg-gray-50">
                    <p className="font-bold">DOCUMENTO INTERNO</p>
                    <p>No válido para crédito fiscal</p>
                </div>
            )}
            
            <p>Gracias por su compra</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReceipt;
