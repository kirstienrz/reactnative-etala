import React, { useEffect, useState } from "react";
import { 
    getFinanceSummary, 
    createBudget, 
    createExpense
} from "../../api/finance";
import { 
    Loader2, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    Target,
    AlertCircle,
    CheckCircle,
    Plus,
    Calendar,
    Filter,
    Download,
    MoreVertical,
    BarChart3,
    Receipt,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronUp,
    PlusCircle,
    CreditCard,
    ShoppingBag,
    Home,
    Car,
    Utensils
} from "lucide-react";

// Icon mapping for categories
const categoryIcons = {
    'Food': Utensils,
    'Rent': Home,
    'Transportation': Car,
    'Shopping': ShoppingBag,
    'Entertainment': '🎬',
    'Utilities': '⚡',
    'Healthcare': '🏥',
    'Education': '📚',
    'Others': CreditCard
};

const getCategoryIcon = (category) => {
    const icon = categoryIcons[category];
    if (typeof icon === 'string') return icon;
    if (icon) {
        const IconComponent = icon;
        return <IconComponent className="h-5 w-5" />;
    }
    return <Receipt className="h-5 w-5" />;
};

const Finance = () => {
    const [month, setMonth] = useState("2026-01");
    const [summary, setSummary] = useState({}); // Now contains expenses array for each category
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Budget form
    const [budgetCategory, setBudgetCategory] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");

    // Expense form
    const [expenseCategory, setExpenseCategory] = useState("");
    const [expenseTitle, setExpenseTitle] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchSummary();
    }, [month]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await getFinanceSummary(month);
            // Assuming API returns: { category: { budget, spent, remaining, expenses: [] } }
            setSummary(res.data || {});
        } catch (err) {
            setError("Failed to load finance summary");
        } finally {
            setLoading(false);
        }
    };

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
            setShowBudgetModal(false);
            fetchSummary();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create budget");
        }
    };

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
            setShowExpenseModal(false);
            fetchSummary();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add expense");
        }
    };

    const toggleCategory = (category) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const calculateTotals = () => {
        let totalBudget = 0;
        let totalSpent = 0;
        let totalExpensesCount = 0;
        
        Object.values(summary).forEach(data => {
            totalBudget += data.budget || 0;
            totalSpent += data.spent || 0;
            totalExpensesCount += (data.expenses || []).length;
        });
        
        return {
            budget: totalBudget,
            spent: totalSpent,
            remaining: totalBudget - totalSpent,
            percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            totalExpenses: totalExpensesCount
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const totals = calculateTotals();
    const categories = Object.keys(summary);

    // Mock expense deletion (you'll need to implement actual API)
    const handleDeleteExpense = async (category, expenseId) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            // Add your delete expense API call here
            // await deleteExpense(expenseId);
            // fetchSummary(); // Refresh data
            
            // For now, just show success message
            setSuccess("Expense deleted successfully");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
                            <p className="text-gray-600 mt-1">Manage budgets and track all expenses</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-gray-700"
                                />
                            </div>
                            
                            <button 
                                onClick={() => setShowExpenseModal(true)}
                                disabled={categories.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Quick Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Budget</p>
                                <p className="text-2xl font-bold mt-1">₱{totals.budget.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{categories.length} categories</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold mt-1">₱{totals.spent.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {totals.percentage.toFixed(1)}% of budget
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Remaining</p>
                                <p className={`text-2xl font-bold mt-1 ${totals.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ₱{totals.remaining.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Target className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {totals.remaining < 0 ? 'Over budget' : 'Available'}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold mt-1">{totals.totalExpenses}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Receipt className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Individual transactions</p>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-red-800">Error</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-green-800">Success</p>
                            <p className="text-green-600 text-sm mt-1">{success}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Categories & Expenses */}
                    <div className="lg:col-span-2">
                        {/* Categories Header */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold">Budget Categories</h3>
                                    <p className="text-gray-600 mt-1">Click on a category to view expenses</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => setShowBudgetModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Budget
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <BarChart3 className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h4 className="font-medium text-gray-900">No budgets yet</h4>
                                    <p className="text-gray-600 mt-1">Create your first budget to get started</p>
                                    <button 
                                        onClick={() => setShowBudgetModal(true)}
                                        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                    >
                                        Create Budget
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(summary)
                                        .filter(([category]) => selectedCategory === "all" || category === selectedCategory)
                                        .map(([category, data]) => {
                                            const percentage = data.budget > 0 ? (data.spent / data.budget) * 100 : 0;
                                            const isOverBudget = data.remaining < 0;
                                            const isExpanded = expandedCategories.has(category);
                                            const expenses = data.expenses || [];
                                            
                                            return (
                                                <div key={category} className="border rounded-xl overflow-hidden hover:shadow-sm transition">
                                                    {/* Category Header */}
                                                    <div 
                                                        className="p-5 cursor-pointer hover:bg-gray-50 transition"
                                                        onClick={() => toggleCategory(category)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                                    {typeof getCategoryIcon(category) === 'string' ? (
                                                                        <span className="text-xl">{getCategoryIcon(category)}</span>
                                                                    ) : (
                                                                        <div className="text-indigo-600">
                                                                            {getCategoryIcon(category)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-left">
                                                                    <h4 className="font-bold text-lg">{category}</h4>
                                                                    <p className="text-gray-600">
                                                                        {expenses.length} expense{expenses.length !== 1 ? 's' : ''} • ₱{data.spent.toLocaleString()} spent
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-600">Budget</p>
                                                                    <p className="font-bold">₱{data.budget.toLocaleString()}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-600">Remaining</p>
                                                                    <p className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                                                        ₱{data.remaining.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="w-6 h-6 flex items-center justify-center">
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="h-5 w-5 text-gray-500" />
                                                                    ) : (
                                                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Progress Bar */}
                                                        <div className="mt-4">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-600">
                                                                    {percentage.toFixed(1)}% spent
                                                                </span>
                                                                <span className="font-medium">
                                                                    ₱{data.spent.toLocaleString()} / ₱{data.budget.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full ${percentage > 100 ? 'bg-red-500' : 
                                                                        percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Expenses List (Collapsible) */}
                                                    {isExpanded && (
                                                        <div className="border-t bg-gray-50">
                                                            <div className="p-4">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <h5 className="font-semibold text-gray-700">Expenses in {category}</h5>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpenseCategory(category);
                                                                            setShowExpenseModal(true);
                                                                        }}
                                                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                        Add Expense
                                                                    </button>
                                                                </div>
                                                                
                                                                {expenses.length === 0 ? (
                                                                    <div className="text-center py-8">
                                                                        <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                                        <p className="text-gray-500">No expenses yet in this category</p>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setExpenseCategory(category);
                                                                                setShowExpenseModal(true);
                                                                            }}
                                                                            className="mt-3 text-green-600 hover:text-green-700 font-medium"
                                                                        >
                                                                            Add your first expense
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {expenses.map((expense, index) => (
                                                                            <div 
                                                                                key={expense.id || index} 
                                                                                className="bg-white border rounded-lg p-4 hover:shadow-sm transition"
                                                                            >
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                                            <Receipt className="h-5 w-5 text-gray-600" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <h6 className="font-medium">{expense.title}</h6>
                                                                                            <p className="text-sm text-gray-600">
                                                                                                {expense.date ? formatDate(expense.date) : 'Today'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="text-right">
                                                                                            <p className="font-bold text-lg">₱{expense.amount.toLocaleString()}</p>
                                                                                        </div>
                                                                                        <div className="flex gap-2">
                                                                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                                                                                <Edit2 className="h-4 w-4 text-gray-600" />
                                                                                            </button>
                                                                                            <button 
                                                                                                onClick={() => handleDeleteExpense(category, expense.id)}
                                                                                                className="p-2 hover:bg-red-50 rounded-lg transition"
                                                                                            >
                                                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Expense Summary */}
                                                                {expenses.length > 0 && (
                                                                    <div className="mt-6 pt-4 border-t">
                                                                        <div className="flex items-center justify-between text-sm">
                                                                            <span className="text-gray-600">
                                                                                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                                                                            </span>
                                                                            <span className="font-bold">
                                                                                Total: ₱{data.spent.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Actions & Insights */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h4 className="font-bold text-lg mb-4">Quick Actions</h4>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setShowBudgetModal(true)}
                                    className="w-full flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Create New Budget</p>
                                        <p className="text-sm text-gray-600">Set up a spending category</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setShowExpenseModal(true)}
                                    disabled={categories.length === 0}
                                    className="w-full flex items-center gap-3 p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Receipt className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Add New Expense</p>
                                        <p className="text-sm text-gray-600">Record a transaction</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-3 p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition text-left">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Download className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Export Report</p>
                                        <p className="text-sm text-gray-600">Download CSV or PDF</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Category Insights */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                            <h4 className="font-bold text-lg mb-4 text-blue-900">Budget Insights</h4>
                            <div className="space-y-4">
                                {Object.entries(summary)
                                    .sort((a, b) => b[1].spent - a[1].spent)
                                    .slice(0, 3)
                                    .map(([category, data]) => {
                                        const percentage = (data.spent / data.budget) * 100;
                                        return (
                                            <div key={category} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="font-medium text-sm">{category}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${percentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold">
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                
                                {Object.entries(summary).some(([_, data]) => data.remaining < 0) && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-red-700">
                                                Some categories are over budget. Review your spending.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Month Summary */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h4 className="font-bold text-lg mb-4">Month Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Budget</span>
                                    <span className="font-bold">₱{totals.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Expenses</span>
                                    <span className="font-bold">₱{totals.spent.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Remaining Balance</span>
                                    <span className={`font-bold ${totals.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₱{totals.remaining.toLocaleString()}
                                    </span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Budget Usage</span>
                                        <span className={`font-bold ${totals.percentage > 90 ? 'text-red-600' : totals.percentage > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {totals.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Modal */}
            {showBudgetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Create New Budget</h3>
                            <button 
                                onClick={() => setShowBudgetModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateBudget} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Groceries, Transportation, Entertainment"
                                    value={budgetCategory}
                                    onChange={(e) => setBudgetCategory(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Monthly Budget</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowBudgetModal(false)}
                                        className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                    >
                                        Create Budget
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Add New Expense</h3>
                            <button 
                                onClick={() => setShowExpenseModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={expenseCategory}
                                    onChange={(e) => setExpenseCategory(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <input
                                    type="text"
                                    placeholder="What was this expense for?"
                                    value={expenseTitle}
                                    onChange={(e) => setExpenseTitle(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {categories.length === 0 && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-yellow-800">
                                            You need to create a budget category first before adding expenses.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowExpenseModal(false)}
                                        className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={categories.length === 0}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Expense
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;