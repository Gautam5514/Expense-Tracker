import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Search, Filter, Download, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

// Import your modal components (adjust paths as necessary)
import AddExpenseModal from "../components/AddExpenseModal";
import TransactionViewModal from "../components/TransactionViewModal";

const ROWS_PER_PAGE = 10;

// Helper to assign colors to categories for better visualization
const categoryColors = {
  Groceries: "bg-green-100 text-green-600",
  Dining: "bg-blue-100 text-blue-600",
  Rent: "bg-orange-100 text-orange-600",
  Transportation: "bg-indigo-100 text-indigo-600",
  Shopping: "bg-pink-100 text-pink-600",
  Income: "bg-emerald-100 text-emerald-600",
  Utilities: "bg-cyan-100 text-cyan-600",
  default: "bg-gray-100 text-gray-600",
};

export default function Transactions() {
  // Data and API State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null); // Tracks which '...' menu is open

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null); // For viewing or editing

  const menuRef = useRef(null);

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.data.transactions);
      setError(null);
    } catch (err) {
      setError("Failed to fetch transactions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Memos for Performance ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      (t.notes?.toLowerCase() || t.category.toLowerCase() || t.merchant?.toLowerCase()).includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredTransactions.slice(start, start + ROWS_PER_PAGE);
  }, [filteredTransactions, currentPage]);
  
  const totalPages = Math.ceil(filteredTransactions.length / ROWS_PER_PAGE);

  // --- Event Handlers ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedTransactions.map(t => t._id));
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleToggleRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleToggleMenu = (transactionId) => {
    setActiveMenu(activeMenu === transactionId ? null : transactionId);
  };

  // --- Modal Management ---
  const handleOpenViewModal = (transaction) => {
    setActiveTransaction(transaction);
    setIsViewModalOpen(true);
    setActiveMenu(null);
  };
  
  const handleOpenEditModal = (transaction) => {
    setActiveTransaction(transaction);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenNewModal = () => {
    setActiveTransaction(null); // Ensure it opens in "create" mode
    setIsEditModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setActiveTransaction(null);
    fetchData(); // Always refresh data after a modal is closed
  };

  // --- CRUD and Other Actions ---
  const handleDelete = async (idsToDelete) => {
    const confirmMessage = `Are you sure you want to delete ${idsToDelete.length} transaction(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem("token");
      const deletePromises = idsToDelete.map(id =>
        axios.delete(`http://localhost:5000/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      );
      await Promise.all(deletePromises);
      setSelectedRows(prev => prev.filter(id => !idsToDelete.includes(id)));
      fetchData(); // Refresh list
    } catch (err) { 
      alert("An error occurred while deleting transactions.");
    }
    setActiveMenu(null); // Close dropdown
  };

  const handleExportCSV = () => {
      const headers = ["Date", "Description (Notes)", "Category", "Amount", "Payment Method", "Tags", "Merchant"];
      const rows = filteredTransactions.map(t => [
          `"${new Date(t.date).toLocaleDateString()}"`,
          `"${t.notes || ''}"`,
          `"${t.category}"`,
          t.amount,
          `"${t.paymentMethod}"`,
          `"${t.tags.join('; ')}"`,
          `"${t.merchant || ''}"`
      ].join(','));

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "transactions_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Effect to close dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <div className="text-center p-8">Loading transactions...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={handleOpenNewModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
          + New Transaction
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 shadow rounded-lg mb-6 flex-wrap gap-4">
        <div className="flex items-center space-x-2 flex-1 min-w-[250px]">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by description, category..."
            className="w-full outline-none text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50"><Filter size={16} className="mr-1" /> Filters</button>
          <button onClick={handleExportCSV} className="flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50"><Download size={16} className="mr-1" /> Export</button>
          {selectedRows.length > 0 && (
            <>
              <div className="h-6 border-l mx-2"></div>
              <div className="text-sm text-gray-500">{selectedRows.length} selected</div>
              <button onClick={() => handleDelete(selectedRows)} className="px-3 py-2 text-sm border rounded-md text-red-600 hover:bg-red-50">Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="p-3"><input type="checkbox" onChange={handleSelectAll} checked={paginatedTransactions.length > 0 && selectedRows.length === paginatedTransactions.length} /></th>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Tags</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t) => (
              <tr key={t._id} className={`border-b hover:bg-gray-50 ${selectedRows.includes(t._id) ? "bg-indigo-50" : ""}`}>
                <td className="p-3"><input type="checkbox" checked={selectedRows.includes(t._id)} onChange={() => handleToggleRow(t._id)} /></td>
                <td className="p-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 font-medium text-gray-800 max-w-[250px] truncate" title={t.notes}>{t.notes || t.category}</td>
                <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${categoryColors[t.category] || categoryColors.default}`}>{t.category}</span></td>
                <td className="p-3 max-w-[200px] truncate">{t.tags?.join(', ') || 'N/A'}</td>
                <td className={`p-3 font-semibold text-right ${t.type === 'expense' ? "text-red-500" : "text-green-600"}`}>
                  {t.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </td>
                <td className="p-3">{t.paymentMethod}</td>
                <td className="p-3 text-center">
                  <div className="relative" ref={activeMenu === t._id ? menuRef : null}>
                    <button onClick={() => handleToggleMenu(t._id)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full"><MoreHorizontal size={18} /></button>
                    {activeMenu === t._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border">
                        <a onClick={() => handleOpenViewModal(t)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><Eye size={14} className="mr-2" /> View</a>
                        <a onClick={() => handleOpenEditModal(t)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><Edit size={14} className="mr-2" /> Edit</a>
                        <a onClick={() => handleDelete([t._id])} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 size={14} className="mr-2" /> Delete</a>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <p>Showing {Math.min(filteredTransactions.length, (currentPage - 1) * ROWS_PER_PAGE + 1)} to {Math.min(filteredTransactions.length, currentPage * ROWS_PER_PAGE)} of {filteredTransactions.length} transactions</p>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      </div>
      
      {/* Modals */}
      <AddExpenseModal isOpen={isEditModalOpen} onClose={handleCloseModals} transactionToEdit={activeTransaction} />
      <TransactionViewModal isOpen={isViewModalOpen} onClose={handleCloseModals} transaction={activeTransaction} />
    </div>
  );
}