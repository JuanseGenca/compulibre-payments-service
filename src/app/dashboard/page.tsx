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
import TarjetaSaldo from "@/components/TarjetaSaldo";
import ListaTransacciones from "@/components/ListaTransacciones";


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

  /// 2. Construimos filtros base que comparten Ventas y Compras (Estado y Fechas)
  const baseFilters: any = {
    ...(status && status !== "ALL" && { status: status }),
    created_at: (from && to) ? {
      gte: new Date(from),
      lte: new Date(to + "T23:59:59.999Z"), // Para incluir todo el día final
    } : undefined,
  };

  // Filtro específico para mis Ventas: El ítem debe ser MÍO y coincidir con la búsqueda a la vez.
  const ventasWhere = {
    ...baseFilters,
    items: {
      some: {
        sellerId: userId,
        ...(query && {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }),
      },
    },
  };

  // Filtro específico para mis Compras: Soy el comprador y ALGÚN ítem coincide con la búsqueda.
  const comprasWhere = {
    ...baseFilters,
    buyerId: userId,
    ...(query && {
      items: {
        some: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
    }),
  };

  // 3. Ejecutamos las consultas (ahora agregamos count para saber el total real)
  const [account, misVentas, totalVentas, misCompras, totalCompras] = await Promise.all([
    prisma.account.findUnique({ where: { clerk_user_id: userId } }),
    prisma.transaction.findMany({
      where: ventasWhere,
      include: { 
        items: {
          where: { sellerId: userId }
        } 
      },
      orderBy: { created_at: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.transaction.count({ where: ventasWhere }), // Contamos el total de ventas filtradas
    
    prisma.transaction.findMany({
      where: comprasWhere,
      include: { items: true },
      orderBy: { created_at: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.transaction.count({ where: comprasWhere }), // Contamos el total de compras filtradas
  ]);

  const saldoDisponible = account?.balance || 0;

    // Calculamos si hay más páginas basado en el total real de la base de datos
  const hasMoreItems = (skip + pageSize) < Math.max(totalVentas, totalCompras);

  return (
      <main className="flex-grow p-4 md:p-8 max-w-screen-2xl mx-auto w-full space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Panel</h1>
          <p className="text-gray-500 mt-1">Gestioná tus movimientos y saldo.</p>
        </header>

        <TarjetaSaldo saldoDisponible={saldoDisponible} />

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
          <ListaTransacciones 
            title="Mis Ventas (Cobros)"
            tipo="VENTA"
            transacciones={misVentas}
            emptyMessage="Aún no realizaste ninguna venta."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          {/* COLUMNA COMPRAS */}
          <ListaTransacciones 
            title="Mis Compras (Pagos)"
            tipo="COMPRA"
            transacciones={misCompras}
            emptyMessage="Aún no realizaste ninguna compra."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
        
        </div>
        <Pagination currentPage={page} hasMore={hasMoreItems} />
      </main>
  );
}