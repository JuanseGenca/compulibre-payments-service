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