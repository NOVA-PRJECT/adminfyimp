import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';

const NotesAudit = ({ papers, onUpdateCount }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState([]);

  useEffect(() => {
    const runAudit = async () => {
      setLoading(true);
      const { data } = await supabase.from('paper_notes').select('paper_id, module_number');
      
      const missingDetails = [];
      papers.forEach(paper => {
        const pNotes = data?.filter(n => String(n.paper_id) === String(paper.id)) || [];
        const missingSlots = [];
        
        if (!pNotes.some(n => Number(n.module_number) === 1)) missingSlots.push('Mod 1');
        if (!pNotes.some(n => Number(n.module_number) === 2)) missingSlots.push('Mod 2');
        if (!pNotes.some(n => Number(n.module_number) === 3)) missingSlots.push('Mod 3');
        if (!pNotes.some(n => Number(n.module_number) === 4)) missingSlots.push('Mod 4');

        if (missingSlots.length > 0) missingDetails.push({ ...paper, missingSlots });
      });
      
      setMissing(missingDetails);
      if (onUpdateCount) onUpdateCount(missingDetails.length);
      setLoading(false);
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
        <p className="text-xs font-bold uppercase tracking-widest">Scanning Note Modules...</p>
      </div>
    );
  }

  if (missing.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-12 text-center text-emerald-600 font-bold shadow-sm">
        All papers meet the minimum Notes requirement (M1-M4)!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missing.map((paper) => (
        <div key={paper.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 flex justify-between items-center transition-all group">
          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{paper.name}</h3>
            <div className="flex flex-wrap gap-1 mt-2">
               <span className="text-[10px] font-black text-slate-400 uppercase mr-1 self-center tracking-widest">Missing:</span>
               {paper.missingSlots.map(slot => (
                 <span key={slot} className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100">
                   {slot}
                 </span>
               ))}
            </div>
          </div>
          <button 
            onClick={() => navigate(`/paper/${paper.id}`)} 
            className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
          >
            Fix <ArrowRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotesAudit;
