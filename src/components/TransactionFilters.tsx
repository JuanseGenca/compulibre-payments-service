"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useState } from "react";

export default function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      
      {/* EL BOTÓN QUE ABRE Y CIERRA */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2">
          {/* Icono de filtro (opcional) */}
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg text-gray-900 font-bold">Filtrar Movimientos</h2>
        </div>

        {/* Flechita que gira dependiendo del estado isOpen */}
        <svg 
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* EL CONTENEDOR DESPLEGABLE */}
      {/* Si isOpen es true, se muestra. Si es false, desaparece. */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            
            {/* INPUT DE BUSCADOR POR TEXTO (Ejemplo, adaptalo al tuyo) */}
            <div className="flex flex-col w-full md:w-1/3">
              <label className="text-xs text-gray-900 font-medium mb-1">Buscar producto</label>
              <input
                type="text"
                placeholder="Buscar por descripción..."
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                defaultValue={searchParams.get("q") || ""}
                onChange={(e) => handleFilter("q", e.target.value)}
              />
            </div>

            {/* SELECTOR DE ESTADOS (El que armamos antes) */}
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="statusFilter" className="text-xs text-gray-900 font-medium mb-1">Estado</label>
              <select
                id="statusFilter"
                className="border border-gray-300 rounded-lg p-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full"
                defaultValue={searchParams.get("status") || "ALL"}
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
                defaultValue={searchParams.get("from") || ""}
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
                defaultValue={searchParams.get("to") || ""}
                onChange={(e) => handleFilter("to", e.target.value)}
                className={`border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full
                  ${!searchParams.get("to") ? "text-gray-400" : "text-gray-900"}
                `}
              />
            </div>


          </div>
        </div>
      )}

    </div>
  );
}