import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, ArrowRight, AlertOctagon } from 'lucide-react';

const SyllabusAudit = ({ papers, onUpdateCount }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState([]);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const runAudit = async () => {
      setLoading(true);
      setDbError(null);
      
      try {
        const { data, error } = await supabase.from('paper_syllabus').select('paper_id');
        
        if (error) throw error;
        
        const existingIds = new Set(data?.map(s => String(s.paper_id)) || []);
        const missingList = papers.filter(p => !existingIds.has(String(p.id)));
        
        setMissing(missingList);
        if (onUpdateCount) onUpdateCount(missingList.length);
        
      } catch (err) {
        console.error("Syllabus Audit Error:", err);
        setDbError(err.message);
        if (onUpdateCount) onUpdateCount('Err');
      } finally {
        setLoading(false); 
      }
    };

    if (papers && papers.length > 0) {
      runAudit();
    } else {
      setLoading(false);
    }
  }, [papers]);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-400 flex flex-col items-center">
        <Loader2 className="animate-spin mb-2" size={24} />
        <p className="text-xs font-bold uppercase tracking-widest">Checking Syllabus Records...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col items-center text-center">
        <AlertOctagon className="text-rose-500 mb-3" size={32} />
        <h3 className="text-rose-700 font-bold mb-1">Database Error</h3>
        <p className="text-rose-600 text-xs font-mono bg-white px-3 py-2 rounded-lg border border-rose-100">{dbError}</p>
        <p className="text-slate-500 text-xs mt-4">Check your syllabus table name in SyllabusAudit.jsx.</p>
      </div>
    );
  }

  if (missing.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-12 text-center text-emerald-600 font-bold shadow-sm">
        All papers have a Syllabus record!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {missing.map((paper) => (
        <div key={paper.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-amber-300 transition-all group">
          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{paper.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Sem {paper.semester} • {paper.code || 'NO CODE'}</p>
          </div>
          <button 
            onClick={() => navigate(`/paper/${paper.id}`)} 
            className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
          >
            Fix <ArrowRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SyllabusAudit;
