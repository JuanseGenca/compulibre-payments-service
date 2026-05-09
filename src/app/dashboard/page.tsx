import Navbar from "@/components/navbar";
import PayoutForm from "@/components/PayoutForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/dist/client/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {

    const { userId } = await auth();
  if (!userId) redirect("/");

  // Traemos la cuenta del usuario
  const account = await prisma.account.findUnique({
    where: { clerk_user_id: userId }
  });

  const saldoDisponible = account?.balance || 0;

  
  // 2. Buscamos las VENTAS (el usuario es el sellerId)
  const misVentas = await prisma.transaction.findMany({
    where: { sellerId: userId },
    orderBy: { created_at: "desc" },
  });

  // 3. Buscamos las COMPRAS (el usuario es el buyerId)
  const misCompras = await prisma.transaction.findMany({
    where: { buyerId: userId },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Panel</h1>
          <p className="text-gray-500 mt-1">Gestioná tus movimientos y saldo.</p>
        </header>

        {/* TARJETA PRINCIPAL DE SALDO (HERO CARD) */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Saldo Disponible
              </p>
              <p className="text-4xl md:text-5xl font-bold text-blue-600 mt-2">
                $ {saldoDisponible.toLocaleString("es-AR")}
              </p>
            </div>
    
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link 
                href="/dashboard/retiros"
                className="flex items-center justify-center w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Retirar dinero / Historial
              </Link>
            </div>
          </section>

        {/* Grilla principal: Izquierda Ventas, Derecha Compras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA VENTAS */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 text-lg">Mis Ventas (Cobros)</h2>
            </div>
            <div className="p-6 flex-grow">
              {misVentas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aún no realizaste ninguna venta.</p>
              ) : (
                <ul className="space-y-4">
                  {misVentas.map((tx) => (
                  <li key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                    <div className="flex flex-col">
                      {/* Título de la transacción */}
                      <p className="font-semibold text-gray-900">
                        {tx.description || "Venta sin descripción"}
                      </p>
        
                      {/* Monto y fecha en la misma línea para ahorrar espacio */}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-blue-600">
                          $ {Number(tx.amount).toLocaleString("es-AR")}
                        </p>
                        <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleDateString("es-AR")}
                          </p>             
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === "PAID" ? "bg-green-100 text-green-700" :
                      tx.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                      }`}>
                      {tx.status}
                    </span>
                  </li>
               ))}
                </ul>
              )}
            </div>
          </section>

          {/* COLUMNA COMPRAS */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 text-lg">Mis Compras (Pagos)</h2>
            </div>
            <div className="p-6 flex-grow">
              {misCompras.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aún no realizaste ninguna compra.</p>
              ) : (
                <ul className="space-y-4">
                  {misCompras.map((tx) => (
                    <li key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                      <div className="flex flex-col">
                        {/* Título de la transacción */}
                        <p className="font-semibold text-gray-900">
                          {tx.description || "Compra sin descripción"}
                        </p>
        
                        {/* Monto y fecha en la misma línea para ahorrar espacio */}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-bold text-blue-600">
                            $ {Number(tx.amount).toLocaleString("es-AR")}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                     </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === "PAID" ? "bg-green-100 text-green-700" :
                        tx.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                        }`}>
                        {tx.status}
                      </span>
                    </li>
                  ))}
              </ul>
              )}
            </div>
          </section>            
        
        </div>
      </main>
    </div>
  );
}