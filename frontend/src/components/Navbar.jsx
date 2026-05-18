import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={styles.nav}>
      <span style={styles.brand} onClick={() => navigate('/upload')}>🎯 PrepMate AI</span>
      <div style={styles.right}>
        <button style={styles.link} onClick={() => navigate('/upload')}>New Interview</button>
        <button style={styles.link} onClick={() => navigate('/history')}>History</button>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

const styles = {
  nav: { background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', color: '#2563eb' },
  right: { display: 'flex', gap: '12px', alignItems: 'center' },
  link: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px' },
  logout: { padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }
}