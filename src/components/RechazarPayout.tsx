"use client";

import { useState } from "react";
import { rejectPayout } from "@/app/actions/admin";

export default function RejectPayoutButton({ payoutId }: { payoutId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleReject() {
    const confirm = window.confirm("¿Estás seguro de rechazar este retiro? El dinero será devuelto al balance del usuario.");
    if (!confirm) return;

    setLoading(true);
    const result = await rejectPayout(payoutId);
    
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <button 
      onClick={handleReject}
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-sm font-semibold px-4 py-2 transition-colors disabled:text-gray-400"
    >
      {loading ? "Procesando..." : "Rechazar y Reembolsar"}
    </button>
  );
}