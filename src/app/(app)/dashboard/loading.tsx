export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-full space-y-4 animate-pulse pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-48 bg-foreground/10 rounded-2xl" />
      </div>
      
      {/* Date Filter skeleton */}
      <div className="h-16 bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl" />

      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex-1 min-w-[280px] rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5">
          <div className="h-4 w-32 bg-foreground/10 rounded-lg" />
          <div className="h-10 w-40 bg-foreground/10 rounded-lg mt-3" />
        </div>
        <div className="flex-1 min-w-[280px] rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5">
          <div className="h-4 w-32 bg-foreground/10 rounded-lg" />
          <div className="h-10 w-40 bg-foreground/10 rounded-lg mt-3" />
        </div>
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5">
          <div className="h-5 w-44 bg-foreground/10 rounded-lg mb-6" />
          <div className="h-64 bg-foreground/5 rounded-2xl" />
        </div>
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-6 shadow-xl shadow-black/5">
          <div className="h-5 w-36 bg-foreground/10 rounded-lg mb-6" />
          <div className="h-64 bg-foreground/5 rounded-2xl" />
        </div>
      </div>

      {/* Transactions skeleton */}
      <div className="mt-12">
        <div className="h-8 w-48 bg-foreground/10 rounded-lg mb-6" />
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-5 border-b border-foreground/5">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-40 bg-foreground/10 rounded-lg" />
                <div className="h-3 w-24 bg-foreground/5 rounded-lg" />
              </div>
              <div className="h-6 w-24 bg-foreground/10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
