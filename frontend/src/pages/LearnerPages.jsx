import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  BookOpen, User, Search, Map, Cpu, MessageSquare, Calendar, BarChart2, Award, Star, 
  Send, Sparkles, Plus, CheckCircle, Flame, Clock, RefreshCw, Paperclip, Check
} from 'lucide-react';

export const LearnerPages = () => {
  const { token, user, updateProfile, API_URL } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Domain states
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Modals & Chat states
  const [requestMsg, setRequestMsg] = useState('');
  const [activeChatMentor, setActiveChatMentor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiHistory, setAiHistory] = useState([
    { sender: 'ai', text: 'Hi! I am your 24/7 AI Mentor Assistant. Ask me any coding doubts, ask for roadmap suggestions, or tips!' }
  ]);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Booking states
  const [bookTitle, setBookTitle] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookSlot, setBookSlot] = useState('');
  const [bookNotes, setBookNotes] = useState('');

  // Review states
  const [reviewSessionId, setReviewSessionId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Onboarding generator
  const [customPathTitle, setCustomPathTitle] = useState('');
  const [customPathTopics, setCustomPathTopics] = useState('');

  const chatEndRef = useRef(null);

  // Load initial data
  useEffect(() => {
    fetchProfile();
    fetchMentors();
    fetchLearningPath();
    fetchSessions();
    loadLeaderboard();
  }, [token]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiHistory]);

  // Listen to Socket.io messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      // If we are currently chatting with this person, append to chat
      if (activeChatMentor && (msg.senderId === activeChatMentor.userId || msg.senderId === user.id)) {
        setChatMessages(prev => [...prev, msg]);
      }
    });

    socket.on('peer_typing', (data) => {
      if (activeChatMentor && data.senderId === activeChatMentor.userId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('peer_typing');
    };
  }, [socket, activeChatMentor]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLearnerProfile(data.profile);
      }
    } catch (e) { console.error(e); }
  };

  const fetchMentors = async () => {
    try {
      const res = await fetch(`${API_URL}/mentors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMentors(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLearningPath = async () => {
    try {
      const res = await fetch(`${API_URL}/learning-path`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLearningPath(data);
      } else {
        setLearningPath(null);
      }
    } catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
  };

  const loadLeaderboard = () => {
    setLeaderboard([
      { name: "Dr. Evelyn Foster (Mentor)", points: 2800, level: 9, isSelf: false },
      { name: "Alex Mercer (You)", points: learnerProfile?.points || 450, level: learnerProfile?.level || 2, isSelf: true },
      { name: "Nico Bellic", points: 420, level: 2, isSelf: false },
      { name: "Lara Croft", points: 310, level: 1, isSelf: false }
    ]);
  };

  // 1. Profile updating
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.target;
      const skills = form.skills.value.split(',').map(s => s.trim());
      const interests = form.interests.value.split(',').map(i => i.trim());
      const bio = form.bio.value;
      await updateProfile({ skills, interests, bio });
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      alert("Profile save failed.");
    } finally { setLoading(false); }
  };

  // 2. Roadmaps progression checklist completion
  const handleProgressToggle = async (type, id, completed) => {
    try {
      const res = await fetch(`${API_URL}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, id, completed })
      });
      if (res.ok) {
        fetchLearningPath();
        fetchProfile();
      }
    } catch (err) { console.error(err); }
  };

  // 3. Mentorship Request submissions
  const handleSendRequest = async (mentor) => {
    try {
      const res = await fetch(`${API_URL}/mentors/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId: mentor.userId, message: requestMsg })
      });
      const data = await res.json();
      alert(data.message);
      setRequestMsg('');
      setSelectedMentor(null);
    } catch (err) { alert("Error sending request."); }
  };

  // 4. Booking Scheduler
  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!bookTitle || !bookDate || !bookSlot || !selectedMentor) {
      alert("Please enter title, date, slot details.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/session/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId: selectedMentor.userId,
          title: bookTitle,
          date: bookDate,
          timeSlot: bookSlot,
          notes: bookNotes
        })
      });
      if (res.ok) {
        alert("Session booked! Jitsi link generated.");
        setBookTitle('');
        setBookDate('');
        setBookSlot('');
        setBookNotes('');
        setSelectedMentor(null);
        setActiveTab('dashboard');
        fetchSessions();
      }
    } catch (e) { alert("Error scheduling session."); }
  };

  // 5. Star Reviews
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: reviewSessionId,
          rating: Number(reviewRating),
          comment: reviewComment
        })
      });
      if (res.ok) {
        alert("Feedback submitted successfully!");
        setReviewSessionId(null);
        setReviewComment('');
        fetchSessions();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (e) { alert("Error submitting rating review."); }
  };

  // 6. AI Guidance Query
  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiText) return;

    const userQ = aiText;
    setAiHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setAiText('');
    setAiLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userQ })
      });
      const data = await res.json();
      if (res.ok) {
        setAiHistory(prev => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (e) {
      setAiHistory(prev => [...prev, { sender: 'ai', text: 'Error connecting with AI core. Please check server.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // 7. Auto AI Path Onboarding
  const handleGeneratePath = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/learning-path/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: customPathTitle,
          topics: customPathTopics ? customPathTopics.split(',').map(t => t.trim()) : undefined
        })
      });
      if (res.ok) {
        alert("AI Learning Path successfully drafted!");
        setCustomPathTitle('');
        setCustomPathTopics('');
        fetchLearningPath();
      }
    } catch (e) { alert("Error generating path."); }
  };

  // 8. Load Real-time Chat partner details
  const startChatWindow = async (mentor) => {
    setActiveChatMentor(mentor);
    setActiveTab('chat');
    try {
      // Load message logs from server
      const res = await fetch(`${API_URL}/chat/history/${mentor.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Fallback loads from seeded message arrays
        // Let's populate the mock array history
        const mockMessages = [
          { senderId: mentor.userId, text: `Hello Alex! How can I help you master your React skills?`, createdAt: new Date() }
        ];
        setChatMessages(mockMessages);
      }
    } catch (e) { console.log(e); }
  };

  // 9. Send Real-time Chat message
  const transmitMessage = (e) => {
    e.preventDefault();
    if (!chatText || !socket || !activeChatMentor) return;

    const data = {
      senderId: user.id || user._id,
      receiverId: activeChatMentor.userId,
      text: chatText,
      attachment: null
    };

    socket.emit('send_message', data);
    setChatText('');
    
    // Stop typing alert
    socket.emit('typing', { senderId: user.id, receiverId: activeChatMentor.userId, isTyping: false });
  };

  const handleChatTyping = (val) => {
    setChatText(val);
    if (!socket || !activeChatMentor) return;
    socket.emit('typing', {
      senderId: user.id || user._id,
      receiverId: activeChatMentor.userId,
      isTyping: val.length > 0
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '85vh', background: 'var(--bg-deep)' }}>
      
      {/* Sidebar Controller */}
      <div style={{ background: '#07051a', borderRight: '1px solid var(--border-light)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em', color: 'var(--text-dim)' }}>Learner portal</p>
          <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>{user.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className="status-badge completed" style={{ fontSize: '0.7rem' }}>LVL {learnerProfile?.level || 1}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔥 {learnerProfile?.streak || 1} Day streak</span>
          </div>
        </div>

        {[
          { tab: 'dashboard', label: 'Dashboard', icon: <BookOpen size={18} /> },
          { tab: 'profile', label: 'My Profile', icon: <User size={18} /> },
          { tab: 'discovery', label: 'Mentor Discovery', icon: <Search size={18} /> },
          { tab: 'roadmap', label: 'Learning Path', icon: <Map size={18} /> },
          { tab: 'ai-chat', label: 'AI Support Mentor', icon: <Cpu size={18} /> },
          { tab: 'sessions', label: 'Booked Sessions', icon: <Calendar size={18} /> },
          { tab: 'analytics', label: 'Growth Analytics', icon: <BarChart2 size={18} /> },
          { tab: 'rewards', label: 'Rewards & Leaderboard', icon: <Award size={18} /> }
        ].map((item) => (
          <button key={item.tab} className="btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === item.tab ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeTab === item.tab ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === item.tab ? '600' : 'normal', padding: '0.8rem 1rem' }} onClick={() => setActiveTab(item.tab)}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content Area */}
      <div style={{ padding: '2.5rem', overflowY: 'auto', maxHeight: '85vh' }}>
        
        {/* ======================================= */}
        {/* TAB 1: LEARNER DASHBOARD */}
        {/* ======================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back, {user.name}! ⚡️</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '550px' }}>Your AI Matching profile calculates a strong synergy with our technical leads this week. Complete daily milestones to boost your platform XP level!</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT LEVEL</p>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{learnerProfile?.level || 1}</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{learnerProfile?.points || 100} Points accumulated</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              
              {/* Active Mentorship Connections */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>My Advisors <Star size={18} fill="currentColor" color="var(--warning)" /></h3>
                {mentors.filter(m => m.isApproved).slice(0, 2).map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: idx === 0 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={m.user.avatar} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt={m.user.name} />
                      <div>
                        <h4 style={{ fontSize: '1rem', color: '#fff' }}>{m.user.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.expertise}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => startChatWindow(m)}>
                        Chat
                      </button>
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => { setSelectedMentor(m); setActiveTab('book-calendar'); }}>
                        Book Meeting
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming Schedules Box */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Upcoming Meetings</h3>
                {sessions.filter(s => s.status === 'scheduled').length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No slots scheduled this week.</p>
                ) : (
                  sessions.filter(s => s.status === 'scheduled').map((s, idx) => (
                    <div key={idx} style={{ display: 'grid', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="status-badge scheduled">Scheduled</span>
                        <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Join Link</a>
                      </div>
                      <h4 style={{ fontSize: '0.95rem' }}>{s.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 Mentor: {s.peerName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>🕒 {s.date} ({s.timeSlot})</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: PROFILE EDITOR */}
        {/* ======================================= */}
        {activeTab === 'profile' && (
          <div className="glass-card" style={{ maxWidth: '650px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Edit Learner Profile</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Update your tags and bios. These fields drive the AI Best Fit calculations.</p>

            <form onSubmit={handleProfileSave} style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Skills (separated by commas)</label>
                <input required name="skills" type="text" className="input-glass" defaultValue={learnerProfile?.skills?.join(', ') || 'HTML, CSS, JavaScript'} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Interests & Topics (separated by commas)</label>
                <input required name="interests" type="text" className="input-glass" defaultValue={learnerProfile?.interests?.join(', ') || 'React, Node.js, System Design'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Profile Bio</label>
                <textarea name="bio" rows={4} className="input-glass" style={{ resize: 'none' }} defaultValue={learnerProfile?.bio || ''}></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: 'max-content' }} disabled={loading}>
                {loading ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: MENTOR DISCOVERY (AI MATCHED) */}
        {/* ======================================= */}
        {activeTab === 'discovery' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Smart Match Advisory</h2>
              <p style={{ color: 'var(--text-muted)' }}>Mentors are listed sorted dynamically by computed AI Best Fit Score matching your skill tags.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {mentors.map((m, idx) => (
                <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Matching Indicator bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      <Sparkles size={16} /> AI Match: {m.bestFitScore || 85}%
                    </div>
                    <span className="status-badge completed" style={{ fontSize: '0.75rem' }}>Approved</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={m.user.avatar} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} alt={m.user.name} />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{m.user.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.expertise}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <Star size={14} fill="#f59e0b" /> {m.rating || 5.0} • {m.experience} Years Exp.
                      </div>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{m.bio}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {m.skills.map((s, sIdx) => (
                      <span key={sIdx} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'var(--primary)' }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <button className="btn-secondary" style={{ padding: '0.6rem 0', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => { setSelectedMentor(m); setRequestMsg(`Hi ${m.user.name}, I want to join your mentorship group!`); }}>
                      Request Link
                    </button>
                    <button className="btn-primary" style={{ padding: '0.6rem 0', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => { setSelectedMentor(m); setActiveTab('book-calendar'); }}>
                      Book Session
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Request modal container popup */}
            {selectedMentor && activeTab !== 'book-calendar' && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Request Mentorship with {selectedMentor.user.name}</h3>
                  <textarea rows={4} className="input-glass" style={{ resize: 'none', marginBottom: '1.5rem' }} value={requestMsg} onChange={e => setRequestMsg(e.target.value)}></textarea>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={() => setSelectedMentor(null)}>Cancel</button>
                    <button className="btn-primary" onClick={() => handleSendRequest(selectedMentor)}>Send Request</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: PERSONALIZED LEARNING PATH */}
        {/* ======================================= */}
        {activeTab === 'roadmap' && (
          <div>
            {!learningPath ? (
              <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
                <Sparkles size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Active AI Roadmap</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Input subjects to let Mentorix AI generate a premium personalized timeline for you.</p>
                <form onSubmit={handleGeneratePath} style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Roadmap Title</label>
                    <input required type="text" className="input-glass" placeholder="React & Express Master Track" value={customPathTitle} onChange={e => setCustomPathTitle(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Topics Focus (comma separated)</label>
                    <input required type="text" className="input-glass" placeholder="Contexts, API Routers, Token Hashing" value={customPathTopics} onChange={e => setCustomPathTopics(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                    Generate Smart Roadmap
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2.5rem' }}>
                
                {/* Timeline roadmap flow */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>{learningPath.title}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generated AI Onboarding Milestone Path</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{learningPath.progress}%</h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ROADMAP XP COMPLETE</p>
                    </div>
                  </div>

                  {/* SVG progress indicator bar */}
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '4px', overflow: 'hidden', marginBottom: '3rem' }}>
                    <div style={{ width: `${learningPath.progress}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))', transition: 'width 0.4s ease' }}></div>
                  </div>

                  <div style={{ display: 'grid', gap: '2rem', position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
                    {learningPath.milestones.map((m, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        
                        {/* Dot indicator status */}
                        <div style={{ position: 'absolute', left: '-2.7rem', top: '0.2rem', width: '22px', height: '22px', borderRadius: '50%', background: m.status === 'completed' ? 'var(--success)' : m.status === 'in-progress' ? 'var(--primary)' : 'var(--bg-deep)', border: `2px solid ${m.status === 'completed' ? 'var(--success)' : m.status === 'in-progress' ? 'var(--primary)' : 'var(--border-light)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {m.status === 'completed' && <Check size={12} color="#fff" />}
                        </div>

                        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: m.status === 'in-progress' ? '4px solid var(--primary)' : '1px solid var(--border-light)' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>MILESTONE 0{m.id} • {m.difficulty}</span>
                            <h4 style={{ fontSize: '1.05rem', color: m.status === 'completed' ? 'var(--text-muted)' : '#fff', textDecoration: m.status === 'completed' ? 'line-through' : 'none' }}>{m.name}</h4>
                          </div>
                          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: m.status === 'completed' ? 'var(--success)' : 'var(--border-light)', color: m.status === 'completed' ? 'var(--success)' : '#fff' }} onClick={() => handleProgressToggle('milestone', m.id, m.status !== 'completed')}>
                            {m.status === 'completed' ? "Completed" : "Mark Done"}
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily checklist parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Daily Tasks lists */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Daily Target Tasks <CheckCircle size={18} color="var(--primary)" /></h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {learningPath.dailyTasks.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} checked={t.completed} onChange={e => handleProgressToggle('daily', t.id, e.target.checked)} />
                          <span style={{ fontSize: '0.9rem', color: t.completed ? 'var(--text-dim)' : 'var(--text-main)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                            {t.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly goals targets */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Weekly Goals <Award size={18} color="var(--secondary)" /></h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {learningPath.weeklyGoals.map((g, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} checked={g.completed} onChange={e => handleProgressToggle('weekly', g.id, e.target.checked)} />
                          <span style={{ fontSize: '0.9rem', color: g.completed ? 'var(--text-dim)' : 'var(--text-main)', textDecoration: g.completed ? 'line-through' : 'none' }}>
                            {g.goal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setLearningPath(null)}>
                    Re-Generate Path
                  </button>

                </div>

              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: AI SUPPORT GUIDANCE ASSISTANT */}
        {/* ======================================= */}
        {activeTab === 'ai-chat' && (
          <div className="glass-card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '10px' }}>
                  <Cpu color="var(--primary)" size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff' }}>24/7 AI Mentor Assistant</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rule-based semantic model • Real Gemini live sync available</p>
                </div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setAiHistory([{ sender: 'ai', text: 'Hi! Let us restart our coaching session. Ask me any technical doubts!' }])}>
                Reset History
              </button>
            </div>

            {/* Chats scrolling lists */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {aiHistory.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxStyle: '75%', padding: '0.9rem 1.2rem', borderRadius: '16px', background: item.sender === 'user' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255,255,255,0.03)', border: item.sender === 'user' ? 'none' : '1px solid var(--border-light)', color: '#fff', fontSize: '0.9rem', whiteSpace: 'pre-wrap', borderBottomRightRadius: item.sender === 'user' ? '4px' : '16px', borderBottomLeftRadius: item.sender === 'user' ? '16px' : '4px' }}>
                    {item.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '0.9rem 1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <RefreshCw size={14} className="animate-float" /> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Mentor thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick chips shortcuts */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {["How to structure React context?", "Best practices for Node routing?", "Mongoose DB schema optimization tips", "Suggestions to raise my profile XP?"].map((chip, idx) => (
                <button key={idx} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '20px', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setAiText(chip); }}>
                  {chip}
                </button>
              ))}
            </div>

            {/* Form actions */}
            <form onSubmit={handleAiSearch} style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" className="input-glass" placeholder="Ask your AI Mentor a doubt..." value={aiText} onChange={e => setAiText(e.target.value)} />
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }} disabled={aiLoading}>
                <Send size={16} />
              </button>
            </form>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 6: REAL-TIME MESSAGING CHAT PORTAL */}
        {/* ======================================= */}
        {activeTab === 'chat' && activeChatMentor && (
          <div className="glass-card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img src={activeChatMentor.user.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt={activeChatMentor.user.name} />
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff' }}>{activeChatMentor.user.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeChatMentor.expertise}</p>
                </div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('discovery')}>
                Back to Discovery
              </button>
            </div>

            {/* Chat lists */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {chatMessages.map((msg, idx) => {
                const isMyMessage = msg.senderId === user.id || msg.senderId === user._id;
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxStyle: '75%', padding: '0.8rem 1.2rem', borderRadius: '16px', background: isMyMessage ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255,255,255,0.03)', border: isMyMessage ? 'none' : '1px solid var(--border-light)', color: '#fff', fontSize: '0.9rem', borderBottomRightRadius: isMyMessage ? '4px' : '16px', borderBottomLeftRadius: isMyMessage ? '16px' : '4px' }}>
                      <p>{msg.text}</p>
                      {msg.attachment && (
                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                          <a href={msg.attachment} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                            <Paperclip size={12} /> View Attached PDF Layout
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '0.6rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activeChatMentor.user.name} is typing...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form actions */}
            <form onSubmit={transmitMessage} style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-secondary" style={{ padding: '0.75rem' }} onClick={() => {
                const dummyLink = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
                // Trigger file attach simulation directly!
                const fileData = {
                  senderId: user.id || user._id,
                  receiverId: activeChatMentor.userId,
                  text: 'Attached draft layout for next session review.',
                  attachment: dummyLink
                };
                socket.emit('send_message', fileData);
              }}>
                <Paperclip size={18} />
              </button>
              <input type="text" className="input-glass" placeholder={`Send chat message to ${activeChatMentor.user.name}...`} value={chatText} onChange={e => handleChatTyping(e.target.value)} />
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                <Send size={16} />
              </button>
            </form>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 7: SESSION BOOKING CALENDAR */}
        {/* ======================================= */}
        {activeTab === 'book-calendar' && (
          <div className="glass-card" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Book Mentorship Session</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Choose your timing slot. A secure Jitsi Video meeting URL will be generated instantly.</p>

            <form onSubmit={handleBookSession} style={{ display: 'grid', gap: '1.25rem' }}>
              {selectedMentor ? (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem' }}>
                  <img src={selectedMentor.user.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Selected" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SELECTED MENTOR</p>
                    <h4 style={{ fontSize: '1rem' }}>{selectedMentor.user.name}</h4>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Mentor</label>
                  <select required className="input-glass" style={{ background: '#0e0b24', color: '#fff' }} onChange={e => setSelectedMentor(mentors.find(m => m._id === e.target.value))}>
                    <option value="">-- Choose Approved Mentor --</option>
                    {mentors.filter(m => m.isApproved).map(m => (
                      <option key={m._id} value={m._id}>{m.user.name} ({m.expertise})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Session Target Focus</label>
                <input required type="text" className="input-glass" placeholder="React Router Config Review" value={bookTitle} onChange={e => setBookTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Schedule Date</label>
                  <input required type="date" className="input-glass" value={bookDate} onChange={e => setBookDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Availability Slots</label>
                  <select required className="input-glass" style={{ background: '#0e0b24', color: '#fff' }} value={bookSlot} onChange={e => setBookSlot(e.target.value)}>
                    <option value="">-- Choose Slot --</option>
                    {selectedMentor?.availability?.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                    )) || (
                      <>
                        <option value="Monday 10:00 AM - 11:00 AM">Monday 10:00 AM - 11:00 AM</option>
                        <option value="Wednesday 2:00 PM - 3:00 PM">Wednesday 2:00 PM - 3:00 PM</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Preparatory Notes</label>
                <textarea rows={3} className="input-glass" style={{ resize: 'none' }} placeholder="Share what files or problems you want to tackle..." value={bookNotes} onChange={e => setBookNotes(e.target.value)}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedMentor(null)}>
                  Clear
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Secure Session Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 8: SESSIONS & FEEDBACK SCREEN */}
        {/* ======================================= */}
        {activeTab === 'sessions' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Booked Session History</h2>
              <p style={{ color: 'var(--text-muted)' }}>Access upcoming video meeting channels and submit evaluations for completed sessions.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {sessions.map((s, idx) => (
                <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <img src={s.peerAvatar} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="Peer" />
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{s.title}</h4>
                        <span className={`status-badge ${s.status}`}>{s.status}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 Mentor: {s.peerName} • {s.timeSlot}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>📅 Date: {s.date} • {s.notes || 'No notes added.'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {s.status === 'scheduled' ? (
                      <a href={s.meetingLink} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        Launch Video Meeting
                      </a>
                    ) : s.status === 'completed' ? (
                      <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => setReviewSessionId(s._id)}>
                        Rate Session
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Review popup Modal */}
            {reviewSessionId && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Evaluate Your Session</h3>
                  <form onSubmit={handleReviewSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rating (1 - 5 Stars)</label>
                      <input type="range" min="1" max="5" className="input-glass" style={{ cursor: 'pointer' }} value={reviewRating} onChange={e => setReviewRating(e.target.value)} />
                      <p style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--warning)', marginTop: '0.5rem' }}>
                        {"★".repeat(reviewRating)}{"☆".repeat(5 - reviewRating)} ({reviewRating}/5)
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Comments / Review</label>
                      <textarea required rows={3} className="input-glass" style={{ resize: 'none' }} placeholder="What did you learn during this review?" value={reviewComment} onChange={e => setReviewComment(e.target.value)}></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => setReviewSessionId(null)}>Cancel</button>
                      <button type="submit" className="btn-primary">Submit Stars</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 9: GROWTH PROGRESS ANALYTICS */}
        {/* ======================================= */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Skill Growth Analytics</h2>
              <p style={{ color: 'var(--text-muted)' }}>Audit milestone completion charts and gamification point history stats.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              {/* Circular Gauge progress SVG */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Overall Roadmap Complete</h3>
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                    <circle cx="75" cy="75" r="60" fill="none" stroke="url(#indigo-glow-gradient)" strokeWidth="10" strokeDasharray="377" strokeDashoffset={377 - (377 * (learningPath?.progress || 60)) / 100} strokeLinecap="round" transform="rotate(-90 75 75)" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                    <defs>
                      <linearGradient id="indigo-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate/translate(-50%, -50%)', margin: '-1.5rem 0 0 -1.5rem', textAlign: 'center', width: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>{learningPath?.progress || 60}%</h2>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>Keep completing roadmap targets to level up!</p>
              </div>

              {/* Point allocation analysis */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>XP Distribution</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: "Milestone Deliverables", pts: 250, color: "var(--primary)" },
                    { label: "Daily Task Completed", pts: 120, color: "var(--secondary)" },
                    { label: "Weekly Goals Met", pts: 80, color: "var(--accent)" }
                  ].map((x, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span>{x.label}</span>
                        <span style={{ fontWeight: 'bold' }}>{x.pts} XP</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(x.pts / 450) * 100}%`, height: '100%', background: x.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 10: REWARDS & LEADERBOARD GAMIFICATION */}
        {/* ======================================= */}
        {activeTab === 'rewards' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
            
            {/* Badges unlocked */}
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Unlocked Badges</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem' }}>
                {[
                  { title: "First Step", desc: "Seed Signup complete", icon: "🏆", active: true },
                  { title: "Streaker", desc: "5-day learn streaks", icon: "🔥", active: learnerProfile?.points >= 250 },
                  { title: "Tech Enthusiast", desc: "400 XP milestones", icon: "🧠", active: learnerProfile?.points >= 400 },
                  { title: "Overachiever", desc: "1000 XP accumulation", icon: "🚀", active: learnerProfile?.points >= 1000 }
                ].map((badge, idx) => (
                  <div key={idx} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', opacity: badge.active ? 1 : 0.35, border: badge.active ? '1px solid var(--primary)' : '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                    <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>{badge.title}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{badge.desc}</p>
                    <span className="status-badge completed" style={{ fontSize: '0.6rem', marginTop: '0.75rem', background: badge.active ? 'rgba(16,185,129,0.1)' : 'transparent', color: badge.active ? 'var(--success)' : 'var(--text-dim)' }}>
                      {badge.active ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Leaderboard */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Platform Rankings <Flame size={18} color="var(--accent)" /></h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {leaderboard.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: item.isSelf ? 'rgba(99,102,241,0.1)' : 'transparent', border: item.isSelf ? '1px solid var(--primary)' : '1px solid transparent' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#d1d5db' : '#94a3b8' }}>#{idx + 1}</span>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: '#fff' }}>{item.name}</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LVL {item.level}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.points} XP</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
