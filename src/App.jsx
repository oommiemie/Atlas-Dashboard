import { useState, createContext, Fragment } from 'react'
import './index.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VitalSign from './pages/VitalSign'
import HomeVisit from './pages/HomeVisit'
import HomeVisitReport from './pages/HomeVisitReport'
import Medication from './pages/Medication'
import VideoCall from './pages/VideoCall'
import PatientProfile from './pages/PatientProfile'
import ComingSoon from './components/ComingSoon'
import ChatWidget from './components/ChatWidget'
import SmartVillage from './pages/smartvillage'
import GuardMonitor from './pages/smartvillage/GuardMonitor'

export const CallContext = createContext(null);
export const PatientContext = createContext(null);
export const UserContext = createContext(null);

import imgSidebarBg from './assets/images/sidebar-bg.jpg'
import imgProfile from './assets/images/profile.png'
import iconSidebarChart from './assets/icons/sidebar-chart.svg'
import iconSidebarHeart from './assets/icons/sidebar-heart.svg'
import iconSidebarHouse from './assets/icons/sidebar-house.svg'
import iconSidebarLogout from './assets/icons/sidebar-logout.svg'
import iconSidebarClipboard from './assets/icons/sidebar-clipboard.svg'
import iconSidebarPills from './assets/icons/sidebar-pills-figma.svg'
import iconSidebarVillage from './assets/icons/sidebar-village.svg'
import iconSidebarFamily from './assets/icons/sidebar-family.svg'

const font = "'IBM Plex Sans Thai Looped', sans-serif";

function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [callPatient, setCallPatient] = useState(null)

  const navGroups = [
    {
      label: 'Menu',
      items: [
        { id: 'dashboard', icon: iconSidebarChart, label: 'ภาพรวม' },
        { id: 'vitalsign', icon: iconSidebarHeart, label: 'Vitalsign' },
        { id: 'homevisit', icon: iconSidebarHouse, label: 'เยี่ยมบ้าน' },
        { id: 'report', icon: iconSidebarClipboard, label: 'รายงานเยี่ยมบ้าน' },
        { id: 'medication', icon: iconSidebarPills, label: 'ส่งยาที่บ้าน' },
      ],
    },
    {
      label: 'Smart',
      items: [
        { id: 'smartfamily', icon: iconSidebarFamily, label: 'Smart Family' },
        /* ไม่มี submenu — สลับ section ภายในโมดูลผ่าน tabs ใน hero */
        { id: 'smartvillage', icon: iconSidebarVillage, label: 'Smart Village', target: 'sv-overview', match: 'sv-' },
      ],
    },
  ]

  const [selectedPatient, setSelectedPatient] = useState(null)

  /* nav ต้องพาออกจากหน้า drill-down เสมอ — ไม่งั้น PatientProfile ค้างทับหน้าใหม่ */
  const goPage = (id) => { setSelectedPatient(null); setActivePage(id); }

  if (!user) return <Login onLogin={setUser} />;
  /* บัญชี รปภ. — เข้าจอเฝ้าระวังตรง ๆ (login เดียวกับ dashboard, ไม่มีหน้า login แยก) */
  if (user.role === 'guard') return <GuardMonitor standalone guardUsername={user.guardUsername} onExit={() => setUser(null)} />;

  return (
    <UserContext.Provider value={user}>
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
                <span style={{ fontSize: 14, fontFamily: "'Inter', sans-serif", letterSpacing: 2.24 }}>Dashboard</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', width: 200 }} />

            {/* Navigation */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
              {navGroups.map((group, gi) => (
                <Fragment key={group.label}>
                  {gi > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginTop: 8 }} />}
                  <span style={{ fontSize: 10, color: 'white', fontFamily: font }}>{group.label}</span>
                  {group.items.map((item) => {
                const isParent = !!item.children;
                const parentOpen = isParent && activePage.startsWith('sv-');
                const isActive = isParent ? parentOpen : item.match ? activePage.startsWith(item.match) : activePage === item.id;
                return (
                  <Fragment key={item.id}>
                  <button
                    className={`hover-nav${isActive && !isParent ? ' sidebar-nav-active' : ''}`}
                    onClick={() => goPage(isParent ? item.children[0].id : item.target || item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: 8, borderRadius: 100, border: 'none',
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      fontFamily: font, fontSize: 14,
                      color: isActive && !isParent ? '#4438AD' : 'white',
                      background: isActive && !isParent ? 'white' : parentOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
                      boxShadow: isActive && !isParent ? '0 4px 4px rgba(0,0,0,0.1)' : 'none',
                      ...(isActive && !isParent ? { border: '1px solid rgba(255,255,255,0.6)' } : {}),
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
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isParent && (
                      <svg width="9" height="6" viewBox="0 0 9 6" fill="none" style={{ marginRight: 6, transition: 'transform 0.25s ease', transform: parentOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <path d="M1 1L4.5 4.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  {isParent && parentOpen && (
                    <div className="anim-expand" style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 20, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 19, top: 4, bottom: 4, width: 1.5, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
                      {item.children.map((c) => {
                        const subActive = activePage === c.id;
                        return (
                          <button
                            key={c.id}
                            className={`hover-nav${subActive ? ' sidebar-nav-active' : ''}`}
                            onClick={() => goPage(c.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 10px 6px 14px', borderRadius: 100, border: 'none',
                              cursor: 'pointer', width: '100%', textAlign: 'left',
                              fontFamily: font, fontSize: 12.5,
                              color: subActive ? '#4438AD' : 'rgba(255,255,255,0.75)',
                              background: subActive ? 'white' : 'transparent',
                              boxShadow: subActive ? '0 4px 4px rgba(0,0,0,0.1)' : 'none',
                              position: 'relative',
                            }}
                          >
                            <span style={{
                              width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                              background: subActive ? 'linear-gradient(180deg, #8B81F2, #6658E1)' : 'rgba(255,255,255,0.35)',
                            }} />
                            <span>{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  </Fragment>
                );
                  })}
                </Fragment>
              ))}
            </div>

            {/* User card at bottom */}
            <div style={{ padding: 12 }}>
              <div style={{
                backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative blurs */}
                <div style={{ position: 'absolute', left: -21, top: -21, width: 74, height: 74, borderRadius: '50%', background: 'rgba(143,134,251,0.25)', filter: 'blur(20px)' }} />
                <div style={{ position: 'absolute', right: -10, bottom: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(116,185,255,0.2)', filter: 'blur(18px)' }} />

                {/* Profile row */}
                <div style={{ padding: '14px 14px 10px', display: 'flex', gap: 10, alignItems: 'center', position: 'relative' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', position: 'relative', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                    <img src={imgProfile} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: '50%', background: '#34C759', border: '2px solid rgba(28,23,71,0.8)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'white', fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginTop: 2 }}>{user.title}</div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 14px' }} />

                {/* Logout button */}
                <div
                  onClick={() => setUser(null)}
                  style={{
                    padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <img src={iconSidebarLogout} alt="" style={{ width: 13, height: 13, opacity: 0.8 }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: font }}>ออกจากระบบ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main — fills remaining width ── */}
      <div className="main">
        <div className="main-inner">
          <div className="page" key={selectedPatient ? 'patient' : activePage}>
            {selectedPatient ? (
              <PatientProfile patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            ) : (
              <>
                {activePage === 'dashboard' && <Dashboard />}
                {activePage === 'vitalsign' && <VitalSign />}
                {activePage === 'homevisit' && <HomeVisit />}
                {activePage === 'report' && <HomeVisitReport />}
                {activePage === 'medication' && <Medication />}
                {activePage.startsWith('sv-') && <SmartVillage section={activePage} onNavigate={setActivePage} />}
                {activePage === 'smartfamily' && <ComingSoon icon={iconSidebarFamily} title="Smart Family" />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    {callPatient && <VideoCall patient={callPatient} onClose={() => setCallPatient(null)} />}
    <ChatWidget />
    </PatientContext.Provider>
    </CallContext.Provider>
    </UserContext.Provider>
  )
}

export default App
