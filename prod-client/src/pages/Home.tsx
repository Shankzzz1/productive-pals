import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckSquare, Users, BarChart2, FolderOpen,
  Eye, Menu, X, Github, ArrowRight, TrendingUp
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Design tokens (all values derived from brief — not template defaults)
// bg: #FAFAFA  |  surface: #FFFFFF  |  border: #EBEBEB
// muted-bg: #F5F5F5  |  text: #0F0F0F  |  subtle: #6B6B6B
// accent: #6366F1  |  accent-bg: #EEEFFE  |  green: #16A34A
// ─────────────────────────────────────────────────────────────────

// ── Utility: scroll-triggered fade-up ────────────────────────────
function FadeUp({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Live animated Pomodoro room (signature element) ───────────────
const ROOM_MEMBERS = [
  { id: 1, initials: 'AK', bg: '#C4B5FD', label: 'Aditya K.' },
  { id: 2, initials: 'JR', bg: '#93C5FD', label: 'Jay R.' },
  { id: 3, initials: 'ML', bg: '#6EE7B7', label: 'Mia L.' },
  { id: 4, initials: 'ST', bg: '#FCA5A5', label: 'Sam T.' },
];

const ROOM_TASKS = [
  { id: 1, text: 'Review design system tokens', done: true },
  { id: 2, text: 'Write API integration tests', done: true },
  { id: 3, text: 'Prep Monday standup notes', done: false },
  { id: 4, text: 'Update changelog', done: false },
];

function LiveRoomCard() {
  const [seconds, setSeconds] = useState(1123);
  const [phase, setPhase] = useState('focus');
  const FOCUS_TOTAL = 1500;
  const BREAK_TOTAL = 300;
  const total = phase === 'focus' ? FOCUS_TOTAL : BREAK_TOTAL;

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setPhase(p => {
            const next = p === 'focus' ? 'break' : 'focus';
            return next;
          });
          return phase === 'focus' ? BREAK_TOTAL : FOCUS_TOTAL;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const pct = ((total - seconds) / total) * 100;
  const R = 44;
  const C = 2 * Math.PI * R;

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_4px_28px_rgba(0,0,0,0.07)] overflow-hidden w-full max-w-[400px] mx-auto">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
        <div>
          <p className="text-[13px] font-semibold text-[#0F0F0F] tracking-tight">Deep Work · Room #4</p>
          <p className="text-[11px] text-[#9B9B9B] mt-0.5">Session 2 of 4 · {ROOM_MEMBERS.length} members</p>
        </div>
        <span
          className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{
            background: phase === 'focus' ? '#EEEFFE' : '#F0FDF4',
            color: phase === 'focus' ? '#6366F1' : '#16A34A',
          }}
        >
          {phase === 'focus' ? 'Focus' : 'Break'}
        </span>
      </div>

      <div className="px-5 py-5">
        {/* Timer ring */}
        <div className="flex justify-center mb-5">
          <div className="relative w-[108px] h-[108px]">
            <svg width="108" height="108" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="54" cy="54" r={R} fill="none" stroke="#F0F0F0" strokeWidth="6" />
              <circle
                cx="54" cy="54" r={R} fill="none"
                stroke={phase === 'focus' ? '#6366F1' : '#16A34A'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - (pct / 100) * C}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-[22px] font-bold text-[#0F0F0F] tracking-tighter"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {mm}:{ss}
              </span>
            </div>
          </div>
        </div>

        {/* Presence row */}
        <div className="flex items-center gap-2 mb-5">
          {ROOM_MEMBERS.map((m, i) => (
            <div
              key={m.id}
              className="relative w-8 h-8"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {/* pulse ring */}
              <span
                className="absolute inset-[-3px] rounded-full border-2 animate-ping"
                style={{ borderColor: m.bg, opacity: 0.5, animationDuration: '2.2s', animationDelay: `${i * 0.4}s` }}
              />
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0F0F0F] border-2 border-white"
                style={{ background: m.bg }}
              >
                {m.initials}
              </div>
            </div>
          ))}
          <span className="text-[11px] text-[#9B9B9B] ml-1">all focusing</span>
        </div>

        {/* Task list */}
        <div className="border-t border-[#F0F0F0] pt-4">
          <p className="text-[10px] font-bold text-[#ABABAB] tracking-[0.08em] uppercase mb-3">Your tasks</p>
          <div className="space-y-2.5">
            {ROOM_TASKS.map(task => (
              <div key={task.id} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: task.done ? '#6366F1' : 'transparent',
                    border: task.done ? 'none' : '1.5px solid #D1D5DB',
                  }}
                >
                  {task.done && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5l2 2 4.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-[12px]"
                  style={{ color: task.done ? '#ABABAB' : '#333', textDecoration: task.done ? 'line-through' : 'none' }}
                >
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mini analytics preview ────────────────────────────────────────
const BARS = [
  { day: 'M', h: 55, active: false },
  { day: 'T', h: 80, active: false },
  { day: 'W', h: 35, active: false },
  { day: 'T', h: 100, active: true },
  { day: 'F', h: 65, active: false },
  { day: 'S', h: 20, active: false },
  { day: 'S', h: 10, active: false },
];

function AnalyticsCard() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setMounted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_4px_28px_rgba(0,0,0,0.07)] p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[12px] text-[#9B9B9B] font-medium mb-1">This week</p>
          <p className="text-[30px] font-extrabold text-[#0F0F0F] tracking-tight leading-none">
            23.5<span className="text-[16px] font-medium text-[#9B9B9B]"> hrs</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] text-[11px] font-bold px-2.5 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +18%
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-[72px] mb-3">
        {BARS.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
            <div className="flex-1 flex items-end w-full">
              <div
                className="w-full rounded-[3px]"
                style={{
                  height: mounted ? `${b.h}%` : '0%',
                  background: b.active ? '#6366F1' : '#EBEBEB',
                  transition: `height 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s`,
                  minHeight: 3,
                }}
              />
            </div>
            <span
              className="text-[9px] font-medium"
              style={{ color: b.active ? '#6366F1' : '#C0C0C0' }}
            >
              {b.day}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F0F0F0]">
        {[
          { label: 'Sessions', value: '31' },
          { label: 'Streak', value: '12d' },
          { label: 'Daily avg', value: '3.4h' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[16px] font-bold text-[#0F0F0F] tracking-tight">{s.value}</p>
            <p className="text-[10px] text-[#ABABAB] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────
function FeatureCard({ Icon, title, desc, delay }) {
  return (
    <FadeUp delay={delay}>
      <div className="group bg-white border border-[#EBEBEB] rounded-xl p-6 h-full transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 cursor-default">
        <div className="w-9 h-9 rounded-[8px] bg-[#EEEFFE] flex items-center justify-center mb-5">
          <Icon className="w-[18px] h-[18px] text-[#6366F1]" />
        </div>
        <h3 className="text-[14px] font-semibold text-[#0F0F0F] mb-2 tracking-tight">{title}</h3>
        <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{desc}</p>
      </div>
    </FadeUp>
  );
}

// ── Nav ──────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = ['Features', 'How it works', 'Analytics'];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? 'rgba(250,250,250,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid #EBEBEB' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-[#6366F1] flex items-center justify-center flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[14px] font-bold text-[#0F0F0F] tracking-tight">Productive Pals</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="text-[13px] text-[#6B6B6B] px-3 py-1.5 rounded-lg hover:text-[#0F0F0F] hover:bg-[#F0F0F0] transition-all duration-150"
            >
              {l}
            </a>
          ))}
          <div className="w-px h-4 bg-[#E0E0E0] mx-2" />
          <Link to="/create">
            <button className="text-[13px] font-semibold text-white bg-[#0F0F0F] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors duration-150">
              Get started
            </button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0F0]"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#EBEBEB] px-6 py-4 space-y-1">
          {links.map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="block text-[14px] text-[#6B6B6B] py-2 px-3 rounded-lg hover:bg-[#F5F5F5] hover:text-[#0F0F0F]"
              onClick={() => setMobileOpen(false)}
            >
              {l}
            </a>
          ))}
          <div className="pt-2">
            <Link to="/create" onClick={() => setMobileOpen(false)}>
              <button className="w-full text-[14px] font-semibold text-white bg-[#0F0F0F] py-2.5 rounded-[8px]">
                Get started
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function Home() {

  const FEATURES = [
    {
      Icon: Clock,
      title: 'Shared Pomodoro Timer',
      desc: 'Everyone in the room sees the same countdown. No one gets ahead, no one falls behind.',
    },
    {
      Icon: Users,
      title: 'Public & Private Rooms',
      desc: 'Join an open room when you need company, or lock it down for just your team.',
    },
    {
      Icon: BarChart2,
      title: 'Productivity Analytics',
      desc: 'Weekly charts, session streaks, and focus trends — all in one clean dashboard.',
    },
    {
      Icon: CheckSquare,
      title: 'Per-session Tasks',
      desc: 'Add tasks before you start, check them off as you go, and see what you shipped.',
    },
    {
      Icon: Eye,
      title: 'Presence Without Pressure',
      desc: 'Knowing others are focused too is often all the motivation you need.',
    },
    {
      Icon: FolderOpen,
      title: 'Full Session History',
      desc: 'Every session is logged. Go back, review, and see how your patterns change over time.',
    },
  ];

  const STEPS = [
    {
      n: '1',
      title: 'Create a room',
      desc: 'Name it, pick a goal, choose public or private. Takes about ten seconds.',
    },
    {
      n: '2',
      title: 'Invite your people',
      desc: 'Share a link. They click, they\'re in. No account required to join.',
    },
    {
      n: '3',
      title: 'Focus together',
      desc: 'The timer runs for everyone. Break together, then go again.',
    },
  ];

  const STATS = [
    { value: '140k+', label: 'Focus sessions' },
    { value: '8,200+', label: 'Rooms created' },
    { value: '210k+', label: 'Hours focused' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F0F0F]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        @keyframes ticker-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-animate { animation: fade-in-up 0.6s ease forwards; }
        .hero-animate-2 { animation: fade-in-up 0.6s 0.12s ease forwards; opacity: 0; }
        .hero-animate-3 { animation: fade-in-up 0.6s 0.22s ease forwards; opacity: 0; }
        .hero-animate-4 { animation: fade-in-up 0.6s 0.34s ease forwards; opacity: 0; }
        .widget-float { animation: ticker-float 5s ease-in-out infinite; }
      `}</style>

      <Nav />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center pt-[80px] pb-20 px-6">
        <div className="max-w-[1120px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* Left copy */}
            <div className="flex-shrink-0 lg:max-w-[500px]">
              {/* Live badge */}
              <div className="hero-animate inline-flex items-center gap-2 bg-[#EEEFFE] text-[#6366F1] text-[11px] font-bold px-3 py-1.5 rounded-full mb-8 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
                Rooms open right now
              </div>

              <h1 className="hero-animate-2 text-[clamp(44px,7vw,72px)] font-black text-[#0F0F0F] leading-[1.04] tracking-[-0.04em] mb-6">
                Focus better<br />
                <span className="text-[#6366F1]">together.</span>
              </h1>

              <p className="hero-animate-3 text-[17px] text-[#6B6B6B] leading-[1.7] mb-10 max-w-[400px]">
                A shared Pomodoro workspace where you and your team run the same timer,
                track tasks, and stay on the same page — in real time.
              </p>

              <div className="hero-animate-4 flex flex-wrap gap-3">
                <Link to="/create">
                  <button className="inline-flex items-center gap-2 bg-[#6366F1] text-white text-[14px] font-semibold px-6 py-3.5 rounded-[10px] hover:bg-[#4F46E5] transition-all duration-150 hover:-translate-y-px shadow-[0_2px_12px_rgba(99,102,241,0.35)]">
                    Create a room
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/join">
                  <button className="inline-flex items-center gap-2 bg-white text-[#0F0F0F] text-[14px] font-semibold px-6 py-3.5 rounded-[10px] border border-[#EBEBEB] hover:border-[#ABABAB] hover:bg-[#F9F9F9] transition-all duration-150 hover:-translate-y-px">
                    Join a room
                  </button>
                </Link>
              </div>

              <div className="hero-animate-4 flex items-center gap-2 mt-7 text-[12px] text-[#ABABAB]">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="#ABABAB" strokeWidth="1.2" />
                  <path d="M4.5 6.5l1.5 1.5 3-3" stroke="#ABABAB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Free · No download needed · Works in any browser
              </div>
            </div>

            {/* Right — live widget */}
            <div className="flex-1 flex justify-center w-full widget-float">
              <LiveRoomCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <div className="border-y border-[#EBEBEB] bg-[#F5F5F5]">
        <div className="max-w-[900px] mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-0">
            {STATS.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.08}>
                <div
                  className="text-center"
                  style={{ borderRight: i < STATS.length - 1 ? '1px solid #E0E0E0' : 'none' }}
                >
                  <p className="text-[32px] font-extrabold text-[#0F0F0F] tracking-[-0.04em] leading-tight">{s.value}</p>
                  <p className="text-[12px] text-[#9B9B9B] mt-1.5">{s.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-[1120px] mx-auto">
          <FadeUp>
            <div className="mb-14">
              <p className="text-[11px] font-bold text-[#6366F1] tracking-[0.1em] uppercase mb-4">Features</p>
              <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold text-[#0F0F0F] tracking-[-0.03em] leading-[1.13] mb-4 max-w-[420px]">
                Everything you need.<br />Nothing you don't.
              </h2>
              <p className="text-[15px] text-[#6B6B6B] leading-relaxed max-w-[400px]">
                No gamification, no dashboards for dashboard's sake.
                Just the tools that help you actually get things done.
              </p>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#F5F5F5] border-y border-[#EBEBEB]">
        <div className="max-w-[1120px] mx-auto">
          <FadeUp>
            <div className="mb-14">
              <p className="text-[11px] font-bold text-[#6366F1] tracking-[0.1em] uppercase mb-4">How it works</p>
              <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold text-[#0F0F0F] tracking-[-0.03em] leading-[1.13]">
                Up and running<br />in under a minute.
              </h2>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full border border-[#DDDDF0] bg-white flex items-center justify-center text-[13px] font-bold text-[#6366F1]">
                    {s.n}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-[14px] font-semibold text-[#0F0F0F] mb-2 tracking-tight">{s.title}</h3>
                    <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ─────────────────────────────────────────── */}
      <section id="analytics" className="py-24 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Copy */}
            <div className="lg:max-w-[420px]">
              <FadeUp>
                <p className="text-[11px] font-bold text-[#6366F1] tracking-[0.1em] uppercase mb-4">Analytics</p>
                <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold text-[#0F0F0F] tracking-[-0.03em] leading-[1.13] mb-5">
                  See where<br />your time goes.
                </h2>
                <p className="text-[15px] text-[#6B6B6B] leading-relaxed mb-8">
                  Every session is logged. Weekly charts reveal your focus patterns
                  so you can protect your most productive hours.
                </p>
                <ul className="space-y-3.5">
                  {[
                    'Daily and weekly focus time',
                    'Session streaks and milestones',
                    'Per-room history',
                    'Task completion trends',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-[5px] bg-[#EEEFFE] flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[13px] text-[#444]">{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            </div>

            {/* Chart widget */}
            <div className="flex-1 w-full">
              <FadeUp delay={0.1}>
                <AnalyticsCard />
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#F5F5F5] border-t border-[#EBEBEB] text-center">
        <FadeUp>
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[clamp(36px,5.5vw,60px)] font-black text-[#0F0F0F] tracking-[-0.04em] leading-[1.06] mb-5">
              Ready to<br />focus?
            </h2>
            <p className="text-[16px] text-[#6B6B6B] leading-relaxed mb-10">
              Pick a room. Start a session. See what you can finish when
              everyone around you is doing the same.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/create">
                <button className="inline-flex items-center gap-2 justify-center bg-[#6366F1] text-white text-[15px] font-semibold px-8 py-4 rounded-[10px] hover:bg-[#4F46E5] transition-all duration-150 hover:-translate-y-px shadow-[0_2px_16px_rgba(99,102,241,0.3)] w-full sm:w-auto">
                  Create a room
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/join">
                <button className="inline-flex items-center justify-center bg-white text-[#0F0F0F] text-[15px] font-semibold px-8 py-4 rounded-[10px] border border-[#EBEBEB] hover:border-[#ABABAB] hover:bg-[#F9F9F9] transition-all duration-150 hover:-translate-y-px w-full sm:w-auto">
                  Join a room
                </button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[#EBEBEB] px-6 py-8">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[5px] bg-[#6366F1] flex items-center justify-center">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-[#0F0F0F] tracking-tight">Productive Pals</span>
            <span className="text-[#D0D0D0] mx-1">·</span>
            <span className="text-[13px] text-[#ABABAB]">© 2025</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'GitHub'].map(l => (
              <a
                key={l}
                href="#"
                className="text-[13px] text-[#ABABAB] hover:text-[#0F0F0F] transition-colors duration-150 flex items-center gap-1.5"
              >
                {l === 'GitHub' && <Github className="w-3.5 h-3.5" />}
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}