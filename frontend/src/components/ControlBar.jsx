export default function ControlBar({ status, canStart, onJoin, onCancel, onSkip, onEnd, onReconnect, mic, cam }) {
  return (
    <div className="control-bar">
      <button className="btn icon" onClick={mic.toggle} title="Toggle microphone">
        {mic.on ? 'Mic on' : 'Mic off'}
      </button>
      <button className="btn icon" onClick={cam.toggle} title="Toggle camera">
        {cam.on ? 'Cam on' : 'Cam off'}
      </button>

      {status === 'disconnected' && (
        <button className="btn primary" onClick={onReconnect}>Reconnect</button>
      )}
      {(status === 'idle' || status === 'partner-left') && (
        <button className="btn primary" disabled={!canStart} onClick={onJoin}>
          {status === 'idle' ? 'Start chatting' : 'Find new partner'}
        </button>
      )}
      {status === 'searching' && (
        <button className="btn" onClick={onCancel}>Cancel search</button>
      )}
      {status === 'matched' && (
        <>
          <button className="btn primary" onClick={onSkip}>Next</button>
          <button className="btn danger" onClick={onEnd}>End chat</button>
        </>
      )}
    </div>
  );
}
