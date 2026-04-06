"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, add, sub, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Period = 'day' | 'month' | 'year';

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPeriod = (searchParams.get('period') as Period) || 'month';
  const currentDateStr = searchParams.get('date') || new Date().toISOString();
  
  let currentDate = new Date();
  try {
    currentDate = parseISO(currentDateStr);
    if (isNaN(currentDate.getTime())) currentDate = new Date();
  } catch {}

  const updateURL = (period: Period, date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    params.set('date', date.toISOString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const setPeriod = (p: Period) => updateURL(p, currentDate);
  const navigate = (direction: 1 | -1) => {
    const addFn = direction === 1 ? add : sub;
    const amount = currentPeriod === 'day' ? { days: 1 } 
                 : currentPeriod === 'month' ? { months: 1 }
                 : { years: 1 };
    updateURL(currentPeriod, addFn(currentDate, amount));
  };

  const formattedDate = () => {
    if (currentPeriod === 'day') return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
    if (currentPeriod === 'month') return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    return format(currentDate, "yyyy");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row items-center justify-between bg-white/40 dark:bg-black/20 backdrop-blur-2xl text-card-foreground border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 p-2 rounded-3xl mb-8 space-y-4 md:space-y-0 relative z-10 w-full"
    >
      <div className="flex bg-white/40 dark:bg-black/30 p-1.5 rounded-2xl w-full md:w-auto shadow-inner">
        <button 
          onClick={() => setPeriod('day')} 
          className={cn("flex-1 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all", currentPeriod === 'day' ? "bg-white dark:bg-[#1a1a1a] shadow-md text-foreground scale-100" : "text-muted-foreground hover:text-foreground scale-95")}
        >
          Diário
        </button>
        <button 
          onClick={() => setPeriod('month')} 
          className={cn("flex-1 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all", currentPeriod === 'month' ? "bg-white dark:bg-[#1a1a1a] shadow-md text-foreground scale-100" : "text-muted-foreground hover:text-foreground scale-95")}
        >
          Mensal
        </button>
        <button 
          onClick={() => setPeriod('year')} 
          className={cn("flex-1 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all", currentPeriod === 'year' ? "bg-white dark:bg-[#1a1a1a] shadow-md text-foreground scale-100" : "text-muted-foreground hover:text-foreground scale-95")}
        >
          Anual
        </button>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end px-3">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-foreground rounded-2xl transition-all shadow-sm active:scale-95 flex-shrink-0">
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </button>
        <div className="flex items-center gap-2 min-w-[160px] justify-center px-4 py-3 bg-white/10 dark:bg-black/10 rounded-2xl border border-white/20 dark:border-white/5">
          <Calendar size={18} className="text-muted-foreground" />
          <span className="font-bold text-[15px] capitalize tracking-tight text-foreground/90">{formattedDate()}</span>
        </div>
        <button onClick={() => navigate(1)} className="p-3 bg-white/30 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-foreground rounded-2xl transition-all shadow-sm active:scale-95 flex-shrink-0">
          <ChevronRight size={20} className="stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
}
