import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm">
        <div className="text-2xl font-bold flex items-center space-x-2">
          <span className="text-blue-600">⬤</span>
          <span>SpendWise</span>
        </div>
        <div className="space-x-4">
          <Link to="/auth" className="text-gray-700 font-medium">
            Login
          </Link>
          <Link
            to="/auth"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Track every expense. See the big picture.
        </h1>
        <p className="text-gray-600 max-w-2xl mb-8">
          Gain control of your finances with SpendWise. Effortlessly monitor
          your spending, categorize expenses, and visualize your financial
          health in real-time.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/auth"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700"
          >
            Sign up free
          </Link>
          <button className="flex items-center px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-50">
            <span className="mr-2">▶</span> Watch demo
          </button>
        </div>
      </main>
    </div>
  );
}
