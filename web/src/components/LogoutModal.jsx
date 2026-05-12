import React from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-modal-fade"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden transform transition-all animate-slide-up sm:animate-modal-zoom">
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="absolute top-4 right-4 hidden sm:block">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pb-10 sm:pb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <LogOut className="text-red-600" size={32} />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Logout Confirmation
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-8 max-w-[280px] sm:max-w-none">
              Are you sure you want to sign out? Any unsaved changes may be lost.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 sm:py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl sm:rounded-xl hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-4 sm:py-3 bg-red-600 text-white font-semibold rounded-2xl sm:rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 active:translate-y-0 order-1 sm:order-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
