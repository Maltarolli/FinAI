"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Moon, Sun, Monitor, LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? null);
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-full space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 mix-blend-plus-darker dark:mix-blend-plus-lighter">Configurações</h1>
        <p className="text-muted-foreground/80 mt-2 font-medium text-lg">Gerencie sua conta e aparência do App.</p>
      </div>

      <div className="grid gap-6">
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-2xl shadow-xl shadow-black/5 overflow-hidden"
        >
          <div className="p-6 border-b border-white/20 dark:border-white/5 bg-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground/90">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><User className="w-5 h-5" /></div>
              Seu Perfil
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">E-mail conectado</label>
              <div className="mt-2 text-foreground/90 font-semibold text-lg bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-white/30 dark:border-white/10 w-fit px-5 py-3 rounded-2xl shadow-inner">
                {email || "Carregando..."}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Status Proteção</label>
              <div className="mt-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20">
                <Shield className="w-5 h-5" /> Conta 100% Segura
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-2xl shadow-xl shadow-black/5 overflow-hidden"
        >
          <div className="p-6 border-b border-white/20 dark:border-white/5 bg-white/10 dark:bg-white/5">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground/90">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500"><Moon className="w-5 h-5" /></div> 
              Aparência Global
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "light", icon: Sun, label: "Modo Claro" },
                { id: "dark", icon: Moon, label: "Modo Escuro" },
                { id: "system", icon: Monitor, label: "Automático" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all relative overflow-hidden",
                    theme === t.id 
                      ? "border-indigo-500 bg-white dark:bg-[#1a1a1a] text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 scale-100" 
                      : "border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:border-indigo-500/50 text-muted-foreground/70 scale-95 hover:scale-[0.98]"
                  )}
                >
                  <t.icon className={cn("w-8 h-8 mb-3 transition-transform", theme === t.id && "scale-110")} />
                  <span className="font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-2xl shadow-xl shadow-black/5 overflow-hidden"
        >
          <div className="p-8">
             <button 
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-red-500 text-white hover:bg-red-600 p-5 rounded-2xl transition-all font-bold text-lg shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50"
            >
              <LogOut className="w-6 h-6" />
              {isLoading ? "Desconectando..." : "Sair da Conta"}
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
