import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expensesAPI } from '../api/axios';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Others'];

const CATEGORY_INFO = {
  Food: { icon: '🍔', desc: 'Meals, groceries, dining out' },
  Travel: { icon: '✈️', desc: 'Transport, fuel, trips' },
  Bills: { icon: '📄', desc: 'Utilities, rent, subscriptions' },
  Entertainment: { icon: '🎮', desc: 'Movies, games, hobbies' },
  Others: { icon: '📦', desc: 'Miscellaneous expenses' },
};

export default function AddExpense() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    date: today,
    note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  // Load expense data if editing
  useEffect(() => {
    if (!isEditing) return;
    const loadExpense = async () => {
      try {
        // Fetch all expenses and find the one we need
        const res = await expensesAPI.getAll({});
        const exp = res.data.find((e) => e._id === id);
        if (exp) {
          setForm({
            amount: exp.amount,
            category: exp.category,
            date: new Date(exp.date).toISOString().split('T')[0],
            note: exp.note || '',
          });
        } else {
          setError('Expense not found');
        }
      } catch (err) {
        setError('Failed to load expense');
      } finally {
        setFetching(false);
      }
    };
    loadExpense();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || parseFloat(form.amount) <= 0) {
      return setError('Please enter a valid amount greater than 0');
    }

    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEditing) {
        await expensesAPI.update(id, payload);
      } else {
        await expensesAPI.add(payload);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: 580 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1rem', padding: 0 }}>
          ← Back to Dashboard
        </button>
        <h1 className="page-title">{isEditing ? 'Edit Expense' : 'Add Expense'}</h1>
        <p className="page-subtitle">
          {isEditing ? 'Update the expense details below.' : 'Record a new expense to keep your budget on track.'}
        </p>
      </div>

      <div className="card">
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number" name="amount" value={form.amount}
              onChange={handleChange} placeholder="0.00"
              min="0.01" step="0.01" required
              style={{ fontSize: '1.4rem', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '0.25rem' }}>
              {CATEGORIES.map((cat) => {
                const info = CATEGORY_INFO[cat];
                const isSelected = form.category === cat;
                return (
                  <button key={cat} type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    title={info.desc}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.3rem', padding: '0.75rem 0.5rem',
                      borderRadius: '8px', cursor: 'pointer',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(108,99,255,0.12)' : 'var(--bg3)',
                      color: isSelected ? 'var(--accent2)' : 'var(--text2)',
                      transition: 'all 0.15s',
                    }}>
                    <span style={{ fontSize: '1.3rem' }}>{info.icon}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input
              type="date" name="date" value={form.date}
              onChange={handleChange} required max={today}
            />
          </div>

          {/* Note */}
          <div className="form-group">
            <label>Note <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <textarea
              name="note" value={form.note} onChange={handleChange}
              placeholder="e.g. Lunch at work, Monthly electricity bill..."
              rows={3} maxLength={200}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', textAlign: 'right' }}>
              {form.note.length}/200
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Saving...' : isEditing ? '✓ Update Expense' : '+ Add Expense'}
            </button>
            <button type="button" className="btn btn-ghost"
              onClick={() => navigate('/')}
              style={{ padding: '0.75rem 1.2rem' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
