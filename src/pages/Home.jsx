import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Activity, ArrowRight, XOctagon } from 'lucide-react';

const Home = () => {

  const handleExit = () => {
    // External redirect
    window.location.replace("https://fyimp-hub-main.vercel.app/");
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] font-sans flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-red-500/30">

      {/* Background Grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#262626 1px, transparent 1px), linear-gradient(90deg, #262626 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <main className="w-full max-w-2xl relative z-10 animate-in zoom-in-95 fade-in duration-500">
        
        {/* Icon Section */}
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase">
            Restricted Area
          </h1>
          <p className="text-red-400 font-bold tracking-widest text-sm md:text-base uppercase">
            Unauthorized Access is Strictly Prohibited
          </p>
        </div>

        {/* Content Card */}
        <section className="bg-[#111] border border-[#333] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-amber-500 flex-shrink-0 mt-1" />
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              You are attempting to access the internal Resource Management Subsystem.
              This portal is strictly classified for authorized faculty, system administrators,
              and verified personnel only.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <Activity size={24} className="text-blue-500 flex-shrink-0 mt-1" />
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              All traffic on this node is subject to security auditing.
              Any attempt to bypass authentication or probe internal endpoints
              is a violation of institutional policy.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-6 mt-6 border-t border-[#222] flex flex-col sm:flex-row gap-4">
            
            <button
              onClick={handleExit}
              className="flex-1 flex items-center justify-center gap-2 bg-[#222] hover:bg-[#333] text-slate-300 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
            >
              <XOctagon size={16} />
              Exit Immediately
            </button>

            <Link
              to="/gateway"
              className="flex-1 flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
            >
              Proceed to Gateway
              <ArrowRight size={16} />
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;