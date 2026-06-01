[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Ks7Ywtwc)
# Payments

Aplicación **Payments** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión [CompuLibre](https://github.com/IAW-2026/proyecto-c-etapa-1-compulibre).

Módulo central de pagos y gestión financiera para el ecosistema del marketplace CompuLibre. Esta aplicación procesa transacciones de carritos multi-vendedor utilizando la pasarela de Mercado Pago, distribuye las ganancias automáticamente a las cuentas correspondientes, ofrece un panel de control para que los usuarios gestionen sus compras, ventas, retiros y disputas. Los administradores pueden ver y gestionar los retiros y las disputas, ademas de ver las metricas mas importantes de la plataforma. 

## Link al Deploy: 

https://proyecto-c-payments-compulibre.vercel.app/


## Credenciales de prueba

*(Nota: Si Clerk solicita un código de confirmación al iniciar sesión, es **424242** para ambas cuentas).*

### **usuario final (comprador/vendedor):**

- **correo:** usuario+clerk_test@iaw.com
- **password:** iawuser#
- **id:** user_3EXguWfvjPYCZNcvXhPAhQS5jid
    
### **administrador:**

- **correo:** administrador+clerk_test@iaw.com
- **password:** iawuser#
- **id:** user_3EKfDPzDBs9qXiSa5oXMFUcevFI

## Instrucciones de Uso
Para saber cómo probar el endpoint de pagos y simular transacciones exitosas/rechazadas, por favor revisá la [Guía de Uso de la API](./docs/guia-uso.md).

## Limitaciones Conocidas y Seguridad (Webhooks)
Actualmente, el endpoint que recibe las notificaciones de Mercado Pago no valida la firma criptográfica de mercadopago Esta validación fue desestimada temporalmente para esta entrega debido a inestabilidades y demoras detectadas en los webhooks del entorno *Sandbox* de Mercado Pago, priorizando la demostración del flujo funcional completo.

**Mitigación actual:** A pesar de no contar con la firma, el sistema **no es vulnerable a inyección de pagos falsos**. El endpoint no confía en el `body` de la petición entrante; únicamente extrae el ID de la transacción y realiza una consulta segura de servidor a servidor (`Server-to-Server`) a la API de Mercado Pago para obtener el estado real y oficial del pago.

**Debilidad identificada:** Al no validar el origen de la petición en la capa superior, el endpoint queda expuesto a posibles ataques de Denegación de Servicio (DoS). Un atacante podría enviar peticiones masivas con IDs aleatorios, lo que provocaría llamadas innecesarias a la API de Mercado Pago y podría agotar la cuota de peticiones del servidor. Su mitigación mediante firmas HMAC queda pendiente.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
