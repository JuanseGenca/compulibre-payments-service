import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import AdminVolumeChart from "@/components/AdminVolumeChart";

export default async function AdminMetricasPage() {

  // Traemos TODAS las transacciones para analizarlas
  const transacciones = await prisma.transaction.findMany({
    orderBy: { created_at: 'desc' }
  });

  // Cálculos rápidos para las tarjetas (KPIs)
  const txCobradas = transacciones.filter(t => t.status === 'PAID');
  const volumenTotal = txCobradas.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const gananciaPlataforma = volumenTotal * 0.05; // 5% de comisión imaginaria
  const ticketPromedio = txCobradas.length > 0 ? volumenTotal / txCobradas.length : 0;

  return (
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-purple-600 transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Métricas y Gráficos</span>
        </div>

        <header className="mb-8 flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Rendimiento Global</h1>
            <p className="text-gray-500">Análisis del flujo de dinero en CompuLibre Payments.</p>
          </div>

          <Link 
            href="/admin"
            className="text-base font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            &larr; Volver al Panel
          </Link>

        </header>

        {/* TARJETAS DE INDICADORES (KPIs) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Volumen Procesado</h3>
            <p className="text-3xl font-black text-gray-900">$ {volumenTotal.toLocaleString("es-AR")}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm bg-purple-50/30">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Ingresos (Comisión 5%)</h3>
            <p className="text-3xl font-black text-purple-700">$ {gananciaPlataforma.toLocaleString("es-AR")}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Operaciones Exitosas</h3>
            <p className="text-3xl font-black text-gray-900">{txCobradas.length}</p>
            <p className="text-xs text-gray-500 mt-1">De {transacciones.length} intentos totales</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ticket Promedio</h3>
            <p className="text-3xl font-black text-gray-900">$ {ticketPromedio.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</p>
          </div>

        </section>

        {/* SECCIÓN DEL GRÁFICO */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Evolución del Volumen</h2>
              <p className="text-sm text-gray-500">Transacciones cobradas por día.</p>
            </div>
            {/* Un pequeño badge decorativo */}
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Sistema Operativo
            </span>
          </div>
          
          <AdminVolumeChart transacciones={transacciones} />
        </section>

      </main>
  );
}