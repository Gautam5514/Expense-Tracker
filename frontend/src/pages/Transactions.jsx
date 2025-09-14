import { useState } from "react";
import { Search, Filter, Download, MoreHorizontal } from "lucide-react";

export default function Transactions() {
  const [selectedRows, setSelectedRows] = useState([0, 1]); // demo checked

  const transactions = [
    {
      date: "Jul 26, 2024",
      description: "Grocery shopping at SuperMart",
      category: "Groceries",
      categoryColor: "bg-green-100 text-green-600",
      amount: -75.5,
      payment: "Credit Card",
      tags: ["Food"],
    },
    {
      date: "Jul 25, 2024",
      description: "Dinner at The Bistro",
      category: "Dining",
      categoryColor: "bg-blue-100 text-blue-600",
      amount: -45.0,
      payment: "Cash",
      tags: ["Food"],
    },
    {
      date: "Jul 24, 2024",
      description: "Monthly rent payment",
      category: "Rent",
      categoryColor: "bg-orange-100 text-orange-600",
      amount: -1500.0,
      payment: "Bank Transfer",
      tags: ["Housing"],
    },
    {
      date: "Jul 23, 2024",
      description: "Gasoline for car",
      category: "Transportation",
      categoryColor: "bg-indigo-100 text-indigo-600",
      amount: -40.0,
      payment: "Credit Card",
      tags: ["Car"],
    },
    {
      date: "Jul 22, 2024",
      description: "Online shopping at FashionHub",
      category: "Shopping",
      categoryColor: "bg-pink-100 text-pink-600",
      amount: -120.0,
      payment: "Credit Card",
      tags: ["Clothes"],
    },
    {
      date: "Jul 17, 2024",
      description: "Salary deposit",
      category: "Income",
      categoryColor: "bg-green-100 text-green-600",
      amount: 3000.0,
      payment: "Bank Transfer",
      tags: ["Salary"],
    },
  ];

  const toggleRow = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
          + New Transaction
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 shadow rounded-lg mb-6">
        <div className="flex items-center space-x-2 flex-1">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="flex-1 outline-none text-sm"
          />
        </div>
        <div className="flex space-x-2 ml-4">
          <button className="flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
            <Filter size={16} className="mr-1" /> Filters
          </button>
          <button className="flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
            <Download size={16} className="mr-1" /> Export
          </button>
        </div>
        <div className="ml-4 text-sm text-gray-500">
          {selectedRows.length} rows selected
        </div>
        <div className="flex space-x-2 ml-4">
          <button className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
            Edit
          </button>
          <button className="px-3 py-2 text-sm border rounded-md text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Tags</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr
                key={idx}
                className={`border-b hover:bg-gray-50 ${
                  selectedRows.includes(idx) ? "bg-purple-50" : ""
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(idx)}
                    onChange={() => toggleRow(idx)}
                  />
                </td>
                <td className="p-3">{t.date}</td>
                <td className="p-3">{t.description}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${t.categoryColor}`}
                  >
                    {t.category}
                  </span>
                </td>
                <td
                  className={`p-3 font-semibold ${
                    t.amount < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {t.amount < 0 ? `-$${Math.abs(t.amount)}` : `+$${t.amount}`}
                </td>
                <td className="p-3">{t.payment}</td>
                <td className="p-3">
                  {t.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="p-3 text-gray-400">
                  <MoreHorizontal size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <p>Showing 1 to 6 of 24 transactions</p>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
