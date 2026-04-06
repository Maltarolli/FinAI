"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="md:hidden fixed bottom-0 w-full border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl pb-safe z-50">
      <div className="flex justify-around items-center h-[72px] px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <div className="relative p-2">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full"
                  />
                )}
                <Icon 
                  className={cn(
                    "h-6 w-6 relative z-10 transition-colors", 
                    isActive ? "text-blue-600 dark:text-blue-400 stroke-[2.5]" : "text-muted-foreground/70 stroke-2"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-bold mt-1 transition-colors tracking-wide",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="relative flex flex-col items-center justify-center w-full h-full text-muted-foreground/70 hover:text-red-500 transition-colors"
        >
          <div className="p-2">
            <LogOut className="h-6 w-6 stroke-2" />
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-wide">Sair</span>
        </button>
      </div>
    </nav>
  );
}
