const Expense = require('../models/Expense');

// @route   GET /api/expenses
// @desc    Get all expenses for logged-in user
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { month, year, category } = req.query;

    // Build filter object
    let filter = { user: req.user._id };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by category if provided
    if (category && category !== 'All') {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/expenses
// @desc    Add a new expense
// @access  Private
const addExpense = async (req, res) => {
  const { amount, category, date, note } = req.body;

  try {
    if (!amount || !category || !date) {
      return res.status(400).json({ message: 'Amount, category, and date are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      date,
      note,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
