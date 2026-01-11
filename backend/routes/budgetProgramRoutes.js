const express = require("express");
const router = express.Router();
const { uploadUniversal } = require("../config/multer");
const {
  uploadBudgetProgram,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  archiveBudget, // NEW
  unarchiveBudget, // NEW
  getArchivedBudgets, // NEW
  getActiveBudgets, // NEW
  deleteBudget,
} = require("../controllers/budgetProgramController");

// POST – Upload budget (PDF/Office/Image)
router.post("/", uploadUniversal.single("file"), uploadBudgetProgram);

// GET – all budgets
router.get("/", getAllBudgets);

// GET – active (non-archived) budgets
router.get("/active", getActiveBudgets); // NEW

// GET – archived budgets
router.get("/archived", getArchivedBudgets); // NEW

// GET – single budget
router.get("/:id", getBudgetById);

// PUT – update budget metadata (title, description, year, etc.)
router.put("/:id", updateBudget);

// PATCH – archive budget
router.patch("/:id/archive", archiveBudget); // NEW

// PATCH – unarchive budget
router.patch("/:id/unarchive", unarchiveBudget); // NEW

// DELETE – remove budget
router.delete("/:id", deleteBudget);

module.exports = router;