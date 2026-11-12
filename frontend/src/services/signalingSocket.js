import { WS_URL } from '../config';

// Thin wrapper over the browser WebSocket speaking the backend protocol:
//   outgoing: { type, payload? }     incoming: { type, ...fields }
export class SignalingSocket {
  constructor() {
    this.ws = null;
    this.intentionalClose = false;
  }

  // Resolves once the socket is open (the ticket is consumed during the upgrade).
  connect(ticket, { onMessage, onClose }) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}?ticket=${encodeURIComponent(ticket)}`);
      this.ws = ws;
      let opened = false;

      ws.onopen = () => {
        opened = true;
        resolve();
      };
      ws.onmessage = (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch (err) {
          console.error('Bad message from server', err);
        }
      };
      ws.onclose = (event) => {
        if (!opened) {
          reject(new Error('Could not open the connection (ticket rejected or server down).'));
          return;
        }
        if (!this.intentionalClose) onClose(event.code, event.reason);
      };
      ws.onerror = () => {
        /* onclose follows and carries the outcome */
      };
    });
  }

  send(type, payload) {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(payload === undefined ? { type } : { type, payload }));
    return true;
  }

  close() {
    this.intentionalClose = true;
    this.ws?.close();
  }
}
