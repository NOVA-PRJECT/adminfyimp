import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, FileX, BookX, FileText, Filter } from 'lucide-react'; // <-- Added Filter icon

// Import our clean, modular child components
import SyllabusAudit from '../components/audit/SyllabusAudit';
import NotesAudit from '../components/audit/NotesAudit';
import PyqAudit from '../components/audit/PyqAudit';

const SystemAudit = () => {
  const navigate = useNavigate();
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [papers, setPapers] = useState([]);
  const [counts, setCounts] = useState({ syllabus: '-', notes: '-', pyqs: '-' });

  // --- NEW: Semester Filter State (Persistent) ---
  const [selectedSemester, setSelectedSemester] = useState(() => localStorage.getItem('fyimp_audit_sem') || 'All');

  useEffect(() => {
    localStorage.setItem('fyimp_audit_sem', selectedSemester);
  }, [selectedSemester]);

  // Fetch Master Papers ONLY ONE TIME on mount
  useEffect(() => {
    const fetchMasterPapers = async () => {
      setLoadingPapers(true);
      const { data } = await supabase.from('papers').select('*').order('name');
      if (data) setPapers(data);
      setLoadingPapers(false);
    };
    fetchMasterPapers();
  }, []);

  // --- FILTER LOGIC ---
  // 1. Extract unique semesters for the dropdown
  const uniqueSemesters = useMemo(() => {
    return [...new Set(papers.map(p => p.semester).filter(Boolean))].sort((a, b) => a - b);
  }, [papers]);

  // 2. Filter the papers based on the dropdown. 
  // We use useMemo here to prevent React from re-creating the array on random renders, which protects us from infinite loops!
  const filteredPapers = useMemo(() => {
    if (selectedSemester === 'All') return papers;
    return papers.filter(p => p.semester.toString() === selectedSemester);
  }, [papers, selectedSemester]);


  // --- PERFORMANCE OPTIMIZATION ---
  const handleSyllabusCount = useCallback((c) => setCounts(prev => ({ ...prev, syllabus: c })), []);
  const handleNotesCount = useCallback((c) => setCounts(prev => ({ ...prev, notes: c })), []);
  const handlePyqsCount = useCallback((c) => setCounts(prev => ({ ...prev, pyqs: c })), []);

  // Notice we are passing `filteredPapers` to the children now, not `papers`!
  const memoizedSyllabus = useMemo(() => (
    <SyllabusAudit papers={filteredPapers} onUpdateCount={handleSyllabusCount} />
  ), [filteredPapers, handleSyllabusCount]);

  const memoizedNotes = useMemo(() => (
    <NotesAudit papers={filteredPapers} onUpdateCount={handleNotesCount} />
  ), [filteredPapers, handleNotesCount]);

  const memoizedPyqs = useMemo(() => (
    <PyqAudit papers={filteredPapers} onUpdateCount={handlePyqsCount} />
  ), [filteredPapers, handlePyqsCount]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">System Audit</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* STATS HEADER */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black mb-1">Missing Resources</h2>
            <p className="text-slate-400 text-xs font-medium">Identify papers failing minimum requirements.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-amber-400">
              {loadingPapers ? <Loader2 className="animate-spin inline" size={24}/> : filteredPapers.length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              {selectedSemester === 'All' ? 'Total Papers' : `Sem ${selectedSemester} Papers`}
            </div>
          </div>
        </div>

        {/* --- NEW: SEMESTER FILTER BAR --- */}
        <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
            <Filter size={18} />
          </div>
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full bg-transparent outline-none font-bold text-sm text-slate-700 cursor-pointer pr-4"
          >
            <option value="All">All Semesters</option>
            {uniqueSemesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        {/* DYNAMIC FLEX TABS */}
        <div className="flex w-full gap-2 p-1 bg-slate-200/50 rounded-2xl">
          <TabButton 
            active={activeTab === 'syllabus'} 
            onClick={() => setActiveTab('syllabus')} 
            icon={<FileText size={16} />} 
            label={`Syllabus (${counts.syllabus})`} 
          />
          <TabButton 
            active={activeTab === 'notes'} 
            onClick={() => setActiveTab('notes')} 
            icon={<FileX size={16} />} 
            label={`Notes (${counts.notes})`} 
          />
          <TabButton 
            active={activeTab === 'pyqs'} 
            onClick={() => setActiveTab('pyqs')} 
            icon={<BookX size={16} />} 
            label={`PYQs (${counts.pyqs})`} 
          />
        </div>

        {/* CONTENT AREA (Hidden Rendering) */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {loadingPapers ? (
             <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Registry...</p>
             </div>
          ) : (
            <>
              <div className={activeTab === 'syllabus' ? 'block' : 'hidden'}>
                {memoizedSyllabus}
              </div>
              
              <div className={activeTab === 'notes' ? 'block' : 'hidden'}>
                {memoizedNotes}
              </div>
              
              <div className={activeTab === 'pyqs' ? 'block' : 'hidden'}>
                {memoizedPyqs}
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
};

// UI Component for the fluid, resizing tabs
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ease-in-out overflow-hidden ${
      active 
        ? 'flex-none px-5 bg-white text-slate-900 shadow-sm' 
        : 'flex-1 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50' 
    }`}
  >
    <div className="flex-shrink-0 flex items-center">{icon}</div>
    <span className={active ? "whitespace-nowrap" : "truncate"}>
      {label}
    </span>
  </button>
);

export default SystemAudit;
