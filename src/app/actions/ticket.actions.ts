"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSupportTicket(formData: FormData) {
  try {
    // 1. Validamos que el usuario esté logueado
    const { userId } = await auth();
    if (!userId) {
      return { error: "No autorizado. Debes iniciar sesión." };
    }

    // 2. Extraemos los datos del formulario
    const transactionId = formData.get("transactionId") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // 3. Validación básica
    if (!transactionId || !subject || !message) {
      return { error: "Todos los campos son obligatorios." };
    }

    // 4. Guardamos en la base de datos
    await prisma.supportTicket.create({
      data: {
        buyerId: userId,
        transactionId: transactionId,
        subject: subject,
        message: message,
      },
    });

    return { success: true };

  } catch (error) {
    console.error("Error al crear el ticket de soporte:", error);
    return { error: "Ocurrió un error interno al enviar el reporte." };
  }
}