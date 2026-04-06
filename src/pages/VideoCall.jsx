import { useState, useEffect, useRef } from 'react';

const font = "'IBM Plex Sans Thai Looped', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';

const keyframesCSS = `
@keyframes pulsingDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}
@keyframes mutePulse {
  0% { box-shadow: 0 0 0 0 rgba(255,56,60,0.4); }
  100% { box-shadow: 0 0 0 12px rgba(255,56,60,0); }
}
@keyframes signalBar1 {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes signalBar2 {
  0%, 100% { opacity: 1; }
  33% { opacity: 0.4; }
}
@keyframes signalBar3 {
  0%, 100% { opacity: 1; }
  66% { opacity: 0.4; }
}
@keyframes endCallRotate {
  to { transform: rotate(135deg); }
}
`;

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// --- SVG Icons ---

function IconMic({ muted }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {muted && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function IconCamera({ off }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="15" height="14" rx="3" fill="currentColor" />
      <path d="M17 9l4-2v10l-4-2V9z" fill="currentColor" />
      {off && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function IconPhoneDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 18c-4.4 0-8-1.8-8-4v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v1.5c1 .3 2 .5 3 .5s2-.2 3-.5V12c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 2.2-3.6 4-8 4z" fill="currentColor" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconSpeaker() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
      <path d="M16 9a4 4 0 010 6M19 6a8 8 0 010 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function IconMinimize() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 12h5v5M16 8h-5V3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4h5v0M16 16h-5v0M4 4l5 5M16 16l-5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Sound Effects (Web Audio API) ---
const audioCtxRef = { current: null };
function getAudioCtx() {
  if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtxRef.current;
}

function playTone(freq, duration = 0.1, type = 'sine', vol = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

const SFX = {
  mic:     () => playTone(880, 0.08, 'sine', 0.12),
  camera:  () => playTone(660, 0.1, 'triangle', 0.12),
  endCall: () => { playTone(350, 0.15, 'square', 0.1); setTimeout(() => playTone(250, 0.25, 'square', 0.1), 120); },
  hold:    () => { playTone(520, 0.08, 'sine', 0.1); setTimeout(() => playTone(520, 0.08, 'sine', 0.1), 100); },
  speaker: () => playTone(1000, 0.06, 'sine', 0.1),
  click:   () => playTone(1200, 0.04, 'sine', 0.08),
};

// --- Main Component ---

export default function VideoCall({ patient, onClose, onMinimize }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [pressedBtn, setPressedBtn] = useState(null);

  const timerRef = useRef(null);
  const endingRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Webcam
  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {});
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraOn]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Cleanup ending timeout
  useEffect(() => {
    return () => {
      if (endingRef.current) clearTimeout(endingRef.current);
    };
  }, []);

  const handleEndCall = () => {
    SFX.endCall();
    setIsEnding(true);
    endingRef.current = setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleMinimize = () => {
    SFX.click();
    setIsMinimized(true);
    if (onMinimize) onMinimize();
  };

  const handleExpand = () => {
    SFX.click();
    setIsMinimized(false);
  };

  const btnDown = (id) => setPressedBtn(id);
  const btnUp = () => setPressedBtn(null);

  const controlBtnStyle = (id, size, bg, radius) => ({
    width: size,
    height: size,
    borderRadius: radius,
    background: bg,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    transform: pressedBtn === id ? 'scale(0.92)' : 'scale(1)',
    outline: 'none',
    padding: 0,
    position: 'relative',
  });

  // --- MINIMIZED MODE ---
  if (isMinimized) {
    return (
      <>
        <style>{keyframesCSS}</style>
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
            width: 280,
            borderRadius: 20,
            background: BLACK,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            fontFamily: font,
            padding: 16,
            transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
            transform: 'scale(1)',
            opacity: 1,
          }}
        >
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{patient?.name}</span>
            <span style={{ color: '#34C759', fontSize: 12, fontFamily: font }}>{formatTime(seconds)}</span>
          </div>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {/* Mute */}
            <button
              onClick={() => { SFX.mic(); setIsMuted(!isMuted); }}
              onMouseDown={() => btnDown('mini-mic')}
              onMouseUp={btnUp}
              onMouseLeave={btnUp}
              style={{
                ...controlBtnStyle('mini-mic', 36, isMuted ? '#FF383C' : 'rgba(255,255,255,0.15)', '50%'),
                color: '#fff',
                animation: isMuted ? 'mutePulse 1.5s infinite' : 'none',
              }}
            >
              <IconMic muted={isMuted} />
            </button>
            {/* Camera */}
            <button
              onClick={() => { SFX.camera(); setIsCameraOn(!isCameraOn); }}
              onMouseDown={() => btnDown('mini-cam')}
              onMouseUp={btnUp}
              onMouseLeave={btnUp}
              style={{
                ...controlBtnStyle('mini-cam', 36, isCameraOn ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.15)', '50%'),
                color: '#fff',
              }}
            >
              <IconCamera off={!isCameraOn} />
            </button>
            {/* End call */}
            <button
              onClick={handleEndCall}
              onMouseDown={() => btnDown('mini-end')}
              onMouseUp={btnUp}
              onMouseLeave={btnUp}
              style={{
                ...controlBtnStyle('mini-end', 40, '#FF383C', '50%'),
                color: '#fff',
              }}
            >
              <IconPhoneDown />
            </button>
            {/* Expand */}
            <button
              onClick={handleExpand}
              onMouseDown={() => btnDown('mini-expand')}
              onMouseUp={btnUp}
              onMouseLeave={btnUp}
              style={{
                ...controlBtnStyle('mini-expand', 36, 'rgba(255,255,255,0.15)', '50%'),
                color: '#fff',
              }}
            >
              <IconExpand />
            </button>
          </div>
        </div>
      </>
    );
  }

  // --- FULL MODE ---
  return (
    <>
      <style>{keyframesCSS}</style>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1050,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: font,
          transition: 'opacity 0.35s cubic-bezier(.4,0,.2,1)',
          opacity: isEnding ? 0 : 1,
        }}
      >
        {/* Card */}
        <div
          style={{
            width: 480,
            borderRadius: 32,
            background: BLACK,
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
            transform: isEnding ? 'scale(0.9)' : 'scale(1)',
            opacity: isEnding ? 0 : 1,
          }}
        >
          {/* Top bar - patient info */}
          <div
            style={{
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{patient?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#34C759',
                    display: 'inline-block',
                    animation: 'pulsingDot 1.5s infinite',
                  }}
                />
                <span style={{ color: '#34C759', fontSize: 12 }}>
                  {seconds < 3 ? 'กำลังโทร...' : 'เชื่อมต่อแล้ว'}
                </span>
              </div>
            </div>
            {/* Minimize button */}
            <button
              onClick={handleMinimize}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                padding: 0,
              }}
            >
              <IconMinimize />
            </button>
          </div>

          {/* Video area */}
          <div
            style={{
              height: 320,
              background: 'linear-gradient(135deg, #2D2B55, #1E1B39)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Remote (patient) - large, simulated */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #2D2B55 0%, #1A1840 50%, #2D2B55 100%)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6, #6658E1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(139,92,246,0.3)',
                }}>
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="18" r="10" fill="rgba(255,255,255,0.5)" />
                    <path d="M6 44c0-10 8-18 18-18s18 8 18 18" fill="rgba(255,255,255,0.25)" />
                  </svg>
                </div>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 600, fontFamily: font }}>{patient?.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: font }}>HN: {patient?.hn || '-'}</span>
              </div>
            </div>

            {/* Duration timer */}
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 5,
              background: 'rgba(0,0,0,0.4)', borderRadius: 8,
              padding: '4px 10px', color: '#fff', fontSize: 13, fontFamily: font,
              backdropFilter: 'blur(4px)',
            }}>
              {formatTime(seconds)}
            </div>

            {/* Self camera - small PiP bottom-right */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12, zIndex: 5,
              width: 120, height: 90, borderRadius: 12,
              overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              background: '#1E1B39',
            }}>
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, background: 'linear-gradient(135deg, #2D2B55, #1E1B39)',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <IconCamera off />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: font }}>ปิดกล้อง</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls section */}
          <div style={{ background: BLACK, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16 }}>
              {/* 1. Mic */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { SFX.mic(); setIsMuted(!isMuted); }}
                  onMouseDown={() => btnDown('mic')}
                  onMouseUp={btnUp}
                  onMouseLeave={btnUp}
                  style={{
                    ...controlBtnStyle('mic', 52, isMuted ? '#FF383C' : '#fff', '50%'),
                    color: isMuted ? '#fff' : BLACK,
                    animation: isMuted ? 'mutePulse 1.5s infinite' : 'none',
                  }}
                >
                  <IconMic muted={isMuted} />
                </button>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>ไมค์</span>
              </div>

              {/* 2. Camera */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { SFX.camera(); setIsCameraOn(!isCameraOn); }}
                  onMouseDown={() => btnDown('cam')}
                  onMouseUp={btnUp}
                  onMouseLeave={btnUp}
                  style={{
                    ...controlBtnStyle('cam', 52, isCameraOn ? '#fff' : 'rgba(255,255,255,0.15)', '50%'),
                    color: isCameraOn ? BLACK : '#fff',
                  }}
                >
                  <IconCamera off={!isCameraOn} />
                </button>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>กล้อง</span>
              </div>

              {/* 3. End call */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleEndCall}
                  onMouseDown={() => btnDown('end')}
                  onMouseUp={btnUp}
                  onMouseLeave={btnUp}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255,56,60,0.5)';
                  }}
                  onMouseLeaveCapture={(e) => {
                    if (pressedBtn !== 'end') {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  style={{
                    ...controlBtnStyle('end', 64, '#FF383C', '50%'),
                    color: '#fff',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      transition: 'transform 0.3s ease',
                      transform: isEnding ? 'rotate(135deg)' : 'rotate(0deg)',
                    }}
                  >
                    <IconPhoneDown />
                  </span>
                </button>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>วางสาย</span>
              </div>

              {/* 4. Hold */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { SFX.hold(); setIsOnHold(!isOnHold); }}
                  onMouseDown={() => btnDown('hold')}
                  onMouseUp={btnUp}
                  onMouseLeave={btnUp}
                  style={{
                    ...controlBtnStyle('hold', 52, isOnHold ? '#E8802A' : 'rgba(255,255,255,0.15)', '50%'),
                    color: '#fff',
                  }}
                >
                  <IconPause />
                </button>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>พักสาย</span>
              </div>

              {/* 5. Speaker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => { SFX.speaker(); setIsSpeakerOn(!isSpeakerOn); }}
                  onMouseDown={() => btnDown('speaker')}
                  onMouseUp={btnUp}
                  onMouseLeave={btnUp}
                  style={{
                    ...controlBtnStyle('speaker', 52, isSpeakerOn ? '#fff' : 'rgba(255,255,255,0.15)', '50%'),
                    color: isSpeakerOn ? BLACK : '#fff',
                  }}
                >
                  <IconSpeaker />
                </button>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>เสียง</span>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div
            style={{
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: BLACK,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Signal bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
              <div
                style={{
                  width: 3,
                  height: 5,
                  borderRadius: 1,
                  background: '#34C759',
                  animation: 'signalBar1 2s infinite',
                }}
              />
              <div
                style={{
                  width: 3,
                  height: 8,
                  borderRadius: 1,
                  background: '#34C759',
                  animation: 'signalBar2 2s 0.3s infinite',
                }}
              />
              <div
                style={{
                  width: 3,
                  height: 12,
                  borderRadius: 1,
                  background: '#34C759',
                  animation: 'signalBar3 2s 0.6s infinite',
                }}
              />
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>คุณภาพสัญญาณดี</span>
          </div>
        </div>
      </div>
    </>
  );
}
