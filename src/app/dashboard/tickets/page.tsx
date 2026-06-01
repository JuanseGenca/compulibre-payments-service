import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SupportTicket } from "@prisma/client"

export default async function MisTicketsPage() {
  // 1. Validamos que el usuario esté logueado
  const { userId } = await auth();
  if (!userId) redirect("/");

  // 2. Traemos todos los tickets de este usuario (los más recientes primero)
  const tickets = await prisma.supportTicket.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
  });

  const activeTickets = tickets.filter(t => t.status === "OPEN" || t.status === "REVIEWING");
  const resolvedTickets = tickets.filter(t => t.status === "CLOSED");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
            Abierto
          </span>
        );
      case "REVIEWING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
            En Revisión
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
            Resuelto
          </span>
        );
      default:
        return null;
    }
  };

  const renderTicketCard = (ticket: SupportTicket) => (
    <div 
      key={ticket.id} 
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 transition-all"
    >
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3">
          {/* Badge dinámico según el estado */}
          {getStatusBadge(ticket.status)}
          
          <span className="text-xs text-gray-400">
            Enviado el {new Date(ticket.createdAt).toLocaleDateString("es-AR")}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-lg">{ticket.subject}</h3>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl italic border border-gray-100">
          &quot;{ticket.message}&quot;
        </p>
      </div>

      {/* Acciones del ticket */}
      <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
        <Link
          href={`/dashboard/transacciones/${ticket.transactionId}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-xl text-sm transition-colors shadow-sm"
        >
          Ver Compra
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/*Historial */}
        <header className="mb-6 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Historial de Reclamos</h1>
            <p className="text-gray-500 mt-1">Seguí el estado de tus reportes enviados a soporte.</p>
          </div>
          
          <Link 
            href="/dashboard"
            className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; Volver al Panel
          </Link>
        </header>

        {/* LISTADO DE TICKETS */}
        {tickets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold text-lg">No tenés ningún reclamo activo</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {activeTickets.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Reclamos Activos</h2>
                <div className="space-y-4">
                  {activeTickets.map(renderTicketCard)}
                </div>
              </section>
            )}

            {resolvedTickets.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Reclamos Resueltos</h2>
                <div className="space-y-4">
                  {resolvedTickets.map(renderTicketCard)}
                </div>
              </section>
            )}

          </div>
        )}

      </main>
  );
}