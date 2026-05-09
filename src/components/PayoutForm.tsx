"use client"

import { useState } from "react";
import { createPayout } from "@/app/actions/payouts";

export default function PayoutForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createPayout(formData);

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      alert("¡Retiro solicitado con éxito!");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">Solicitar Retiro</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Monto a retirar</label>
        <input 
          name="amount" 
          type="number" 
          required 
          placeholder="0.00"
          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">CBU / CVU de destino</label>
        <input 
          name="cbu" 
          type="text" 
          required 
          maxLength={22}
          placeholder="22 dígitos"
          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:bg-gray-400"
      >
        {loading ? "Procesando..." : "Confirmar Retiro"}
      </button>
    </form>
  );
}