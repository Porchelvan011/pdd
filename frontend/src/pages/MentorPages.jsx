import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Calendar, Clock, Star, FileText, CheckCircle, XCircle, Award, Check, Save 
} from 'lucide-react';

export const MentorPages = () => {
  const { token, user, updateProfile, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Mentor lists
  const [mentorProfile, setMentorProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeMentees, setActiveMentees] = useState([]);

  // Availability setup
  const [availHours, setAvailHours] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchRequests();
    fetchSessions();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMentorProfile(data.profile);
        setAvailHours(data.profile?.availability?.join(', ') || '');
        
        // Mocking active mentees based on requests/approvals for demo
        setActiveMentees([
          { name: "Alex Mercer", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", progress: 60, currentTask: "Building React Router Multi-Page Interface", level: 2 }
        ]);
      }
    } catch (e) { console.log(e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/mentors/requests/received`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) { console.log(e); }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/session/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) { console.log(e); }
  };

  // Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.target;
      const expertise = form.expertise.value;
      const experience = Number(form.experience.value);
      const skills = form.skills.value.split(',').map(s => s.trim());
      const availability = availHours.split(',').map(h => h.trim());
      const bio = form.bio.value;

      await updateProfile({ expertise, experience, skills, availability, bio });
      alert("Mentor profile updated!");
      fetchProfile();
    } catch (err) { alert("Save failed."); }
    finally { setLoading(false); }
  };

  // Request Decisioning
  const handleRequestAction = async (requestId, status) => {
    try {
      const res = await fetch(`${API_URL}/mentors/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Request ${status} successfully!`);
        fetchRequests();
        fetchProfile();
      }
    } catch (e) { console.log(e); }
  };

  // Session mark completed
  const handleSessionComplete = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        alert("Meeting marked completed!");
        fetchSessions();
      }
    } catch (e) { console.log(e); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '85vh', background: 'var(--bg-deep)' }}>
      
      {/* Sidebar Controller */}
      <div style={{ background: '#07051a', borderRight: '1px solid var(--border-light)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Mentor portal</p>
          <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>{user.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className="status-badge completed" style={{ fontSize: '0.7rem' }}>⭐ {mentorProfile?.rating || 5.0} Rating</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mentorProfile?.experience || 5} Yrs Exp</span>
          </div>
        </div>

        {[
          { tab: 'dashboard', label: 'Dashboard', icon: <Users size={18} /> },
          { tab: 'profile', label: 'Profile Setup', icon: <FileText size={18} /> },
          { tab: 'requests', label: 'Learner Requests', icon: <Calendar size={18} /> },
          { tab: 'tracking', label: 'Mentees Tracking', icon: <Award size={18} /> },
          { tab: 'history', label: 'Session Archive', icon: <Clock size={18} /> }
        ].map((item) => (
          <button key={item.tab} className="btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === item.tab ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeTab === item.tab ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === item.tab ? '600' : 'normal', padding: '0.8rem 1rem' }} onClick={() => setActiveTab(item.tab)}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content Area */}
      <div style={{ padding: '2.5rem', overflowY: 'auto', maxHeight: '85vh' }}>
        
        {/* ======================================= */}
        {/* TAB 1: MENTOR DASHBOARD */}
        {/* ======================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: "Active Mentees", val: activeMentees.length, icon: <Users color="var(--primary)" /> },
                { label: "Pending Requests", val: requests.filter(r => r.status === 'pending').length, icon: <Calendar color="var(--secondary)" /> },
                { label: "Upcoming Meetings", val: sessions.filter(s => s.status === 'scheduled').length, icon: <Clock color="var(--accent)" /> },
                { label: "Average Rating", val: `${mentorProfile?.rating || 5.0} / 5.0`, icon: <Star color="#f59e0b" fill="#f59e0b" /> }
              ].map((card, idx) => (
                <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{card.label}</p>
                    <h2 style={{ fontSize: '1.8rem', color: '#fff', marginTop: '0.25rem' }}>{card.val}</h2>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              
              {/* Upcoming Session list */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Scheduled Meetings This Week</h3>
                {sessions.filter(s => s.status === 'scheduled').length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sessions booked yet.</p>
                ) : (
                  sessions.filter(s => s.status === 'scheduled').map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: idx !== sessions.filter(s => s.status === 'scheduled').length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>{s.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 Student: {s.peerName} • {s.timeSlot}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>📅 {s.date} • {s.notes}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a href={s.meetingLink} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          Join
                        </a>
                        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleSessionComplete(s._id)}>
                          Complete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Status and earnings logs info */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(236,72,153,0.05) 100%)' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Verification Status</h3>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DISCOVERABLE ID</p>
                  <p style={{ fontWeight: '600', color: 'var(--primary)' }}>{user.id || user._id}</p>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>APPROVAL AUDIT</p>
                  <span className={`status-badge ${mentorProfile?.isApproved ? 'completed' : 'pending'}`} style={{ marginTop: '0.25rem' }}>
                    {mentorProfile?.isApproved ? 'Approved & Public' : 'Pending Verification'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: PROFILE MANAGEMENT */}
        {/* ======================================= */}
        {activeTab === 'profile' && (
          <div className="glass-card" style={{ maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Mentor Profile Management</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Configure skills, availability hours, and certifications.</p>

            <form onSubmit={handleProfileSave} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Expertise Title</label>
                  <input required name="expertise" type="text" className="input-glass" defaultValue={mentorProfile?.expertise || ''} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Years Exp.</label>
                  <input required name="experience" type="number" className="input-glass" defaultValue={mentorProfile?.experience || 5} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Skills (comma separated)</label>
                <input required name="skills" type="text" className="input-glass" defaultValue={mentorProfile?.skills?.join(', ') || ''} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Weekly Booking Slots (comma separated)</label>
                <input required type="text" className="input-glass" value={availHours} onChange={e => setAvailHours(e.target.value)} placeholder="Monday 10:00 AM - 12:00 PM, Thursday 3:00 PM - 5:00 PM" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Teaching Bio</label>
                <textarea name="bio" rows={4} className="input-glass" style={{ resize: 'none' }} defaultValue={mentorProfile?.bio || ''}></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: 'max-content' }} disabled={loading}>
                <Save size={16} /> {loading ? "Updating Profile..." : "Update Qualifications"}
              </button>
            </form>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: MENTORSHIP REQUESTS PAGE */}
        {/* ======================================= */}
        {activeTab === 'requests' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Incoming Student Requests</h2>
              <p style={{ color: 'var(--text-muted)' }}>Review profile credentials and accept learner pairings.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {requests.filter(r => r.status === 'pending').length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending mentorship requests in your queue.</p>
              ) : (
                requests.filter(r => r.status === 'pending').map((req, idx) => (
                  <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <img src={req.learner.avatar} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="Student" />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{req.learner.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🎯 Goal: {req.learner.profile?.careerGoals?.[0] || 'Learn Fullstack development'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>💬 Msg: "{req.message}"</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleRequestAction(req._id, 'approved')}>
                        Accept student
                      </button>
                      <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleRequestAction(req._id, 'rejected')}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: MENTEE TRACKING PROGRESS */}
        {/* ======================================= */}
        {activeTab === 'tracking' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Mentee Skill Development Tracking</h2>
              <p style={{ color: 'var(--text-muted)' }}>Audit milestone completion charts and gamification levels of your active students.</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
              {activeMentees.map((mentee, idx) => (
                <div key={idx} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <img src={mentee.avatar} style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover' }} alt="Student" />
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{mentee.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Level {mentee.level} Learner • Active Roadmap Target</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Roadmap Completion progress</span>
                        <span style={{ fontWeight: 'bold' }}>{mentee.progress}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${mentee.progress}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingLeft: '2rem', borderLeft: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>CURRENT ENGAGED TASK</p>
                    <h4 style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.4 }}>{mentee.currentTask}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: MENTOR SESSION HISTORY */}
        {/* ======================================= */}
        {activeTab === 'history' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Session History Notes</h2>
              <p style={{ color: 'var(--text-muted)' }}>Archive logs of all previous schedules, notes, and attachment records.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {sessions.filter(s => s.status === 'completed').length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No preceding completed sessions listed.</p>
              ) : (
                sessions.filter(s => s.status === 'completed').map((s, idx) => (
                  <div key={idx} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="status-badge completed">Completed</span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>📅 Date: {s.date}</p>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>{s.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 Student counterpart: {s.peerName} • {s.timeSlot}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px' }}>
                      🗒 Note: "{s.notes || 'No review notes written for this slot.'}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
