# Guia de uso

Instrucciones breves sobre el uso de la app


## Como testear flujo de pago

Es necesario hacer un POST a https://proyecto-c-payments-compulibre.vercel.app/api/payments/checkout. Este tiene que inclur tal como esta en la documentacion un header
con x-api-key: <PAYMENTS_API_KEY>.

**API KEY de prueba** : 0srf8e6kogjdla9fn04be73n9v13lg07

### Ejemplo de requests

    headers:
        x-api-key: 0srf8e6kogjdla9fn04be73n9v13lg07
    body:
        {
            "buyerId": "user_3EXguWfvjPYCZNcvXhPAhQS5jid",
            "orderReference": "ORD-COMPULIBRE-909",
            "amount": 200000,
            "currency": "ARS",
            "buyerAddress": "Colon 1400",
            "buyerCodigoPostal": 8109,
            "items": [
                {
                    "sellerId": "user_vendedor_gamma",
                    "productId": "hw_teclado_HXAR",
                    "name": "Teclado Mecanico HyperX Alloy Rise",
                    "quantity": 1,
                    "unit_price": 200000
                }
            ]
        }

El POST devuelve un link de mercadopago, es preferible abrirlo en una pestaña de incognito por si tienen una sesion iniciada.
    
### Una vez dentro del link para completar la compra hay que seguir los siguientes pasos:

1 - Hacer click en **"ingresar con mi cuenta"**

2 - En DNI-mail-telefono ingresar: TESTUSER256940898340914939

3 - Seleccionar contraseña e ingresar: PajbzOkDR5

4 - Seleccionar "Otro medio de pago"

5 - Seleccionar "Nueva tarjeta" y completar con

- numero de tarjeta: 5031 7557 3453 0604
- nombre: APRO (si quieren que el pago se apruebe) , OTHE (si quieren que se rechaze) o CONT(si quieren que quede pendiente)
- vencimiento: 11/30
- codigo de seguridad: 123
- Documento: 12345678
    
6 - Por ultimo mercadopago va a pedir un codigo de verificacion, ingresar: 882260

Cuando el pago se complete Mercadopago va a notificar a app/api/webhooks/mercadopago, el cual se va a encargar de actualizar el estado de la transaccion.

## Credenciales de Mercadopago


   
---