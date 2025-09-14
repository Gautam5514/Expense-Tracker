import Sidebar from "../components/Sidebar";

const budgets = [
  { name: "Food & Dining", spent: 750, limit: 1000, color: "bg-purple-600" },
  { name: "Transportation", spent: 250, limit: 500, color: "bg-purple-500" },
  { name: "Entertainment", spent: 600, limit: 500, color: "bg-red-500", warning: "Forecast to be $150 overspent." },
  { name: "Shopping", spent: 300, limit: 1000, color: "bg-cyan-500" },
  { name: "Utilities", spent: 195, limit: 300, color: "bg-cyan-400" },
  { name: "Health & Wellness", spent: 170, limit: 200, color: "bg-purple-600", warning: "Nearing budget limit." },
];

export default function Budgets() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Budgets Overview</h1>
            <p className="text-gray-500">
              Track your spending against your set budgets.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              + Add Expense
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              + Add Income
            </button>
          </div>
        </div>

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b, i) => {
            const percent = Math.round((b.spent / b.limit) * 100);
            const remaining = b.limit - b.spent;
            const overspent = b.spent > b.limit;

            return (
              <div
                key={i}
                className={`p-5 rounded-lg border ${
                  overspent ? "border-red-300 bg-red-50" : "bg-white shadow"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">{b.name}</h2>
                  <span
                    className={`text-sm font-medium ${
                      overspent ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                  <div
                    className={`h-2 rounded-full ${b.color}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm mb-1">
                  <span
                    className={
                      overspent ? "text-red-600" : "text-gray-500 font-medium"
                    }
                  >
                    {overspent
                      ? `$${Math.abs(remaining)} overspent`
                      : `$${remaining} remaining`}
                  </span>
                  <span className="font-medium">
                    ${b.spent} / ${b.limit}
                  </span>
                </div>

                {b.warning && (
                  <p
                    className={`text-xs mt-1 ${
                      overspent ? "text-red-600" : "text-yellow-600"
                    }`}
                  >
                    {overspent ? "⚠️ " : "!"} {b.warning}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
