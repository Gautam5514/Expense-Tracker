import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import AddCategoryModal from '../components/AddCategoryModal'; // Only one import needed now

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  "default": { icon: "💰", color: "bg-gray-500" }
};

// --- Helper Components for Loading/Error States ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  // Simplified state for the single modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null); // This determines the modal's mode
  
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const res = await axios.get(`${API_URL}/api/categories?year=${year}&month=${month}`, {
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
  }, [currentDate]);

  const handlePreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToggleMenu = (categoryId) => setActiveMenu(activeMenu === categoryId ? null : categoryId);

  // --- MODIFIED: Modal open handlers ---
  const handleOpenAddModal = () => {
    setCategoryToEdit(null); // No category means "Add Mode"
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setCategoryToEdit(category); // Passing a category means "Edit Mode"
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null); // Clean up state
    fetchData(); // Always refresh data after a modal closes
  };

  const handleDelete = async (category) => {
    setActiveMenu(null);
    if (window.confirm(`Delete "${category.name}"? This also removes it from your category list.`)) {
      try {
        await axios.delete(`${API_URL}/api/categories/${category._id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        alert('Failed to delete category.');
      }
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex items-center gap-2">
            <button onClick={handlePreviousMonth} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-lg w-36 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight size={20} /></button>
        </div>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
            <PlusCircle size={18} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const visuals = categoryVisuals[cat.name] || categoryVisuals.default;
          return (
            <div key={cat._id} className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-white text-xl ${visuals.color}`}>{visuals.icon}</div>
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-gray-500">Spent this month</p>
                  </div>
                </div>
                <div className="relative" ref={activeMenu === cat._id ? menuRef : null}>
                    <button onClick={() => handleToggleMenu(cat._id)} className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical size={18} /></button>
                    {activeMenu === cat._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border">
                            <a onClick={() => handleOpenEditModal(cat)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><Edit size={14} className="mr-2" /> Edit</a>
                            <a onClick={() => handleDelete(cat)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 size={14} className="mr-2" /> Delete</a>
                        </div>
                    )}
                </div>
              </div>

              <p className="text-2xl font-bold mb-3">{cat.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
              <p className="text-sm text-gray-500 mb-1">Percentage of Monthly Spend</p>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className={`h-2 rounded-full ${visuals.color}`} style={{ width: `${cat.percent}%` }}></div>
              </div>
            </div>
          );
        })}

        <div onClick={handleOpenAddModal} className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 hover:text-indigo-600 text-gray-500 transition-colors cursor-pointer">
          <span className="text-3xl">＋</span>
          <p className="mt-2 font-medium">Add New Category</p>
        </div>
      </div>

      {/* The single modal component handles both modes */}
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
}