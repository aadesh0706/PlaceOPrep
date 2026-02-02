import React, { useEffect, useRef } from 'react';
import { loadPlayground } from '../utils/livecodesConfig';

function CodePlayground({ config }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (containerRef.current) {
        await loadPlayground(config);
      }
    };
    load();
  }, [config]);

  return (
    <div ref={containerRef} id="livecodes-container" className="h-full w-full"></div>
  );
}

export default CodePlayground;