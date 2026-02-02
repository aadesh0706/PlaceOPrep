import React, { useEffect, useState } from 'react';
import ChartRadar from '../charts/ChartRadar.jsx';
import ChartLine from '../charts/ChartLine.jsx';
import api from '../services/api';

export default function Analytics(){
  const [radarData, setRadarData] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/analytics/user');
        setRadarData(res.data.spectrum || []);
        setLineData(res.data.trend || []);
      } catch {}
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartRadar data={radarData} />
      <ChartLine data={lineData} title="Improvement Trend" />
    </div>
  );
}
