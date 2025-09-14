import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "signup";
      const res = await axios.post(
        `http://localhost:5000/api/auth/${endpoint}`,
        form
      );

      // Save token to localStorage
      localStorage.setItem("token", res.data.token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 15c2.486 0 4.797.64 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {isLogin
            ? "Sign in to continue to SpendWise."
            : "Sign up to start tracking your expenses."}
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          {isLogin && (
            <div className="text-right">
              <Link to="#" className="text-sm text-purple-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-gray-600 mt-4">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-purple-600 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-purple-600 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-3 text-sm text-gray-400">Or continue with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Social login */}
        <div className="flex space-x-3">
          <button className="flex-1 border rounded-lg py-2 flex items-center justify-center hover:bg-gray-50">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
