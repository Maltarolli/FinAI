import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BackgroundMesh } from "@/components/layout/BackgroundMesh";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] bg-transparent relative z-0">
      <BackgroundMesh />
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto w-full relative z-10">
          {children}
          {/* Espaçador para mobile: empurra o conteúdo acima do BottomNav */}
          <div className="h-[96px] md:hidden w-full shrink-0 pb-safe" />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
