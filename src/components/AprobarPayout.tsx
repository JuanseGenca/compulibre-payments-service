"use client";

import { useState } from "react";
import { markPayoutAsCompleted } from "@/app/actions/admin";

export default function ApprovePayoutButton({ payoutId }: { payoutId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    // Pequeña confirmación por si hacés clic sin querer
    if (!window.confirm("¿Ya transferiste la plata a este CBU en la vida real?")) return;

    setLoading(true);
    try {
      const result = await markPayoutAsCompleted(payoutId);
      if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      alert("Ocurrió un error al aprobar el retiro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleApprove} 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400"
    >
      {loading ? "Actualizando..." : "Marcar Pagado"}
    </button>
  );
}