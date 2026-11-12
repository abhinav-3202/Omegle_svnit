// Central place for everything environment-dependent.

// REST base. '/api' is proxied to the backend by Vite (see vite.config.js).
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// WebSocket endpoint. Backend upgrade handler only accepts path '/ws?ticket=...'.
const wsOrigin =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
export const WS_URL = `${wsOrigin}/ws`;

// STUN only for now. Add a TURN server here for users behind strict NATs.
export const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export const TOKEN_STORAGE_KEY = 'omni_token';
