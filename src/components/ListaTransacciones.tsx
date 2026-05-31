import Link from "next/link";
import Accordion from "@/components/accordion";
import { TransactionItem } from "@prisma/client";

// Definimos qué datos necesita recibir este componente para funcionar
interface ListaTransaccionesProps {
  title: string;
  icon: React.ReactNode;
  transacciones: any[]; // Podés tiparlo mejor si tenés el tipo exportado de Prisma
  tipo: "VENTA" | "COMPRA";
  emptyMessage: string;
}

export default function ListaTransacciones({ 
  title, 
  icon, 
  transacciones, 
  tipo, 
  emptyMessage 
}: ListaTransaccionesProps) {
  
  return (
    <Accordion title={title} defaultOpen={true} icon={icon}>
      {transacciones.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{emptyMessage}</p>
      ) : (
        <ul className="space-y-4">
          {transacciones.map((tx) => {
            
            // Lógica condicional: ¿Cómo calculamos el monto a mostrar?
            const montoMostrar = tipo === "VENTA" 
              ? tx.items.reduce((total: number, item: TransactionItem) => total + (item.unit_price * item.quantity), 0)
              : Number(tx.amount);

            // Armamos el texto de los ítems
            const textoItems = tx.items && tx.items.length > 0
              ? tx.items.map((i: TransactionItem) => `${i.quantity}x ${i.name}`).join(" + ")
              : `${tipo === "VENTA" ? "Venta" : "Compra"} sin ítems detallados`;

            return (
              <li key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                <Link href={`/dashboard/transacciones/${tx.id}`} className="flex justify-between items-center w-full">
                  
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1" title={textoItems}>
                      {textoItems}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold text-blue-600">
                        $ {montoMostrar.toLocaleString("es-AR")}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString("es-AR")}
                      </p>             
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-auto pl-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === "PAID" ? "bg-green-100 text-green-700" :
                      tx.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {tx.status}
                    </span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Accordion>
  );
}