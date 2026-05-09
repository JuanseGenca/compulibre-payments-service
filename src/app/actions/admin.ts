"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function markPayoutAsCompleted(payoutId: string) {
try{
  // 1. Doble validación de seguridad: Nos aseguramos de que sea el Admin
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") {
    throw new Error("Acceso denegado. Solo administradores pueden aprobar retiros.");
  }

  // 2. Actualizamos el estado en Prisma
  await prisma.payout.update({
    where: { id: payoutId },
    data: { status: "COMPLETED" }, 
  });

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
  try {
    const user = await currentUser();
    if (user?.publicMetadata?.role !== "admin") {
      return { error: "No autorizado" };
    }

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
      await tx.payout.update({
        where: { id: payoutId },
        data: { 
          status: "REJECTED",
          // Si tenés un campo 'notes' o similar en tu tabla Payout, podés guardar la razón aquí
        },
      });

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