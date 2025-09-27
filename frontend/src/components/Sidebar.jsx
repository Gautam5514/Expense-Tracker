import { useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  PieChart,
  Briefcase,
  Menu,
  X,
  List,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: CreditCard },
    { name: "Budgets", path: "/budgets", icon: BarChart3 },
    { name: "Categories", path: "/categories", icon: List },
    { name: "Reports", path: "/reports", icon: PieChart },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3
             rounded-full shadow-xl
             bg-white/50 border border-white/60
             backdrop-blur-md backdrop-saturate-150
             text-white transition-all duration-300
             hover:bg-white/30 hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </button>



      {/* Sidebar */}
      <aside
        className={`
    z-40 top-0 left-0 h-screen bg-slate-800 text-white
    transition-all duration-300 flex flex-col
    ${isOpen ? "w-56" : "w-0 lg:w-16"} 
    ${isOpen ? "fixed lg:sticky" : "hidden lg:flex"} 
  `}
      >

        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="TrackMoney Logo"
              className="w-8 h-8 object-contain"
            />
            {isOpen && <span className="text-xl font-bold">TrackMoney</span>}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:block text-gray-200 hover:text-white cursor-pointer"
          >
            {isOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col mt-6 space-y-1">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-md transition-all relative group
                ${isActive
                  ? "bg-white text-purple-700 font-semibold shadow-md"
                  : "text-gray-200 hover:bg-gray-700"
                }`
              }
            >
              <Icon size={22} className="shrink-0" />
              {isOpen && <span className="ml-3">{name}</span>}

              {/* Tooltip when collapsed */}
              {!isOpen && (
                <span className="absolute left-14 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition">
                  {name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer (optional) */}
        <div className="p-4 border-t border-purple-500 text-sm text-gray-200">
          {isOpen && "© 2025 TrackMoney"}
        </div>
      </aside>
    </>
  );
}
