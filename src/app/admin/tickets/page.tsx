import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TicketActionButton from "@/components/TicketActionButton";
import Pagination from "@/components/Pagination";

export const dynamic = 'force-dynamic';

export default async function AdminTicketsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const take = 10;
  const skip = (currentPage - 1) * take;

  // 2. Buscamos tickets abiertos y cerrados al mismo tiempo
  const [ticketsAbiertos, ticketsCerrados, totalCerrados] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.supportTicket.findMany({
      where: { status: "CLOSED" },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.supportTicket.count({
      where: { status: "CLOSED" },
    })
  ]);

  const hasMoreCerrados = totalCerrados > skip + take;

  return (
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Navegación tipo Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Tickets de Soporte</span>
          </div>

          <header className="mb-8 flex justify-between items-end border-b pb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Centro de Resolución</h1>
              <p className="text-gray-500">Gestioná los reclamos y mediaciones de los usuarios.</p>
            </div>
            
            <Link 
              href="/admin"
              className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              &larr; Volver al Panel
            </Link>
          </header>

          {/* SECCIÓN 1: Tickets Abiertos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 bg-red-50/30">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Reclamos Abiertos (Pendientes de revisión)
              </h2>
            </div>
            <div className="p-6">
              {ticketsAbiertos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay reclamos abiertos. ¡Excelente servicio!</p>
              ) : (
                <ul className="space-y-4">
                  {ticketsAbiertos.map((ticket) => (
                    <li key={ticket.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 border border-gray-100 rounded-xl gap-4 hover:bg-gray-50 transition-colors">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-900">{ticket.subject}</h3>
                            <span className="text-xs text-gray-400">
                                {new Date(ticket.createdAt).toLocaleDateString("es-AR")}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 p-3 rounded-lg italic">
                          &quot;{ticket.message}&quot;
                        </p>
                        <p className="text-xs text-gray-500">
                          Comprador ID: <span className="font-mono bg-white border px-2 py-1 rounded select-all">{ticket.buyerId}</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <Link 
                          href={`/dashboard/transacciones/${ticket.transactionId}`} 
                          target="_blank"
                          className="text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 py-2.5 px-4 rounded-xl transition-colors text-center w-full sm:w-auto"
                        >
                          Ver Transacción ↗
                        </Link>
                        <div className="w-full sm:w-auto">
                          <TicketActionButton ticketId={ticket.id} />
                        </div>
                      </div>
                      
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: Tickets Cerrados (Historial) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden opacity-80 mt-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Reclamos Cerrados
              </h2>
            </div>
            <div className="p-6">
              {ticketsCerrados.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aún no se han cerrado tickets.</p>
              ) : (
                <ul className="space-y-4">
                  {ticketsCerrados.map((ticket) => (
                    <li key={ticket.id} className="flex justify-between items-center p-4 border border-gray-50 rounded-xl bg-gray-50/50 grayscale">
                      <div>
                        <p className="font-semibold text-gray-900">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 italic mt-1">&quot;{ticket.message}&quot;</p>
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase ml-4">Resuelto</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Paginación de Historial */}
          {totalCerrados > take && (
            <Pagination currentPage={currentPage} hasMore={hasMoreCerrados} />
          )}

        </div>
      </main>
  );
}