import { useState, useEffect } from "react";
import axios from "axios";
import AddCategoryModal from '../components/AddCategoryModal'; // Import the new modal

// Helper object to map categories to visuals. This is cleaner than storing icons in the DB.
const categoryVisuals = {
  "Groceries": { icon: "🛒", color: "bg-green-500" },
  "Food & Dining": { icon: "🍴", color: "bg-orange-500" },
  "Transportation": { icon: "🚗", color: "bg-blue-500" },
  "Entertainment": { icon: "🎬", color: "bg-pink-500" },
  "Shopping": { icon: "🛍️", color: "bg-cyan-500" },
  "Utilities": { icon: "💡", color: "bg-yellow-500" },
  "Health & Wellness": { icon: "❤️", color: "bg-red-500" },
  "Rent": { icon: "🏠", color: "bg-purple-500" },
  "Travel": { icon: "✈️", color: "bg-indigo-500" },
  "default": { icon: "💰", color: "bg-gray-500" } // Fallback for any other category
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data.categories);
    } catch (err) {
      setError("Could not fetch category data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchData(); // Refresh data after adding a new category
  };

  if (loading) return <div>Loading Categories...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
          + New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const visuals = categoryVisuals[cat.name] || categoryVisuals.default;
          return (
            <div key={cat.name} className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-white text-xl ${visuals.color}`}>
                    {visuals.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-gray-500">Total Spent</p>
                  </div>
                </div>
                {/* Future feature: dropdown menu for edit/delete */}
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>

              <p className="text-2xl font-bold mb-3">
                {cat.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </p>

              <p className="text-sm text-gray-500 mb-1">Percentage of Total Spend</p>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${visuals.color}`}
                  style={{ width: `${cat.percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        {/* Add new category card */}
        <div onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 hover:text-indigo-600 text-gray-500 transition-colors cursor-pointer">
          <span className="text-3xl">＋</span>
          <p className="mt-2 font-medium">Add New Category</p>
        </div>
      </div>

      <AddCategoryModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}