import React, { useEffect, useState } from "react";
import {
    getFinanceSummary,
    createBudget,
    createExpense
} from "../../api/finance";
import { Loader2 } from "lucide-react";

const Finance = () => {
    const [month, setMonth] = useState("2026-01");

    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);

    // Budget form
    const [budgetCategory, setBudgetCategory] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");

    // Expense form
    const [expenseCategory, setExpenseCategory] = useState("");
    const [expenseTitle, setExpenseTitle] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchSummary();
    }, [month]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await getFinanceSummary(month);
            setSummary(res.data || {});
        } catch (err) {
            setError("Failed to load finance summary");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // HANDLE CREATE BUDGET
    // =========================
    const handleCreateBudget = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!budgetCategory || !budgetAmount) {
            setError("Category and amount are required for budget");
            return;
        }

        try {
            await createBudget({
                category: budgetCategory,
                amount: Number(budgetAmount),
                month
            });

            setSuccess("Budget created successfully");
            setBudgetCategory("");
            setBudgetAmount("");
            fetchSummary();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create budget");
        }
    };

    // =========================
    // HANDLE CREATE EXPENSE
    // =========================
    const handleCreateExpense = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!expenseCategory || !expenseTitle || !expenseAmount) {
            setError("All expense fields are required");
            return;
        }

        try {
            await createExpense({
                category: expenseCategory,
                title: expenseTitle,
                amount: Number(expenseAmount),
                month
            });

            setSuccess("Expense added successfully");
            setExpenseCategory("");
            setExpenseTitle("");
            setExpenseAmount("");
            fetchSummary();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add expense");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Financial Management</h2>
                <p className="text-gray-600">Set budgets, add expenses, and track remaining</p>
            </div>

            {/* Month Selector */}
            <div className="mb-6 flex gap-4 items-center">
                <label className="font-medium">Month:</label>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                />
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
            )}

            {/* Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                {/* CREATE BUDGET */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Set Budget</h3>

                    <form onSubmit={handleCreateBudget} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Category (e.g. Food, Rent)"
                            value={budgetCategory}
                            onChange={(e) => setBudgetCategory(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />

                        <input
                            type="number"
                            placeholder="Budget Amount"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Save Budget
                        </button>
                    </form>
                </div>

                {/* CREATE EXPENSE */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Add Expense</h3>

                    <form onSubmit={handleCreateExpense} className="space-y-4">

                        {/* CATEGORY DROPDOWN */}
                        <select
                            value={expenseCategory}
                            onChange={(e) => setExpenseCategory(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        >
                            <option value="">Select Category</option>
                            {Object.keys(summary).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Expense Title (e.g. Lunch)"
                            value={expenseTitle}
                            onChange={(e) => setExpenseTitle(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />

                        <input
                            type="number"
                            placeholder="Amount"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />

                        <button
                            type="submit"
                            disabled={Object.keys(summary).length === 0}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Expense
                        </button>

                        {Object.keys(summary).length === 0 && (
                            <p className="text-sm text-red-600">
                                Please set a budget first before adding expenses.
                            </p>
                        )}
                    </form>
                </div>
            </div>

            {/* SUMMARY TABLE */}
            <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Summary for {month}</h3>

                {loading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading summary...
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2">Category</th>
                                <th className="py-2">Budget</th>
                                <th className="py-2">Spent</th>
                                <th className="py-2">Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(summary).length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-500">
                                        No data for this month
                                    </td>
                                </tr>
                            ) : (
                                Object.entries(summary).map(([category, data]) => (
                                    <tr key={category} className="border-b">
                                        <td className="py-2">{category}</td>
                                        <td className="py-2">₱{data.budget}</td>
                                        <td className="py-2">₱{data.spent}</td>
                                        <td
                                            className={`py-2 font-semibold ${data.remaining < 0
                                                    ? "text-red-600"
                                                    : data.remaining < data.budget * 0.2
                                                        ? "text-yellow-600"
                                                        : "text-green-600"
                                                }`}
                                        >
                                            ₱{data.remaining}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Finance;
