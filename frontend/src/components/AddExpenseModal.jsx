import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
    X,
    Calendar as CalendarIcon,
    UploadCloud,
    Wallet,
    LayoutGrid,
    Building,
    CreditCard,
    Tags as TagsIcon,
    FileText,
    Paperclip
} from "lucide-react";
import { Lightbulb } from "lucide-react";

// --- Sub-Components for a Cleaner Structure ---

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Enhanced InputField with Icon support
const InputField = ({ icon, label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-[var(--ink-700)] mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {icon}
            </div>
            <input
                {...props}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm shadow-sm focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]"
            />
        </div>
    </div>
);

// --- Main Modal Component ---

export default function AddExpenseModal({ isOpen, onClose, transactionToEdit, availableCategories = [] }) {
    const initialFormState = {
        amount: "", date: new Date().toISOString().split('T')[0], category: "", merchant: "",
        paymentMethod: "Credit Card", tags: "", notes: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState({ category: null, tags: [] });
    const [isSuggesting, setIsSuggesting] = useState(false);
    const fileInputRef = useRef(null);
    const isEditMode = Boolean(transactionToEdit);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                const formattedDate = transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().split('T')[0] : "";
                setFormData({
                    amount: transactionToEdit.amount || "",
                    date: formattedDate,
                    category: transactionToEdit.category || "",
                    merchant: transactionToEdit.merchant || "",
                    paymentMethod: transactionToEdit.paymentMethod || "Credit Card",
                    tags: Array.isArray(transactionToEdit.tags)
                        ? transactionToEdit.tags.join(', ')
                        : transactionToEdit.tags || "",

                    notes: transactionToEdit.notes || "",
                });
                // Note: We don't pre-fill the existing attachment for security/simplicity reasons
            } else {
                setFormData(initialFormState);
            }
        } else {
            // Reset everything when modal is not open
            setAttachment(null);
            setAttachmentPreview(null);
            setSuggestions({ category: null, tags: [] });
        }
    }, [transactionToEdit, isOpen]);

    // Cleanup attachment preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (attachmentPreview) {
                URL.revokeObjectURL(attachmentPreview);
            }
        };
    }, [attachmentPreview]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleGetSuggestions = async () => {
        const description = `${formData.merchant} ${formData.notes}`.trim();

        // Don't run for very short descriptions
        if (description.length < 3) {
            setSuggestions({ category: null, tags: [] }); // Clear old suggestions
            return;
        }

        setIsSuggesting(true);
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.post(
                `${API_URL}/api/ai/suggest-details`,
                { description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data) {
                setSuggestions(data);
                // Auto-fill category if it's empty and the AI provided one
                if (!formData.category && data.category) {
                    setFormData(prev => ({ ...prev, category: data.category }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch AI suggestions:", error);
            setSuggestions({ category: null, tags: [] }); // Clear on error
        } finally {
            setIsSuggesting(false);
        }
    };

    // ✅ NEW FUNCTION to handle clicking a suggested tag
    const handleAddTag = (tagToAdd) => {
        const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (!currentTags.includes(tagToAdd)) {
            const newTags = [...currentTags, tagToAdd].join(', ');
            setFormData(prev => ({ ...prev, tags: newTags }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            setAttachmentPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset the file input
        }
    };

    const handleSubmit = async (e, shouldCloseOnSave) => {
        e.preventDefault();
        setLoading(true);

        const apiData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'tags') {
                apiData.append(
                    key,
                    formData[key]
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean)
                        .join(',')
                );
            } else {
                apiData.append(key, formData[key]);
            }
        });



        if (attachment) apiData.append("attachment", attachment);
        apiData.append("type", "expense");

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (isEditMode) {
                await axios.put(`${API_URL}/api/transactions/${transactionToEdit._id}`, apiData, { headers });
            } else {
                await axios.post(`${API_URL}/api/transactions`, apiData, { headers });
            }

            if (shouldCloseOnSave) {
                onClose();
            } else {
                // "Save & Add Another" logic: Reset form but keep modal open
                setFormData(initialFormState);
                handleRemoveAttachment();
            }
        } catch (err) {
            alert(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to format file size for display
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            {/* Modal Panel with scrollable structure */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] border border-white/70">
                {/* Sticky Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-[var(--ink-900)]">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
                        <button onClick={onClose} className="text-[var(--ink-500)] hover:text-[var(--ink-900)]"><X size={22} /></button>
                    </div>
                </div>

                {/* Scrollable Form Body */}
                <form className="overflow-y-auto" onSubmit={(e) => handleSubmit(e, true)}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* --- Left Column --- */}
                        <div className="space-y-6">
                            <InputField icon={<Wallet size={18} className="text-[var(--ink-500)]" />} label="Amount" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" type="number" required />
                            <InputField icon={<CalendarIcon size={18} className="text-[var(--ink-500)]" />} label="Date" name="date" value={formData.date} onChange={handleChange} type="date" required />
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-[var(--ink-700)] mb-1.5">Category</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <LayoutGrid size={18} className="text-[var(--ink-500)]" />
                                    </div>
                                    <input list="category-suggestions" id="category" name="category" value={formData.category} onChange={handleChange} placeholder="Select or type a category" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm shadow-sm focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]" autoComplete="off" required />
                                    <datalist id="category-suggestions">
                                        {availableCategories.map((cat, index) => <option key={index} value={cat} />)}
                                    </datalist>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-[var(--ink-700)] mb-1.5">Payment Method</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <CreditCard size={18} className="text-[var(--ink-500)]" />
                                    </div>
                                    <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm shadow-sm focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]">
                                        <option>Credit Card</option> <option>Debit Card</option> <option>Cash</option> <option>Bank Transfer</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* --- Right Column --- */}
                        <div className="space-y-6">
                            <InputField icon={<Building size={18} className="text-[var(--ink-500)]" />} label="Merchant" name="merchant" value={formData.merchant} onChange={handleChange} onBlur={handleGetSuggestions} placeholder="e.g., Amazon, Starbucks" />
                            <InputField icon={<TagsIcon size={18} className="text-[var(--ink-500)]" />} label="Tags (comma-separated)" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., work, personal, food" />

                            {/* ✅ NEW: AI Suggestions Area */}
                            {(isSuggesting || suggestions.tags.length > 0) && (
                                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-emerald-800">
                                        <Lightbulb size={16} />
                                        <span>AI Suggestions</span>
                                    </div>
                                    {isSuggesting ? (
                                        <p className="text-xs text-emerald-700">Generating ideas...</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.tags.map(tag => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => handleAddTag(tag)}
                                                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-full hover:bg-emerald-100 transition-colors"
                                                >
                                                    + {tag}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-[var(--ink-700)] mb-1.5">Notes</label>
                                <textarea id="notes" name="notes" rows="4" value={formData.notes} onChange={handleChange} onBlur={handleGetSuggestions} placeholder="Add any details..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"></textarea>
                            </div>
                        </div>

                        {/* --- Attachment Section (spanning both columns) --- */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[var(--ink-700)] mb-1.5">Attachment</label>
                            {attachment ? (
                                <div className="mt-1 flex items-center justify-between p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <Paperclip className="h-5 w-5 text-[var(--ink-500)]" />
                                        <div className="text-sm">
                                            <p className="font-medium text-[var(--ink-900)] truncate max-w-xs">{attachment.name}</p>
                                            <p className="text-[var(--ink-500)]">{formatFileSize(attachment.size)}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleRemoveAttachment} className="text-red-500 hover:text-red-700"><X size={20} /></button>
                                </div>
                            ) : (
                                <div onClick={() => fileInputRef.current.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:border-[var(--accent)] transition-colors">
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-[var(--ink-500)]" />
                                        <p className="text-sm text-[var(--ink-700)]"><span className="font-semibold text-[var(--accent)]">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-[var(--ink-500)]">PNG, JPG, PDF up to 10MB</p>
                                    </div>
                                </div>
                            )}
                            <input id="file-upload" name="attachment" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} />
                        </div>
                    </div>
                </form>

                {/* Sticky Footer */}
                <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-2xl sticky bottom-0 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
                    {!isEditMode && (
                        <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading} className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 border border-transparent rounded-full hover:bg-emerald-200 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save & Add Another'}
                        </button>
                    )}
                    <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
                        {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Expense')}
                    </button>
                </div>
            </div>
        </div>
    );
}
