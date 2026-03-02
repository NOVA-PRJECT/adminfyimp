import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, paperName, onConfirm, onClose }) => {
  const [step, setStep] = useState(1); // 1 = First check, 2 = Final check

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) setStep(2);
    else {
      onConfirm();
      setStep(1); // Reset for next time
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center border border-red-100 animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-xl font-black text-slate-900 mb-2">
          {step === 1 ? 'Delete Paper?' : 'Are you REALLY sure?'}
        </h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">
          {step === 1 
            ? `This will remove "${paperName}" from the database.` 
            : `Warning: This action is permanent and cannot be undone.`}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleNext}
            className={`w-full py-4 rounded-2xl font-black transition-all ${
              step === 1 
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100' 
              : 'bg-red-900 text-white hover:bg-black animate-pulse'
            }`}
          >
            {step === 1 ? 'Yes, Delete' : 'I AM SURE, DELETE IT'}
          </button>
          <button 
            onClick={() => { setStep(1); onClose(); }}
            className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
