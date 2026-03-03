import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Database, FolderTree, Settings, CheckSquare, 
  ArrowLeft, ShieldAlert, Zap, FileQuestion, HardDrive, Network 
} from 'lucide-react';

const SOP = () => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-800 selection:bg-indigo-100">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 px-6 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Network size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            System Architecture <span className="text-indigo-600">&</span> SOP
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Review the deterministic storage conventions, database schemas, and automated workflows before modifying the Resource Management portal.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">

        {/* --- 1. DATABASE SCHEMA --- */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader icon={<Database size={20} />} title="1. Relational Database Schema" />
          
          <div className="p-6 md:p-8 space-y-10">
            
            {/* Master Table */}
            <TableCard 
              title="papers (Master Table)" 
              constraint="Primary Key: id (UUID)"
            >
              <tr><td className="px-4 py-3 font-mono font-bold">name / code</td><td className="px-4 py-3 text-slate-500">text</td><td className="px-4 py-3">Standard metadata. Code is optional.</td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">semester / type</td><td className="px-4 py-3 text-slate-500">int / text</td><td className="px-4 py-3">Used for frontend filtering and routing.</td></tr>
            </TableCard>

            {/* Notes Table */}
            <TableCard 
              title="paper_notes" 
              constraint="Unique Key: (paper_id, module_number, priority)"
            >
              <tr><td className="px-4 py-3 font-mono font-bold">module_number</td><td className="px-4 py-3 text-indigo-600 font-mono">1-4</td><td className="px-4 py-3">Strictly bound. Represents physical modules.</td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">priority</td><td className="px-4 py-3 text-indigo-600 font-mono">1-4</td><td className="px-4 py-3">Determines display order within a module. Slot-based.</td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">file_url</td><td className="px-4 py-3 text-slate-500">text</td><td className="px-4 py-3">Points to deterministic Supabase Storage bucket path.</td></tr>
            </TableCard>

            {/* PYQs Table */}
            <TableCard 
              title="paper_pyqs" 
              constraint="Unique Key: (paper_id, exam_year, exam_category, internal_number)"
            >
              <tr><td className="px-4 py-3 font-mono font-bold">exam_category</td><td className="px-4 py-3 text-rose-600 font-mono">ENUM</td><td className="px-4 py-3 leading-relaxed">Values: <EnumBadge val="Semester" />, <EnumBadge val="model" />, <EnumBadge val="supplementary" />, <EnumBadge val="reexam" />, <EnumBadge val="internal" /></td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">priority</td><td className="px-4 py-3 text-slate-500">integer</td><td className="px-4 py-3 text-indigo-600 font-semibold">Automated: Semester=1, model=2, suppl=3, reexam=4, internal=5</td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">internal_number</td><td className="px-4 py-3 text-slate-500">integer</td><td className="px-4 py-3">Only populated if category is 'internal'. Otherwise NULL.</td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">is_active</td><td className="px-4 py-3 text-slate-500">boolean</td><td className="px-4 py-3">Toggle to hide file from students without deleting DB record.</td></tr>
            </TableCard>

            {/* References Table */}
            <TableCard 
              title="paper_references" 
              constraint="No unique composite key (Unlimited items)"
            >
              <tr><td className="px-4 py-3 font-mono font-bold">reference_type</td><td className="px-4 py-3 text-rose-600 font-mono">ENUM</td><td className="px-4 py-3 leading-relaxed">Values: <EnumBadge val="book_pdf" />, <EnumBadge val="youtube_video" />, <EnumBadge val="website" />, <EnumBadge val="youtube_playlist" />, <EnumBadge val="blog" /></td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">priority</td><td className="px-4 py-3 text-slate-500">integer</td><td className="px-4 py-3 text-indigo-600 font-semibold">Automated: book=1, yt_video=2, website=3, yt_playlist=4, blog=5</td></tr>
              <tr><td className="px-4 py-3 font-mono font-bold">url</td><td className="px-4 py-3 text-slate-500">text</td><td className="px-4 py-3">External link only (No bucket uploads for this table).</td></tr>
            </TableCard>

          </div>
        </section>

        {/* --- 2. STORAGE STRUCTURE --- */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader icon={<FolderTree size={20} />} title="2. Deterministic Cloud Storage" />
          <div className="p-6 md:p-8">
            <p className="text-sm text-slate-600 mb-6 font-medium">Files are never uploaded with arbitrary names. The system calculates precise paths to ensure safe overwrites and prevent orphaned files in the bucket.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PathCard 
                bucket="syllabus" 
                structure="[paper_id].pdf" 
                example="syllabus/5.pdf"
              />
              <PathCard 
                bucket="notes" 
                structure="[paper_id] / [paper_id]_m[module]_p[priority].pdf" 
                example="notes/5/5_m2_p1.pdf"
                note="Supabase automatically creates the paper_id folder."
              />
              <PathCard 
                bucket="pyqs" 
                structure="[paper_id] / [year] / [paper_id]_[year]_[category]_[internal#].pdf" 
                example="pyqs/5/2023/5_2023_internal_1.pdf"
                className="md:col-span-2"
              />
            </div>
          </div>
        </section>

        {/* --- 3. ADMIN RULES & AUTOMATIONS --- */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader icon={<Settings size={20} />} title="3. Engine Rules & Edge Cases" />
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <RuleBlock icon={<Zap className="text-amber-500" />} title="Cache-Busting (Real-time updates)">
              Because the system overwrites files with the exact same name (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-xs">5.pdf</code>), browsers will serve stale cached versions. The UI appends a <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-xs">?t=timestamp</code> to the URL on save to force fetching the newest version.
            </RuleBlock>

            <RuleBlock icon={<HardDrive className="text-blue-500" />} title="Drive Ghost File Handling">
              When uploading from Google Drive on Android, the OS sends a blank MIME type. The system explicitly accepts <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-xs">file.type === ""</code> and converts the file to a raw ArrayBuffer to bypass mobile upload restrictions.
            </RuleBlock>

            <RuleBlock icon={<FileQuestion className="text-indigo-500" />} title="Dynamic Year Generation">
              PYQ years are not hardcoded. The system automatically generates a dropdown list starting strictly at <code className="font-bold">2024</code> and ending at <code className="font-bold text-indigo-600">Current Year + 1</code>.
            </RuleBlock>

            <RuleBlock icon={<ShieldAlert className="text-rose-500" />} title="Cascade Deletes (Danger)">
              <div className="text-rose-700 bg-rose-50/80 p-3 rounded-xl border border-rose-100 mt-2">
                Deleting a Paper from the master table triggers <code className="font-bold">ON DELETE CASCADE</code>. All linked notes, PYQs, and references will be permanently destroyed from the database.
              </div>
            </RuleBlock>

          </div>
        </section>

        {/* --- 4. ACKNOWLEDGEMENT --- */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/20 mb-10">
          <div className="flex items-start gap-4 flex-1">
            <button 
              onClick={() => setAgreed(!agreed)}
              className={`mt-1 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all duration-200 ${
                agreed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-500 text-transparent hover:border-slate-400 bg-slate-800'
              }`}
            >
              <CheckSquare size={18} />
            </button>
            <div>
              <h3 className="text-lg font-black text-white mb-1 tracking-wide">Acknowledge Architecture</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                I understand the database schemas, auto-prioritization logic, and strict storage naming conventions required to maintain this system without corrupting data.
              </p>
            </div>
          </div>

          <Link 
            to="/dashboard"
            onClick={(e) => !agreed && e.preventDefault()}
            className={`flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
              agreed 
                ? 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-[1.02] shadow-lg shadow-emerald-500/30' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowLeft size={16} /> Return to Command Center
          </Link>
        </div>

      </div>
    </div>
  );
};

// --- Helper Components ---
const SectionHeader = ({ icon, title }) => (
  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
    <div className="text-indigo-600 bg-indigo-100/50 p-2 rounded-lg">{icon}</div>
    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
  </div>
);

const TableCard = ({ title, constraint, children }) => (
  <div>
    <h3 className="text-sm font-black text-slate-900 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="flex items-center gap-2">
        <Database size={14} className="text-slate-400" />
        {title}
      </span>
      <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">{constraint}</span>
    </h3>
    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-black">
          <tr>
            <th className="px-4 py-3">Column</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Notes & Automations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {children}
        </tbody>
      </table>
    </div>
  </div>
);

const EnumBadge = ({ val }) => (
  <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono mr-1 mb-1">
    '{val}'
  </span>
);

const PathCard = ({ bucket, structure, example, note, className = "" }) => (
  <div className={`border border-slate-200 rounded-2xl bg-slate-900 p-5 shadow-inner ${className}`}>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 
      Bucket: <span className="text-slate-200">{bucket}</span>
    </div>
    <div className="bg-black/50 border border-slate-700 rounded-xl p-3 mb-3">
      <code className="block text-xs font-mono text-emerald-400 break-all">
        {structure}
      </code>
    </div>
    <div className="text-[11px] text-slate-400 flex items-start gap-2">
      <span className="font-bold text-slate-300 uppercase mt-0.5">Eg:</span> 
      <span className="font-mono text-slate-300 break-all">{example}</span>
    </div>
    {note && <div className="text-[10px] text-indigo-300 mt-3 pt-3 border-t border-slate-800 font-medium">{note}</div>}
  </div>
);

const RuleBlock = ({ icon, title, children }) => (
  <div className="flex gap-4">
    <div className="mt-1 flex-shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-black text-slate-900 mb-2">{title}</h3>
      <div className="text-xs text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export default SOP;
