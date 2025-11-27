import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Descripción no disponible (API Key no configurada).";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Escribe una descripción de venta corta, atractiva y profesional (máximo 25 palabras) para un producto llamado "${productName}" de la categoría "${category}". En español.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "No se pudo generar la descripción.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error al conectar con el servicio de IA.";
  }
};
