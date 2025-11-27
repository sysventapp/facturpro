import React from 'react';
import { Invoice, InvoiceType } from '../types';
import { FileText, Download, CheckCircle2, AlertTriangle, Eye, XCircle, TrendingUp, Receipt } from 'lucide-react';

interface SalesHistoryProps {
  invoices: Invoice[];
  onViewReceipt: (invoice: Invoice) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ invoices, onViewReceipt }) => {

  const totalSales = invoices.reduce((sum, inv) => sum + inv.totals.total, 0);
  const acceptedInvoices = invoices.filter(inv => inv.sunatStatus === 'ACCEPTED').length;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadXML = (invoice: Invoice) => {
    if (invoice.sunatResponse?.xmlSigned) {
      downloadFile(
        invoice.sunatResponse.xmlSigned, 
        `20123456789-${invoice.type}-${invoice.serie}-${invoice.correlativo}.xml`, 
        'text/xml'
      );
    }
  };

  const handleDownloadCDR = (invoice: Invoice) => {
    const cdrContent = `<?xml version="1.0" encoding="UTF-8"?>
<ar:ApplicationResponse xmlns:ar="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2">
    <cbc:ID>${invoice.sunatResponse?.ticket || 'TICKET-001'}</cbc:ID>
    <cac:DocumentResponse>
        <cac:Response>
            <cbc:ResponseCode>0</cbc:ResponseCode>
            <cbc:Description>La Constancia de Recepción (CDR) confirma que el comprobante ha sido ACEPTADO.</cbc:Description>
        </cac:Response>
    </cac:DocumentResponse>
</ar:ApplicationResponse>`;
    
    downloadFile(
      cdrContent, 
      `R-20123456789-${invoice.type}-${invoice.serie}-${invoice.correlativo}.xml`, 
      'text/xml'
    );
  };

  return (
    <div className="w-full h-full p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Title */}
        <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>
           <p className="text-gray-500">Registro completo de comprobantes electrónicos emitidos.</p>
        </div>

        {/* Dashboard Cards for Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
              <h3 className="text-2xl font-bold text-gray-900">S/ {totalSales.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-gray-500">Emitidos</p>
              <h3 className="text-2xl font-bold text-gray-900">{invoices.length}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
              <Receipt size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-gray-500">Aceptados</p>
              <h3 className="text-2xl font-bold text-green-600">{acceptedInvoices}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="flex justify-center mb-4">
                 <FileText size={48} className="opacity-20" />
              </div>
              <p>No hay comprobantes emitidos aún.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Comprobante</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Estado SUNAT</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.slice().reverse().map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(inv.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${inv.type === InvoiceType.FACTURA ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {inv.type === InvoiceType.FACTURA ? 'FACTURA' : 'BOLETA'}
                        </span>
                        {inv.serie}-{String(inv.correlativo).padStart(8, '0')}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="font-medium text-gray-900">{inv.client.name}</div>
                        <div className="text-xs">{inv.client.docType}: {inv.client.docNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold text-right">
                        S/ {inv.totals.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inv.sunatStatus === 'ACCEPTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 size={12} /> Aceptado
                          </span>
                        ) : inv.sunatStatus === 'REJECTED' ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle size={12} /> Rechazado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertTriangle size={12} /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => onViewReceipt(inv)}
                            className="p-1.5 text-gray-500 hover:text-sunat-primary hover:bg-blue-50 rounded transition-colors"
                            title="Ver Ticket"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDownloadXML(inv)}
                            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Descargar XML Firmado"
                          >
                            <FileText size={18} />
                          </button>
                          {inv.sunatStatus === 'ACCEPTED' && (
                            <button 
                              onClick={() => handleDownloadCDR(inv)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Descargar CDR (Constancia)"
                            >
                              <Download size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
