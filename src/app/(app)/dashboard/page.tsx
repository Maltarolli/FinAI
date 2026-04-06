import { createClient } from "@/lib/supabase/server";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { TransactionCharts } from "@/components/dashboard/TransactionCharts";
import { parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const period = searchParams.period as string || 'month';
  const dateStr = searchParams.date as string || new Date().toISOString();
  
  let targetDate = new Date();
  try {
    targetDate = parseISO(dateStr);
    if (isNaN(targetDate.getTime())) targetDate = new Date();
  } catch {}

  let startDate, endDate;
  if (period === 'day') {
    startDate = startOfDay(targetDate);
    endDate = endOfDay(targetDate);
  } else if (period === 'year') {
    startDate = startOfYear(targetDate);
    endDate = endOfYear(targetDate);
  } else { 
    startDate = startOfMonth(targetDate);
    endDate = endOfMonth(targetDate);
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false });

  const expenses = transactions?.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const incomes = transactions?.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 mix-blend-plus-darker dark:mix-blend-plus-lighter">Dashboard</h1>
      </div>
      
      {/* Date Filter Component */}
      <DateFilter />

      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex-1 min-w-[280px] rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">Gastos do Período</div>
          <div className="text-4xl font-black mt-2 text-foreground/90 whitespace-nowrap">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expenses)}
          </div>
        </div>
        
        <div className="flex-1 min-w-[280px] rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">Ganhos do Período</div>
          <div className="text-4xl font-black mt-2 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incomes)}
          </div>
        </div>
      </div>

      {/* Renderização de Gráficos (Somente no Client) */}
      <TransactionCharts transactions={transactions || []} />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground/80 pl-2">Transações <span className="opacity-60 font-medium text-xl">({transactions?.length || 0})</span></h2>
        
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
          {error && <div className="p-6 text-red-500">Erro: {error.message}</div>}
          {!transactions || transactions.length === 0 ? (
            <div className="h-64 flex items-center justify-center border-dashed">
              <p className="text-muted-foreground/60 font-medium text-lg">Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/5 dark:divide-white/5">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-5 hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-foreground/90 text-lg">{tx.description}</p>
                    <div className="flex items-center gap-2">
                       <span className="px-2.5 py-0.5 rounded-full bg-foreground/5 text-xs font-semibold text-muted-foreground">{tx.category}</span>
                       <span className="text-xs text-muted-foreground/70">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 font-black text-xl tracking-tight whitespace-nowrap ${tx.type === 'expense' ? 'text-red-500/90' : 'text-emerald-500/90'}`}>
                    <span>{tx.type === 'expense' ? '-' : '+'}</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
