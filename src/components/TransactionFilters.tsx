"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200">
      <input
        type="text"
        placeholder="Buscar por descripción..."
        className="p-2 border rounded-lg text-gray-900"
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => handleFilter("q", e.target.value)}
      />
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-500">Desde:</span>
        <input
          type="date"
          className="p-2 border rounded-lg text-gray-900 flex-grow"
          defaultValue={searchParams.get("from") || ""}
          onChange={(e) => handleFilter("from", e.target.value)}
        />
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-500">Hasta:</span>
        <input
          type="date"
          className="p-2 border rounded-lg text-gray-900 flex-grow"
          defaultValue={searchParams.get("to") || ""}
          onChange={(e) => handleFilter("to", e.target.value)}
        />
      </div>
      <div className="flex flex-col w-full md:w-auto">
        <label htmlFor="statusFilter" className="text-xs text-gray-500 font-medium mb-1">
          Estado
        </label>
        <select
          id="statusFilter"
          className="border border-gray-300 rounded-lg p-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          defaultValue={searchParams.get("status") || "ALL"}
          onChange={(e) => handleFilter("status", e.target.value)}
        >
          <option value="ALL">Todos los estados</option>
          <option value="PAID">Cobrados (PAID)</option>
          <option value="PENDING">Pendientes (PENDING)</option>
          <option value="REJECTED">Rechazados (REJECTED)</option>
        </select>
      </div>
    </div>
  );
}