import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, formatMoney } from '../lib/supabase'
import { LogOut, Wallet, Users, Phone, Gift, Ticket } from 'lucide-react'

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const [wallets, setWallets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [recipients, setRecipients] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    if (profile) {
      loadData()
    }
  }, [profile])

  async function loadData() {
    try {
      setLoading(true)
      const [walletsRes, txRes, recipRes, tickRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', profile?.id),
        supabase.from('transactions').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('recipients').select('*').eq('user_id', profile?.id).limit(5),
        supabase.from('tickets').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(5),
      ])
      setWallets(walletsRes.data || [])
      setTransactions(txRes.data || [])
      setRecipients(recipRes.data || [])
      setTickets(tickRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalBalanceYER = wallets.filter(w => w.currency === 'YER').reduce((s, w) => s + w.balance_minor, 0)

  if (loading) {
    return <div className="loading">جاري التحميل...</div>
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>مرحباً، {profile?.name?.split(' ')[0] || 'مستخدم'}</h1>
          <p>{profile?.email}</p>
        </div>
        <button onClick={signOut} className="icon-btn">
          <LogOut size={22} />
        </button>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <>
            <div className="balance-card">
              <p className="balance-label">إجمالي الرصيد (YER)</p>
              <h2 className="balance-amount">{formatMoney(totalBalanceYER, 'YER')}</h2>
              <div className="wallets-grid">
                {wallets.map(w => (
                  <div key={w.id} className="mini-wallet">
                    <span className="cur">{w.currency}</span>
                    <span className="amt">{formatMoney(w.balance_minor, w.currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-actions">
              <button className="qa-btn" onClick={() => setActiveTab('topup')}>
                <Phone size={28} />
                <span>شحن</span>
              </button>
              <button className="qa-btn" onClick={() => setActiveTab('giftcards')}>
                <Gift size={28} />
                <span>بطاقات</span>
              </button>
              <button className="qa-btn" onClick={() => setActiveTab('recipients')}>
                <Users size={28} />
                <span>المستلمون</span>
              </button>
              <button className="qa-btn" onClick={() => setActiveTab('tickets')}>
                <Ticket size={28} />
                <span>الدعم</span>
              </button>
            </div>

            <section className="section">
              <h3>آخر المعاملات</h3>
              {transactions.length === 0 ? (
                <p className="empty">لا توجد معاملات</p>
              ) : (
                <div className="tx-list">
                  {transactions.map(tx => (
                    <div key={tx.id} className="tx-item">
                      <div className="tx-icon">
                        {tx.type === 'airtime' || tx.type === 'data' ? <Phone size={20} /> : <Gift size={20} />}
                      </div>
                      <div className="tx-info">
                        <p className="tx-name">{tx.recipient_name || tx.recipient}</p>
                        <p className="tx-meta">{tx.country} • {tx.type}</p>
                      </div>
                      <div className="tx-amount">
                        <p className={`status status-${tx.status}`}>{tx.status === 'success' ? '✓' : tx.status === 'failed' ? '✗' : '⏳'}</p>
                        <p className="amt">{formatMoney(tx.amount_usd_minor, 'USD')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'topup' && (
          <div className="placeholder-page">
            <Phone size={64} />
            <h2>شحن الرصيد</h2>
            <p>اختر دولة ومشغل وشحن رصيد أي رقم في العالم</p>
            <button className="btn-primary" onClick={() => setActiveTab('home')}>العودة</button>
          </div>
        )}

        {activeTab === 'giftcards' && (
          <div className="placeholder-page">
            <Gift size={64} />
            <h2>بطاقات الهدايا</h2>
            <p>اشترِ بطاقات هدايا من أشهر المتاجر العالمية</p>
            <button className="btn-primary" onClick={() => setActiveTab('home')}>العودة</button>
          </div>
        )}

        {activeTab === 'recipients' && (
          <div className="section">
            <h3>المستلمون</h3>
            {recipients.length === 0 ? (
              <p className="empty">لا يوجد مستلمون</p>
            ) : (
              <div className="recip-list">
                {recipients.map(r => (
                  <div key={r.id} className="recip-item">
                    <div className="avatar">{r.name?.[0]}</div>
                    <div>
                      <p className="name">{r.name}</p>
                      <p className="phone">{r.contact}</p>
                    </div>
                    <span className="flag">{r.country}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary" onClick={() => setActiveTab('home')}>العودة</button>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="section">
            <h3>تذاكر الدعم</h3>
            {tickets.length === 0 ? (
              <p className="empty">لا توجد تذاكر</p>
            ) : (
              <div className="ticket-list">
                {tickets.map(t => (
                  <div key={t.id} className="ticket-item">
                    <p className="subject">{t.subject}</p>
                    <p className="meta">الأولوية: {t.priority} • الحالة: {t.status}</p>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary" onClick={() => setActiveTab('home')}>العودة</button>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          <Wallet size={22} /> <span>الرئيسية</span>
        </button>
        <button className={activeTab === 'topup' ? 'active' : ''} onClick={() => setActiveTab('topup')}>
          <Phone size={22} /> <span>شحن</span>
        </button>
        <button className={activeTab === 'giftcards' ? 'active' : ''} onClick={() => setActiveTab('giftcards')}>
          <Gift size={22} /> <span>بطاقات</span>
        </button>
        <button className={activeTab === 'recipients' ? 'active' : ''} onClick={() => setActiveTab('recipients')}>
          <Users size={22} /> <span>المستلمون</span>
        </button>
      </nav>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Tahoma', sans-serif; }
        .app {
          min-height: 100vh;
          background: #F9FAFB;
          direction: rtl;
          padding-bottom: 80px;
        }
        .header {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          padding: 20px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 { font-size: 20px; font-weight: 700; }
        .header p { font-size: 12px; opacity: 0.9; }
        .icon-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
        }
        .content { padding: 16px; max-width: 600px; margin: 0 auto; }
        .loading { padding: 40px; text-align: center; color: #6B7280; direction: rtl; }
        .balance-card {
          background: linear-gradient(135deg, #1F2937, #111827);
          color: white;
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .balance-label { font-size: 13px; opacity: 0.7; margin-bottom: 4px; }
        .balance-amount { font-size: 32px; font-weight: 800; margin-bottom: 16px; }
        .wallets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
        }
        .mini-wallet {
          background: rgba(255,255,255,0.1);
          padding: 8px 12px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
        }
        .mini-wallet .cur { font-size: 11px; opacity: 0.7; }
        .mini-wallet .amt { font-size: 13px; font-weight: 600; }
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .qa-btn {
          background: white;
          border: none;
          padding: 16px 8px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #10B981;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .section {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .section h3 { font-size: 16px; margin-bottom: 12px; color: #111827; }
        .empty { color: #9CA3AF; text-align: center; padding: 20px; font-size: 14px; }
        .tx-list, .recip-list, .ticket-list { display: flex; flex-direction: column; gap: 8px; }
        .tx-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 12px;
        }
        .tx-icon {
          width: 40px;
          height: 40px;
          background: #10B981;
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tx-info { flex: 1; }
        .tx-name { font-size: 14px; font-weight: 600; color: #111827; }
        .tx-meta { font-size: 11px; color: #6B7280; }
        .tx-amount { text-align: left; }
        .tx-amount .amt { font-size: 13px; font-weight: 600; color: #111827; }
        .status-success { color: #10B981; }
        .status-failed { color: #EF4444; }
        .status-pending { color: #F59E0B; }
        .recip-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 12px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          background: #10B981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .recip-item .name { font-size: 14px; font-weight: 600; }
        .recip-item .phone { font-size: 12px; color: #6B7280; }
        .recip-item .flag {
          background: #F3F4F6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        .ticket-item {
          padding: 12px;
          background: #F9FAFB;
          border-radius: 12px;
        }
        .ticket-item .subject { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .ticket-item .meta { font-size: 12px; color: #6B7280; }
        .placeholder-page {
          background: white;
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          color: #6B7280;
        }
        .placeholder-page h2 { color: #111827; margin: 16px 0 8px; }
        .placeholder-page p { margin-bottom: 24px; }
        .btn-primary {
          width: 100%;
          padding: 12px;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #E5E7EB;
          display: flex;
          padding: 8px 0;
          max-width: 600px;
          margin: 0 auto;
        }
        .bottom-nav button {
          flex: 1;
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          color: #6B7280;
          font-size: 10px;
          cursor: pointer;
          padding: 8px;
        }
        .bottom-nav button.active { color: #10B981; }
      `}</style>
    </div>
  )
}
