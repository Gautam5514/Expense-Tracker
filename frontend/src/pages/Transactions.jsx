import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Search, Filter, Download, MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';
import { toast } from 'react-toastify';
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

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Transactions() {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed

      // Append year and month to the request URL
      const res = await axios.get(`${API_URL}/api/transactions?year=${year}&month=${month}`, {
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

  // --- MODIFIED: useEffect now re-fetches data when currentDate changes ---
  useEffect(() => {
    fetchData();
  }, [currentDate]); // Dependency array includes currentDate

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

   const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    setCurrentPage(1); // Reset to first page
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    setCurrentPage(1); // Reset to first page
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
    // 1. Show the confirmation modal
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${idsToDelete.length} transaction(s). This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5', // Indigo
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      // 2. Check if the user confirmed
      if (result.isConfirmed) {
        try {
          // 3. If confirmed, proceed with the deletion logic
          const token = localStorage.getItem("token");
          const deletePromises = idsToDelete.map(id =>
            axios.delete(`${API_URL}/api/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          );
          await Promise.all(deletePromises);
          
          // Show a success toast after deletion
          toast.success('Transaction(s) deleted successfully!');
          
          setSelectedRows(prev => prev.filter(id => !idsToDelete.includes(id)));
          fetchData(); // Refresh list
        } catch (err) { 
          // Show an error toast if deletion fails
          toast.error("An error occurred while deleting transactions.");
        }
        setActiveMenu(null); // Close dropdown
      }
    });
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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
              <button onClick={handlePreviousMonth} className="p-2 rounded-md hover:bg-gray-100">
                  <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-lg w-36 text-center">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100">
                  <ChevronRight size={20} />
              </button>
          </div>
          <button onClick={handleOpenNewModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
            + New Transaction
          </button>
        </div>
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
   <AddExpenseModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseModals} 
        transactionToEdit={activeTransaction} 
        availableCategories={paginatedTransactions.map(t => t.category).filter((v, i, a) => a.indexOf(v) === i)} // Pass unique categories
      />
        <TransactionViewModal 
        isOpen={isViewModalOpen} 
        onClose={handleCloseModals} 
        transaction={activeTransaction}
        // Pass handler functions for the Edit and Delete buttons inside the modal
        onEdit={() => {
            // Close the view modal and immediately open the edit modal
            setIsViewModalOpen(false);
            handleOpenEditModal(activeTransaction);
        }}
        onDelete={() => {
            // Close the view modal and trigger the delete confirmation
            setIsViewModalOpen(false);
            handleDelete([activeTransaction._id]);
        }}
      />
    </div>
  );
}