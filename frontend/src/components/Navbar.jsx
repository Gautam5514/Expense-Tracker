import { useState } from "react";
import { Bell, MessageSquare } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative">
      {/* Brand */}
      <h1 className="text-lg font-semibold">SpendWise</h1>

      {/* Right section */}
      <div className="flex items-center space-x-6">
        {/* Messages */}
        <button className="text-gray-600 hover:text-gray-800">
          <MessageSquare size={22} />
        </button>

        {/* Notifications */}
        <button className="text-gray-600 hover:text-gray-800">
          <Bell size={22} />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="user"
              className="w-9 h-9 rounded-full border"
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
              <a
                href="#profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                My Profile
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/auth"; // redirect on logout
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
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
