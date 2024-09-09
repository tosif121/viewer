import React, { useRef, useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Editor configuration
const editorConfig = {
  addNewLine: false,
  readonly: false,
  toolbar: true,
  spellcheck: false,
  language: 'en',
  toolbarButtonSize: 'medium',
  toolbarAdaptive: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  width: 'auto',
  height: '80vh',
  buttons: ['bold', 'italic', 'underline'],
};

// PDF generation utility
const generatePDF = content => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(content, 'text/html');

  const processNode = (node, x, y) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [{ text: node.textContent, x, y }];
    }

    let elements = [];
    let currentX = x;
    let maxY = y;

    for (let child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        let font = 'normal';
        if (node.nodeName === 'B' || node.nodeName === 'STRONG') font = 'bold';
        if (node.nodeName === 'I' || node.nodeName === 'EM') font = 'italic';

        doc.setFont('Helvetica', font);
        doc.setFontSize(12);

        const textWidth = doc.getTextWidth(child.textContent);
        if (currentX + textWidth > 550) {
          // A4 width is about 595pt, leaving margins
          currentX = x;
          maxY += 20; // Move to next line
        }

        elements.push({
          text: child.textContent,
          x: currentX,
          y: maxY,
          font,
          underline: node.nodeName === 'U',
        });
        currentX += textWidth + 2; // Add a small space between words
      } else {
        const childElements = processNode(child, currentX, maxY);
        elements = elements.concat(childElements);
        if (childElements.length > 0) {
          const lastElement = childElements[childElements.length - 1];
          currentX = lastElement.x + doc.getTextWidth(lastElement.text) + 2;
          maxY = Math.max(maxY, lastElement.y);
        }
      }
    }

    return elements;
  };

  const elements = processNode(htmlDoc.body, 20, 20);

  elements.forEach(element => {
    doc.setFont('Helvetica', element.font);
    doc.setFontSize(12);
    doc.text(element.text, element.x, element.y);

    if (element.underline) {
      const textWidth = doc.getTextWidth(element.text);
      doc.line(element.x, element.y + 2, element.x + textWidth, element.y + 2);
    }
  });

  doc.save('editor-content.pdf');
};

// Modal component
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

// Main CustomEditor component
const CustomEditor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const editor = useRef(null);
  const [content, setContent] = useState('');

  const handleSave = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleGeneratePDF = () => generatePDF(content);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="editor-container text-xl text-black">
        <JoditEditor
          ref={editor}
          value={content}
          config={editorConfig}
          onBlur={newContent => setContent(newContent)}
        />
      </div>
      <button
        onClick={handleSave}
        className={`mt-4 rounded px-4 py-2 text-white ${(content == '' && 'bg-gray-400/50') || 'bg-blue-500 hover:bg-blue-600'}`}
        disabled={content === ''}
      >
        Save
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        content={content}
        onGeneratePDF={handleGeneratePDF}
      />
    </div>
  );
};

export default CustomEditor;
