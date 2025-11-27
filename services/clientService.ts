import { Client } from '../types';

const BASE_URL = 'https://api.decolecta.com/v1';
// Proxy público para evitar bloqueo CORS en el navegador
const PROXY_URL = 'https://corsproxy.io/?'; 

export const searchClient = async (docType: 'DNI' | 'RUC', number: string, apiToken: string): Promise<Partial<Client> | null> => {
  if (!number || !apiToken) {
    if(!apiToken) console.warn("Token de API no configurado en Ajustes > APIs");
    return null;
  }

  // Selección de endpoint según tipo de documento
  const endpoint = docType === 'DNI' ? 'reniec/dni' : 'sunat/ruc';
  const targetUrl = `${BASE_URL}/${endpoint}?numero=${number}`;
  
  // Usamos el proxy para envolver la petición
  const url = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;

  console.log(`Consultando ${docType}:`, number);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      }
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 422) {
        console.warn("Cliente no encontrado en API");
        return null;
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const rawData = await response.json();
    
    // Normalizar la respuesta: A veces viene directa, a veces dentro de 'data' o 'result'
    const data = rawData.data || rawData.result || rawData;

    if (!data) return null;

    if (docType === 'DNI') {
      // --- LÓGICA DNI ---
      let fullName = '';

      if (data.full_name) {
        fullName = data.full_name;
      } else if (data.first_name || data.first_last_name) {
         // Construir desde partes en inglés
         const nombre = data.first_name || '';
         const apePat = data.first_last_name || '';
         const apeMat = data.second_last_name || '';
         fullName = `${nombre} ${apePat} ${apeMat}`.trim();
      } else {
         // Construir desde partes en español
         const nombres = data.nombres || data.Nombres || data.nombre || '';
         const apePat = data.apellidoPaterno || data.apellido_paterno || data.ApellidoPaterno || '';
         const apeMat = data.apellidoMaterno || data.apellido_materno || data.ApellidoMaterno || '';
         fullName = `${nombres} ${apePat} ${apeMat}`.trim();
      }

      if (!fullName) return null;

      return {
        docType: 'DNI',
        docNumber: data.document_number || data.dni || number,
        name: fullName,
        address: '' 
      };
    } else {
      // --- LÓGICA RUC ---
      // Estructura esperada: razonSocial, direccion
      const razonSocial = data.razonSocial || data.razon_social || data.nombreComercial || data.nombre_comercial || data.nombre;

      if (!razonSocial) return null;

      let direccionCompleta = data.direccion || data.direccion_completa || '';
      
      // Construir dirección si viene por partes y no completa
      if (!direccionCompleta && (data.departamento || data.provincia || data.distrito)) {
          const dep = data.departamento || '';
          const prov = data.provincia || '';
          const dist = data.distrito || '';
          direccionCompleta = `${dep} - ${prov} - ${dist}`.replace(/^ - | - $/g, '');
      }

      return {
        docType: 'RUC',
        docNumber: data.ruc || number,
        name: razonSocial,
        address: direccionCompleta
      };
    }

  } catch (error) {
    console.error("Error técnico al consultar API:", error);
    throw error;
  }
};