import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">T</div>
          <h1>Tappy</h1>
          <p>Global Top-ups & Gift Cards</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              dir="ltr"
            />
          </div>
          
          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-title">حسابات تجريبية:</p>
          <div className="demo-grid">
            <button onClick={() => { setEmail('customer@tappy.test'); setPassword('password') }} className="demo-btn">
              عميل
            </button>
            <button onClick={() => { setEmail('business@tappy.test'); setPassword('password') }} className="demo-btn">
              أعمال
            </button>
            <button onClick={() => { setEmail('reseller@tappy.test'); setPassword('password') }} className="demo-btn">
              موزع
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          padding: 20px;
          direction: rtl;
        }
        .login-card {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          font-size: 48px;
          font-weight: 900;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .logo h1 {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px;
        }
        .logo p {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 16px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-group input:focus {
          outline: none;
          border-color: #10B981;
        }
        .error {
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary:hover:not(:disabled) {
          background: #059669;
        }
        .demo-accounts {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
        }
        .demo-title {
          font-size: 12px;
          color: #6B7280;
          text-align: center;
          margin-bottom: 12px;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .demo-btn {
          padding: 8px;
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          color: #374151;
        }
        .demo-btn:hover {
          background: #E5E7EB;
        }
      `}</style>
    </div>
  )
}
