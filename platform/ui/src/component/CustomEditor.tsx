// import React, { useRef, useState, useEffect } from 'react';
// import JoditEditor from 'jodit-react';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { useNavigate } from 'react-router-dom';
// import { postDatatoServer } from '../utils/services';
// import moment from 'moment';

// // Editor configuration
// const editorConfig = {
//   addNewLine: false,
//   readonly: false,
//   toolbar: true,
//   spellcheck: false,
//   language: 'en',
//   toolbarButtonSize: 'medium',
//   toolbarAdaptive: false,
//   showCharsCounter: false,
//   showWordsCounter: false,
//   showXPathInStatusbar: false,
//   askBeforePasteHTML: false,
//   askBeforePasteFromWord: false,
//   width: 'auto',
//   height: '70vh',
//   buttons: ['bold', 'italic', 'underline'],
// };

// // PDF generation utility
// const generatePDF = content => {
//   const doc = new jsPDF({ unit: 'pt', format: 'a4' });
//   const parser = new DOMParser();
//   const htmlDoc = parser.parseFromString(content, 'text/html');

//   const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the A4 page
//   const margin = 20; // Set margin for the page
//   const maxWidth = pageWidth - margin * 2; // Maximum width of the text area
//   let y = 20; // Initial y position

//   const processNode = (node, x) => {
//     if (node.nodeType === Node.TEXT_NODE) {
//       return [{ text: node.textContent, x }];
//     }

//     let elements = [];
//     let currentX = x;

//     for (let child of node.childNodes) {
//       if (child.nodeType === Node.TEXT_NODE) {
//         let font = 'normal';
//         if (node.nodeName === 'B' || node.nodeName === 'STRONG') font = 'bold';
//         if (node.nodeName === 'I' || node.nodeName === 'EM') font = 'italic';

//         doc.setFont('Helvetica', font);
//         doc.setFontSize(12);

//         const words = child.textContent.split(' ');
//         for (let word of words) {
//           const wordWidth = doc.getTextWidth(word + ' ');

//           // If the word exceeds the available width, move to the next line
//           if (currentX + wordWidth > maxWidth) {
//             currentX = margin;
//             y += 20; // Move down to the next line
//           }

//           elements.push({
//             text: word + ' ',
//             x: currentX,
//             y,
//             font,
//             underline: node.nodeName === 'U',
//           });

//           currentX += wordWidth; // Move the cursor forward for the next word
//         }
//       } else {
//         const childElements = processNode(child, currentX);
//         elements = elements.concat(childElements);
//         if (childElements.length > 0) {
//           const lastElement = childElements[childElements.length - 1];
//           currentX = lastElement.x + doc.getTextWidth(lastElement.text);
//         }
//       }
//     }

//     return elements;
//   };

//   const elements = processNode(htmlDoc.body, margin);

//   elements.forEach(element => {
//     doc.setFont('Helvetica', element.font);
//     doc.setFontSize(12);
//     doc.text(element.text, element.x, element.y);

//     if (element.underline) {
//       const textWidth = doc.getTextWidth(element.text);
//       doc.line(element.x, element.y + 2, element.x + textWidth, element.y + 2);
//     }
//   });
//   const reportName = tableData?.name.replace(/ /g, '_');
//   const pdfFileName = `${reportName}.pdf`;

//   doc.save(pdfFileName);
// };

// // Modal component
// const Modal = ({ isOpen, onClose, content, onGeneratePDF }) => {
//   const modalRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = event => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-800 bg-opacity-50">
//       <div
//         className="relative w-[210mm] rounded-lg bg-gray-700 p-6 shadow-lg"
//         ref={modalRef}
//       >
//         <div className="flex justify-between">
//           <h2 className="text-xl font-bold text-white">Preview Your Content</h2>
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-red-500"
//           >
//             ✖
//           </button>
//         </div>
//         <div className="mt-4 overflow-auto border bg-white p-4 text-gray-800">
//           <div
//             dangerouslySetInnerHTML={{ __html: content }}
//             className="min-h-96"
//           ></div>
//         </div>
//         <div className="mt-4 flex gap-x-4">
//           <button
//             onClick={onGeneratePDF}
//             className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
//           >
//             Generate PDF
//           </button>
//           <button
//             onClick={onClose}
//             className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main CustomEditor component
// const CustomEditor = () => {
//   const editor = useRef(null);
//   const [content, setContent] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [reports, setReports] = useState([]);
//   const [tableData, setTableData] = useState([]);
//   const navigate = useNavigate();
//   const formattedDate = moment(tableData?.Date, 'D/M/YYYY, h:mm:ss a').format('DD-MMMM-YYYY');

//   const url = window.location.href;
//   const urlParams = new URLSearchParams(url.split('?')[1]);

//   const studyInstanceUIDs = urlParams.get('StudyInstanceUIDs');
//   //lineAddedByShiv
//   const User = urlParams.get('UserName');

//   const handleSave = () => setIsModalOpen(true);
//   const handleCloseModal = () => setIsModalOpen(false);
//   const handleGeneratePDF = () => generatePDF(content);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login');
//       return;
//     }

//     function handleResponse(responseData) {
//       if (responseData.status === 'success') {
//         setTableData(responseData.response[0]);
//       } else {
//         console.error('Error:', responseData.error);
//       }
//     }

//     const endpoint = 'StudyID';
//     const requestBody = {
//       StudyInstanceUID: studyInstanceUIDs,
//       username: User,
//     };

//     const props = {
//       header: true,
//     };

//     postDatatoServer({
//       end_point: endpoint,
//       body: requestBody,
//       call_back: handleResponse,
//       props,
//     });
//   }, [navigate]);

//   return (
//     <div className="min-h-screen text-gray-100">
//       <table className="mb-2 min-w-full border text-center text-sm font-light text-white">
//         <thead className="whitespace- border-b font-medium">
//           <tr>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Patient ID
//             </th>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Patient Name
//             </th>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Date
//             </th>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Study
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border-b font-medium">
//             <td className="border-r">{tableData?.patientID}</td>
//             <td className="border-r">{tableData?.name}</td>
//             <td className="border-r">{formattedDate}</td>
//             <td className="border-r">{tableData?.study}</td>
//           </tr>
//         </tbody>
//         <thead className="border-b font-medium">
//           <tr>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Gender
//             </th>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Modality
//             </th>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Age
//             </th>
//             <th
//               scope="col"
//               className="border-r"
//             >
//               Ref Doctor
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border-b font-medium">
//             <td className="border-r">{tableData?.PatientSex}</td>
//             <td className="border-r">{tableData?.modality}</td>
//             <td className="border-r">{tableData?.PatientAge}</td>
//             <td className="border-r">{tableData?.ReferringPhysicianName}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div className="editor-container text-xl text-black">
//         <JoditEditor
//           ref={editor}
//           value={content}
//           config={editorConfig}
//           onBlur={newContent => setContent(newContent)}
//         />
//       </div>
//       <button
//         onClick={handleSave}
//         className={`my-1.5 rounded px-4 py-2.5 text-lg text-white ${(content == '' && 'bg-gray-400/50') || 'bg-blue-500 hover:bg-blue-600'}`}
//         disabled={content === ''}
//       >
//         Save
//       </button>
//       <Modal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         content={content}
//         onGeneratePDF={handleGeneratePDF}
//       />
//     </div>
//   );
// };

// export default CustomEditor;

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { editorConfig } from '../utils/editorConfig';
import { generatePDF } from '../utils/generatePDF';
import { StudyInfoTable } from './StudyInfoTable';
import { postDatatoServer } from '../utils/services';
import Modal from './Modal';
import JoditEditor from 'jodit-react';

const CustomEditor = () => {
  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const url = window.location.href;
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const studyInstanceUIDs = urlParams.get('StudyInstanceUIDs');
    const User = urlParams.get('UserName');

    const handleResponse = responseData => {
      if (responseData.status === 'success') {
        setTableData(responseData.response[0]);
      }
    };

    const endpoint = 'StudyID';
    const requestBody = {
      StudyInstanceUID: studyInstanceUIDs,
      username: User,
    };

    const props = {
      header: true,
    };

    postDatatoServer({
      end_point: endpoint,
      body: requestBody,
      call_back: handleResponse,
      props,
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleGeneratePDF = () => generatePDF(content, tableData);

  return (
    <div className="min-h-screen text-gray-100">
      {tableData ? <StudyInfoTable tableData={tableData} /> : <div>Loading...</div>}

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
        className="my-1.5 rounded bg-blue-500 px-4 py-2.5 text-lg text-white hover:bg-blue-600"
      >
        Save
      </button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={content}
          onGeneratePDF={handleGeneratePDF}
        />
      )}
    </div>
  );
};

export default CustomEditor;
