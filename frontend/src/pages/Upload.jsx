import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadResume } from '../api'
import Navbar from '../components/Navbar'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file.')
    setError('')
    setLoading(true)
    try {
      await uploadResume(file)
      navigate('/interview')
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.')
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Upload Your Resume</h2>
          <p style={styles.subtitle}>Upload your resume PDF to start the AI mock interview</p>

          <div style={styles.uploadBox}>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              style={styles.fileInput}
            />
            {file && <p style={styles.fileName}>📄 {file.name}</p>}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Start Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', width: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 8px' },
  subtitle: { color: '#64748b', marginBottom: '24px' },
  uploadBox: { border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '30px', textAlign: 'center', marginBottom: '16px' },
  fileInput: { cursor: 'pointer' },
  fileName: { color: '#2563eb', marginTop: '8px' },
  button: { width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '13px', marginBottom: '10px' },
}