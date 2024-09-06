import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Editor toolbar component for formatting options
const EditorToolbar: React.FC<{
  handleBold: () => void;
  handleItalic: () => void;
  handleUnderline: () => void;
}> = ({ handleBold, handleItalic, handleUnderline }) => (
  <div className="mb-4 flex space-x-2">
    <button
      onClick={handleBold}
      className="rounded border border-gray-600 bg-gray-800 px-4 py-2 text-white hover:bg-red-600"
    >
      B
    </button>
    <button
      onClick={handleItalic}
      className="rounded border border-gray-600 bg-gray-800 px-4 py-2 text-white hover:bg-red-600"
    >
      I
    </button>
    <button
      onClick={handleUnderline}
      className="rounded border border-gray-600 bg-gray-800 px-4 py-2 text-white hover:bg-red-600"
    >
      U
    </button>
  </div>
);

const CustomEditor: React.FC = () => {
  const [content, setContent] = useState<string>(''); // Editor content state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editable div

  // Handle content change inside the editor
  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML); // Update content state
    }
  };

  // Execute a formatting command (bold, italic, underline)
  const execCommand = (command: string) => {
    document.execCommand(command, false, '');
  };

  // Handlers for formatting commands
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');

  // Save the editor content and open modal
  const handleSave = () => {
    setIsModalOpen(true); // Open the modal when saving
  };

  // Close modal handler
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      unit: 'px',
      format: 'a4',
    });

    // Set font size for better readability
    doc.setFontSize(12);

    // Get plain text by stripping HTML tags
    const plainText = content.replace(/<[^>]+>/g, '');

    // Split the text into lines that fit the width of the page
    const pageWidth = doc.internal.pageSize.getWidth() - 40; // 20px margins on both sides
    const textLines = doc.splitTextToSize(plainText, pageWidth);

    // Render the text line by line with proper word wrapping
    let y = 20; // Start 20px from the top
    textLines.forEach(line => {
      doc.text(line, 20, y); // Position each line
      y += 14; // Move to the next line, adjusting the spacing between lines
    });

    // Save the generated PDF
    doc.save('editor-content.pdf');
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal(); // Call close modal on outside click
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener on component unmount or when modal closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-gray-100">
      {/* Render the toolbar */}
      <EditorToolbar
        handleBold={handleBold}
        handleItalic={handleItalic}
        handleUnderline={handleUnderline}
      />

      {/* Content editable area */}
      <div
        className="min-h-[200px] border border-gray-700 bg-gray-800 p-2 text-gray-100"
        contentEditable
        ref={editorRef}
        onInput={handleContentChange} // Directly updating the state on input
        suppressContentEditableWarning={true} // Suppress contentEditable warning in React
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Save
      </button>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div
            className="relative w-[210mm] rounded-lg bg-gray-700 p-6 shadow-lg"
            ref={modalRef}
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-white">Preview Your Content</h2>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-red-500"
              >
                ✖
              </button>
            </div>

            {/* Modal content (A4 size) */}
            <div className="mt-4 overflow-auto border bg-white p-4 text-gray-800">
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                className="min-h-96"
              ></div>
            </div>
            <div className="mt-4 flex gap-x-4">
              <button
                onClick={generatePDF}
                className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Generate PDF
              </button>

              <button
                onClick={closeModal}
                className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;
