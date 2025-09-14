export default function Categories() {
  const categories = [
    { name: "Food & Dining", total: 540, percent: 50, color: "bg-purple-500", icon: "🍴" },
    { name: "Transportation", total: 220, percent: 20, color: "bg-blue-500", icon: "🚗" },
    { name: "Entertainment", total: 110, percent: 10, color: "bg-pink-500", icon: "🎬" },
    { name: "Shopping", total: 110, percent: 10, color: "bg-cyan-500", icon: "🛍️" },
    { name: "Utilities", total: 110, percent: 10, color: "bg-green-500", icon: "💡" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
          + New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white shadow rounded-lg p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-white ${cat.color}`}>
                  {cat.icon}
                </div>
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-sm text-gray-500">Monthly Total</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            {/* Amount */}
            <p className="text-2xl font-bold mb-3">${cat.total.toFixed(2)}</p>

            {/* Progress */}
            <p className="text-sm text-gray-500 mb-1">Percentage of Spend</p>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${cat.color}`}
                style={{ width: `${cat.percent}%` }}
              ></div>
            </div>
          </div>
        ))}

        {/* Add new category card */}
        <div className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 cursor-pointer">
          <span className="text-3xl">＋</span>
          <p className="mt-2 text-gray-500">Add New Category</p>
        </div>
      </div>
    </div>
  );
}
