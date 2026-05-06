import Navbar from "@/components/navbar";

export default function AdminPage() {
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
              <p className="text-2xl font-bold text-blue-600">$ 1.250.000</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Comisiones (5%)</h3>
              <p className="text-2xl font-bold text-green-600">$ 62.500</p>
            </div>
            {/* Más métricas aquí */}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Últimos movimientos globales</h2>
            </div>
            <div className="p-12 text-center text-gray-400">
              {/* Aquí irá la tabla de Prisma con todas las ventas */}
              Próximamente: Lista de transacciones de todos los vendedores.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}