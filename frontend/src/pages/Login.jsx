import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) return setError('Please fill in all fields.')
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password)
        alert('Account created! Please login.')
        setIsRegister(false)
      } else {
        const res = await login(email, password)
        localStorage.setItem('token', res.data.access_token)
        navigate('/upload')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⦿</span>
          <h1 style={styles.brandName}>PrepMate AI</h1>
          <p style={styles.brandSub}>AI-powered mock interviewer</p>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>{isRegister ? 'Create account' : 'Welcome back'}</h2>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKey}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />

        {error && <div style={styles.errorBox}>{error}</div>}

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
        </button>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span style={styles.toggleLink} onClick={() => { setIsRegister(!isRegister); setError('') }}>
            {isRegister ? ' Login' : ' Register'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  card: { background: 'white', padding: '40px', borderRadius: '16px', width: '380px', border: '0.5px solid #e2e8f0' },
  brand: { textAlign: 'center', marginBottom: '24px' },
  brandIcon: { fontSize: '32px', color: '#2563eb' },
  brandName: { fontSize: '22px', fontWeight: '700', color: '#2563eb', margin: '6px 0 4px', letterSpacing: '-0.5px' },
  brandSub: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  divider: { height: '0.5px', background: '#f1f5f9', margin: '0 0 24px' },
  heading: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '20px', textAlign: 'center' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '14px', borderRadius: '8px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#0f172a' },
  btn: { width: '100%', padding: '11px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '4px' },
  errorBox: { background: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '0.5px solid #fecaca' },
  toggle: { textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' },
  toggleLink: { color: '#2563eb', cursor: 'pointer', fontWeight: '600' }
}