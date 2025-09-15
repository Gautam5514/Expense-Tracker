import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function AddCategoryModal({ isOpen, onClose }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            await axios.post('http://localhost:5000/api/categories', { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onClose(); // Close and trigger refresh in parent
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add category.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Create New Category</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Health & Wellness"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-xl">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow disabled:opacity-50">{loading ? 'Saving...' : 'Save Category'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}