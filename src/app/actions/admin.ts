"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function markPayoutAsCompleted(payoutId: string) {
  // 1. Doble validación de seguridad: Nos aseguramos de que sea el Admin
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    throw new Error("Acceso denegado. Solo administradores pueden aprobar retiros.");
  }

try{
  // 2. Actualizamos el estado en Prisma
  const resultado = await prisma.payout.updateMany({
    where: { 
      id: payoutId,
      status: "PROCESSING" 
    },
    data: { status: "COMPLETED" }, 
  });

  // Si no actualizó nada, significa que no existía o ya tenía otro estado
  if (resultado.count === 0) {
    return { error: "El retiro ya fue procesado previamente o no existe." };
  }
  
  // 3. Refrescamos las páginas para que los cambios se vean al instante
  revalidatePath("/admin");
  revalidatePath("/dashboard/retiros");
  
  return { success: true };

    }catch (e) {
    // Si se cae la base de datos o pasa algo raro, lo atajamos acá
    console.error(e);
    return { error: "Ocurrió un error interno al actualizar el estado." };
  }
}

export async function rejectPayout(payoutId: string, reason: string = "Rechazado por el administrador") {

  const user = await currentUser();
    if (user?.publicMetadata?.role !== "admin") {
      return { error: "No autorizado" };
    }

  try {
    // Usamos una transacción para asegurar la integridad de los datos
    await prisma.$transaction(async (tx) => {

      // 1. Buscamos el payout para saber cuánto dinero devolver y a quién
      const payout = await tx.payout.findUnique({
        where: { id: payoutId },
      });

      if (!payout || payout.status !== "PROCESSING") {
        throw new Error("El retiro no existe o ya fue procesado.");
      }

      // 2. Actualizamos el Payout a REJECTED
      const updateResult = await tx.payout.updateMany({
        where: { 
          id: payoutId,
          status: "PROCESSING" // 👈 Evita que un doble clic rechace dos veces
        },
        data: { status: "REJECTED" },
      });

      if (updateResult.count === 0) {
        throw new Error("El retiro ya fue procesado por otro administrador.");
      }

      // 3. Devolvemos la plata al balance del usuario
      await tx.account.update({
        where: { clerk_user_id: payout.account_id },
        data: { balance: { increment: payout.amount } },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard/retiros");
    return { success: true };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Error al rechazar el retiro" };
  }
}