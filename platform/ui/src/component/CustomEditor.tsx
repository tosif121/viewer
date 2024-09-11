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
          tableData={tableData}
        />
      )}
    </div>
  );
};

export default CustomEditor;
