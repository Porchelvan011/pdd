import { dbHelper } from '../utils/dbHelper.js';

// Seeded local advice bank to simulate intelligent responses
const adviceBank = {
  react: [
    "When engineering React components, ensure state lives close to where it is used. Consider splitting large structures into reusable visual nodes.",
    "Try utilizing `useCallback` when passing callbacks to memoized child components to prevent redundant garbage collector cycles.",
    "For global state, lightweight contexts are great, but for high-frequency updates, look into custom hooks or Zustand."
  ],
  backend: [
    "Keep controller methods lean! Outsource database validation and queries into specific helper layers (like dbHelper.js) to isolate code logic.",
    "Always secure endpoint routers with robust token validations. Password hashing is a non-negotiable standard.",
    "When structuring Express routing, group relative layers together and return standard JSON error structures."
  ],
  database: [
    "In MongoDB, choose embedding documents for data that is frequently read together. Use references when collections grow indefinitely.",
    "Always add indices to query fields that are searched frequently, like `email` or `userId`, to avoid full-collection scans.",
    "Ensure input sanitation on all request criteria to shield schemas from malicious injection."
  ],
  default: [
    "Consistency is the secret to engineering success. Try scheduling a short 30-minute daily coding sprint to lock in muscle memory.",
    "Break big feature blocks into minimal tasks. Complete the core routing first before spending hours tweaking button borders.",
    "Don't hesitate to book a calendar slot with your mentor Evelyn or Marcus! A 15-minute screen share can save days of trial and error."
  ]
};

export const chatWithAi = async (req, res) => {
  const { message } = req.body;
  try {
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: "Please provide a valid text question for your AI Mentor." });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // Standard Direct REST Fetch for Gemini API (if key is supplied)
    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are Mentorix AI, a supportive, premium, expert coding mentor. Provide a concise, clear, and highly professional answer to: ${message}`
                }]
              }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          return res.json({
            reply: data.candidates[0].content.parts[0].text,
            isLive: true
          });
        }
      } catch (err) {
        console.warn("⚠️ [AI] Gemini Live API call failed. Falling back to local intelligence: ", err.message);
      }
    }

    // Local Interactive Semantic Fallback
    const input = message.toLowerCase();
    let reply = "";
    
    if (input.includes("react") || input.includes("hook") || input.includes("frontend") || input.includes("state")) {
      const answers = adviceBank.react;
      reply = `🧠 **AI Mentor Frontend Tip:** ${answers[Math.floor(Math.random() * answers.length)]}\n\n*Challenge:* Try refactoring a state hook in your active roadmap task!`;
    } else if (input.includes("node") || input.includes("express") || input.includes("backend") || input.includes("api")) {
      const answers = adviceBank.backend;
      reply = `⚙️ **AI Mentor Backend Tip:** ${answers[Math.floor(Math.random() * answers.length)]}\n\n*Practice Recommendation:* Make sure you handle try-catch errors inside your Express controller templates.`;
    } else if (input.includes("mongodb") || input.includes("db") || input.includes("database") || input.includes("mongoose")) {
      const answers = adviceBank.database;
      reply = `💾 **AI Mentor Database Guide:** ${answers[Math.floor(Math.random() * answers.length)]}\n\n*Action Step:* Try testing your models with empty strings to verify schema limits.`;
    } else {
      const answers = adviceBank.default;
      reply = `🌟 **AI Mentor Growth Advice:** ${answers[Math.floor(Math.random() * answers.length)]}\n\n*Tip:* Check out the personalized Learning Path in your Learner dashboard.`;
    }

    return res.json({
      reply,
      isLive: false
    });

  } catch (error) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ message: "Error getting advice from AI mentor." });
  }
};
