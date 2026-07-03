const font = "'IBM Plex Sans Thai Looped', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';

export default function ComingSoon({ icon, title }) {
  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: 24,
        boxShadow: '0 2px 6px rgba(13,10,44,0.08)',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        textAlign: 'center', maxWidth: 420,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          background: 'linear-gradient(180deg, #8B81F2, #6658E1)',
          boxShadow: '0 8px 24px rgba(102,88,225,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <img src={icon} alt="" style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: BLACK, fontFamily: font }}>{title}</div>
        <div style={{ fontSize: 14, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>
          โมดูลนี้อยู่ระหว่างการพัฒนา<br />เร็ว ๆ นี้
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#6658E1', fontFamily: font,
          background: 'rgba(102,88,225,0.1)', border: '1px solid rgba(102,88,225,0.25)',
          borderRadius: 100, padding: '6px 14px', letterSpacing: 0.5,
        }}>
          COMING SOON
        </div>
      </div>
    </div>
  );
}
