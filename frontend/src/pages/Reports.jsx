import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

const pieData = [
  { name: "Food", value: 850 },
  { name: "Transport", value: 612 },
  { name: "Entertainment", value: 490 },
  { name: "Utilities", value: 350 },
  { name: "Shopping", value: 148 },
];

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#3B82F6", "#EF4444"];

const lineData = [
  { month: "Jan", spending: 300 },
  { month: "Feb", spending: 500 },
  { month: "Mar", spending: 400 },
  { month: "Apr", spending: 700 },
  { month: "May", spending: 600 },
  { month: "Jun", spending: 800 },
];

export default function Reports() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-500">
          Analyze your spending patterns with detailed reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b">
        {["Monthly Summary", "Year in Review", "Top Merchants", "Tax Report"].map(
          (tab, idx) => (
            <button
              key={idx}
              className={`pb-2 text-sm font-medium ${
                idx === 0
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          )
        )}
        <select className="ml-auto border rounded-md px-3 py-1 text-sm">
          <option>June 2024</option>
          <option>May 2024</option>
          <option>April 2024</option>
        </select>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Spending</p>
          <h2 className="text-xl font-semibold">$2,450.75</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Income</p>
          <h2 className="text-xl font-semibold">$5,000.00</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Savings</p>
          <h2 className="text-xl font-semibold">$2,549.25</h2>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Spending Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Category */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-gray-600 font-medium mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-4 text-sm text-gray-500">
              {pieData.map((d, i) => (
                <div key={i} className="text-center">
                  <p className="font-medium">{d.value}</p>
                  <p>{d.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Over Time */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-gray-600 font-medium mb-4">Spending Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="spending"
                  stroke="#6366F1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-gray-700 font-medium mb-2">Export Report</h3>
        <p className="text-gray-500 text-sm mb-4">
          Download your monthly summary report in your preferred format.
        </p>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Export to PDF
          </button>
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
}
