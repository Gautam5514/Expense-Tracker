import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Briefcase, GraduationCap, DollarSign, Building, Calendar, School } from "lucide-react";
import Swal from "sweetalert2";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent)]"></div>
  </div>
);

// A reusable input component for consistency
const InputField = ({ label, name, value, onChange, className = "", ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-[var(--ink-700)]">{label}</label>
    <input
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      className={`mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-[var(--ink-700)] shadow-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] ${className}`}
      {...props}
    />
  </div>
);


export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for the Personal Info Form ---
  const [personalFormData, setPersonalFormData] = useState({ name: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // --- NEW: State for the Financial Profile Form ---
  const [financialFormData, setFinancialFormData] = useState({
    userType: 'unspecified',
    companyName: '',
    salaryDate: '',
    collegeName: '',
    monthlyIncome: '',
  });

  const fileInputRef = useRef(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = res.data.data.user;
        setUser(fetchedUser);

        // Populate both form states
        setPersonalFormData({ name: fetchedUser.name || '' });
        if (fetchedUser.financialProfile) {
          setFinancialFormData(fetchedUser.financialProfile);
        }
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // --- Handlers for form inputs ---
  const handlePersonalChange = (e) => setPersonalFormData({ ...personalFormData, [e.target.name]: e.target.value });
  const handleFinancialChange = (e) => setFinancialFormData({ ...financialFormData, [e.target.name]: e.target.value });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // --- Handler for SAVING ALL changes ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // --- Promise 1: Update Personal Info & Photo ---
      const personalData = new FormData();
      personalData.append('name', personalFormData.name);
      if (profileImageFile) {
        personalData.append('profilePicture', profileImageFile);
      }
      const personalPromise = axios.put(`${API_URL}/api/users/updateMe`, personalData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      // --- Promise 2: Update Financial Profile ---
      const financialPromise = axios.put(`${API_URL}/api/users/financial-profile`, financialFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Wait for both updates to complete
      await Promise.all([personalPromise, financialPromise]);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Settings updated successfully!",
        showConfirmButton: false,
        timer: 2000
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update settings. Please try again."
      });

    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  const profileImageUrl = user.profilePicture ? `${API_URL}/${user.profilePicture.replace(/\\/g, '/')}` : `https://ui-avatars.com/api/?name=${user.name}&background=random`;
  const userTypeLabel = financialFormData.userType === "professional"
    ? "Professional"
    : financialFormData.userType === "student"
      ? "Student"
      : "Unspecified";

  return (
    <div className="space-y-8">
      <div className="app-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <img src={previewImage || profileImageUrl} alt="Profile" className="w-20 h-20 rounded-2xl border border-white/70 object-cover shadow" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-500)]">Profile</p>
              <h1 className="text-3xl font-semibold font-display">{user.name}</h1>
              <p className="text-sm text-[var(--ink-500)]">{user.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs uppercase tracking-wide rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">Premium</span>
                <span className="px-3 py-1 text-xs uppercase tracking-wide rounded-full bg-slate-100 text-[var(--ink-500)]">{userTypeLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="app-card-muted px-4 py-3 text-sm">
              <p className="text-[var(--ink-500)] uppercase tracking-wide text-xs">Monthly Income</p>
              <p className="font-semibold text-[var(--ink-900)]">
                {financialFormData.monthlyIncome
                  ? Number(financialFormData.monthlyIncome).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                  : "Not set"}
              </p>
            </div>
            <div className="app-card-muted px-4 py-3 text-sm">
              <p className="text-[var(--ink-500)] uppercase tracking-wide text-xs">Primary Focus</p>
              <p className="font-semibold text-[var(--ink-900)]">
                {financialFormData.userType === "professional"
                  ? financialFormData.companyName || "Company not set"
                  : financialFormData.userType === "student"
                    ? financialFormData.collegeName || "College not set"
                    : "Unspecified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        {/* --- Personal Information Section --- */}
        <div className="app-card p-6">
          <h2 className="text-lg font-semibold border-b border-slate-100 pb-4">Personal Information</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <InputField label="Name" name="name" type="text" value={personalFormData.name} onChange={handlePersonalChange} />
              <InputField label="Email Address" name="email" type="email" value={user.email} disabled className="bg-slate-100/80 cursor-not-allowed" />
            </div>
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-[var(--ink-700)] mb-2">Profile Picture</label>
              <img src={previewImage || profileImageUrl} alt="Profile" className="w-24 h-24 rounded-2xl border border-white/70 object-cover shadow" />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="mt-4 btn-secondary text-sm">Change Picture</button>
            </div>
          </div>
        </div>

        {/* --- NEW: Financial Profile Section --- */}
        <div className="app-card p-6">
          <h2 className="text-lg font-semibold border-b border-slate-100 pb-4">Financial Profile</h2>
          <p className="text-sm text-[var(--ink-500)] mt-4">This information helps personalize your experience and track income. It is optional and private.</p>

          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--ink-700)]">Are you a...?</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button type="button" onClick={() => handleFinancialChange({ target: { name: 'userType', value: 'professional' } })} className={`flex items-center justify-center p-4 border rounded-xl ${financialFormData.userType === 'professional' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100' : 'hover:bg-slate-50'}`}>
                  <Briefcase className="mr-3" size={20} /> Professional
                </button>
                <button type="button" onClick={() => handleFinancialChange({ target: { name: 'userType', value: 'student' } })} className={`flex items-center justify-center p-4 border rounded-xl ${financialFormData.userType === 'student' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100' : 'hover:bg-slate-50'}`}>
                  <GraduationCap className="mr-3" size={20} /> Student
                </button>
              </div>
            </div>

            {/* Conditional Fields for Professional */}
            {financialFormData.userType === 'professional' && (
              <div className="p-4 bg-slate-50/80 rounded-xl space-y-4 animate-fade-in">
                <InputField label="Company Name" name="companyName" value={financialFormData.companyName} onChange={handleFinancialChange} placeholder="e.g., Google" />
                <InputField label="Salary Date (Day of Month)" name="salaryDate" type="number" min="1" max="31" value={financialFormData.salaryDate} onChange={handleFinancialChange} placeholder="e.g., 28" />
              </div>
            )}

            {/* Conditional Fields for Student */}
            {financialFormData.userType === 'student' && (
              <div className="p-4 bg-slate-50/80 rounded-xl animate-fade-in">
                <InputField label="College/University Name" name="collegeName" value={financialFormData.collegeName} onChange={handleFinancialChange} placeholder="e.g., University of Example" />
              </div>
            )}

            {/* Common Income Field */}
            {financialFormData.userType !== 'unspecified' && (
              <div className="pt-4 border-t border-slate-100">
                <InputField label="Monthly Income / Pocket Money" name="monthlyIncome" type="number" min="0" value={financialFormData.monthlyIncome} onChange={handleFinancialChange} placeholder="Enter your total monthly income" />
              </div>
            )}
          </div>
        </div>

        {/* --- Save Changes Button --- */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
