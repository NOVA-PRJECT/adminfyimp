import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, ArrowLeft, AlertOctagon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the URL has a Supabase invite token
    const hash = window.location.hash;
    if (hash && hash.includes('type=invite')) {
      // Pass the token to the setup page so Supabase can read it!
      navigate('/setup-password' + hash); 
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); 
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Success! Route them to the Dashboard
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-100">
      
      {/* Subtle Blueprint Background to bridge the tech feel with the clean UI */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative">
          
          {/* Top Security Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" />

          <div className="p-8 md:p-10">
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck size={32} className="text-indigo-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-widest uppercase mb-2">
                Identity Verification
              </h1>
              <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">
                Resource Management Subsystem
              </p>
            </div>

            {/* Inline Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertOctagon size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-rose-700 text-xs font-bold leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Administrator Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sysadmin@institution.edu"
                    className="w-full bg-slate-50 text-slate-900 pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all text-sm font-bold placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Secure Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 text-slate-900 pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all text-sm font-bold placeholder:text-slate-300 placeholder:font-medium tracking-widest"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={16} /> Verifying...</>
                ) : (
                  'Authenticate'
                )}
              </button>
              {/* Inside your Login.jsx form, under the password input: */}
<div className="flex justify-end mt-2">
  <Link 
    to="/resetpassword" 
    className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
  >
    Forgot Password?
  </Link>
</div>


            </form>
          </div>
          
          {/* Footer Escape Route */}
          <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
            <Link 
              to="https://fyimp-hub-main.vercel.app/" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={12} /> Abort Authentication
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
