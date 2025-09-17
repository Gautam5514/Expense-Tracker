import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, PieChart, Target, Zap } from "lucide-react";

// --- Sub-Components for a Cleaner Structure ---

const FeatureCard = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
    <div className="inline-block p-4 bg-indigo-100 text-indigo-600 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

const TestimonialCard = ({ quote, name, title, avatar }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-700 italic">"{quote}"</p>
        <div className="flex items-center mt-4">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-indigo-200" />
            <div className="ml-4">
                <p className="font-semibold text-gray-900">{name}</p>
                <p className="text-gray-500 text-sm">{title}</p>
            </div>
        </div>
    </div>
);


// --- The Main Homepage Component ---
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <div className="text-2xl font-bold flex items-center space-x-2">
            <svg className="h-8 w-auto text-indigo-600" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 38c-3.438 0-6.73-1.07-9.43-3.03l-1.14-.81-8.14 4.34 3.32-8.54.6-1.55a13.92 13.92 0 010-16.78l-.6-1.55-3.32-8.54 8.14 4.34 1.14-.81C17.27 11.07 20.562 10 24 10s6.73 1.07 9.43 3.03l1.14.81 8.14-4.34-3.32 8.54-.6 1.55a13.92 13.92 0 010 16.78l.6 1.55 3.32 8.54-8.14-4.34-1.14.81C30.73 36.93 27.438 38 24 38z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M24 29a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>
            <span className="text-gray-900">TrackMoney</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Testimonials</a>
          </nav>
          <div className="space-x-4">
            <Link to="/auth" className="text-gray-700 font-medium hover:text-indigo-600 transition-colors">Login</Link>
            <Link to="/auth" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-all">
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Financial Clarity, <br className="hidden md:block" />
              <span className="text-indigo-600">Effortlessly Achieved.</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
              Stop wondering where your money goes. TrackMoney provides the tools you need to monitor spending, create budgets, and build a secure financial future.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/auth" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all">
                Get Started for Free
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-16 w-full max-w-4xl"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px]">
              <div className="rounded-t-lg overflow-hidden h-[156px] md:h-[278px] bg-white dark:bg-gray-800">
                <img src="https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=2070&auto=format&fit=crop" className="h-[156px] md:h-[278px] w-full object-cover" alt="Dashboard mockup" />
              </div>
            </div>
            <div className="relative mx-auto bg-gray-900 rounded-b-xl h-[24px] max-w-[301px] md:h-[42px] md:max-w-[512px]"></div>
            <div className="relative mx-auto bg-gray-800 rounded-b-xl h-[55px] max-w-[83px] md:h-[95px] md:max-w-[142px]"></div>
          </motion.div>

        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600 mt-2">Powerful features designed to put you in control.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<LayoutGrid size={28} />} title="Smart Dashboard">
              Get an instant, clear overview of your income, expenses, and remaining budget for the month.
            </FeatureCard>
            <FeatureCard icon={<PieChart size={28} />} title="Insightful Reports">
              Visualize your spending with beautiful charts and generate professional PDF reports.
            </FeatureCard>
            <FeatureCard icon={<Target size={28} />} title="Budget Planning">
              Set monthly budgets for different categories and get alerts before you overspend.
            </FeatureCard>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-white py-20">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Loved by Users Worldwide</h2>
                    <p className="text-lg text-gray-600 mt-2">Don't just take our word for it. Here's what people are saying.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TestimonialCard 
                        quote="This app completely changed how I see my money. I finally feel in control of my spending."
                        name="Sarah J."
                        title="Freelance Designer"
                        avatar="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                    />
                    <TestimonialCard 
                        quote="The PDF reports are a game-changer for my monthly reviews. So professional and easy to understand."
                        name="Michael B."
                        title="Project Manager"
                        avatar="https://i.pravatar.cc/150?u=a042581f4e29026705d"
                    />
                     <TestimonialCard 
                        quote="As a student, tracking my pocket money has never been easier. The UI is simple and beautiful."
                        name="Priya K."
                        title="University Student"
                        avatar="https://i.pravatar.cc/150?u=a042581f4e29026706d"
                    />
                </div>
            </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="container mx-auto px-6 py-24">
            <div className="bg-indigo-600 text-white rounded-lg p-12 text-center shadow-2xl">
                <h2 className="text-3xl font-bold mb-4">Ready to Master Your Money?</h2>
                <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">Join thousands of users who are building a better financial future with TrackMoney.</p>
                <Link to="/auth" className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all">
                    Sign Up Now - It's Free
                </Link>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
                <p className="font-bold text-white text-lg">TrackMoney</p>
                <p className="text-sm">© {new Date().getFullYear()} All Rights Reserved.</p>
            </div>
            <div className="flex space-x-6">
                <a href="#" className="hover:text-white">About</a>
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}