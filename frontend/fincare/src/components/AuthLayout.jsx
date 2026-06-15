import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import { useFinance } from '../contexts/FinanceContext';
import CategoryChart from './CategoryChart';
import IncomeExpenseChart from './IncomeExpenseChart';

const AuthLayout = () => {
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  
  const { 
    getTransactionsByCategory, 
    getSummaryData,
  } = useFinance();

  const summaryData = getSummaryData();
  const expensesByCategory = getTransactionsByCategory();

  // Calculate top categories
  const topCategories = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Slogan Typewriter State & Hook
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ['Finances.', 'Budgets.', 'Expenses.', 'Future.'];

  React.useEffect(() => {
    let timer;
    const activeWord = words[currentWordIndex];
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(activeWord.substring(0, currentText.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setCurrentText(activeWord.substring(0, currentText.length + 1));
      }, 100);
    }

    if (!isDeleting && currentText === activeWord) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  // iPhone Mockup Video Simulation States
  const [demoStep, setDemoStep] = useState(0);
  const [pointerPos, setPointerPos] = useState({ left: '50%', top: '80%', opacity: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demoDesc, setDemoDesc] = useState('');
  const [demoCat, setDemoCat] = useState('');
  const [demoAmount, setDemoAmount] = useState('');
  const [showNewDemoItem, setShowNewDemoItem] = useState(false);
  const [demoExpenses, setDemoExpenses] = useState('₹1,735.39');
  const [demoBudgetFill, setDemoBudgetFill] = useState('65%');

  React.useEffect(() => {
    let active = true;
    
    const runDemoLoop = async () => {
      while (active) {
        setDemoStep(0);
        setIsModalOpen(false);
        setDemoDesc('');
        setDemoCat('');
        setDemoAmount('');
        setShowNewDemoItem(false);
        setDemoExpenses('₹1,735.39');
        setDemoBudgetFill('65%');
        setPointerPos({ left: '50%', top: '90%', opacity: 0 });
        await new Promise(r => setTimeout(r, 2000));
        if (!active) break;

        setDemoStep(1);
        setPointerPos({ left: '82%', top: '7.5%', opacity: 1 });
        await new Promise(r => setTimeout(r, 1200));
        if (!active) break;

        setDemoStep(2);
        setIsClicking(true);
        await new Promise(r => setTimeout(r, 150));
        setIsClicking(false);
        setIsModalOpen(true);
        await new Promise(r => setTimeout(r, 600));
        if (!active) break;

        setDemoStep(3);
        setPointerPos({ left: '50%', top: '75%', opacity: 1 });
        await new Promise(r => setTimeout(r, 800));
        if (!active) break;
        const descText = "Netflix";
        for (let i = 1; i <= descText.length; i++) {
          setDemoDesc(descText.substring(0, i));
          await new Promise(r => setTimeout(r, 120));
        }
        await new Promise(r => setTimeout(r, 500));
        if (!active) break;

        setDemoStep(4);
        setPointerPos({ left: '50%', top: '81%', opacity: 1 });
        await new Promise(r => setTimeout(r, 800));
        if (!active) break;
        setDemoCat('Entertainment');
        await new Promise(r => setTimeout(r, 600));
        if (!active) break;

        setDemoStep(5);
        setPointerPos({ left: '50%', top: '87%', opacity: 1 });
        await new Promise(r => setTimeout(r, 800));
        if (!active) break;
        const amountText = "299";
        for (let i = 1; i <= amountText.length; i++) {
          setDemoAmount(amountText.substring(0, i));
          await new Promise(r => setTimeout(r, 120));
        }
        await new Promise(r => setTimeout(r, 500));
        if (!active) break;

        setDemoStep(6);
        setPointerPos({ left: '50%', top: '93%', opacity: 1 });
        await new Promise(r => setTimeout(r, 800));
        if (!active) break;

        setDemoStep(7);
        setIsClicking(true);
        await new Promise(r => setTimeout(r, 150));
        setIsClicking(false);
        setIsModalOpen(false);
        setShowNewDemoItem(true);
        setDemoExpenses('₹2,034.39');
        setDemoBudgetFill('70%');
        setPointerPos(prev => ({ ...prev, opacity: 0 }));
        await new Promise(r => setTimeout(r, 4500));
      }
    };

    runDemoLoop();
    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'login') {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        
        const result = await register(formData.name, formData.email, formData.password);
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  return (
    <div className="landing-page">
      {/* Glass Background Blobs */}
      <div className="liquid-blob blob-1"></div>
      <div className="liquid-blob blob-2"></div>
      <div className="liquid-blob blob-3"></div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <Logo size={32} />
          <span>Fincare</span>
        </div>
        <nav className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#features" className="landing-nav-link">Budgeting</a>
          <a href="#analytics" className="landing-nav-link">Analytics</a>
          <button className="btn-pill-glow" onClick={() => setView('signup')}>Get Started</button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        {/* Hero Section */}
        <section className="landing-hero-section">
          {/* Glowing wave line */}
          <svg className="hero-wave-svg" viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,96 C240,150 480,180 720,120 C960,60 1200,80 1440,110" stroke="rgba(57,255,20,0.15)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,130 C300,180 600,100 900,140 C1200,180 1350,150 1440,130" stroke="rgba(57,255,20,0.06)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <div className="hero-left">
            <h1 className="hero-headline">
              Take Control of Your <span className="typewriter-cursor" style={{ color: '#39ff14', paddingRight: '4px' }}>{currentText}</span>
              <br />
              <span style={{ fontSize: '0.8em', opacity: 0.9 }}>Smart Tracking, Clearer Insights.</span>
            </h1>
            <p className="hero-subtitle-desc">
              Track expenses, set flexible budgets, and gain deep insights with Fincare's modern dark mode interface.
            </p>
            <button className="btn-pill-glow" onClick={() => setView('signup')}>
              Sign Up for Free
            </button>
          </div>

          <div className="hero-right">
            {/* iPhone Mockup */}
            <div className="iphone-mockup">
              {/* Cursor Pointer for Simulated Interaction */}
              <div 
                className={`iphone-demo-pointer ${isClicking ? 'clicking' : ''}`}
                style={{ 
                  left: pointerPos.left, 
                  top: pointerPos.top, 
                  opacity: pointerPos.opacity,
                  display: pointerPos.opacity === 0 ? 'none' : 'block'
                }}
              />

              <div className="iphone-header">
                <div className="iphone-logo">
                  <Logo size={18} />
                  <span>Fincare</span>
                </div>
                <div className="iphone-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button type="button" className="iphone-add-btn" style={{ background: 'rgba(57,255,20,0.1)', color: '#39ff14', border: '1px solid rgba(57,255,20,0.2)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', padding: 0 }}>+</button>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#64748b' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
              </div>

              <div className="iphone-expenses-card">
                <div className="iphone-card-label">Total expenses for month</div>
                <div className="iphone-card-value">{demoExpenses}</div>
              </div>

              <div className="iphone-budget-card">
                <div className="iphone-budget-title">Budget Progress</div>
                <div className="iphone-progress-track">
                  <div className="iphone-progress-fill" style={{ width: demoBudgetFill }}></div>
                </div>
                <div className="iphone-progress-labels">
                  <span>{demoBudgetFill} used</span>
                  <span>₹2,900.00</span>
                </div>
              </div>

              <div className="iphone-summary">
                <div className="iphone-summary-header">
                  <span>Quick Summary</span>
                  <span style={{ color: '#39ff14', fontSize: '0.6875rem' }}>See All</span>
                </div>
                <div className="iphone-summary-list">
                  {showNewDemoItem && (
                    <div className="iphone-summary-item demo-new-item">
                      <div className="iphone-item-left">
                        <span className="iphone-item-icon">🍿</span>
                        <span>Netflix</span>
                      </div>
                      <span className="iphone-item-value">-₹299.00</span>
                    </div>
                  )}
                  <div className="iphone-summary-item">
                    <div className="iphone-item-left">
                      <span className="iphone-item-icon">🛒</span>
                      <span>Groceries</span>
                    </div>
                    <span className="iphone-item-value">-₹155.00</span>
                  </div>
                  <div className="iphone-summary-item">
                    <div className="iphone-item-left">
                      <span className="iphone-item-icon">🍔</span>
                      <span>Dining</span>
                    </div>
                    <span className="iphone-item-value">-₹39.90</span>
                  </div>
                  <div className="iphone-summary-item">
                    <div className="iphone-item-left">
                      <span className="iphone-item-icon">💡</span>
                      <span>Utilities</span>
                    </div>
                    <span className="iphone-item-value">-₹88.00</span>
                  </div>
                </div>
              </div>

              {/* Demo Create Transaction Modal (Simulated overlay screen inside phone) */}
              <div className={`iphone-demo-modal ${isModalOpen ? 'active' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#39ff14' }}>Add Transaction</span>
                  <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Demo</span>
                </div>
                
                <input 
                  type="text" 
                  readOnly 
                  value={demoDesc} 
                  placeholder="Description (e.g. Netflix)" 
                  className={`iphone-demo-input ${demoDesc ? 'typing' : ''}`}
                  style={{ height: '30px', fontSize: '0.7rem' }}
                />
                
                <input 
                  type="text" 
                  readOnly 
                  value={demoCat} 
                  placeholder="Category (e.g. Entertainment)" 
                  className={`iphone-demo-input ${demoCat ? 'typing' : ''}`}
                  style={{ height: '30px', fontSize: '0.7rem' }}
                />
                
                <input 
                  type="text" 
                  readOnly 
                  value={demoAmount ? `₹${demoAmount}` : ''} 
                  placeholder="Amount (e.g. ₹299)" 
                  className={`iphone-demo-input ${demoAmount ? 'typing' : ''}`}
                  style={{ height: '30px', fontSize: '0.7rem' }}
                />
                
                <button type="button" className={`iphone-demo-btn ${demoStep >= 6 ? 'active' : ''}`} style={{ border: 'none' }}>
                  Save Transaction
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M12 8v8M9.5 10h5a2.5 2.5 0 0 0 0-5h-5a2.5 2.5 0 0 0 0 5h5" />
                </svg>
              </div>
              <h3>Expense Tracking</h3>
              <p>Log transactions instantly and categorize expenses effortlessly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="6" />
                  <circle cx="8" cy="12" r="4" fill="#39ff14" />
                </svg>
              </div>
              <h3>Flexible Budgeting</h3>
              <p>Define custom monthly or yearly budgets by category and stay on track.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                  <path d="M15 8h3.7V11.7" />
                </svg>
              </div>
              <h3>Powerful Analytics</h3>
              <p>Gain valuable insights into spending habits with detailed visualizations and reports.</p>
            </div>
          </div>
        </section>

        {/* Analytics Showcase Section */}
        <section id="analytics" className="showcase-section">
          <h2 className="showcase-title">Analytics Showcase</h2>

          {/* Tablet Mockup */}
          <div className="tablet-mockup">
            <div className="tablet-top-row">
              <div className="tablet-card">
                <div className="tablet-card-header">
                  <h4>Monthly Spending</h4>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Category</span>
                </div>
                <div className="tablet-spending-chart" style={{ height: 'auto', display: 'block' }}>
                  <CategoryChart height="180px" />
                </div>
              </div>

              <div className="tablet-card">
                <div className="tablet-card-header">
                  <h4>Spending Trends</h4>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Income vs Expense</span>
                </div>
                <div className="tablet-trends-chart" style={{ height: 'auto', display: 'block' }}>
                  <IncomeExpenseChart height="180px" />
                </div>
              </div>
            </div>

            <div className="tablet-bottom-section">
              <div className="tablet-table">
                <div className="tablet-table-header">Top Spending Category</div>
                {topCategories.map((item, index) => {
                  const totalExpenses = summaryData.totalExpenses || 1;
                  const percentage = (item.amount / totalExpenses) * 100;
                  return (
                    <div key={item.category} className="tablet-table-row">
                      <div className="tablet-row-left">
                        <span className="tablet-row-rank">#{index + 1}</span>
                        <span>{item.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{percentage.toFixed(0)}%</span>
                        <span className="tablet-row-value">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
                {topCategories.length === 0 && (
                  <div className="tablet-table-row" style={{ justifyContent: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                    No expense data available. Register to start tracking!
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="cta-banner-section">
          <div className="cta-banner-card">
            <h2>Ready to Master Your Money?</h2>
            <button className="btn-pill-glow" onClick={() => setView('signup')}>
              Sign Up for Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-links">
          <a href="#features" className="footer-link">Quick Links</a>
          <a href="#features" className="footer-link">Budgeting</a>
          <a href="#analytics" className="footer-link">Analytics</a>
        </div>
        <div className="footer-copyright">
          <span>© Copyright reserved</span>
          <svg className="footer-star-svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.6h7.6z" />
          </svg>
        </div>
      </footer>

      {/* Centered Modal Overlay for Auth (Login / Signup) */}
      {view !== 'landing' && (
        <div className="auth-modal-overlay" onClick={() => setView('landing')}>
          <div className="auth-modal-card-glass" onClick={(e) => e.stopPropagation()}>
            {/* Modal Close Button */}
            <button 
              type="button" 
              className="auth-modal-close-btn"
              onClick={() => setView('landing')}
              aria-label="Close form"
            >
              &times;
            </button>

            {/* Modal Branding Header */}
            <div className="auth-modal-logo">
              <Logo size={32} />
              <span>Fincare</span>
            </div>

            <div className="auth-form-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.65rem' }}>{view === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginTop: '4px' }}>
                {view === 'login' ? 'Please enter your details.' : 'Join Fincare to track and save.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div className="error-banner" style={{ fontSize: '0.8125rem', padding: '10px 14px' }}>
                  {error}
                </div>
              )}

              {view === 'signup' && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label" htmlFor="name" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="auth-input-underline"
                    required={view === 'signup'}
                  />
                </div>
              )}

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" htmlFor="email" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your e-mail"
                  className="auth-input-underline"
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" htmlFor="password" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="auth-input-underline"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ padding: '2px 6px' }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {view === 'signup' && (
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px', lineHeight: '1.2' }}>
                    Password must be at least 6 characters and contain a lowercase letter, an uppercase letter, and a number.
                  </span>
                )}
              </div>

              {view === 'signup' && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label" htmlFor="confirmPassword" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="auth-input-underline"
                    required={view === 'signup'}
                  />
                </div>
              )}

              {view === 'login' && (
                <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '4px', marginBottom: '8px' }}>
                  <label className="remember-me" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="forgot-password" style={{ color: '#64748b', textDecoration: 'none' }}>
                    Forgot the password?
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                className="auth-submit-btn-sleek"
                disabled={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Processing...
                  </>
                ) : (
                  view === 'login' ? 'Log in' : 'Sign up'
                )}
              </button>
            </form>

            <div className="auth-switch-sleek" style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  className="auth-switch-link"
                  onClick={toggleMode}
                  style={{ background: 'none', border: 'none', color: '#ffffff', fontWeight: '500', cursor: 'pointer', paddingLeft: '4px' }}
                >
                  {view === 'login' ? 'Register here' : 'Log in here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
