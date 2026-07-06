import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, Loader2 } from 'lucide-react';

const EditPaperModal = ({ paper, isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...paper });
  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('papers')
      .update({
        name: formData.name,
        code: formData.code,
        semester: Number(formData.semester),
        type: formData.type,
        department_id: Number(formData.department_id)
      })
      .eq('id', paper.id);

    if (error) alert(error.message);
    else {
      onRefresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase tracking-tight">Edit Paper Data</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
              <input required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono uppercase"
                value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
              <input required type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                {['DSC', 'DSE', 'MDC', 'VAC', 'SEC'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept ID</label>
              <input required type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPaperModal;
