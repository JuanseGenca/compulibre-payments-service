import { MercadoPagoConfig } from 'mercadopago';

// Verificamos que el token exista para que no explote en producción si nos olvidamos la variable
if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("Falta la variable de entorno MP_ACCESS_TOKEN");
}

// Exportamos una única instancia configurada para usar en toda la app
export const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});