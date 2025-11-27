
import { supabase } from './supabaseClient';
import { Client, Product, Invoice, InvoiceType, CartItem, InvoiceTotals, Company } from '../types';

// --- CLIENTES ---
export const dbGetClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.warn("Error obteniendo clientes de Supabase (Usando local):", error.message);
      return [];
    }
    
    return data.map((c: any) => ({
      id: c.id,
      docType: c.doc_type,
      docNumber: c.doc_number,
      name: c.name,
      address: c.address || '',
      phone: c.phone || '',
      email: c.email || ''
    }));
  } catch (e) {
    console.warn("Error de conexión (Clientes):", e);
    return [];
  }
};

export const dbCreateClient = async (client: Client): Promise<Client> => {
  const { data, error } = await supabase.from('clients').insert({
    doc_type: client.docType,
    doc_number: client.docNumber,
    name: client.name,
    address: client.address,
    phone: client.phone,
    email: client.email
  }).select().single();

  if (error) throw error;
  
  return {
    id: data.id,
    docType: data.doc_type,
    docNumber: data.doc_number,
    name: data.name,
    address: data.address,
    phone: data.phone,
    email: data.email
  };
};

// --- PRODUCTOS ---
export const dbGetProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('name');
    
    if (error) {
      console.warn("Error obteniendo productos de Supabase:", error.message);
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: parseFloat(p.price),
      stock: p.stock,
      description: p.description,
      igvType: p.igv_type,
      unitCode: p.unit_code
    }));
  } catch (e) {
    console.warn("Error de conexión (Productos):", e);
    return [];
  }
};

export const dbCreateProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const { data, error } = await supabase.from('products').insert({
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    description: product.description,
    igv_type: product.igvType,
    unit_code: product.unitCode
  }).select().single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    price: parseFloat(data.price),
    stock: data.stock,
    description: data.description,
    igvType: data.igv_type,
    unitCode: data.unit_code
  };
};

// --- FACTURAS ---
export const dbCreateInvoice = async (invoice: Invoice): Promise<void> => {
  // 1. Insertar Cabecera
  const { data: invoiceData, error: invError } = await supabase.from('invoices').insert({
    type: invoice.type,
    serie: invoice.serie,
    correlativo: invoice.correlativo,
    date: invoice.date,
    client_data: invoice.client, // Guardamos snapshot del cliente
    payment_method: invoice.paymentMethod,
    totals: invoice.totals,
    sunat_status: invoice.sunatStatus,
    xml_signed: invoice.sunatResponse?.xmlSigned,
    hash: invoice.sunatResponse?.hash
  }).select().single();

  if (invError) throw invError;

  // 2. Insertar Items
  const itemsToInsert = invoice.items.map(item => ({
    invoice_id: invoiceData.id,
    product_id: item.id.length > 10 ? item.id : null, // Solo si es UUID válido
    description: item.name,
    quantity: item.quantity,
    price: item.price,
    igv_type: item.igvType,
    unit_code: item.unitCode,
    total: item.price * item.quantity
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
  if (itemsError) console.error("Error guardando items:", itemsError);
  
  // 3. Actualizar Stock (Opcional)
  // Implementar lógica de resta de inventario aquí si se desea
};

export const dbGetInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.warn("Error obteniendo facturas de Supabase:", error.message);
      return [];
    }

    return data.map((inv: any) => ({
      id: inv.id,
      type: inv.type as InvoiceType,
      serie: inv.serie,
      correlativo: inv.correlativo,
      date: inv.date,
      client: inv.client_data as Client,
      paymentMethod: inv.payment_method,
      totals: inv.totals as InvoiceTotals,
      items: [], // En el listado general no cargamos todos los items para eficiencia
      sunatStatus: inv.sunat_status,
      sunatResponse: {
          success: inv.sunat_status === 'ACCEPTED',
          description: inv.sunat_status === 'ACCEPTED' ? 'Aceptado' : 'Registrado',
          xmlSigned: inv.xml_signed,
          hash: inv.hash
      },
      qrCodeData: 'GENERATED_ON_FLY' 
    }));
  } catch (e) {
    console.warn("Error de conexión (Facturas):", e);
    return [];
  }
};

// --- EMPRESA ---
export const dbGetCompany = async (): Promise<Company | null> => {
    try {
      const { data, error } = await supabase.from('companies').select('*').single();
      
      if (error) {
        // Es normal si no existe empresa aún
        if (error.code !== 'PGRST116') console.warn("Error obteniendo empresa:", error.message);
        return null;
      }
      
      return {
          ruc: data.ruc,
          razonSocial: data.razon_social,
          address: data.address,
          ubigeo: data.ubigeo || '150101', 
          solUser: data.sol_user,
          solPass: data.sol_pass,
          logoUrl: data.logo_url,
          apiToken: data.api_token,
          whatsappInstance: data.whatsapp_instance,
          whatsappToken: data.whatsapp_token,
          serieFactura: data.serie_factura,
          serieBoleta: data.serie_boleta
      };
    } catch (e) {
      console.warn("Error conexión (Empresa):", e);
      return null;
    }
};

export const dbSaveCompany = async (company: Company): Promise<void> => {
    // Upsert basado en que solo debe haber 1 empresa
    // Primero borramos (simple strategy) o actualizamos el primero que encontremos
    const { data } = await supabase.from('companies').select('id').limit(1);
    
    const payload = {
        ruc: company.ruc,
        razon_social: company.razonSocial,
        address: company.address,
        sol_user: company.solUser,
        sol_pass: company.solPass,
        logo_url: company.logoUrl,
        api_token: company.apiToken,
        whatsapp_instance: company.whatsappInstance,
        whatsapp_token: company.whatsappToken,
        serie_factura: company.serieFactura,
        serie_boleta: company.serieBoleta
    };

    if (data && data.length > 0) {
        await supabase.from('companies').update(payload).eq('id', data[0].id);
    } else {
        await supabase.from('companies').insert(payload);
    }
};
