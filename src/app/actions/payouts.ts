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
      // 1. Buscamos la cuenta y bloqueamos la fila para evitar "race conditions"
      const account = await tx.account.findUnique({
        where: { clerk_user_id: userId },
      });

      if (!account || account.balance < amount) {
        throw new Error("Saldo insuficiente");
      }

      // 2. Descontamos el saldo
      await tx.account.update({
        where: { clerk_user_id: userId },
        data: { balance: { decrement: amount } },
      });

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