import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadResume } from '../api'
import Navbar from '../components/Navbar'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const navigate = useNavigate()

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file.')
    setError('')
    setLoading(true)
    try {
      await uploadResume(file)
      navigate('/interview')
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    }
    setLoading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') setFile(dropped)
    else setError('Only PDF files are accepted.')
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <span style={{ fontSize: '32px' }}>📄</span>
          </div>
          <h2 style={styles.title}>Upload your resume</h2>
          <p style={styles.subtitle}>The AI interviewer will read your resume and ask relevant questions</p>

          <div
            style={{ ...styles.dropZone, ...(dragging ? styles.dropZoneActive : {}) }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <div style={styles.fileSelected}>
                <span style={{ fontSize: '24px' }}>📄</span>
                <div>
                  <p style={styles.fileName}>{file.name}</p>
                  <p style={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button style={styles.removeBtn} onClick={() => setFile(null)}>✕</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={styles.dropText}>Drag and drop your PDF here</p>
                <p style={styles.dropOr}>or</p>
                <label style={styles.browseBtn}>
                  Browse file
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
            )}
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Start interview →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', padding: '24px' },
  card: { background: 'white', padding: '40px', borderRadius: '16px', width: '460px', border: '0.5px solid #e2e8f0', textAlign: 'center' },
  iconWrap: { width: '56px', height: '56px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title: { fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#64748b', marginBottom: '28px', lineHeight: '1.6' },
  dropZone: { border: '1.5px dashed #e2e8f0', borderRadius: '12px', padding: '32px 20px', marginBottom: '16px', background: '#f8fafc', transition: 'all 0.15s' },
  dropZoneActive: { borderColor: '#2563eb', background: '#eff6ff' },
  dropText: { fontSize: '14px', color: '#475569', marginBottom: '8px' },
  dropOr: { fontSize: '12px', color: '#94a3b8', marginBottom: '12px' },
  browseBtn: { display: 'inline-block', padding: '8px 20px', background: 'white', border: '0.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#2563eb', fontWeight: '500' },
  fileSelected: { display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' },
  fileName: { fontSize: '14px', fontWeight: '500', color: '#0f172a', margin: 0 },
  fileSize: { fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' },
  removeBtn: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', padding: '4px' },
  errorBox: { background: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '0.5px solid #fecaca', textAlign: 'left' },
  btn: { width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
}