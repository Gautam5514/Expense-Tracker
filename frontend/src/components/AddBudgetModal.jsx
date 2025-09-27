// src/components/AddBudgetModal.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AddBudgetModal({ isOpen, onClose, budgetToEdit }) {
    const isEditMode = Boolean(budgetToEdit);

    const [formData, setFormData] = useState({ category: "", limit: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({ category: budgetToEdit.category, limit: budgetToEdit.limit });
            } else {
                setFormData({ category: "", limit: "" });
            }
            setError(null);
        }
    }, [isOpen, budgetToEdit, isEditMode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.category || !formData.limit || parseFloat(formData.limit) <= 0) {
            setError("Category and a positive limit are required.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                category: formData.category,
                limit: parseFloat(formData.limit),
            };

            if (isEditMode) {
                // --- EDIT LOGIC ---
                await axios.put(`${API_URL}/api/budgets/${budgetToEdit._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // --- ADD LOGIC ---
                await axios.post(`${API_URL}/api/budgets`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => onClose();
    
    const title = isEditMode ? "Edit Budget" : "Create New Budget";
    const buttonText = isEditMode ? "Save Changes" : "Save Budget";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                            <input
                                type="text" id="category" name="category" value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g., Groceries"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                required
                                disabled={isEditMode} // Category cannot be changed when editing
                            />
                        </div>
                        <div>
                            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                <input
                                    type="number" id="limit" name="limit" value={formData.limit}
                                    onChange={handleChange}
                                    placeholder="1000" min="0" step="0.01"
                                    className="w-full pl-7 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-xl">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow disabled:opacity-50">
                            {loading ? "Saving..." : buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}