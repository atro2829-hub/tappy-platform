import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, formatMoney } from '../lib/supabase'
import { LogOut, Users, DollarSign, Activity, AlertTriangle, CheckCircle, XCircle, Settings, FileText } from 'lucide-react'

export default function Dashboard() {
  const { profile, signOut, isAdmin } = useAuth()
  const [stats, setStats] = useState({ users: 0, transactions: 0, txSuccess: 0, txFailed: 0, volume: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { if (profile) loadData() }, [profile])

  async function loadData() {
    try {
      setLoading(true)
      const [usersRes, txRes, auditRes] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(15),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ])
      
      setUsers(usersRes.data || [])
      const txs = txRes.data || []
      setTransactions(txs)
      setAuditLogs(auditRes.data || [])
      
      setStats({
        users: usersRes.data?.length || 0,
        transactions: txs.length,
        txSuccess: txs.filter(t => t.status === 'success').length,
        txFailed: txs.filter(t => t.status === 'failed').length,
        volume: txs.filter(t => t.status === 'success').reduce((s, t) => s + (t.amount_usd_minor || 0), 0),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">جاري التحميل...</div>
  if (!isAdmin) return (
    <div className="loading">
      <p>⚠️ صلاحيات غير كافية</p>
      <p style={{fontSize: 14, marginTop: 8}}>هذا الحساب لا يملك صلاحيات إدارية</p>
      <button onClick={signOut} style={{marginTop: 20, padding: '8px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer'}}>تسجيل الخروج</button>
    </div>
  )

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Tappy Admin</h1>
          <p>{profile?.name} • {profile?.email}</p>
        </div>
        <button onClick={signOut} className="icon-btn"><LogOut size={22} /></button>
      </header>

      <main className="content">
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <Users size={24} />
                <div><p className="stat-label">المستخدمون</p><p className="stat-value">{stats.users}</p></div>
              </div>
              <div className="stat-card stat-green">
                <Activity size={24} />
                <div><p className="stat-label">المعاملات</p><p className="stat-value">{stats.transactions}</p></div>
              </div>
              <div className="stat-card stat-yellow">
                <DollarSign size={24} />
                <div><p className="stat-label">حجم التداول (USD)</p><p className="stat-value">{formatMoney(stats.volume, 'USD')}</p></div>
              </div>
              <div className="stat-card stat-red">
                <AlertTriangle size={24} />
                <div><p className="stat-label">معاملات فاشلة</p><p className="stat-value">{stats.txFailed}</p></div>
              </div>
            </div>

            <section className="section">
              <h3>أحدث المعاملات</h3>
              {transactions.length === 0 ? <p className="empty">لا توجد معاملات</p> : (
                <div className="list">
                  {transactions.slice(0, 8).map(tx => (
                    <div key={tx.id} className="list-item">
                      <div className={`status-badge status-${tx.status}`}>
                        {tx.status === 'success' ? <CheckCircle size={16} /> : tx.status === 'failed' ? <XCircle size={16} /> : '⏳'}
                      </div>
                      <div className="item-info">
                        <p className="item-title">{tx.recipient_name || tx.recipient}</p>
                        <p className="item-meta">{tx.type} • {tx.country}</p>
                      </div>
                      <div className="item-amount">{formatMoney(tx.amount_usd_minor, 'USD')}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'users' && (
          <section className="section">
            <h3>المستخدمون</h3>
            {users.length === 0 ? <p className="empty">لا يوجد مستخدمون</p> : (
              <div className="list">
                {users.map(u => (
                  <div key={u.id} className="list-item">
                    <div className="avatar">{u.name?.[0]}</div>
                    <div className="item-info">
                      <p className="item-title">{u.name}</p>
                      <p className="item-meta">{u.email} • {u.role}</p>
                    </div>
                    <div className="badges">
                      {u.is_admin && <span className="badge badge-red">Admin</span>}
                      {u.is_business && <span className="badge badge-blue">Business</span>}
                      {u.is_reseller && <span className="badge badge-green">Reseller</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'audit' && (
          <section className="section">
            <h3>سجل التدقيق</h3>
            {auditLogs.length === 0 ? <p className="empty">لا توجد سجلات</p> : (
              <div className="list">
                {auditLogs.map(log => (
                  <div key={log.id} className="list-item">
                    <FileText size={20} />
                    <div className="item-info">
                      <p className="item-title">{log.action}</p>
                      <p className="item-meta">{log.description || log.ip_address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="section">
            <h3>الإعدادات</h3>
            <div className="settings-list">
              <div className="setting-item">
                <Settings size={20} />
                <div><p>العملة الأساسية</p><p className="item-meta">YER (الريال اليمني)</p></div>
              </div>
              <div className="setting-item">
                <Settings size={20} />
                <div><p>العملات المدعومة</p><p className="item-meta">YER, SAR, USD</p></div>
              </div>
              <div className="setting-item">
                <Settings size={20} />
                <div><p>المشروع</p><p className="item-meta">npdpudrjjvcfsfrhvbyc</p></div>
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          <Activity size={20} /> <span>نظرة عامة</span>
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          <Users size={20} /> <span>المستخدمون</span>
        </button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          <FileText size={20} /> <span>التدقيق</span>
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          <Settings size={20} /> <span>الإعدادات</span>
        </button>
      </nav>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Tahoma', sans-serif; }
        .app { min-height: 100vh; background: #F9FAFB; direction: rtl; padding-bottom: 80px; }
        .header { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 20px 16px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 20px; font-weight: 700; }
        .header p { font-size: 12px; opacity: 0.9; }
        .icon-btn { background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; }
        .content { padding: 16px; max-width: 800px; margin: 0 auto; }
        .loading { padding: 40px; text-align: center; color: #6B7280; direction: rtl; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 16px; border-radius: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .stat-blue { color: #3B82F6; }
        .stat-green { color: #10B981; }
        .stat-yellow { color: #F59E0B; }
        .stat-red { color: #EF4444; }
        .stat-label { font-size: 11px; color: #6B7280; }
        .stat-value { font-size: 20px; font-weight: 700; color: #111827; }
        .section { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; }
        .section h3 { font-size: 16px; margin-bottom: 12px; color: #111827; }
        .empty { color: #9CA3AF; text-align: center; padding: 20px; font-size: 14px; }
        .list { display: flex; flex-direction: column; gap: 8px; }
        .list-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #F9FAFB; border-radius: 12px; }
        .status-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .status-success { background: #D1FAE5; color: #10B981; }
        .status-failed { background: #FEE2E2; color: #EF4444; }
        .status-pending { background: #FEF3C7; color: #F59E0B; }
        .avatar { width: 36px; height: 36px; background: #6366F1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .item-info { flex: 1; }
        .item-title { font-size: 14px; font-weight: 600; color: #111827; }
        .item-meta { font-size: 11px; color: #6B7280; }
        .item-amount { font-size: 13px; font-weight: 600; color: #111827; }
        .badges { display: flex; gap: 4px; flex-wrap: wrap; }
        .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        .badge-red { background: #FEE2E2; color: #DC2626; }
        .badge-blue { background: #DBEAFE; color: #2563EB; }
        .badge-green { background: #D1FAE5; color: #059669; }
        .settings-list { display: flex; flex-direction: column; gap: 8px; }
        .setting-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #F9FAFB; border-radius: 12px; color: #6366F1; }
        .setting-item p { font-size: 14px; font-weight: 600; color: #111827; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #E5E7EB; display: flex; padding: 8px 0; max-width: 800px; margin: 0 auto; }
        .bottom-nav button { flex: 1; background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 2px; color: #6B7280; font-size: 10px; cursor: pointer; padding: 8px; }
        .bottom-nav button.active { color: #6366F1; }
      `}</style>
    </div>
  )
}
