const Finance = require("../models/Finance");

// =======================
// CREATE BUDGET
// =======================
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    // Optional: check if budget already exists for this category + month
    const existing = await Finance.findOne({
      type: "budget",
      category,
      month
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "May budget na for this category this month"
      });
    }

    const budget = await Finance.create({
      type: "budget",
      category,
      amount,
      month
    });

    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =======================
// CREATE EXPENSE
// =======================
exports.createExpense = async (req, res) => {
  try {
    const { category, title, amount, month, notes } = req.body;

    // 1. Get budget for this category + month
    const budget = await Finance.findOne({
      type: "budget",
      category,
      month
    });

    if (!budget) {
      return res.status(400).json({
        success: false,
        message: "Walang naka-set na budget for this category and month"
      });
    }

    // 2. Get total spent so far
    const expenses = await Finance.find({
      type: "expense",
      category,
      month
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const remaining = budget.amount - totalSpent;

    // 3. Optional: prevent overspending
    if (amount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Lampas na sa budget! Remaining: ${remaining}`
      });
    }

    // 4. Save expense
    const expense = await Finance.create({
      type: "expense",
      category,
      title,
      amount,
      month,
      notes
    });

    res.json({
      success: true,
      data: expense,
      remainingAfter: remaining - amount
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =======================
// GET SUMMARY PER MONTH
// =======================
exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query; // ?month=2026-01

    const records = await Finance.find({ month });

    const summary = {};

    for (let r of records) {
      if (!summary[r.category]) {
        summary[r.category] = {
          budget: 0,
          spent: 0,
          remaining: 0
        };
      }

      if (r.type === "budget") {
        summary[r.category].budget += r.amount;
      } else {
        summary[r.category].spent += r.amount;
      }
    }

    // compute remaining
    for (let cat in summary) {
      summary[cat].remaining =
        summary[cat].budget - summary[cat].spent;
    }

    res.json({ success: true, data: summary });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =======================
// GET ALL EXPENSES (OPTIONAL)
// =======================
exports.getAllExpenses = async (req, res) => {
  try {
    const { month, category } = req.query;

    const filter = { type: "expense" };

    if (month) filter.month = month;
    if (category) filter.category = category;

    const expenses = await Finance.find(filter).sort({ date: -1 });

    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
