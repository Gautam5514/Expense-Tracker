import { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Legend,
} from "recharts";

import "jspdf-autotable";


const COLORS = ["#1F8A82", "#C9A26A", "#4B9FD8", "#E07A5F", "#5B6078", "#7BB0A8"];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent)]"></div>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const generateDateOptions = () => {
    const options = [];
    // Always add your sample data's date for testing
    options.push({ value: '2025-9', label: 'September 2025' });

    const date = new Date();
    for (let i = 0; i < 12; i++) {
        const value = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!options.some(opt => opt.value === value)) {
            options.push({
                value: value,
                label: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
            });
        }
        date.setMonth(date.getMonth() - 1);
    }
    return options;
};

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dateOptions = generateDateOptions();
  // Default to your sample data date for easy testing
 const [selectedDate, setSelectedDate] = useState(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [year, month] = selectedDate.split('-');
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/reports/monthly-summary?year=${year}&month=${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportData(res.data.data);
      } catch (err) {
        setError("Failed to fetch report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const handleExportCSV = () => {
    if (!reportData) return;
    const headers = ["Category", "Amount"];
    const rows = reportData.spendingByCategory.map(item => [item.name, item.value]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const handleExportPDF = async () => {
    try {
        const [year, month] = selectedDate.split('-');
        const token = localStorage.getItem("token");

        // 1. Make an authorized API request using Axios.
        // The key is `responseType: 'blob'`, which tells Axios to expect a file.
        const response = await axios.get(`${API_URL}/api/reports/monthly-summary/download-pdf?year=${year}&month=${month}`, {
            headers: {
                Authorization: `Bearer ${token}` // Send the token in the header
            },
            responseType: 'blob', // IMPORTANT: This is the key to handling file downloads
        });

        // 2. Create a Blob from the PDF data.
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

        // 3. Create a temporary URL for the Blob.
        const url = window.URL.createObjectURL(pdfBlob);
        
        // 4. Create a temporary <a> link element to trigger the download.
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report-${year}-${month}.pdf`); // Set the desired filename
        
        // 5. Append the link to the body, click it, and then remove it.
        document.body.appendChild(link);
        link.click();
        
        // Clean up by revoking the object URL and removing the link
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

    } catch (error) {
        console.error("Failed to download PDF report:", error);
        alert("Could not download the report. Please try again.");
    }
  };

  const {
    summary = { totalSpending: 0, totalIncome: 0, netSavings: 0, remainingBalance: 0 },
    spendingByCategory = [],
    spendingOverTime = []
  } = reportData || {};


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!reportData) return <div>No data available for this period.</div>;
      const hasData = summary.totalSpending > 0 || summary.totalIncome > 0;

  return (
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold font-display">Reports</h1>
        <p className="text-[var(--ink-500)]">Elegant breakdowns for smarter decisions.</p>
      </div>

      <div className="flex justify-between items-center app-card p-4">
        <p className="font-semibold text-[var(--ink-700)]">Monthly Summary</p>
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border border-slate-200 rounded-full px-4 py-2 text-sm bg-white/80 focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]">
          {dateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      
      {!hasData ? (
        <div className="text-center py-12 app-card">
          <h3 className="text-lg font-medium text-[var(--ink-900)]">No transactions found for this period.</h3>
          <p className="text-[var(--ink-500)] mt-1">Try selecting another month or adding some transactions.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="app-card p-4">
              <p className="text-[var(--ink-500)] text-sm uppercase tracking-wide">Total Spending</p>
              {/* Now this line is safe because `summary` will always be an object */}
              <h2 className="text-xl font-semibold text-[var(--ink-900)]">{summary.totalSpending.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
            </div>
            <div className="app-card p-4">
              <p className="text-[var(--ink-500)] text-sm uppercase tracking-wide">Income</p>
              <h2 className="text-xl font-semibold text-[var(--ink-900)]">{summary.totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
            </div>
            <div className={`app-card p-4 ${summary.remainingBalance < 0 ? 'bg-red-50/70 border-red-100' : ''}`}>
              <p className="text-[var(--ink-500)] text-sm uppercase tracking-wide">{summary.remainingBalance < 0 ? 'Overspent' : 'Remaining'}</p>
              <h2 className={`text-xl font-semibold ${summary.remainingBalance < 0 ? 'text-red-600' : 'text-[var(--ink-900)]'}`}>
                {summary.remainingBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </h2>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-[var(--ink-900)]">Spending Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="app-card p-4">
                <h3 className="text-[var(--ink-700)] font-medium mb-4">By Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    {/* `spendingByCategory` will always be an array */}
                    <Pie data={spendingByCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label>
                      {spendingByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="app-card p-4">
                <h3 className="text-[var(--ink-700)] font-medium mb-4">Spending Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  {/* `spendingOverTime` will always be an array */}
                  <LineChart data={spendingOverTime}>
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value}`}/>
                    <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/>
                    <Legend />
                    <Line type="monotone" dataKey="spending" stroke="#1F8A82" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="app-card p-4">
            <h3 className="text-[var(--ink-700)] font-medium mb-2">Export Report</h3>
            <p className="text-[var(--ink-500)] text-sm mb-4">Download your monthly summary report in your preferred format.</p>
            <div className="flex space-x-3">
              <button onClick={handleExportPDF} className="btn-primary text-sm">Export to PDF</button>
              <button onClick={handleExportCSV} className="btn-secondary text-sm">Export to CSV</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
