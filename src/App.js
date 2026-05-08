import React, { useState, useEffect } from "react";

// ── SUPABASE CONFIG ────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://lndcfpyknxsjgqwhvqgo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZGNmcHlrbnhzamdxd2h2cWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzg0MDUsImV4cCI6MjA5MzgxNDQwNX0.i-JBBrwMyONy1QAWhM9plGDnk9i6FYe6O-zHfjq2-YI";

// ── SUPABASE API HELPER ────────────────────────────────────────────────────────
const db = {
  async get(table, filters = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    Object.entries(filters).forEach(([k, v]) => { url += `&${k}=eq.${v}`; });
    url += "&order=id.asc";
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },
};

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const ROLES   = { SUPER:"Superuser", HEAD:"Sales Head", COORD:"Sales Coordinator", REP:"Sales Rep" };
const STAGES  = ["New Lead","Contacted","Site Visit","Quotation Sent","Negotiation","Won","Lost"];
const SOURCES = ["Walk-in","WhatsApp","Phone","Email","Architect Referral","Builder Referral","Social Media","Website","Exhibition"];
const CATS    = ["CP Fittings","Sanitaryware","Shower","Pipes & Fittings","Kitchen","Accessories","Bath","Tiles","Other"];
const UNITS   = ["Nos","Set","Mtr","Rmt","Sqft","Box","Lot","Kg"];

const STAGE_COLOR = {
  "New Lead":       {bg:"#EEF2FF",color:"#3730A3"},
  "Contacted":      {bg:"#FFF7ED",color:"#C2410C"},
  "Site Visit":     {bg:"#F0F9FF",color:"#0369A1"},
  "Quotation Sent": {bg:"#FEFCE8",color:"#854D0E"},
  "Negotiation":    {bg:"#FDF4FF",color:"#7E22CE"},
  "Won":            {bg:"#F0FDF4",color:"#166534"},
  "Lost":           {bg:"#FEF2F2",color:"#B91C1C"},
};
const STATUS_COLOR = {
  "Draft":        {bg:"#F3F4F6",color:"#374151"},
  "Sent":         {bg:"#DBEAFE",color:"#1D4ED8"},
  "Under Review": {bg:"#FEF9C3",color:"#92400E"},
  "Accepted":     {bg:"#DCFCE7",color:"#166534"},
  "Rejected":     {bg:"#FEE2E2",color:"#B91C1C"},
};

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmt      = n => "₹" + Number(n||0).toLocaleString("en-IN");
const fmtL     = n => n >= 100000 ? "₹"+(n/100000).toFixed(1)+"L" : fmt(n);
const todayStr = () => new Date().toISOString().split("T")[0];
const initials = n => (n||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

function amtWords(n) {
  const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const w=n=>{
    if(!n)return"";
    if(n<20)return a[n];
    if(n<100)return b[Math.floor(n/10)]+(n%10?" "+a[n%10]:"");
    if(n<1000)return a[Math.floor(n/100)]+" Hundred"+(n%100?" "+w(n%100):"");
    if(n<100000)return w(Math.floor(n/1000))+" Thousand"+(n%1000?" "+w(n%1000):"");
    if(n<10000000)return w(Math.floor(n/100000))+" Lakh"+(n%100000?" "+w(n%100000):"");
    return w(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+w(n%10000000):"");
  };
  return n===0?"Zero":w(Math.round(n));
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const S = {
  app:     {display:"flex",flexDirection:"column",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",background:"#F2EFE9",color:"#1C1C1C"},
  topbar:  {background:"#0C2537",display:"flex",alignItems:"center",padding:"0 20px",height:58,gap:14,boxShadow:"0 3px 12px rgba(0,0,0,.35)",position:"sticky",top:0,zIndex:100,flexShrink:0},
  tbName:  {fontFamily:"Georgia,serif",color:"#D9A24E",fontSize:19,fontWeight:700},
  tbSub:   {fontSize:10,color:"rgba(255,255,255,.38)",letterSpacing:"1.8px",textTransform:"uppercase",marginTop:1},
  tbRight: {marginLeft:"auto",display:"flex",alignItems:"center",gap:10},
  roleBadge:{background:"rgba(192,138,53,.18)",border:"1px solid rgba(192,138,53,.35)",color:"#EDB96A",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:500},
  avatar:  (size=30)=>({width:size,height:size,borderRadius:"50%",background:"#206080",border:"2px solid #C08A35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size>28?12:10,fontWeight:700,color:"#fff",flexShrink:0}),
  lgtBtn:  {background:"none",border:"1px solid rgba(255,255,255,.18)",color:"rgba(255,255,255,.55)",padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer"},
  tabBar:  {background:"#0C2537",display:"flex",padding:"0 20px",borderBottom:"2px solid rgba(192,138,53,.25)",overflowX:"auto"},
  tab:     (on)=>({padding:"11px 18px",fontSize:13,fontWeight:500,color:on?"#EDB96A":"rgba(255,255,255,.45)",border:"none",background:"none",borderBottom:`3px solid ${on?"#C08A35":"transparent"}`,marginBottom:-2,cursor:"pointer",whiteSpace:"nowrap"}),
  main:    {padding:"22px 20px",maxWidth:1400,margin:"0 auto",width:"100%"},
  card:    {background:"#fff",borderRadius:16,boxShadow:"0 2px 14px rgba(12,37,55,.10)",border:"1px solid #E4DDD3",overflow:"hidden",marginBottom:16},
  ch:      {padding:"13px 18px",borderBottom:"1px solid #EDE8E0",display:"flex",alignItems:"center",justifyContent:"space-between"},
  chTitle: {fontFamily:"Georgia,serif",fontSize:15,color:"#0C2537",fontWeight:600},
  cb:      {padding:18},
  sc:      (accent="#C08A35")=>({background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 14px rgba(12,37,55,.10)",border:"1px solid #E4DDD3",borderTop:`3px solid ${accent}`,flex:1,minWidth:130}),
  btn:     (v="primary")=>{
    const vs={primary:{background:"#C08A35",color:"#fff",border:"none"},navy:{background:"#0C2537",color:"#fff",border:"none"},outline:{background:"transparent",color:"#484848",border:"1px solid #CCC5B8"},danger:{background:"#FEF2F2",color:"#B91C1C",border:"1px solid #FECACA"},green:{background:"#F0FDF4",color:"#166534",border:"1px solid #86EFAC"},blue:{background:"#EFF6FF",color:"#1D4ED8",border:"1px solid #93C5FD"}};
    return{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",...(vs[v]||vs.primary)};
  },
  field:   {display:"flex",flexDirection:"column",gap:4},
  flabel:  {fontSize:11,fontWeight:600,color:"#484848",textTransform:"uppercase",letterSpacing:".5px"},
  finput:  {padding:"9px 11px",border:"1px solid #D8D1C7",borderRadius:8,fontSize:13,color:"#1C1C1C",outline:"none",background:"#fff",width:"100%",boxSizing:"border-box"},
  th:      {padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"#828282",textTransform:"uppercase",letterSpacing:".8px",background:"#F7F4EF",borderBottom:"1px solid #EDE8E0"},
  td:      {padding:"10px 12px",fontSize:13,color:"#484848",borderBottom:"1px solid #EDE8E0"},
  modal:   {position:"fixed",inset:0,background:"rgba(0,0,0,.58)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:500,padding:"20px 16px",overflowY:"auto"},
  mdBox:   (w=680)=>({background:"#fff",borderRadius:16,width:"100%",maxWidth:w,boxShadow:"0 8px 36px rgba(12,37,55,.2)",margin:"auto"}),
  mhead:   {padding:"16px 20px",borderBottom:"1px solid #EDE8E0",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:2},
  mfoot:   {padding:"13px 20px",borderTop:"1px solid #EDE8E0",display:"flex",justifyContent:"flex-end",gap:8,position:"sticky",bottom:0,background:"#fff"},
  mbody:   {padding:20},
  grid2:   {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  grid3:   {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},
  pill:    (bg="#E3F2FD",col="#1565C0")=>({display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:bg,color:col}),
  tag:     (bg="#F3F4F6",col="#374151")=>({display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:11,fontWeight:700,background:bg,color:col}),
  row:     {display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18},
};

// ── SMALL COMPONENTS ───────────────────────────────────────────────────────────
const Btn = ({v="primary",sm,xs,onClick,children,style={}}) => (
  <button onClick={onClick} style={{...S.btn(v),fontSize:xs?11:sm?12:13,padding:xs?"3px 8px":sm?"5px 11px":"7px 14px",...style}}>{children}</button>
);
const Field = ({label,children,full,style={}}) => (
  <div style={{...S.field,gridColumn:full?"1/-1":"auto",...style}}>
    <label style={S.flabel}>{label}</label>
    {children}
  </div>
);
const Inp = ({value,onChange,placeholder,type="text",disabled,style={}}) => (
  <input value={value??""} onChange={onChange} placeholder={placeholder} type={type} disabled={disabled} style={{...S.finput,...style}} />
);
const Sel = ({value,onChange,children,style={}}) => (
  <select value={value??""} onChange={onChange} style={{...S.finput,...style}}>{children}</select>
);
const Avatar = ({name,size=30}) => <div style={S.avatar(size)}>{initials(name)}</div>;
const StageBadge = ({stage}) => { const c=STAGE_COLOR[stage]||{bg:"#f3f4f6",color:"#374151"}; return <span style={{...S.pill(c.bg,c.color),whiteSpace:"nowrap"}}>{stage}</span>; };
const StatusBadge = ({status}) => { const c=STATUS_COLOR[status]||{bg:"#f3f4f6",color:"#374151"}; return <span style={S.tag(c.bg,c.color)}>{status}</span>; };
const Spinner = () => <div style={{textAlign:"center",padding:40,color:"#828282",fontSize:13}}>Loading...</div>;
const Err = ({msg}) => <div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#B91C1C",padding:"10px 14px",borderRadius:8,fontSize:13,margin:"8px 0"}}>{msg}</div>;

// ── DATA TABLE ─────────────────────────────────────────────────────────────────
const DataTable = ({cols,rows,empty="No data found"}) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>{cols.map((c,i)=><th key={i} style={{...S.th,textAlign:c.right?"right":"left"}}>{c.label}</th>)}</tr></thead>
      <tbody>
        {rows.length===0
          ? <tr><td colSpan={cols.length} style={{padding:32,textAlign:"center",color:"#828282",fontSize:13}}>{empty}</td></tr>
          : rows.map((r,i)=><tr key={i} style={{background:i%2===0?"#fff":"#FAFAF8"}}>{cols.map((c,j)=><td key={j} style={{...S.td,textAlign:c.right?"right":"left",fontWeight:c.bold?700:400}}>{r[c.key]}</td>)}</tr>)
        }
      </tbody>
    </table>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,    setUser]    = useState(null);
  const [tab,     setTab]     = useState("crm");
  const [leads,   setLeads]   = useState([]);
  const [quotes,  setQuotes]  = useState([]);
  const [prods,   setProds]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  // modals
  const [leadM,  setLeadM]  = useState(null);
  const [quoteM, setQuoteM] = useState(null);
  const [invM,   setInvM]   = useState(null);
  const [prodM,  setProdM]  = useState(null);
  const [actM,   setActM]   = useState(null);
  const [bulkM,  setBulkM]  = useState(false);
  const [bulkPM, setBulkPM] = useState(false);

  // load all data once logged in
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      db.get("leads"),
      db.get("quotes"),
      db.get("products"),
      db.get("app_users"),
    ]).then(([l,q,p,u]) => {
      setLeads(l||[]);
      setQuotes(q||[]);
      setProds(p||[]);
      setUsers(u||[]);
    }).catch(e => alert("Error loading data: "+e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Login onLogin={setUser} />;

  const isSU   = user.role === ROLES.SUPER;
  const isHead = [ROLES.SUPER, ROLES.HEAD].includes(user.role);
  const isMgr  = user.role !== ROLES.REP;
  const uName  = id => users.find(u=>u.id===id)?.name || users.find(u=>u.name===id)?.name || id || "—";
  const myLeads = isMgr ? leads : leads.filter(l => l.assigned_to === user.name);

  const TABS = [
    {k:"crm",      l:"CRM — Leads"},
    {k:"dash",     l:"Dashboard"},
    {k:"quotes",   l:"Quotations"},
    {k:"products", l:"Product Master"},
    {k:"reports",  l:"Reports"},
    ...(isSU?[{k:"users",l:"Users"}]:[]),
  ];

  // CRUD helpers that update DB + local state
  const addLead    = async d => { const [r]=await db.insert("leads",d);    setLeads(ls=>[...ls,r]); };
  const updLead    = async (id,d) => { const [r]=await db.update("leads",id,d);   setLeads(ls=>ls.map(l=>l.id===id?r:l)); };
  const addQuote   = async d => { const [r]=await db.insert("quotes",d);   setQuotes(qs=>[...qs,r]); };
  const updQuote   = async (id,d) => { const [r]=await db.update("quotes",id,d);  setQuotes(qs=>qs.map(q=>q.id===id?r:q)); };
  const addProd    = async d => { const [r]=await db.insert("products",d); setProds(ps=>[...ps,r]); };
  const updProd    = async (id,d) => { const [r]=await db.update("products",id,d); setProds(ps=>ps.map(p=>p.id===id?r:p)); };
  const delProd    = async id => { await db.delete("products",id); setProds(ps=>ps.filter(p=>p.id!==id)); };
  const addUser    = async d => { const [r]=await db.insert("app_users",d);setUsers(us=>[...us,r]); };
  const updUser    = async (id,d) => { const [r]=await db.update("app_users",id,d); setUsers(us=>us.map(u=>u.id===id?r:u)); };

  return (
    <div style={S.app}>
      {/* TOPBAR */}
      <div style={S.topbar}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:6,background:"linear-gradient(135deg,#C08A35,#1A4D69)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif"}}>B</div>
          <div><div style={S.tbName}>Kurikkal Beyoncé</div><div style={S.tbSub}>Sales CRM · Beyond The Concepts</div></div>
        </div>
        <div style={S.tbRight}>
          <span style={S.roleBadge}>{user.role}</span>
          <div style={{display:"flex",alignItems:"center",gap:7,color:"rgba(255,255,255,.82)",fontSize:13}}><Avatar name={user.name} size={30}/>{user.name}</div>
          <button onClick={()=>setUser(null)} style={S.lgtBtn}>Sign out</button>
        </div>
      </div>

      {/* TABS */}
      <div style={S.tabBar}>
        {TABS.map(t=><button key={t.k} style={S.tab(tab===t.k)} onClick={()=>setTab(t.k)}>{t.l}</button>)}
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {loading && <Spinner />}
        {!loading && tab==="crm"      && <CRMTab leads={myLeads} quotes={quotes} user={user} isMgr={isMgr} users={users} uName={uName} onNew={()=>setLeadM("new")} onEdit={setLeadM} onQuote={l=>setQuoteM({lead:l})} onBulk={()=>setBulkM(true)} onActivity={setActM} />}
        {!loading && tab==="dash"     && <Dashboard leads={leads} quotes={quotes} uName={uName} />}
        {!loading && tab==="quotes"   && <QuotesTab quotes={quotes} leads={leads} prods={prods} user={user} isMgr={isMgr} uName={uName} onInv={setInvM} onNew={()=>setQuoteM({lead:{}})} onEdit={q=>setQuoteM({lead:leads.find(l=>l.id===q.lead_id)||{},existing:q})} />}
        {!loading && tab==="products" && <ProductsTab prods={prods} isMgr={isMgr} isSU={isSU} onAdd={()=>setProdM("new")} onEdit={setProdM} onDel={delProd} onBulk={()=>setBulkPM(true)} />}
        {!loading && tab==="reports"  && <Reports leads={leads} quotes={quotes} uName={uName} />}
        {!loading && tab==="users"    && <UsersTab users={users} onAdd={addUser} onUpd={updUser} />}
      </div>

      {/* MODALS */}
      {leadM  && <LeadModal mode={leadM} user={user} isMgr={isMgr} users={users} onSave={leadM==="new"?addLead:(d=>updLead(leadM.id,d))} onClose={()=>setLeadM(null)} onQuote={l=>{setLeadM(null);setQuoteM({lead:l});}} />}
      {quoteM && <QuoteModal lead={quoteM.lead} existing={quoteM.existing} prods={prods} user={user} onSave={quoteM.existing?(d=>updQuote(quoteM.existing.id,d)):addQuote} onClose={()=>setQuoteM(null)} onInv={q=>{setQuoteM(null);setInvM(q);}} />}
      {invM   && <InvoiceModal quote={invM} onClose={()=>setInvM(null)} />}
      {prodM  && <ProdModal mode={prodM} onSave={prodM==="new"?addProd:(d=>updProd(prodM.id,d))} onClose={()=>setProdM(null)} />}
      {actM   && <ActivityModal lead={actM} user={user} onSave={d=>updLead(actM.id,d)} onClose={()=>setActM(null)} />}
      {bulkM  && <BulkLeadsModal user={user} users={users} onSave={addLead} onClose={()=>setBulkM(false)} />}
      {bulkPM && <BulkProductsModal onSave={addProd} onClose={()=>setBulkPM(false)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw,    setPw]    = useState("");
  const [err,   setErr]   = useState("");
  const [loading,setLd]   = useState(false);

  const go = async () => {
    setErr(""); setLd(true);
    try {
      const users = await db.get("app_users");
      const u = users.find(u => u.email===email && u.password===pw && u.active);
      if (u) onLogin(u); else setErr("Invalid email or password. Please try again.");
    } catch(e) { setErr("Connection error: "+e.message); }
    finally { setLd(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0C2537 60%,#1A4D69)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:16,width:400,maxWidth:"100%",boxShadow:"0 8px 36px rgba(0,0,0,.25)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(140deg,#0C2537,#1A4D69)",padding:"28px 28px 22px",textAlign:"center"}}>
          <div style={{width:64,height:64,borderRadius:12,background:"linear-gradient(135deg,#C08A35,#EDB96A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif",margin:"0 auto 14px"}}>B</div>
          <div style={{fontFamily:"Georgia,serif",color:"#fff",fontSize:22,fontWeight:700}}>Kurikkal Beyoncé</div>
          <div style={{color:"#EDB96A",fontSize:10,letterSpacing:"2.5px",textTransform:"uppercase",marginTop:2}}>Sales CRM Platform</div>
        </div>
        <div style={{padding:"22px 26px 26px"}}>
          <h3 style={{fontSize:15,color:"#0C2537",marginBottom:16,fontFamily:"Georgia,serif"}}>Sign in to continue</h3>
          {err && <Err msg={err} />}
          <div style={{...S.field,marginBottom:12}}>
            <label style={S.flabel}>Email</label>
            <Inp value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@beyonce.in" />
          </div>
          <div style={{...S.field,marginBottom:18}}>
            <label style={S.flabel}>Password</label>
            <Inp type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" />
          </div>
          <button onClick={go} disabled={loading} style={{...S.btn("primary"),width:"100%",justifyContent:"center",padding:"10px 0",fontSize:14,opacity:loading?.7:1}}>
            {loading?"Signing in...":"Sign In →"}
          </button>
          <div style={{marginTop:12,fontSize:11,color:"#aaa",textAlign:"center"}}>
            Default: admin@beyonce.in / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CRM TAB
// ══════════════════════════════════════════════════════════════════════════════
function CRMTab({ leads, quotes, user, isMgr, users, uName, onNew, onEdit, onQuote, onBulk, onActivity }) {
  const [q,   setQ]   = useState("");
  const [stg, setStg] = useState("");
  const [src, setSrc] = useState("");

  const filtered = leads.filter(l => {
    const s=q.toLowerCase();
    return (!q||l.name?.toLowerCase().includes(s)||(l.company||"").toLowerCase().includes(s)||l.city?.toLowerCase().includes(s))
      && (!stg||l.stage===stg) && (!src||l.source===src);
  });

  const accentOf = s => s==="Won"?"#166534":s==="Lost"?"#B91C1C":s==="Negotiation"?"#7E22CE":"#0C2537";

  return (
    <div>
      <div style={S.row}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>CRM — Lead Pipeline</h1>
          <p style={{fontSize:13,color:"#828282"}}>All leads synced live from database · {leads.length} total</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {isMgr && <Btn v="outline" sm onClick={onBulk}>↑ Bulk Upload Leads</Btn>}
          <Btn onClick={onNew}>+ New Lead</Btn>
        </div>
      </div>

      {/* Stage pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {STAGES.map(s=>{
          const cnt=leads.filter(l=>l.stage===s).length;
          const on=stg===s;
          return <div key={s} onClick={()=>setStg(on?"":s)} style={{padding:"8px 14px",borderRadius:10,cursor:"pointer",background:on?accentOf(s):"#fff",color:on?"#fff":accentOf(s),border:`2px solid ${accentOf(s)}`,fontSize:12,fontWeight:600,userSelect:"none"}}>
            {s} <span style={{fontSize:15,fontWeight:700,marginLeft:4}}>{cnt}</span>
          </div>;
        })}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",background:"#fff",border:"1px solid #D8D1C7",borderRadius:8,padding:"0 11px",gap:7}}>
          <span style={{color:"#aaa"}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, company, city..." style={{border:"none",outline:"none",fontSize:13,padding:"8px 0",width:"100%"}} />
        </div>
        <Sel value={stg} onChange={e=>setStg(e.target.value)} style={{width:160}}>
          <option value="">All Stages</option>{STAGES.map(s=><option key={s}>{s}</option>)}
        </Sel>
        <Sel value={src} onChange={e=>setSrc(e.target.value)} style={{width:170}}>
          <option value="">All Sources</option>{SOURCES.map(s=><option key={s}>{s}</option>)}
        </Sel>
      </div>

      <div style={S.card}>
        <div style={{...S.ch}}>
          <span style={S.chTitle}>Leads <span style={{background:"#C08A35",color:"#fff",borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:700,marginLeft:4}}>{filtered.length}</span></span>
          <span style={{fontSize:12,color:"#828282"}}>Pipeline: <strong style={{color:"#0C2537"}}>{fmtL(filtered.reduce((s,l)=>s+(l.value||0),0))}</strong></span>
        </div>
        <DataTable
          cols={[
            {key:"_id",label:"ID"},{key:"_name",label:"Client"},{key:"_proj",label:"Project"},
            {key:"_src",label:"Source"},{key:"_stg",label:"Stage"},{key:"_val",label:"Value",right:true,bold:true},
            {key:"_asgn",label:"Assigned"},{key:"_date",label:"Date"},{key:"_act",label:"Actions"},
          ]}
          rows={filtered.map(l=>({
            _id:   <span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>#{l.id}</span>,
            _name: <div><div style={{fontWeight:600,color:"#1C1C1C"}}>{l.name}</div>{l.company&&<div style={{fontSize:11,color:"#828282"}}>{l.company}</div>}<div style={{fontSize:11,color:"#828282"}}>📍 {l.city}</div></div>,
            _proj: <div style={{fontSize:12,maxWidth:150}}>{l.project}</div>,
            _src:  <span style={S.pill("#E3F2FD","#1565C0")}>{l.source}</span>,
            _stg:  <StageBadge stage={l.stage}/>,
            _val:  <span style={{color:"#0C2537"}}>{fmtL(l.value||0)}</span>,
            _asgn: <div style={{display:"flex",alignItems:"center",gap:5}}><Avatar name={l.assigned_to||"?"} size={22}/><span style={{fontSize:11}}>{(l.assigned_to||"").split(" ")[0]}</span></div>,
            _date: <span style={{fontSize:11,color:"#828282"}}>{(l.created_at||"").split("T")[0]}</span>,
            _act:  <div style={{display:"flex",gap:4}}>
                     <Btn v="outline" xs onClick={()=>onEdit(l)}>Edit</Btn>
                     <Btn v="navy" xs onClick={()=>onQuote(l)}>+ Quote</Btn>
                     <Btn v="outline" xs onClick={()=>onActivity(l)}>📋</Btn>
                   </div>,
          }))}
          empty="No leads found. Add your first lead!"
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEAD MODAL
// ══════════════════════════════════════════════════════════════════════════════
function LeadModal({ mode, user, isMgr, users, onSave, onClose, onQuote }) {
  const isEdit = mode !== "new";
  const [f, setF] = useState(isEdit ? {...mode} : {name:"",company:"",phone:"",email:"",source:"Walk-in",stage:"New Lead",assigned_to:user.name,value:"",city:"",project:"",notes:""});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const s=(k,v)=>setF(p=>({...p,[k]:v}));

  const save = async () => {
    if (!f.name||!f.phone) return setErr("Name and phone are required.");
    setSaving(true);
    try {
      const data = {...f, value:parseFloat(f.value)||0};
      if (isEdit) { const {id,created_at,...rest}=data; await onSave(rest); }
      else await onSave(data);
      onClose();
    } catch(e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const reps = users.filter(u=>[ROLES.REP,ROLES.COORD].includes(u.role));

  return (
    <div style={S.modal}>
      <div style={S.mdBox(680)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{isEdit?`Edit — ${f.name}`:"New Lead"}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          {err && <Err msg={err} />}
          <div style={S.grid2}>
            <Field label="Full Name *"><Inp value={f.name} onChange={e=>s("name",e.target.value)} /></Field>
            <Field label="Company"><Inp value={f.company} onChange={e=>s("company",e.target.value)} /></Field>
            <Field label="Phone *"><Inp value={f.phone} onChange={e=>s("phone",e.target.value)} /></Field>
            <Field label="Email"><Inp value={f.email} onChange={e=>s("email",e.target.value)} /></Field>
            <Field label="City"><Inp value={f.city} onChange={e=>s("city",e.target.value)} /></Field>
            <Field label="Source"><Sel value={f.source} onChange={e=>s("source",e.target.value)}>{SOURCES.map(x=><option key={x}>{x}</option>)}</Sel></Field>
            <Field label="Stage"><Sel value={f.stage} onChange={e=>s("stage",e.target.value)}>{STAGES.map(x=><option key={x}>{x}</option>)}</Sel></Field>
            <Field label="Value (₹)"><Inp type="number" value={f.value} onChange={e=>s("value",e.target.value)} /></Field>
            {isMgr && <Field label="Assign To"><Sel value={f.assigned_to} onChange={e=>s("assigned_to",e.target.value)}>{reps.map(u=><option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}</Sel></Field>}
            <Field label="Project" full><Inp value={f.project} onChange={e=>s("project",e.target.value)} /></Field>
            <Field label="Notes" full><textarea value={f.notes||""} onChange={e=>s("notes",e.target.value)} style={{...S.finput,minHeight:65,resize:"vertical"}} /></Field>
          </div>
        </div>
        <div style={S.mfoot}>
          <Btn v="outline" onClick={onClose}>Cancel</Btn>
          {isEdit && <Btn v="blue" onClick={()=>onQuote(f)}>+ Quotation</Btn>}
          <Btn onClick={save} style={{opacity:saving?.7:1}}>{saving?"Saving...":isEdit?"Save Changes":"Create Lead"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVITY MODAL
// ══════════════════════════════════════════════════════════════════════════════
function ActivityModal({ lead, user, onSave, onClose }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const existing = (() => { try { return JSON.parse(lead.activity||"[]"); } catch { return []; } })();

  const add = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const updated = [...existing, {date:todayStr(), by:user.name, text:note.trim()}];
      await onSave({activity: JSON.stringify(updated)});
      onClose();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={S.modal}>
      <div style={S.mdBox(560)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>Activity — {lead.name}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <div style={{flex:1}}><Field label="Add Note"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Called client, confirmed visit on Monday..." style={{...S.finput,minHeight:55,resize:"vertical"}} /></Field></div>
            <Btn onClick={add} style={{marginTop:18,alignSelf:"flex-start",opacity:saving?.7:1}}>{saving?"...":"Add"}</Btn>
          </div>
          <div style={{fontSize:11,fontWeight:600,color:"#828282",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>Timeline</div>
          {existing.length===0
            ? <div style={{textAlign:"center",padding:24,color:"#aaa"}}>No activity yet</div>
            : <div style={{position:"relative",paddingLeft:20}}>
                <div style={{position:"absolute",left:6,top:0,bottom:0,width:2,background:"#EDE8E0",borderRadius:1}} />
                {[...existing].reverse().map((a,i)=>(
                  <div key={i} style={{position:"relative",marginBottom:14}}>
                    <div style={{position:"absolute",left:-17,top:4,width:8,height:8,borderRadius:"50%",background:"#C08A35",border:"2px solid #fff"}} />
                    <div style={{fontSize:10,color:"#aaa",marginBottom:1}}>{a.date}</div>
                    <div style={{fontSize:13,color:"#484848"}}>{a.text}</div>
                    <div style={{fontSize:10,color:"#2B7BA0",fontWeight:500}}>— {a.by}</div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div style={S.mfoot}><Btn onClick={onClose}>Close</Btn></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BULK LEADS MODAL
// ══════════════════════════════════════════════════════════════════════════════
function BulkLeadsModal({ user, users, onSave, onClose }) {
  const [step,    setStep]    = useState(0);
  const [preview, setPreview] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const reps = users.filter(u=>[ROLES.REP,ROLES.COORD].includes(u.role));

  const parseCSV = text => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/ /g,"_"));
    return lines.slice(1).map(line=>{
      const vals = line.split(",").map(v=>v.trim());
      const obj = {};
      headers.forEach((h,i)=>obj[h]=vals[i]||"");
      return obj;
    }).filter(r=>r.name&&r.phone);
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target.result);
        if (rows.length===0) { setErr("No valid rows found. Check your CSV has Name and Phone columns."); return; }
        setPreview(rows); setStep(1); setErr("");
      } catch(e) { setErr("Could not read file: "+e.message); }
    };
    reader.readAsText(file);
  };

  const confirm = async () => {
    setSaving(true);
    try {
      for (const r of preview) {
        await onSave({
          name: r.name, company: r.company||"", phone: r.phone, email: r.email||"",
          source: SOURCES.includes(r.source)?r.source:"Walk-in",
          stage: STAGES.includes(r.stage)?r.stage:"New Lead",
          value: parseFloat(r.value)||0, city: r.city||"", project: r.project||"",
          notes: r.notes||"Bulk imported", assigned_to: r.assigned_to||user.name,
        });
      }
      onClose();
    } catch(e) { setErr(e.message); setSaving(false); }
  };

  return (
    <div style={S.modal}>
      <div style={S.mdBox(800)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>Bulk Lead Upload</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          {err && <Err msg={err} />}
          {step===0 && (
            <>
              <div style={{border:"2px dashed #D8D1C7",borderRadius:10,padding:28,textAlign:"center",background:"#F7F4EF",marginBottom:16}}>
                <div style={{fontSize:28,marginBottom:8}}>📂</div>
                <div style={{fontSize:14,fontWeight:600,color:"#484848",marginBottom:4}}>Upload CSV file</div>
                <div style={{fontSize:12,color:"#828282",marginBottom:16}}>Required columns: name, phone &nbsp;|&nbsp; Optional: company, email, source, stage, value, city, project, notes, assigned_to</div>
                <input type="file" accept=".csv" onChange={handleFile} style={{display:"none"}} id="csv-upload" />
                <label htmlFor="csv-upload" style={{...S.btn("primary"),cursor:"pointer",display:"inline-flex"}}>Choose CSV File</label>
              </div>
              <div style={{background:"#F7F4EF",borderRadius:8,padding:12,fontSize:12,color:"#828282",lineHeight:1.9}}>
                <strong style={{color:"#0C2537",display:"block",marginBottom:4}}>CSV Format Guide</strong>
                <strong>Valid Stages:</strong> {STAGES.join(", ")}<br/>
                <strong>Valid Sources:</strong> {SOURCES.join(", ")}<br/>
                <strong>Assigned To:</strong> {reps.map(r=>r.name).join(", ")}
              </div>
            </>
          )}
          {step===1 && (
            <>
              <div style={{marginBottom:12,fontSize:13}}><strong style={{color:"#166534"}}>✓ {preview.length} records ready to import</strong></div>
              <DataTable
                cols={[{key:"name",label:"Name"},{key:"phone",label:"Phone"},{key:"company",label:"Company"},{key:"_src",label:"Source"},{key:"_stg",label:"Stage"},{key:"_val",label:"Value",right:true},{key:"city",label:"City"}]}
                rows={preview.map(r=>({...r,_src:<span style={S.pill("#E3F2FD","#1565C0")}>{r.source||"Walk-in"}</span>,_stg:<StageBadge stage={r.stage||"New Lead"}/>,_val:<span style={{fontWeight:700,color:"#0C2537"}}>{fmt(parseFloat(r.value)||0)}</span>}))}
              />
            </>
          )}
        </div>
        <div style={S.mfoot}>
          <Btn v="outline" onClick={onClose}>Cancel</Btn>
          {step===1 && <Btn v="outline" onClick={()=>setStep(0)}>← Back</Btn>}
          {step===1 && <Btn onClick={confirm} style={{opacity:saving?.7:1}}>{saving?`Importing ${preview.length} leads...`:`Import ${preview.length} Leads`}</Btn>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BULK PRODUCTS MODAL
// ══════════════════════════════════════════════════════════════════════════════
function BulkProductsModal({ onSave, onClose }) {
  const [step,    setStep]    = useState(0);
  const [preview, setPreview] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const parseCSV = text => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/ /g,"_"));
    return lines.slice(1).map(line=>{
      const vals = line.split(",").map(v=>v.trim());
      const obj = {};
      headers.forEach((h,i)=>obj[h]=vals[i]||"");
      return obj;
    }).filter(r=>r.name&&r.master_price);
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target.result);
        if (rows.length===0) { setErr("No valid rows found. Check your CSV."); return; }
        setPreview(rows); setStep(1); setErr("");
      } catch(e) { setErr("Could not read file: "+e.message); }
    };
    reader.readAsText(file);
  };

  const confirm = async () => {
    setSaving(true);
    try {
      for (const r of preview) {
        await onSave({name:r.name, category:r.category||"Other", brand:r.brand||"", unit:r.unit||"Nos", master_price:parseFloat(r.master_price)||0});
      }
      onClose();
    } catch(e) { setErr(e.message); setSaving(false); }
  };

  return (
    <div style={S.modal}>
      <div style={S.mdBox(700)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>Bulk Product Upload</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          {err && <Err msg={err} />}
          {step===0 && (
            <>
              <div style={{border:"2px dashed #D8D1C7",borderRadius:10,padding:28,textAlign:"center",background:"#F7F4EF",marginBottom:16}}>
                <div style={{fontSize:28,marginBottom:8}}>📦</div>
                <div style={{fontSize:14,fontWeight:600,color:"#484848",marginBottom:4}}>Upload Products CSV</div>
                <div style={{fontSize:12,color:"#828282",marginBottom:16}}>Required: name, master_price &nbsp;|&nbsp; Optional: category, brand, unit</div>
                <input type="file" accept=".csv" onChange={handleFile} style={{display:"none"}} id="prod-csv" />
                <label htmlFor="prod-csv" style={{...S.btn("primary"),cursor:"pointer",display:"inline-flex"}}>Choose CSV File</label>
              </div>
              <div style={{background:"#F7F4EF",borderRadius:8,padding:12,fontSize:12,color:"#828282",lineHeight:1.9}}>
                <strong style={{color:"#0C2537",display:"block",marginBottom:4}}>CSV Format Guide</strong>
                <strong>Valid Categories:</strong> {CATS.join(", ")}<br/>
                <strong>Valid Units:</strong> {UNITS.join(", ")}
              </div>
            </>
          )}
          {step===1 && (
            <>
              <div style={{marginBottom:12,fontSize:13}}><strong style={{color:"#166534"}}>✓ {preview.length} products ready</strong></div>
              <DataTable
                cols={[{key:"name",label:"Name"},{key:"_cat",label:"Category"},{key:"brand",label:"Brand"},{key:"unit",label:"Unit"},{key:"_price",label:"Price",right:true,bold:true}]}
                rows={preview.map(r=>({...r,_cat:<span style={S.pill("#E0F2F1","#00695C")}>{r.category||"Other"}</span>,_price:<span style={{color:"#0C2537"}}>{fmt(parseFloat(r.master_price)||0)}</span>}))}
              />
            </>
          )}
        </div>
        <div style={S.mfoot}>
          <Btn v="outline" onClick={onClose}>Cancel</Btn>
          {step===1 && <Btn v="outline" onClick={()=>setStep(0)}>← Back</Btn>}
          {step===1 && <Btn onClick={confirm} style={{opacity:saving?.7:1}}>{saving?"Importing...":"Import Products"}</Btn>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUOTES TAB
// ══════════════════════════════════════════════════════════════════════════════
function QuotesTab({ quotes, leads, prods, user, isMgr, uName, onInv, onNew, onEdit }) {
  const [q, setQ]   = useState("");
  const [sf, setSf] = useState("");
  const filtered = quotes.filter(x=>(!q||x.lead_name?.toLowerCase().includes(q.toLowerCase())||String(x.id).includes(q))&&(!sf||x.status===sf));

  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Quotations</h1><p style={{fontSize:13,color:"#828282"}}>Generate, manage and convert quotations to invoices</p></div>
        <Btn onClick={onNew}>+ New Quotation</Btn>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",background:"#fff",border:"1px solid #D8D1C7",borderRadius:8,padding:"0 11px",gap:7}}>
          <span style={{color:"#aaa"}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search quote # or client..." style={{border:"none",outline:"none",fontSize:13,padding:"8px 0",width:"100%"}} />
        </div>
        <Sel value={sf} onChange={e=>setSf(e.target.value)} style={{width:160}}>
          <option value="">All Status</option>
          {["Draft","Sent","Under Review","Accepted","Rejected"].map(s=><option key={s}>{s}</option>)}
        </Sel>
      </div>
      <div style={S.card}>
        <DataTable
          cols={[
            {key:"_id",label:"Quote #"},{key:"_nm",label:"Client"},{key:"date",label:"Date"},
            {key:"_sub",label:"Subtotal",right:true},{key:"_disc",label:"Disc%",right:true},
            {key:"_net",label:"Net",right:true},{key:"_gst",label:"GST 18%",right:true},
            {key:"_tot",label:"Grand Total",right:true,bold:true},
            {key:"_st",label:"Status"},{key:"_by",label:"By"},{key:"_act",label:"Actions"},
          ]}
          rows={filtered.map(qt=>{
            const gst=Math.round((qt.total||0)*.18);
            return {
              _id:  <span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>Q#{qt.id}</span>,
              _nm:  <span style={{fontWeight:600}}>{qt.lead_name}</span>,
              date: <span style={{fontSize:11,color:"#828282"}}>{qt.date}</span>,
              _sub: fmt(qt.subtotal||0), _disc:<span style={{color:"#C2590A"}}>{qt.discount||0}%</span>,
              _net: fmt(qt.total||0), _gst:<span style={{color:"#828282"}}>{fmt(gst)}</span>,
              _tot: <span style={{color:"#0C2537"}}>{fmt((qt.total||0)+gst)}</span>,
              _st:  <StatusBadge status={qt.status}/>,
              _by:  <span style={{fontSize:11}}>{(qt.created_by||"").split(" ")[0]}</span>,
              _act: <div style={{display:"flex",gap:4}}>
                      <Btn v="outline" xs onClick={()=>onEdit(qt)}>Edit</Btn>
                      <Btn v="navy" xs onClick={()=>onInv(qt)}>Invoice</Btn>
                    </div>,
            };
          })}
          empty="No quotations yet."
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUOTE MODAL
// ══════════════════════════════════════════════════════════════════════════════
function QuoteModal({ lead, existing, prods, user, onSave, onClose, onInv }) {
  const ex = existing;
  const parseItems = d => { try { return JSON.parse(d||"[]"); } catch { return []; } };
  const [cName,  setCName]  = useState(ex?.lead_name||lead?.name||"");
  const [cPhone, setCPhone] = useState(ex?.client_phone||lead?.phone||"");
  const [cProj,  setCProj]  = useState(ex?.client_project||lead?.project||"");
  const [disc,   setDisc]   = useState(ex?.discount??0);
  const [status, setStatus] = useState(ex?.status||"Draft");
  const [showWA, setShowWA] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [items,  setItems]  = useState(parseItems(ex?.items)||[{id:Date.now(),productId:"",customName:"",qty:1,masterPrice:0,clientPrice:0,unit:"Nos",isCustom:false}]);

  const newItem = () => setItems(i=>[...i,{id:Date.now(),productId:"",customName:"",qty:1,masterPrice:0,clientPrice:0,unit:"Nos",isCustom:false}]);
  const delItem = id => setItems(i=>i.filter(x=>x.id!==id));
  const upd = (id,k,v) => setItems(items=>items.map(item=>{
    if(item.id!==id) return item;
    let u={...item,[k]:v};
    if(k==="productId"){
      if(v==="__other__"){u.isCustom=true;u.masterPrice=0;u.clientPrice=0;}
      else{const p=prods.find(p=>String(p.id)===String(v));if(p){u.isCustom=false;u.masterPrice=p.master_price;u.clientPrice=p.master_price;u.unit=p.unit;}}
    }
    return u;
  }));

  const sub  = items.reduce((s,i)=>s+(parseFloat(i.clientPrice)||0)*(parseFloat(i.qty)||0),0);
  const dAmt = sub*(parseFloat(disc)||0)/100;
  const net  = sub-dAmt;
  const gst  = Math.round(net*.18);
  const grand= net+gst;

  const buildData = () => ({
    lead_id: lead?.id||null, lead_name:cName, client_phone:cPhone, client_project:cProj,
    date:ex?ex.date:todayStr(), status, subtotal:Math.round(sub),
    discount:parseFloat(disc)||0, total:Math.round(net),
    created_by:user.name, items:JSON.stringify(items),
  });

  const save = async (andClose=true) => {
    if(!cName){setErr("Client name required.");return null;}
    setSaving(true); setErr("");
    try {
      const d=buildData();
      await onSave(d);
      if(andClose) onClose();
      return d;
    } catch(e){setErr(e.message);return null;}
    finally{setSaving(false);}
  };

  const waText = `*Kurikkal Beyoncé — Quotation*\n\nDear ${cName},\n\n`+
    items.filter(i=>i.qty>0&&i.clientPrice>0).map((i,n)=>{
      const nm=i.customName||prods.find(p=>String(p.id)===String(i.productId))?.name||"Item";
      return `${n+1}. ${nm} × ${i.qty} = ${fmt((i.clientPrice||0)*(i.qty||0))}`;
    }).join("\n")+
    `\n\nSubtotal: ${fmt(sub)}\nDiscount (${disc}%): -${fmt(dAmt)}\nNet: ${fmt(net)}\nGST 18%: ${fmt(gst)}\n*Grand Total: ${fmt(grand)}*\n\nKurikkal Beyoncé | Beyond The Concepts\n📞 +91 XXXXXXXXXX`;

  const th={padding:"7px 8px",textAlign:"left",fontSize:10,color:"#828282",background:"#F7F4EF",fontWeight:600,textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #EDE8E0"};
  const td={padding:"5px 5px",borderBottom:"1px solid #F0EBE3"};
  const qi={padding:"6px 8px",border:"1px solid #D8D1C7",borderRadius:6,fontSize:12,outline:"none",background:"#fff",width:"100%"};

  return (
    <div style={S.modal}>
      <div style={S.mdBox(1050)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{ex?`Quotation Q#${ex.id}`:"New Quotation"}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          {err && <Err msg={err} />}
          <div style={{...S.grid3,marginBottom:16}}>
            <Field label="Client Name *"><Inp value={cName} onChange={e=>setCName(e.target.value)} /></Field>
            <Field label="Phone"><Inp value={cPhone} onChange={e=>setCPhone(e.target.value)} /></Field>
            <Field label="Project"><Inp value={cProj} onChange={e=>setCProj(e.target.value)} /></Field>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:600,color:"#0C2537"}}>Line Items</div>
            <Btn v="outline" sm onClick={newItem}>+ Add Item</Btn>
          </div>
          <div style={{overflowX:"auto",marginBottom:16}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr>
                <th style={{...th,width:24}}>#</th>
                <th style={{...th,minWidth:200}}>Product</th>
                <th style={{...th,width:60}}>Qty</th>
                <th style={{...th,width:65}}>Unit</th>
                <th style={{...th,width:110}}>Master Rate (₹)</th>
                <th style={{...th,width:120}}>Client Rate (₹)</th>
                <th style={{...th,width:100,textAlign:"right"}}>Total</th>
                <th style={{...th,width:30}}></th>
              </tr></thead>
              <tbody>
                {items.map((item,i)=>{
                  const prod=prods.find(p=>String(p.id)===String(item.productId));
                  const discounted=parseFloat(item.clientPrice)<parseFloat(item.masterPrice);
                  return (
                    <tr key={item.id}>
                      <td style={{...td,textAlign:"center",color:"#aaa"}}>{i+1}</td>
                      <td style={td}>
                        {item.isCustom
                          ? <div style={{display:"flex",gap:4}}><input value={item.customName} onChange={e=>upd(item.id,"customName",e.target.value)} placeholder="Custom item description" style={{...qi,flex:1}} /><button onClick={()=>upd(item.id,"productId","")} style={{...S.btn("outline"),fontSize:10,padding:"3px 7px"}}>↩</button></div>
                          : <select value={item.productId} onChange={e=>upd(item.id,"productId",e.target.value)} style={qi}>
                              <option value="">— Select from catalogue —</option>
                              {CATS.map(cat=>(
                                <optgroup key={cat} label={cat}>
                                  {prods.filter(p=>p.category===cat).map(p=><option key={p.id} value={p.id}>[{p.brand}] {p.name}</option>)}
                                </optgroup>
                              ))}
                              <option value="__other__">✏️ Other / Custom Item</option>
                            </select>
                        }
                      </td>
                      <td style={td}><input type="number" min=".01" step=".01" value={item.qty} onChange={e=>upd(item.id,"qty",e.target.value)} style={qi} /></td>
                      <td style={td}>{prod&&!item.isCustom?<span style={{padding:"6px 0",display:"block",color:"#828282"}}>{prod.unit}</span>:<input value={item.unit||"Nos"} onChange={e=>upd(item.id,"unit",e.target.value)} style={qi} />}</td>
                      <td style={td}><input type="number" value={item.masterPrice} onChange={e=>upd(item.id,"masterPrice",e.target.value)} style={{...qi,background:"#F7F4EF",color:"#828282"}} /></td>
                      <td style={td}><input type="number" value={item.clientPrice} onChange={e=>upd(item.id,"clientPrice",e.target.value)} style={{...qi,borderColor:discounted?"#FCA5A5":""}} /></td>
                      <td style={{...td,textAlign:"right",fontWeight:700,color:"#0C2537"}}>
                        {fmt((item.clientPrice||0)*(item.qty||0))}
                        {discounted&&<div style={{fontSize:9,color:"#C2590A"}}>Discounted</div>}
                      </td>
                      <td style={td}><button onClick={()=>delItem(item.id)} style={{...S.btn("danger"),padding:"3px 7px",fontSize:11}}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
              <Field label="Discount %"><input type="number" min="0" max="100" step=".5" value={disc} onChange={e=>setDisc(e.target.value)} style={{...S.finput,width:110}} /></Field>
              <Field label="Status"><Sel value={status} onChange={e=>setStatus(e.target.value)} style={{width:150}}>{["Draft","Sent","Under Review","Accepted","Rejected"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
              <Btn v="green" sm onClick={()=>setShowWA(!showWA)} style={{marginBottom:2}}>💬 WhatsApp</Btn>
            </div>
            <div style={{background:"#F7F4EF",borderRadius:10,padding:"13px 16px",border:"1px solid #E4DDD3",minWidth:260}}>
              {[["Subtotal",fmt(sub)],["Discount ("+disc+"%)",`− ${fmt(dAmt)}`],["Net Amount",fmt(net)],["CGST 9%",fmt(Math.round(net*.09))],["SGST 9%",fmt(Math.round(net*.09))],["Grand Total (incl. GST)",fmt(grand)]].map(([l,v],i)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:i===5?14:13,fontWeight:i===5?700:400,color:i===5?"#0C2537":"#484848",padding:"3px 0",borderTop:i===5?"1px solid #E4DDD3":"none",marginTop:i===5?4:0}}>
                  <span>{l}</span><span style={{color:i===1?"#C2590A":""}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {showWA && (
            <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:10,padding:14,marginTop:14}}>
              <div style={{fontSize:11,color:"#1B5E20",fontWeight:600,marginBottom:4}}>💬 WhatsApp Preview</div>
              <pre style={{fontSize:12,color:"#2E7D32",whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{waText}</pre>
              <Btn v="green" sm style={{marginTop:8}} onClick={()=>{ if(cPhone) window.open(`https://wa.me/91${cPhone.replace(/\D/g,"")}?text=${encodeURIComponent(waText)}`,"_blank"); else alert("Add phone number first."); }}>Open in WhatsApp ↗</Btn>
            </div>
          )}
        </div>
        <div style={S.mfoot}>
          <Btn v="outline" onClick={onClose}>Cancel</Btn>
          <Btn v="outline" onClick={()=>save(true)} style={{opacity:saving?.7:1}}>Save</Btn>
          <Btn v="navy" onClick={async()=>{const d=buildData();if(!cName){setErr("Client name required.");return;}setSaving(true);try{await onSave(d);onInv({...d,id:ex?.id||"new"});}catch(e){setErr(e.message);}finally{setSaving(false);}}} style={{opacity:saving?.7:1}}>Save & Invoice</Btn>
          <Btn onClick={()=>save(true)} style={{opacity:saving?.7:1}}>{saving?"Saving...":"Save & Close"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INVOICE MODAL
// ══════════════════════════════════════════════════════════════════════════════
function InvoiceModal({ quote:qt, onClose }) {
  const gst=Math.round((qt.total||0)*.18), grand=(qt.total||0)+gst;
  const isInv=qt.status==="Accepted";
  const items = (() => { try { return JSON.parse(qt.items||"[]"); } catch { return []; } })();
  const trow=(l,v,bold)=><div style={{display:"flex",justifyContent:"space-between",padding:"6px 12px",fontSize:bold?13:12,fontWeight:bold?700:400,color:bold?"#0C2537":"#484848",borderBottom:bold?"none":"1px solid #EDE8E0",background:bold?"#F7F4EF":"#fff"}}><span>{l}</span><span>{v}</span></div>;

  return (
    <div style={{...S.modal,alignItems:"flex-start",paddingTop:30}}>
      <div style={S.mdBox(820)}>
        <div style={S.mhead}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{isInv?"Tax Invoice":"Quotation"} — Q#{qt.id}</h2>
          <div style={{display:"flex",gap:8}}><Btn v="outline" sm onClick={()=>window.print()}>🖨️ Print</Btn><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        </div>
        <div style={S.mbody}>
          <div style={{background:"#fff",padding:"28px 32px",border:"1px solid #E4DDD3",borderRadius:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:10,background:"linear-gradient(135deg,#C08A35,#EDB96A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif"}}>B</div>
                <div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:20,color:"#0C2537",fontWeight:700}}>Kurikkal Beyoncé</div>
                  <div style={{fontSize:9,color:"#828282",letterSpacing:"2px",textTransform:"uppercase"}}>Beyond The Concepts</div>
                  <div style={{fontSize:11,color:"#828282",marginTop:3}}>Kochi, Kerala — 682 001 | GSTIN: 32XXXXX0000X1ZX</div>
                </div>
              </div>
              <div style={{textAlign:"right",fontSize:12,color:"#484848",lineHeight:1.9}}>
                <div><strong>{isInv?"Invoice":"Quote"} No:</strong> {isInv?"INV-":"QT-"}Q#{qt.id}</div>
                <div><strong>Date:</strong> {todayStr()}</div>
                <div><strong>Valid:</strong> 30 days</div>
                <div><StatusBadge status={qt.status}/></div>
              </div>
            </div>
            <div style={{height:3,background:"linear-gradient(90deg,#0C2537 60%,#C08A35)",borderRadius:2,marginBottom:16}} />
            <div style={{fontFamily:"Georgia,serif",fontSize:22,color:"#C08A35",fontWeight:700,marginBottom:14}}>{isInv?"TAX INVOICE":"QUOTATION"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,background:"#F7F4EF",padding:14,borderRadius:10,marginBottom:16,fontSize:12}}>
              <div><div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Bill To</div><p style={{lineHeight:1.7,color:"#484848"}}><strong>{qt.lead_name}</strong><br/>{qt.client_phone||""}<br/>{qt.client_project||"—"}</p></div>
              <div><div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>From</div><p style={{lineHeight:1.7,color:"#484848"}}><strong>Kurikkal Beyoncé</strong><br/>Plumbing & Sanitaryware<br/>Kochi, Kerala — 682 001</p></div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14,fontSize:12}}>
              <thead><tr style={{background:"#0C2537",color:"#fff"}}>
                {["#","Description","Qty","Unit","Master Rate","Client Rate","Amount"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:h==="Amount"?"right":"left",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {items.length>0
                  ? items.map((it,i)=><tr key={i} style={{background:i%2===0?"#fff":"#F7F4EF"}}>
                      <td style={{padding:"8px 10px"}}>{i+1}</td>
                      <td style={{padding:"8px 10px",fontWeight:500}}>{it.customName||it.productName||"Item"}</td>
                      <td style={{padding:"8px 10px"}}>{it.qty}</td>
                      <td style={{padding:"8px 10px"}}>{it.unit||"Nos"}</td>
                      <td style={{padding:"8px 10px",color:"#828282"}}>{fmt(it.masterPrice||0)}</td>
                      <td style={{padding:"8px 10px"}}>{fmt(it.clientPrice||0)}</td>
                      <td style={{padding:"8px 10px",fontWeight:700,textAlign:"right"}}>{fmt((it.clientPrice||0)*(it.qty||0))}</td>
                    </tr>)
                  : <tr><td colSpan={7} style={{padding:20,textAlign:"center",color:"#aaa",fontStyle:"italic"}}>No line items added</td></tr>
                }
              </tbody>
            </table>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <div style={{width:270,border:"1px solid #E4DDD3",borderRadius:10,overflow:"hidden"}}>
                {trow("Subtotal",fmt(qt.subtotal||0))}
                {trow(`Discount (${qt.discount||0}%)`,`− ${fmt(Math.round((qt.subtotal||0)*(qt.discount||0)/100))}`)}
                {trow("Net Amount",fmt(qt.total||0))}
                {trow("CGST @ 9%",fmt(Math.round((qt.total||0)*.09)))}
                {trow("SGST @ 9%",fmt(Math.round((qt.total||0)*.09)))}
                {trow("Grand Total",fmt(grand),true)}
              </div>
            </div>
            <div style={{fontSize:11,background:"#F7F4EF",borderRadius:8,padding:"8px 12px",marginBottom:14,border:"1px solid #E4DDD3"}}>
              <strong>Amount in Words:</strong> Rupees {amtWords(grand)} Only
            </div>
            <div style={{fontSize:11,color:"#828282",lineHeight:1.9,marginBottom:20}}>
              <strong style={{color:"#0C2537",display:"block",marginBottom:3}}>Terms & Conditions</strong>
              1. Payment due within 30 days of invoice date.<br/>
              2. Goods once dispatched will not be accepted back without prior written approval.<br/>
              3. Installation charges not included unless explicitly specified.<br/>
              4. All disputes subject to Ernakulam jurisdiction. E&OE.
            </div>
            <div style={{background:"#0C2537",color:"#fff",padding:12,borderRadius:10,textAlign:"center",fontSize:11,lineHeight:1.9}}>
              <strong style={{color:"#EDB96A"}}>Kurikkal Beyoncé — Beyond The Concepts</strong><br/>
              Plumbing, Sanitaryware & Allied Products | Kochi, Kerala<br/>
              📞 +91 XXXXXXXXXX &nbsp;|&nbsp; ✉ enquiry@kurikkalbeyonce.in
            </div>
          </div>
        </div>
        <div style={S.mfoot}><Btn v="outline" onClick={onClose}>Close</Btn><Btn onClick={()=>window.print()}>🖨️ Print / PDF</Btn></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProductsTab({ prods, isMgr, isSU, onAdd, onEdit, onDel, onBulk }) {
  const [q,setQ]=useState(""); const [cat,setCat]=useState(""); const [brnd,setBrnd]=useState("");
  const brands=[...new Set(prods.map(p=>p.brand))].sort();
  const filtered=prods.filter(p=>(!q||p.name?.toLowerCase().includes(q.toLowerCase())||p.brand?.toLowerCase().includes(q.toLowerCase()))&&(!cat||p.category===cat)&&(!brnd||p.brand===brnd));
  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Product Master</h1><p style={{fontSize:13,color:"#828282"}}>{prods.length} products in catalogue</p></div>
        <div style={{display:"flex",gap:8}}>
          {isMgr&&<Btn v="outline" sm onClick={onBulk}>↑ Bulk Upload</Btn>}
          {isMgr&&<Btn onClick={onAdd}>+ Add Product</Btn>}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180,display:"flex",alignItems:"center",background:"#fff",border:"1px solid #D8D1C7",borderRadius:8,padding:"0 11px",gap:7}}>
          <span style={{color:"#aaa"}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, brand..." style={{border:"none",outline:"none",fontSize:13,padding:"8px 0",width:"100%"}} />
        </div>
        <Sel value={cat} onChange={e=>setCat(e.target.value)} style={{width:155}}><option value="">All Categories</option>{CATS.map(c=><option key={c}>{c}</option>)}</Sel>
        <Sel value={brnd} onChange={e=>setBrnd(e.target.value)} style={{width:140}}><option value="">All Brands</option>{brands.map(b=><option key={b}>{b}</option>)}</Sel>
      </div>
      <div style={S.card}>
        <DataTable
          cols={[{key:"_id",label:"#"},{key:"_nm",label:"Product Name"},{key:"_cat",label:"Category"},{key:"brand",label:"Brand"},{key:"unit",label:"Unit"},{key:"_price",label:"Master Price",right:true,bold:true},...(isMgr?[{key:"_act",label:"Actions"}]:[])]}
          rows={filtered.map(p=>({
            _id:  <span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>#{p.id}</span>,
            _nm:  <span style={{fontWeight:500}}>{p.name}</span>,
            _cat: <span style={S.pill("#E0F2F1","#00695C")}>{p.category}</span>,
            brand:p.brand, unit:p.unit,
            _price:<span style={{color:"#0C2537"}}>{fmt(p.master_price||0)}</span>,
            _act: <div style={{display:"flex",gap:4}}>
                    <Btn v="outline" xs onClick={()=>onEdit(p)}>Edit</Btn>
                    {isSU&&<Btn v="danger" xs onClick={()=>{if(window.confirm(`Delete ${p.name}?`))onDel(p.id);}}>Del</Btn>}
                  </div>,
          }))}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCT MODAL
// ══════════════════════════════════════════════════════════════════════════════
function ProdModal({ mode, onSave, onClose }) {
  const isEdit=mode!=="new";
  const [f,setF]=useState(isEdit?{...mode}:{name:"",category:"CP Fittings",brand:"",unit:"Nos",master_price:""});
  const [saving,setSaving]=useState(false); const [err,setErr]=useState("");
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=async()=>{
    if(!f.name||!f.master_price){setErr("Name and price required.");return;}
    setSaving(true);setErr("");
    try{
      const {id,created_at,...rest}=f;
      await onSave({...rest,master_price:parseFloat(f.master_price)});
      onClose();
    }catch(e){setErr(e.message);}finally{setSaving(false);}
  };
  return (
    <div style={S.modal}><div style={S.mdBox(480)}>
      <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{isEdit?"Edit Product":"Add Product"}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
      <div style={S.mbody}>
        {err&&<Err msg={err}/>}
        <div style={S.grid2}>
          <Field label="Brand"><Inp value={f.brand} onChange={e=>s("brand",e.target.value)} /></Field>
          <Field label="Category"><Sel value={f.category} onChange={e=>s("category",e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</Sel></Field>
          <Field label="Product Name *" full><Inp value={f.name} onChange={e=>s("name",e.target.value)} /></Field>
          <Field label="Unit"><Sel value={f.unit} onChange={e=>s("unit",e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</Sel></Field>
          <Field label="Master Price (₹) *"><Inp type="number" value={f.master_price} onChange={e=>s("master_price",e.target.value)} /></Field>
        </div>
      </div>
      <div style={S.mfoot}><Btn v="outline" onClick={onClose}>Cancel</Btn><Btn onClick={save} style={{opacity:saving?.7:1}}>{saving?"Saving...":"Save Product"}</Btn></div>
    </div></div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ leads, quotes, uName }) {
  const won=leads.filter(l=>l.stage==="Won");
  const lost=leads.filter(l=>l.stage==="Lost");
  const open=leads.filter(l=>!["Won","Lost"].includes(l.stage));
  const tv=leads.reduce((s,l)=>s+(l.value||0),0);
  const wv=won.reduce((s,l)=>s+(l.value||0),0);
  const lv=lost.reduce((s,l)=>s+(l.value||0),0);
  const cv=leads.length?Math.round(won.length/leads.length*100):0;
  const qv=quotes.reduce((s,q)=>s+(q.total||0),0);
  const stData=STAGES.map(s=>({s,n:leads.filter(l=>l.stage===s).length,v:leads.filter(l=>l.stage===s).reduce((a,l)=>a+(l.value||0),0)}));
  const maxN=Math.max(...stData.map(d=>d.n),1);
  const srcData=SOURCES.map(s=>({s,n:leads.filter(l=>l.source===s).length})).filter(d=>d.n>0).sort((a,b)=>b.n-a.n).slice(0,7);
  const maxS=Math.max(...srcData.map(d=>d.n),1);
  const repNames=[...new Set(leads.map(l=>l.assigned_to).filter(Boolean))];
  const repData=repNames.map(name=>({name,n:leads.filter(l=>l.assigned_to===name).length,won:leads.filter(l=>l.assigned_to===name&&l.stage==="Won").length,v:leads.filter(l=>l.assigned_to===name).reduce((s,l)=>s+(l.value||0),0)})).sort((a,b)=>b.v-a.v);
  const cities=[...new Set(leads.map(l=>l.city).filter(Boolean))];

  return (
    <div>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Dashboard</h1>
      <p style={{fontSize:13,color:"#828282",marginBottom:18}}>Live data from Supabase · refreshes on each login</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
        {[["Pipeline",fmtL(tv),"#2B7BA0"],["Active",open.length,"#C2590A"],["Won",fmtL(wv),"#166534"],["Conversion",cv+"%","#C08A35"],["Lost",fmtL(lv),"#B91C1C"],["Quotes",fmtL(qv),"#1553A8"]].map(([l,v,a])=>(
          <div key={l} style={S.sc(a)}><div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:".9px",marginBottom:4}}>{l}</div><div style={{fontSize:24,fontWeight:700,color:"#0C2537",fontFamily:"Georgia,serif"}}>{v}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Pipeline Funnel</span></div>
          <div style={S.cb}>{stData.map(d=>(
            <div key={d.s} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#484848",marginBottom:3}}><span>{d.s}</span><span style={{fontWeight:600}}>{d.n} · {fmtL(d.v)}</span></div>
              <div style={{height:9,background:"#EDE9E1",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${(d.n/maxN)*100}%`,background:"linear-gradient(90deg,#0C2537,#2B7BA0)",borderRadius:5}} /></div>
            </div>
          ))}</div>
        </div>
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Leads by Source</span></div>
          <div style={S.cb}>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
              {srcData.map(d=>(
                <div key={d.s} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#0C2537"}}>{d.n}</span>
                  <div style={{width:"100%",background:"linear-gradient(180deg,#EDB96A,#C08A35)",borderRadius:"4px 4px 0 0",height:`${Math.max((d.n/maxS)*100,6)}%`}} />
                  <span style={{fontSize:8,color:"#828282",textAlign:"center"}}>{d.s.replace(" Referral","").replace("Social Media","Social")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Team Performance</span></div>
          <div style={S.cb}>{repData.map(r=>(
            <div key={r.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #EDE8E0"}}>
              <Avatar name={r.name} size={34}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{r.name}</div><div style={{fontSize:11,color:"#828282"}}>{r.n} leads · {r.won} won · {r.n?Math.round(r.won/r.n*100):0}% conv.</div></div>
              <div style={{fontWeight:700,fontSize:13,color:"#0C2537"}}>{fmtL(r.v)}</div>
            </div>
          ))}</div>
        </div>
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>By City</span></div>
          <div style={S.cb}>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {cities.map(city=>{
                const cl=leads.filter(l=>l.city===city);
                return <div key={city} style={{background:"#F7F4EF",borderRadius:10,padding:"10px 14px",border:"1px solid #E4DDD3"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0C2537"}}>{city}</div>
                  <div style={{fontSize:11,color:"#828282"}}>{cl.length} leads</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#C08A35"}}>{fmtL(cl.reduce((s,l)=>s+(l.value||0),0))}</div>
                </div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════════════════════
function Reports({ leads, quotes, uName }) {
  const won=leads.filter(l=>l.stage==="Won");
  const lost=leads.filter(l=>l.stage==="Lost");
  const open=leads.filter(l=>!["Won","Lost"].includes(l.stage));
  const tv=leads.reduce((s,l)=>s+(l.value||0),0);
  const wv=won.reduce((s,l)=>s+(l.value||0),0);
  const lv=lost.reduce((s,l)=>s+(l.value||0),0);
  const byStage=STAGES.map(s=>({s,n:leads.filter(l=>l.stage===s).length,v:leads.filter(l=>l.stage===s).reduce((a,l)=>a+(l.value||0),0)}));
  const bySrc=SOURCES.map(s=>({s,n:leads.filter(l=>l.source===s).length,v:leads.filter(l=>l.source===s).reduce((a,l)=>a+(l.value||0),0)})).filter(d=>d.n).sort((a,b)=>b.v-a.v);
  const repNames=[...new Set(leads.map(l=>l.assigned_to).filter(Boolean))];
  const byRep=repNames.map(name=>({name,n:leads.filter(l=>l.assigned_to===name).length,won:leads.filter(l=>l.assigned_to===name&&l.stage==="Won").length,v:leads.filter(l=>l.assigned_to===name).reduce((s,l)=>s+(l.value||0),0)})).sort((a,b)=>b.v-a.v);
  const kpis=[["Total Leads",leads.length,"#0C2537"],["Pipeline Value",fmtL(tv),"#2B7BA0"],["Open / Active",open.length,"#C2590A"],["Won Deals",won.length,"#166534"],["Won Value",fmtL(wv),"#166534"],["Lost Deals",lost.length,"#B91C1C"],["Lost Value",fmtL(lv),"#B91C1C"],["Conversion",leads.length?Math.round(won.length/leads.length*100)+"%":"—","#C08A35"],["Accepted Quotes",quotes.filter(q=>q.status==="Accepted").length,"#166534"],["Avg Deal (Won)",won.length?fmtL(Math.round(wv/won.length)):"—","#0C2537"]];

  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Reports & Analytics</h1><p style={{fontSize:13,color:"#828282"}}>Full sales performance metrics</p></div>
        <Btn v="outline" sm onClick={()=>alert("In production: exports full data to Excel")}>↓ Export Excel</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:18}}>
        {kpis.map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:12,padding:"12px 14px",boxShadow:"0 2px 14px rgba(12,37,55,.08)",border:"1px solid #E4DDD3",borderTop:`3px solid ${c}`}}>
            <div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:".8px",marginBottom:4}}>{l}</div>
            <div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"Georgia,serif"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:13,marginBottom:16}}>
        <div style={S.card}><div style={S.ch}><span style={S.chTitle}>By Stage</span></div>
          <DataTable cols={[{key:"_s",label:"Stage"},{key:"n",label:"Count",right:true,bold:true},{key:"_v",label:"Value",right:true},{key:"_p",label:"%",right:true}]}
            rows={byStage.filter(d=>d.n>0).map(d=>({_s:<StageBadge stage={d.s}/>,n:d.n,_v:<span style={{fontWeight:600,color:"#0C2537"}}>{fmtL(d.v)}</span>,_p:<span style={{color:"#828282"}}>{Math.round(d.n/Math.max(leads.length,1)*100)}%</span>}))} />
        </div>
        <div style={S.card}><div style={S.ch}><span style={S.chTitle}>By Source</span></div>
          <DataTable cols={[{key:"_s",label:"Source"},{key:"n",label:"Leads",right:true,bold:true},{key:"_v",label:"Value",right:true}]}
            rows={bySrc.map(d=>({_s:<span style={S.pill("#E3F2FD","#1565C0")}>{d.s}</span>,n:d.n,_v:<span style={{fontWeight:700,color:"#0C2537"}}>{fmtL(d.v)}</span>}))} />
        </div>
        <div style={S.card}><div style={S.ch}><span style={S.chTitle}>By Rep</span></div>
          <DataTable cols={[{key:"_nm",label:"Rep"},{key:"n",label:"Leads",right:true},{key:"_w",label:"Won",right:true},{key:"_v",label:"Value",right:true},{key:"_c",label:"Conv%",right:true}]}
            rows={byRep.map(r=>({_nm:<span style={{fontWeight:600}}>{r.name.split(" ")[0]}</span>,n:r.n,_w:<span style={{color:"#166534",fontWeight:700}}>{r.won}</span>,_v:<span style={{fontWeight:700,color:"#0C2537"}}>{fmtL(r.v)}</span>,_c:<span style={{color:"#C08A35"}}>{r.n?Math.round(r.won/r.n*100):0}%</span>}))} />
        </div>
      </div>
      <div style={S.card}>
        <div style={S.ch}><span style={S.chTitle}>Full Lead Register</span><span style={{fontSize:12,color:"#828282"}}>{leads.length} records</span></div>
        <DataTable
          cols={[{key:"_id",label:"#"},{key:"_nm",label:"Name"},{key:"_co",label:"Company"},{key:"city",label:"City"},{key:"_src",label:"Source"},{key:"_stg",label:"Stage"},{key:"_val",label:"Value",right:true,bold:true},{key:"_asgn",label:"Assigned"},{key:"_date",label:"Date"}]}
          rows={leads.map(l=>({_id:<span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>#{l.id}</span>,_nm:<span style={{fontWeight:600}}>{l.name}</span>,_co:<span style={{fontSize:11}}>{l.company||"—"}</span>,city:l.city,_src:<span style={S.pill("#E3F2FD","#1565C0")}>{l.source}</span>,_stg:<StageBadge stage={l.stage}/>,_val:<span style={{color:"#0C2537"}}>{fmt(l.value||0)}</span>,_asgn:<span style={{fontSize:11}}>{l.assigned_to}</span>,_date:<span style={{fontSize:11,color:"#828282"}}>{(l.created_at||"").split("T")[0]}</span>}))}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ══════════════════════════════════════════════════════════════════════════════
function UsersTab({ users, onAdd, onUpd }) {
  const [adding,setAdding]=useState(false);
  const [f,setF]=useState({name:"",email:"",role:ROLES.REP,password:"",active:true});
  const [saving,setSaving]=useState(false); const [err,setErr]=useState("");
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const add=async()=>{
    if(!f.name||!f.email||!f.password){setErr("All fields required.");return;}
    setSaving(true);setErr("");
    try{await onAdd(f);setF({name:"",email:"",role:ROLES.REP,password:"",active:true});setAdding(false);}
    catch(e){setErr(e.message);}finally{setSaving(false);}
  };
  const toggle=async(u)=>{ try{await onUpd(u.id,{active:!u.active});}catch(e){alert(e.message);} };

  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>User Management</h1><p style={{fontSize:13,color:"#828282"}}>Manage system users and access levels</p></div>
        <Btn onClick={()=>setAdding(true)}>+ Add User</Btn>
      </div>
      {adding && (
        <div style={{...S.card,marginBottom:16}}>
          <div style={S.ch}><span style={S.chTitle}>New User</span></div>
          <div style={S.cb}>
            {err&&<Err msg={err}/>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
              <Field label="Full Name *"><Inp value={f.name} onChange={e=>s("name",e.target.value)} /></Field>
              <Field label="Email *"><Inp value={f.email} onChange={e=>s("email",e.target.value)} /></Field>
              <Field label="Password *"><Inp type="password" value={f.password} onChange={e=>s("password",e.target.value)} /></Field>
              <Field label="Role"><Sel value={f.role} onChange={e=>s("role",e.target.value)}>{Object.values(ROLES).map(r=><option key={r}>{r}</option>)}</Sel></Field>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <Btn onClick={add} style={{opacity:saving?.7:1}}>{saving?"Creating...":"Create User"}</Btn>
              <Btn v="outline" onClick={()=>setAdding(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
      <div style={S.card}>
        <DataTable
          cols={[{key:"_av",label:"User"},{key:"email",label:"Email"},{key:"_role",label:"Role"},{key:"_st",label:"Status"},{key:"_act",label:"Actions"}]}
          rows={users.map(u=>({
            _av: <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={u.name} size={28}/><span style={{fontWeight:600}}>{u.name}</span></div>,
            email:<span style={{fontSize:12,color:"#828282"}}>{u.email}</span>,
            _role:<span style={S.pill("#E0F2F1","#00695C")}>{u.role}</span>,
            _st:  <span style={{...S.tag(u.active?"#DCFCE7":"#FEE2E2",u.active?"#166534":"#B91C1C")}}>{u.active?"Active":"Inactive"}</span>,
            _act: <Btn v={u.active?"danger":"green"} xs onClick={()=>toggle(u)}>{u.active?"Deactivate":"Activate"}</Btn>,
          }))}
        />
        <div style={{padding:"12px 18px",background:"#F7F4EF",borderTop:"1px solid #EDE8E0",fontSize:12,color:"#828282",lineHeight:1.9}}>
          🔴 <strong>Superuser</strong> — full access &nbsp;·&nbsp; 🟡 <strong>Sales Head</strong> — all leads & reports &nbsp;·&nbsp; 🟢 <strong>Coordinator</strong> — all leads, bulk upload &nbsp;·&nbsp; 🔵 <strong>Sales Rep</strong> — own leads, quotations
        </div>
      </div>
    </div>
  );
}
