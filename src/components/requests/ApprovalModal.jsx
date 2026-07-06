import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Loader2, AlertOctagon, Layers, Star, Calendar, FileQuestion, Hash } from 'lucide-react';

const notesPriorityLabels = {
  1: 'Official Faculty Notes',
  2: "Topper's Handwritten Notes",
  3: 'Exam Prep / Short Revision',
  4: 'AI-Generated Notes',
};

const pyqCategoryPriorityMap = {
  Semester: 1,
  model: 2,
  supplementary: 3,
  reexam: 4,
  internal: 5,
};

const referencePriorityMap = {
  book_pdf: 1,
  youtube_video: 2,
  website: 3,
  youtube_playlist: 4,
  blog: 5,
};

const startYear = 2024;
const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear + 1; y >= startYear; y--) years.push(y);

const ApprovalModal = ({ request, isOpen, onClose, onSuccess }) => {
  const [papers, setPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [paperId, setPaperId] = useState(request.paper_id || '');
  const [isActive, setIsActive] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(request.file_url || '');

  // Notes-specific
  const [moduleNumber, setModuleNumber] = useState(1);
  const [notesPriority, setNotesPriority] = useState(1);

  // PYQ-specific
  const [examYear, setExamYear] = useState(currentYear);
  const [examCategory, setExamCategory] = useState('Semester');
  const [internalNumber, setInternalNumber] = useState(1);

  // Reference-specific
  const [referenceType, setReferenceType] = useState('website');
  const [refTitle, setRefTitle] = useState(request.title || '');
  const [refUrl, setRefUrl] = useState(request.file_url || '');
  const [refAuthor, setRefAuthor] = useState('');
  const [refDescription, setRefDescription] = useState(request.description || '');

  useEffect(() => {
    const fetchPapers = async () => {
      setLoadingPapers(true);
      const { data } = await supabase.from('papers').select('id, name, code, semester').order('name');
      if (data) setPapers(data);
      setLoadingPapers(false);
    };
    fetchPapers();
  }, []);

  if (!isOpen) return null;

  const resourceType = request.resource_type;
  const derivedPyqPriority = pyqCategoryPriorityMap[examCategory] || 1;
  const derivedRefPriority = referencePriorityMap[referenceType] || 3;

  const markRequestApproved = async () => {
    const { error: reqError } = await supabase
      .from('resource_requests')
      .update({ status: 'approved' })
      .eq('id', request.id);
    if (reqError) throw reqError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (resourceType !== 'other' && !paperId) {
      setError('Please select the target paper this resource belongs to.');
      return;
    }

    try {
      setSubmitting(true);

      if (resourceType === 'notes') {
        if (!pdfUrl) throw new Error('A PDF URL is required.');
        const { error: dbError } = await supabase
          .from('paper_notes')
          .upsert({
            paper_id: paperId,
            module_number: moduleNumber,
            priority: notesPriority,
            pdf_url: pdfUrl,
            is_active: isActive,
          }, { onConflict: 'paper_id, module_number, priority' });
        if (dbError) throw dbError;

      } else if (resourceType === 'pyq') {
        if (!pdfUrl) throw new Error('A PDF URL is required.');
        const { error: dbError } = await supabase
          .from('paper_pyqs')
          .upsert({
            paper_id: paperId,
            exam_year: examYear,
            exam_category: examCategory,
            internal_number: examCategory === 'internal' ? internalNumber : null,
            priority: derivedPyqPriority,
            pdf_url: pdfUrl,
            is_active: isActive,
          }, { onConflict: 'paper_id, exam_year, exam_category, internal_number' });
        if (dbError) throw dbError;

      } else if (resourceType === 'syllabus') {
        if (!pdfUrl) throw new Error('A PDF URL is required.');
        const { error: dbError } = await supabase
          .from('paper_syllabus')
          .upsert({
            paper_id: paperId,
            pdf_url: pdfUrl,
            is_active: isActive,
          }, { onConflict: 'paper_id' });
        if (dbError) throw dbError;

      } else if (resourceType === 'reference') {
        if (!refTitle.trim()) throw new Error('Title is required.');
        const { error: dbError } = await supabase
          .from('paper_references')
          .insert({
            paper_id: paperId,
            priority: derivedRefPriority,
            reference_type: referenceType,
            title: refTitle,
            url: refUrl,
            author: refAuthor,
            description: refDescription,
            is_active: isActive,
          });
        if (dbError) throw dbError;
      }
      // resourceType === 'other' -> no target table, just mark approved below

      await markRequestApproved();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Confirm & Approve</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 items-start">
              <AlertOctagon size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-rose-700 text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {resourceType !== 'other' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Paper *</label>
              {loadingPapers ? (
                <div className="p-3 text-xs text-slate-400 font-bold flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading papers...</div>
              ) : (
                <select
                  required
                  value={paperId}
                  onChange={(e) => setPaperId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                >
                  <option value="">-- Select paper --</option>
                  {papers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code || 'no code'}) - Sem {p.semester}</option>
                  ))}
                </select>
              )}
              {request.paper_name_custom && !request.paper_id && (
                <p className="text-[10px] text-amber-600 font-bold ml-1">Student typed a custom paper name: "{request.paper_name_custom}" — please match it manually above.</p>
              )}
            </div>
          )}

          {/* --- NOTES FIELDS --- */}
          {resourceType === 'notes' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Layers size={12} /> Module</label>
                  <select value={moduleNumber} onChange={(e) => setModuleNumber(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none">
                    {[1, 2, 3, 4].map(m => <option key={m} value={m}>Module {m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Star size={12} /> Priority</label>
                  <select value={notesPriority} onChange={(e) => setNotesPriority(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none">
                    {[1, 2, 3, 4].map(p => <option key={p} value={p}>{p}: {notesPriorityLabels[p]}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* --- PYQ FIELDS --- */}
          {resourceType === 'pyq' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={12} /> Year</label>
                  <select value={examYear} onChange={(e) => setExamYear(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><FileQuestion size={12} /> Category</label>
                  <select value={examCategory} onChange={(e) => setExamCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none">
                    <option value="Semester">semester</option>
                    <option value="model">Model</option>
                    <option value="supplementary">Supplementary</option>
                    <option value="reexam">Re-exam</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>
              </div>
              {examCategory === 'internal' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Hash size={12} /> Internal Number</label>
                  <input type="number" min="1" value={internalNumber} onChange={(e) => setInternalNumber(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" />
                </div>
              )}
              <p className="text-[10px] text-slate-400 font-bold ml-1">Priority will be set automatically to {derivedPyqPriority} based on category.</p>
            </>
          )}

          {/* --- REFERENCE FIELDS --- */}
          {resourceType === 'reference' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Type</label>
                <select value={referenceType} onChange={(e) => setReferenceType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none">
                  <option value="book_pdf">Book / External PDF</option>
                  <option value="youtube_video">YouTube Video</option>
                  <option value="website">Website</option>
                  <option value="youtube_playlist">YouTube Playlist</option>
                  <option value="blog">Blog</option>
                </select>
                <p className="text-[10px] text-slate-400 font-bold ml-1">Priority auto-set to {derivedRefPriority}.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title *</label>
                <input required value={refTitle} onChange={(e) => setRefTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL</label>
                <input value={refUrl} onChange={(e) => setRefUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author / Channel</label>
                <input value={refAuthor} onChange={(e) => setRefAuthor(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea rows="2" value={refDescription} onChange={(e) => setRefDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none resize-none" />
              </div>
            </>
          )}

          {/* --- PDF URL (notes / pyq / syllabus) --- */}
          {(resourceType === 'notes' || resourceType === 'pyq' || resourceType === 'syllabus') && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PDF URL *</label>
              <input
                required
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://... (from the student's upload, or wherever you sourced it)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs outline-none"
              />
              {request.type === 'request' && (
                <p className="text-[10px] text-amber-600 font-bold ml-1">This was a request (no file attached) — paste the URL of the PDF you sourced/uploaded to storage.</p>
              )}
            </div>
          )}

          {/* --- OTHER TYPE --- */}
          {resourceType === 'other' && (
            <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-xs font-bold text-slate-500 leading-relaxed">
              This submission is typed "Other" and has no matching live table. Approving here will only mark the request as approved — handle the actual resource manually.
            </div>
          )}

          {resourceType !== 'other' && (
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="is_active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 cursor-pointer" />
              <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">Make visible to students immediately</label>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Confirm & Promote to Live</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;