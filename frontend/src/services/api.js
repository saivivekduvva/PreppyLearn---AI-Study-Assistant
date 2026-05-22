/**
 * This service handles all API calls to the FastAPI backend.
 * Keep all your fetch or axios logic centralized here.
 */

// Make sure this matches your FastAPI server's port
const API_BASE_URL = 'http://localhost:8000'; 

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error connecting to backend:", error);
    throw error;
  }
};
