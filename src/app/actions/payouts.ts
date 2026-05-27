"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createPayout(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const amount = parseFloat(formData.get("amount") as string);
  const cbu = formData.get("cbu") as string;

  if (isNaN(amount) || amount <= 0) throw new Error("Monto inválido");
  if (!cbu || cbu.length < 22) throw new Error("CBU inválido");

  // Usamos una transacción de Prisma para que todo ocurra o nada ocurra
  try {
    await prisma.$transaction(async (tx) => {
      const accountUpdate = await tx.account.updateMany({
        where: { 
          clerk_user_id: userId,
          balance: { gte: amount } // La clave: Solo actualiza si el saldo es Mayor o Igual (gte)
        },
        data: { 
          balance: { decrement: amount } 
        },
      });

      // Si count es 0, significa que no encontró la cuenta O que no tenía saldo suficiente
      if (accountUpdate.count === 0) {
        throw new Error("Saldo insuficiente o cuenta inexistente");
      }

      // 3. Creamos el registro del retiro
      await tx.payout.create({
        data: {
          amount: amount,
          destination_cbu: cbu,
          status: "PROCESSING",
          // Usamos el campo virtual 'account' para conectar
          account: { connect: { clerk_user_id: userId } }
        },
      });
    });

    // Refrescamos el Dashboard para que el usuario vea su nuevo saldo
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/retiros");
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}