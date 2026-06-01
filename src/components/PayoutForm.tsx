"use client"

import { useState } from "react";
import { createPayout } from "@/app/actions/payouts";

export default function PayoutForm() {
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensajeError("");
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await createPayout(formData);

      // Si tu Server Action devuelve algo como { error: "CBU Inválido" }
      if (result?.error) {
        setMensajeError(result.error);
      } else {
        alert("¡Retiro solicitado con éxito!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      // Si el servidor "crashea" o tira un throw explícito que no atajaste
      console.error("Error capturado en el cliente:", error);
      setMensajeError("Error interno procesando el retiro. Revisá los datos.");
    } finally {
      // MAGIA: El finally se ejecuta SIEMPRE. Si sale bien o si sale mal, apaga el botón.
      setLoading(false);
    }
    
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Solicitar Retiro</h2>
      
      {mensajeError && (
        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-xl border border-red-200 font-medium">
          {mensajeError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900">Monto a retirar</label>
        <input 
          name="amount" 
          type="number" 
          required 
          placeholder="0.00"
          className="text-gray-900 mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">CBU / CVU de destino</label>
        <input 
          name="cbu" 
          type="text" 
          required 
          maxLength={22}
          placeholder="22 dígitos"
          className="text-gray-900 mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border placeholder-gray-500"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-green-900 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:bg-gray-400"
      >
        {loading ? "Procesando..." : "Confirmar Retiro"}
      </button>
    </form>
  );
}