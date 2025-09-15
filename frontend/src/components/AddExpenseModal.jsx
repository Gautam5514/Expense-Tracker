import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { X, Calendar as CalendarIcon, UploadCloud } from "lucide-react";

// Helper component for form rows
const FormRow = ({ children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {name === "date" && <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
        </div>
    </div>
);

export default function AddExpenseModal({ isOpen, onClose, transactionToEdit, availableCategories = [] }) {
    const initialFormState = {
        amount: "", date: "", category: "Groceries", merchant: "",
        paymentMethod: "Credit Card", tags: "", notes: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // This useEffect hook pre-fills the form when in "edit" mode
    useEffect(() => {
        if (transactionToEdit) {
            // Format the date correctly for the input type="date"
            const formattedDate = transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().split('T')[0] : "";
            setFormData({
                amount: transactionToEdit.amount || "",
                date: formattedDate,
                category: transactionToEdit.category || "Groceries",
                merchant: transactionToEdit.merchant || "",
                paymentMethod: transactionToEdit.paymentMethod || "Credit Card",
                tags: Array.isArray(transactionToEdit.tags) ? transactionToEdit.tags.join(', ') : "",
                notes: transactionToEdit.notes || "",
            });
        } else {
            setFormData(initialFormState);
        }
    }, [transactionToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) setAttachment(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const apiData = new FormData();
        Object.keys(formData).forEach(key => apiData.append(key, formData[key]));
        if (attachment) apiData.append("attachment", attachment);
        apiData.append("type", "expense"); // Ensure type is set

        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            };

            if (transactionToEdit) {
                // UPDATE existing transaction (PUT request)
                await axios.put(`http://localhost:5000/api/transactions/${transactionToEdit._id}`, apiData, { headers });
                alert("Transaction updated successfully!");
            } else {
                // CREATE new transaction (POST request)
                await axios.post("http://localhost:5000/api/transactions", apiData, { headers });
                alert("Transaction added successfully!");
            }
            onClose(); // Close modal and trigger data refresh
        } catch (err) {
            alert(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Add Expense</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form>
                    <div className="p-6 space-y-6">
                        <FormRow>
                            <InputField label="Amount" name="amount" value={formData.amount} onChange={handleChange} placeholder="$0.00" type="number" />
                            <InputField label="Date" name="date" value={formData.date} onChange={handleChange} placeholder="mm/dd/yyyy" type="date" />
                        </FormRow>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            {/* V-- THIS IS THE KEY CHANGE --V */}
                            <input
                                list="category-suggestions"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Select or type a category"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                autoComplete="off"
                            />
                            <datalist id="category-suggestions">
                                {availableCategories.map((cat, index) => (
                                    <option key={index} value={cat} />
                                ))}
                            </datalist>
                        </div>

                        <InputField label="Merchant" name="merchant" value={formData.merchant} onChange={handleChange} placeholder="e.g., Trader Joe's" />

                        <FormRow>
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option>Credit Card</option> <option>Debit Card</option> <option>Cash</option> <option>Bank Transfer</option>
                                </select>
                            </div>
                            <InputField label="Tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="Add tags, comma separated" />
                        </FormRow>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Any additional details..." className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                            <div onClick={() => fileInputRef.current.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer">
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-indigo-600">Upload a file</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                    {attachment && <p className="text-sm text-green-600 mt-2">Selected: {attachment.name}</p>}
                                </div>
                                <input id="file-upload" name="attachment" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 flex justify-end space-x-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-lg hover:bg-gray-300 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save & Add Another'}
                        </button>
                        <button type="submit" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}