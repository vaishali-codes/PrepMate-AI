import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSessionDetail } from '../api'
import Navbar from '../components/Navbar'

export default function Summary() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getSessionDetail(sessionId)
        setSession(res.data)
      } catch (err) {
        alert('Failed to load summary.')
      }
      setLoading(false)
    }
    fetchSession()
  }, [sessionId])

  const getScoreColor = (score) => {
    if (score >= 8) return '#16a34a'
    if (score >= 5) return '#d97706'
    return '#ef4444'
  }

  if (loading) return <div style={styles.center}>Loading summary...</div>
  if (!session) return <div style={styles.center}>Session not found.</div>

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Interview Complete! 🎉</h1>

          {session.score !== null && (
            <div style={styles.scoreBox}>
              <p style={styles.scoreLabel}>Your Score</p>
              <p style={{ ...styles.score, color: getScoreColor(session.score) }}>
                {session.score}/10
              </p>
            </div>
          )}

          <div style={styles.summaryBox}>
            <h3 style={styles.summaryTitle}>Performance Summary</h3>
            <p style={styles.summaryText}>{session.summary}</p>
          </div>

          <button style={styles.primaryBtn} onClick={() => navigate('/upload')}>
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  container: { padding: '40px 20px', background: '#f0f4f8', minHeight: '100vh' },
  card: { maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', color: '#2563eb', marginBottom: '24px' },
  scoreBox: { textAlign: 'center', marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' },
  scoreLabel: { fontSize: '16px', color: '#64748b', margin: '0 0 8px' },
  score: { fontSize: '64px', fontWeight: 'bold', margin: 0 },
  summaryBox: { background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  summaryTitle: { margin: '0 0 12px', color: '#1e293b' },
  summaryText: { whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#334155', margin: 0 },
  primaryBtn: { width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
}