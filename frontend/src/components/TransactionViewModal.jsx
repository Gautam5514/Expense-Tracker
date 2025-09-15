import { X, Paperclip } from 'lucide-react';

const DetailRow = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

export default function TransactionViewModal({ isOpen, onClose, transaction }) {
    if (!isOpen || !transaction) return null;

    // Construct the full URL for the attachment
    // IMPORTANT: This assumes your backend is running on localhost:5000
    const API_BASE_URL = "http://localhost:5000";
    const attachmentUrl = transaction.attachment
        ? `${API_BASE_URL}/${transaction.attachment.replace(/\\/g, '/')}`
        : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <dl className="divide-y divide-gray-200">
                        <DetailRow label="Amount" value={
                            <span className={`font-semibold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                {transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </span>
                        } />
                        <DetailRow label="Date" value={new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                        <DetailRow label="Category" value={transaction.category} />
                        <DetailRow label="Merchant" value={transaction.merchant || 'N/A'} />
                        <DetailRow label="Payment Method" value={transaction.paymentMethod} />
                        <DetailRow label="Notes/Description" value={transaction.notes || 'No description provided.'} />
                        <DetailRow label="Tags" value={
                            transaction.tags && transaction.tags.length > 0
                                ? transaction.tags.map((tag, i) => (
                                    <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{tag}</span>
                                ))
                                : 'No tags'
                        } />
                        <div className="py-3">
                            <dt className="text-sm font-medium text-gray-500 mb-2">Attachment</dt>
                            <dd>
                                {attachmentUrl ? (
                                    <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block border-2 border-dashed rounded-lg p-4 hover:border-indigo-500 transition-colors">
                                        <img src={attachmentUrl} alt="Transaction Attachment" className="max-h-60 w-auto mx-auto rounded" />
                                        <p className="text-center text-sm text-indigo-600 mt-2">Click to view full image</p>
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-500">No attachment uploaded.</p>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}