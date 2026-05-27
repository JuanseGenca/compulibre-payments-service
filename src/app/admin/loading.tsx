export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Esqueleto del Navbar */}
      <div className="h-16 bg-white border-b border-gray-200 animate-pulse"></div>
      
      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Esqueleto del Header (Título y subtítulo) */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/4 animate-pulse"></div>
        </div>

        {/* Esqueleto de las Tarjetas (KPIs) */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="h-3 bg-gray-200 rounded-full w-1/2 mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
            </div>
          ))}
        </section>

        {/* Esqueleto de la Tabla / Gráfico principal */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
          <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-6 animate-pulse"></div>
          
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-md w-full animate-pulse"></div>
            <div className="h-10 bg-gray-50 rounded-md w-full animate-pulse"></div>
            <div className="h-10 bg-gray-50 rounded-md w-full animate-pulse"></div>
            <div className="h-10 bg-gray-50 rounded-md w-full animate-pulse"></div>
          </div>
        </section>

      </main>
    </div>
  );
}