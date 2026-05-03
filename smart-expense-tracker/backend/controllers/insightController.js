const Expense = require('../models/Expense');

// Helper: get start/end of a month
const getMonthRange = (year, month) => ({
  start: new Date(year, month - 1, 1),
  end: new Date(year, month, 0, 23, 59, 59),
});

// @route   GET /api/insights
// @desc    Get AI-powered spending insights for the user
// @access  Private
const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Previous month calculation
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Fetch current month expenses
    const { start: cStart, end: cEnd } = getMonthRange(currentYear, currentMonth);
    const currentExpenses = await Expense.find({
      user: userId,
      date: { $gte: cStart, $lte: cEnd },
    });

    // Fetch previous month expenses
    const { start: pStart, end: pEnd } = getMonthRange(prevYear, prevMonth);
    const prevExpenses = await Expense.find({
      user: userId,
      date: { $gte: pStart, $lte: pEnd },
    });

    // Fetch all-time expenses
    const allExpenses = await Expense.find({ user: userId });

    // ── Analysis 1: Category breakdown (current month) ──
    const categoryTotals = {};
    const categories = ['Food', 'Travel', 'Bills', 'Entertainment', 'Others'];
    categories.forEach((cat) => (categoryTotals[cat] = 0));

    currentExpenses.forEach((exp) => {
      categoryTotals[exp.category] += exp.amount;
    });

    // ── Analysis 2: Highest spending category ──
    const highestCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // ── Analysis 3: Month-to-month comparison ──
    const currentTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthChange =
      prevTotal > 0
        ? (((currentTotal - prevTotal) / prevTotal) * 100).toFixed(1)
        : null;

    // ── Analysis 4: Daily average (current month) ──
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysPassed = Math.min(now.getDate(), daysInMonth);
    const dailyAvg = daysPassed > 0 ? (currentTotal / daysPassed).toFixed(2) : 0;
    const projectedMonthly = (dailyAvg * daysInMonth).toFixed(2);

    // ── Generate smart suggestions ──
    const suggestions = [];

    // Suggestion 1: Highest category warning
    if (highestCategory && highestCategory[1] > 0) {
      const percentage = ((highestCategory[1] / currentTotal) * 100).toFixed(0);
      if (percentage > 40) {
        suggestions.push({
          type: 'warning',
          icon: '⚠️',
          title: `High ${highestCategory[0]} spending`,
          message: `You are spending too much on ${highestCategory[0]}. It accounts for ${percentage}% of your total expenses this month (₹${highestCategory[1].toFixed(2)}).`,
        });
      } else {
        suggestions.push({
          type: 'info',
          icon: '📊',
          title: `Top spending: ${highestCategory[0]}`,
          message: `Your highest spending category this month is ${highestCategory[0]} at ₹${highestCategory[1].toFixed(2)} (${percentage}% of total).`,
        });
      }
    }

    // Suggestion 2: Month-over-month trend
    if (monthChange !== null) {
      if (parseFloat(monthChange) > 20) {
        suggestions.push({
          type: 'danger',
          icon: '📈',
          title: 'Spending increased significantly',
          message: `Your spending this month is ${monthChange}% higher than last month (₹${currentTotal.toFixed(2)} vs ₹${prevTotal.toFixed(2)}). Your savings trend is decreasing — consider reviewing your expenses.`,
        });
      } else if (parseFloat(monthChange) < -10) {
        suggestions.push({
          type: 'success',
          icon: '✅',
          title: 'Great job saving!',
          message: `Your spending this month is ${Math.abs(monthChange)}% lower than last month. You are on a great savings trend — keep it up!`,
        });
      } else if (parseFloat(monthChange) > 0) {
        suggestions.push({
          type: 'info',
          icon: '📉',
          title: 'Slight spending increase',
          message: `Spending is up ${monthChange}% compared to last month. You're close to last month's level — small adjustments can help you stay on budget.`,
        });
      }
    } else if (currentTotal > 0) {
      suggestions.push({
        type: 'info',
        icon: '📅',
        title: 'First month tracked',
        message: `You've spent ₹${currentTotal.toFixed(2)} this month. Keep tracking to see month-over-month comparisons next month!`,
      });
    }

    // Suggestion 3: Projected monthly spending
    if (parseFloat(projectedMonthly) > 0 && daysPassed < daysInMonth) {
      suggestions.push({
        type: 'info',
        icon: '🔮',
        title: 'Month projection',
        message: `Based on your current pace (₹${dailyAvg}/day), you are projected to spend ₹${projectedMonthly} this month.`,
      });
    }

    // Suggestion 4: Zero-spend categories (positive reinforcement)
    const zeroCategories = categories.filter(
      (cat) => categoryTotals[cat] === 0 && cat !== 'Others'
    );
    if (zeroCategories.length > 0 && currentExpenses.length > 0) {
      suggestions.push({
        type: 'success',
        icon: '🎯',
        title: 'Categories under control',
        message: `No spending on ${zeroCategories.join(', ')} this month — great discipline!`,
      });
    }

    // Suggestion 5: No expenses recorded
    if (currentExpenses.length === 0) {
      suggestions.push({
        type: 'info',
        icon: '💡',
        title: 'No expenses this month',
        message: 'Start adding your expenses to get personalized insights and track your spending habits.',
      });
    }

    res.json({
      summary: {
        currentMonth: {
          total: parseFloat(currentTotal.toFixed(2)),
          count: currentExpenses.length,
          dailyAverage: parseFloat(dailyAvg),
          projectedMonthly: parseFloat(projectedMonthly),
        },
        previousMonth: {
          total: parseFloat(prevTotal.toFixed(2)),
          count: prevExpenses.length,
        },
        monthChangePercent: monthChange ? parseFloat(monthChange) : null,
        allTime: {
          total: parseFloat(
            allExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)
          ),
          count: allExpenses.length,
        },
      },
      categoryBreakdown: categoryTotals,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInsights };
