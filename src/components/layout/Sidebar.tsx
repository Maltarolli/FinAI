"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, LayoutDashboard, Settings, Brain, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

const items = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-72 border-r border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-2xl z-20 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)]">
      <div className="p-8">
        <Link href="/" prefetch={true} className="flex items-center gap-3 font-extrabold text-2xl text-foreground/90 tracking-tight">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-2xl shadow-lg shadow-blue-500/20 text-white"
          >
            <Brain className="h-6 w-6 relative z-10" />
          </motion.div>
          <span>FinAI</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="block relative"
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/5 rounded-2xl" 
                />
              )}
              <div className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold relative z-10",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-muted-foreground/80 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 mt-auto">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl transition-all font-semibold text-muted-foreground/80 hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
