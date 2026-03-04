import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, Loader2 } from 'lucide-react';

const AddPaperModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'DSC',
    department_id: '', // Will be stored as Number
    semester: 1,      // Will be stored as Number
    is_active: true
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Explicitly convert values to Numbers for the database
    const payload = {
      ...formData,
      department_id: Number(formData.department_id),
      semester: Number(formData.semester)
    };

    const { error } = await supabase.from('papers').insert([payload]);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      onRefresh();
      onClose();
      setFormData({ name: '', code: '', type: 'DSC', department_id: '', semester: 1, is_active: true });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Register Paper</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-left font-sans">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input required placeholder="e.g. Quantum Physics" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
              <input required placeholder="PH101" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
              <input required type="number" placeholder="1" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type (Enum)</label>
              <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="DSC">DSC</option>
                <option value="DSE">DSE</option>
                <option value="MDC">MDC</option>
                <option value="VAC">VAC</option>
                <option value="SEC">SEC</option>
                <option value="AEC">AEC</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept ID (Num)</label>
              <input required type="number" placeholder="10" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98]">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-2"><Save size={20} /> Register Record</div>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPaperModal;
