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
          remaining: 0,
          expenses: [] // <-- add this
        };
      }

      if (r.type === "budget") {
        summary[r.category].budget += r.amount;
      } else if (r.type === "expense") {
        summary[r.category].spent += r.amount;
        summary[r.category].expenses.push({
          id: r._id,
          title: r.title,
          amount: r.amount,
          date: r.date,
          notes: r.notes || ""
        });
      }
    }

    // compute remaining
    for (let cat in summary) {
      summary[cat].remaining = summary[cat].budget - summary[cat].spent;
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

// =======================
// DELETE EXPENSE
// =======================
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params; // Get expense ID from URL parameter

    // Find the expense first to make sure it exists and is an expense type
    const expense = await Finance.findOne({
      _id: id,
      type: "expense" // Make sure we're only deleting expense records
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or already deleted"
      });
    }

    // Delete the expense
    await Finance.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Expense deleted successfully",
      data: { id: expense._id, category: expense.category }
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// =======================
// UPDATE EXPENSE
// =======================
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, notes, date } = req.body;

    // Find the expense first
    const expense = await Finance.findOne({
      _id: id,
      type: "expense"
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // If category is being changed, check budget for new category
    if (category && category !== expense.category) {
      // Get budget for new category
      const budget = await Finance.findOne({
        type: "budget",
        category: category,
        month: expense.month // Keep same month
      });

      if (!budget) {
        return res.status(400).json({
          success: false,
          message: `Walang naka-set na budget for category ${category} this month`
        });
      }

      // Get all expenses in new category (excluding current expense if it's being moved)
      const otherExpenses = await Finance.find({
        type: "expense",
        category: category,
        month: expense.month,
        _id: { $ne: id } // Exclude current expense
      });

      const totalSpentInNewCategory = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
      const newAmount = amount || expense.amount;
      const remainingInNewCategory = budget.amount - totalSpentInNewCategory;

      if (newAmount > remainingInNewCategory) {
        return res.status(400).json({
          success: false,
          message: `Lampas na sa budget for ${category}! Remaining: ${remainingInNewCategory}`
        });
      }
    }
    // If only amount is changing but category stays same
    else if (amount && amount !== expense.amount) {
      // Get budget for current category
      const budget = await Finance.findOne({
        type: "budget",
        category: expense.category,
        month: expense.month
      });

      if (budget) {
        // Get all other expenses in same category
        const otherExpenses = await Finance.find({
          type: "expense",
          category: expense.category,
          month: expense.month,
          _id: { $ne: id }
        });

        const totalSpentOthers = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
        const remainingInCategory = budget.amount - totalSpentOthers;

        if (amount > remainingInCategory) {
          return res.status(400).json({
            success: false,
            message: `Lampas na sa budget! Remaining: ${remainingInCategory}`
          });
        }
      }
    }

    // Update the expense
    const updatedExpense = await Finance.findByIdAndUpdate(
      id,
      {
        title: title || expense.title,
        amount: amount || expense.amount,
        category: category || expense.category,
        notes: notes !== undefined ? notes : expense.notes,
        date: date || expense.date
      },
      { new: true } // Return the updated document
    );

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};