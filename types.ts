
export enum InvoiceType {
  BOLETA = '03',
  FACTURA = '01',
  NOTA_CREDITO = '07',
  NOTA_VENTA = '80' // Código interno común para Nota de Venta
}

// Catálogo No. 07: Códigos de tipo de afectación del IGV
export enum IgvType {
  GRAVADO = '10', // Gravado - Operación Onerosa
  EXONERADO = '20', // Exonerado - Operación Onerosa
  INAFECTO = '30', // Inafecto - Operación Onerosa
}

// Catálogo No. 03: Códigos de Tipo de Unidad de Medida Comercial
export enum UnitCode {
  NIU = 'NIU', // Unidad (Bienes)
  ZZ = 'ZZ',   // Servicio (Intangibles)
  KGM = 'KGM', // Kilogramos
  LTR = 'LTR', // Litros
  BX = 'BX',   // Caja
  GLL = 'GLL', // Galones
}

// Requisito Legal UBL 2.1: Forma de Pago
export enum PaymentMethod {
  CONTADO = 'Contado',
  CREDITO = 'Credito'
}

// Catálogo No. 06: Códigos de Tipo de Documento de Identidad
export enum IdentityDocumentType {
  SIN_DOCUMENTO = '0',
  DNI = '1',
  CARNET_EXTRANJERIA = '4',
  RUC = '6',
  PASAPORTE = '7',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Precio final (incluye impuestos si aplican)
  stock: number;
  description?: string;
  igvType: IgvType; // Nuevo campo para SUNAT
  unitCode: UnitCode; // Nuevo: Unidad de medida
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Client {
  id?: string; // Optional for new creates
  docType: 'DNI' | 'RUC' | '-';
  docNumber: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface Company {
  ruc: string;
  razonSocial: string;
  address: string;
  ubigeo: string; // e.g. 150101
  solUser: string;
  solPass: string;
  logoUrl?: string; // Nuevo: Logo de la empresa
  apiToken?: string; // Nuevo: Token para consultas DNI/RUC
  whatsappInstance?: string; // Nuevo: Para futura integración
  whatsappToken?: string; // Nuevo: Para futura integración
  serieFactura: string; // Configurable: F001, F002...
  serieBoleta: string;  // Configurable: B001, B002...
}

export interface SunatResponse {
  success: boolean;
  cdrZip?: string; // Simulated blob url
  description: string;
  xmlSigned: string; // The generated UBL XML
  ticket?: string;
  hash?: string; // Signature Value
}

export interface InvoiceTotals {
  gravada: number;
  exonerada: number;
  inafecta: number;
  igv: number;
  total: number;
}

export interface Invoice {
  id: string;
  serie: string; // e.g., B001 or F001
  correlativo: number;
  type: InvoiceType;
  client: Client;
  paymentMethod: PaymentMethod; // Mandatory for UBL 2.1
  items: CartItem[];
  totals: InvoiceTotals; // Replaces simple subtotal/igv
  date: string;
  qrCodeData: string; 
  sunatStatus?: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'INTERNAL';
  sunatResponse?: SunatResponse;
}
