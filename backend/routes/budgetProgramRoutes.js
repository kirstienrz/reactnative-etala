const express = require("express");
const router = express.Router();
const { uploadUniversal } = require("../config/multer");
const {
  uploadBudgetProgram,
  getAllBudgets,
  getBudgetById,
  deleteBudget,
} = require("../controllers/budgetProgramController");

// POST – Upload budget (PDF/Office/Image)
router.post("/", uploadUniversal.single("file"), uploadBudgetProgram);

// GET – all budgets
router.get("/", getAllBudgets);

// GET – single budget
router.get("/:id", getBudgetById);

// DELETE – remove budget
router.delete("/:id", deleteBudget);

module.exports = router;
