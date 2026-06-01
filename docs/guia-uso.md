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
            "orderReference": "ORD-COMPULIBRE-Ejemplo",
            "amount": 850000,
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

Por si Mercadopago esta fallando dejo otra cuenta y otra tarjeta de prueba.

Cuenta1 (la del ejemplo):

    usuario/mail: TESTUSER256940898340914939
    contraseña: PajbzOkDR5
    codigo de verificacion: 882260

Cuenta2:

    usuario/mail: TESTUSER2902309356924606588
    contraseña: BWSGezlnwC
    codigo de verificacion:  331170

Tarjeta1 Mastercard:

    numero: 5031 7557 3453 0604
    codigo: 123
    fecha: 11/30
    nombre: APRO/OTHE/CONT

Tarjeta2 Visa:

    numero: 4509 9535 6623 3704
    codigo: 123
    fecha: 11/30
    nombre: APRO/OTHE/CONT
   
---