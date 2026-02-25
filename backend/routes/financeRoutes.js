const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

// Budget
router.post("/budget", financeController.createBudget);

// Expense
router.post("/expense", financeController.createExpense);

// Summary
router.get("/summary", financeController.getSummary);

// Optional: list expenses
router.get("/expenses", financeController.getAllExpenses);

router.delete("/expense/:id", financeController.deleteExpense);

router.put("/expense/:id", financeController.updateExpense);
module.exports = router;
