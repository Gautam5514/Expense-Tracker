import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import AddCategoryModal from '../components/AddCategoryModal'; // Only one import needed now

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const categoryVisuals = {
  "Groceries": { icon: "🛒", color: "bg-emerald-500" },
  "Food & Dining": { icon: "🍴", color: "bg-amber-500" },
  "Transportation": { icon: "🚗", color: "bg-sky-500" },
  "Entertainment": { icon: "🎬", color: "bg-rose-500" },
  "Shopping": { icon: "🛍️", color: "bg-cyan-500" },
  "Utilities": { icon: "💡", color: "bg-yellow-500" },
  "Health & Wellness": { icon: "❤️", color: "bg-red-500" },
  "Rent": { icon: "🏠", color: "bg-slate-500" },
  "Travel": { icon: "✈️", color: "bg-teal-500" },
  "default": { icon: "💰", color: "bg-gray-500" }
};

// --- Helper Components for Loading/Error States ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent)]"></div>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold font-display">Categories</h1>
          <p className="text-sm text-[var(--ink-500)]">Curated buckets for clearer insights.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handlePreviousMonth} className="btn-ghost px-3 py-2"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-lg w-36 text-center text-[var(--ink-700)]">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={handleNextMonth} className="btn-ghost px-3 py-2"><ChevronRight size={20} /></button>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={18} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const visuals = categoryVisuals[cat.name] || categoryVisuals.default;
          return (
            <div key={cat._id} className="app-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 flex items-center justify-center rounded-xl text-white text-xl shadow ${visuals.color}`}>{visuals.icon}</div>
                  <div>
                    <p className="font-semibold text-[var(--ink-900)]">{cat.name}</p>
                    <p className="text-sm text-[var(--ink-500)]">Spent this month</p>
                  </div>
                </div>
                <div className="relative" ref={activeMenu === cat._id ? menuRef : null}>
                    <button onClick={() => handleToggleMenu(cat._id)} className="text-[var(--ink-500)] hover:text-[var(--ink-900)] p-1"><MoreVertical size={18} /></button>
                    {activeMenu === cat._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg z-20 border border-slate-100">
                            <a onClick={() => handleOpenEditModal(cat)} className="flex items-center px-4 py-2 text-sm text-[var(--ink-700)] hover:bg-slate-50 cursor-pointer"><Edit size={14} className="mr-2" /> Edit</a>
                            <a onClick={() => handleDelete(cat)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 size={14} className="mr-2" /> Delete</a>
                        </div>
                    )}
                </div>
              </div>

              <p className="text-2xl font-semibold mb-3 text-[var(--ink-900)]">{cat.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
              <p className="text-sm text-[var(--ink-500)] mb-1">Percentage of Monthly Spend</p>
              <div className="w-full h-2 bg-slate-200/70 rounded-full">
                <div className={`h-2 rounded-full ${visuals.color}`} style={{ width: `${cat.percent}%` }}></div>
              </div>
            </div>
          );
        })}

        <div onClick={handleOpenAddModal} className="flex flex-col items-center justify-center app-card-muted border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--ink-500)] transition-colors cursor-pointer">
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
