import { useState } from 'react';

/**
 * Custom hook to manage the state of a study session.
 */
const useStudySession = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);

  const startSession = () => setIsActive(true);
  const endSession = () => {
    setIsActive(false);
    setMessages([]);
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  return { isActive, messages, startSession, endSession, addMessage };
};

export default useStudySession;
