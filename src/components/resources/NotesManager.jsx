import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Upload, Database, Loader2, Save, Cloud, CheckCircle, ExternalLink, Trash2, FileCheck2, Layers, Star
} from 'lucide-react';

const NotesManager = ({ paper }) => {
  // --- SLOT SELECTION STATES ---
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedPriority, setSelectedPriority] = useState(1);

  const [loading, setLoading] = useState(true);
  
  // Storage States
  const [uploading, setUploading] = useState(false);
  const [deletingStorage, setDeletingStorage] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [storageFileExists, setStorageFileExists] = useState(false);
  
  

  // Database States
  const [savingDb, setSavingDb] = useState(false);
  const [deletingDb, setDeletingDb] = useState(false);
  const [dbData, setDbData] = useState({ is_active: true });
  const [currentRecord, setCurrentRecord] = useState(null);

  // --- PATHS AND URLS (Deterministic naming for Notes) ---
  const bucketName = 'notes';
  // I'm assuming you just put them in the root of the 'notes' bucket. 
  // If you use a folder inside it, change this to 'your_folder_name'
  const folderName = `${paper.id}`;
  
  // Example: 1_m1_p1.pdf
  const fileName = `${paper.id}_m${selectedModule}_p${selectedPriority}.pdf`;
  const filePath = `${folderName}/${fileName}`;
  
  const { data: { publicUrl: expectedUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  // --- FETCH DATA FOR THE SELECTED SLOT ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setPendingFile(null); // Clear pending file when switching tabs

    // 1. Check Database Table
    const { data: dbRecord, error: dbError } = await supabase
      .from('paper_notes')
      .select('*')
      .eq('paper_id', paper.id)
      .eq('module_number', selectedModule)
      .eq('priority', selectedPriority)
      .single();

    if (!dbError && dbRecord) {
      setCurrentRecord(dbRecord);
      setDbData({ is_active: dbRecord.is_active });
    } else {
      setCurrentRecord(null);
      setDbData({ is_active: true });
    }

    // 2. Check Storage Bucket physically
    const { data: storageFiles } = await supabase.storage
      .from(bucketName)
      .list(folderName, { limit: 1, search: fileName });

    if (storageFiles && storageFiles.length > 0 && storageFiles[0].name === fileName) {
      setStorageFileExists(true);
    } else {
      setStorageFileExists(false);
    }

    setLoading(false);
  }, [paper.id, selectedModule, selectedPriority, fileName, folderName]);

  // Re-run fetch whenever the selected Module or Priority changes
  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 1. STORAGE LOGIC (With Google Drive Fix!) ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdfType = file.type === "application/pdf";
    const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    const isMobileDriveGhost = !file.type || file.type === "";

    if (isPdfType || isPdfExtension || isMobileDriveGhost) {
      setPendingFile(file);
    } else {
      alert(`Please select a valid PDF file. (Got Name: ${file.name}, Type: ${file.type || "Unknown"})`);
      e.target.value = null; 
    }
  };

  const handleStorageUpload = async () => {
    if (!pendingFile) return;
    if (storageFileExists) {
        if (!window.confirm(`This will overwrite Module ${selectedModule} (Priority ${selectedPriority}) in the bucket. Continue?`)) return;
    }

    try {
      setUploading(true);
      
      let fileData;
      try {
        fileData = await pendingFile.arrayBuffer();
      } catch (readError) {
        throw new Error("Cannot read cloud file directly. Please download the file to your device storage first and try again.");
      }

      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileData, { upsert: true, contentType: 'application/pdf' });

      if (storageError) throw storageError;

      setPendingFile(null);
      await fetchData(); 
      alert(`✅ STORAGE SUCCESS: Module ${selectedModule} saved to bucket.`);
    } catch (err) {
      alert("❌ STORAGE ERROR: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleStorageDelete = async () => {
    if (!window.confirm("Permanently delete this Note PDF from the storage bucket?")) return;
    try {
      setDeletingStorage(true);
      const { data, error } = await supabase.storage.from(bucketName).remove([filePath]);
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Delete blocked. Check Storage bucket DELETE policy.");
      
      await fetchData(); 
      alert("✅ STORAGE SUCCESS: File deleted from bucket.");
    } catch (err) {
      alert("❌ STORAGE ERROR: " + err.message);
    } finally {
      setDeletingStorage(false);
    }
  };

  // --- 2. DATABASE LOGIC ---
  const handleDatabaseSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingDb(true);
      
      // Upserting using the unique composite key layout
      const { error: dbError } = await supabase
        .from('paper_notes')
        .upsert({
          paper_id: paper.id,
          module_number: selectedModule,
          priority: selectedPriority,
          pdf_url: expectedUrl, 
          is_active: dbData.is_active
        }, { onConflict: 'paper_id, module_number, priority' });

      if (dbError) throw dbError;

      await fetchData(); 
      alert("✅ DATABASE SUCCESS: Note record saved to paper_notes table.");
    } catch (err) {
      alert("❌ DATABASE ERROR: " + err.message);
    } finally {
      setSavingDb(false);
    }
  };

  const handleDatabaseDelete = async () => {
    if (!window.confirm("Delete this Note record from the database?")) return;
    try {
      setDeletingDb(true);
      const { data, error } = await supabase
        .from('paper_notes')
        .delete()
        .eq('paper_id', paper.id)
        .eq('module_number', selectedModule)
        .eq('priority', selectedPriority)
        .select(); 

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Delete blocked. Check DB table DELETE policy.");
      
      await fetchData(); 
      alert("✅ DATABASE SUCCESS: Note record removed from table.");
    } catch (err) {
      alert("❌ DATABASE ERROR: " + err.message);
    } finally {
      setDeletingDb(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* --- SLOT SELECTOR UI --- */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Module Selector */}
          <div className="flex-1 sm:flex-none flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
            <Layers size={18} className="text-indigo-600" />
            <select 
              value={selectedModule} 
              onChange={(e) => setSelectedModule(Number(e.target.value))}
              className="bg-transparent font-black text-indigo-900 text-sm outline-none cursor-pointer"
            >
              {[1, 2, 3, 4].map(m => (
                <option key={m} value={m}>Module {m}</option>
              ))}
            </select>
          </div>

          {/* Priority Selector */}
          <div className="flex-1 sm:flex-none flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
            <Star size={18} className="text-amber-600" />
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(Number(e.target.value))}
              className="bg-transparent font-black text-amber-900 text-sm outline-none cursor-pointer"
            >
              {[1, 2, 3, 4].map(p => (
                <option key={p} value={p}>Priority {p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Status Badge */}
        <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm">
          {currentRecord ? (
            <span className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 rounded-lg">DB: Saved</span>
          ) : (
             <span className="text-slate-400 border-slate-200 bg-slate-50 px-3 py-1 rounded-lg">DB: Empty</span>
          )}
          {storageFileExists ? (
            <span className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 rounded-lg">File: Exists</span>
          ) : (
            <span className="text-slate-400 border-slate-200 bg-slate-50 px-3 py-1 rounded-lg">File: Missing</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* --- LEFT COLUMN: STORAGE UPLOAD --- */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud size={18} className="text-indigo-600" />
              <h2 className="text-lg font-black uppercase tracking-tight">1. Storage Upload</h2>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
              
              {storageFileExists ? (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col items-center gap-2">
                  <FileCheck2 size={24} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">File exists in bucket</p>
                  <p className="text-[10px] text-emerald-600 font-mono bg-white px-2 py-1 rounded-md border border-emerald-100">{fileName}</p>
                </div>
              ) : (
                 <div className="mb-6 p-4 bg-slate-100 border border-slate-200 border-dashed rounded-2xl text-xs font-bold text-slate-400">
                  No existing PDF found for M{selectedModule} (P{selectedPriority}).
                </div>
              )}

              <input 
                type="file" accept=".pdf" onChange={handleFileSelect} 
                className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer transition-all" 
              />
              
              <button 
                onClick={handleStorageUpload} disabled={!pendingFile || uploading}
                className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={16} /> {storageFileExists ? 'Replace in Bucket' : 'Upload to Bucket'}</>}
              </button>

              {storageFileExists && (
                <button 
                  onClick={handleStorageDelete} disabled={deletingStorage}
                  className="w-full mt-3 bg-white border border-red-200 text-red-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 shadow-sm hover:bg-red-50 active:scale-95 transition-all"
                >
                  {deletingStorage ? <Loader2 className="animate-spin" /> : <><Trash2 size={16} /> Delete from Bucket</>}
                </button>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: DATABASE FORM --- */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-blue-600" />
              <h2 className="text-lg font-black uppercase tracking-tight">2. Database Record</h2>
            </div>

            <form onSubmit={handleDatabaseSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</label>
                  <input disabled value={`Module ${selectedModule}`} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 text-sm cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <input disabled value={`Priority ${selectedPriority}`} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 text-sm cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected URL (Fixed)</label>
                <input disabled value={expectedUrl} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-500 truncate cursor-not-allowed" title={expectedUrl} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Status</label>
                <select value={dbData.is_active} onChange={(e) => setDbData({...dbData, is_active: e.target.value === 'true'})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold outline-none cursor-pointer">
                  <option value="true">True (Active & Visible)</option>
                  <option value="false">False (Hidden)</option>
                </select>
              </div>

              <button type="submit" disabled={savingDb} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
                {savingDb ? <Loader2 className="animate-spin" /> : <><Save size={16} /> {currentRecord ? 'Update Record' : 'Save Record'}</>}
              </button>

              {currentRecord && (
                <button type="button" onClick={handleDatabaseDelete} disabled={deletingDb} className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 shadow-sm hover:bg-red-50 active:scale-95 transition-all">
                  {deletingDb ? <Loader2 className="animate-spin" /> : <><Trash2 size={16} /> Delete DB Record</>}
                </button>
              )}
            </form>

            {currentRecord && (
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 text-xs font-bold shadow-sm">
                <CheckCircle size={16} />
                <span>DB record active (ID: #{currentRecord.id})</span>
                <a href={`${currentRecord.pdf_url}?t=${new Date().getTime()}`} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 hover:underline text-indigo-600">
                   <ExternalLink size={12}/> View PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManager;
