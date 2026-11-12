import { useCallback, useEffect, useRef, useState } from 'react';

// Owns the camera/microphone stream for the lifetime of the component.
export function useLocalMedia() {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const start = useCallback(async () => {
    setError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      setStream(media);
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera/microphone permission was denied. Allow access in your browser and retry.'
          : `Could not access camera/microphone (${err.name}).`
      );
    }
  }, []);

  useEffect(() => {
    start();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [start]);

  const toggle = (kind, setter) => {
    const tracks = kind === 'audio' ? streamRef.current?.getAudioTracks() : streamRef.current?.getVideoTracks();
    tracks?.forEach((t) => (t.enabled = !t.enabled));
    setter((v) => !v);
  };

  return {
    stream,
    streamRef,
    error,
    retry: start,
    micOn,
    camOn,
    toggleMic: () => toggle('audio', setMicOn),
    toggleCam: () => toggle('video', setCamOn),
  };
}
