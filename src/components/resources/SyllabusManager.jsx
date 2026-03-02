import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Upload, Database, Loader2, Save, Cloud, CheckCircle, ExternalLink
} from 'lucide-react';

const SyllabusManager = ({ paper }) => {
  const [loading, setLoading] = useState(true);
  
  // Storage States
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // Database States
  const [savingDb, setSavingDb] = useState(false);
  const [dbData, setDbData] = useState({
    is_active: true
  });
  const [currentRecord, setCurrentRecord] = useState(null);

  // --- PRE-CALCULATE DETERMINISTIC URL ---
  const filePath = `syllabus/${paper.id}.pdf`;
  const { data: { publicUrl: expectedUrl } } = supabase.storage
    .from('syllabus')
    .getPublicUrl(filePath);

  // Fetch Database Record
  const fetchSyllabus = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('paper_syllabus')
      .select('*')
      .eq('paper_id', paper.id)
      .single();

    if (!error && data) {
      setCurrentRecord(data);
      setDbData({ is_active: data.is_active });
    } else {
      setCurrentRecord(null);
    }
    setLoading(false);
  }, [paper.id]);

  useEffect(() => { fetchSyllabus(); }, [fetchSyllabus]);

  // --- 1. STORAGE LOGIC ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPendingFile(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleStorageUpload = async () => {
    if (!pendingFile) return;
    try {
      setUploading(true);

      const { error: storageError } = await supabase.storage
        .from('syllabus')
        .upload(filePath, pendingFile, { upsert: true, contentType: 'application/pdf' });

      if (storageError) throw storageError;

      setPendingFile(null);
      alert("✅ STORAGE SUCCESS: File securely uploaded to bucket.");
    } catch (err) {
      alert("❌ STORAGE ERROR: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 2. DATABASE LOGIC ---
  const handleDatabaseSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingDb(true);
      const { error: dbError } = await supabase
        .from('paper_syllabus')
        .upsert({
          paper_id: paper.id,
          pdf_url: expectedUrl, // Using the automatically calculated URL
          is_active: dbData.is_active
        }, { onConflict: 'paper_id' });

      if (dbError) throw dbError;

      fetchSyllabus();
      alert("✅ DATABASE SUCCESS: Record saved to paper_syllabus table.");
    } catch (err) {
      alert("❌ DATABASE ERROR: " + err.message);
    } finally {
      setSavingDb(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: STORAGE UPLOAD */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Cloud size={18} className="text-indigo-600" />
          <h2 className="text-lg font-black uppercase tracking-tight">1. Storage Upload</h2>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileSelect} 
            className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer transition-all" 
          />
          
          <button 
            onClick={handleStorageUpload}
            disabled={!pendingFile || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={16} /> Upload to Bucket</>}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: DATABASE FORM */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database size={18} className="text-blue-600" />
          <h2 className="text-lg font-black uppercase tracking-tight">2. Database Record</h2>
        </div>

        <form onSubmit={handleDatabaseSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paper ID (Fixed)</label>
            <input disabled value={`#${paper.id}`} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Public URL (Fixed)</label>
            <input 
              disabled 
              value={expectedUrl} 
              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-500 truncate cursor-not-allowed" 
              title={expectedUrl}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Status</label>
            <select 
              value={dbData.is_active} 
              onChange={(e) => setDbData({...dbData, is_active: e.target.value === 'true'})}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="true">True (Active & Visible)</option>
              <option value="false">False (Hidden from students)</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={savingDb}
            className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            {savingDb ? <Loader2 className="animate-spin" /> : <><Save size={16} /> Save Database Record</>}
          </button>
        </form>

        {/* Existing Record Indicator */}
        {currentRecord && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 text-xs font-bold shadow-sm">
            <CheckCircle size={16} />
            <span>Database record active (ID: #{currentRecord.id})</span>
            <a href={currentRecord.pdf_url} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 hover:underline text-indigo-600">
               <ExternalLink size={12}/> View PDF
            </a>
          </div>
        )}
      </div>

    </div>
  );
};

export default SyllabusManager;
