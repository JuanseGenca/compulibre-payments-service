"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function closeSupportTicket(ticketId: string) {
  // 1. Verificación estricta de seguridad (Solo Admins)
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    return { error: "Acceso denegado. Solo administradores pueden cerrar tickets." };
  }

  try {
    // 2. Actualizamos el estado a CLOSED
    const resultado = await prisma.supportTicket.updateMany({
      where: { 
        id: ticketId,
        status: "OPEN" // Solo cerramos si estaba abierto
      },
      data: { status: "CLOSED" },
    });

    if (resultado.count === 0) {
      return { error: "El ticket ya estaba cerrado o no existe." };
    }

    // 3. Refrescamos la vista del admin
    revalidatePath("/admin"); // Cambiá esto si tu ruta de admin se llama distinto
    return { success: true };

  } catch (error) {
    console.error("Error al cerrar ticket:", error);
    return { error: "Error interno al actualizar el ticket." };
  }
}