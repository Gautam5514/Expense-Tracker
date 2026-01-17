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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-full shadow-xl
             bg-white/80 border border-white/60 text-[var(--ink-900)]
             backdrop-blur-md backdrop-saturate-150 transition-all duration-300
             hover:bg-white hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </button>



      {/* Sidebar */}
      <aside
        className={`
    z-40 top-0 left-0 h-screen text-white
    transition-all duration-300 flex flex-col
    bg-gradient-to-b from-[#0b1b2b] via-[#122638] to-[#132d40]
    ${isOpen ? "w-60" : "w-0 lg:w-16"}
    ${isOpen ? "fixed lg:sticky" : "hidden lg:flex"}
  `}
      >

        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="TrackMoney Logo"
              className="w-8 h-8 object-contain"
            />
            {isOpen && (
              <div className="leading-tight">
                <span className="text-xl font-semibold font-display">TrackMoney</span>
                <span className="block text-xs text-white/60">Premium Workspace</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:block text-white/70 hover:text-white cursor-pointer"
          >
            {isOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col mt-6 space-y-1 px-3">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all relative group
                ${isActive
                  ? "bg-[var(--accent-2)] text-[#0b1b2b] font-semibold shadow-md"
                  : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              <Icon size={22} className="shrink-0" />
              {isOpen && <span className="ml-3">{name}</span>}

              {/* Tooltip when collapsed */}
              {!isOpen && (
                <span className="absolute left-14 bg-[#0b1b2b] text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition">
                  {name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer (optional) */}
        <div className="p-4 border-t border-white/10 text-sm text-white/60">
          {isOpen && "© 2025 TrackMoney. Crafted for clarity."}
        </div>
      </aside>
    </>
  );
}
