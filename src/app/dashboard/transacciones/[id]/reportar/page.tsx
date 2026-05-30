"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
// Asegurate de que la ruta de importación coincida con donde guardaste tu action
import { createSupportTicket } from "@/app/actions/ticket.actions"; 
import Link from "next/link";

export default function ReportarProblemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Extraemos el ID de la URL
  const { id: transactionId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensajeError("");

    try {
      const formData = new FormData(e.currentTarget);
      // Le inyectamos el ID de la transacción de forma oculta
      formData.append("transactionId", transactionId); 

      const result = await createSupportTicket(formData);

      if (result?.error) {
        setMensajeError(result.error);
      } else {
        alert("Tu reporte fue enviado con éxito. Un administrador lo revisará a la brevedad. Presta atencion al email asociado a tu cuenta!");
        // Lo devolvemos a la página de la transacción
        router.push(`/dashboard/transacciones/${transactionId}`); 
      }
    } catch (error) {
      console.error("Error en el cliente:", error);
      setMensajeError("Ocurrió un error inesperado. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Botón para volver atrás */}
        <Link 
          href={`/dashboard/transacciones/${transactionId}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la compra
        </Link>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reportar un problema</h1>
            <p className="text-gray-500 mt-2">
              Detallá el inconveniente que tuviste con esta compra. Nuestro equipo de soporte lo revisará y se pondrá en contacto con vos y el vendedor.
            </p>
          </header>

          {mensajeError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 font-medium">
              {mensajeError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Motivo del reclamo
              </label>
              <select 
                name="subject" 
                required
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white text-gray-900"
              >
                <option value="">Seleccioná una opción...</option>
                <option value="No recibí el producto">No recibí el producto</option>
                <option value="El producto llegó dañado">El producto llegó dañado</option>
                <option value="Es diferente a lo que compré">Es diferente a lo que compré</option>
                <option value="Faltan accesorios o partes">Faltan accesorios o partes</option>
                <option value="Otro motivo">Otro motivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Detalles adicionales
              </label>
              <textarea 
                name="message" 
                required
                rows={5}
                placeholder="Por favor, explicá con el mayor detalle posible cuál es el problema..."
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border placeholder-gray-400 text-gray-900 resize-none"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando reporte..." : "Enviar reporte a Soporte"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}