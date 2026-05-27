import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm max-w-lg w-full text-center">
        
        {/* Ícono de Lupa "Rota" o Vacía */}
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>

        {/* Textos */}
        <div className="space-y-3 mb-8">
          <h1 className="text-5xl font-black text-gray-900">404</h1>
          <h2 className="text-xl font-bold text-gray-800">Página no encontrada</h2>
          <p className="text-gray-500 text-sm">
            Parece que te perdiste. El enlace podría estar roto o la transacción que estás buscando ya no existe en el sistema.
          </p>
        </div>

        {/* Botón de regreso */}
        <div className="pt-2">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel Principal
          </Link>
        </div>

      </div>
      
      {/* Footer decorativo opcional */}
      <div className="mt-8 text-sm text-gray-400">
        CompuLibre Payments &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}