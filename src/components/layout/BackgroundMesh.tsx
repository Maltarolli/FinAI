"use client";

export function BackgroundMesh() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f0f2f5] dark:bg-[#0b141a]">
      {/* CSS-only animated gradient blobs — zero JS overhead, GPU-accelerated via will-change */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00a884]/20 dark:bg-emerald-900/40 blur-[100px] rounded-full will-change-transform animate-blob1"
      />
      
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/20 dark:bg-blue-900/30 blur-[120px] rounded-full will-change-transform animate-blob2"
      />

      <div
        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-purple-400/10 dark:bg-purple-900/20 blur-[100px] rounded-full will-change-transform animate-blob3"
      />
    </div>
  );
}
