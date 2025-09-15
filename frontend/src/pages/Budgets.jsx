import { useState, useEffect } from "react";
import axios from "axios";
import AddExpenseModal from "../components/AddExpenseModal";
import AddBudgetModal from "../components/AddBudgetModal";

// A simple color array to cycle through for the progress bars
const COLORS = ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-emerald-500"];

// Loading state component for a better UX
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-5 rounded-lg bg-white shadow animate-pulse">
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
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Function to fetch the dynamically calculated budget data from the backend
  const fetchData = async () => {
    try {
      // Don't set loading to true on refetch, only on initial load
      // setLoading(true); 
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data.data.budgets);
    } catch (err) {
      setError("Could not fetch budget data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // A single handler to close any modal and refresh the data
  const handleCloseModal = () => {
    setIsExpenseModalOpen(false);
    setIsBudgetModalOpen(false);
    fetchData(); // This is the key to automatic updates
  };

  const availableCategories = budgets.map(b => b.category);


  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budgets Overview</h1>
          <p className="text-gray-500">
            Track your spending against your set budgets for this month.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
          >
            + Add Expense
          </button>
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            + New Budget
          </button>
        </div>
      </div>

      {/* Conditional Rendering for Loading, Error, and Data states */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-lg shadow">
          <p>{error}</p>
        </div>
      ) : (
        // Budget Cards Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length > 0 ? (
            budgets.map((b, i) => {
              const percent = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 100;
              const remaining = b.limit - b.spent;
              const overspent = b.spent > b.limit;

              return (
                <div
                  key={b._id}
                  className={`p-5 rounded-lg border ${overspent ? "border-red-300 bg-red-50" : "bg-white shadow"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-gray-800">{b.category}</h2>
                    <span className={`text-sm font-medium ${overspent ? "text-red-600" : "text-gray-500"}`}>
                      {percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div
                      className={`h-2 rounded-full ${overspent ? 'bg-red-500' : COLORS[i % COLORS.length]}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm mb-1">
                    <span className={overspent ? "text-red-600 font-medium" : "text-gray-500"}>
                      {overspent
                        ? `${(Math.abs(remaining)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} overspent`
                        : `${remaining.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} remaining`}
                    </span>
                    <span className="font-medium text-gray-800">
                      {`${(b.spent).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} / ${(b.limit).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`}
                    </span>
                  </div>

                  {/* Dynamic Warning Messages */}
                  {percent > 85 && !overspent && (
                    <p className="text-xs mt-1 text-yellow-600">
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
            <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-800">No budgets found.</h3>
              <p className="text-gray-500 mt-1">Click the "+ New Budget" button to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Render Modals (they are invisible until their 'isOpen' prop is true) */}
      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={handleCloseModal}  availableCategories={availableCategories} />
      <AddBudgetModal isOpen={isBudgetModalOpen} onClose={handleCloseModal} />
    </main>
  );
}