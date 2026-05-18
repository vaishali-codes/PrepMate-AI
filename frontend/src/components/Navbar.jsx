import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <span style={styles.brand} onClick={() => navigate('/upload')}>
        <span style={styles.brandIcon}>⦿</span> PrepMate AI
      </span>
      <div style={styles.right}>
        <button
          style={{ ...styles.link, ...(isActive('/upload') ? styles.linkActive : {}) }}
          onClick={() => navigate('/upload')}
        >
          New Interview
        </button>
        <button
          style={{ ...styles.link, ...(isActive('/history') ? styles.linkActive : {}) }}
          onClick={() => navigate('/history')}
        >
          History
        </button>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: { background: 'white', borderBottom: '0.5px solid #e2e8f0', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontWeight: '600', fontSize: '16px', cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' },
  brandIcon: { fontSize: '20px' },
  right: { display: 'flex', gap: '4px', alignItems: 'center' },
  link: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px', padding: '6px 12px', borderRadius: '6px', fontWeight: '400' },
  linkActive: { color: '#2563eb', background: '#eff6ff' },
  logout: { padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginLeft: '8px' }
}