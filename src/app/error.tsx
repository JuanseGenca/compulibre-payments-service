"use client"; // Error boundaries siempre deben ser Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  // Registramos el error en la consola 
  useEffect(() => {
    console.error("Error capturado por el Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm max-w-lg w-full text-center">
        
        {/* Ícono de Advertencia / Fallo */}
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Textos */}
        <div className="space-y-3 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Error del Sistema</h1>
          <p className="text-gray-500 text-sm">
            Algo salió mal internamente. Podría ser un problema temporal de conexión o de la base de datos.
          </p>
        
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          
          {/* Botón: Vuelve a ejecutar la función que falló */}
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>

          {/* Botón de escape seguro */}
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Volver al Panel
          </Link>
          
        </div>

      </div>
      
      <div className="mt-8 text-sm text-gray-400">
        CompuLibre Payments &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}