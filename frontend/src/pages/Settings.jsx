import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Briefcase, GraduationCap, DollarSign, Building, Calendar, School } from "lucide-react";
import Swal from "sweetalert2";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// A reusable input component for consistency
const InputField = ({ label, name, value, onChange, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        {/* --- Personal Information Section --- */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-4">Personal Information</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <InputField label="Name" name="name" type="text" value={personalFormData.name} onChange={handlePersonalChange} />
              <InputField label="Email Address" name="email" type="email" value={user.email} disabled className="bg-gray-100 cursor-not-allowed" />
            </div>
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <img src={previewImage || profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full border object-cover" />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="mt-4 px-3 py-2 border rounded-md text-sm hover:bg-gray-50">Change Picture</button>
            </div>
          </div>
        </div>

        {/* --- NEW: Financial Profile Section --- */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-4">Financial Profile</h2>
          <p className="text-sm text-gray-500 mt-4">This information helps personalize your experience and track income. It is optional and private.</p>

          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Are you a...?</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button type="button" onClick={() => handleFinancialChange({ target: { name: 'userType', value: 'professional' } })} className={`flex items-center justify-center p-4 border rounded-lg ${financialFormData.userType === 'professional' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'hover:bg-gray-50'}`}>
                  <Briefcase className="mr-3" size={20} /> Professional
                </button>
                <button type="button" onClick={() => handleFinancialChange({ target: { name: 'userType', value: 'student' } })} className={`flex items-center justify-center p-4 border rounded-lg ${financialFormData.userType === 'student' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'hover:bg-gray-50'}`}>
                  <GraduationCap className="mr-3" size={20} /> Student
                </button>
              </div>
            </div>

            {/* Conditional Fields for Professional */}
            {financialFormData.userType === 'professional' && (
              <div className="p-4 bg-slate-50 rounded-lg space-y-4 animate-fade-in">
                <InputField label="Company Name" name="companyName" value={financialFormData.companyName} onChange={handleFinancialChange} placeholder="e.g., Google" />
                <InputField label="Salary Date (Day of Month)" name="salaryDate" type="number" min="1" max="31" value={financialFormData.salaryDate} onChange={handleFinancialChange} placeholder="e.g., 28" />
              </div>
            )}

            {/* Conditional Fields for Student */}
            {financialFormData.userType === 'student' && (
              <div className="p-4 bg-slate-50 rounded-lg animate-fade-in">
                <InputField label="College/University Name" name="collegeName" value={financialFormData.collegeName} onChange={handleFinancialChange} placeholder="e.g., University of Example" />
              </div>
            )}

            {/* Common Income Field */}
            {financialFormData.userType !== 'unspecified' && (
              <div className="pt-4 border-t">
                <InputField label="Monthly Income / Pocket Money" name="monthlyIncome" type="number" min="0" value={financialFormData.monthlyIncome} onChange={handleFinancialChange} placeholder="Enter your total monthly income" />
              </div>
            )}
          </div>
        </div>

        {/* --- Save Changes Button --- */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}