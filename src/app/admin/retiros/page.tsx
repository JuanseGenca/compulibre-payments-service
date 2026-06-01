import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RejectPayoutButton from "@/components/RechazarPayout";
import ApprovePayoutButton from "@/components/AprobarPayout";
import Pagination from "@/components/Pagination";

export const dynamic = 'force-dynamic';

export default async function AdminRetirosPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const take = 7;
  const skip = (currentPage - 1) * take;

  const [retirosPendientes, retirosCompletados, totalCompletados] = await Promise.all([
        prisma.payout.findMany({
            where: { status: "PROCESSING" },
            orderBy: { id: "asc" },
        }),
        prisma.payout.findMany({
            where: { status: "COMPLETED" },
            orderBy: { id: "desc" },
            take,
            skip,
        }),
        prisma.payout.count({
            where: { status: "COMPLETED" },
        })
    ]);

  const hasMoreCompletados = totalCompletados > skip + take;

  return (
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Navegación tipo Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Gestión de Retiros</span>
        </div>

        <header className="mb-8 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Solicitudes de Retiro</h1>
            <p className="text-gray-500">Administrá las liquidaciones de saldo de los vendedores.</p>
          </div>
          
          <Link 
            href="/admin"
            className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; Volver al Panel
          </Link>
          
        </header>

          {/* SECCIÓN 2: Retiros Pendientes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden opacity-80 mt-8">
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
          
          {/* Paginación de Historial */}
          {totalCompletados > take && (
            <Pagination currentPage={currentPage} hasMore={hasMoreCompletados} />
          )}

        </div>
      </main>
  );
}