import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/dist/client/link";

export default async function AdminPage() {
  
    // 1. Consulta las ultimas transacciones
    const ultimasTransacciones = await prisma.transaction.findMany({
    take: 10,
    orderBy: { created_at: 'desc' },
    include: { items: true }
    });
  
    return (
      <main className="p-8">
        
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500">Vista de las ultimas transacciones del sistema.</p>
          </header>

          {/* TARJETAS DE ACCESO DIRECTO */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/admin/retiros" className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">Gestión de Retiros</h2>
                <p className="text-sm text-gray-500 mt-1">Aprobar o rechazar solicitudes de liquidación.</p>
              </div>

            </div>
            <svg className="w-6 h-6 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

          <Link href="/admin/metricas" className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">Métricas y Gráficos</h2>
                <p className="text-sm text-gray-500 mt-1">Análisis profundo del volumen transaccional.</p>
              </div>
              
            </div>
            <svg className="w-6 h-6 text-gray-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

           {/* NUEVO BOTÓN: Tickets de Soporte */}
          <Link href="/admin/tickets" className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">Tickets de Soporte</h2>
                <p className="text-sm text-gray-500 mt-1">Gestionar reclamos y mediaciones activas.</p>
              </div>
              
            </div>
            <svg className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>

        </section>


          {/* SECCIÓN 1: Movimientos Globales */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Últimos movimientos globales</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">ID Transacción</th>
                    <th className="p-4 font-medium">Vendedor (Seller ID)</th>
                    <th className="p-4 font-medium">Monto</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ultimasTransacciones.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No hay transacciones registradas todavía.
                      </td>
                    </tr>
                  ) : (
                    ultimasTransacciones.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-xs">{tx.id}</td>
                        <td className="p-4">
                          {tx.items.length === 1 ? tx.items[0].sellerId : `Múltiples (${tx.items.length} ítems)`}
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                          $ {Number(tx.amount).toLocaleString('es-AR')}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                            tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4">
                          
                          {new Date(tx.created_at || tx.created_at).toLocaleDateString('es-AR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    
  );
}