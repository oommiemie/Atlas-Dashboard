import { useState } from 'react';

const font = "'IBM Plex Sans Thai Looped', sans-serif";

const ACCOUNTS = [
  { username: 'admin', password: 'admin', role: 'admin', name: 'สมชาย ใจดี', title: 'ผู้ดูแลระบบ', hospital: null },
  { username: 'hospital', password: 'hospital', role: 'hospital', name: 'โรงพยาบาลขอนแก่น', title: 'รพ.ศูนย์ขอนแก่น', hospital: 'ขอนแก่น' },
];

/* Floating health icons */
const FLOAT_ITEMS = [
  { emoji: '❤️', size: 48, x: '12%', y: '18%', delay: 0 },
  { emoji: '🩺', size: 40, x: '75%', y: '12%', delay: 0.8 },
  { emoji: '💊', size: 36, x: '85%', y: '55%', delay: 1.5 },
  { emoji: '🏥', size: 44, x: '20%', y: '72%', delay: 0.4 },
  { emoji: '🫀', size: 32, x: '60%', y: '80%', delay: 1.2 },
  { emoji: '🩻', size: 38, x: '40%', y: '10%', delay: 2.0 },
  { emoji: '💉', size: 34, x: '8%', y: '48%', delay: 0.6 },
  { emoji: '🌡️', size: 30, x: '90%', y: '30%', delay: 1.8 },
  { emoji: '🧬', size: 36, x: '50%', y: '90%', delay: 1.0 },
  { emoji: '📋', size: 28, x: '30%', y: '40%', delay: 2.2 },
];

/* Stat cards for left panel */
const STATS = [
  { label: 'ผู้ป่วยในระบบ', value: '1,247', icon: '👥', color: '#3B82F6' },
  { label: 'เยี่ยมบ้านวันนี้', value: '38', icon: '🏠', color: '#19A589' },
  { label: 'Vital Signs', value: '892', icon: '❤️', color: '#E8432A' },
  { label: 'ส่งยาสำเร็จ', value: '156', icon: '💊', color: '#8B5CF6' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const account = ACCOUNTS.find(a => a.username === username && a.password === password);
      if (account) {
        onLogin(account);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: font, overflow: 'hidden',
    }}>
      {/* ═══ LEFT — Hero Visual ═══ */}
      <div style={{
        width: '50%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #4438AD 0%, #1C1747 50%, #0D0B2E 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '60px 40px',
      }}>
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'loginOrb1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'loginOrb2 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,165,137,0.2) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'loginOrb3 7s ease-in-out infinite' }} />

        {/* ═══ Layered Chart Components ═══ */}

        {/* Layer 1 — Large donut chart (top-left) */}
        <div style={{ position: 'absolute', top: '5%', left: '-5%', width: 260, height: 260, animation: 'loginFloat 8s ease-in-out 0s infinite', zIndex: 1, opacity: 0.35 }}>
          <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="180 302" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ animation: 'loginDonutDraw 2s ease-out 0.5s both' }}/>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#3B82F6" strokeWidth="12" strokeDasharray="80 302" strokeDashoffset="-180" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ animation: 'loginDonutDraw 2s ease-out 0.8s both' }}/>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#19A589" strokeWidth="12" strokeDasharray="42 302" strokeDashoffset="-260" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ animation: 'loginDonutDraw 2s ease-out 1.1s both' }}/>
          </svg>
        </div>

        {/* Layer 2 — Bar chart (bottom-right) */}
        <div style={{ position: 'absolute', bottom: '12%', right: '5%', display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, animation: 'loginFloat 7s ease-in-out 1s infinite', zIndex: 1, opacity: 0.3 }}>
          {[65, 85, 50, 100, 75, 90, 55, 80].map((h, i) => (
            <div key={i} style={{
              width: 14, borderRadius: 8, height: `${h}%`,
              background: i % 3 === 0 ? 'linear-gradient(180deg, #8B5CF6, #6658E1)' : i % 3 === 1 ? 'linear-gradient(180deg, #3B82F6, #1D4ED8)' : 'linear-gradient(180deg, #19A589, #0D7C66)',
              animation: `loginBarGrow 0.6s cubic-bezier(.22,1,.36,1) ${0.8 + i * 0.1}s both`,
              transformOrigin: 'bottom',
            }} />
          ))}
        </div>

        {/* Layer 3 — Line chart (center-right) */}
        <div style={{ position: 'absolute', top: '20%', right: '-3%', width: 280, height: 140, animation: 'loginFloat 9s ease-in-out 0.5s infinite', zIndex: 1, opacity: 0.25 }}>
          <svg viewBox="0 0 280 140" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="loginLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0 100 Q30 80, 60 90 T120 60 T180 75 T240 30 T280 50" fill="url(#loginLineGrad)" stroke="none" opacity="0.5"/>
            <path d="M0 100 Q30 80, 60 90 T120 60 T180 75 T240 30 T280 50" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"
              style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'loginLineDraw 2s ease-out 0.6s forwards' }}/>
            {[[0,100],[60,90],[120,60],[180,75],[240,30],[280,50]].map(([cx,cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="#8B5CF6" stroke="white" strokeWidth="2"
                style={{ opacity: 0, animation: `loginDotPop 0.3s ease ${1.2 + i * 0.15}s forwards` }}/>
            ))}
          </svg>
        </div>

        {/* Layer 4 — Small pie chart (bottom-left) */}
        <div style={{ position: 'absolute', bottom: '25%', left: '10%', width: 100, height: 100, animation: 'loginFloat 6s ease-in-out 1.5s infinite', zIndex: 1, opacity: 0.3 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FC9BBA" strokeWidth="18" strokeDasharray="100 251" strokeLinecap="round" transform="rotate(-90 50 50)" style={{ animation: 'loginDonutDraw 1.5s ease-out 1s both' }}/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E8802A" strokeWidth="18" strokeDasharray="70 251" strokeDashoffset="-100" strokeLinecap="round" transform="rotate(-90 50 50)" style={{ animation: 'loginDonutDraw 1.5s ease-out 1.3s both' }}/>
          </svg>
        </div>

        {/* Layer 5 — Progress cards (top-right) */}
        <div style={{ position: 'absolute', top: '8%', right: '8%', display: 'flex', flexDirection: 'column', gap: 8, animation: 'loginFloat 7s ease-in-out 2s infinite', zIndex: 1, opacity: 0.25 }}>
          {[{ w: 75, c: '#8B5CF6' }, { w: 60, c: '#3B82F6' }, { w: 90, c: '#19A589' }].map((bar, i) => (
            <div key={i} style={{ width: 120, height: 8, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${bar.w}%`, height: '100%', borderRadius: 100, background: bar.c, animation: `rankBarGrow 1s cubic-bezier(.22,1,.36,1) ${1.5 + i * 0.2}s both` }} />
            </div>
          ))}
        </div>

        {/* Layer 6 — Scatter dots (center) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.15 }}>
          {[[15,35],[25,60],[35,25],[45,70],[55,40],[65,55],[75,20],[85,65],[30,85],[70,80],[50,15],[20,50],[80,35],[40,90],[60,10]].map(([x,y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r={3 + Math.random() * 4} fill={['#8B5CF6','#3B82F6','#19A589','#FC9BBA','#E8802A'][i % 5]}
              style={{ opacity: 0, animation: `loginDotPop 0.4s ease ${0.5 + i * 0.12}s forwards` }}/>
          ))}
        </svg>

        {/* Floating health icons (small, on top) */}
        {FLOAT_ITEMS.slice(0, 6).map((item, i) => (
          <div key={i} style={{
            position: 'absolute', left: item.x, top: item.y,
            width: item.size * 0.7, height: item.size * 0.7, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: item.size * 0.35, animation: `loginFloat 6s ease-in-out ${item.delay}s infinite`,
            zIndex: 2,
          }}>
            {item.emoji}
          </div>
        ))}

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 480 }}>
          {/* Logo */}
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 0 60px 10px rgba(143,134,251,0.2)',
            margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'loginPulse 3s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Inter', sans-serif", color: 'white' }}>A</span>
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 800, color: 'white', fontFamily: "'Inter', sans-serif",
            margin: 0, letterSpacing: 4, animation: 'loginTitle 0.8s cubic-bezier(.22,1,.36,1) 0.2s both',
          }}>ATLAS</h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.5)', letterSpacing: 6,
            fontFamily: "'Inter', sans-serif", margin: '4px 0 0',
            animation: 'loginTitle 0.8s cubic-bezier(.22,1,.36,1) 0.4s both',
          }}>DASHBOARD</p>

          <div style={{
            marginTop: 32, animation: 'loginTitle 0.8s cubic-bezier(.22,1,.36,1) 0.6s both',
          }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.5 }}>
              ระบบติดตามข้อมูลสุขภาพ
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginTop: 8 }}>
              ติดตาม Vital Signs เยี่ยมบ้าน ส่งยาที่บ้าน<br/>
              ประเมินสุขภาพ และรายงานผลแบบ Real-time
            </p>
          </div>

          {/* Mini stat cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 40,
            animation: 'loginTitle 0.8s cubic-bezier(.22,1,.36,1) 0.8s both',
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                padding: '14px 16px', textAlign: 'left',
                animation: `loginStatPop 0.5s cubic-bezier(.22,1,.36,1) ${1 + i * 0.1}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{s.value}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, display: 'block' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ECG line at bottom */}
        <svg viewBox="0 0 600 60" style={{
          position: 'absolute', bottom: 40, left: 0, width: '100%', height: 60, opacity: 0.15,
        }}>
          <path d="M0 30 L80 30 L100 30 L110 10 L120 50 L130 20 L140 40 L150 30 L200 30 L250 30 L260 10 L270 50 L280 20 L290 40 L300 30 L400 30 L410 10 L420 50 L430 20 L440 40 L450 30 L600 30"
            fill="none" stroke="rgba(139,92,246,0.8)" strokeWidth="2"
            style={{ strokeDasharray: 1200, strokeDashoffset: 1200, animation: 'loginEcg 3s ease-in-out 0.5s forwards' }}
          />
        </svg>
      </div>

      {/* ═══ RIGHT — Login Form ═══ */}
      <div style={{
        width: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', maxHeight: '100vh', overflowY: 'auto',
        background: 'linear-gradient(180deg, #F5F3FF 0%, #EEEAFF 50%, #E8E4FF 100%)',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(162,155,254,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(116,185,255,0.08) 0%, transparent 50%)',
        position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'loginFormSlide 0.7s cubic-bezier(.22,1,.36,1) 0.3s both' }}>
          {/* Welcome */}
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E1B39', margin: 0 }}>ยินดีต้อนรับ</h2>
            <p style={{ fontSize: 12, color: '#615E83', margin: '8px 0 0', lineHeight: 1.6 }}>เข้าสู่ระบบเพื่อจัดการข้อมูลสุขภาพผู้ป่วย</p>
          </div>

          {/* Quick select accounts — subtle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, justifyContent: 'center' }}>
            {ACCOUNTS.map(acc => {
              const isSelected = username === acc.username;
              return (
                <button
                  key={acc.username}
                  type="button"
                  className="login-pill"
                  onClick={() => { setUsername(acc.username); setPassword(acc.password); setError(''); }}
                  style={{
                    padding: '7px 16px', borderRadius: 100, cursor: 'pointer',
                    border: isSelected ? '1.5px solid #8B5CF6' : '1px solid rgba(0,0,0,0.06)',
                    background: isSelected ? 'rgba(139,92,246,0.06)' : 'rgba(0,0,0,0.02)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 12, color: isSelected ? '#8B5CF6' : '#8E8E93', fontWeight: isSelected ? 600 : 400 }}>{acc.role === 'admin' ? 'Admin' : 'Hospital'}</span>
                </button>
              );
            })}
          </div>

          {/* Form — glass card */}
          <form className="login-glass-card" onSubmit={handleLogin} style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.7)', borderRadius: 20,
            boxShadow: '0 8px 32px rgba(30,27,57,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            padding: '24px 22px',
          }}>
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#1E1B39' }}>ชื่อผู้ใช้</label>
              <div className="login-input-wrap" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '0 16px',
                border: username ? '1.5px solid #8B5CF6' : '1.5px solid rgba(116,116,128,0.1)',
                boxShadow: username ? '0 0 0 4px rgba(139,92,246,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke={username ? '#8B5CF6' : '#C4C4C4'} strokeWidth="1.5"/><path d="M2.5 16c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" stroke={username ? '#8B5CF6' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="ชื่อผู้ใช้งาน"
                  style={{ flex: 1, border: 'none', background: 'none', outline: 'none', padding: '11px 0', fontSize: 14, fontFamily: font, color: '#1E1B39' }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#1E1B39' }}>รหัสผ่าน</label>
              <div className="login-input-wrap" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '0 16px',
                border: password ? '1.5px solid #8B5CF6' : '1.5px solid rgba(116,116,128,0.1)',
                boxShadow: password ? '0 0 0 4px rgba(139,92,246,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="8" width="12" height="8" rx="2.5" stroke={password ? '#8B5CF6' : '#C4C4C4'} strokeWidth="1.5"/><path d="M5.5 8V6a3.5 3.5 0 017 0v2" stroke={password ? '#8B5CF6' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่าน"
                  style={{ flex: 1, border: 'none', background: 'none', outline: 'none', padding: '11px 0', fontSize: 14, fontFamily: font, color: '#1E1B39' }} />
                <div className="login-eye" onClick={() => setShowPass(!showPass)} style={{ cursor: 'pointer', padding: 4, display: 'flex', opacity: 0.5 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1.5 9s3-5.5 7.5-5.5S16.5 9 16.5 9s-3 5.5-7.5 5.5S1.5 9 1.5 9z" stroke="#666" strokeWidth="1.3"/>
                    <circle cx="9" cy="9" r="2.5" stroke="#666" strokeWidth="1.3"/>
                    {!showPass && <line x1="2.5" y1="2.5" x2="15.5" y2="15.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>}
                  </svg>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(255,56,60,0.06)', border: '1px solid rgba(255,56,60,0.15)',
                borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                animation: 'loginShake 0.4s ease',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="#FF383C" strokeWidth="1.5"/><path d="M9 5.5v4M9 12v.5" stroke="#FF383C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 13, color: '#FF383C', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Login button */}
            <button className="login-btn-submit" type="submit" disabled={loading || !username || !password}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 14, border: 'none', marginTop: 2,
                background: loading || !username || !password ? 'rgba(116,116,128,0.12)' : 'linear-gradient(135deg, #4438AD 0%, #6658E1 50%, #8B5CF6 100%)',
                color: loading || !username || !password ? '#8E8E93' : 'white',
                fontSize: 15, fontWeight: 600, fontFamily: font, cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                boxShadow: !loading && username && password ? '0 8px 24px rgba(68,56,173,0.35)' : 'none',
                transform: loading ? 'scale(0.97)' : 'scale(1)',
                letterSpacing: 0.5,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5"/>
                    <path d="M16 9a7 7 0 00-7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#B0AEC4' }}>Atlas Healthcare Dashboard v2.0</p>
            <p style={{ fontSize: 10, color: '#D0CFDF', marginTop: 4 }}>Powered by Atlas HomeCare Platform</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loginFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(5deg); }
          66% { transform: translateY(-6px) rotate(-3deg); }
        }
        @keyframes loginOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes loginOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.2); }
        }
        @keyframes loginOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes loginPulse {
          0%, 100% { box-shadow: 0 0 60px 10px rgba(143,134,251,0.2); }
          50% { box-shadow: 0 0 80px 20px rgba(143,134,251,0.35); }
        }
        @keyframes loginTitle {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginStatPop {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes loginFormSlide {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes loginEcg {
          to { stroke-dashoffset: 0; }
        }
        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loginDonutDraw {
          from { stroke-dasharray: 0 302; }
        }
        @keyframes loginBarGrow {
          from { height: 0; opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes loginLineDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes loginDotPop {
          from { opacity: 0; r: 0; }
          to { opacity: 1; }
        }
        .login-input-wrap:hover {
          border-color: rgba(139,92,246,0.3) !important;
          box-shadow: 0 0 0 4px rgba(139,92,246,0.04) !important;
          background: rgba(255,255,255,0.9) !important;
        }
        .login-pill:hover {
          background: rgba(139,92,246,0.08) !important;
          border-color: rgba(139,92,246,0.2) !important;
          transform: translateY(-1px);
        }
        .login-pill { transition: all 0.2s ease; }
        .login-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01) !important;
          box-shadow: 0 12px 32px rgba(68,56,173,0.45) !important;
          filter: brightness(1.08);
        }
        .login-btn-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.98) !important;
        }
        .login-btn-submit { transition: all 0.3s cubic-bezier(.22,1,.36,1); }
        .login-eye:hover { opacity: 0.8 !important; transform: scale(1.15); }
        .login-eye { transition: all 0.15s ease; }
        .login-glass-card {
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .login-glass-card:hover {
          box-shadow: 0 12px 40px rgba(30,27,57,0.1), inset 0 1px 0 rgba(255,255,255,0.9) !important;
          border-color: rgba(255,255,255,0.9) !important;
        }
      `}</style>
    </div>
  );
}
