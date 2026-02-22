import { useState, useEffect, useCallback, useRef } from "react";

// ── Source icons ──────────────────────────────────────────────────────────────
const SRC_ICON = {
  gmail: (c) => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke={c} strokeWidth="2.2"/>
      <path d="M2 7l10 7 10-7" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  slack: (c) => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill={c}>
      <path d="M14.5 2a2.5 2.5 0 0 0-5 0v5h5V2zm0 15h-5v5a2.5 2.5 0 0 0 5 0v-5zM2 9.5a2.5 2.5 0 0 0 0 5h5v-5H2zm15 0v5h5a2.5 2.5 0 0 0 0-5h-5z"/>
    </svg>
  ),
  asana: (c) => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill={c}>
      <circle cx="12" cy="5.5" r="4"/>
      <circle cx="4.5" cy="17" r="4"/>
      <circle cx="19.5" cy="17" r="4"/>
    </svg>
  ),
};
const MoonIcon = ({ c }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = ({ c }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const SpinnerIcon = ({ c }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
);

// ── Theme (oklch throughout) ───────────────────────────────────────────────────
const makeTheme = (dark) => dark
  ? {
      pageBg:     "url(/bg.jpeg) center/cover fixed oklch(18% 0.004 265)",
      surfaceBg:  "oklch(18% 0.006 260 / 0.85)",
      surfaceHov: "oklch(23% 0.008 260 / 0.85)",
      headerBg:   "oklch(24% 0.008 265 / 0.65)",
      trayBg:     "oklch(18% 0.004 265 / 0.35)",
      barBg:      "oklch(18% 0.004 265)",
      border:     "transparent",
      borderHov:  "transparent",
      shadow:     "0 2px 12px oklch(0% 0 0/0.45)",
      shadowHov:  "0 6px 28px oklch(0% 0 0/0.65)",
      textPri:    "oklch(93% 0 0)",
      textSec:    "oklch(100% 0 0 / 0.5)",
      colLabel:   "oklch(100% 0 0)", colSub:"oklch(100% 0 0 / 0.5)",
      textMut:    "oklch(43% 0 0)",
      aiBg:       "oklch(11% 0.018 280)",
      aiBorder:   "transparent",
      aiLabel:    "oklch(68% 0.18 290)",
      aiText:     "oklch(58% 0.1 290)",
      aiSync:     "oklch(56% 0.14 290)",
      src: {
        gmail: { c:"oklch(82% 0.17 25)",  bg:"oklch(23% 0.04 25)"  },
        slack: { c:"oklch(84% 0.08 310)", bg:"oklch(22% 0.03 310)" },
        asana: { c:"oklch(82% 0.15 22)",  bg:"oklch(23% 0.04 22)"  },
      },
      pri: {
        urgent: { d:"oklch(79% 0.2 28)",   bg:"oklch(23% 0.05 28)",   t:"oklch(84% 0.18 28)"  },
        high:   { d:"oklch(82% 0.18 50)",  bg:"oklch(23% 0.05 50)",   t:"oklch(86% 0.16 50)"  },
        medium: { d:"oklch(72% 0.15 290)", bg:"oklch(20% 0.04 290)",  t:"oklch(78% 0.12 290)" },
        low:    { d:"oklch(43% 0 0)",      bg:"oklch(20% 0 0)",        t:"oklch(53% 0 0)"      },
        blocked:{ d:"oklch(43% 0 0)",      bg:"oklch(20% 0 0)",        t:"oklch(53% 0 0)"      },
      },
      col: {
        today:   { ac:"oklch(66% 0.2 28)",   acBg:"oklch(19% 0.05 28)",  acBd:"transparent" },
        week:    { ac:"oklch(60% 0.15 290)", acBg:"oklch(17% 0.04 290)", acBd:"transparent" },
        fyi:     { ac:"oklch(42% 0 0)",      acBg:"oklch(17% 0 0)",       acBd:"transparent" },
        blocked: { ac:"oklch(36% 0 0)",      acBg:"oklch(16% 0 0)",       acBd:"transparent" },
      },
      chip:      { bg:"oklch(0% 0 0 / 0.3)", star:"oklch(100% 0 0)", t:"oklch(100% 0 0)",
                   starGrad:"linear-gradient(141deg, rgb(117,99,192) 30%, rgb(255,154,152) 50%, rgb(255,255,255) 66%)",
                   tGrad:"linear-gradient(174deg, rgba(117,99,192,0.8) 30%, rgba(255,154,152,0.8) 50%, rgba(255,255,255,0.8) 66%)" },
      tagBg:     "oklch(12% 0 0)", tagText:"oklch(34% 0 0)",
      actDone:   { c:"oklch(68% 0.15 145)", bg:"oklch(30% 0.06 145)", hov:"oklch(35% 0.08 145)" },
      actMuted:  { c:"oklch(100% 0 0)",      bg:"oklch(0% 0 0 / 0.3)",       hov:"oklch(0% 0 0 / 0.4)"      },
      actDivider:"oklch(20% 0 0)",
      todayPill: { bg:"oklch(23% 0.05 28)", t:"oklch(82% 0.18 28)", dot:"oklch(72% 0.22 28)" },
      filterOn:  { bg:"oklch(88% 0 0)", t:"oklch(10% 0 0)" },
      filterOff: { bg:"oklch(0% 0 0 / 0.25)", t:"oklch(44% 0 0)", bd:"transparent" },
      syncBtn:   { bg:"oklch(0% 0 0 / 0.25)", t:"oklch(52% 0 0)" },
      toggleBtn: { bg:"oklch(0% 0 0 / 0.25)", t:"oklch(68% 0 0)" },
      emptyB:    "oklch(20% 0 0)", emptyT:"oklch(28% 0 0)",
      donePill:  { bg:"oklch(17% 0.05 145)", t:"oklch(70% 0.16 145)" },
      warnBg:    "oklch(18% 0.04 45)",  warnBorder:"oklch(24% 0.08 45)",  warnText:"oklch(72% 0.16 45)",
      errBg:     "oklch(17% 0.04 25)",  errBorder:"oklch(22% 0.08 25)",   errText:"oklch(70% 0.18 25)",
      cardBlur:"blur(30px)",
      skeletonBase:"oklch(23% 0 0)", skeletonShine:"oklch(28% 0 0)",
      footerDot: "oklch(22% 0 0)", footerTot:"oklch(34% 0 0)", footerAi:"oklch(56% 0.14 290)",
      tabBar:    { bg:"oklch(0% 0 0 / 0.85)", activeBg:"oklch(24% 0.008 265)", activeText:"oklch(93% 0 0)", inactiveText:"oklch(38% 0 0)", indicatorFn:(colId)=>({today:"oklch(66% 0.2 28)",week:"oklch(60% 0.15 290)",fyi:"oklch(42% 0 0)",blocked:"oklch(36% 0 0)"})[colId] },
      cardBorder:"1px solid oklch(100% 0 0 / 0.08)",
      cardShadow:"0 2px 12px oklch(0% 0 0/0.3), inset 0 1px 0 oklch(100% 0 0/0.08)",
      colShadow:"0 4px 20px oklch(0% 0 0/0.25), inset 0 1px 0 oklch(100% 0 0/0.06), inset 0 -1px 0 oklch(0% 0 0/0.15)",
    }
  : {
      pageBg:"url(/bg.jpeg) center/cover fixed oklch(92% 0.005 265)",
      surfaceBg:"oklch(100% 0 0 / 0.55)",surfaceHov:"oklch(100% 0 0 / 0.68)",
      barBg:"oklch(100% 0 0 / 0.6)",headerBg:"oklch(100% 0 0 / 0.45)",trayBg:"oklch(100% 0 0 / 0.045)",
      border:"oklch(100% 0 0 / 0.4)",borderHov:"oklch(100% 0 0 / 0.55)",
      shadow:"0 2px 16px oklch(0% 0 0/0.07)",shadowHov:"0 6px 24px oklch(0% 0 0/0.11)",
      textPri:"oklch(15% 0 0)",textSec:"oklch(35% 0 0)",textMut:"oklch(50% 0 0)",colLabel:"oklch(100% 0 0)",colSub:"oklch(100% 0 0 / 0.6)",
      aiBg:"oklch(100% 0 0 / 0.35)",aiBorder:"oklch(100% 0 0 / 0.3)",aiLabel:"oklch(42% 0.22 290)",aiText:"oklch(30% 0.16 290)",aiSync:"oklch(48% 0.15 290)",
      src:{gmail:{c:"oklch(48% 0.22 25)",bg:"oklch(100% 0 0 / 0.4)"},slack:{c:"oklch(48% 0.18 310)",bg:"oklch(100% 0 0 / 0.4)"},asana:{c:"oklch(48% 0.22 22)",bg:"oklch(100% 0 0 / 0.4)"}},
      pri:{urgent:{d:"oklch(58% 0.25 28)",bg:"oklch(100% 0 0 / 0.4)",t:"oklch(38% 0.2 28)"},high:{d:"oklch(58% 0.22 50)",bg:"oklch(100% 0 0 / 0.4)",t:"oklch(38% 0.18 50)"},medium:{d:"oklch(52% 0.18 290)",bg:"oklch(100% 0 0 / 0.4)",t:"oklch(35% 0.15 290)"},low:{d:"oklch(55% 0 0)",bg:"oklch(100% 0 0 / 0.3)",t:"oklch(40% 0 0)"},blocked:{d:"oklch(55% 0 0)",bg:"oklch(100% 0 0 / 0.3)",t:"oklch(40% 0 0)"}},
      col:{today:{ac:"oklch(55% 0.22 25)",acBg:"oklch(100% 0 0 / 0.35)",acBd:"oklch(100% 0 0 / 0.3)"},week:{ac:"oklch(50% 0.18 290)",acBg:"oklch(100% 0 0 / 0.3)",acBd:"oklch(100% 0 0 / 0.3)"},fyi:{ac:"oklch(45% 0 0)",acBg:"oklch(100% 0 0 / 0.25)",acBd:"oklch(100% 0 0 / 0.3)"},blocked:{ac:"oklch(45% 0 0)",acBg:"oklch(100% 0 0 / 0.2)",acBd:"oklch(100% 0 0 / 0.3)"}},
      chip:{bg:"oklch(45% 0.18 290 / 0.3)",star:"oklch(45% 0.22 290)",t:"oklch(35% 0.15 290)",stroke:"inset 0 0 0 1px oklch(45% 0.22 290 / 0.25)"},
      tagBg:"oklch(100% 0 0 / 0.35)",tagText:"oklch(30% 0 0)",
      actDone:{c:"oklch(35% 0.18 145)",bg:"oklch(100% 0 0 / 0.35)",hov:"oklch(100% 0 0 / 0.5)"},actMuted:{c:"oklch(30% 0 0)",bg:"oklch(100% 0 0 / 0.25)",hov:"oklch(100% 0 0 / 0.4)"},actDivider:"oklch(0% 0 0 / 0.06)",
      todayPill:{bg:"oklch(65% 0.15 25 / 0.2)",t:"oklch(45% 0.2 25)",dot:"oklch(58% 0.22 25)"},
      filterOn:{bg:"linear-gradient(135deg, oklch(55% 0.2 290 / 0.5), oklch(60% 0.15 250 / 0.5), oklch(90% 0 0 / 0.5))",t:"oklch(100% 0 0)"},filterOff:{bg:"oklch(100% 0 0 / 0.3)",t:"oklch(35% 0 0)"},
      syncBtn:{bg:"oklch(100% 0 0 / 0.3)",t:"oklch(35% 0 0)"},toggleBtn:{bg:"oklch(100% 0 0 / 0.3)",t:"oklch(35% 0 0)"},
      emptyB:"oklch(100% 0 0 / 0.3)",emptyT:"oklch(50% 0 0)",
      donePill:{bg:"oklch(100% 0 0 / 0.45)",t:"oklch(35% 0.18 145)"},
      warnBg:"oklch(100% 0 0 / 0.45)",warnBorder:"oklch(80% 0.1 80 / 0.5)",warnText:"oklch(40% 0.18 80)",
      errBg:"oklch(100% 0 0 / 0.45)",errBorder:"oklch(80% 0.1 25 / 0.5)",errText:"oklch(40% 0.2 25)",
      cardBlur:"blur(40px)",
      cardBorder:"1px solid oklch(100% 0 0 / 0.15)",
      cardShadow:"0 2px 16px oklch(0% 0 0/0.05), inset 0 1px 0 oklch(100% 0 0/0.2)",
      colShadow:"0 4px 24px oklch(0% 0 0/0.04), inset 0 1px 0 oklch(100% 0 0/0.1), inset 0 -1px 0 oklch(0% 0 0/0.02)",
      skeletonBase:"oklch(100% 0 0 / 0.3)",skeletonShine:"oklch(100% 0 0 / 0.5)",
      footerDot:"oklch(0% 0 0 / 0.12)",footerTot:"oklch(40% 0 0)",footerAi:"oklch(45% 0.18 290)",
      tabBar:{ bg:"oklch(100% 0 0 / 0.2)", activeBg:"oklch(100% 0 0 / 0.4)", activeText:"oklch(15% 0 0)", inactiveText:"oklch(0% 0 0 / 0.35)", indicatorFn:(colId)=>({today:"oklch(55% 0.22 25)",week:"oklch(50% 0.18 290)",fyi:"oklch(45% 0 0)",blocked:"oklch(45% 0 0)"})[colId] },
    };

const COL_META = [
  { id:"today",   label:"Do Today",   sub:"AI-prioritized for now" },
  { id:"week",    label:"This Week",  sub:"Needs attention soon"   },
  { id:"fyi",     label:"FYI / Read", sub:"No action required"     },
  { id:"blocked", label:"Blocked",    sub:"Waiting on others"      },
];

// ── PIN Screen ─────────────────────────────────────────────────────────────────
function PinScreen({ onVerified }) {
  const [pin,     setPin]     = useState("");
  const [shake,   setShake]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const CORRECT_PIN = process.env.NEXT_PUBLIC_PIN || "";
  const PIN_LENGTH  = CORRECT_PIN.length || 4;

  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;
    if (pin === CORRECT_PIN) {
      setSuccess(true);
      try { sessionStorage.setItem("pin_verified", "1"); } catch (_) {}
      setTimeout(() => setFadeOut(true), 500);
      setTimeout(() => onVerified(), 900);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setPin(""); }, 550);
    }
  }, [pin, CORRECT_PIN, PIN_LENGTH, onVerified]);

  useEffect(() => {
    const handleKey = (e) => {
      if (success) return;
      if (e.key >= "0" && e.key <= "9" && pin.length < PIN_LENGTH) {
        setPin(p => p + e.key);
      } else if (e.key === "Backspace") {
        setPin(p => p.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pin, PIN_LENGTH, success]);

  const handleNumpad = (digit) => {
    if (success || pin.length >= PIN_LENGTH) return;
    setPin(p => p + digit);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "linear-gradient(135deg, oklch(14% 0.09 285) 0%, oklch(9% 0.06 305) 50%, oklch(6% 0.03 260) 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      opacity: fadeOut ? 0 : 1,
      transition: fadeOut ? "opacity 0.4s ease" : "none",
    }}>
      <style>{`
        @keyframes pinShake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-10px)}
          35%{transform:translateX(10px)}
          55%{transform:translateX(-7px)}
          75%{transform:translateX(7px)}
          90%{transform:translateX(-3px)}
        }
        @keyframes pinSuccess {
          0%{transform:scale(1)}
          40%{transform:scale(1.03)}
          100%{transform:scale(1)}
        }
        @keyframes pinFadeIn {
          from{opacity:0;transform:translateY(18px) scale(0.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes orbFloat {
          0%,100%{transform:translateY(0px)}
          50%{transform:translateY(-18px)}
        }
        .pin-numpad-btn:hover { opacity: 0.75 !important; }
        .pin-numpad-btn:active { transform: scale(0.94) !important; }
      `}</style>

      {/* Floating blur orbs */}
      <div style={{position:"absolute",width:480,height:480,borderRadius:"50%",background:"oklch(45% 0.18 280/0.12)",filter:"blur(90px)",top:"5%",left:"10%",pointerEvents:"none",animation:"orbFloat 7s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:320,height:320,borderRadius:"50%",background:"oklch(50% 0.15 250/0.09)",filter:"blur(70px)",bottom:"15%",right:"15%",pointerEvents:"none",animation:"orbFloat 9s ease-in-out infinite reverse"}}/>
      <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"oklch(55% 0.2 310/0.07)",filter:"blur(50px)",top:"55%",left:"60%",pointerEvents:"none",animation:"orbFloat 6s ease-in-out infinite 1s"}}/>

      {/* Glass card */}
      <div style={{
        background: "oklch(100% 0 0 / 0.05)",
        backdropFilter: "blur(28px) saturate(1.4)",
        WebkitBackdropFilter: "blur(28px) saturate(1.4)",
        border: "1px solid oklch(100% 0 0 / 0.10)",
        borderRadius: 28,
        padding: "52px 60px 44px",
        display: "flex", flexDirection: "column", alignItems: "center",
        boxShadow: "0 40px 100px oklch(0% 0 0/0.45), inset 0 1px 0 oklch(100% 0 0/0.08), inset 0 -1px 0 oklch(0% 0 0/0.1)",
        animation: shake ? "pinShake 0.55s ease" : success ? "pinSuccess 0.5s ease" : "pinFadeIn 0.5s cubic-bezier(0.22,1,0.36,1)",
        minWidth: 340,
      }}>

        {/* Logo */}
        <div style={{
          width:56, height:56, borderRadius:16, marginBottom:22,
          background: "linear-gradient(135deg, oklch(55% 0.22 270), oklch(62% 0.2 295))",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:24, color:"white",
          boxShadow: "0 10px 30px oklch(55% 0.22 270/0.45), inset 0 1px 0 oklch(100% 0 0/0.2)",
        }}>✦</div>

        <div style={{fontSize:22,fontWeight:700,color:"oklch(94% 0 0)",letterSpacing:"-0.3px",marginBottom:6}}>
          Today&rsquo;s Board
        </div>
        <div style={{fontSize:13,color:"oklch(52% 0 0)",marginBottom:38,letterSpacing:"0.1px"}}>
          Enter your PIN to continue
        </div>

        {/* PIN dots */}
        <div style={{display:"flex",gap:16,marginBottom:40}}>
          {Array.from({length: PIN_LENGTH}).map((_, i) => {
            const filled = i < pin.length;
            const isSuccess = success && filled;
            return (
              <div key={i} style={{
                width:15, height:15, borderRadius:"50%",
                background: isSuccess
                  ? "oklch(70% 0.18 145)"
                  : filled
                    ? "oklch(94% 0 0)"
                    : "oklch(100% 0 0/0.15)",
                border: `1.5px solid ${filled ? "transparent" : "oklch(100% 0 0/0.25)"}`,
                boxShadow: isSuccess
                  ? "0 0 12px oklch(70% 0.18 145/0.7)"
                  : filled
                    ? "0 0 10px oklch(94% 0 0/0.5)"
                    : "none",
                transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                transform: filled ? "scale(1.1)" : "scale(1)",
              }}/>
            );
          })}
        </div>

        {/* Numpad */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:10,marginBottom:8}}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => {
            const isEmpty = d === "";
            const isBack  = d === "⌫";
            return (
              <button
                key={i}
                className="pin-numpad-btn"
                onClick={() => isBack ? setPin(p => p.slice(0,-1)) : !isEmpty && handleNumpad(String(d))}
                style={{
                  width:72, height:52, borderRadius:12,
                  background: isEmpty ? "transparent" : "oklch(100% 0 0/0.07)",
                  border: isEmpty ? "none" : "1px solid oklch(100% 0 0/0.09)",
                  color: isBack ? "oklch(55% 0 0)" : "oklch(88% 0 0)",
                  fontSize: isBack ? 18 : 20,
                  fontWeight: 500,
                  cursor: isEmpty ? "default" : "pointer",
                  transition: "all 0.12s ease",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: isEmpty ? "none" : "inset 0 1px 0 oklch(100% 0 0/0.06)",
                  pointerEvents: isEmpty ? "none" : "auto",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div style={{fontSize:11,color:"oklch(34% 0 0)",marginTop:8,letterSpacing:"0.2px"}}>
          or type on your keyboard
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SourceBadge({ source, t }) {
  const s = t.src[source] || t.src.gmail;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:s.bg,color:s.c,fontSize:11,fontWeight:400,padding:"6px 12px",borderRadius:20,letterSpacing:"0.1px",whiteSpace:"nowrap"}}>
      {SRC_ICON[source]?.(s.c)}&nbsp;{source.charAt(0).toUpperCase()+source.slice(1)}
    </span>
  );
}

function PriorityBadge({ priority, t }) {
  const p = t.pri[priority] || t.pri.medium;
  const label = {urgent:"Urgent",high:"High",medium:"Medium",low:"Low",blocked:"Blocked"}[priority] || priority;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:p.bg,color:p.t,fontSize:11,fontWeight:400,padding:"6px 12px",borderRadius:20}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:p.d,display:"inline-block"}}/>
      {label}
    </span>
  );
}

function ActionBtn({ icon, label, btnStyle, hovStyle, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{flex:1,padding:"8px 10px",borderRadius:10,border:"none",fontSize:11,fontWeight:450,cursor:"pointer",transition:"background 0.14s",display:"flex",alignItems:"center",justifyContent:"center",gap:5,...(h?hovStyle:btnStyle)}}>
      {icon}{label}
    </button>
  );
}
const BtnIcons = {
  done: (c="oklch(100% 0 0)") => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  snooze: (c="oklch(100% 0 0)") => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  open: (c="oklch(100% 0 0)") => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

function SkeletonCard({ t }) {
  const line = (w, h=10) => (
    <div style={{width:w,height:h,borderRadius:4,background:t.skeletonBase,marginBottom:6,
      animation:"pulse 1.4s ease-in-out infinite alternate"}}/>
  );
  return (
    <div style={{background:t.surfaceBg,backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",borderRadius:16,padding:"14px 16px 12px",boxShadow:t.shadow}}>
      <style>{`@keyframes pulse{from{opacity:1}to{opacity:0.4}}@keyframes aiStroke{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
      <div style={{display:"flex",gap:6,marginBottom:10}}>{line("60px",22)}{line("50px",22)}</div>
      {line("80%",14)}{line("60%",12)}{line("100%",11)}{line("95%",11)}
      <div style={{height:28,borderRadius:8,background:t.skeletonBase,marginTop:8,animation:"pulse 1.4s ease-in-out infinite alternate"}}/>
    </div>
  );
}

function Card({ item, onDone, onSnooze, t, isMobile }) {
  const [hov, setHov] = useState(false);
  const d = t.actDone, m = t.actMuted;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?t.surfaceHov:t.surfaceBg,backdropFilter:t.cardBlur,WebkitBackdropFilter:t.cardBlur,border:t.cardBorder||"none",boxShadow:t.cardShadow||"none",borderRadius:16,padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:17,transition:"all 0.18s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <SourceBadge source={item.source} t={t}/>
          <PriorityBadge priority={item.priority} t={t}/>
        </div>
        <span style={{fontSize:10,color:t.textMut,whiteSpace:"nowrap"}}>{item.time}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{fontSize:18,fontWeight:400,color:t.textPri,lineHeight:1.25}}>{item.title}</div>
        <div style={{fontSize:10.5,color:t.textMut,fontWeight:500}}>
          <span style={{color:t.textPri}}>{item.from}</span>
          {item.fromRole && <span> · {item.fromRole}</span>}
        </div>
      </div>
      <div style={{fontSize:14,fontWeight:400,color:t.textSec,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.snippet}</div>
      {item.aiReason && (
        <div style={{display:"flex",alignItems:"flex-start",gap:10,background:t.chip.bg,borderRadius:16,padding:"11px 10px",boxShadow:t.chip.stroke||"none"}}>
          <span style={{fontSize:13.8,fontWeight:350,lineHeight:1,letterSpacing:"0.02em",marginTop:1,...(t.chip.starGrad?{backgroundImage:t.chip.starGrad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:t.chip.star})}}>✦</span>
          <span style={{fontSize:11.5,fontWeight:350,letterSpacing:"0.02em",...(t.chip.tGrad?{backgroundImage:t.chip.tGrad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:t.chip.t})}}>{item.aiReason}</span>
        </div>
      )}
      {item.tags?.length>0 && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {item.tags.map(tag=>(
            <span key={tag} style={{background:t.tagBg,color:t.tagText,fontSize:9.5,fontWeight:500,padding:"2px 6px",borderRadius:4}}>{tag}</span>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:5,paddingTop:10,margin:"0 -10px"}}>
        <ActionBtn icon={BtnIcons.done(d.c)} label="Done" btnStyle={{background:d.bg,color:d.c}} hovStyle={{background:d.hov,color:d.c}} onClick={()=>onDone(item.id)}/>
        <ActionBtn icon={BtnIcons.snooze(m.c)} label="Snooze" btnStyle={{background:m.bg,color:m.c}} hovStyle={{background:m.hov,color:m.c}} onClick={()=>onSnooze(item.id)}/>
        <ActionBtn icon={BtnIcons.open(m.c)} label="Open" btnStyle={{background:m.bg,color:m.c}} hovStyle={{background:m.hov,color:m.c}} onClick={()=>item.url && window.open(item.url,"_blank")}/>
      </div>
    </div>
  );
}

function KanbanColumn({ meta, items, loading, onDone, onSnooze, t }) {
  const colItems = items.filter(i=>i.column===meta.id);
  const ac = t.col[meta.id];
  return (
    <div style={{position:"relative",flex:1,minWidth:290,background:t.trayBg,backdropFilter:"blur(60px)",WebkitBackdropFilter:"blur(60px)",border:t.cardBorder||"none",borderRadius:22,padding:6,display:"flex",flexDirection:"column",overflow:"clip",boxShadow:t.colShadow}}>
      {/* Liquid glass diagonal shine */}
      <div style={{position:"absolute",inset:0,borderRadius:22,background:"linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005) 50%, rgba(255,255,255,0.015))",mixBlendMode:"overlay",pointerEvents:"none",zIndex:1}} />
      {/* Liquid glass corner highlights */}
      <div style={{position:"absolute",inset:-2,borderRadius:22,background:"radial-gradient(circle at 15% 15%, rgba(255,255,255,0.035), transparent 50%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.02), transparent 50%)",filter:"blur(1px)",pointerEvents:"none",zIndex:1}} />
      <div style={{marginBottom:6,padding:"6px 8px 0",display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:400,color:t.colLabel,letterSpacing:"0.05em"}}>{meta.label}</div>
          <div style={{fontSize:9.5,color:t.colSub,marginTop:1}}>{meta.sub}</div>
        </div>
        <span style={{background:ac.ac,color:"oklch(100% 0 0)",fontSize:12,fontWeight:400,padding:"2px 9px",borderRadius:20}}>
          {loading ? "…" : colItems.length}
        </span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,padding:"0 6px"}}>
        {loading
          ? [1,2].map(i=><SkeletonCard key={i} t={t}/>)
          : colItems.length>0
            ? colItems.map(item=><Card key={item.id} item={item} onDone={onDone} onSnooze={onSnooze} t={t}/>)
            : (
              <div style={{background:t.surfaceBg,backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",borderRadius:16,padding:"28px 20px",textAlign:"center",boxShadow:t.shadow}}>
                <div style={{fontSize:18,marginBottom:4}}>✓</div>
                <div style={{fontSize:10.5,color:t.emptyT,fontWeight:500}}>All clear</div>
              </div>
            )
        }
      </div>
    </div>
  );
}

// ── Mobile column tabs ─────────────────────────────────────────────────────────
function MobileTabBar({ cols, items, activeCol, setActiveCol, loading, t, swipeProgress=0 }) {
  const tb = t.tabBar;
  const activeIdx = cols.findIndex(c => c.id === activeCol);
  const p = Math.abs(swipeProgress); // 0–1 progress
  const dir = swipeProgress > 0 ? 1 : swipeProgress < 0 ? -1 : 0; // +1=swiping right(next), -1=swiping left(prev)
  const nextIdx = activeIdx + dir;

  return (
    <div style={{display:"flex",alignItems:"center",background:`linear-gradient(to right, ${tb.bg} 30%, transparent 60%)`,backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",borderRadius:24,padding:3,gap:4,overflow:"clip"}}>
      {cols.map((col, i) => {
        const ac = t.col[col.id];
        const count = items.filter(it=>it.column===col.id).length;
        const isActive = i === activeIdx;
        const isNext = i === nextIdx;
        const isBefore = i < activeIdx;

        // Calculate how "active" this tab looks (0=collapsed/inactive, 1=fully active)
        let activity = isActive ? 1 - p : isNext ? p : 0;

        // Tabs before the effective active position show as pills
        const effectiveBeforeCount = isBefore && !(isNext && p > 0.5) ? true : false;
        const showAsPill = (isBefore && !isNext) || (isBefore && isNext && p < 0.5) || (isActive && dir === -1 && p > 0.5);

        if (showAsPill) {
          const pillScale = isNext ? 1 - p * 0.5 : 1;
          return (
            <button key={col.id} onClick={()=>setActiveCol(col.id)} style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              width:24, height:24, borderRadius:"50%", border:"none",
              background:ac.ac, cursor:"pointer", padding:0, flexShrink:0,
              marginLeft: i === 0 ? 10 : 0,
              transform:`scale(${pillScale})`,
              transition: p === 0 ? "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
            }}>
              <span style={{fontSize:11,fontWeight:600,color:"oklch(100% 0 0)",lineHeight:1}}>{loading?"":count}</span>
            </button>
          );
        }

        // Full tab (active or after active)
        const opacity = isActive ? 1 : isNext ? 0.5 + p * 0.5 : 0.5;
        const bg = activity > 0.5 ? tb.activeBg : "transparent";

        return (
          <button key={col.id} onClick={()=>setActiveCol(col.id)} style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            padding:"8px 10px 8px 14px", borderRadius:21, border:"none",
            background: bg,
            color: activity > 0.5 ? tb.activeText : tb.inactiveText,
            fontWeight: 400, opacity,
            fontSize:13, letterSpacing:"0em", cursor:"pointer",
            whiteSpace:"nowrap",
            transition: p === 0 ? "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
            zIndex: isActive ? 1 : 0,
          }}>
            {col.label}
            <span style={{
              background: activity > 0.5 ? ac.ac : "oklch(100% 0 0 / 0.08)",
              color: activity > 0.5 ? "oklch(100% 0 0)" : tb.inactiveText,
              fontSize:11, fontWeight:600,
              padding:"3px 7px", borderRadius:20,
              textAlign:"center",
              transition: p === 0 ? "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
            }}>
              {loading ? "…" : count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Mobile swipe view ────────────────────────────────────────────────────────
function MobileSwipeView({ activeCol, setActiveCol, visible, loading, markDone, snooze, t, onSwipeProgress }) {
  const colIds = COL_META.map(c => c.id);
  const curIdx = colIds.indexOf(activeCol);
  const containerRef = useRef(null);
  const touchRef = useRef({ startX:0, startY:0, startTime:0, locked:null, lastX:0, velocity:0 });
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);

  const onTouchStart = (e) => {
    if (animating) return;
    const touch = e.touches[0];
    touchRef.current = { startX:touch.clientX, startY:touch.clientY, startTime:Date.now(), locked:null, lastX:touch.clientX, velocity:0, lastTime:Date.now() };
  };

  const onTouchMove = (e) => {
    if (animating) return;
    const t = touchRef.current;
    const touch = e.touches[0];
    const dx = touch.clientX - t.startX;
    const dy = touch.clientY - t.startY;

    // Determine scroll direction lock
    if (t.locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      t.locked = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (t.locked !== "h") return;
    e.preventDefault();

    // Track velocity
    const now = Date.now();
    const dt = now - t.lastTime;
    if (dt > 0) t.velocity = (touch.clientX - t.lastX) / dt;
    t.lastX = touch.clientX;
    t.lastTime = now;

    // Rubber band at edges
    const atEdge = (dx > 0 && curIdx === 0) || (dx < 0 && curIdx === colIds.length - 1);
    const actualDx = atEdge ? dx * 0.25 : dx;
    setDragX(actualDx);
    const w = containerRef.current?.offsetWidth || 375;
    onSwipeProgress?.(Math.max(-1, Math.min(1, -actualDx / w)));
  };

  const onTouchEnd = () => {
    if (animating || touchRef.current.locked !== "h") {
      touchRef.current.locked = null;
      return;
    }
    const t = touchRef.current;
    t.locked = null;
    const w = containerRef.current?.offsetWidth || 375;
    const velocity = t.velocity; // px/ms
    const threshold = w * 0.3;

    // Commit if dragged far enough or flicked fast enough
    const shouldCommit = Math.abs(dragX) > threshold || Math.abs(velocity) > 0.4;
    const dir = dragX < 0 ? 1 : -1;
    const nextIdx = curIdx + dir;
    const canCommit = shouldCommit && nextIdx >= 0 && nextIdx < colIds.length;

    setAnimating(true);
    if (canCommit) {
      setActiveCol(colIds[nextIdx]);
    }
    setDragX(0);
    onSwipeProgress?.(0);
    setTimeout(() => setAnimating(false), 350);
  };

  const GAP = 24;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ flex: 1, padding: "6px 0", minHeight: 100, overflow: "clip", touchAction: "pan-y" }}
    >
      <div
        style={{
          display: "flex", gap: GAP,
          transform: `translateX(calc(${-curIdx * 100}% - ${curIdx * GAP}px + ${dragX}px))`,
          transition: animating ? "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
          willChange: "transform",
        }}
      >
        {colIds.map(colId => {
          const meta = COL_META.find(c => c.id === colId);
          const colItems = visible.filter(i => i.column === colId);
          return (
            <div key={colId} style={{ minWidth: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
              {loading
                ? [1, 2, 3].map(i => <SkeletonCard key={i} t={t} />)
                : colItems.length > 0
                  ? colItems.map(item => (
                    <Card key={item.id} item={item} onDone={markDone} onSnooze={snooze} t={t} isMobile />
                  ))
                  : (
                    <div style={{ background: t.surfaceBg, backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderRadius: 16, padding: "40px 20px", textAlign: "center", boxShadow: t.shadow, marginTop: 4 }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>✓</div>
                      <div style={{ fontSize: 12, color: t.emptyT, fontWeight: 500 }}>All clear in {meta?.label}</div>
                    </div>
                  )
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const [pinVerified, setPinVerified] = useState(false);
  const [dark,      setDark]      = useState(true);   // default dark
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [syncedAt,  setSyncedAt]  = useState(null);
  const [sources,   setSources]   = useState({});
  const [filter,    setFilter]    = useState("all");
  const [doneCount, setDoneCount] = useState(0);
  const [usingDemo, setUsingDemo] = useState(false);
  const [activeCol, setActiveCol] = useState("today");
  const [swipeProgress, setSwipeProgress] = useState(0); // -1 to 1, fractional drag between cols
  const [isMobile,  setIsMobile]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const boardRef = useRef(null);

  // Responsive breakpoint detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 680);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Detect horizontal scroll overflow
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const checkScroll = () => {
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 2);
    };
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  });

  // Sync browser frame color, body bg, and color-scheme with dark/light mode
  useEffect(() => {
    const themeColor = dark ? "#19191f" : "#e0e0e0";
    const darkBg = "url(/bg.jpeg) center/cover fixed oklch(18% 0.004 265)";
    const bg = "url(/bg.jpeg) center/cover fixed";
    document.body.style.background = bg;
    document.body.style.margin = "0";
    document.documentElement.style.background = bg;
    document.documentElement.style.margin = "0";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
    meta.content = themeColor;
    let cs = document.querySelector('meta[name="color-scheme"]');
    if (!cs) { cs = document.createElement("meta"); cs.name = "color-scheme"; document.head.appendChild(cs); }
    cs.content = dark ? "dark" : "light";
  }, [dark]);

  // Check sessionStorage on mount (client-only)
  useEffect(() => {
    const correctPin = process.env.NEXT_PUBLIC_PIN;
    if (!correctPin) { setPinVerified(true); return; }
    try {
      if (sessionStorage.getItem("pin_verified") === "1") setPinVerified(true);
    } catch (_) {}
  }, []);

  const t = makeTheme(dark);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const lastFetchRef = useRef(0);
  const fetchItems = useCallback(async (isManualSync=false) => {
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 5 * 60 * 1000) return;
    if (isManualSync) setSyncing(true);
    else setLoading(true);
    lastFetchRef.current = now;

    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.items?.length) {
        setItems(data.items);
        setSyncedAt(data.syncedAt);
        setSources(data.sources || {});
        setUsingDemo(false);
      } else {
        setUsingDemo(true);
      }
    } catch (err) {
      console.warn("[board] API fetch failed:", err.message);
      setUsingDemo(true);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => { if (pinVerified) fetchItems(); }, [pinVerified, fetchItems]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!pinVerified) return;
    const id = setInterval(() => fetchItems(true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [pinVerified, fetchItems]);

  const markDone = (id) => {
    setItems(prev=>prev.filter(i=>i.id!==id));
    setDoneCount(n=>n+1);
  };
  const snooze = (id) => {
    setItems(prev=>prev.map(i=>i.id===id?{...i,column:"week"}:i));
  };

  const visible    = filter==="all" ? items : items.filter(i=>i.source===filter);
  const todayCount = items.filter(i=>i.column==="today").length;
  const total      = items.length;

  const now        = new Date();
  const dayLabel   = now.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});

  const sourceFailed = Object.entries(sources).filter(([,v])=>v?.status==="rejected");
  const FILTERS = [{key:"all",label:"All"},{key:"gmail",label:"Gmail"},{key:"slack",label:"Slack"},{key:"asana",label:"Asana"}];

  return (
    <>
      {/* PIN screen overlays everything until verified */}
      {!pinVerified && <PinScreen onVerified={() => setPinVerified(true)} />}

      <div style={{fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif",background:isMobile?t.pageBg.replace("fixed","scroll"):t.pageBg,backgroundPosition:isMobile?(dark?"85% center":"20% center"):"center",minHeight:"100vh",padding:isMobile?"0 8px":"0 12px",display:"flex",flexDirection:"column",transition:"background 0.25s ease"}}>

        {/* ── Topbar ── */}
        <div style={{position:"sticky",top:6,zIndex:10,margin:"6px 0 6px",background:t.headerBg,backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",border:isMobile?"none":(t.cardBorder||"none"),borderRadius:16,boxShadow:isMobile?"none":t.colShadow}}>
        {/* Liquid glass header overlays (desktop only) */}
        {!isMobile && <>
          <div style={{position:"absolute",inset:0,borderRadius:16,background:"linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005) 50%, rgba(255,255,255,0.015))",mixBlendMode:"overlay",pointerEvents:"none",zIndex:1}} />
          <div style={{position:"absolute",inset:-2,borderRadius:16,background:"radial-gradient(circle at 15% 15%, rgba(255,255,255,0.035), transparent 50%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.02), transparent 50%)",filter:"blur(1px)",pointerEvents:"none",zIndex:1}} />
        </>}
        <div style={{position:"relative",padding:"6px 6px",display:"flex",flexDirection:"column",gap:10,transition:"all 0.25s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {!loading && (
              <div style={{display:"flex",alignItems:"center",gap:6,background:t.todayPill.bg,borderRadius:10,height:36,padding:"0 12px",fontSize:isMobile?12:14.4,fontWeight:400,color:t.todayPill.t,flexShrink:0}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:t.todayPill.dot}}/>
                {todayCount} today
              </div>
            )}

            {/* ── AI Summary (inline, truncated) ── */}
            <div onClick={()=>setAiExpanded(e=>!e)} style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:5,background:t.chip.bg,borderRadius:10,height:36,padding:"0 12px",cursor:"pointer",transition:"all 0.2s ease",overflow:"hidden"}}>
              <span style={{fontSize:11.5,color:t.colLabel,fontWeight:400,lineHeight:1,flexShrink:0,letterSpacing:"0.03em"}}>✦</span>
              <span style={{fontSize:11.5,color:t.colLabel,fontWeight:isMobile?450:350,letterSpacing:"0.03em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0,opacity:0.85}}>
                {loading
                  ? "Fetching and prioritizing your inbox…"
                  : total===0
                    ? "No items found. Everything looks clear!"
                    : `You have ${todayCount} priority items today across ${total} total. Claude scored and sorted everything above.`
                }
              </span>
            </div>

            {/* Source filters — hide on mobile to save space */}
            {!isMobile && (
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                {FILTERS.map(f=>{
                  const on=filter===f.key, s=on?t.filterOn:t.filterOff;
                  return <button key={f.key} onClick={()=>setFilter(f.key)} style={{height:36,padding:"0 13px",borderRadius:10,border:"none",background:s.bg,color:s.t,fontSize:12,fontWeight:on?400:300,cursor:"pointer",transition:"all 0.14s"}}>{f.label}</button>;
                })}
              </div>
            )}

            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button onClick={()=>fetchItems(true)} disabled={syncing} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,width:36,height:36,padding:8,borderRadius:10,border:"none",background:t.tabBar.activeBg,cursor:"pointer",opacity:syncing?0.7:1,transition:"all 0.2s ease"}}>
                {syncing ? <SpinnerIcon c={t.tabBar.activeText}/> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.tabBar.activeText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.19 7.5A9 9 0 1 0 21 12"/><polyline points="21 3 21 8 16 8"/></svg>}
              </button>

              <button onClick={()=>setDark(d=>!d)} title={dark?"Light mode":"Dark mode"} style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,padding:8,borderRadius:10,border:"none",background:t.tabBar.activeBg,cursor:"pointer",transition:"all 0.2s ease"}}>
                {dark?<SunIcon c={t.tabBar.activeText}/>:<MoonIcon c={t.tabBar.activeText}/>}
              </button>
            </div>
          </div>

          {/* ── AI Summary (expanded) ── */}
          {aiExpanded && (
            <div onClick={()=>setAiExpanded(false)} style={{display:"flex",flexDirection:isMobile?"column":"row",alignItems:isMobile?"flex-start":"center",gap:isMobile?4:6,background:t.chip.bg,borderRadius:8,padding:isMobile?"8px 10px":"6px 10px",cursor:"pointer",animation:"pinFadeIn 0.2s ease"}}>
              <span style={{fontSize:11.5,color:t.colLabel,fontWeight:400,lineHeight:1,whiteSpace:"nowrap",letterSpacing:"0.03em"}}>✦ AI Summary</span>
              <span style={{fontSize:11.5,color:t.colLabel,fontWeight:300,letterSpacing:"0.03em",opacity:0.85}}>
                {loading
                  ? "Fetching and prioritizing your inbox…"
                  : total===0
                    ? "No items found. Everything looks clear!"
                    : `You have ${todayCount} priority items today across ${total} total. Claude scored and sorted everything above.`
                }
              </span>
            </div>
          )}

          {/* ── Demo data warning ── */}
          {usingDemo && !loading && (
            <div style={{background:t.warnBg,borderRadius:8,padding:"7px 10px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11.5,color:t.warnText}}>⚠ Showing demo data — add API keys to see live data.</span>
            </div>
          )}

          {/* ── Source error banner ── */}
          {sourceFailed.length > 0 && !loading && !usingDemo && (
            <div style={{background:t.errBg,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11.5,color:t.errText}}>⚠ Could not reach: {sourceFailed.map(([k])=>k).join(", ")}</span>
            </div>
          )}
        </div>
        </div>

        {/* ── Mobile tab track ── */}
        {isMobile && (
          <MobileTabBar
            cols={COL_META}
            items={visible}
            activeCol={activeCol}
            setActiveCol={setActiveCol}
            loading={loading}
            t={t}
            swipeProgress={swipeProgress}
          />
        )}

        {/* ── Board ── */}
        {isMobile ? (
          // Mobile: swipeable single column view
          <MobileSwipeView
            activeCol={activeCol}
            setActiveCol={setActiveCol}
            visible={visible}
            loading={loading}
            markDone={markDone}
            snooze={snooze}
            t={t}
            onSwipeProgress={setSwipeProgress}
          />
        ) : (
          // Desktop: 4-column layout
          <div style={{position:"relative",flex:1}}>
            <div ref={boardRef} style={{display:"flex",gap:6,padding:0,flex:1,overflowX:"auto",alignItems:"flex-start",scrollbarWidth:"none",borderRadius:22}}>
              <style>{`.board-scroll::-webkit-scrollbar{display:none}`}</style>
              {COL_META.map(meta=>(
                <KanbanColumn key={meta.id} meta={meta} items={visible} loading={loading} onDone={markDone} onSnooze={snooze} t={t}/>
              ))}
            </div>
            {canScrollRight && (
              <div style={{position:"absolute",top:0,right:0,bottom:0,width:60,pointerEvents:"none",opacity:0.5,background:`linear-gradient(to right, transparent, ${dark ? "oklch(10% 0.004 265)" : "oklch(88% 0 0 / 0.8)"})`,borderRadius:"0 22px 22px 0",overflow:"hidden"}}/>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{background:t.surfaceBg,backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",borderRadius:"8px 8px 0 0",margin:"0 -6px 0",padding:"8px 20px",display:"flex",alignItems:"center",gap:10,position:isMobile?"static":"sticky",bottom:0,transition:"all 0.25s ease"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {["gmail","slack","asana"].map(src=>{
              const st = sources[src];
              const ok = !st || st.status==="fulfilled";
              return (
                <span key={src} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,opacity:ok?1:0.5}} title={st?.error||undefined}>
                  {SRC_ICON[src](t.src[src].c)}
                  <span style={{fontWeight:400,color:t.src[src].c}}>{src.charAt(0).toUpperCase()+src.slice(1)}</span>
                  {!ok && <span style={{fontSize:9,color:t.errText}}>✕</span>}
                </span>
              );
            })}
          </div>
          <span style={{color:t.footerDot}}>·</span>
          <span style={{fontSize:10,color:t.footerTot}}>{loading?"Loading…":`${total} items`}</span>
          <div style={{flex:1}}/>
          <span style={{fontSize:10,color:t.footerAi,fontWeight:500}}>✦ claude-haiku-4-5</span>
          {doneCount>0 && (
            <span style={{fontSize:11,fontWeight:450,background:t.donePill.bg,color:t.donePill.t,padding:"2px 9px",borderRadius:20}}>
              ✓ {doneCount} done
            </span>
          )}
        </div>
      </div>
    </>
  );
}
