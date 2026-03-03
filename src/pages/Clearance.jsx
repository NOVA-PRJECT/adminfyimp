import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, FileWarning } from 'lucide-react';

const Clearance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans flex items-center justify-center p-4 sm:p-6 selection:bg-red-500/30">
      
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#262626 1px, transparent 1px), linear-gradient(90deg, #262626 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <div className="w-full max-w-2xl relative z-10 animate-in slide-in-from-right-8 fade-in duration-500">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Lock size={40} className="text-amber-500" />
          </div>
        </div>
        
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
            Authentication Gateway
          </h2>
          <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
            System Event Logging is Active
          </p>
        </div>

        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          
          <p className="text-slate-300 text-sm leading-relaxed font-medium text-center">
            You are about to be redirected to the secure identity verification portal.
          </p>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex gap-4">
            <FileWarning size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-red-500 font-bold text-xs tracking-widest uppercase">Notice of Auditing</h3>
              <p className="text-red-400/80 text-xs leading-relaxed font-medium">
                All authentication requests are securely logged. Using compromised, shared, or unauthorized credentials will result in an immediate system lockout and an administrative review. If you do not possess valid administrative access, leave this page now.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#222] flex flex-col gap-4">
            
            {/* PRIMARY ACTION: Safe Exit - Uses React Router to step back natively */}
            <button 
              onClick={() => navigate(-1)}
              className="w-full flex justify-center items-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 bg-slate-200 text-slate-900 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
            >
              <ArrowLeft size={16} /> Cancel and Return to Safety
            </button>

            {/* SECONDARY ACTION: Proceed to Login */}
            <Link 
              to="/login"
              className="w-full flex justify-center items-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 border border-[#333] text-slate-500 hover:text-white hover:border-slate-500"
            >
              I am an authorized administrator <ArrowRight size={14} />
            </Link>
            
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Clearance;
