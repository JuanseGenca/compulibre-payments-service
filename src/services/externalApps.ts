// 1. Interface exacta para la App del Comprador
interface BuyerPayload {
  orderId: string;
  transactionId: string;
  status: string;
  paymentMethod: string | null;
}

// 2. Interfaces para la App del Vendedor
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
  const baseUrl = process.env.BUYER_APP_URL;
  
  if (!baseUrl) {
    console.error("❌ Error de configuración: BUYER_APP_URL no está definida.");
    return {
      status: 500,
      data: { success: false, error: "Error de configuración interna del servidor." }
    };
  }

  try {
    // 1. Ponemos el orderId en la ruta
    const response = await fetch(`${baseUrl}/api/orders/${payload.orderId}/payment-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PAYMENTS_API_KEY || '',
      },
      // 2. Mandamos el resto de los datos en el Body exacto que pide el endpoint
      body: JSON.stringify({
        transactionId: payload.transactionId,
        status: payload.status,
        paymentMethod: payload.paymentMethod
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    return { status: response.status, data: data };

  } catch (error: any) {
    console.error("❌ Error conectando con Buyer App:", error);
    return { status: 500, data: { success: false, error: error.message } };
  }
}

export async function confirmOrderSellerApp(payload: SellerPayload) {
  const baseUrl = process.env.SELLER_APP_URL;

  if (!baseUrl) {
    console.error("❌ Error de configuración: SELLER_APP_URL no está definida.");
    return {
      status: 500,
      data: { success: false, error: "Error de configuración interna del servidor." }
    };
  }

  try {
    const response = await fetch(`${baseUrl}/api/orders/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PAYMENTS_API_KEY || '',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json();

    return { 
      status: response.status,
      data: data
    };

  } catch (error: any) {
    console.error("❌ Error crítico conectando con Seller App:", error);
    return {
      status: 500,
      data: { 
        error: error.message || "No se pudo establecer conexión de red con la Seller App." 
      }
    };
  }
}