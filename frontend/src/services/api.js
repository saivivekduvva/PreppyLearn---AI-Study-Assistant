import axios from 'axios';

/**
 * This service handles all API calls to the FastAPI backend.
 * Keep all your fetch or axios logic centralized here.
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const checkHealth = async () => {
  try {
    const response = await fetch(`http://localhost:8000/health`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error connecting to backend:", error);
    throw error;
  }
};

// Create an axios instance for API calls
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Uploads a PDF document to the backend.
 * @param {File} file - The PDF file to upload.
 * @param {Function} onProgress - Callback function to handle progress (0 to 100).
 * @returns {Promise<Object>} The API response.
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    // Extract meaningful error message from Axios if available
    const errorMessage = error.response?.data?.detail || "Failed to upload document. Please try again.";
    throw new Error(errorMessage);
  }
};

/**
 * Extracts text from an uploaded PDF document.
 * @param {string} filename - The generated filename from the backend.
 * @returns {Promise<Object>} The API response with extracted text.
 */
export const extractPdfText = async (filename) => {
  try {
    const response = await apiClient.get(`/documents/extract/${encodeURIComponent(filename)}`);
    return response.data;
  } catch (error) {
    console.error("Error extracting text:", error);
    const errorMessage = error.response?.data?.detail || "Failed to extract text from document.";
    throw new Error(errorMessage);
  }
};

/**
 * Generates semantic chunks from extracted text.
 * @param {string} text - The raw text to chunk.
 * @param {number} chunkSize - Maximum characters per chunk.
 * @param {number} chunkOverlap - Overlap characters.
 * @returns {Promise<Object>} The API response with chunk data.
 */
export const generateSemanticChunks = async (text, chunkSize = 1000, chunkOverlap = 200) => {
  try {
    const response = await apiClient.post('/rag/chunk', {
      text,
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap
    });
    return response.data;
  } catch (error) {
    console.error("Error generating chunks:", error);
    const errorMessage = error.response?.data?.detail || "Failed to generate chunks.";
    throw new Error(errorMessage);
  }
};

/**
 * Generates vector embeddings for a list of semantic chunks.
 * @param {Array<string>} chunks - List of text chunks.
 * @returns {Promise<Object>} The API response with embeddings.
 */
export const generateEmbeddings = async (chunks) => {
  try {
    const response = await apiClient.post('/rag/embed', { chunks });
    return response.data;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    const errorMessage = error.response?.data?.detail || "Failed to generate embeddings.";
    throw new Error(errorMessage);
  }
};



