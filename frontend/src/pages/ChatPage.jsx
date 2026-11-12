import { useAuth } from '../context/AuthContext';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useChat } from '../hooks/useChat';
import VideoTile from '../components/VideoTile';
import ControlBar from '../components/ControlBar';

const STATUS_LABEL = {
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
  idle: 'Ready',
  searching: 'Looking for someone…',
  matched: 'Connected',
  'partner-left': 'Partner left',
};

export default function ChatPage() {
  const { user, token, logout } = useAuth();
  const media = useLocalMedia();
  const chat = useChat({ token, localStreamRef: media.streamRef, localReady: Boolean(media.stream) });

  const waiting = chat.status === 'matched' && !chat.remoteStream;
  const placeholder = {
    idle: 'Press “Start chatting” to meet someone.',
    searching: 'Searching for a partner with similar interests or skills…',
    'partner-left': chat.notice || 'Your partner left.',
    disconnected: chat.notice || 'Lost connection to the server.',
    connecting: 'Connecting to the server…',
    matched: waiting ? 'Partner found. Setting up the video call…' : '',
  }[chat.status];

  return (
    <div className="chat-page">
      <header className="topbar">
        <strong>Omni Chat</strong>
        <span className={`pill ${chat.status}`}>{STATUS_LABEL[chat.status]}</span>
        <span className="spacer" />
        <span className="muted small">{user.username}</span>
        <button className="btn small" onClick={logout}>Log out</button>
      </header>

      <main className="stage">
        <VideoTile stream={chat.remoteStream} className="remote">
          {!chat.remoteStream && <div className="placeholder">{placeholder}</div>}
          {chat.status === 'matched' && chat.peerState === 'failed' && (
            <div className="placeholder">Video connection failed. Try “Next”.</div>
          )}
        </VideoTile>

        <VideoTile stream={media.stream} muted mirror className="local">
          {!media.stream && <div className="placeholder small">{media.error ? 'No camera' : 'Starting camera…'}</div>}
        </VideoTile>
      </main>

      {media.error && (
        <div className="alert error banner">
          {media.error} <button className="btn small" onClick={media.retry}>Retry</button>
        </div>
      )}
      {chat.error && <div className="alert error banner">{chat.error}</div>}
      {chat.notice && chat.status === 'idle' && <div className="alert info banner">{chat.notice}</div>}

      <ControlBar
        status={chat.status}
        canStart={chat.canStart}
        onJoin={chat.join}
        onCancel={chat.cancelSearch}
        onSkip={chat.skip}
        onEnd={chat.endChat}
        onReconnect={chat.reconnect}
        mic={{ on: media.micOn, toggle: media.toggleMic }}
        cam={{ on: media.camOn, toggle: media.toggleCam }}
      />
    </div>
  );
}
