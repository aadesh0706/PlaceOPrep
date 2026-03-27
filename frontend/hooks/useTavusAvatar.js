import { useState, useRef } from 'react';

export const useTavusAvatar = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const initializeTavus = async (containerId, interviewData) => {
    try {
      const response = await fetch('https://placeoprep-ai.vercel.app/api/tavus/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      setConversationId(data.conversation_id);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        const container = document.getElementById(containerId);
        if (container && event.streams[0]) {
          const video = document.createElement('video');
          video.srcObject = event.streams[0];
          video.autoplay = true;
          video.playsInline = true;
          video.className = 'w-full h-full object-cover rounded-xl';
          container.innerHTML = '';
          container.appendChild(video);
          videoRef.current = video;
          setIsReady(true);
        }
      };

      console.log('Tavus initialized:', data.conversation_id);
      
    } catch (err) {
      console.error('Tavus error:', err);
      setError(err.message);
    }
  };

  const sendMessage = async (message) => {
    if (!conversationId) return;
    
    try {
      await fetch('https://placeoprep-ai.vercel.app/api/tavus/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          message
        })
      });
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return { initializeTavus, cleanup, sendMessage, conversationId, isReady, error };
};
