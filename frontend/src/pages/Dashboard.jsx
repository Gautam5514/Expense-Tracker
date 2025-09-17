import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import AddExpenseModal from "../components/AddExpenseModal"; // Make sure path is correct
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// --- Helper Components ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
    <strong className="font-bold">Error:</strong>
    <span className="block sm:inline"> {message}</span>
  </div>
);

const StatCard = ({ title, value, children, bgColor = 'bg-white' }) => (
  <div className={`${bgColor} shadow-sm rounded-lg p-5`}>
    <p className="text-gray-500 text-sm font-medium">{title}</p>
    <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
    {children}
  </div>
);


// --- Main Dashboard Component ---
export default function Dashboard() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- Switched to the efficient report endpoint ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const res = await axios.get(`http://localhost:5000/api/reports/monthly-summary?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(res.data.data);

    } catch (err) {
      setError("Failed to fetch dashboard data. Please try refreshing.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]); // Re-fetch when the month changes

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchData(); // Refresh data after modal closes
  };

  const handlePreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#6B7280"];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  // Defensive destructuring to prevent errors if data is not yet loaded
  const {
    summary = { totalIncome: 0, totalSpending: 0, remainingBalance: 0 },
    spendingByCategory = [],
    spendingOverTime = []
  } = reportData || {};

  const hasIncomeSet = summary.totalIncome > 0;
  const isOverspent = summary.remainingBalance < 0;
  const topCategory = spendingByCategory[0]?.name || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        {/* Left Section: Title + Month Nav */}
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold whitespace-nowrap">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-gray-600 text-lg w-36 text-center">
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Right Section: Add Expense Button */}
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>


      {/* --- REFACTORED Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conditional Income Card */}
        {hasIncomeSet && (
          <StatCard
            title="Monthly Income"
            value={summary.totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            bgColor="bg-emerald-50"
          />
        )}

        <StatCard
          title="Spent this Month"
          value={summary.totalSpending.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
        />

        {/* The Remaining / Overspent Card */}
        {hasIncomeSet && (
          <StatCard
            title={isOverspent ? 'Overspent' : 'Remaining'}
            value={Math.abs(summary.remainingBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            bgColor={isOverspent ? 'bg-red-50' : 'bg-white'}
          />
        )}

        <StatCard
          title="Top Spending Category"
          value={topCategory}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-gray-600 font-medium mb-4">Daily Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* Using spendingOverTime data from the report */}
            <LineChart data={spendingOverTime}>
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
              <Legend />
              {/* The data key is 'spending' from your backend */}
              <Line type="monotone" dataKey="spending" name="Spending" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-gray-600 font-medium mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* Using spendingByCategory data from the report */}
            <PieChart>
              <Pie
                data={spendingByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* The Modal Component */}
      <AddExpenseModal isOpen={isModalOpen} onClose={handleCloseModal} availableCategories={spendingByCategory.map(c => c.name)} />
    </div>
  );
}