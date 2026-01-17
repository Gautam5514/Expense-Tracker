import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AddExpenseModal from "../components/AddExpenseModal";
import AddBudgetModal from "../components/AddBudgetModal";

const COLORS = ["bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-rose-500", "bg-slate-500"];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-5 rounded-2xl bg-white/70 border border-white/60 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full mb-3"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const res = await axios.get(`${API_URL}/api/budgets?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data.data.budgets);
    } catch (err) {
      setError("Could not fetch budget data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handleOpenAddModal = () => {
    setBudgetToEdit(null);
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setBudgetToEdit(budget);
    setIsBudgetModalOpen(true);
    setActiveMenu(null);
  };

  const handleCloseModal = () => {
    setIsExpenseModalOpen(false);
    setIsBudgetModalOpen(false);
    setBudgetToEdit(null);
    fetchData();
  };

  const handleDelete = async (budget) => {
    setActiveMenu(null);
    if (window.confirm(`Are you sure you want to delete the budget for "${budget.category}"?`)) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/budgets/${budget._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        alert("Failed to delete budget.");
      }
    }
  };

  const handlePreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToggleMenu = (budgetId) => setActiveMenu(activeMenu === budgetId ? null : budgetId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableCategories = budgets.map(b => b.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        {/* Left Section: Title + Month Nav */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold font-display whitespace-nowrap">Budgets</h1>
            <p className="text-sm text-[var(--ink-500)]">Stay ahead of your spending caps.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="btn-ghost px-3 py-2"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-[var(--ink-700)] text-lg w-36 text-center">
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={handleNextMonth}
              className="btn-ghost px-3 py-2"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Right Section: Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn-primary text-sm"
          >
            + Add Expense
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn-secondary text-sm"
          >
            + New Budget
          </button>
        </div>
      </div>


      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-lg shadow">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length > 0 ? (
            budgets.map((b, i) => {
              const percent = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 100;
              const remaining = b.limit - b.spent;
              const overspent = b.spent > b.limit;

              return (
                // CORRECTED: Changed < to <div
                <div
                  key={b._id}
                  className={`p-5 app-card ${overspent ? "border-red-200 bg-red-50/70" : ""}`}
                >
                  {/* CORRECTED: Menu is now inside the header for proper layout */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-semibold text-[var(--ink-900)]">{b.category}</h2>
                      <span className={`text-sm font-medium ${overspent ? "text-red-600" : "text-[var(--ink-500)]"}`}>
                        {percent}% Used
                      </span>
                    </div>
                    <div className="relative" ref={activeMenu === b._id ? menuRef : null}>
                      <button onClick={() => handleToggleMenu(b._id)} className="text-[var(--ink-500)] hover:text-[var(--ink-900)] p-1 -mr-1">
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === b._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg z-20 border border-slate-100">
                          <a onClick={() => handleOpenEditModal(b)} className="flex items-center px-4 py-2 text-sm text-[var(--ink-700)] hover:bg-slate-50 cursor-pointer">
                            <Edit size={14} className="mr-2" /> Edit
                          </a>
                          <a onClick={() => handleDelete(b)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                            <Trash2 size={14} className="mr-2" /> Delete
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/70 h-2 rounded-full mb-2">
                    <div
                      className={`h-2 rounded-full ${overspent ? 'bg-red-500' : COLORS[i % COLORS.length]}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm mb-1">
                    <span className={overspent ? "text-red-600 font-medium" : "text-[var(--ink-500)]"}>
                      {overspent
                        ? `${(Math.abs(remaining)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} overspent`
                        : `${remaining.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} remaining`}
                    </span>
                    <span className="font-medium text-[var(--ink-900)]">
                      {`${(b.spent).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} / ${(b.limit).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`}
                    </span>
                  </div>

                  {percent > 85 && !overspent && (
                    <p className="text-xs mt-1 text-amber-600">
                      ! Nearing budget limit.
                    </p>
                  )}
                  {overspent && (
                    <p className="text-xs mt-1 text-red-600">
                      ⚠️ You are over budget!
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center py-12 app-card">
              <h3 className="text-lg font-medium text-[var(--ink-900)]">No budgets found for this month.</h3>
              <p className="text-[var(--ink-500)] mt-1">Click the "+ New Budget" button to create one.</p>
            </div>
          )}
        </div>
      )}

      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={handleCloseModal} availableCategories={availableCategories} />
      {/* CORRECTED: Added the missing budgetToEdit prop */}
      <AddBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleCloseModal}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
}
