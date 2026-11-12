import { useEffect, useRef } from 'react';

export default function VideoTile({ stream, muted = false, mirror = false, className = '', children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream || null;
  }, [stream]);

  return (
    <div className={`video-tile ${className}`}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className={mirror ? 'mirror' : ''}
        style={{ display: stream ? 'block' : 'none' }}
      />
      {children}
    </div>
  );
}
