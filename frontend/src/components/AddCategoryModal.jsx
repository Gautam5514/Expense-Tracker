// src/components/AddCategoryModal.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AddCategoryModal({ isOpen, onClose, categoryToEdit }) {
    // Determine mode based on the presence of categoryToEdit prop
    const isEditMode = Boolean(categoryToEdit);

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // This effect runs when the modal opens or the item to edit changes.
    // It pre-fills the form for editing or clears it for adding.
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(categoryToEdit.name);
            } else {
                setName('');
            }
            setError(null); // Clear previous errors when modal opens
        }
    }, [isOpen, categoryToEdit, isEditMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name) {
            setError('Category name cannot be empty.');
            return;
        }
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            if (isEditMode) {
                // --- EDIT LOGIC ---
                if (name === categoryToEdit.name) {
                    setError('Please provide a new name.');
                    setLoading(false);
                    return;
                }
                await axios.put(`${API_URL}/api/categories/update-name`, 
                    { oldName: categoryToEdit.name, newName: name }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // --- ADD LOGIC ---
                await axios.post(`${API_URL}/api/categories`, 
                    { name }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            onClose(); // Success: close modal and trigger refresh in parent
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} category.`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };
    
    // Dynamic text for UI elements based on mode
    const title = isEditMode ? 'Edit Category' : 'Create New Category';
    const buttonText = isEditMode ? 'Save Changes' : 'Save Category';
    const labelText = isEditMode ? 'New Category Name' : 'Category Name';


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/70">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[var(--ink-900)]">{title}</h2>
                    <button onClick={handleClose} className="text-[var(--ink-500)] hover:text-[var(--ink-900)]"><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="name" className="block text-sm font-medium text-[var(--ink-700)] mb-1">{labelText}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Health & Wellness"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                            required
                        />
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-2xl">
                        <button type="button" onClick={handleClose} className="btn-secondary text-sm">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-50">
                            {loading ? 'Saving...' : buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
