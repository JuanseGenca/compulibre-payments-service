"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Definimos qué forma tiene la data que va a recibir el gráfico
interface Transaction {
  amount: number;
  created_at: Date;
  status: string;
  items?: TransactionItem[];
}

interface TransactionItem {
  unit_price: number;
  quantity: number;
}

export default function UserSalesChart({ ventas }: { ventas: Transaction[] }) {
  // Procesamos los datos: Agrupamos las ventas cobradas por día
  const chartData = useMemo(() => {
    // 1. Filtramos solo las ventas cobradas
    const ventasCobradas = ventas.filter((v) => v.status === "PAID");

    // 2. Agrupamos por fecha (Ej: "15/05/2026")
    const agrupado = ventasCobradas.reduce((acc: any, curr) => {
      const fecha = new Date(curr.created_at).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short", // Mostrará "15 may"
      });

      if (!acc[fecha]) {
        acc[fecha] = 0;
      }

      const gananciaReal = curr.items 
        ? curr.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0)
        : 0;

      acc[fecha] += gananciaReal;
      return acc;
    }, {});

    // 3. Convertimos el objeto en el array que necesita Recharts
    // [{ fecha: "14 may", total: 15000 }, { fecha: "15 may", total: 45000 }]
    return Object.keys(agrupado).map((fecha) => ({
      fecha,
      total: agrupado[fecha],
    })).reverse(); // Lo invertimos para que muestre de más antiguo a más nuevo
  }, [ventas]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        No hay suficientes ventas cobradas para generar el gráfico.
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* Un gradiente de color para que se vea súper moderno */}
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="fecha" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: any) => {
              // Nos aseguramos de que sea un número válido antes de formatearlo
              const numeroSeguro = Number(value) || 0;
              return [`$ ${numeroSeguro.toLocaleString("es-AR")}`, "Ingresos"];
            }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}