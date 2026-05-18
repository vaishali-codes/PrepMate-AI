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
    const fetch = async () => {
      try {
        const res = await getSessionDetail(sessionId)
        setSession(res.data)
      } catch {
        alert('Failed to load summary.')
      }
      setLoading(false)
    }
    fetch()
  }, [sessionId])

  const scoreColor = (score) => {
    if (score >= 8) return '#15803d'
    if (score >= 5) return '#d97706'
    return '#ef4444'
  }

  const scoreLabel = (score) => {
    if (score >= 8) return 'Excellent'
    if (score >= 5) return 'Average'
    return 'Needs work'
  }

  if (loading) return <div style={styles.center}>Loading summary...</div>
  if (!session) return <div style={styles.center}>Session not found.</div>

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Interview complete</h2>

          {session.score !== null && (
            <div style={styles.scoreCard}>
              <div style={styles.scoreCircle}>
                <span style={{ ...styles.scoreNum, color: scoreColor(session.score) }}>{session.score}</span>
                <span style={styles.scoreDen}>/10</span>
              </div>
              <div>
                <p style={{ ...styles.scoreTag, color: scoreColor(session.score) }}>{scoreLabel(session.score)}</p>
                <p style={styles.scoreDesc}>Overall performance score</p>
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Performance summary</h3>
            <p style={styles.summaryText}>{session.summary}</p>
          </div>

          <div style={styles.btnRow}>
            <button style={styles.primaryBtn} onClick={() => navigate('/upload')}>
              Start new interview
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate('/history')}>
              View history
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' },
  page: { padding: '40px 24px', maxWidth: '720px', margin: '0 auto' },
  card: { background: 'white', borderRadius: '16px', padding: '40px', border: '0.5px solid #e2e8f0' },
  title: { fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  scoreCard: { display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '0.5px solid #e2e8f0', marginBottom: '28px' },
  scoreCircle: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  scoreNum: { fontSize: '56px', fontWeight: '700', lineHeight: 1 },
  scoreDen: { fontSize: '20px', color: '#94a3b8', fontWeight: '400' },
  scoreTag: { fontSize: '16px', fontWeight: '600', margin: '0 0 4px' },
  scoreDesc: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  section: { background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '0.5px solid #e2e8f0' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' },
  summaryText: { whiteSpace: 'pre-wrap', lineHeight: '1.75', color: '#334155', fontSize: '14px', margin: 0 },
  btnRow: { display: 'flex', gap: '12px' },
  primaryBtn: { flex: 1, padding: '11px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  secondaryBtn: { flex: 1, padding: '11px', background: 'white', color: '#475569', border: '0.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
}