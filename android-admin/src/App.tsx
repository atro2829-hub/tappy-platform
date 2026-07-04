import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const { session, loading } = useAuth()
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', color: '#6B7280', direction: 'rtl' }}>جاري التحميل...</div>
  }
  return session ? <Dashboard /> : <Login />
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
