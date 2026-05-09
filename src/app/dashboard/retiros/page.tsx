import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PayoutForm from "@/components/PayoutForm";

export default async function RetirosPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Buscamos solo los retiros del usuario
  const misPayouts = await prisma.payout.findMany({
    where: { account: { clerk_user_id: userId } },
    // Si en tu schema tenés un createdAt en Payout, usá ese. Si no, ordenamos por ID invertido.
    orderBy: { id: "desc" }, 
  });

  const account = await prisma.account.findUnique({
    where: { clerk_user_id: userId },
  });
  const saldoDisponible = account?.balance || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <header className="mb-8 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Historial de Retiros</h1>
            <p className="text-gray-500 mt-1">Seguimiento de tus transferencias a cuentas bancarias.</p>
          </div>
          <Link 
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; Volver al Panel
          </Link>
        </header>
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {misPayouts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Aún no solicitaste ningún retiro de dinero.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-medium">Monto</th>
                    <th className="p-4 font-medium">CBU / CVU Destino</th>
                    <th className="p-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {misPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">
                        $ {Number(p.amount).toLocaleString("es-AR")}
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-sm">
                        {p.destination_cbu}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          p.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          p.status === "PROCESSING" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </section>

        <section>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-500 uppercase">Saldo Disponible</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                $ {saldoDisponible.toLocaleString("es-AR")}
              </p>
            </div>

            {/* Formulario */}
            <PayoutForm />
            
          </div>
            </section>

        </div>
      </main>
    </div>
  );
}