import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, CheckCircle2, ShieldAlert, BarChart2, Trash2, Search, RefreshCw, XCircle, ShieldCheck
} from 'lucide-react';

export const AdminPages = () => {
  const { token, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // States
  const [userList, setUserList] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [token]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await fetchUsers();
      await fetchReports();
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserList(data);
        // Expose mentors requiring approval
        setPendingMentors(data.filter(u => u.role === 'Mentor' && u.profile && !u.profile.isApproved));
      }
    } catch (e) { console.log(e); }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) { console.log(e); }
  };

  // 1. Approve Mentor
  const handleApprove = async (mentorUserId) => {
    try {
      const res = await fetch(`${API_URL}/admin/approve-mentor/${mentorUserId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Mentor profile verified & approved successfully!");
        loadAdminData();
      }
    } catch (e) { console.log(e); }
  };

  // 2. Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate and delete this profile permanently?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Account purged from database successfully.");
        loadAdminData();
      }
    } catch (e) { console.log(e); }
  };

  // 3. Resolve Report
  const handleResolveReport = async (reportId) => {
    try {
      const res = await fetch(`${API_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        alert("Report marked resolved.");
        fetchReports();
      }
    } catch (e) { console.log(e); }
  };

  // Filters
  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '85vh', background: 'var(--bg-deep)' }}>
      
      {/* Sidebar Controller */}
      <div style={{ background: '#07051a', borderRight: '1px solid var(--border-light)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Administrator</p>
          <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>Admin Console</h4>
          <span className="status-badge completed" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>Core Control Active</span>
        </div>

        {[
          { tab: 'dashboard', label: 'Admin Dashboard', icon: <Users size={18} /> },
          { tab: 'approvals', label: 'Mentor Approvals', icon: <CheckCircle2 size={18} /> },
          { tab: 'users', label: 'User Management', icon: <Users size={18} /> },
          { tab: 'moderation', label: 'Moderation Reports', icon: <ShieldAlert size={18} /> },
          { tab: 'analytics', label: 'Site Performance', icon: <BarChart2 size={18} /> }
        ].map((item) => (
          <button key={item.tab} className="btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === item.tab ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeTab === item.tab ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === item.tab ? '600' : 'normal', padding: '0.8rem 1rem' }} onClick={() => setActiveTab(item.tab)}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content Area */}
      <div style={{ padding: '2.5rem', overflowY: 'auto', maxHeight: '85vh' }}>
        
        {/* ======================================= */}
        {/* TAB 1: ADMIN DASHBOARD METRICS */}
        {/* ======================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: "Total Registered Users", val: userList.length, icon: <Users color="var(--primary)" /> },
                { label: "Active Mentors", val: userList.filter(u => u.role === 'Mentor' && u.profile?.isApproved).length, icon: <ShieldCheck color="var(--success)" /> },
                { label: "Pending verifications", val: pendingMentors.length, icon: <CheckCircle2 color="var(--warning)" /> },
                { label: "Active Abuse incidents", val: reports.filter(r => r.status === 'pending').length, icon: <ShieldAlert color="var(--danger)" /> }
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

            {/* Quick summary status tables */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                System Activity Log <RefreshCw size={16} className={loading ? "animate-float" : ""} onClick={loadAdminData} style={{ cursor: 'pointer' }} />
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                The core backend routing Fallback is operating successfully. Session tokens utilize SHA256 criteria keys. Database reads auto-aggregate profile lists dynamically.
              </p>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: MENTOR APPROVAL PAGE */}
        {/* ======================================= */}
        {activeTab === 'approvals' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Verification Approvals</h2>
              <p style={{ color: 'var(--text-muted)' }}>Review credentials and approve mentor discovery eligibility.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {pendingMentors.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No mentors pending verification checks.</p>
              ) : (
                pendingMentors.map((m, idx) => (
                  <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <img src={m.avatar} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="Mentor" />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{m.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🎓 Expertise: {m.profile.expertise} • {m.profile.experience} Yrs Exp.</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>🛠 Skills: {m.profile.skills?.join(', ')}</p>
                      </div>
                    </div>
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleApprove(m._id)}>
                      Approve & Make Live
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: USER DIRECTORY MANAGEMENT */}
        {/* ======================================= */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>User Management Directory</h2>
                <p style={{ color: 'var(--text-muted)' }}>Search and moderate registered student and mentor profiles.</p>
              </div>
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-glass" style={{ paddingLeft: '2.5rem' }} placeholder="Search name, role, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>User details</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>System Role</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx !== filteredUsers.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <img src={item.avatar} style={{ width: '35px', height: '35px', borderRadius: '50%' }} alt="Avatar" />
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span className={`status-badge ${item.role === 'Admin' ? 'scheduled' : item.role === 'Mentor' ? 'completed' : 'pending'}`}>
                          {item.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{item.email}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        {item.role !== 'Admin' && (
                          <button className="btn-secondary" style={{ padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)', borderRadius: '8px' }} onClick={() => handleDeleteUser(item._id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: MODERATION REPORTS ABUSE */}
        {/* ======================================= */}
        {activeTab === 'moderation' && (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Moderation Incident Abuse reports</h2>
              <p style={{ color: 'var(--text-muted)' }}>Manage student and mentor behavioral complaints.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {reports.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No incident reports submitted yet.</p>
              ) : (
                reports.map((rep, idx) => (
                  <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className={`status-badge ${rep.status === 'resolved' ? 'completed' : 'cancelled'}`}>{rep.status}</span>
                        <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>Reason: {rep.reason}</h4>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 Reporter: {rep.reporterName} • Target: {rep.reportedName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Description: "{rep.description}"</p>
                    </div>
                    {rep.status === 'pending' && (
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--success)', border: 'none' }} onClick={() => handleResolveReport(rep._id)}>
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: SYSTEM PERFORMANCE CHARTS */}
        {/* ======================================= */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Site-wide Performance Analytics</h2>
              <p style={{ color: 'var(--text-muted)' }}>Overview of user growths and scheduled bookings.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
              
              {/* Registration split */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>User Roles distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: "Learners", count: userList.filter(u => u.role === 'Learner').length, pct: 70, color: "var(--primary)" },
                    { label: "Technical Mentors", count: userList.filter(u => u.role === 'Mentor').length, pct: 25, color: "var(--secondary)" },
                    { label: "System Admins", count: userList.filter(u => u.role === 'Admin').length, pct: 5, color: "var(--accent)" }
                  ].map((x, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span>{x.label}</span>
                        <span style={{ fontWeight: 'bold' }}>{x.count} profiles ({x.pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${x.pct}%`, height: '100%', background: x.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server metrics */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Server Status Indicators</h3>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>API DISPATCH PORT</p>
                  <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>5000 (Express Gateway)</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SOCKET PORTAL SIGNALING</p>
                  <p style={{ fontSize: '1.1rem', color: 'var(--success)', fontWeight: 'bold' }}>WebSocket Socket.io Live</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
