import { useNavigate } from 'react-router-dom';

const categoryColors = {
  Food: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: '🍔' },
  Travel: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', icon: '✈️' },
  Bills: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: '📄' },
  Entertainment: { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', icon: '🎮' },
  Others: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', icon: '📦' },
};

export default function ExpenseCard({ expense, onDelete }) {
  const navigate = useNavigate();
  const cat = categoryColors[expense.category] || categoryColors.Others;
  const date = new Date(expense.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '1rem 1.25rem',
      transition: 'border-color 0.2s',
    }}
    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      {/* Category icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '10px',
        background: cat.bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
      }}>
        {cat.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, color: cat.color,
            background: cat.bg, padding: '0.15rem 0.6rem', borderRadius: '999px',
          }}>
            {expense.category}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{date}</span>
        </div>
        {expense.note && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text2)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {expense.note}
          </div>
        )}
      </div>

      {/* Amount */}
      <div style={{
        fontSize: '1.05rem', fontWeight: 700,
        color: 'var(--text)', fontFamily: "'DM Mono', monospace",
        flexShrink: 0,
      }}>
        ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        <button onClick={() => navigate(`/edit/${expense._id}`)}
          title="Edit"
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '0.35rem 0.6rem',
            cursor: 'pointer', color: 'var(--text2)', fontSize: '0.8rem',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.1)'; e.currentTarget.style.color = 'var(--accent2)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}>
          ✏️
        </button>
        <button onClick={() => onDelete(expense._id)}
          title="Delete"
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '0.35rem 0.6rem',
            cursor: 'pointer', color: 'var(--text2)', fontSize: '0.8rem',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
          🗑️
        </button>
      </div>
    </div>
  );
}
