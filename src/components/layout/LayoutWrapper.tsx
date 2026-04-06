"use client";

import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
