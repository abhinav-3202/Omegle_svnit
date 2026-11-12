import { useCallback, useEffect, useRef, useState } from 'react';
import { getWsTicketRequest } from '../api/authApi';
import { SignalingSocket } from '../services/signalingSocket';
import { PeerSession } from '../services/peerSession';

// status: connecting | disconnected | idle | searching | matched | partner-left
//
// Orchestrates the backend protocol (see backend/src/websocket/websocketHandler.js):
//   client -> JOIN_QUEUE | LEAVE_QUEUE | SKIP | END_MATCH | WEBRTC_OFFER | WEBRTC_ANSWER | ICE_CANDIDATE
//   server -> CONNECTED | QUEUE_JOINED | QUEUE_LEFT | MATCH_FOUND | MATCH_ENDED |
//             PARTNER_SKIPPED | PARTNER_DISCONNECTED | ERROR | (relayed WebRTC signals)
export function useChat({ token, localStreamRef, localReady }) {
  const [status, setStatus] = useState('connecting');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerState, setPeerState] = useState('new');

  const statusRef = useRef('connecting');
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const myIdRef = useRef(null);
  const partnerRef = useRef(null);
  const earlySignalsRef = useRef([]); // signals that beat MATCH_FOUND
  const attemptRef = useRef(0);

  const updateStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const teardownPeer = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    partnerRef.current = null;
    earlySignalsRef.current = [];
    setRemoteStream(null);
    setPeerState('new');
  }, []);

  const handleSignal = useCallback((msg) => {
    const peer = peerRef.current;
    if (!peer || msg.senderId !== partnerRef.current) return; // stale / foreign signal

    if (msg.type === 'WEBRTC_OFFER') {
      peer
        .acceptOffer(msg.payload)
        .then((answer) => {
          if (peerRef.current === peer) socketRef.current?.send('WEBRTC_ANSWER', answer);
        })
        .catch((e) => console.error('acceptOffer failed', e));
    } else if (msg.type === 'WEBRTC_ANSWER') {
      peer.acceptAnswer(msg.payload).catch((e) => console.error('acceptAnswer failed', e));
    } else if (msg.type === 'ICE_CANDIDATE') {
      peer.addIceCandidate(msg.payload);
    }
  }, []);

  const startPeer = useCallback(
    (partnerId) => {
      teardownPeer();
      partnerRef.current = partnerId;

      const peer = new PeerSession({
        localStream: localStreamRef.current,
        onIceCandidate: (c) => socketRef.current?.send('ICE_CANDIDATE', c),
        onRemoteStream: setRemoteStream,
        onStateChange: setPeerState,
      });
      peerRef.current = peer;

      // Backend doesn't assign roles, so the lower userId makes the offer.
      if (myIdRef.current < partnerId) {
        peer
          .createOffer()
          .then((offer) => {
            if (peerRef.current === peer) socketRef.current?.send('WEBRTC_OFFER', offer);
          })
          .catch((e) => console.error('createOffer failed', e));
      }

      const early = earlySignalsRef.current;
      earlySignalsRef.current = [];
      early.forEach(handleSignal);
    },
    [localStreamRef, teardownPeer, handleSignal]
  );

  const handleMessage = useCallback(
    (msg) => {
      switch (msg.type) {
        case 'CONNECTED':
          myIdRef.current = msg.userId;
          updateStatus('idle');
          break;
        case 'QUEUE_JOINED':
          setError('');
          updateStatus('searching');
          break;
        case 'QUEUE_LEFT':
          updateStatus('idle');
          break;
        case 'MATCH_FOUND':
          setError('');
          setNotice('');
          startPeer(msg.partnerId);
          updateStatus('matched');
          break;
        case 'MATCH_ENDED':
          teardownPeer();
          if (msg.result === 'SKIPPED') {
            updateStatus('searching'); // server re-queues the skipper automatically
          } else {
            setNotice('The chat has ended.');
            updateStatus('idle');
          }
          break;
        case 'PARTNER_SKIPPED':
          teardownPeer();
          setNotice('Your partner skipped you.');
          updateStatus('partner-left');
          break;
        case 'PARTNER_DISCONNECTED':
          teardownPeer();
          setNotice('Your partner disconnected.');
          updateStatus('partner-left');
          break;
        case 'WEBRTC_OFFER':
        case 'WEBRTC_ANSWER':
        case 'ICE_CANDIDATE':
          if (peerRef.current) handleSignal(msg);
          else earlySignalsRef.current.push(msg);
          break;
        case 'ERROR':
          setError(msg.message);
          if (statusRef.current === 'searching') updateStatus('idle');
          break;
        default:
          break;
      }
    },
    [startPeer, teardownPeer, handleSignal, updateStatus]
  );

  const connect = useCallback(async () => {
    const attempt = ++attemptRef.current;
    updateStatus('connecting');
    setError('');
    try {
      const { ticket } = await getWsTicketRequest(token);
      if (attempt !== attemptRef.current) return; // superseded / unmounted

      const socket = new SignalingSocket();
      socketRef.current = socket;
      await socket.connect(ticket, {
        onMessage: handleMessage,
        onClose: (code) => {
          teardownPeer();
          setNotice(code === 4000 ? 'This account was opened in another tab or window.' : '');
          updateStatus('disconnected');
        },
      });
      if (attempt !== attemptRef.current) socket.close();
    } catch (err) {
      if (attempt !== attemptRef.current) return;
      setError(err.message);
      updateStatus('disconnected');
    }
  }, [token, handleMessage, teardownPeer, updateStatus]);

  useEffect(() => {
    connect();
    return () => {
      attemptRef.current++; // invalidates any in-flight connect()
      socketRef.current?.close();
      socketRef.current = null;
      teardownPeer();
    };
  }, [connect, teardownPeer]);

  const send = (type) => socketRef.current?.send(type);

  return {
    status,
    notice,
    error,
    remoteStream,
    peerState,
    canStart: localReady && status !== 'connecting' && status !== 'disconnected',
    reconnect: connect,
    join: () => {
      setNotice('');
      setError('');
      updateStatus('searching');
      send('JOIN_QUEUE');
    },
    cancelSearch: () => send('LEAVE_QUEUE'),
    skip: () => {
      teardownPeer();
      updateStatus('searching');
      send('SKIP');
    },
    endChat: () => send('END_MATCH'),
  };
}
