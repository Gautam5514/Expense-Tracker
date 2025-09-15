import { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Legend,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from 'jspdf-autotable'; 

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

// Helper function to generate month/year options for the dropdown
const generateDateOptions = () => {
  const options = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    options.push({
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
      // THIS IS THE CORRECTED LINE:
      label: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
    });
    date.setMonth(date.getMonth() - 1);
  }
  return options;
};

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dateOptions = generateDateOptions();
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);

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
  }, [selectedDate]); // Refetch when the selected date changes

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

  const handleExportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    const [year, month] = selectedDate.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    // Title
    doc.setFontSize(20);
    doc.text(`Monthly Report - ${monthName} ${year}`, 14, 22);

    // Summary
    doc.setFontSize(12);
    doc.text(`Total Income: ${reportData.summary.totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, 14, 40);
    doc.text(`Total Spending: ${reportData.summary.totalSpending.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, 14, 48);
    doc.text(`Net Savings: ${reportData.summary.netSavings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, 14, 56);

    // Table of Spending by Category
      autoTable(doc, {
      startY: 70,
      head: [['Category', 'Amount (INR)']],
      body: reportData.spendingByCategory.map(item => [item.name, item.value.toFixed(2)]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] } // Example: Indigo color for header
    });
    
    doc.save(`report_${selectedDate}.pdf`);
  };

  if (loading) return <div>Loading report...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!reportData) return <div>No data available for this period.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-500">Analyze your spending patterns with detailed reports.</p>
      </div>

      <div className="flex justify-between items-center border-b">
        <p className="font-medium">Monthly Summary</p>
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded-md px-3 py-1 text-sm">
          {dateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Spending</p>
          <h2 className="text-xl font-semibold">{reportData.summary.totalSpending.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Income</p>
          <h2 className="text-xl font-semibold">{reportData.summary.totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Savings</p>
          <h2 className="text-xl font-semibold">{reportData.summary.netSavings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h2>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Spending Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-gray-600 font-medium mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={reportData.spendingByCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label>
                  {reportData.spendingByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-gray-600 font-medium mb-4">Spending Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reportData.spendingOverTime}>
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

      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-gray-700 font-medium mb-2">Export Report</h3>
        <p className="text-gray-500 text-sm mb-4">Download your monthly summary report in your preferred format.</p>
        <div className="flex space-x-3">
          <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Export to PDF</button>
          <button onClick={handleExportCSV} className="px-4 py-2 border rounded-md hover:bg-gray-50">Export to CSV</button>
        </div>
      </div>
    </div>
  );
}