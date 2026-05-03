import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { expensesAPI, insightsAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ExpenseCard from '../components/ExpenseCard';

const CATEGORY_COLORS = {
  Food: '#10b981',
  Travel: '#60a5fa',
  Bills: '#f59e0b',
  Entertainment: '#c084fc',
  Others: '#94a3b8',
};

const SUGGESTION_STYLES = {
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  danger:  { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  color: '#ef4444' },
  success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
  info:    { bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.3)', color: '#a78bfa' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const now = new Date();
  const [selectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear] = useState(now.getFullYear());

  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const res = await expensesAPI.getAll({ month: selectedMonth, year: selectedYear });
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await insightsAPI.get();
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchInsights();
  }, [fetchExpenses, fetchInsights]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      fetchExpenses();
      fetchInsights();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Prepare pie chart data
  const pieData = insights
    ? Object.entries(insights.categoryBreakdown)
        .filter(([, val]) => val > 0)
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    : [];

  // Prepare bar chart data (expenses by day this month)
  const barData = (() => {
    const dayMap = {};
    expenses.forEach((e) => {
      const day = new Date(e.date).getDate();
      dayMap[day] = (dayMap[day] || 0) + e.amount;
    });
    return Object.entries(dayMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([day, amount]) => ({ day: `${day}`, amount: parseFloat(amount.toFixed(2)) }));
  })();

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', {
    month: 'long', year: 'numeric',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} 👋 — {monthName}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add')} style={{ flexShrink: 0 }}>
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'This Month', value: `₹${totalThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'var(--accent)' },
          { label: 'Transactions', value: expenses.length, icon: '📋', color: 'var(--blue)' },
          { label: 'Daily Average', value: insights ? `₹${insights.summary.currentMonth.dailyAverage.toFixed(0)}` : '—', icon: '📅', color: 'var(--green)' },
          { label: 'All Time Total', value: insights ? `₹${insights.summary.allTime.total.toLocaleString('en-IN')}` : '—', icon: '📈', color: 'var(--amber)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: "'DM Mono', monospace" }}>
              {value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.2rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Category Breakdown
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${val}`, '']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {pieData.map((entry) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text2)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[entry.name], display: 'inline-block' }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.875rem' }}>
              No expenses this month
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Spending
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                <Tooltip formatter={(val) => [`₹${val}`, 'Amount']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.875rem' }}>
              No data to display
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {!loadingInsights && insights?.suggestions?.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🤖 AI Insights
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {insights.suggestions.map((s, i) => {
              const style = SUGGESTION_STYLES[s.type] || SUGGESTION_STYLES.info;
              return (
                <div key={i} style={{
                  background: style.bg, border: `1px solid ${style.border}`,
                  borderRadius: '10px', padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: style.color }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.6 }}>{s.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense List */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Expenses
        </h3>
        {loadingExpenses ? (
          <div className="spinner" />
        ) : expenses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
            <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>No expenses found for this month.</p>
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {expenses.map((exp) => (
              <ExpenseCard key={exp._id} expense={exp} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
