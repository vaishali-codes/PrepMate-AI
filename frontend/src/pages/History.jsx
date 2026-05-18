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
        setSessions(res.data.sessions)  // ← fixed
      } catch {
        alert('Failed to load sessions.')
      }
      setLoading(false)
    }
    fetchSessions()
  }, [])

  const handleRowClick = async (session) => {
    if (selected?.session_id === session.session_id) {  // ← fixed
      setSelected(null)
      setDetail(null)
      return
    }
    setSelected(session)
    setDetailLoading(true)
    try {
      const res = await getSessionDetail(session.session_id)  // ← fixed
      setDetail(res.data)
    } catch {
      alert('Failed to load session detail.')
    }
    setDetailLoading(false)
  }

  const getScoreColor = (score) => {
    if (score === null) return '#94a3b8'
    if (score >= 8) return '#16a34a'
    if (score >= 5) return '#d97706'
    return '#ef4444'
  }

  const formatDate = (str) => {
    return new Date(str).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>📋 Interview History</h2>
          <button style={styles.btn} onClick={() => navigate('/upload')}>
            New Interview
          </button>
        </div>

        {loading ? (
          <p style={styles.muted}>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div style={styles.empty}>
            <p>No interviews yet.</p>
            <button style={styles.btn} onClick={() => navigate('/upload')}>
              Start your first interview
            </button>
          </div>
        ) : (
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <>
                    <tr
                      key={s.session_id}
                      style={{ ...styles.row, background: selected?.session_id === s.session_id ? '#eff6ff' : 'white' }}
                    >
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{formatDate(s.created_at)}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: s.status === 'ended' ? '#dcfce7' : '#fef9c3',
                          color: s.status === 'ended' ? '#16a34a' : '#854d0e'
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 'bold', color: getScoreColor(s.score) }}>
                          {s.score !== null ? `${s.score}/10` : '—'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.viewBtn} onClick={() => handleRowClick(s)}>
                          {selected?.session_id === s.session_id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {selected?.session_id === s.session_id && (
                      <tr key={`detail-${s.session_id}`}>
                        <td colSpan={5} style={styles.detailCell}>
                          {detailLoading ? (
                            <p style={styles.muted}>Loading...</p>
                          ) : detail ? (
                            <div>
                              <h4 style={styles.detailTitle}>Performance Summary</h4>
                              <p style={styles.summaryText}>{detail.summary || 'No summary available.'}</p>

                              <h4 style={{ ...styles.detailTitle, marginTop: '16px' }}>Conversation</h4>
                              {detail.messages?.length > 0 ? detail.messages.map((msg, idx) => (
                                <div key={idx} style={msg.role === 'assistant' ? styles.aiMsg : styles.userMsg}>
                                  <span style={styles.role}>{msg.role === 'assistant' ? '🤖 AI' : '👤 You'}</span>
                                  <p style={styles.msgText}>{msg.content}</p>
                                </div>
                              )) : <p style={styles.muted}>No messages in this session.</p>}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '30px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, color: '#1e293b' },
  btn: { padding: '8px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontWeight: '600' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  row: { cursor: 'pointer' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  viewBtn: { padding: '5px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  detailCell: { padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  detailTitle: { margin: '0 0 10px', color: '#1e293b', fontSize: '14px' },
  summaryText: { whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#334155', fontSize: '14px', margin: 0 },
  aiMsg: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', maxWidth: '85%' },
  userMsg: { background: '#2563eb', color: 'white', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', maxWidth: '85%', marginLeft: 'auto' },
  role: { fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px', opacity: 0.7 },
  msgText: { margin: 0, lineHeight: '1.5', fontSize: '13px', whiteSpace: 'pre-wrap' },
  muted: { color: '#94a3b8', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '60px', color: '#64748b' },
}