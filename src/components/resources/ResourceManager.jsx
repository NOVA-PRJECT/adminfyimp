import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Loader2, Save, Trash2, Edit2, Plus, ExternalLink, Youtube, ListVideo, Globe, BookOpen, FileText, Link as LinkIcon, Star 
} from 'lucide-react';

const ResourceManager = ({ paper }) => {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- AUTOMATIC PRIORITY MAPPING ---
  const referencePriorityMap = {
    book_pdf: 1,
    youtube_video: 2,
    website: 3,
    youtube_playlist: 4,
    blog: 5,
  };

  // Form States
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  
  const [formData, setFormData] = useState({
    title: '',
    reference_type: 'website', 
    url: '',
    author: '',
    description: '',
    is_active: true
  });

  // Derived Priority based on selected type
  const derivedPriority = referencePriorityMap[formData.reference_type] || 3;

  // --- FETCH EXISTING REFERENCES ---
  const fetchReferences = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('paper_references')
      .select('*')
      .eq('paper_id', paper.id)
      .order('priority', { ascending: true }) // 1 (Highest) comes first
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReferences(data);
    }
    setLoading(false);
  }, [paper.id]);

  useEffect(() => { fetchReferences(); }, [fetchReferences]);

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '', reference_type: 'website', url: '', author: '', description: '', is_active: true
    });
  };

  const handleEditClick = (ref) => {
    setEditingId(ref.id);
    setFormData({
      title: ref.title,
      reference_type: ref.reference_type,
      url: ref.url || '',
      author: ref.author || '',
      description: ref.description || '',
      is_active: ref.is_active
    });
  };

  // --- DATABASE LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Title is required!");

    try {
      setSubmitting(true);
      
      const payload = {
        paper_id: paper.id,
        priority: derivedPriority, // Automatically inject the mapped priority
        ...formData
      };

      if (editingId) {
        payload.id = editingId;
      }

      const { error } = await supabase
        .from('paper_references')
        .upsert(payload);

      if (error) throw error;

      await fetchReferences(); 
      resetForm();
      alert(`✅ SUCCESS: Reference ${editingId ? 'updated' : 'added'}!`);
    } catch (err) {
      alert("❌ ERROR: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reference?")) return;
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('paper_references')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchReferences(); 
      if (editingId === id) resetForm(); 
    } catch (err) {
      alert("❌ DELETE ERROR: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // --- HELPER: GET ICON BY ENUM TYPE ---
  const getTypeIcon = (type) => {
    switch(type) {
      case 'youtube_video': return <Youtube size={16} className="text-red-500" />;
      case 'youtube_playlist': return <ListVideo size={16} className="text-red-600" />;
      case 'website': return <Globe size={16} className="text-blue-500" />;
      case 'blog': return <BookOpen size={16} className="text-orange-500" />;
      case 'book_pdf': return <FileText size={16} className="text-indigo-500" />;
      default: return <LinkIcon size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* --- LEFT COLUMN: THE FORM (Takes up 5/12 columns) --- */}
      <div className="md:col-span-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          {editingId ? <Edit2 size={18} className="text-blue-600" /> : <Plus size={18} className="text-indigo-600" />}
          <h2 className="text-lg font-black uppercase tracking-tight">
            {editingId ? 'Edit Reference' : 'Add New Reference'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 sticky top-24">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title *</label>
            <input 
              required name="title" value={formData.title} onChange={handleInputChange} 
              placeholder="e.g., Advanced Engineering Mathematics"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
              <select name="reference_type" value={formData.reference_type} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm outline-none cursor-pointer focus:border-indigo-400">
                {/* Changed the order to match Priority 1 -> 5 visually */}
                <option value="book_pdf">Book / External PDF</option>
                <option value="youtube_video">YouTube Video</option>
                <option value="website">Website</option>
                <option value="youtube_playlist">YouTube Playlist</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            
            {/* Automatic Priority Badge */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-black text-slate-500 text-sm cursor-not-allowed flex items-center gap-2" title="Priority is determined automatically">
                <Star size={16} className="text-amber-500" />
                Auto: {derivedPriority}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">External URL</label>
            <input type="url" name="url" value={formData.url} onChange={handleInputChange} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 text-xs outline-none focus:border-indigo-400" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author / Channel (Optional)</label>
            <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="e.g., Erwin Kreyszig" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm outline-none focus:border-indigo-400" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" placeholder="Brief note about this resource..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 text-sm outline-none focus:border-indigo-400 resize-none"></textarea>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
            <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">Visible to Students</label>
          </div>

          <div className="pt-4 flex gap-3">
            {editingId && (
              <button type="button" onClick={resetForm} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                Cancel
              </button>
            )}
            <button type="submit" disabled={submitting} className={`flex-[2] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> {editingId ? 'Update Ref' : 'Save New Ref'}</>}
            </button>
          </div>
        </form>
      </div>

      {/* --- RIGHT COLUMN: THE LIST (Takes up 7/12 columns) --- */}
      <div className="md:col-span-7 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-slate-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Current References</h2>
          </div>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {references.length} Saved
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : references.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 border-dashed rounded-3xl text-center text-slate-400 font-bold text-sm shadow-sm flex flex-col items-center gap-3">
            <BookOpen size={32} className="text-slate-300 opacity-50" />
            No references added yet. Use the form to add your first one!
          </div>
        ) : (
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
            {references.map((ref) => (
              <div key={ref.id} className={`bg-white border p-4 rounded-2xl shadow-sm transition-all hover:shadow-md flex flex-col gap-3 ${editingId === ref.id ? 'border-blue-400 ring-4 ring-blue-50' : !ref.is_active ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(ref.reference_type)}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {ref.reference_type.replace('_', ' ')}
                      </span>
                      {!ref.is_active && <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">Hidden</span>}
                      <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ml-auto">
                        Prio {ref.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{ref.title}</h3>
                    {ref.author && <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">by {ref.author}</p>}
                  </div>
                </div>

                {ref.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">{ref.description}</p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                  {ref.url ? (
                    <a href={ref.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors">
                      Visit Link <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No URL Provided</span>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(ref)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(ref.id)} disabled={deletingId === ref.id} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                      {deletingId === ref.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManager;
