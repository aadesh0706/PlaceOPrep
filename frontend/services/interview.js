import api from './api';

export async function getQuestions(mode){
  const res = await api.get('/interview/questions', { params: { mode }, timeout: 10000 });
  return res.data;
}

export async function startInterview(mode){
  const res = await api.post('/interview/start', { mode }, { timeout: 10000 });
  return res.data;
}

export async function submitInterviewAudio({ file, mode }){
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('mode', mode);
  const res = await api.post('/interview/submit', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000 // 90 seconds for full AI processing
  });
  return res.data;
}
