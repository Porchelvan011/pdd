import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, Mail, Lock, User, UserCheck, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

// ==========================================
// 1. LOGIN PAGE
// ==========================================
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userObj = await login(email, password);
      if (userObj.role === 'Admin') {
        navigate('/admin');
      } else if (userObj.role === 'Mentor') {
        navigate('/mentor');
      } else {
        navigate('/learner');
      }
    } catch (err) {
      setError(err.message || 'Verification mismatch. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '85vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Sign in to continue to your Mentorix dashboard.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', padding: '0.75rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input required type="email" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="yourname@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input required type="password" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 2. SIGNUP PAGE WITH STEPPER ONBOARDING
// ==========================================
export const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Learner', // Learner or Mentor
    skills: '',      // Common skill inputs separated by commas
    expertise: '',   // Mentor expertise field
    experience: '',  // Mentor years
    interests: '',   // Learner interest tags
    bio: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please enter credentials to continue.");
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Standardize comma strings into array slices
    const cleanedData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : []
    };

    try {
      const userObj = await register(cleanedData);
      if (userObj.role === 'Mentor') {
        navigate('/mentor');
      } else {
        navigate('/learner');
      }
    } catch (err) {
      setError(err.message || 'Onboarding error. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '85vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Step {step} of 2: {step === 1 ? 'Credentials' : 'Professional Profile'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <span style={{ width: '20px', height: '6px', background: 'var(--primary)', borderRadius: '3px' }}></span>
            <span style={{ width: '20px', height: '6px', background: step === 2 ? 'var(--primary)' : 'var(--bg-surface)', borderRadius: '3px', border: '1px solid var(--border-light)' }}></span>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', padding: '0.75rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Core Credentials */
          <form onSubmit={handleNextStep} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="text" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="Alex Mercer" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="email" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="alex@domain.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Secure Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="password" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="Password (min 6 symbols)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Platform Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button type="button" className="input-glass" style={{ borderColor: formData.role === 'Learner' ? 'var(--primary)' : 'var(--border-light)', background: formData.role === 'Learner' ? 'rgba(99,102,241,0.05)' : 'transparent', fontWeight: formData.role === 'Learner' ? '600' : 'normal', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, role: 'Learner' })}>
                  Learner (Student)
                </button>
                <button type="button" className="input-glass" style={{ borderColor: formData.role === 'Mentor' ? 'var(--primary)' : 'var(--border-light)', background: formData.role === 'Mentor' ? 'rgba(99,102,241,0.05)' : 'transparent', fontWeight: formData.role === 'Mentor' ? '600' : 'normal', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, role: 'Mentor' })}>
                  Mentor (Advisor)
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              Continue Profile Setup <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Step 2: Role-based Details */
          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            {formData.role === 'Learner' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Interests & Growth Target Tags (comma-separated)</label>
                  <input required type="text" className="input-glass" placeholder="React, Node.js, System Design, MongoDB" value={formData.interests} onChange={e => setFormData({ ...formData, interests: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Skills (comma-separated)</label>
                  <input required type="text" className="input-glass" placeholder="HTML, CSS, JavaScript" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Core Expertise Title</label>
                    <input required type="text" className="input-glass" placeholder="Full Stack Developer" value={formData.expertise} onChange={e => setFormData({ ...formData, expertise: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Years Exp.</label>
                    <input required type="number" min="1" className="input-glass" placeholder="5" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Verified Skills (comma-separated)</label>
                  <input required type="text" className="input-glass" placeholder="React, Express, System Design, AWS" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Short Professional Bio</label>
              <textarea rows={3} className="input-glass" style={{ resize: 'none' }} placeholder="A brief paragraph about your engineering aspirations or teaching capabilities..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                {loading ? "Registering..." : "Complete Signup"} <UserCheck size={16} />
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 3. FORGOT PASSWORD
// ==========================================
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setSuccess("We have sent reset coordinates to your console! Copy the token and reset below.");
      // Auto-save reset token for quick development bypass
      localStorage.setItem('mentorix_reset_token', data.resetToken);
    } catch (err) {
      setError(err.message || 'Error executing forgot password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '430px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Forgot Password?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Enter email credentials to request system reset keys.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', padding: '0.75rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
            <CheckCircle size={40} color="var(--success)" />
            <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>{success}</p>
            <Link to="/reset-password" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Proceed to Reset Input
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="email" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? "Generating keys..." : "Send Reset Token"}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Return to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 4. RESET PASSWORD
// ==========================================
export const ResetPasswordPage = () => {
  const [tokenInput, setTokenInput] = useState(localStorage.getItem('mentorix_reset_token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Password security key updated! You will be redirected shortly.");
      localStorage.removeItem('mentorix_reset_token');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Invalid key token or expired signature.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '430px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Enter system key along with new secure password.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', padding: '0.75rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
            <CheckCircle size={40} color="var(--success)" />
            <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>{success}</p>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Reset Security Token Key</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="text" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="Paste reset JWT key..." value={tokenInput} onChange={e => setTokenInput(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Secure Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input required type="password" className="input-glass" style={{ paddingLeft: '2.75rem' }} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? "Re-encrypting..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
