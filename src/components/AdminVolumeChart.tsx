"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartDataPoint = {
  fecha: string;
  total: number;
  comision: number;
};

export default function AdminVolumeChart({ chartData }: { chartData: ChartDataPoint[] }) {

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        No hay datos suficientes para generar el gráfico.
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      {/* Le fijamos la altura en 300 para evitar el error de ResponsiveContainer */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} /> {/* Púrpura */}
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            formatter={(value: any, name: any) => {
              const num = Number(value) || 0;
              return [`$ ${num.toLocaleString("es-AR")}`, name === 'total' ? 'Volumen Total' : 'Ganancia (5%)'];
            }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          {/* Gráfico principal del volumen movido */}
          <Area type="monotone" dataKey="total" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmin)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}