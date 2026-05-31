// src/services/externalApps.ts

export async function notifyBuyerApp(payload: any) {
  console.log("🟦 [MOCK] Notificando a Buyer App:", payload);
  await new Promise(resolve => setTimeout(resolve, 500)); 
  //caso exito
  return { 
    status: 200,
    data: {
      success: true,
      orderStatus: payload.status || "PAID",
      error: null
    }
  };

  /* caso error 
  return {
    status: 404,
    data: {
      success: false,
      error: "La orden especificada no existe en la base de datos."
    }
  };
  */
}

export async function confirmOrderSellerApp(payload: any) {
  console.log("🟩 [MOCK] Confirmando orden en Seller App:", payload);
  await new Promise(resolve => setTimeout(resolve, 500));

  //caso exito
  return { 
    status: 200,
    data: {
      sellerOrderId: "sell_ord_888", 
      status: "PENDING_SHIPMENT", 
      message: "Stock descontado exitosamente",
      error: null
    }
  };

  /* caso error 
  return {
    status: 404,
    data: {
      error: "Uno o mas productos no existen"
    }
  };
  */
}
