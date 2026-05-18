import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { startInterview, submitAnswer, endInterview } from '../api'

export default function Interview() {
  const [messages, setMessages] = useState([])
  const [answer, setAnswer] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const start = async () => {
      setLoading(true)
      try {
        const res = await startInterview()
        setSessionId(res.data.session_id)
        setMessages([{ role: 'assistant', content: res.data.message }])
      } catch (err) {
        const msg = err.response?.data?.detail || 'Failed to start interview.'
        setError(msg)
      }
      setLoading(false)
    }
    start()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleAnswer = async () => {
    if (!answer.trim() || loading) return
    const userMsg = { role: 'user', content: answer }
    setMessages(prev => [...prev, userMsg])
    setAnswer('')
    setLoading(true)
    setError('')
    try {
      const res = await submitAnswer(sessionId, answer)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }])
    } catch (err) {
      setError(err.response?.data?.detail || 'Error submitting answer. Please try again.')
    }
    setLoading(false)
  }

  const handleEnd = async () => {
  if (!window.confirm('End the interview and get your score?')) return
  setEnding(true)
  try {
    await endInterview(sessionId)
    navigate(`/summary/${sessionId}`)
  } catch (err) {
    setError(err.response?.data?.detail || 'Please answer at least one question before ending the interview.')
  }
  setEnding(false)
}

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAnswer()
    }
  }

  if (error && messages.length === 0) {
    return (
      <div style={styles.errorPage}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>⚠️ {error}</p>
          <button style={styles.btn} onClick={() => navigate('/upload')}>
            Go Back to Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎯 PrepMate Interview</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.historyBtn} onClick={() => navigate('/history')}>
            History
          </button>
          <button style={styles.endBtn} onClick={handleEnd} disabled={ending || !sessionId}>
            {ending ? 'Ending...' : 'End Interview'}
          </button>
        </div>
      </div>

      {error && <p style={styles.errorBanner}>⚠️ {error}</p>}

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'assistant' ? styles.aiMsg : styles.userMsg}>
            <span style={styles.role}>{msg.role === 'assistant' ? '🤖 AI' : '👤 You'}</span>
            <p style={styles.msgText}>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div style={styles.aiMsg}>
            <span style={styles.role}>🤖 AI</span>
            <p style={styles.msgText}>
              <span style={styles.dot1}>●</span>
              <span style={styles.dot2}>●</span>
              <span style={styles.dot3}>●</span>
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          style={styles.textarea}
          placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={loading || !sessionId}
        />
        <button style={styles.sendBtn} onClick={handleAnswer} disabled={loading || !sessionId}>
          Send
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const dot = {
  display: 'inline-block',
  fontSize: '18px',
  margin: '0 2px',
  animation: 'blink 1.2s infinite',
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { margin: 0, color: '#2563eb' },
  endBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  historyBtn: { padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  chatBox: { flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#f8fafc' },
  aiMsg: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', maxWidth: '85%' },
  userMsg: { background: '#2563eb', color: 'white', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', maxWidth: '85%', marginLeft: 'auto' },
  role: { fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', opacity: 0.7 },
  msgText: { margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  inputRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  textarea: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none' },
  sendBtn: { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  errorBanner: { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '14px' },
  errorPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  errorCard: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' },
  errorText: { color: '#dc2626', marginBottom: '20px' },
  btn: { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  dot1: { ...dot, animationDelay: '0s' },
  dot2: { ...dot, animationDelay: '0.2s' },
  dot3: { ...dot, animationDelay: '0.4s' },
}