import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Loader2, Inbox, Clock, CheckCircle2, XCircle, User, Phone,
  ExternalLink, Filter, Upload, MessageSquare, GraduationCap, ThumbsUp, ThumbsDown
} from 'lucide-react';

import ApprovalModal from '../components/requests/ApprovalModal';
import RejectModal from '../components/requests/RejectModal';

const RESOURCE_TYPE_LABELS = {
  notes: 'Notes',
  pyq: 'PYQ',
  syllabus: 'Syllabus',
  reference: 'Reference',
  other: 'Other',
};

const ResourceRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  const [statusTab, setStatusTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('All');

  const [approvingRequest, setApprovingRequest] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resource_requests')
      .select('*, papers(name, code, semester)')
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const counts = useMemo(() => ({
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchesStatus = r.status === statusTab;
      const matchesType = typeFilter === 'All' || r.resource_type === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [requests, statusTab, typeFilter]);

  const handleApproveSuccess = () => {
    setApprovingRequest(null);
    fetchRequests();
  };

  const handleRejectSuccess = () => {
    setRejectingRequest(null);
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">Resource Requests</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* STATS HEADER */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black mb-1">Student Submissions</h2>
            <p className="text-slate-400 text-xs font-medium">Requests for missing resources & student-uploaded PDFs.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-amber-400">
              {loading ? <Loader2 className="animate-spin inline" size={24} /> : counts.pending}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pending Review</div>
          </div>
        </div>

        {/* TYPE FILTER */}
        <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
            <Filter size={18} />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-transparent outline-none font-bold text-sm text-slate-700 cursor-pointer pr-4"
          >
            <option value="All">All Resource Types</option>
            {Object.entries(RESOURCE_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* STATUS TABS */}
        <div className="flex w-full gap-2 p-1 bg-slate-200/50 rounded-2xl">
          <TabButton active={statusTab === 'pending'} onClick={() => setStatusTab('pending')} icon={<Clock size={16} />} label={`Pending (${counts.pending})`} />
          <TabButton active={statusTab === 'approved'} onClick={() => setStatusTab('approved')} icon={<CheckCircle2 size={16} />} label={`Approved (${counts.approved})`} />
          <TabButton active={statusTab === 'rejected'} onClick={() => setStatusTab('rejected')} icon={<XCircle size={16} />} label={`Rejected (${counts.rejected})`} />
        </div>

        {/* LIST */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Submissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center flex flex-col items-center gap-3">
            <Inbox size={32} className="text-slate-300" />
            <p className="font-bold text-slate-400">No {statusTab} submissions{typeFilter !== 'All' ? ` of type "${RESOURCE_TYPE_LABELS[typeFilter]}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                onApprove={() => setApprovingRequest(req)}
                onReject={() => setRejectingRequest(req)}
              />
            ))}
          </div>
        )}
      </main>

      {approvingRequest && (
        <ApprovalModal
          request={approvingRequest}
          isOpen={!!approvingRequest}
          onClose={() => setApprovingRequest(null)}
          onSuccess={handleApproveSuccess}
        />
      )}

      {rejectingRequest && (
        <RejectModal
          request={rejectingRequest}
          isOpen={!!rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onSuccess={handleRejectSuccess}
        />
      )}
    </div>
  );
};

// --- CARD ---
const RequestCard = ({ req, onApprove, onReject }) => {
  const isUpload = req.type === 'upload';
  const paperLabel = req.papers?.name || req.paper_name_custom || 'Unspecified Paper';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${isUpload ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
            {isUpload ? <Upload size={12} /> : <MessageSquare size={12} />}
            {isUpload ? 'Upload' : 'Request'}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
            {RESOURCE_TYPE_LABELS[req.resource_type] || req.resource_type}
          </span>
          {req.status !== 'pending' && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              {req.status}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
          {new Date(req.created_at).toLocaleDateString()}
        </span>
      </div>

      <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{req.title}</h3>

      <div className="flex flex-wrap gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <GraduationCap size={12} /> {paperLabel} {req.semester ? `• Sem ${req.semester}` : ''}
        </span>
      </div>

      {req.description && (
        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 leading-relaxed">
          {req.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs mb-4">
        {req.user_name && (
          <span className="flex items-center gap-1 text-slate-500 font-bold">
            <User size={14} /> {req.user_name}
          </span>
        )}
        {req.contact_info && (
          <span className="flex items-center gap-1 text-slate-500 font-bold">
            <Phone size={14} /> {req.contact_info}
          </span>
        )}
        {req.file_url && (
          <a href={req.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 font-black hover:underline">
            <ExternalLink size={14} /> View Submitted File
          </a>
        )}
      </div>

      {req.status === 'pending' && (
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
          >
            <ThumbsUp size={14} /> Approve
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
          >
            <ThumbsDown size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  );
};

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
    <span className={active ? 'whitespace-nowrap' : 'truncate'}>{label}</span>
  </button>
);

export default ResourceRequests;
