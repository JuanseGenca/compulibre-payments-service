import Navbar from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import ApprovePayoutButton from "@/components/AprobarPayout"; 
import RejectPayoutButton from "@/components/RechazarPayout";

export default async function AdminPage() {
  
    // 1. Consultas a la base de datos
    const [transactions, retirosPendientes, retirosCompletados] = await Promise.all([
        prisma.transaction.findMany({
            orderBy: { created_at: 'desc' }, // Ajustar a created_at si es necesario
            take: 20 
        }),
        prisma.payout.findMany({
            where: { status: "PROCESSING" },
            include: { account: true },
            orderBy: { id: "asc" },
        }),
        prisma.payout.findMany({
            where: { status: "COMPLETED" },
            include: { account: true },
            orderBy: { id: "desc" }, // Los más recientes primero
            take: 10 // Mostramos solo los últimos 10 para no saturar
        })
    ]);
  
    const totalProcesado = transactions
        .filter(t => t.status === 'PAID')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const comisiones = totalProcesado * 0.05;


    return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500">Vista global de todas las transacciones del sistema.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Procesado</h3>
              <p className="text-2xl font-bold text-blue-600"> $ {totalProcesado.toLocaleString('es-AR')} </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Comisiones (5%)</h3>
              <p className="text-2xl font-bold text-green-600"> $ {comisiones.toLocaleString('es-AR')} </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Transacciones Totales</h3>
              <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
            </div>
          </div>

          {/* SECCIÓN 1: Movimientos Globales */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No hay transacciones registradas todavía.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-xs">{tx.id}</td>
                        <td className="p-4">{tx.sellerId}</td>
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
          </div>

          {/* SECCIÓN 2: Retiros Pendientes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-orange-50/30">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Retiros Pendientes de Transferencia
              </h2>
            </div>
            <div className="p-6">
              {retirosPendientes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay retiros pendientes. ¡Todo al día!</p>
              ) : (
                <ul className="space-y-4">
                  {retirosPendientes.map((payout) => (
                    <li key={payout.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 border border-gray-100 rounded-xl gap-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-bold text-xl text-gray-900">$ {payout.amount.toLocaleString('es-AR')}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          CBU Destino: <span className="font-mono bg-white border px-2 py-1 rounded select-all">{payout.destination_cbu}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Usuario: {payout.account_id}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Botón de Rechazo (Nuevo) */}
                       <RejectPayoutButton payoutId={payout.id} />
      
                      {/* Botón de Aprobación (Ya lo tenías) */}
                        <ApprovePayoutButton payoutId={payout.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* SECCIÓN 3: Retiros Completados */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden opacity-80">
            <div className="p-6 border-b border-gray-100 bg-green-50/30">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Retiros Completados (Historial)
              </h2>
            </div>
            <div className="p-6">
              {retirosCompletados.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aún no se han completado retiros.</p>
              ) : (
                <ul className="space-y-4">
                  {retirosCompletados.map((payout) => (
                    <li key={payout.id} className="flex justify-between items-center p-4 border border-gray-50 rounded-xl bg-gray-50/50 grayscale">
                      <div>
                        <p className="font-semibold text-gray-900">$ {payout.amount.toLocaleString('es-AR')}</p>
                        <p className="text-xs text-gray-500">CBU Destino: {payout.destination_cbu}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 uppercase">Pagado</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}