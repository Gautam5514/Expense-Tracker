import { X, Calendar, Building, CreditCard, Tags, FileText, Download, Edit, Trash2, Maximize2 } from 'lucide-react';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// A self-contained Lightbox/Overlay component for viewing images
const ImageViewerOverlay = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-60 flex items-center justify-center p-4" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-70" aria-label="Close image viewer">
                <X size={32} />
            </button>
            <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Transaction Attachment Full View" className="block max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            </div>
        </div>
    );
};

// A small, reusable component for displaying details neatly
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-8 pt-1 text-slate-500">{icon}</div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-base font-semibold text-slate-800 break-words">{value}</p>
        </div>
    </div>
);

export default function TransactionViewModal({ isOpen, onClose, transaction, onEdit, onDelete }) {
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    if (!isOpen || !transaction) return null;

    const isExpense = transaction.type === 'expense';
    const attachmentUrl = transaction.attachment ? `${API_URL}/${transaction.attachment.replace(/\\/g, '/')}` : null;
    const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentUrl);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-5 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Main Amount and Merchant */}
                        <div className="text-center">
                            <p className={`text-5xl font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                                {transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </p>
                            <p className="text-lg text-slate-600 mt-2">
                               for <span className="font-semibold">{transaction.category}</span>
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                            <DetailItem icon={<Calendar size={20} />} label="Date" value={new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            <DetailItem icon={<Building size={20} />} label="Merchant" value={transaction.merchant || 'N/A'} />
                            <DetailItem icon={<CreditCard size={20} />} label="Payment Method" value={transaction.paymentMethod} />
                            <DetailItem icon={<Tags size={20} />} label="Tags" value={transaction.tags?.join(', ') || 'None'} />
                        </div>
                        
                        {/* Notes Section */}
                        {transaction.notes && (
                            <div className="pt-4 border-t">
                                 <DetailItem icon={<FileText size={20} />} label="Notes" value={transaction.notes} />
                            </div>
                        )}

                        {/* --- CORRECTED Attachment Section --- */}
                        {attachmentUrl && (
                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-slate-500 mb-2">Attachment</p>
                                <div className="border rounded-lg p-3 flex items-center gap-4">
                                    {isImage ? (
                                        // Left Side: Visible Image Thumbnail
                                        <img 
                                            src={attachmentUrl} 
                                            alt="Attachment Thumbnail" 
                                            className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-slate-100"
                                        />
                                    ) : (
                                        // Fallback icon for non-image files
                                        <div className="flex-shrink-0 p-4 bg-slate-100 rounded-lg">
                                            <FileText size={24} className="text-slate-600" />
                                        </div>
                                    )}
                                    {/* Right Side: Info and Action Buttons */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {transaction.attachment.split('-').slice(1).join('-')}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {isImage ? 'Image File' : 'Document'}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            {isImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsImageViewerOpen(true)}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
                                                >
                                                    <Maximize2 size={14} /> View Full Size
                                                </button>
                                            )}
                                            <a
                                                href={attachmentUrl}
                                                download
                                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                                            >
                                                <Download size={14} /> Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-xl border-t">
                        <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100">
                            <Edit size={16} /> Edit
                        </button>
                        <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-lg hover:bg-red-100">
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* The Image Viewer Overlay remains the same */}
            <ImageViewerOverlay 
                isOpen={isImageViewerOpen}
                onClose={() => setIsImageViewerOpen(false)}
                imageUrl={attachmentUrl}
            />
        </>
    );
}