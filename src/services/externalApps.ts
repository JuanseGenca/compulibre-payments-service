// src/services/externalApps.ts

export async function notifyBuyerApp(payload: any) {
  console.log("🟦 [MOCK] Notificando a Buyer App:", payload);
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return { success: true, orderStatus: "PAID" };
}

export async function confirmOrderSellerApp(payload: any) {
  console.log("🟩 [MOCK] Confirmando orden en Seller App:", payload);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { 
    sellerOrderId: "sell_ord_888", 
    status: "PENDING_SHIPMENT", 
    message: "Stock descontado exitosamente" 
  };
}

export async function createShipment(payload: any) {
  console.log("🟨 [MOCK] Creando etiqueta de envío:", payload);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    trackingId: "TRK-COMPU-9999",
    status: "LABEL_CREATED",
    courier: "Andreani",
    labelUrl: "https://shipping-app.com/labels/TRK-COMPU-9999.pdf"
  };
}