import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { uploadDocument } from '../../services/api';

const PdfUploader = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setStatus('error');
      setErrorMessage('Please upload a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    try {
      const result = await uploadDocument(selectedFile, (progressPercent) => {
        setProgress(progressPercent);
      });
      setStatus('success');
      if (onUploadSuccess && result?.data?.saved_filename) {
        onUploadSuccess(result.data.saved_filename);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred during upload.');
    }
  };

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div 
        className={`relative flex flex-col items-center justify-center p-16 rounded-3xl transition-all duration-500 ${
          dragActive ? 'bg-white shadow-2xl scale-[1.02]' : 
          status === 'success' ? 'bg-green-50/50' :
          status === 'error' ? 'bg-red-50/50' :
          'bg-white shadow-xl hover:shadow-2xl'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={status === 'uploading'}
        />

        {status === 'idle' && (
          <div className="text-center cursor-pointer">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-neutral-100 text-neutral-800 rounded-3xl">
                <UploadCloud size={48} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Upload PDF Document</h3>
            <p className="text-lg text-neutral-500">Drag & drop your file here, or click to browse</p>
          </div>
        )}

        {status === 'uploading' && (
          <div className="w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-sky-100 text-sky-600 rounded-full animate-pulse">
                <Loader2 size={32} className="animate-spin" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText size={18} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file?.name}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-sky-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">{progress}% Uploaded</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-teal-100 text-teal-600 rounded-full">
                <CheckCircle size={32} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-teal-800 mb-1">Upload Complete!</h3>
            <p className="text-sm text-teal-600 mb-4 truncate max-w-[250px]">{file?.name}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); resetUploader(); }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Upload Another
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 text-red-600 rounded-full">
                <AlertCircle size={32} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-1">Upload Failed</h3>
            <p className="text-sm text-red-600 mb-4 max-w-[250px]">{errorMessage}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); resetUploader(); }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfUploader;
