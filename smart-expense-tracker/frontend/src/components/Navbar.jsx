import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/add', icon: '➕', label: 'Add Expense' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile top bar */}
      <div style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '1rem', alignItems: 'center', justifyContent: 'space-between',
        '@media (max-width: 768px)': { display: 'flex' }
      }} className="mobile-nav">
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>💸 ExpenseAI</span>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.2rem' }}>
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <nav style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)' }}>
            💸 ExpenseAI
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.2rem' }}>
            Smart Tracker
          </div>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1 }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: '8px',
                textDecoration: 'none', marginBottom: '0.25rem',
                fontSize: '0.9rem', fontWeight: 500,
                background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                color: isActive ? 'var(--accent2)' : 'var(--text2)',
                border: isActive ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}>
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* User info + logout */}
        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: '1rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.5rem 0.75rem', marginBottom: '0.5rem',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', 
                           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)',
                           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text2)', fontSize: '0.875rem', fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            🚪 Sign Out
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          nav { display: ${mobileOpen ? 'flex' : 'none'} !important; top: 60px !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
