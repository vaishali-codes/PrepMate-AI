import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions, getSessionDetail } from '../api'
import Navbar from '../components/Navbar'

export default function History() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getSessions()
        setSessions(res.data.sessions)
      } catch {
        alert('Failed to load sessions.')
      }
      setLoading(false)
    }
    fetchSessions()
  }, [])

  const handleView = async (session) => {
    if (selected?.session_id === session.session_id) {
      setSelected(null)
      setDetail(null)
      return
    }
    setSelected(session)
    setDetailLoading(true)
    try {
      const res = await getSessionDetail(session.session_id)
      setDetail(res.data)
    } catch {
      alert('Failed to load session detail.')
    }
    setDetailLoading(false)
  }

  const scoreColor = (score) => {
    if (score === null) return '#94a3b8'
    if (score >= 8) return '#15803d'
    if (score >= 5) return '#d97706'
    return '#ef4444'
  }

  const formatDate = (str) => new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.page}>

        <div style={styles.topRow}>
          <h2 style={styles.pageTitle}>Interview history</h2>
          <button style={styles.newBtn} onClick={() => navigate('/upload')}>+ New interview</button>
        </div>

        {loading ? (
          <p style={styles.muted}>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '16px' }}>No interviews yet.</p>
            <button style={styles.newBtn} onClick={() => navigate('/upload')}>Start your first interview</button>
          </div>
        ) : (
          <div style={styles.card}>
            {/* Table header */}
            <div style={styles.tableHead}>
              <span style={{ width: '40px' }}>#</span>
              <span style={{ flex: 1 }}>Date</span>
              <span style={{ width: '110px' }}>Status</span>
              <span style={{ width: '80px' }}>Score</span>
              <span style={{ width: '80px' }}>Action</span>
            </div>

            {sessions.map((s, i) => (
              <div key={s.session_id}>
                <div style={{
                  ...styles.tableRow,
                  background: selected?.session_id === s.session_id ? '#eff6ff' : 'white'
                }}>
                  <span style={{ width: '40px', color: '#94a3b8', fontSize: '13px' }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: '14px' }}>{formatDate(s.created_at)}</span>
                  <span style={{ width: '110px' }}>
                    <span style={{
                      ...styles.badge,
                      background: s.status === 'ended' ? '#dcfce7' : '#fef9c3',
                      color: s.status === 'ended' ? '#15803d' : '#854d0e'
                    }}>
                      {s.status}
                    </span>
                  </span>
                  <span style={{ width: '80px', fontWeight: '500', fontSize: '14px', color: scoreColor(s.score) }}>
                    {s.score !== null ? `${s.score}/10` : '—'}
                  </span>
                  <span style={{ width: '80px' }}>
                    <button style={styles.viewBtn} onClick={() => handleView(s)}>
                      {selected?.session_id === s.session_id ? 'Hide' : 'View'}
                    </button>
                  </span>
                </div>

                {selected?.session_id === s.session_id && (
                  <div style={styles.detailPanel}>
                    {detailLoading ? (
                      <p style={styles.muted}>Loading...</p>
                    ) : detail ? (
                      <>
                        {detail.score !== null && (
                          <div style={styles.scoreRow}>
                            <span style={styles.scoreLabel}>Score</span>
                            <span style={{ fontSize: '28px', fontWeight: '600', color: scoreColor(detail.score) }}>
                              {detail.score}/10
                            </span>
                          </div>
                        )}

                        <h4 style={styles.sectionLabel}>Performance summary</h4>
                        <p style={styles.summaryText}>{detail.summary || 'No summary available.'}</p>

                        <h4 style={{ ...styles.sectionLabel, marginTop: '20px' }}>Conversation</h4>
                        <div style={styles.chatWrap}>
                          {detail.messages?.map((msg, idx) => (
                            <div key={idx} style={msg.role === 'assistant' ? styles.aiMsg : styles.userMsg}>
                              <span style={styles.roleLabel}>{msg.role === 'assistant' ? '🤖 AI' : '👤 You'}</span>
                              <p style={styles.msgText}>{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: '920px', margin: '0 auto', padding: '32px 24px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { fontSize: '20px', fontWeight: '600', color: '#0f172a' },
  newBtn: { padding: '8px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  card: { background: 'white', border: '0.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  tableHead: { display: 'flex', alignItems: 'center', padding: '10px 20px', background: '#f8fafc', borderBottom: '0.5px solid #e2e8f0', fontSize: '11px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '0.5px solid #f1f5f9', cursor: 'default' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  viewBtn: { padding: '5px 14px', background: '#f1f5f9', border: '0.5px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#475569' },
  detailPanel: { padding: '24px', background: '#f8fafc', borderBottom: '0.5px solid #e2e8f0' },
  scoreRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: 'white', borderRadius: '10px', border: '0.5px solid #e2e8f0', width: 'fit-content' },
  scoreLabel: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  sectionLabel: { fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' },
  summaryText: { whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#334155', fontSize: '14px' },
  chatWrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  aiMsg: { background: 'white', border: '0.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', maxWidth: '88%' },
  userMsg: { background: '#2563eb', color: 'white', borderRadius: '10px', padding: '10px 14px', maxWidth: '88%', alignSelf: 'flex-end' },
  roleLabel: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '3px', opacity: 0.65 },
  msgText: { margin: 0, lineHeight: '1.55', fontSize: '13px', whiteSpace: 'pre-wrap' },
  muted: { color: '#94a3b8', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '80px 24px' },
}