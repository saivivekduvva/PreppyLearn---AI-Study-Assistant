import { useState, useEffect } from 'react';
import { generateSemanticChunks, generateEmbeddings, storeEmbeddings } from '../services/api';

const useVectorProcessing = (extractedText, filename, shouldProcess) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'chunking' | 'embedding' | 'storing' | 'success' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const processText = async () => {
      if (!extractedText) {
        setStatus('idle');
        return;
      }

      if (!shouldProcess) {
        setStatus('success');
        return;
      }

      try {
        // Step 1: Chunking
        setStatus('chunking');
        const chunkRes = await generateSemanticChunks(extractedText, 1000, 200);
        if (!isMounted) return;
        const chunks = chunkRes.data.chunks;

        if (!chunks || chunks.length === 0) {
           setStatus('success');
           return;
        }

        // Step 2: Embedding
        setStatus('embedding');
        const embedRes = await generateEmbeddings(chunks);
        if (!isMounted) return;
        const embeddings = embedRes.data.embeddings;

        // Step 3: Storing
        setStatus('storing');
        const ids = chunks.map((_, i) => `chunk_${Date.now()}_${i}`);
        const metas = chunks.map((_, i) => ({ source: filename || "uploaded_doc", chunk_index: i }));
        await storeEmbeddings(ids, embeddings, chunks, metas);
        if (!isMounted) return;

        // Done
        setStatus('success');
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred during background processing.');
          setStatus('error');
        }
      }
    };

    processText();

    return () => {
      isMounted = false;
    };
  }, [extractedText, filename, shouldProcess]);

  return { status, error };
};

export default useVectorProcessing;
