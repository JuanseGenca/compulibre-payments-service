export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Esqueleto del Header (Título "Mi Panel") */}
        <header className="space-y-3">
          <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
        </header>

        {/* Esqueleto de la Tarjeta Hero (Saldo Disponible) */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 w-full md:w-1/2">
            <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div className="h-12 md:h-14 bg-gray-200 rounded-md w-48 md:w-64 animate-pulse"></div>
          </div>
          <div className="w-full md:w-auto">
             <div className="h-12 bg-gray-200 rounded-xl w-full md:w-56 animate-pulse"></div>
          </div>
        </section>

        {/* Esqueleto del Gráfico de Ventas */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="h-6 bg-gray-200 rounded-md w-56 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-48 mb-8 animate-pulse"></div>
          {/* Caja que simula el área del gráfico */}
          <div className="h-64 bg-gray-100 rounded-xl w-full animate-pulse border border-gray-50"></div>
        </section>

        {/* Esqueleto de los Filtros de Transacciones */}
        <section className="h-14 bg-gray-200 rounded-xl w-full animate-pulse"></section>

        {/* Esqueleto de la Grilla (Ventas / Compras) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Columna Izquierda (Esqueleto Accordion Ventas) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
             {/* Titulo del Accordion */}
             <div className="flex items-center gap-3 mb-6">
               <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse"></div>
               <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
             </div>
             {/* Items de la lista */}
             {[1, 2, 3].map((i) => (
                <div key={`venta-${i}`} className="flex justify-between items-center p-4 rounded-xl border border-gray-100">
                  <div className="space-y-2 w-1/2">
                    <div className="h-5 bg-gray-200 rounded-md w-full animate-pulse"></div>
                    <div className="flex gap-2">
                       <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                       <div className="h-4 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </div>
             ))}
          </div>

          {/* Columna Derecha (Esqueleto Accordion Compras) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
             {/* Titulo del Accordion */}
             <div className="flex items-center gap-3 mb-6">
               <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse"></div>
               <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
             </div>
             {/* Items de la lista */}
             {[1, 2].map((i) => (
                <div key={`compra-${i}`} className="flex justify-between items-center p-4 rounded-xl border border-gray-100">
                  <div className="space-y-2 w-1/2">
                    <div className="h-5 bg-gray-200 rounded-md w-full animate-pulse"></div>
                    <div className="flex gap-2">
                       <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                       <div className="h-4 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </div>
             ))}
          </div>

        </div>

      </main>
    </div>
  );
}