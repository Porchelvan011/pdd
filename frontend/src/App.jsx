import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import logoImg from './assets/logo.png';


// Import combined pages
import { LandingPage, AboutPage, FeaturesPage, ContactPage } from './pages/PublicPages';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { LearnerPages } from './pages/LearnerPages';
import { MentorPages } from './pages/MentorPages';
import { AdminPages } from './pages/AdminPages';

import { 
  Compass, ShieldCheck, LogIn, LogOut, Bell, Menu, X, ArrowRight, User, Globe, Sparkles, Mail
} from 'lucide-react';


// Secure Session Authentication Guard
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--primary)' }}>Verifying credentials...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Strict Role-Based Route Gatekeeper
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--primary)' }}>Authorizing access...</div>;
  
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect securely to their designated workspace
    const dest = user?.role === 'Admin' ? '/admin' : user?.role === 'Mentor' ? '/mentor' : '/learner';
    return <Navigate to={dest} replace />;
  }
  return children;
};

// Header Shell Navigation Bar Component
const HeaderNavigation = () => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useSocket();
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="nav-container" style={{ position: 'relative' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
        <img src={logoImg} alt="Mentorix Logo" style={{ height: '32px', width: 'auto', borderRadius: '6px' }} />
        <span className="logo-glow" style={{ margin: 0 }}>
          Mentorix <span>AI</span>
        </span>
      </Link>

      {/* Hamburger Toggle Button (mobile only) */}
      <button className="menu-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Desktop Navigation Links */}
      <div className="nav-menu-wrapper" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
        <div className="nav-links-group" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>About</Link>
          <Link to="/features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Features</Link>
          <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Contact</Link>
        </div>

        <div className="nav-buttons-group">
          {user ? (
            /* User Logged In */
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', position: 'relative' }}>
              
              {/* Notification alert Bell */}
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowNotifyDropdown(!showNotifyDropdown); markAllAsRead(); }}>
                <Bell size={20} color="var(--text-muted)" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></span>
                )}
              </div>

              {/* Notification drop-down box */}
              {showNotifyDropdown && (
                <div className="glass-card" style={{ position: 'absolute', top: '2.5rem', right: 0, width: '300px', padding: '1rem', zIndex: 100, border: '1px solid var(--primary)', maxHeight: '350px', overflowY: 'auto' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>System Alerts</h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>No new notifications.</p>
                  ) : (
                    notifications.map((n, idx) => (
                      <div key={idx} style={{ padding: '0.5rem 0', borderBottom: idx !== notifications.length - 1 ? '1px solid var(--border-light)' : 'none', opacity: n.isRead ? 0.6 : 1 }}>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{n.title}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Redirect Dashboard Shortcut */}
              <Link to={user.role === 'Admin' ? '/admin' : user.role === 'Mentor' ? '/mentor' : '/learner'} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}>
                <User size={14} /> My Dashboard
              </Link>

              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)', gap: '0.4rem' }}>
                <LogOut size={14} /> Log Out
              </button>

            </div>
          ) : (
            /* User Logged Out */
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Sign In <LogIn size={16} />
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Join Platform <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (visible on mobile when open) */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/about" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
            <Globe size={18} /> About Us
          </Link>
          <Link to="/features" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
            <Sparkles size={18} /> Features
          </Link>
          <Link to="/contact" className="mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>
            <Mail size={18} /> Contact
          </Link>

          <div style={{ borderBottom: '1px solid var(--border-light)', margin: '0.5rem 0' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user ? (
              <>
                <Link to={user.role === 'Admin' ? '/admin' : user.role === 'Mentor' ? '/mentor' : '/learner'} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={() => setMobileMenuOpen(false)}>
                  <User size={16} /> My Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                  <LogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={() => setMobileMenuOpen(false)}>
                  Sign In <LogIn size={16} />
                </Link>
                <Link to="/signup" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={() => setMobileMenuOpen(false)}>
                  Join Platform <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>

  );
};

// Global Layout Wrap
const PageLayout = ({ children }) => {
  return (
    <div>
      <HeaderNavigation />
      <div style={{ minHeight: '85vh' }}>
        {children}
      </div>
      
      {/* Premium minimal Footer */}
      <footer style={{ borderTop: '1px solid var(--border-light)', padding: '2.5rem 2rem', textAlign: 'center', background: '#02000e', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.25rem' }}>
          <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>About</Link>
          <Link to="/features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Features</Link>
          <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Contact</Link>
        </div>
        <p>© 2026 Mentorix – AI Mentorship Platform. Seed database memory fallback active. All rights reserved.</p>
      </footer>
    </div>

  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<PageLayout><LandingPage /></PageLayout>} />
            <Route path="/about" element={<PageLayout><AboutPage /></PageLayout>} />
            <Route path="/features" element={<PageLayout><FeaturesPage /></PageLayout>} />
            <Route path="/contact" element={<PageLayout><ContactPage /></PageLayout>} />

            {/* AUTH ROUTES */}
            <Route path="/login" element={<PageLayout><LoginPage /></PageLayout>} />
            <Route path="/signup" element={<PageLayout><SignupPage /></PageLayout>} />
            <Route path="/forgot-password" element={<PageLayout><ForgotPasswordPage /></PageLayout>} />
            <Route path="/reset-password" element={<PageLayout><ResetPasswordPage /></PageLayout>} />

            {/* ROLE-BASED DASHBOARDS */}
            <Route path="/learner" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Learner']}>
                  <PageLayout><LearnerPages /></PageLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="/mentor" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Mentor']}>
                  <PageLayout><MentorPages /></PageLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Admin']}>
                  <PageLayout><AdminPages /></PageLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* FALLBACK CATCH-ALL */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
