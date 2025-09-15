import { useState, useEffect } from "react";
import axios from "axios";
import AddExpenseModal from "../components/AddExpenseModal"; // Make sure path is correct
import { Plus } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// --- Helper Components for Loading/Error States ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
    <strong className="font-bold">Error:</strong>
    <span className="block sm:inline"> {message}</span>
  </div>
);

// --- Main Dashboard Component ---
export default function Dashboard() {
  const [stats, setStats] = useState({ totalSpent: 0, transactionCount: 0, topCategory: 'N/A' });
  const [chartData, setChartData] = useState({ spendingOverTime: [], categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch and process data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const transactions = res.data.data.transactions;
      processTransactionData(transactions);

    } catch (err) {
      setError("Failed to fetch financial data. Please try refreshing.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Function to process raw transaction data for stats and charts
  const processTransactionData = (transactions) => {
    // --- 1. Calculate Stats ---
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const transactionCount = transactions.length;

    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    const topCategory = Object.keys(categoryTotals).length > 0 
      ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0] 
      : 'N/A';

    setStats({ totalSpent, transactionCount, topCategory });

    // --- 2. Format Data for Charts ---
    const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    
    // Group spending by month for the line chart
    const monthlySpending = {};
    expenses.forEach(tx => {
      const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
      monthlySpending[month] = (monthlySpending[month] || 0) + tx.amount;
    });
    
    const spendingOverTime = Object.entries(monthlySpending).map(([month, value]) => ({ month, value }));
    
    setChartData({ categoryBreakdown, spendingOverTime });
  };
  
  // --- Modal Handlers ---
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchData(); // Refresh data after modal closes
  };

  const COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#6B7280"];

  // --- Render Logic ---
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Here’s your financial overview.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Spent</p>
          <h2 className="text-xl font-semibold">
            {stats.totalSpent.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm"># of Transactions</p>
          <h2 className="text-xl font-semibold">{stats.transactionCount}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Top Category</p>
          <h2 className="text-xl font-semibold">{stats.topCategory}</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Line Chart (takes more space) */}
        <div className="lg:col-span-3 bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-600 font-medium mb-4">Spending Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.spendingOverTime}>
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
              <Legend />
              <Line type="monotone" dataKey="value" name="Spending" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart (takes less space) */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-600 font-medium mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* The Modal Component */}
      <AddExpenseModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}