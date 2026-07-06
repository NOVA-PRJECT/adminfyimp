import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertOctagon, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will automatically read the URL hash (#access_token=...) and log them in
    // We just listen for that successful "PASSWORD_RECOVERY" event to clear any errors
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Recovery session established.');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Because the email link logged them in temporarily, we can now update their password
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000); // Send them to dashboard after success!
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
          New Credentials
        </h2>
        <p className="text-slate-400 text-xs font-medium mb-6">
          Your identity is verified. Enter a new secure password for your admin account.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl flex gap-3">
            <AlertOctagon size={18} className="text-rose-500" />
            <p className="text-rose-500 text-xs font-bold">{error}</p>
          </div>
        )}

        {success ? (
          <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex flex-col items-center gap-3">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-emerald-500 text-sm font-bold text-center">Password Overwritten! Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="New Password (min 6 chars)"
                className="w-full bg-[#0a0a0a] text-white pl-12 pr-4 py-3 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold tracking-widest"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Lock In Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
