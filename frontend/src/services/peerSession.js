import { ICE_SERVERS } from '../config';

// One RTCPeerConnection for one match. Create a new PeerSession per match, close() when it ends.
export class PeerSession {
  constructor({ localStream, onIceCandidate, onRemoteStream, onStateChange }) {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pendingCandidates = []; // candidates that arrive before the remote description

    localStream.getTracks().forEach((track) => this.pc.addTrack(track, localStream));

    this.pc.onicecandidate = (e) => {
      if (e.candidate) onIceCandidate(e.candidate.toJSON());
    };
    this.pc.ontrack = (e) => onRemoteStream(e.streams[0]);
    this.pc.onconnectionstatechange = () => onStateChange(this.pc.connectionState);
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return { type: offer.type, sdp: offer.sdp };
  }

  async acceptOffer(description) {
    await this.pc.setRemoteDescription(description);
    await this.#flushCandidates();
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return { type: answer.type, sdp: answer.sdp };
  }

  async acceptAnswer(description) {
    await this.pc.setRemoteDescription(description);
    await this.#flushCandidates();
  }

  async addIceCandidate(candidate) {
    if (!this.pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }
    try {
      await this.pc.addIceCandidate(candidate);
    } catch (err) {
      console.warn('addIceCandidate failed', err);
    }
  }

  async #flushCandidates() {
    for (const c of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(c);
      } catch (err) {
        console.warn('addIceCandidate failed', err);
      }
    }
    this.pendingCandidates = [];
  }

  close() {
    this.pc.onicecandidate = null;
    this.pc.ontrack = null;
    this.pc.onconnectionstatechange = null;
    this.pc.close();
  }
}
