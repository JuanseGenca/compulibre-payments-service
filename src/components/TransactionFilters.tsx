"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useState } from "react";
import Accordion from "./accordion";

export default function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [busqueda, setBusqueda] = useState(searchParams.get("q") || "");

  function handleFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set("page", "1"); // Al filtrar, volvemos a la página 1

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  useEffect(() => {
    // Iniciamos un temporizador de 500ms
    const timeoutId = setTimeout(() => {
      // Si la caja de texto tiene algo distinto a la URL, lo mandamos
      if (busqueda !== (searchParams.get("q") || "")) {
        handleFilter("q", busqueda);
      }
    }, 500);

    // Si el usuario presiona otra tecla antes de los 500ms, cancelamos el envío anterior
    return () => clearTimeout(timeoutId);
    
    // Este efecto solo vigila a la variable 'busqueda'
  }, [busqueda, searchParams]);

  const limpiarFiltros = () => {
    setBusqueda("");
    router.replace(pathname);
  };

  // Verificamos si hay algún filtro activo para mostrar u ocultar el botón
  const hayFiltrosActivos = searchParams.toString().length > 0;

  return (
    
      <Accordion 
        title="Filtrar Movimientos" 
        defaultOpen={false}
        icon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        }>

        <div className="flex flex-col md:flex-row gap-4 items-end">

            {/* INPUT DE BUSCADOR POR TEXTO (Ejemplo, adaptalo al tuyo) */}
            <div className="flex flex-col w-full md:w-1/3">
              <label className="text-xs text-gray-900 font-medium mb-1">Buscar producto</label>
              <input
                type="text"
                placeholder="Buscar por descripción..."
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* SELECTOR DE ESTADOS (El que armamos antes) */}
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="statusFilter" className="text-xs text-gray-900 font-medium mb-1">Estado</label>
              <select
                id="statusFilter"
                className="border border-gray-300 rounded-lg p-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full"
                value={searchParams.get("status") || "ALL"}
                onChange={(e) => handleFilter("status", e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="PAID">Cobrados (PAID)</option>
                <option value="PENDING">Pendientes (PENDING)</option>
                <option value="REJECTED">Rechazados (REJECTED)</option>
              </select>
            </div>

            {/* ACÁ PODÉS AGREGAR TUS INPUTS DE FECHAS DE LA MISMA MANERA */}
            <div className="flex flex-col w-full md:w-1/3">
              <label className="text-xs text-gray-900 font-medium mb-1">Desde</label>
              <input
                type="date"
                value={searchParams.get("from") || ""}
                onChange={(e) => handleFilter("from", e.target.value)}
                className={`border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full
                  ${!searchParams.get("from") ? "text-gray-400" : "text-gray-900"}
                `}
              />
            </div>

            <div className="flex flex-col w-full md:w-1/3">
              <label className="text-xs text-gray-900 font-medium mb-1">Hasta</label>
              <input
                type="date"
                value={searchParams.get("to") || ""}
                onChange={(e) => handleFilter("to", e.target.value)}
                className={`border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full
                  ${!searchParams.get("to") ? "text-gray-400" : "text-gray-900"}
                `}
              />
            </div>
            
            {/* BOTÓN LIMPIAR FILTROS (Solo aparece si hay filtros activos) */}
            {hayFiltrosActivos && (
            <div className="w-full md:w-auto">
              <button
                onClick={limpiarFiltros}
                className="w-full md:w-auto whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
              >
                Limpiar filtros
              </button>
            </div>
            )}

        </div>
      </Accordion>
    
  );
}