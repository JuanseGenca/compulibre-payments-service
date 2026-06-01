import { TransactionStatusBadge } from "@/components/TransactionStatusBadge";

type TransactionItem = {
  sellerId: string;
};

type Transaction = {
  id: string;
  items: TransactionItem[];
  amount: number | { toString(): string } | unknown;
  status: string;
  created_at: Date;
};

interface AdminRecentTransactionsTableProps {
  transacciones: Transaction[];
}

export default function AdminRecentTransactionsTable({
  transacciones,
}: AdminRecentTransactionsTableProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">
          Últimos movimientos globales
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="p-4 font-medium">ID Transacción</th>
              <th className="p-4 font-medium">Vendedor (Seller ID)</th>
              <th className="p-4 font-medium">Monto</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transacciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No hay transacciones registradas todavía.
                </td>
              </tr>
            ) : (
              transacciones.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-mono text-xs">{tx.id}</td>
                  <td className="p-4">
                    {tx.items.length === 1
                      ? tx.items[0].sellerId
                      : `Múltiples (${tx.items.length} ítems)`}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(Number(tx.amount))}
                  </td>
                  <td className="p-4">
                    <TransactionStatusBadge status={tx.status as "PENDING" | "PAID" | "FAILED" | "REFUNDED"} />
                  </td>
                  <td className="p-4">
                    {new Date(tx.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
