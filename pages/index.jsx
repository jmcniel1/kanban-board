import { useState, useEffect, useCallback } from "react";

// ── Source icons ──────────────────────────────────────────────────────────────
const SRC_ICON = {
  gmail: (c) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke={c} strokeWidth="2"/>
      <path d="M2 7l10 7 10-7" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  slack: (c) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={c}>
      <path d="M14.5 2a2.5 2.5 0 0 0-5 0v5h5V2zm0 15h-5v5a2.5 2.5 0 0 0 5 0v-5zM2 9.5a2.5 2.5 0 0 0 0 5h5v-5H2zm15 0v5h5a2.5 2.5 0 0 0 0-5h-5zM9.5 2A2.5 2.5 0 0 0 7 4.5V9.5h5V4.5A2.5 2.5 0 0 0 9.5 2zm5 10H9.5v5h5v-5z"/>
    </svg>
  ),
  asana: (c) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={c}>
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
      pageBg:"oklch(0% 0 0)",surfaceBg:"oklch(10% 0 0)",surfaceHov:"oklch(14% 0 0)",barBg:"oklch(5.5% 0 0)",
      border:"oklch(18% 0 0)",borderHov:"oklch(26% 0 0)",shadow:"0 1px 2px oklch(0% 0 0/0.7)",shadowHov:"0 6px 24px oklch(0% 0 0/0.8)",
      textPri:"oklch(94% 0 0)",textSec:"oklch(60% 0 0)",textMut:"oklch(40% 0 0)",
      aiBg:"linear-gradient(135deg,oklch(10.5% 0.022 285),oklch(10.5% 0.022 305))",aiBorder:"oklch(20% 0.055 290)",aiLabel:"oklch(72% 0.2 290)",aiText:"oklch(74% 0.12 290)",aiSync:"oklch(60% 0.15 290)",
      src:{gmail:{c:"oklch(72% 0.18 25)",bg:"oklch(13.5% 0.04 25)",b:"oklch(22% 0.07 25)"},slack:{c:"oklch(76% 0.08 312)",bg:"oklch(13% 0.03 312)",b:"oklch(22% 0.05 312)"},asana:{c:"oklch(74% 0.16 22)",bg:"oklch(13.5% 0.04 22)",b:"oklch(22% 0.07 22)"}},
      pri:{urgent:{d:"oklch(64% 0.22 25)",bg:"oklch(13.5% 0.04 25)",t:"oklch(72% 0.2 25)"},high:{d:"oklch(72% 0.2 46)",bg:"oklch(14% 0.05 46)",t:"oklch(76% 0.17 46)"},medium:{d:"oklch(66% 0.16 290)",bg:"oklch(13% 0.04 290)",t:"oklch(70% 0.13 290)"},low:{d:"oklch(42% 0 0)",bg:"oklch(13.5% 0 0)",t:"oklch(50% 0 0)"},blocked:{d:"oklch(36% 0 0)",bg:"oklch(11% 0 0)",t:"oklch(44% 0 0)"}},
      col:{today:{ac:"oklch(64% 0.22 25)",acBg:"oklch(13.5% 0.04 25)",acBd:"oklch(24% 0.09 25/0.8)"},week:{ac:"oklch(66% 0.16 290)",acBg:"oklch(13% 0.04 290)",acBd:"oklch(24% 0.08 290/0.8)"},fyi:{ac:"oklch(48% 0 0)",acBg:"oklch(13.5% 0 0)",acBd:"oklch(26% 0 0/0.8)"},blocked:{ac:"oklch(43% 0 0)",acBg:"oklch(11.5% 0 0)",acBd:"oklch(24% 0 0/0.8)"}},
      chip:{bg:"oklch(13% 0.04 290)",b:"oklch(22% 0.07 290)",star:"oklch(68% 0.22 290)",t:"oklch(70% 0.13 290)"},
      tagBg:"oklch(14.5% 0 0)",tagText:"oklch(46% 0 0)",
      actDone:{c:"oklch(72% 0.16 145)",bg:"oklch(12.5% 0.04 145)",hov:"oklch(18% 0.06 145)"},actMuted:{c:"oklch(50% 0 0)",bg:"oklch(14.5% 0 0)",hov:"oklch(20% 0 0)"},actDivider:"oklch(18% 0 0)",
      todayPill:{bg:"oklch(13.5% 0.04 25)",b:"oklch(26% 0.08 25)",t:"oklch(72% 0.18 25)",dot:"oklch(62% 0.22 25)"},
      filterOn:{bg:"oklch(92% 0 0)",t:"oklch(7% 0 0)"},filterOff:{bg:"transparent",t:"oklch(54% 0 0)",b:"oklch(22% 0 0)"},
      syncBtn:{bg:"oklch(10% 0 0)",t:"oklch(52% 0 0)",b:"oklch(22% 0 0)"},toggleBtn:{bg:"oklch(14% 0 0)",t:"oklch(68% 0 0)",b:"oklch(24% 0 0)"},
      emptyB:"oklch(20% 0 0)",emptyT:"oklch(28% 0 0)",
      donePill:{bg:"oklch(13% 0.05 145)",t:"oklch(70% 0.16 145)"},
      warnBg:"oklch(14% 0.04 45)",warnBorder:"oklch(24% 0.08 45)",warnText:"oklch(72% 0.16 45)",
      errBg:"oklch(13% 0.04 25)",errBorder:"oklch(22% 0.08 25)",errText:"oklch(70% 0.18 25)",
      skeletonBase:"oklch(14% 0 0)",skeletonShine:"oklch(18% 0 0)",
      footerDot:"oklch(24% 0 0)",footerTot:"oklch(36% 0 0)",footerAi:"oklch(60% 0.15 290)",
    }
  : {
      pageBg:"oklch(96.5% 0 0)",surfaceBg:"oklch(100% 0 0)",surfaceHov:"oklch(99% 0 0)",barBg:"oklch(100% 0 0)",
      border:"oklch(92% 0 0)",borderHov:"oklch(86% 0 0)",shadow:"0 1px 3px oklch(0% 0 0/0.05)",shadowHov:"0 4px 16px oklch(0% 0 0/0.09)",
      textPri:"oklch(8% 0 0)",textSec:"oklch(42% 0 0)",textMut:"oklch(67% 0 0)",
      aiBg:"linear-gradient(135deg,oklch(96.5% 0.025 285),oklch(97% 0.025 305))",aiBorder:"oklch(88% 0.07 290)",aiLabel:"oklch(46% 0.22 290)",aiText:"oklch(34% 0.18 290)",aiSync:"oklch(52% 0.15 290)",
      src:{gmail:{c:"oklch(52% 0.22 25)",bg:"oklch(97.5% 0.02 25)",b:"oklch(90% 0.05 25)"},slack:{c:"oklch(24% 0.1 315)",bg:"oklch(97% 0.02 315)",b:"oklch(88% 0.04 315)"},asana:{c:"oklch(58% 0.2 22)",bg:"oklch(97.5% 0.02 22)",b:"oklch(90% 0.05 22)"}},
      pri:{urgent:{d:"oklch(55% 0.22 25)",bg:"oklch(97.5% 0.02 25)",t:"oklch(40% 0.2 25)"},high:{d:"oklch(65% 0.2 46)",bg:"oklch(97.5% 0.03 46)",t:"oklch(50% 0.2 46)"},medium:{d:"oklch(55% 0.18 290)",bg:"oklch(97% 0.02 290)",t:"oklch(42% 0.17 290)"},low:{d:"oklch(62% 0 0)",bg:"oklch(97.5% 0 0)",t:"oklch(40% 0 0)"},blocked:{d:"oklch(60% 0 0)",bg:"oklch(96% 0 0)",t:"oklch(36% 0 0)"}},
      col:{today:{ac:"oklch(55% 0.22 25)",acBg:"oklch(97% 0.02 25)",acBd:"oklch(82% 0.1 25/0.8)"},week:{ac:"oklch(55% 0.18 290)",acBg:"oklch(97% 0.02 290)",acBd:"oklch(82% 0.08 290/0.8)"},fyi:{ac:"oklch(50% 0 0)",acBg:"oklch(96.5% 0 0)",acBd:"oklch(82% 0 0/0.8)"},blocked:{ac:"oklch(54% 0 0)",acBg:"oklch(95.5% 0 0)",acBd:"oklch(80% 0 0/0.8)"}},
      chip:{bg:"oklch(96% 0.03 285)",b:"oklch(88% 0.07 290)",star:"oklch(48% 0.22 290)",t:"oklch(38% 0.18 290)"},
      tagBg:"oklch(95% 0 0)",tagText:"oklch(58% 0 0)",
      actDone:{c:"oklch(45% 0.18 145)",bg:"oklch(97% 0.04 145)",hov:"oklch(93% 0.07 145)"},actMuted:{c:"oklch(46% 0 0)",bg:"oklch(97.5% 0 0)",hov:"oklch(94% 0 0)"},actDivider:"oklch(94% 0 0)",
      todayPill:{bg:"oklch(97% 0.02 25)",b:"oklch(88% 0.07 25)",t:"oklch(40% 0.22 25)",dot:"oklch(55% 0.22 25)"},
      filterOn:{bg:"oklch(8% 0 0)",t:"oklch(98% 0 0)"},filterOff:{bg:"oklch(100% 0 0)",t:"oklch(46% 0 0)",b:"oklch(92% 0 0)"},
      syncBtn:{bg:"oklch(100% 0 0)",t:"oklch(46% 0 0)",b:"oklch(92% 0 0)"},toggleBtn:{bg:"oklch(97% 0 0)",t:"oklch(44% 0 0)",b:"oklch(90% 0 0)"},
      emptyB:"oklch(89% 0 0)",emptyT:"oklch(82% 0 0)",
      donePill:{bg:"oklch(97% 0.04 145)",t:"oklch(42% 0.18 145)"},
      warnBg:"oklch(97% 0.04 80)",warnBorder:"oklch(88% 0.09 80)",warnText:"oklch(45% 0.18 80)",
      errBg:"oklch(97% 0.02 25)",errBorder:"oklch(88% 0.07 25)",errText:"oklch(42% 0.2 25)",
      skeletonBase:"oklch(94% 0 0)",skeletonShine:"oklch(96% 0 0)",
      footerDot:"oklch(88% 0 0)",footerTot:"oklch(60% 0 0)",footerAi:"oklch(52% 0.16 290)",
    };

const COL_META = [
  { id:"today",   label:"Do Today",   sub:"AI-prioritized for now" },
  { id:"week",    label:"This Week",  sub:"Needs attention soon"   },
  { id:"fyi",     label:"FYI / Read", sub:"No action required"     },
  { id:"blocked", label:"Blocked",    sub:"Waiting on others"      },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function SourceBadge({ source, t }) {
  const s = t.src[source] || t.src.gmail;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:s.bg,border:`1px solid ${s.b}`,color:s.c,fontSize:10.5,fontWeight:600,padding:"2px 7px",borderRadius:6,letterSpacing:"0.1px",whiteSpace:"nowrap"}}>
      {SRC_ICON[source]?.(s.c)} {source.charAt(0).toUpperCase()+source.slice(1)}
    </span>
  );
}

function PriorityBadge({ priority, t }) {
  const p = t.pri[priority] || t.pri.medium;
  const label = {urgent:"Urgent",high:"High",medium:"Medium",low:"Low",blocked:"Blocked"}[priority] || priority;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:p.bg,color:p.t,fontSize:10.5,fontWeight:600,padding:"2px 7px",borderRadius:6}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:p.d,flexShrink:0}}/>
      {label}
    </span>
  );
}

function ActionBtn({ label, btnStyle, hovStyle, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{flex:1,padding:"6px 0",borderRadius:7,border:"none",fontSize:11.5,fontWeight:600,cursor:"pointer",transition:"background 0.14s",...(h?hovStyle:btnStyle)}}>
      {label}
    </button>
  );
}

function SkeletonCard({ t }) {
  const line = (w, h=10) => (
    <div style={{width:w,height:h,borderRadius:4,background:t.skeletonBase,marginBottom:6,
      animation:"pulse 1.4s ease-in-out infinite alternate"}}/>
  );
  return (
    <div style={{background:t.surfaceBg,borderRadius:12,padding:"13px 14px 11px",border:`1px solid ${t.border}`}}>
      <style>{`@keyframes pulse{from{opacity:1}to{opacity:0.4}}`}</style>
      <div style={{display:"flex",gap:6,marginBottom:10}}>{line("60px",22)}{line("50px",22)}</div>
      {line("80%",14)}{line("60%",12)}{line("100%",11)}{line("95%",11)}
      <div style={{height:28,borderRadius:7,background:t.skeletonBase,marginTop:8,animation:"pulse 1.4s ease-in-out infinite alternate"}}/>
    </div>
  );
}

function Card({ item, onDone, onSnooze, t }) {
  const [hov, setHov] = useState(false);
  const d = t.actDone, m = t.actMuted;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov?t.surfaceHov:t.surfaceBg,borderRadius:12,padding:"13px 14px 11px",border:`1px solid ${hov?t.borderHov:t.border}`,boxShadow:hov?t.shadowHov:t.shadow,transition:"all 0.17s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:9,flexWrap:"wrap"}}>
        <SourceBadge source={item.source} t={t}/>
        <PriorityBadge priority={item.priority} t={t}/>
        <span style={{marginLeft:"auto",fontSize:11,color:t.textMut,whiteSpace:"nowrap"}}>{item.time}</span>
      </div>
      <div style={{fontSize:13.5,fontWeight:650,color:t.textPri,lineHeight:1.35,marginBottom:4,letterSpacing:"-0.1px"}}>{item.title}</div>
      <div style={{fontSize:11,color:t.textMut,marginBottom:7}}>
        <span style={{fontWeight:600,color:t.textSec}}>{item.from}</span>
        {item.fromRole && <span> · {item.fromRole}</span>}
      </div>
      <div style={{fontSize:12,color:t.textSec,lineHeight:1.55,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.snippet}</div>
      {item.aiReason && (
        <div style={{display:"flex",alignItems:"center",gap:5,background:t.chip.bg,border:`1px solid ${t.chip.b}`,borderRadius:7,padding:"5px 9px",marginBottom:10}}>
          <span style={{fontSize:11,color:t.chip.star,fontWeight:700,lineHeight:1}}>✦</span>
          <span style={{fontSize:11,color:t.chip.t,fontWeight:500}}>{item.aiReason}</span>
        </div>
      )}
      {item.tags?.length>0 && (
        <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
          {item.tags.map(tag=>(
            <span key={tag} style={{background:t.tagBg,color:t.tagText,fontSize:10,fontWeight:500,padding:"2px 6px",borderRadius:4}}>{tag}</span>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:6,borderTop:`1px solid ${t.actDivider}`,paddingTop:10}}>
        <ActionBtn label="✓  Done"   btnStyle={{background:d.bg,color:d.c}} hovStyle={{background:d.hov,color:d.c}} onClick={()=>onDone(item.id)}/>
        <ActionBtn label="⏱  Snooze" btnStyle={{background:m.bg,color:m.c}} hovStyle={{background:m.hov,color:m.c}} onClick={()=>onSnooze(item.id)}/>
        <ActionBtn label="↗  Open"   btnStyle={{background:m.bg,color:m.c}} hovStyle={{background:m.hov,color:m.c}} onClick={()=>item.url && window.open(item.url,"_blank")}/>
      </div>
    </div>
  );
}

function KanbanColumn({ meta, items, loading, onDone, onSnooze, t }) {
  const colItems = items.filter(i=>i.column===meta.id);
  const ac = t.col[meta.id];
  return (
    <div style={{flex:1,minWidth:272,display:"flex",flexDirection:"column"}}>
      <div style={{background:t.surfaceBg,borderRadius:10,border:`1px solid ${t.border}`,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:ac.ac,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:t.textPri,letterSpacing:"-0.1px"}}>{meta.label}</div>
          <div style={{fontSize:10.5,color:t.textMut,marginTop:1}}>{meta.sub}</div>
        </div>
        <span style={{background:ac.acBg,color:ac.ac,border:`1px solid ${ac.acBd}`,fontSize:12,fontWeight:700,padding:"2px 9px",borderRadius:20}}>
          {loading ? "…" : colItems.length}
        </span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {loading
          ? [1,2].map(i=><SkeletonCard key={i} t={t}/>)
          : colItems.length>0
            ? colItems.map(item=><Card key={item.id} item={item} onDone={onDone} onSnooze={onSnooze} t={t}/>)
            : (
              <div style={{background:t.surfaceBg,borderRadius:12,border:`1.5px dashed ${t.emptyB}`,padding:"28px 20px",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:5}}>✓</div>
                <div style={{fontSize:12,color:t.emptyT,fontWeight:500}}>All clear</div>
              </div>
            )
        }
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const [dark,      setDark]      = useState(false);
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [syncedAt,  setSyncedAt]  = useState(null);
  const [sources,   setSources]   = useState({});
  const [filter,    setFilter]    = useState("all");
  const [doneCount, setDoneCount] = useState(0);
  const [usingDemo, setUsingDemo] = useState(false);

  const t = makeTheme(dark);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const fetchItems = useCallback(async (isManualSync=false) => {
    if (isManualSync) setSyncing(true);
    else setLoading(true);

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

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(() => fetchItems(true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchItems]);

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
  const dayLabel   = now.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric",year:"numeric"});

  const sourceFailed = Object.entries(sources).filter(([,v])=>v?.status==="rejected");
  const FILTERS = [{key:"all",label:"All"},{key:"gmail",label:"Gmail"},{key:"slack",label:"Slack"},{key:"asana",label:"Asana"}];

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif",background:t.pageBg,minHeight:"100vh",display:"flex",flexDirection:"column",transition:"background 0.25s ease"}}>

      {/* ── Topbar ── */}
      <div style={{background:t.barBg,borderBottom:`1px solid ${t.border}`,padding:"13px 22px",display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:10,boxShadow:dark?"none":"0 1px 4px oklch(0% 0 0/0.04)",transition:"background 0.25s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:"linear-gradient(135deg,oklch(55% 0.22 270),oklch(60% 0.2 295))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"white"}}>✦</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:t.textPri,letterSpacing:"-0.2px"}}>Today's Board</div>
            <div style={{fontSize:11,color:t.textMut}}>{dayLabel}</div>
          </div>
        </div>

        {!loading && (
          <div style={{display:"flex",alignItems:"center",gap:5,background:t.todayPill.bg,border:`1px solid ${t.todayPill.b}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:t.todayPill.t}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:t.todayPill.dot}}/>
            {todayCount} to handle today
          </div>
        )}

        <div style={{flex:1}}/>

        <div style={{display:"flex",gap:5}}>
          {FILTERS.map(f=>{
            const on=filter===f.key, s=on?t.filterOn:t.filterOff;
            return <button key={f.key} onClick={()=>setFilter(f.key)} style={{padding:"5px 14px",borderRadius:20,border:on?"none":`1px solid ${s.b}`,background:s.bg,color:s.t,fontSize:12.5,fontWeight:on?600:500,cursor:"pointer",transition:"all 0.14s"}}>{f.label}</button>;
          })}
        </div>

        <button onClick={()=>fetchItems(true)} disabled={syncing} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:8,border:`1px solid ${t.syncBtn.b}`,background:t.syncBtn.bg,color:t.syncBtn.t,fontSize:12,fontWeight:600,cursor:"pointer",opacity:syncing?0.7:1}}>
          {syncing ? <SpinnerIcon c={t.syncBtn.t}/> : "⟳"} Sync
        </button>

        <button onClick={()=>setDark(d=>!d)} title={dark?"Light mode":"Dark mode"} style={{display:"flex",alignItems:"center",justifyContent:"center",width:34,height:34,borderRadius:8,border:`1px solid ${t.toggleBtn.b}`,background:t.toggleBtn.bg,cursor:"pointer",transition:"all 0.2s ease"}}>
          {dark?<SunIcon c={t.toggleBtn.t}/>:<MoonIcon c={t.toggleBtn.t}/>}
        </button>
      </div>

      {/* ── Demo data warning ── */}
      {usingDemo && !loading && (
        <div style={{background:t.warnBg,borderBottom:`1px solid ${t.warnBorder}`,padding:"8px 22px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12.5,color:t.warnText}}>⚠ Showing demo data — add your API keys in <code style={{fontFamily:"monospace",background:"oklch(0% 0 0/0.05)",padding:"1px 4px",borderRadius:3}}>.env.local</code> to see live data. See <strong>SETUP.md</strong> for instructions.</span>
        </div>
      )}

      {/* ── Source error banner ── */}
      {sourceFailed.length > 0 && !loading && !usingDemo && (
        <div style={{background:t.errBg,borderBottom:`1px solid ${t.errBorder}`,padding:"7px 22px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:t.errText}}>⚠ Could not reach: {sourceFailed.map(([k])=>k).join(", ")} — check API keys or logs.</span>
        </div>
      )}

      {/* ── AI Summary bar ── */}
      <div style={{background:t.aiBg,borderBottom:`1px solid ${t.aiBorder}`,padding:"9px 22px",display:"flex",alignItems:"center",gap:10,transition:"background 0.25s ease"}}>
        <span style={{fontSize:12.5,fontWeight:700,color:t.aiLabel,whiteSpace:"nowrap"}}>✦ AI Summary</span>
        <span style={{fontSize:12.5,color:t.aiText}}>
          {loading
            ? "Fetching and prioritizing your inbox, messages, and tasks…"
            : total===0
              ? "No items found. Everything looks clear!"
              : `You have ${todayCount} priority items today across ${total} total. Claude scored and sorted everything above.`
          }
        </span>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:t.aiSync,fontWeight:500,whiteSpace:"nowrap"}}>
          {syncedAt
            ? `Synced ${new Date(syncedAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`
            : loading ? "Syncing…" : "Not yet synced"
          }
        </span>
      </div>

      {/* ── Board ── */}
      <div style={{display:"flex",gap:13,padding:"17px 22px",flex:1,overflowX:"auto",alignItems:"flex-start"}}>
        {COL_META.map(meta=>(
          <KanbanColumn key={meta.id} meta={meta} items={visible} loading={loading} onDone={markDone} onSnooze={snooze} t={t}/>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{background:t.barBg,borderTop:`1px solid ${t.border}`,padding:"9px 22px",display:"flex",alignItems:"center",gap:12,transition:"background 0.25s ease"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {["gmail","slack","asana"].map(src=>{
            const st = sources[src];
            const ok = !st || st.status==="fulfilled";
            return (
              <span key={src} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,opacity:ok?1:0.5}} title={st?.error||undefined}>
                {SRC_ICON[src](t.src[src].c)}
                <span style={{fontWeight:600,color:t.src[src].c}}>{src.charAt(0).toUpperCase()+src.slice(1)}</span>
                {!ok && <span style={{fontSize:9,color:t.errText}}>✕</span>}
              </span>
            );
          })}
        </div>
        <span style={{color:t.footerDot}}>·</span>
        <span style={{fontSize:11,color:t.footerTot}}>{loading?"Loading…":`${total} items`}</span>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:t.footerAi,fontWeight:500}}>✦ claude-haiku-4-5</span>
        {doneCount>0 && (
          <span style={{fontSize:11.5,fontWeight:600,background:t.donePill.bg,color:t.donePill.t,padding:"3px 10px",borderRadius:20}}>
            ✓ {doneCount} completed today
          </span>
        )}
      </div>
    </div>
  );
}
