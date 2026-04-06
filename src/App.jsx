import { useState, createContext } from 'react'
import './index.css'
import Dashboard from './pages/Dashboard'
import VitalSign from './pages/VitalSign'
import HomeVisit from './pages/HomeVisit'
import HomeVisitReport from './pages/HomeVisitReport'
import Medication from './pages/Medication'
import VideoCall from './pages/VideoCall'
import PatientProfile from './pages/PatientProfile'

export const CallContext = createContext(null);
export const PatientContext = createContext(null);

import imgSidebarBg from './assets/images/sidebar-bg.jpg'
import imgProfile from './assets/images/profile.png'
import iconSidebarChart from './assets/icons/sidebar-chart.svg'
import iconSidebarHeart from './assets/icons/sidebar-heart.svg'
import iconSidebarHouse from './assets/icons/sidebar-house.svg'
import iconSidebarLogout from './assets/icons/sidebar-logout.svg'
import iconSidebarClipboard from './assets/icons/sidebar-clipboard.svg'
import iconSidebarPills from './assets/icons/sidebar-pills-figma.svg'

const font = "'IBM Plex Sans Thai Looped', sans-serif";

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [callPatient, setCallPatient] = useState(null)

  const navItems = [
    { id: 'dashboard', icon: iconSidebarChart, label: 'ภาพรวม' },
    { id: 'vitalsign', icon: iconSidebarHeart, label: 'Vitalsign' },
    { id: 'homevisit', icon: iconSidebarHouse, label: 'เยี่ยมบ้าน' },
    { id: 'report', icon: iconSidebarClipboard, label: 'รายงานเยี่ยมบ้าน' },
    { id: 'medication', icon: iconSidebarPills, label: 'ส่งยาที่บ้าน' },
  ]

  const [selectedPatient, setSelectedPatient] = useState(null)

  return (
    <CallContext.Provider value={{ callPatient, startCall: setCallPatient }}>
    <PatientContext.Provider value={{ openPatient: setSelectedPatient }}>
    <div className="app">
      {/* ── Sidebar — Figma-accurate ── */}
      <aside style={{ width: 250, flexShrink: 0, padding: 16 }}>
        <div style={{
          height: '100%', borderRadius: 24, overflow: 'hidden',
          position: 'relative', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
        }}>
          {/* Background layers */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #4438AD 0%, #1C1747 100%)', borderRadius: 24 }} />
          <img src={imgSidebarBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, borderRadius: 24 }} />

          {/* Content with glass overlay */}
          <div style={{
            position: 'relative', height: '100%',
            backdropFilter: 'blur(40px)',
            background: 'linear-gradient(180deg, rgba(68,56,173,0.5) 0%, rgba(28,23,71,0.5) 100%)',
            display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden',
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'white', boxShadow: '0 0 24px 4px rgba(143,134,251,0.35)', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'white', width: 91 }}>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>ATLAS</span>
                <span style={{ fontSize: 14, fontFamily: "'Inter', sans-serif", letterSpacing: 2.24 }}>Dashboad</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: 200 }} />

            {/* Navigation */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
              <span style={{ fontSize: 10, color: 'white', fontFamily: font }}>Menu</span>
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: 8, borderRadius: 100, border: 'none',
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      fontFamily: font, fontSize: 14, color: isActive ? '#4438AD' : 'white',
                      background: isActive ? 'white' : 'transparent',
                      boxShadow: isActive ? '0 4px 4px rgba(0,0,0,0.1)' : 'none',
                      ...(isActive ? { border: '1px solid rgba(255,255,255,0.6)' } : {}),
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: isActive ? 'linear-gradient(180deg, #8B81F2, #6658E1)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 6, overflow: 'hidden', flexShrink: 0,
                    }}>
                      <img src={item.icon} alt="" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User card at bottom */}
            <div style={{ padding: 12 }}>
              <div style={{
                backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                padding: 16, boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative blurs */}
                <div style={{ position: 'absolute', left: -21, top: -21, width: 74, height: 74, borderRadius: '50%', background: 'rgba(143,134,251,0.3)', filter: 'blur(20px)' }} />
                <div style={{ position: 'absolute', left: 69, top: 55, width: 74, height: 74, borderRadius: '50%', background: 'rgba(143,134,251,0.3)', filter: 'blur(20px)' }} />

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', position: 'relative', flexShrink: 0 }}>
                    <img src={imgProfile} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#34C759' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 68 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'white', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>สมชาย ใจดี</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>ผู้ดูแลระบบ</span>
                  </div>
                </div>

                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
                }}>
                  <img src={iconSidebarLogout} alt="" style={{ width: 12, height: 12 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main — fills remaining width ── */}
      <div className="main">
        <div className="main-inner">
          <div className="page">
            {selectedPatient ? (
              <PatientProfile patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            ) : (
              <>
                {activePage === 'dashboard' && <Dashboard />}
                {activePage === 'vitalsign' && <VitalSign />}
                {activePage === 'homevisit' && <HomeVisit />}
                {activePage === 'report' && <HomeVisitReport />}
                {activePage === 'medication' && <Medication />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    {callPatient && <VideoCall patient={callPatient} onClose={() => setCallPatient(null)} />}
    </PatientContext.Provider>
    </CallContext.Provider>
  )
}

export default App
