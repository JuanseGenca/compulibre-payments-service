"use client";

import { useState } from "react";
import { closeSupportTicket } from "@/app/actions/ticket.actions";

export default function TicketActionButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    const confirmar = confirm("¿Estás seguro de que ya resolviste este problema manualmente?");
    if (!confirmar) return;

    setLoading(true);
    try {
      const result = await closeSupportTicket(ticketId);
      if (result?.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Fallo inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
    >
      {loading ? "Cerrando..." : "Marcar como Resuelto ✓"}
    </button>
  );
}