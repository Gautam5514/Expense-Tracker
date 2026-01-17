import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  LayoutGrid, 
  PieChart,
  PiggyBank,
  Tags,
  Receipt,
  ChartLine,
  Settings,
  Target, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X,
  CreditCard
} from "lucide-react";

// --- Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = ["Features", "How it Works", "Pages", "Pricing", "Testimonials"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
         <div className="text-2xl font-bold flex items-center space-x-2">
            <svg className="h-8 w-auto text-indigo-600" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 38c-3.438 0-6.73-1.07-9.43-3.03l-1.14-.81-8.14 4.34 3.32-8.54.6-1.55a13.92 13.92 0 010-16.78l-.6-1.55-3.32-8.54 8.14 4.34 1.14-.81C17.27 11.07 20.562 10 24 10s6.73 1.07 9.43 3.03l1.14.81 8.14-4.34-3.32 8.54-.6 1.55a13.92 13.92 0 010 16.78l.6 1.55 3.32 8.54-8.14-4.34-1.14.81C30.73 36.93 27.438 38 24 38z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M24 29a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>
            <span className="text-gray-900 text-white">TrackMoney</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/auth" className="text-slate-300 hover:text-white font-medium transition-colors">Log in</Link>
          <Link to="/auth" className="group relative px-6 py-2.5 bg-white text-slate-950 rounded-full font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-white/10 p-6 flex flex-col gap-4"
        >
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-slate-300 text-lg font-medium">
              {item}
            </a>
          ))}
          <div className="h-px bg-white/10 my-2" />
          <Link to="/auth" className="text-center w-full py-3 bg-indigo-600 rounded-lg text-white font-semibold">Get Started</Link>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  // const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-200">New: AI Budget Forecasting</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Master your money <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              without the stress.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop wondering where your money goes. Moneta gives you the clarity to control spending, track subscriptions, and grow your wealth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/auth" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105">
              Start for Free
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-lg backdrop-blur-md transition-all">
              View Demo
            </button>
          </div>
        </motion.div>

        {/* 3D Dashboard Preview */}
        <motion.div 
          style={{ y: y1, rotateX: 10 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="relative rounded-2xl bg-slate-900 border border-white/10 p-2 shadow-2xl shadow-indigo-500/20">
            {/* Mockup Top Bar */}
            <div className="h-8 bg-slate-800/50 rounded-t-xl flex items-center px-4 gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            {/* Mockup Image Placeholder */}
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 relative group">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" 
                alt="Dashboard" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              {/* Floating UI Elements on top of image for depth */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 bg-slate-800/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl max-w-xs"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Savings</p>
                    <p className="text-lg font-bold text-white">$12,450.00</p>
                  </div>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-400 h-full w-[75%]" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BentoFeature = ({ title, desc, icon, className, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`group relative p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-indigo-500/30 transition-colors overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" className="py-32 bg-slate-950 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-3">Why Moneta?</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">More than just an expense tracker.</h3>
          <p className="text-slate-400 text-lg">We've built a financial ecosystem designed to help you build better habits and reach your goals faster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoFeature 
            title="Automated Tracking" 
            desc="Connect your bank accounts and let us categorize your transactions automatically. No more manual entry."
            icon={<Zap />}
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-slate-900 to-slate-800"
            delay={0.1}
          />
          <BentoFeature 
            title="Smart Budgets" 
            desc="Set limits for specific categories. We'll alert you before you overspend so you stay on track."
            icon={<PieChart />}
            delay={0.2}
          />
          <BentoFeature 
            title="Goal Setter" 
            desc="Create saving pots for vacations, gadgets, or emergency funds and track progress visually."
            icon={<Target />}
            delay={0.3}
          />
          <BentoFeature 
            title="Bank-Grade Security" 
            desc="Your data is encrypted with 256-bit SSL. We never sell your data to third parties."
            icon={<ShieldCheck />}
            className="md:col-span-3"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      title: "Connect your accounts",
      desc: "Securely link your cards and banks to auto-import every transaction.",
    },
    {
      title: "Set budgets that stick",
      desc: "Build smart categories and get notified before you overspend.",
    },
    {
      title: "Watch your goals grow",
      desc: "Track savings and milestones with clear progress insights.",
    },
  ];

  return (
    <section id="how-it-works" className="py-28 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-3">How it Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">From zero to clarity in three steps.</h2>
            <p className="text-slate-400 text-lg">Build healthy money habits with a simple flow that keeps you in control.</p>
          </div>
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors">
            Start Your Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 overflow-hidden"
            >
              <div className="absolute -top-10 -right-6 w-28 h-28 rounded-full bg-indigo-500/10 blur-2xl" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PagesShowcase = () => {
  const pages = [
    {
      title: "Dashboard",
      desc: "Instant snapshot of balances, trends, and alerts.",
      path: "/dashboard",
      icon: <LayoutGrid className="w-6 h-6" />,
      highlights: ["Cashflow", "Net worth", "Quick actions"],
    },
    {
      title: "Budgets",
      desc: "Create flexible budgets and track category limits.",
      path: "/budgets",
      icon: <PiggyBank className="w-6 h-6" />,
      highlights: ["Smart caps", "Rollover", "Alerts"],
    },
    {
      title: "Categories",
      desc: "Organize spending with clear tags and rules.",
      path: "/categories",
      icon: <Tags className="w-6 h-6" />,
      highlights: ["Auto rules", "Color tags", "Insights"],
    },
    {
      title: "Transactions",
      desc: "Review, edit, and filter every transaction in one place.",
      path: "/transactions",
      icon: <Receipt className="w-6 h-6" />,
      highlights: ["Filters", "Bulk edits", "Exports"],
    },
    {
      title: "Reports",
      desc: "Visualize your spending and income patterns.",
      path: "/reports",
      icon: <ChartLine className="w-6 h-6" />,
      highlights: ["Monthly trends", "Forecasts", "Comparisons"],
    },
    {
      title: "Settings",
      desc: "Personalize notifications, security, and preferences.",
      path: "/settings",
      icon: <Settings className="w-6 h-6" />,
      highlights: ["2FA", "Exports", "Profile"],
    },
  ];

  return (
    <section id="pages" className="py-28 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-3">Every page, covered</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Explore the full product experience.</h2>
          <p className="text-slate-400 text-lg">Each page is crafted to keep your money story organized and easy to act on.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <motion.div
              key={page.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * (index + 1) }}
              className="group rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-md hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 text-indigo-300 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {page.icon}
                </div>
                <Link to={page.path} className="text-xs font-semibold text-slate-400 group-hover:text-white inline-flex items-center gap-1 transition-colors">
                  Open page <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="text-xl font-bold text-white mt-6">{page.title}</h3>
              <p className="text-slate-400 mt-3 leading-relaxed">{page.desc}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {page.highlights.map((item) => (
                  <span key={item} className="px-3 py-1 text-xs font-medium rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      desc: "For personal tracking and essentials.",
      features: ["Unlimited transactions", "Basic insights", "One budget"],
    },
    {
      name: "Pro",
      price: "$12",
      desc: "For serious planners and families.",
      features: ["Smart budgets", "Goal tracking", "Priority support"],
      highlighted: true,
    },
    {
      name: "Elite",
      price: "$29",
      desc: "For power users and entrepreneurs.",
      features: ["Advanced reports", "Multi-currency", "Custom exports"],
    },
  ];

  return (
    <section id="pricing" className="py-28 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Plans that grow with you.</h2>
          <p className="text-slate-400 text-lg">Pick a plan to match your pace. Upgrade or downgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl border p-8 backdrop-blur-md ${
                tier.highlighted
                  ? "border-indigo-500/60 bg-gradient-to-b from-indigo-500/20 to-slate-900 shadow-2xl shadow-indigo-500/20"
                  : "border-white/10 bg-slate-900/60"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute top-6 right-6 px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-indigo-500/20 text-indigo-200 rounded-full border border-indigo-400/40">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-slate-400 mb-6">{tier.desc}</p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <div className="flex flex-col gap-3 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/auth"
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  tier.highlighted
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ quote, author, role, avatar }) => (
  <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl relative">
    <div className="flex gap-1 text-yellow-500 mb-4">
      {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
    </div>
    <p className="text-slate-300 mb-6 text-lg">"{quote}"</p>
    <div className="flex items-center gap-4">
      <img src={avatar} alt={author} className="w-12 h-12 rounded-full border-2 border-indigo-500/20" />
      <div>
        <h4 className="text-white font-bold">{author}</h4>
        <p className="text-slate-500 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-slate-950 border-t border-white/10 pt-20 pb-10">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">Moneta.</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Empowering individuals to take control of their financial future through intuitive tools and smart insights.
          </p>
        </div>
        
        {[
          { header: "Product", links: ["Features", "Pricing", "Integrations", "Changelog"] },
          { header: "Company", links: ["About", "Careers", "Blog", "Contact"] },
          { header: "Legal", links: ["Privacy Policy", "Terms of Service", "Security"] },
        ].map((col) => (
          <div key={col.header}>
            <h5 className="text-white font-bold mb-4">{col.header}</h5>
            <ul className="flex flex-col gap-3">
              {col.links.map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} Moneta Inc. All rights reserved.</p>
        <div className="flex gap-6">
          {/* Social Icons Placeholder */}
          <div className="w-6 h-6 bg-slate-800 rounded hover:bg-indigo-500 transition-colors cursor-pointer" />
          <div className="w-6 h-6 bg-slate-800 rounded hover:bg-indigo-500 transition-colors cursor-pointer" />
          <div className="w-6 h-6 bg-slate-800 rounded hover:bg-indigo-500 transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  </footer>
);

// --- Main Page Component ---

export default function HomePage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-indigo-500/30">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Social Proof Strip */}
        <div className="border-y border-white/5 bg-white/[0.02] py-10">
          <div className="container mx-auto px-6 text-center">
            <p className="text-slate-500 text-sm font-medium mb-6">TRUSTED BY 10,000+ FINANCIALLY SAVVY USERS</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Replace with actual SVGs of logos */}
               <h3 className="text-2xl font-bold text-white">AcmeCorp</h3>
               <h3 className="text-2xl font-bold text-white">GlobalBank</h3>
               <h3 className="text-2xl font-bold text-white">Stripe</h3>
               <h3 className="text-2xl font-bold text-white">Minty</h3>
               <h3 className="text-2xl font-bold text-white">CoinBase</h3>
            </div>
          </div>
        </div>

        <Features />
        <HowItWorks />
        <PagesShowcase />
        <Pricing />

        {/* Call to Action Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-20 text-center shadow-2xl shadow-indigo-500/30 overflow-hidden relative">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to transform your finances?</h2>
              <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-10">Join thousands of others who are saving more, spending less, and sleeping better at night.</p>
              
              <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-slate-950">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Loved by people like you</h2>
              <p className="text-slate-400">Don't take our word for it. Here is what our users have to say.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="I used to be terrified of checking my bank account. Moneta made it actually fun to track my spending."
                author="Sarah Jenkins"
                role="Graphic Designer"
                avatar="https://i.pravatar.cc/150?u=1"
              />
              <TestimonialCard 
                quote="The insights feature is a game changer. I realized I was spending $200/mo on coffee. Cut that in half immediately."
                author="David Chen"
                role="Software Engineer"
                avatar="https://i.pravatar.cc/150?u=2"
              />
              <TestimonialCard 
                quote="Cleanest UI I've ever seen in a finance app. It feels like the Apple of expense trackers."
                author="Elena Rodriguez"
                role="Product Manager"
                avatar="https://i.pravatar.cc/150?u=3"
              />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
