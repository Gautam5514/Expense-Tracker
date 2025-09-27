import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react";

// Define the base URL of your backend
const API_URL = "http://localhost:5000";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // No user logged in

        const res = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.data.user);
      } catch (error) {
        console.error("Failed to fetch user for navbar:", error);
        // Optional: Handle error, e.g., by logging out the user if token is invalid
      }
    };
    fetchUser();
  }, []);

  // Effect to handle clicks outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth"); // Use navigate for SPA-friendly redirection
  };

  // Construct the full URL for the profile picture
  const profileImageUrl = user?.profilePicture
    ? `${API_URL}/${user.profilePicture.replace(/\\/g, '/')}`
    : 'https://i.pravatar.cc/150'; // A fallback avatar

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative">
      <h1 className="text-lg font-semibold">TrackMoney</h1>

      <div className="flex items-center space-x-6">

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            {user ? (
              <img
                src={profileImageUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full border object-cover"
              />
            ) : (
              // Skeleton loader for the image
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50">
              {user && (
                <div className="px-4 py-2 border-b mb-2">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}
              <Link to="/settings" onClick={() => setOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}