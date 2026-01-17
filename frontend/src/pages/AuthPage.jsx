import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AtSign, Lock, User, Phone, Home, CheckCircle2, ShieldCheck } from "lucide-react";

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
      className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-white placeholder-slate-400 shadow-sm transition-colors focus:border-indigo-400 focus:ring focus:ring-indigo-500/20"
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
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      <div className="absolute -top-20 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white font-bold">
            <svg className="h-9 w-auto text-indigo-400" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 38c-3.438 0-6.73-1.07-9.43-3.03l-1.14-.81-8.14 4.34 3.32-8.54.6-1.55a13.92 13.92 0 010-16.78l-.6-1.55-3.32-8.54 8.14 4.34 1.14-.81C17.27 11.07 20.562 10 24 10s6.73 1.07 9.43 3.03l1.14.81 8.14-4.34-3.32 8.54-.6 1.55a13.92 13.92 0 010 16.78l.6 1.55 3.32 8.54-8.14-4.34-1.14.81C30.73 36.93 27.438 38 24 38z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M24 29a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>
            TrackMoney
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  Bank-grade security with end-to-end encryption
                </div>
                <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight">
                  Manage every rupee with confidence.
                </h1>
                <p className="mt-4 text-lg text-slate-400">
                  A calm, guided flow helps you sign in, set budgets, and start building healthier habits in minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Smart budget reminders",
                  "Personalized spending insights",
                  "Instant transaction imports",
                  "Secure data backup",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div>
                  <p className="text-2xl font-bold text-white">10k+</p>
                  Active users
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                  Average rating
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-indigo-500/10">
              <h2 className="text-3xl font-bold text-white text-center">
                {isLogin ? "Welcome Back!" : "Create Your Account"}
              </h2>
              <p className="mt-2 text-center text-slate-400">
                {isLogin ? "Sign in to access your dashboard." : "Join TrackMoney and start tracking today."}
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
                      <InputField name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} icon={<User className="h-5 w-5 text-slate-400" />} />
                      <InputField name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange} icon={<Phone className="h-5 w-5 text-slate-400" />} />
                      <InputField name="address" type="text" placeholder="Address" value={form.address} onChange={handleChange} icon={<Home className="h-5 w-5 text-slate-400" />} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <InputField name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} icon={<AtSign className="h-5 w-5 text-slate-400" />} />
                <InputField name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} icon={<Lock className="h-5 w-5 text-slate-400" />} />

                {isLogin && (
                  <div className="text-right">
                    <Link to="#" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">Forgot password?</Link>
                  </div>
                )}
                
                {error && <div className="text-sm text-red-400 text-center">{error}</div>}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60"
                  >
                    {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={toggleForm} className="font-medium text-indigo-300 hover:text-indigo-200">
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
