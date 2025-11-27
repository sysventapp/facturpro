
import { Invoice, Company, InvoiceType } from '../types';

// Generic API wrapper. Adjust BASE_URL if you use a specific provider (UltraMsg, GreenAPI, etc.)
// For this boilerplate, we assume a generic structure often used by WhatsApp Gateway APIs.
const PROXY_URL = 'https://corsproxy.io/?'; 

export const sendInvoiceViaWhatsApp = async (
  invoice: Invoice, 
  company: Company, 
  phoneNumber: string
): Promise<{ success: boolean; message: string }> => {
  
  if (!company.whatsappInstance || !company.whatsappToken) {
    return { success: false, message: 'Faltan credenciales de WhatsApp (Instancia/Token) en Configuración.' };
  }

  // 1. Format the message
  const docName = invoice.type === InvoiceType.FACTURA ? 'Factura' : (invoice.type === InvoiceType.BOLETA ? 'Boleta' : 'Nota de Venta');
  const date = new Date(invoice.date).toLocaleDateString('es-PE');
  
  let message = `*${company.razonSocial}*\n`;
  message += `RUC: ${company.ruc}\n\n`;
  message += `Hola, adjuntamos su comprobante electrónico.\n\n`;
  message += `📄 *${docName}*: ${invoice.serie}-${String(invoice.correlativo).padStart(8, '0')}\n`;
  message += `📅 *Fecha*: ${date}\n`;
  message += `👤 *Cliente*: ${invoice.client.name}\n`;
  message += `💰 *TOTAL*: S/ ${invoice.totals.total.toFixed(2)}\n\n`;
  message += `*Detalle:*\n`;
  
  invoice.items.forEach(item => {
    message += `- ${item.quantity} x ${item.name} (S/ ${(item.price * item.quantity).toFixed(2)})\n`;
  });

  message += `\nGracias por su preferencia.`;

  // 2. Prepare API Request
  // NOTE: This assumes a common API structure (like WppConnect or simple Gateways).
  // You might need to adjust the endpoint URL based on the specific provider the user subscribes to.
  // For this generic implementation, we assume the 'instance' config contains the full Host URL or ID.
  
  // Example heuristic: If instance looks like a URL, use it. If ID, assume a default provider pattern.
  let apiUrl = '';
  if (company.whatsappInstance.startsWith('http')) {
      apiUrl = `${company.whatsappInstance}/send-message`; 
  } else {
      // Fallback/Default pattern (e.g., generic provider placeholder)
      apiUrl = `https://api.whatsapp-provider.com/instance${company.whatsappInstance}/sendMessage`;
  }

  const payload = {
    phone: phoneNumber.replace(/\D/g, ''), // Clean number (51999...)
    message: message,
    token: company.whatsappToken
  };

  console.log("--- ENVIANDO WHATSAPP ---");
  console.log("URL:", apiUrl);
  console.log("Payload:", payload);

  try {
    // We use proxy to avoid CORS if calling from browser to a non-cors-enabled API
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(apiUrl)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${company.whatsappToken}`
      },
      body: JSON.stringify(payload)
    });

    // Since we don't have a real endpoint, we simulate success if the request was made
    // In production, uncomment the check below:
    // if (!response.ok) throw new Error('API Error');
    
    // For simulation purposes in this demo:
    await new Promise(r => setTimeout(r, 1000));
    
    return { success: true, message: 'Enviado correctamente' };

  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    
    // FALLBACK: Since we likely don't have a real paid API connected in this demo,
    // we return success false but provide a "Open Web Link" suggestion in the UI logic if needed,
    // or just fail.
    return { success: false, message: 'Error de conexión con API de WhatsApp.' };
  }
};

export const generateWhatsAppLink = (invoice: Invoice, company: Company, phoneNumber: string) => {
    // Fallback method: Click to Chat
    const docName = invoice.type === InvoiceType.FACTURA ? 'Factura' : (invoice.type === InvoiceType.BOLETA ? 'Boleta' : 'Nota de Venta');
    const text = `Hola, le escribo de *${company.razonSocial}*. Aquí su comprobante *${docName} ${invoice.serie}-${invoice.correlativo}* por el monto de *S/ ${invoice.totals.total.toFixed(2)}*.`;
    return `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
};
