import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Search, Plus, LogOut, LayoutDashboard, 
  BookOpen, Building2, Globe, Edit3, Trash2, Eye, Loader2, FileText, Filter, Activity
} from 'lucide-react'; 

// Component Imports
import AddPaperModal from '../components/AddPaperModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EditPaperModal from '../components/EditPaperModal'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [deptCount, setDeptCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- PERMANENT FILTER STATES ---
  // Read from localStorage on first load, default to empty/All if nothing is saved
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('fyimp_search') || '');
  const [selectedSemester, setSelectedSemester] = useState(() => localStorage.getItem('fyimp_semester') || 'All');

  // Save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fyimp_search', searchTerm);
    localStorage.setItem('fyimp_semester', selectedSemester);
  }, [searchTerm, selectedSemester]);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [deletingPaper, setDeletingPaper] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pData } = await supabase.from('papers').select('*').order('name', { ascending: true });
      const { count: dCount } = await supabase.from('departments').select('*', { count: 'exact', head: true });

      if (pData) setPapers(pData);
      if (dCount !== null) setDeptCount(dCount);
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueSemesters = [...new Set(papers.map(p => p.semester).filter(Boolean))].sort((a, b) => a - b);

  const filteredPapers = papers.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'All' || p.semester.toString() === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-100">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-lg font-black tracking-tight">FYIMP</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
            Admin Console
          </span>

          {/* --- NEW AUDIT BUTTON --- */}
          <button 
            onClick={() => navigate('/audit')} 
            className="flex items-center gap-2 text-slate-500 p-2 hover:bg-slate-100 hover:text-amber-600 rounded-xl transition-all"
            title="System Audit (Missing Resources)"
          >
            <Activity size={20} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Audit</span>
          </button>

          <button 
            onClick={() => navigate('/sop')} 
            className="flex items-center gap-2 text-slate-500 p-2 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all"
            title="View Architecture SOP"
          >
            <FileText size={20} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">SOP</span>
          </button>

          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* DYNAMIC INSIGHTS (Kept exactly as is) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Total Papers</p>
              <h3 className="text-xl font-black">{papers.length}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Departments</p>
              <h3 className="text-xl font-black">{deptCount}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Globe size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Server</p>
              <h3 className="text-xl font-black text-emerald-600">Online</h3>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & ADD ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              value={searchTerm} // <-- Bound to state
              placeholder="Filter papers by name or code..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <select 
                value={selectedSemester} // <-- Bound to state
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none w-full sm:w-40 pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <option value="All">All Semesters</option>
                {uniqueSemesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-slate-400" />
            </div>

            <button 
              onClick={() => setIsAddOpen(true)} 
              className="bg-slate-900 text-white w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* THE PAPER LIST */}
        <div className="space-y-3">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-xs font-black uppercase tracking-widest">Syncing Records</p>
             </div>
          ) : (
            filteredPapers.map((paper) => (
              <div key={paper.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col pl-2">
                  <h3 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                    {paper.name}
                  </h3>
                  <div className="flex gap-2 text-[10px] font-black text-slate-400 uppercase mt-1 tracking-wider">
                    <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{paper.code || 'NO CODE'}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Sem {paper.semester}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{paper.type}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pr-1">
                  <button 
                    onClick={() => navigate(`/paper/${paper.id}`)} 
                    title="View Resources"
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => setEditingPaper(paper)} 
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => setDeletingPaper(paper)} 
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}

          {!loading && filteredPapers.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
              <p className="font-bold text-slate-400">No papers found matching your filters.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedSemester('All'); }}
                className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL OVERLAYS */}
      <AddPaperModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onRefresh={fetchData} />
      {editingPaper && <EditPaperModal paper={editingPaper} isOpen={!!editingPaper} onClose={() => setEditingPaper(null)} onRefresh={fetchData} />}
      <DeleteConfirmModal 
        isOpen={!!deletingPaper} 
        paperName={deletingPaper?.name} 
        onConfirm={async () => {
            const { error } = await supabase.from('papers').delete().eq('id', deletingPaper.id);
            if (!error) fetchData();
            setDeletingPaper(null);
        }} 
        onClose={() => setDeletingPaper(null)} 
      />
    </div>
  );
};

export default Dashboard;
