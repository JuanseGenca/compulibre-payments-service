import Navbar from "@/components/navbar";
import Pagination from "@/components/Pagination";
import TransactionFilters from "@/components/TransactionFilters";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma, TransactionStatus } from "@prisma/client";
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
  const activeTab = (resolvedParams.tab as string) === "compras" ? "compras" : "ventas";
  
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  /// 2. Construimos filtros base tipados
  const baseFilters: Prisma.TransactionWhereInput = {
    ...(status && status !== "ALL" && { status: status as TransactionStatus }),
    created_at: (from && to) ? {
      gte: new Date(from),
      lte: new Date(to + "T23:59:59.999Z"), // Para incluir todo el día final
    } : undefined,
  };

  // Filtro específico para mis Ventas
  const ventasWhere: Prisma.TransactionWhereInput = {
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

  // Filtro específico para mis Compras
  const comprasWhere: Prisma.TransactionWhereInput = {
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

  // 3. Consultamos el Saldo siempre
  const account = await prisma.account.findUnique({ where: { clerk_user_id: userId } });
  const saldoDisponible = account?.balance || 0;

  // 4. Optimizamos consultas: Solo pedimos a la DB lo de la pestaña activa
  let misTransacciones = [];
  let totalItems = 0;

  if (activeTab === "ventas") {
    const [ventas, total] = await Promise.all([
      prisma.transaction.findMany({
        where: ventasWhere,
        include: { 
          items: { where: { sellerId: userId } } 
        },
        orderBy: { created_at: "desc" },
        take: pageSize,
        skip: skip,
      }),
      prisma.transaction.count({ where: ventasWhere }),
    ]);
    misTransacciones = ventas;
    totalItems = total;
  } else {
    const [compras, total] = await Promise.all([
      prisma.transaction.findMany({
        where: comprasWhere,
        include: { items: true },
        orderBy: { created_at: "desc" },
        take: pageSize,
        skip: skip,
      }),
      prisma.transaction.count({ where: comprasWhere }),
    ]);
    misTransacciones = compras;
    totalItems = total;
  }

  // Calculamos si hay más páginas basado en el total real de la pestaña activa
  const hasMoreItems = (skip + pageSize) < totalItems;

  // Preservamos los filtros actuales en los links de las pestañas
  const buildTabUrl = (tab: "ventas" | "compras") => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    // Reiniciamos a página 1 al cambiar de pestaña
    if (query) params.set("q", query);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (status) params.set("status", status);
    return `/dashboard?${params.toString()}`;
  };

  return (
      <main className="flex-grow p-4 md:p-8 max-w-screen-2xl mx-auto w-full space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Panel</h1>
          <p className="text-gray-500 mt-1">Gestioná tus movimientos y saldo.</p>
        </header>

        <TarjetaSaldo saldoDisponible={saldoDisponible} />

        {/* GRÁFICO DE VENTAS (Solo lo mostramos si estamos en ventas) */}
        {activeTab === "ventas" && (
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Rendimiento de Ventas</h2>
            <p className="text-sm text-gray-500 mb-4">Evolución de tus ingresos cobrados.</p>
            <UserSalesChart ventas={misTransacciones} />
          </section>
        )}

        <section>
          <TransactionFilters />
        </section>

        {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link
              href={buildTabUrl("ventas")}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === "ventas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
            >
              Mis Ventas (Cobros)
            </Link>
            <Link
              href={buildTabUrl("compras")}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === "compras"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
              `}
            >
              Mis Compras (Pagos)
            </Link>
          </nav>
        </div>

        {/* LISTA PRINCIPAL (Depende de la pestaña activa) */}
        <div className="w-full">
          {activeTab === "ventas" ? (
            <ListaTransacciones 
              title="Historial de Ventas"
              tipo="VENTA"
              transacciones={misTransacciones}
              emptyMessage="Aún no realizaste ninguna venta."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          ) : (
            <ListaTransacciones 
              title="Historial de Compras"
              tipo="COMPRA"
              transacciones={misTransacciones}
              emptyMessage="Aún no realizaste ninguna compra."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          )}
        </div>
        
        <Pagination currentPage={page} hasMore={hasMoreItems} />
      </main>
  );
}