import Layout from "../components/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const spendingData = [
  { month: "Jan", value: 200 },
  { month: "Feb", value: 400 },
  { month: "Mar", value: 300 },
  { month: "Apr", value: 500 },
  { month: "May", value: 700 },
  { month: "Jun", value: 600 },
  { month: "Jul", value: 800 },
];

const categoryData = [
  { name: "Groceries", value: 400 },
  { name: "Transport", value: 300 },
  { name: "Entertainment", value: 200 },
  { name: "Other", value: 100 },
];

const COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#9CA3AF"];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Here’s a financial overview for this month.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Spent</p>
          <h2 className="text-xl font-semibold">₹2,450.00</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Remaining Budget</p>
          <h2 className="text-xl font-semibold">₹7,550.00</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm"># of Transactions</p>
          <h2 className="text-xl font-semibold">125</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Top Category</p>
          <h2 className="text-xl font-semibold">Groceries</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-600 font-medium mb-4">Spending Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={spendingData}>
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        {/* Pie Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-600 font-medium mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
