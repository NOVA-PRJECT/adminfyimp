import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom'; // <-- Added useNavigate
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertOctagon } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // <-- Initialize navigate

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Supabase fires the request. If the email is fake, it fails silently for security.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // 1. Show a neutral security message
      setMessage('If this email is registered, a recovery link has been dispatched.');
      
      // 2. Automatically kick them back to the login page after 3 seconds!
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
          System Recovery
        </h2>
        <p className="text-slate-400 text-xs font-medium mb-6">
          Enter your admin email. If it exists in the registry, a secure reset link will be dispatched.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl flex gap-3">
            <AlertOctagon size={18} className="text-rose-500" />
            <p className="text-rose-500 text-xs font-bold">{error}</p>
          </div>
        )}

        {message ? (
          <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex flex-col items-center gap-3">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-emerald-500 text-sm font-bold text-center leading-relaxed">{message}</p>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@institution.edu"
                className="w-full bg-[#0a0a0a] text-white pl-12 pr-4 py-3 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold placeholder:text-slate-600 tracking-wider"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Dispatch Link'}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 flex justify-center items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
          <ArrowLeft size={14} /> Abort Recovery
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
