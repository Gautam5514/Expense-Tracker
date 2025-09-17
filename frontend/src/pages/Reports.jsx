import { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Legend,
} from "recharts";

import "jspdf-autotable";


const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

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
  const [selectedDate, setSelectedDate] = useState('2025-9');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [year, month] = selectedDate.split('-');
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/reports/monthly-summary?year=${year}&month=${month}`, {
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
        const response = await axios.get(`http://localhost:5000/api/reports/monthly-summary/download-pdf?year=${year}&month=${month}`, {
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
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-500">Analyze your spending patterns with detailed reports.</p>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-700">Monthly Summary</p>
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
          {dateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      
      {!hasData ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">No transactions found for this period.</h3>
          <p className="text-gray-500 mt-1">Try selecting another month or adding some transactions.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <p className="text-gray-500 text-sm">Total Spending</p>
              {/* Now this line is safe because `summary` will always be an object */}
              <h2 className="text-xl font-semibold">{summary.totalSpending.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4">
              <p className="text-gray-500 text-sm">Income</p>
              <h2 className="text-xl font-semibold">{summary.totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
            </div>
            <div className={`bg-white shadow-sm rounded-lg p-4 ${summary.remainingBalance < 0 ? 'bg-red-50' : ''}`}>
              <p className="text-gray-500 text-sm">{summary.remainingBalance < 0 ? 'Overspent' : 'Remaining'}</p>
              <h2 className={`text-xl font-semibold ${summary.remainingBalance < 0 ? 'text-red-600' : ''}`}>
                {summary.remainingBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </h2>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Spending Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow-sm rounded-lg p-4">
                <h3 className="text-gray-600 font-medium mb-4">By Category</h3>
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
              <div className="bg-white shadow-sm rounded-lg p-4">
                <h3 className="text-gray-600 font-medium mb-4">Spending Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  {/* `spendingOverTime` will always be an array */}
                  <LineChart data={spendingOverTime}>
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value}`}/>
                    <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/>
                    <Legend />
                    <Line type="monotone" dataKey="spending" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-gray-700 font-medium mb-2">Export Report</h3>
            <p className="text-gray-500 text-sm mb-4">Download your monthly summary report in your preferred format.</p>
            <div className="flex space-x-3">
              <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Export to PDF</button>
              <button onClick={handleExportCSV} className="px-4 py-2 border rounded-md hover:bg-gray-50">Export to CSV</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}