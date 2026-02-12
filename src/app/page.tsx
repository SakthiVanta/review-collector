import { ReviewForm } from "@/components/ReviewForm";
import { shopConfig } from "@/config/shop";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* Glossy Overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
            <span className="text-white font-bold text-sm tracking-tight">SKS</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">{shopConfig.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[11px] text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* White/Cream Form Card */}
        <div className="bg-[#fafafa] rounded-3xl shadow-2xl shadow-black/20 overflow-hidden border border-white/20">
          <ReviewForm />
        </div>
      </div>
    </main>
  );
}