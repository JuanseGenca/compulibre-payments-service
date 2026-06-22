import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // 1. Validar seguridad inter-servicios (Opcional pero recomendado)
  const apiKey = request.headers.get('x-api-key');
  if (process.env.PAYMENTS_API_KEY && apiKey !== process.env.PAYMENTS_API_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2. Obtener métricas globales usando agregaciones nativas de Prisma
    const [totalTransactions, revenueAggregation] = await Promise.all([
      prisma.transaction.count({
        where: { status: 'PAID' }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      })
    ]);

    const grossRevenue = revenueAggregation._sum.amount || 0;

    // 3. Preparar datos para el gráfico (Últimos 7 días)
    const chartDataMap = new Map<string, number>();
    
    // Inicializamos el mapa con los últimos 7 días en $0
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }); // Formato "DD/MM"
      chartDataMap.set(dateStr, 0);
    }

    // Calculamos la fecha de corte (hace 7 días)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Traemos solo las transacciones pagadas de la última semana
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        status: 'PAID',
        created_at: {
          gte: sevenDaysAgo
        }
      },
      select: {
        amount: true,
        created_at: true
      }
    });

    // Sumamos los montos en su día correspondiente
    recentTransactions.forEach(tx => {
      const dateStr = tx.created_at.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      if (chartDataMap.has(dateStr)) {
        chartDataMap.set(dateStr, chartDataMap.get(dateStr)! + tx.amount);
      }
    });

    // Convertimos el mapa al array de objetos que espera el Dashboard
    const revenueChart = Array.from(chartDataMap, ([date, revenue]) => ({ date, revenue }));

    // 4. Devolver la estructura JSON exacta acordada
    return NextResponse.json({
      totalTransactions,
      grossRevenue,
      revenueChart
    }, { status: 200 });

  } catch (error) {
    console.error("Error generando analíticas:", error);
    return NextResponse.json({ error: "Error interno procesando métricas" }, { status: 500 });
  }
}