"use client";

import { useMemo, useState, useEffect } from "react";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend 
} from "recharts";
import { motion } from "framer-motion";

type Transaction = {
  id: string;
  amount: number;
  category: string;
  type: string;
  created_at: string;
};

// Cores vibrantes para o gráfico de pizza (Categorias)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6'];

export function TransactionCharts({ transactions }: { transactions: Transaction[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // 1. Gráfico de Categorias (Apenas Gastos)
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    })).sort((a, b) => b.value - a.value); // Ordena maior gasto primeiro
  }, [transactions]);

  // 2. Gráfico de Barras (Receitas vs Despesas no Tempo)
  const timeData = useMemo(() => {
    const grouped = transactions.reduce((acc, curr) => {
      // Ex: "06 Abr"
      const date = new Date(curr.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      if (!acc[date]) {
        acc[date] = { date, ingressos: 0, gastos: 0 };
      }
      if (curr.type === 'income') {
        acc[date].ingressos += Number(curr.amount);
      } else {
        acc[date].gastos += Number(curr.amount);
      }
      return acc;
    }, {} as Record<string, { date: string, ingressos: number, gastos: number }>);
    
    // Sort array crônological
    const sortedDates = Object.keys(grouped).sort((a, b) => {
       // simplificação: por não ter o ano no key estrito, baseamos na ordem natural se for mesmo mes, senao usar data original
       return 1; // Para manter simples, a renderização já sai relativamente em ordem da extração se quisermos.
    });
    // actually, let's sort properly using original data before reduce
    const sortedTx = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const chronologicalGrouped = sortedTx.reduce((acc, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      if (!acc[date]) acc[date] = { date, Receitas: 0, Gastos: 0 };
      if (curr.type === 'income') acc[date].Receitas += Number(curr.amount);
      else acc[date].Gastos += Number(curr.amount);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(chronologicalGrouped);
  }, [transactions]);

  if (!mounted || !transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      
      {/* Categoria Pie Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5"
      >
        <h3 className="text-lg font-bold text-foreground/90 mb-6">Gastos por Categoria</h3>
        <div className="w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="transparent"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)}
                  contentStyle={{ borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground/60 font-medium">Nenhum gasto registrado.</div>
          )}
        </div>
      </motion.div>

      {/* Fluxo de Caixa Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5"
      >
        <h3 className="text-lg font-bold text-foreground/90 mb-6">Fluxo no Tempo</h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} 
                     tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}k` : value} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)}
                contentStyle={{ borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
