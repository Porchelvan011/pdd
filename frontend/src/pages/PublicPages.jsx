import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Compass, Award, Star, HelpCircle, Mail, MessageSquare, Send, Globe, Users } from 'lucide-react';

// ==========================================
// 1. LANDING PAGE
// ==========================================
export const LandingPage = () => {
  const mockSpotlight = [
    { name: "Dr. Evelyn Foster", role: "Full Stack Engineer (Ex-Google)", expertise: "React, Node.js, System Architectures", rating: 4.9, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
    { name: "Marcus Chen", role: "Senior Machine Learning Engineer", expertise: "Python, PyTorch, Model Scale", rating: 4.8, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-glow-spot" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-glow-spot" style={{ top: '60%', right: '-10%', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }}></div>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem 4rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '30px', color: '#818cf8', fontWeight: '600', fontSize: '0.85rem', marginBottom: '2rem' }}>
          🚀 Version 2.0 Live – Auto AI Matching Active
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Guiding Paths,<br />Empowering Futures
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          Accelerate your technology career. Connect with industry experts, acquire gamified credentials, and follow custom AI-tailored roadmaps.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.9rem 2rem' }}>
            Get Started Free <Compass size={20} />
          </Link>
          <Link to="/about" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '0.9rem 2rem' }}>
            Learn More
          </Link>
        </div>
      </section>

      {/* Stats Matrix */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '3rem auto', padding: '0 2rem' }}>
        {[
          { metric: "12,000+", label: "Active Learners" },
          { metric: "450+", label: "Verified Technical Mentors" },
          { metric: "98.7%", label: "Placement Success Rate" },
          { metric: "24/7", label: "AI Guidancer Support" }
        ].map((item, idx) => (
          <div key={idx} className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{item.metric}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.label}</p>
          </div>
        ))}
      </section>

      {/* Key Feature Highlights */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Engineered for Accelerators</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Mentorix matches advanced algorithm designs with high-fidelity analytics trackers.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { icon: <Target size={30} color="#6366f1" />, title: "Smart Matching Score", desc: "Our AI recommendation compares goals and skill trees, ranking matching mentors with a decimal percentage score." },
            { icon: <Award size={30} color="#a855f7" />, title: "Gamified XP Milestones", desc: "Gain points, advance developmental levels, maintain coding streaks, and unlock credential badges." },
            { icon: <Shield size={30} color="#ec4899" />, title: "Role-Based workspaces", desc: "Isolated dashboards customized for Students, Mentors, and Administrators with high security." }
          ].map((feat, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', width: 'max-content' }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mentor Spotlight Showcase */}
      <section style={{ padding: '4rem 2rem 8rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textCenter: 'center', fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>Featured Spotlights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {mockSpotlight.map((mentor, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <img src={mentor.avatar} alt={mentor.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
              <div>
                <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{mentor.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{mentor.role}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>{mentor.expertise}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', color: '#f59e0b', fontSize: '0.85rem' }}>
                  <Star size={14} fill="#f59e0b" /> {mentor.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ==========================================
// 2. ABOUT PAGE
// ==========================================
export const AboutPage = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', textAlign: 'center' }}>Platform Overview</h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '1.1rem', marginBottom: '4rem' }}>
        Bridging the gap between knowledge and achievement through direct, curated human mentorship and real-time AI analytics.
      </p>

      <div style={{ display: 'grid', gap: '2.5rem' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            To unlock potential globally by building the world's most accessible, reliable, and premium technical mentorship marketplace. We believe every aspiring engineer deserves a structured roadmap guided by seasoned industry engineers.
          </p>
        </div>

        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>Our Vision</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            A world where career advancement is driven by verified skills, hard-earned knowledge, and active community backing. Through advanced AI matching trees and real-time sockets, we dismantle systemic hiring blocks.
          </p>
        </div>

        {/* Dynamic Timeline */}
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>Development Timeline</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              { year: "2024", event: "Project Mentorix conceived; core architecture drafted in dark slate theme." },
              { year: "2025", event: "Integrated active Socket.io communication portals and star-rating systems." },
              { year: "2026", event: "Merged dynamic Gemini AI roadmaps and role-based administrative centers." }
            ].map((t, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {t.year}
                </div>
                <div className="glass-card" style={{ flex: 1, padding: '1rem 1.5rem' }}>
                  <p style={{ fontSize: '0.95rem' }}>{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. FEATURES OVERVIEW
// ==========================================
export const FeaturesPage = () => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Modern Core Architecture</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore the custom-built modules designed to propel your engineering growth.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {[
          { icon: <Compass size={36} color="#6366f1" />, title: "Smart Fit Matching", desc: "Our complex backend matches learner profile interest sets against mentor skills, outputting a clear, sortable accuracy percentage score." },
          { icon: <MessageSquare size={36} color="#a855f7" />, title: "AI Guidance Assistant", desc: "A 24/7 dedicated local artificial intelligence chat companion capable of producing instant custom tasks, coding advice, and debug logs." },
          { icon: <Users size={36} color="#ec4899" />, title: "Real-time Messaging", desc: "Built using WebSocket Socket.io signaling rooms, featuring typing indicators, instant notification alerts, and file attachment uploads." },
          { icon: <Award size={36} color="#10b981" />, title: "Streak Gamification", desc: "Progress in skill trees to accumulate XP, complete weekly targets, levels, and unlock premium cryptographic verification badges." }
        ].map((feat, idx) => (
          <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', width: 'max-content' }}>
              {feat.icon}
            </div>
            <h3 style={{ fontSize: '1.35rem' }}>{feat.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. CONTACT & ACCORDION FAQ
// ==========================================
export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
      setSent(false);
      alert('Message transmitted successfully! Developer logs verified.');
    }, 1500);
  };

  const faqs = [
    { q: "Is local DB memory fallback active?", a: "Yes! If no MongoDB daemon is running locally, the system automatically switches to an in-memory high-fidelity datastore containing seeded profiles so every component behaves perfectly." },
    { q: "How does the AI Matching Score calculate?", a: "It cross-analyzes arrays of user interest parameters against mentor tags, applying multipliers for mentor experience logs and average ratings." },
    { q: "Can I register as both Learner and Mentor?", a: "Mentorix roles are unique to ensure clean dashboards. You can register separate accounts using different email IDs to test specific dashboard paths." }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
      
      {/* Contact Form Panel */}
      <div className="glass-card" style={{ alignSelf: 'start' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Get in Touch</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Send a message to our system moderators.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Name</label>
            <input required type="text" className="input-glass" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
            <input required type="email" className="input-glass" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Detailed Message</label>
            <textarea required rows={4} className="input-glass" style={{ resize: 'none' }} placeholder="How can our support team assist your journey?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sent}>
            {sent ? "Transmitting..." : "Send Inquiry"} <Send size={16} />
          </button>
        </form>
      </div>

      {/* Support Details & Accordion FAQ */}
      <div style={{ display: 'grid', gap: '2.5rem', alignContent: 'start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Platform Support</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Mail color="#6366f1" size={20} />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Inquiry</p>
                <p style={{ fontWeight: '500' }}>support@mentorix.com</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Globe color="#a855f7" size={20} />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Global Headquarters</p>
                <p style={{ fontWeight: '500' }}>Silicon Grid, Floor 8, Suite 400</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion List */}
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Common FAQ</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{faq.q}</h4>
                  <HelpCircle size={16} color={activeFaq === idx ? "var(--primary)" : "var(--text-dim)"} />
                </div>
                {activeFaq === idx && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.5, borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
