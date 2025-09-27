import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AtSign, Lock, User, Phone, Home } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const InputField = ({ name, type, placeholder, value, onChange, icon }) => (
  <div className="relative">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full rounded-lg border-gray-300 py-2.5 pl-10 shadow-sm transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    />
  </div>
);


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 
    try {
      const endpoint = isLogin ? "login" : "signup";
      const res = await axios.post(`${API_URL}/api/auth/${endpoint}`, form);
      localStorage.setItem("token", res.data.token);
      
      toast.success(isLogin ? "Login Successful!" : "Account created successfully!");
      
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage); 
      
      toast.error(errorMessage); 
      
    } finally {
      setLoading(false);
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setForm({ name: "", address: "", phone: "", email: "", password: "" }); // Reset form
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* --- Left Side: Branding & Visuals (Hidden on Mobile) --- */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-indigo-600 text-white p-12">
        <div className="text-center">
            <svg className="mx-auto h-12 w-auto text-indigo-300" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 38c-3.438 0-6.73-1.07-9.43-3.03l-1.14-.81-8.14 4.34 3.32-8.54.6-1.55a13.92 13.92 0 010-16.78l-.6-1.55-3.32-8.54 8.14 4.34 1.14-.81C17.27 11.07 20.562 10 24 10s6.73 1.07 9.43 3.03l1.14.81 8.14-4.34-3.32 8.54-.6 1.55a13.92 13.92 0 010 16.78l.6 1.55 3.32 8.54-8.14-4.34-1.14.81C30.73 36.93 27.438 38 24 38z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M24 29a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">TrackMoney</h1>
            <p className="mt-4 text-lg text-indigo-200">
                Take control of your finances. Effortlessly track every penny and achieve your financial goals.
            </p>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="flex items-center justify-center bg-gray-50 p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            {isLogin ? "Welcome Back!" : "Get Started"}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            {isLogin ? "Sign in to access your dashboard." : "Create an account to start tracking."}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup-fields"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <InputField name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} icon={<User className="h-5 w-5 text-gray-400" />} />
                  <InputField name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} icon={<Phone className="h-5 w-5 text-gray-400" />} />
                  <InputField name="address" type="text" placeholder="Address" value={form.address} onChange={handleChange} icon={<Home className="h-5 w-5 text-gray-400" />} />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} icon={<AtSign className="h-5 w-5 text-gray-400" />} />
            <InputField name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} icon={<Lock className="h-5 w-5 text-gray-400" />} />

            {isLogin && (
              <div className="text-right">
                <Link to="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
              </div>
            )}
            
            {error && <div className="text-sm text-red-600 text-center">{error}</div>}

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60">
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{' '}
            <button onClick={toggleForm} className="font-medium text-indigo-600 hover:text-indigo-500">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}