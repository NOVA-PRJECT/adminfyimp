import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Upload, Database, Loader2, Save, Cloud, CheckCircle, ExternalLink, Trash2, FileCheck2
} from 'lucide-react';

const SyllabusManager = ({ paper }) => {
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

  // --- PATHS AND URLS ---
  const folderName = 'syllabus';
  const fileName = `${paper.id}.pdf`;
  const filePath = `${folderName}/${fileName}`;
  const { data: { publicUrl: expectedUrl } } = supabase.storage
    .from('syllabus')
    .getPublicUrl(filePath);

  // --- FETCH DATA ON LOAD ---
  const fetchData = useCallback(async () => {
    setLoading(true);

    // 1. Check Database Table
    const { data: dbRecord, error: dbError } = await supabase
      .from('paper_syllabus')
      .select('*')
      .eq('paper_id', paper.id)
      .single();

    if (!dbError && dbRecord) {
      setCurrentRecord(dbRecord);
      setDbData({ is_active: dbRecord.is_active });
    } else {
      setCurrentRecord(null);
    }

    // 2. Check Storage Bucket physically
    const { data: storageFiles } = await supabase.storage
      .from('syllabus')
      .list(folderName, {
        limit: 1,
        search: fileName
      });

    // If the file array has items and matches our name exactly, it exists!
    if (storageFiles && storageFiles.length > 0 && storageFiles[0].name === fileName) {
      setStorageFileExists(true);
    } else {
      setStorageFileExists(false);
    }

    setLoading(false);
  }, [paper.id, fileName]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 1. STORAGE LOGIC ---
    const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdfType = file.type === "application/pdf";
    const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    
    // Google Drive on mobile often hides BOTH the type and the extension.
    // If the type is completely empty, we let it pass the frontend check.
    const isMobileDriveGhost = !file.type || file.type === "";

    if (isPdfType || isPdfExtension || isMobileDriveGhost) {
      setPendingFile(file);
    } else {
      alert(`Please select a valid PDF file. (Got Name: ${file.name}, Type: ${file.type || "Unknown"})`);
      // Clear the input so they can try again
      e.target.value = null; 
    }
  };


  const handleStorageUpload = async () => {
    if (!pendingFile) return;
    
    // Explicit confirmation if they are replacing
    if (storageFileExists) {
        if (!window.confirm("This will permanently overwrite the existing PDF in the bucket. Continue?")) return;
    }

    try {
      setUploading(true);

      // --- NEW ANTI-GHOST FILE MAGIC ---
      // Force the browser to read the file into memory first.
      // This forces Google Drive files to resolve before Supabase touches them.
      let fileData;
      try {
        fileData = await pendingFile.arrayBuffer();
      } catch {
        throw new Error("Cannot read cloud file directly. Please download the file to your device storage first and try again.");
      }

      // Upload the raw fileData instead of the pendingFile object
      const { error: storageError } = await supabase.storage
        .from('syllabus')
        .upload(filePath, fileData, { 
          upsert: true, 
          contentType: 'application/pdf' 
        });

      if (storageError) throw storageError;

      setPendingFile(null);
      await fetchData(); 
      alert("✅ STORAGE SUCCESS: File securely saved to bucket.");
    } catch (err) {
      alert("❌ STORAGE ERROR: " + err.message);
    } finally {
      setUploading(false);
    }
  };


  const handleStorageDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this PDF from the storage bucket?")) return;
    try {
      setDeletingStorage(true);
      
      const { data, error } = await supabase.storage.from('syllabus').remove([filePath]);
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Delete blocked. Check your Storage bucket's DELETE policy.");
      
      await fetchData(); // Refresh UI instantly
      alert("✅ STORAGE SUCCESS: File permanently deleted from bucket.");
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
      const { error: dbError } = await supabase
        .from('paper_syllabus')
        .upsert({
          paper_id: paper.id,
          pdf_url: expectedUrl, 
          is_active: dbData.is_active
        }, { onConflict: 'paper_id' });

      if (dbError) throw dbError;

      await fetchData(); 
      alert("✅ DATABASE SUCCESS: Record saved to paper_syllabus table.");
    } catch (err) {
      alert("❌ DATABASE ERROR: " + err.message);
    } finally {
      setSavingDb(false);
    }
  };

  const handleDatabaseDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this record from the database table?")) return;
    try {
      setDeletingDb(true);
      
      const { data, error } = await supabase
        .from('paper_syllabus')
        .delete()
        .eq('paper_id', paper.id)
        .select(); // .select() forces it to return deleted rows to prove it worked

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Delete blocked. Check your Database table's DELETE policy.");
      
      setDbData({ is_active: true });
      await fetchData(); 
      alert("✅ DATABASE SUCCESS: Record removed from table.");
    } catch (err) {
      alert("❌ DATABASE ERROR: " + err.message);
    } finally {
      setDeletingDb(false);
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
          
          {/* EXISTENCE UI COMPONENT */}
          {storageFileExists ? (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col items-center gap-2">
              <FileCheck2 size={24} className="text-emerald-600" />
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">File exists in bucket</p>
              <p className="text-[10px] text-emerald-600 font-mono bg-white px-2 py-1 rounded-md border border-emerald-100">{fileName}</p>
            </div>
          ) : (
             <div className="mb-6 p-4 bg-slate-100 border border-slate-200 border-dashed rounded-2xl text-xs font-bold text-slate-400">
              No existing PDF found in storage.
            </div>
          )}

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
            {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={16} /> {storageFileExists ? 'Replace in Bucket' : 'Upload to Bucket'}</>}
          </button>

          {/* STORAGE DELETE BUTTON */}
          {storageFileExists && (
            <button 
              onClick={handleStorageDelete}
              disabled={deletingStorage}
              className="w-full mt-3 bg-white border border-red-200 text-red-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 shadow-sm hover:bg-red-50 transition-all active:scale-95"
            >
              {deletingStorage ? <Loader2 className="animate-spin" /> : <><Trash2 size={16} /> Delete from Bucket</>}
            </button>
          )}
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
            {savingDb ? <Loader2 className="animate-spin" /> : <><Save size={16} /> {currentRecord ? 'Update Record' : 'Save Record'}</>}
          </button>

          {/* DATABASE DELETE BUTTON */}
          {currentRecord && (
            <button 
              type="button"
              onClick={handleDatabaseDelete}
              disabled={deletingDb}
              className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 shadow-sm hover:bg-red-50 transition-all active:scale-95"
            >
              {deletingDb ? <Loader2 className="animate-spin" /> : <><Trash2 size={16} /> Delete DB Record</>}
            </button>
          )}
        </form>

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
