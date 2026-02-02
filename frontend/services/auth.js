import api from './api';

export async function login(username, password){
  const res = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
}
