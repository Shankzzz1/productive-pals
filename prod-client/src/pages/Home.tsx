import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Tokens ──────────────────────────────────────────────────────────────────
// bg: #FAFAFA  surface: #F4F4F4  border: #E5E5E5
// text-primary: #111  text-secondary: #666  text-muted: #999
// accent: #6366F1  accent-soft: #EEF2FF
// radius: 10px cards, 8px buttons

// ── Utility ─────────────────────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ");
const navigate = useNavigate();
// ── Live Focus Room Widget (hero signature element) ──────────────────────────
const AVATARS = [
  { id: 1, initials: "AK", color: "#D4A5F5", delay: 0 },
  { id: 2, initials: "JR", color: "#93C5FD", delay: 0.4 },
  { id: 3, initials: "ML", color: "#6EE7B7", delay: 0.8 },
  { id: 4, initials: "ST", color: "#FCA5A5", delay: 1.2 },
  { id: 5, initials: "PY", color: "#FDE68A", delay: 1.6 },
];

const TASKS = [
  { id: 1, text: "Write project proposal", done: true, owner: "AK" },
  { id: 2, text: "Review pull requests", done: true, owner: "JR" },
  { id: 3, text: "Update design system docs", done: false, owner: "ML" },
  { id: 4, text: "Prepare for Monday demo", done: false, owner: "ST" },
];

function PulsingRing({ color, delay }) {
  return (
    <span
      style={{
        position: "absolute",
        inset: -3,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        opacity: 0,
        animation: `pulse-ring 2.4s ease-out ${delay}s infinite`,
        pointerEvents: "none",
      }}
    />
  );
}

function FocusRoomWidget() {
  const [seconds, setSeconds] = useState(847);
  const [phase, setPhase] = useState("focus");
  const total = phase === "focus" ? 1500 : 300;

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setPhase((p) => (p === "focus" ? "break" : "focus"));
          return phase === "focus" ? 300 : 1500;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const progress = ((total - seconds) / total) * 100;
  const circumference = 2 * Math.PI * 38;
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E5E5",
        borderRadius: 16,
        padding: "24px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Room header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
            Deep Work Room
          </div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
            Session 3 of 4 · 5 members
          </div>
        </div>
        <div
          style={{
            background: phase === "focus" ? "#EEF2FF" : "#F0FDF4",
            color: phase === "focus" ? "#6366F1" : "#16A34A",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 20,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {phase === "focus" ? "Focus" : "Break"}
        </div>
      </div>

      {/* Timer ring */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="48" cy="48" r="38" fill="none" stroke="#F4F4F4" strokeWidth="5" />
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke={phase === "focus" ? "#6366F1" : "#16A34A"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              {mins}:{secs}
            </div>
          </div>
        </div>
      </div>

      {/* Avatars */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        {AVATARS.map((a, i) => (
          <div key={a.id} style={{ position: "relative", width: 32, height: 32 }}>
            <PulsingRing color={a.color} delay={a.delay} />
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: a.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#111",
                border: "2px solid #fff",
                position: "relative",
                zIndex: 1,
              }}
            >
              {a.initials}
            </div>
          </div>
        ))}
        <div style={{ marginLeft: 4, fontSize: 12, color: "#999" }}>all focusing</div>
      </div>

      {/* Task list */}
      <div style={{ borderTop: "1px solid #F4F4F4", paddingTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Your Tasks
        </div>
        {TASKS.map((task) => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: task.done ? "none" : "1.5px solid #D1D5DB",
                background: task.done ? "#6366F1" : "transparent",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {task.done && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                color: task.done ? "#999" : "#333",
                textDecoration: task.done ? "line-through" : "none",
                flex: 1,
              }}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics Preview Widget ─────────────────────────────────────────────────
const WEEK_DATA = [
  { day: "Mon", hours: 3.5 },
  { day: "Tue", hours: 5.0 },
  { day: "Wed", hours: 2.0 },
  { day: "Thu", hours: 6.5 },
  { day: "Fri", hours: 4.0 },
  { day: "Sat", hours: 1.5 },
  { day: "Sun", hours: 0.5 },
];

function BarChart({ data, animated }) {
  const max = Math.max(...data.map((d) => d.hours));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((d, i) => (
        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
            <div
              style={{
                width: "100%",
                borderRadius: 4,
                background: d.day === "Thu" ? "#6366F1" : "#E5E5E5",
                height: animated ? `${(d.hours / max) * 100}%` : "0%",
                transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s`,
                minHeight: 4,
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: d.day === "Thu" ? "#6366F1" : "#999", fontWeight: d.day === "Thu" ? 700 : 400 }}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsWidget() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAnimated(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: "#fff",
        border: "1px solid #E5E5E5",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>This Week</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.04em", marginTop: 4 }}>
            23.0<span style={{ fontSize: 16, fontWeight: 500, color: "#999" }}> hrs</span>
          </div>
        </div>
        <div style={{ background: "#F0FDF4", color: "#16A34A", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
          +18% vs last week
        </div>
      </div>
      <BarChart data={WEEK_DATA} animated={animated} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20, paddingTop: 20, borderTop: "1px solid #F4F4F4" }}>
        {[
          { label: "Sessions", value: "31" },
          { label: "Streak", value: "12d" },
          { label: "Avg/day", value: "3.3h" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Intersection-triggered fade-up ───────────────────────────────────────────
function FadeUp({ children, delay = 0, style = {} }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          border: "1px solid #E5E5E5",
          borderRadius: 12,
          padding: "24px",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          cursor: "default",
          height: "100%",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </FadeUp>
  );
}

// ── Step ─────────────────────────────────────────────────────────────────────
function Step({ num, title, desc, isLast, delay }) {
  return (
    <FadeUp delay={delay} style={{ flex: 1 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1.5px solid #E5E5E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#6366F1",
              background: "#fff",
            }}
          >
            {num}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 6, letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{desc}</div>
        </div>
      </div>
    </FadeUp>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(250,250,250,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #E5E5E5" : "1px solid transparent",
        transition: "background 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#6366F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#fff" strokeWidth="1.5" />
              <path d="M7 4.5v2.5l1.5 1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>
            Productive Pals
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["Features", "How it works", "Analytics"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{
                fontSize: 14,
                color: "#666",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 8,
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { e.target.style.color = "#111"; e.target.style.background = "#F4F4F4"; }}
              onMouseLeave={(e) => { e.target.style.color = "#666"; e.target.style.background = "transparent"; }}
            >
              {l}
            </a>
          ))}
          <div style={{ width: 1, height: 16, background: "#E5E5E5", margin: "0 8px" }} />
          <button
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#111",
              border: "none",
              padding: "8px 18px",
              borderRadius: 8,
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#333")}
            onMouseLeave={(e) => (e.target.style.background = "#111")}
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function ProductivePalsLanding() {
  const FEATURES = [
    {
      icon: "⏱",
      title: "Shared Pomodoro Timer",
      desc: "Everyone in the room sees the same timer. No one gets ahead. No one falls behind.",
    },
    {
      icon: "🚪",
      title: "Public & Private Rooms",
      desc: "Join an open room when you need company, or lock it down for your team.",
    },
    {
      icon: "📊",
      title: "Productivity Analytics",
      desc: "See your weekly focus time, streaks, and session history at a glance.",
    },
    {
      icon: "📋",
      title: "Per-session Tasks",
      desc: "Add tasks before you start. Check them off as you go. See what you actually did.",
    },
    {
      icon: "👁",
      title: "Presence Without Pressure",
      desc: "Knowing others are focused too is often all the motivation you need.",
    },
    {
      icon: "📈",
      title: "Focus History",
      desc: "A running log of every session you've completed, searchable and filterable.",
    },
  ];

  const STATS = [
    { value: "140k+", label: "Focus sessions" },
    { value: "8,200+", label: "Rooms created" },
    { value: "210k+", label: "Hours focused" },
  ];

  const STEPS = [
    {
      num: "1",
      title: "Create a room",
      desc: "Name it, set a goal, choose public or private. Takes about ten seconds.",
    },
    {
      num: "2",
      title: "Invite your people",
      desc: "Share a link. They click it. They're in. No account required to join.",
    },
    {
      num: "3",
      title: "Focus together",
      desc: "The timer runs for everyone. When it ends, take a break. Repeat.",
    },
  ];

  return (
    <>
      {/* Global styles */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #FAFAFA; color: #111; font-family: Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { flex-direction: column !important; }
          .stats-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .nav-links { display: none !important; }
          .analytics-grid { flex-direction: column !important; }
        }
      `}</style>

      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            width: "100%",
          }}
        >
          <div
            className="hero-grid"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 80,
            }}
          >
            {/* Left */}
            <div style={{ flex: "0 0 auto", maxWidth: 520 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#EEF2FF",
                  color: "#6366F1",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 20,
                  marginBottom: 32,
                  letterSpacing: "0.02em",
                  animation: "float-slow 4s ease-in-out infinite",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#6366F1",
                    animation: "pulse-ring 2s ease-out infinite",
                    flexShrink: 0,
                  }}
                />
                Live rooms open now
              </div>

              <h1
                style={{
                  fontSize: "clamp(40px, 6vw, 68px)",
                  fontWeight: 900,
                  color: "#111",
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  marginBottom: 24,
                }}
              >
                Focus better
                <br />
                <span style={{ color: "#6366F1" }}>together.</span>
              </h1>

              <p
                style={{
                  fontSize: 18,
                  color: "#555",
                  lineHeight: 1.65,
                  marginBottom: 40,
                  maxWidth: 420,
                }}
              >
                Productive Pals is a Pomodoro workspace where you and your team
                share a timer, track tasks, and stay on the same page — in real time.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  style={{
                    background: "#6366F1",
                    color: "#fff",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    transition: "background 0.15s, transform 0.15s",
                    
                  }}
                  onClick={() => navigate("/create")}
                  onMouseEnter={(e) => { e.target.style.background = "#4F46E5"; e.target.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.target.style.background = "#6366F1"; e.target.style.transform = "translateY(0)"; }}
                >
                  Create a room
                </button>
                <button
                  style={{
                    background: "#fff",
                    color: "#111",
                    border: "1.5px solid #E5E5E5",
                    padding: "14px 28px",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                  }}
                  onClick={() => navigate("/join")}
                  onMouseEnter={(e) => { e.target.style.borderColor = "#999"; e.target.style.background = "#F9F9F9"; e.target.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.background = "#fff"; e.target.style.transform = "translateY(0)"; }}
                >
                  Join a room
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 32,
                  fontSize: 13,
                  color: "#999",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" stroke="#999" strokeWidth="1.2" />
                  <path d="M5 7l1.5 1.5L9.5 5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Free to use · No download · Works in your browser
              </div>
            </div>

            {/* Right — Live widget */}
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                animation: "float-slow 5s ease-in-out 0.5s infinite",
              }}
            >
              <FocusRoomWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #E5E5E5",
          borderBottom: "1px solid #E5E5E5",
          background: "#F7F7F7",
          padding: "40px 24px",
        }}
      >
        <div
          className="stats-grid"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0,
          }}
        >
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1}>
              <div
                style={{
                  textAlign: "center",
                  padding: "0 32px",
                  borderRight: i < STATS.length - 1 ? "1px solid #E5E5E5" : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#111",
                    letterSpacing: "-0.04em",
                    lineHeight: 1.1,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>{s.label}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ marginBottom: 56, maxWidth: 540 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6366F1",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Features
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  color: "#111",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  marginBottom: 16,
                }}
              >
                Everything you need.
                <br />
                Nothing you don't.
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.65 }}>
                We kept it simple. No gamification, no dashboards-for-dashboard's-sake.
                Just the tools that help you and your team actually get things done.
              </p>
            </div>
          </FadeUp>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          background: "#F7F7F7",
          borderTop: "1px solid #E5E5E5",
          borderBottom: "1px solid #E5E5E5",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ marginBottom: 64, maxWidth: 480 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6366F1",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                How it works
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  color: "#111",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                }}
              >
                Up and running
                <br />
                in under a minute.
              </h2>
            </div>
          </FadeUp>

          <div
            className="steps-grid"
            style={{
              display: "flex",
              gap: 48,
              position: "relative",
            }}
          >
            {STEPS.map((s, i) => (
              <Step key={s.title} {...s} isLast={i === STEPS.length - 1} delay={i * 0.12} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics ─────────────────────────────────────────────────────── */}
      <section id="analytics" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            className="analytics-grid"
            style={{
              display: "flex",
              gap: 80,
              alignItems: "center",
            }}
          >
            {/* Left copy */}
            <div style={{ flex: "0 0 auto", maxWidth: 440 }}>
              <FadeUp>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6366F1",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Analytics
                </div>
                <h2
                  style={{
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 800,
                    color: "#111",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    marginBottom: 20,
                  }}
                >
                  See where
                  <br />
                  your time goes.
                </h2>
                <p style={{ fontSize: 16, color: "#666", lineHeight: 1.65, marginBottom: 32 }}>
                  Every session is logged. Weekly charts show your focus patterns
                  at a glance, so you can spot your most productive days and
                  protect them.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    "Daily and weekly focus time",
                    "Session streaks",
                    "Per-room history",
                    "Completion rate by task type",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          background: "#EEF2FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, color: "#444" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Right — chart widget */}
            <div style={{ flex: 1 }}>
              <FadeUp delay={0.1}>
                <AnalyticsWidget />
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px 80px",
          borderTop: "1px solid #E5E5E5",
          background: "#F7F7F7",
          textAlign: "center",
        }}
      >
        <FadeUp>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 900,
                color: "#111",
                letterSpacing: "-0.04em",
                lineHeight: 1.08,
                marginBottom: 20,
              }}
            >
              Ready to focus?
            </h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.6, marginBottom: 40 }}>
              Pick a room. Start a session. See what you can get done
              when everyone around you is doing the same.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                style={{
                  background: "#6366F1",
                  color: "#fff",
                  border: "none",
                  padding: "16px 32px",
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "background 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.target.style.background = "#4F46E5"; e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.target.style.background = "#6366F1"; e.target.style.transform = "translateY(0)"; }}
              >
                Create a room
              </button>
              <button
                style={{
                  background: "#fff",
                  color: "#111",
                  border: "1.5px solid #E5E5E5",
                  padding: "16px 32px",
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = "#999"; e.target.style.background = "#F9F9F9"; e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.background = "#fff"; e.target.style.transform = "translateY(0)"; }}
              >
                Join a room
              </button>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #E5E5E5",
          padding: "32px 24px",
          background: "#FAFAFA",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "#6366F1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#fff" strokeWidth="1.5" />
                <path d="M7 4.5v2.5l1.5 1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
              Productive Pals
            </span>
            <span style={{ fontSize: 13, color: "#ccc", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: 13, color: "#999" }}>© 2025</span>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Twitter", "GitHub"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 13,
                  color: "#999",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#111")}
                onMouseLeave={(e) => (e.target.style.color = "#999")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}