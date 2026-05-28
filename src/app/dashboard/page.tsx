import Navbar from "@/components/navbar";
import Pagination from "@/components/Pagination";
import TransactionFilters from "@/components/TransactionFilters";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TransactionItem } from "@prisma/client";
import UserSalesChart from "@/components/UserSalesCharts";
import Accordion from "@/components/accordion";


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  
  const { userId } = await auth();
  if (!userId) redirect("/");

  const resolvedParams = await searchParams;

  // 1. Extraemos los parámetros de la URL
  const page = Number(resolvedParams.page || 1);
  const query = (resolvedParams.q as string) || "";
  const from = (resolvedParams.from as string) || "";
  const to = (resolvedParams.to as string) || "";
  const status = (resolvedParams.status as string) || "";
  
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // 2. Construimos el filtro dinámico para Prisma
  const whereFilters : any = {
    ...(query && {
      items: {
        some: {
          name: {
            contains: query,
            mode: "insensitive", // Ignora mayúsculas y minúsculas
          },
        },
      },
    }),
    ...(status && status !== "ALL" && { status: status }),
    created_at: (from && to) ? {
      gte: new Date(from),
      lte: new Date(to + "T23:59:59.999Z"), // Para incluir todo el día final
    } : undefined,
  };

  // 3. Ejecutamos las consultas con filtros y paginación e items
  const [account, misVentas, misCompras] = await Promise.all([
    prisma.account.findUnique({ where: { clerk_user_id: userId } }),
    prisma.transaction.findMany({
      where: { 
        items: {
          some: { sellerId: userId }
        },
        ...whereFilters 
      },
      include: { 
        items: {
          where: { sellerId: userId }
        } 
      },
      orderBy: { created_at: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.transaction.findMany({
      where: { buyerId: userId, ...whereFilters },
      include: { items: true },
      orderBy: { created_at: "desc" },
      take: pageSize,
      skip: skip,
    }),
  ]);

  const saldoDisponible = account?.balance || 0;

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

          {/* GRÁFICO DE VENTAS */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Rendimiento de Ventas</h2>
          <p className="text-sm text-gray-500 mb-4">Evolución de tus ingresos cobrados.</p>
          
          <UserSalesChart ventas={misVentas} />
        </section>

        <section>
          <TransactionFilters />
        </section>

        {/* Grilla principal: Izquierda Ventas, Derecha Compras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA VENTAS */}
          {/* Usamos <details> y le ponemos "open" para que arranque abierto por defecto */}
          <Accordion 
            title="Mis Ventas (Cobros)" 
            defaultOpen={true}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
            
              {misVentas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aún no realizaste ninguna venta.</p>
              ) : (
                <ul className="space-y-4">
                  {misVentas.map((tx) => {
                  // Calculamos cuánto dinero le corresponde a este vendedor de esta transacción
                  const miGanancia = tx.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);

                  return (
                  <li key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                    <Link href={`/dashboard/transacciones/${tx.id}`} className="flex justify-between items-center p-4 w-full">
                      <div className="flex flex-col">
                        {/* Título dinámico de la venta */}
                        <p className="font-semibold text-gray-900 line-clamp-1" title={tx.items && tx.items.length > 0 ? tx.items.map((i: TransactionItem) => `${i.quantity}x ${i.name}`).join(" + ") : "Venta sin ítems"}>
                          {tx.items && tx.items.length > 0
                            ? tx.items.map((i: TransactionItem) => `${i.quantity}x ${i.name}`).join(" + ")
                            : "Venta sin ítems detallados"}
                        </p>
        
                        {/* Monto y fecha en la misma línea para ahorrar espacio */}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-bold text-blue-600">
                            $ {miGanancia.toLocaleString("es-AR")}
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
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>

                    </Link>
                  </li>
                  );
                  })}
                </ul>
              )}
            
          </Accordion>

          {/* COLUMNA COMPRAS */}
          <Accordion 
            title="Mis Compras (Pagos)" 
            defaultOpen={true}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }>
            
              {misCompras.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aún no realizaste ninguna compra.</p>
              ) : (
                <ul className="space-y-4">
                  {misCompras.map((tx) => (
                    <li key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                      <Link href={`/dashboard/transacciones/${tx.id}`} className="flex justify-between items-center p-4 w-full">
                      <div className="flex flex-col">
                        {/* Título dinámico de la compra */}
                        <p className="font-semibold text-gray-900 line-clamp-1" title={tx.items && tx.items.length > 0 ? tx.items.map((i: TransactionItem) => `${i.quantity}x ${i.name}`).join(" + ") : "Compra sin ítems"}>
                          {tx.items && tx.items.length > 0
                            ? tx.items.map((i: TransactionItem) => `${i.quantity}x ${i.name}`).join(" + ")
                            : "Compra sin ítems detallados"}
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
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>

                      </Link>
                    </li>
                  ))}
              </ul>
              )}
            
          </Accordion>            
        
        </div>
        <Pagination currentPage={page} hasMore={misVentas.length === pageSize || misCompras.length === pageSize} />
      </main>
    </div>
  );
}