import { Invoice, Company, SunatResponse, InvoiceType } from '../types';
import { generateUBLInvoice } from './sunatXmlGenerator';

// SUNAT SOAP Endpoints (Reference Page 12)
const SERVICE_URL_BETA = "https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService";
const SERVICE_URL_PROD = "https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService";

/**
 * Simulates the process of sending an invoice to SUNAT (BETA/TEST ENV).
 * 
 * ⚠️ WARNING FOR PRODUCTION ⚠️
 * This is a FRONTEND-ONLY SIMULATION.
 * Browsers cannot send SOAP requests directly to SUNAT due to CORS (Security) policies.
 * Also, signing XML with a Private Key (.pfx) inside the browser is insecure.
 * 
 * TO GO TO PRODUCTION:
 * Replace this function to `fetch()` to your own BACKEND API (Node.js/Python/PHP).
 * Your Backend must:
 * 1. Receive this JSON/XML
 * 2. Sign it with your .PFX certificate
 * 3. Zip it
 * 4. Send to SUNAT SOAP API (Beta or Prod)
 */
export const sendBillToSunat = async (invoice: Invoice, company: Company): Promise<SunatResponse> => {
  
  // 1. Generate UBL XML
  const xmlContent = generateUBLInvoice(invoice, company);
  
  // 2. Define Filename per Page 6 of Manual
  // RUC-TIPO-SERIE-NUMERO.XML
  const fileName = `${company.ruc}-${invoice.type}-${invoice.serie}-${String(invoice.correlativo).padStart(8, '0')}`;
  const zipFileName = `${fileName}.zip`;

  // 3. Construct SOAP Envelope (Reference Page 13 & 14)
  // Using Beta Creds (MODDATOS) from Company Config
  const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:ser="http://service.sunat.gob.pe" 
    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <soapenv:Header>
        <wsse:Security>
            <wsse:UsernameToken>
                <wsse:Username>${company.ruc}${company.solUser}</wsse:Username>
                <wsse:Password>${company.solPass}</wsse:Password>
            </wsse:UsernameToken>
        </wsse:Security>
    </soapenv:Header>
    <soapenv:Body>
        <ser:sendBill>
            <fileName>${zipFileName}</fileName>
            <contentFile>BASE64_BLOB_OF_ZIP_FILE...</contentFile>
        </ser:sendBill>
    </soapenv:Body>
</soapenv:Envelope>
  `;

  console.log("--- MODO SIMULACIÓN: ENVÍO A SUNAT BETA ---");
  console.log(`Endpoint: ${SERVICE_URL_BETA}`);
  console.log(`Archivo: ${zipFileName}`);
  console.log(`Usuario SOL: ${company.solUser}`);
  console.log("XML Generado (UBL 2.1):", xmlContent);
  console.log("Envelope SOAP (Simulado):", soapEnvelope);

  // 4. Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 5. Simulate Response (CDR)
  // In a real app, this would be parsing the SOAP Response XML
  const isSuccess = Math.random() > 0.1; // 90% success rate simulation

  if (isSuccess) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    const digestValue = xmlDoc.getElementsByTagName("ds:DigestValue")[0]?.textContent || "HASH12345";

    return {
      success: true,
      description: `La ${invoice.type === InvoiceType.FACTURA ? 'Factura' : 'Boleta'} número ${invoice.serie}-${invoice.correlativo} ha sido ACEPTADA en el entorno de PRUEBAS (BETA).`,
      xmlSigned: xmlContent,
      hash: digestValue,
      cdrZip: 'dummy-cdr-link'
    };
  } else {
    return {
      success: false,
      description: `Error 0156: El archivo ZIP esta corrupto o no contiene el XML esperado (Simulación de error SUNAT).`,
      xmlSigned: xmlContent
    };
  }
};