# Guía de Pruebas e Integración de la API (Sandbox)

Esta guía documenta cómo interactuar con el endpoint de checkout y cómo simular el flujo completo de pago utilizando el entorno **Sandbox de Mercado Pago**.

---

## 1. Simulación de Checkout (Creación de Preferencia)

Para iniciar una transacción, el servicio cliente (como la *Buyer App*) realiza una petición `POST` al endpoint `/api/payments/checkout` enviando el encabezado `x-api-key`.

### Endpoint

```http
POST /api/payments/checkout HTTP/1.1
Host: proyecto-c-payments-compulibre.vercel.app
Content-Type: application/json
x-api-key: 0srf8e6kogjdla9fn04be73n9v13lg07
```

### Ejemplo con cURL

```bash
curl -X POST https://proyecto-c-payments-compulibre.vercel.app/api/payments/checkout \
  -H "Content-Type: application/json" \
  -H "x-api-key: 0srf8e6kogjdla9fn04be73n9v13lg07" \
  -d '{
    "buyerId": "user_3EXguWfvjPYCZNcvXhPAhQS5jid",
    "orderReference": "ORD-COMPULIBRE-Ejemplo",
    "amount": 85000,
    "currency": "ARS",
    "buyerAddress": "Espora 140",
    "buyerCodigoPostal": 8109,
    "items": [
      {
        "sellerId": "user_vendedor_rojo",
        "productId": "hw_auriculares_hx1",
        "name": "Auriculares HyperX Cloud Stinger 2 White",
        "quantity": 1,
        "unit_price": 85000
      }
    ]
  }'
```

### Respuesta Exitosa (`200 OK`)

```json
{
  "transactionId": "e34b9cf4-91b6-4bdf-87ea-9f89a9cce08d",
  "checkoutUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

> **Nota:** La URL devuelta en `checkoutUrl` corresponde a la pantalla de pago de Mercado Pago. Se recomienda abrirla en una **ventana de incógnito** para evitar colisiones con sesiones personales de Mercado Pago.

---

## 2. Flujo de Pago en Sandbox de Mercado Pago

Una vez dentro de la pantalla de pago de Mercado Pago:

1. Seleccionar **"Ingresar con mi cuenta"**.
2. Ingresar las credenciales de comprador de prueba (ver tabla abajo).
3. Seleccionar **"Otro medio de pago"** > **"Nueva tarjeta"**.
4. Completar los datos de tarjeta según el resultado que se desee simular:
   - Para simular **pago aprobado**: Nombre del titular = `APRO`
   - Para simular **pago rechazado**: Nombre del titular = `OTHE`
   - Para simular **pago pendiente**: Nombre del titular = `CONT`
5. Cuando Mercado Pago solicite el código de verificación por SMS/email, ingresar el código de prueba correspondiente.

Al completarse el pago, Mercado Pago disparará automáticamente un webhook hacia `/api/webhooks/mercadopago`, el cual:
1. Valida el estado real de la transacción mediante una consulta *Server-to-Server* a la API de Mercado Pago.
2. Actualiza el estado de la transacción en la base de datos de manera atómica (`PAID` o `REJECTED`).
3. Si el pago fue aprobado, acredita automáticamente el saldo correspondiente a cada vendedor involucrado.
4. Notifica asíncronamente a los microservicios de *Buyer* y *Seller*.

---

## 3. Credenciales de Prueba (Sandbox)

### Cuentas de Comprador

| Cuenta | Email / Usuario | Contraseña | Código 2FA |
| :--- | :--- | :--- | :--- |
| **Cuenta Principal** | `TESTUSER256940898340914939` | `PajbzOkDR5` | `882260` |
| **Cuenta Alternativa** | `TESTUSER2902309356924606588` | `BWSGezlnwC` | `331170` |

### Tarjetas de Prueba

| Tipo | Número de Tarjeta | Titular | Vencimiento | CVV | Documento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mastercard** | `5031 7557 3453 0604` | `APRO` / `OTHE` / `CONT` | `11/30` | `123` | `12345678` |
| **Visa** | `4509 9535 6623 3704` | `APRO` / `OTHE` / `CONT` | `11/30` | `123` | `12345678` |