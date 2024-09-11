import React, { useRef, useEffect } from 'react';

const Modal = ({ isOpen, onClose, content, onGeneratePDF }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div
        className="relative w-[210mm] rounded-lg bg-gray-700 p-6 shadow-lg"
        ref={modalRef}
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-white">Preview Your Content</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-red-500"
          >
            ✖
          </button>
        </div>
        <div className="mt-4 overflow-auto border bg-white p-4 text-gray-800">
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="min-h-96"
          ></div>
        </div>
        <div className="mt-4 flex gap-x-4">
          <button
            onClick={onGeneratePDF}
            className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Generate PDF
          </button>
          <button
            onClick={onClose}
            className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
