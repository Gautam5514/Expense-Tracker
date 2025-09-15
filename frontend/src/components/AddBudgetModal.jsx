import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function AddBudgetModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({ category: "", limit: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Don't render the component if it's not open
    if (!isOpen) return null;

    // <-- THE MISSING FUNCTION IS HERE
    // This function updates the form's state every time you type
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // Basic client-side validation
        if (!formData.category || !formData.limit) {
            setError("Both category and limit are required.");
            return;
        }
        if (parseFloat(formData.limit) <= 0) {
            setError("Budget limit must be a positive number.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/budgets",
                {
                    category: formData.category,
                    limit: parseFloat(formData.limit),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // On success, close the modal (which will trigger a data refresh in the parent)
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Reset form state when the modal is closed (via the onClose prop)
    const handleClose = () => {
        setFormData({ category: "", limit: "" });
        setError(null);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Create New Budget</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange} // This line now works correctly
                                placeholder="e.g., Groceries"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Limit
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                <input
                                    type="number"
                                    id="limit"
                                    name="limit"
                                    value={formData.limit}
                                    onChange={handleChange} // This line also now works correctly
                                    placeholder="1000"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-7 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Footer with buttons */}
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-xl">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Budget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}