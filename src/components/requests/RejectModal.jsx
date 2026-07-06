import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { parseStoragePath } from '../../lib/storagePaths';

const RejectModal = ({ request, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleReject = async () => {
    setError('');
    try {
      setLoading(true);

      // Best-effort cleanup of the uploaded file from the resource-uploads bucket
      if (request.type === 'upload' && request.file_url) {
        const path = parseStoragePath(request.file_url, 'resource-uploads');
        if (path) {
          await supabase.storage.from('resource-uploads').remove([path]);
        }
      }

      const { error: updateError } = await supabase
        .from('resource_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center border border-red-100 animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>

        <h2 className="text-xl font-black text-slate-900 mb-2">Reject Submission?</h2>
        <p className="text-sm text-slate-500 mb-2 font-medium">
          "{request.title}" will be marked as rejected.
        </p>
        {request.type === 'upload' && request.file_url && (
          <p className="text-xs text-slate-400 mb-6 font-medium">
            The attached file will also be removed from storage to free up space.
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleReject}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Reject It'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;