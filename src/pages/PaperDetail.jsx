import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Book, FileText, History, Loader2, Library } from 'lucide-react'; // Added Library icon

// Resource Components
import SyllabusManager from '../components/resources/SyllabusManager';
import NotesManager from '../components/resources/NotesManager';
import PYQManager from '../components/resources/PYQManager';
import ResourceManager from '../components/resources/ResourceManager'; // IMPORTED HERE

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [activeTab, setActiveTab] = useState('syllabus');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaper = async () => {
      const { data } = await supabase.from('papers').select('*').eq('id', id).single();
      if (data) setPaper(data);
      setLoading(false);
    };
    fetchPaper();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* 1. COMPACT METADATA STRIP */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm overflow-hidden">
        <div className="flex items-center px-4 h-14 gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="h-6 w-px bg-slate-200" />

          {/* Horizontal Scrolling Metadata */}
          <div className="flex flex-1 items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap pr-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Paper Name</span>
              <span className="text-sm font-bold text-slate-900">{paper.name}</span>
            </div>
            
            <MetaItem label="Paper ID" value={`#${paper.id}`} color="text-slate-800 font-mono" />
            <MetaItem label="Code" value={paper.code} color="text-indigo-600" />
            <MetaItem label="Semester" value={`SEM ${paper.semester}`} />
            <MetaItem label="Type" value={paper.type} />
            <MetaItem label="Dept ID" value={`#${paper.department_id}`} />
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC COMPONENT LOADING */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 min-h-[60vh]">
          {activeTab === 'syllabus' && <SyllabusManager paper={paper} />}
          {activeTab === 'notes' && <NotesManager paper={paper} />}
          {activeTab === 'pyqs' && <PYQManager paper={paper} />}
          {activeTab === 'resources' && <ResourceManager paper={paper} />} {/* NEW RENDERER */}
        </div>
      </main>

      {/* 3. BOTTOM TAB BAR */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2.5 rounded-full shadow-2xl flex items-center gap-1 z-50 border border-slate-800">
        <TabBtn active={activeTab === 'syllabus'} onClick={() => setActiveTab('syllabus')} icon={<Book size={18} />} label="Syllabus" />
        <TabBtn active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<FileText size={18} />} label="Notes" />
        <TabBtn active={activeTab === 'pyqs'} onClick={() => setActiveTab('pyqs')} icon={<History size={18} />} label="PYQs" />
        <TabBtn active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<Library size={18} />} label="References" /> {/* NEW TAB */}
      </nav>
    </div>
  );
};

// Internal Sub-components
const MetaItem = ({ label, value, color = "text-slate-600" }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-slate-400 uppercase leading-none">{label}</span>
    <span className={`text-sm font-bold ${color}`}>{value}</span>
  </div>
);

const TabBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
    {icon} {active && <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>}
  </button>
);

export default PaperDetail;
