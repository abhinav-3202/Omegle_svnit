import { request } from './client';

// POST /register  body: { username, email, password, interests[], skills[] }
export const registerRequest = (form) =>
  request('/register', { method: 'POST', body: form });

// POST /login -> { user: { id, email }, token }
export const loginRequest = (email, password) =>
  request('/login', { method: 'POST', body: { email, password } });

// GET /users/me -> full profile (without password)
export const getMeRequest = (token) => request('/users/me', { token });

// POST /ws-ticket -> { ticket }  (single-use, short-lived; exchanged for the WebSocket)
export const getWsTicketRequest = (token) =>
  request('/ws-ticket', { method: 'POST', token });
