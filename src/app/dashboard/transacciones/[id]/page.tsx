import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PrintButton from "@/components/PrintButton";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { id } = await params;

  // Buscamos la transacción con sus ítems
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!tx) {
    return notFound();
  }

  // 2. Determinamos el rol del usuario
  const esComprador = tx.buyerId === userId;

  // 3. Filtramos los ítems: el comprador ve todo, el vendedor ve solo lo suyo
  const misItems = esComprador 
    ? tx.items 
    : tx.items.filter(item => item.sellerId === userId);

  const esVendedor = misItems.length > 0 && !esComprador;

  // Si no es el comprador y tampoco tiene ítems acá, no tiene permiso para ver esto
  if (!esComprador && !esVendedor) {
    return notFound();
  }

  // 4. Calculamos el monto a mostrar en el recibo principal
  // El comprador ve el total general de la operación. El vendedor ve solo su ganancia.
  const totalMostrar = esComprador 
    ? tx.amount 
    : misItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="flex-grow p-4 md:p-8 max-w-3xl mx-auto w-full print:p-0">
        
        <div className="flex justify-between items-center mb-6 print:hidden">
            <Link 
            href="/dashboard" 
            className="text-sm text-blue-600 hover:underline mb-6 inline-block"
            >
                ← Volver al panel
            </Link>
            <PrintButton />
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
          {/* Cabecera del Recibo */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50 text-center print:bg-transparent">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              tx.status === 'PAID' ? 'bg-green-100 text-green-700' : 
              tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {tx.status}
            </span>

            <p className="text-gray-500 font-medium text-sm mt-4 uppercase tracking-widest">
              {esComprador ? "Total pagado" : "Ingreso por tus ventas"}
            </p>
            <h1 className="text-4xl font-black text-gray-900 mt-1">
              $ {totalMostrar.toLocaleString("es-AR")} {tx.currency}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date(tx.created_at).toLocaleString("es-AR", { 
                dateStyle: 'long', 
                timeStyle: 'short' 
              })}
            </p>

          </div>

          {/* Cuerpo del Recibo */}
          <div className="p-8 space-y-8">
            
            {/* Detalle de Ítems */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Detalle de productos {esVendedor && "(Tus artículos)"}
              </h2>
              <ul className="space-y-3">
                {tx.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-gray-700">
                    <span className="font-medium">
                      <span className="text-gray-400 mr-2">{item.quantity}x</span>
                      {item.name}
                    </span>
                    $ {item.unit_price.toLocaleString("es-AR")} {tx.currency}
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-gray-100 print:border-gray-300" />

            {/* Información Técnica */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-400 font-medium">Referencia de Orden</p>
                <p className="text-gray-900 font-mono">{tx.external_order_reference || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Método de Pago</p>
                <p className="text-gray-900 capitalize">{tx.payment_method || "No especificado"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Rol en la operación</p>
                <p className="text-gray-900">{esVendedor ? "Vendedor" : "Comprador"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">ID de Transacción</p>
                <p className="text-gray-700 text-xs truncate" title={tx.id}>{tx.id}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Direccion del comprador</p>
                <p className="text-gray-700 text-xs truncate" title={tx.buyerAddress}>{tx.buyerAddress}</p>
              </div>
              
            </div>
          </div>

          {/* Pie del Recibo */}
          <div className="p-6 bg-gray-900 text-center print:bg-white print:border-t print:border-gray-200">
            <p className="text-gray-400 text-xs print:text-gray-500">CompuLibre Payments - Comprobante oficial de operación</p>
          </div>
        </div>
      </main>
    </div>
  );
}