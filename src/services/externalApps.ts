// src/services/externalApps.ts
// 1. Interface exacta para la App del Comprador
interface BuyerPayload {
  transactionId: string;
  status: string;
  paymentMethod: string | null;
}

// 2. Interfaces para la App del Vendedor
// (Separamos los items en su propia interface para que quede más prolijo)
interface OrderItem {
  productId: string;
  quantity: number;
}

interface SellerPayload {
  orderReference: string;
  buyerId: string;
  items: OrderItem[];
  transactionId: string;
  buyerAddress: string;
  buyerCodigoPostal: number;
}

export async function notifyBuyerApp(payload: BuyerPayload) {
  console.log("🟦 [MOCK] Notificando a Buyer App:", payload);
  await new Promise(resolve => setTimeout(resolve, 500)); 
  //caso exito
  return { 
    status: 200,
    data: {
      success: true,
      orderStatus: payload.status,
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

export async function confirmOrderSellerApp(payload: SellerPayload) {
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
