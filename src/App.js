import React,{ useState } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt  = n => "₹" + Number(n||0).toLocaleString("en-IN");
const fmtL = n => n >= 100000 ? "₹"+(n/100000).toFixed(1)+"L" : fmt(n);
const uid  = () => Math.random().toString(36).substr(2,6).toUpperCase();
const todayStr = () => new Date().toISOString().split("T")[0];
const initials = n => (n||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

// ── constants ─────────────────────────────────────────────────────────────────
const ROLES = { SUPER:"Superuser", HEAD:"Sales Head", COORD:"Sales Coordinator", REP:"Sales Rep" };
const STAGES = ["New Lead","Contacted","Site Visit","Quotation Sent","Negotiation","Won","Lost"];
const SOURCES = ["Walk-in","WhatsApp","Phone","Email","Architect Referral","Builder Referral","Social Media","Website","Exhibition"];
const CATS = ["CP Fittings","Sanitaryware","Shower","Pipes & Fittings","Kitchen","Accessories","Bath","Tiles","Other"];

const STAGE_COLOR = {
  "New Lead":      {bg:"#EEF2FF",color:"#3730A3"},
  "Contacted":     {bg:"#FFF7ED",color:"#C2410C"},
  "Site Visit":    {bg:"#F0F9FF",color:"#0369A1"},
  "Quotation Sent":{bg:"#FEFCE8",color:"#854D0E"},
  "Negotiation":   {bg:"#FDF4FF",color:"#7E22CE"},
  "Won":           {bg:"#F0FDF4",color:"#166534"},
  "Lost":          {bg:"#FEF2F2",color:"#B91C1C"},
};

const STATUS_COLOR = {
  "Draft":        {bg:"#F3F4F6",color:"#374151"},
  "Sent":         {bg:"#DBEAFE",color:"#1D4ED8"},
  "Under Review": {bg:"#FEF9C3",color:"#92400E"},
  "Accepted":     {bg:"#DCFCE7",color:"#166534"},
  "Rejected":     {bg:"#FEE2E2",color:"#B91C1C"},
};

const INIT_USERS = [
  {id:1, name:"Admin User",     email:"admin@beyonce.in",  role:ROLES.SUPER, pw:"admin123", active:true},
  {id:2, name:"Rajan Menon",    email:"rajan@beyonce.in",  role:ROLES.HEAD,  pw:"head123",  active:true},
  {id:3, name:"Priya Suresh",   email:"priya@beyonce.in",  role:ROLES.COORD, pw:"coord123", active:true},
  {id:4, name:"Arjun Nair",     email:"arjun@beyonce.in",  role:ROLES.REP,   pw:"rep123",   active:true},
  {id:5, name:"Divya Krishnan", email:"divya@beyonce.in",  role:ROLES.REP,   pw:"rep456",   active:true},
];

const INIT_PRODUCTS = [
  {id:"P001",name:"Jaquar Kubix Single Lever Basin Mixer",  category:"CP Fittings",      brand:"Jaquar",   unit:"Nos", masterPrice:8500},
  {id:"P002",name:"Grohe Bauedge Basin Tap",                category:"CP Fittings",      brand:"Grohe",    unit:"Nos", masterPrice:12400},
  {id:"P003",name:"Hindware Sanitaryware WC Suite",         category:"Sanitaryware",     brand:"Hindware", unit:"Set", masterPrice:18700},
  {id:"P004",name:"Parryware Ovation WELS WC",              category:"Sanitaryware",     brand:"Parryware",unit:"Set", masterPrice:22000},
  {id:"P005",name:"Roca Laura Wash Basin",                  category:"Sanitaryware",     brand:"Roca",     unit:"Nos", masterPrice:9800},
  {id:"P006",name:"Cera Aqua Shower Panel",                 category:"Shower",           brand:"Cera",     unit:"Nos", masterPrice:31500},
  {id:"P007",name:"Kohler Purist Rain Shower 300mm",        category:"Shower",           brand:"Kohler",   unit:"Nos", masterPrice:28900},
  {id:"P008",name:"Supreme CPVC Pipe 25mm (per mtr)",       category:"Pipes & Fittings", brand:"Supreme",  unit:"Mtr", masterPrice:320},
  {id:"P009",name:"Finolex uPVC Pipe 110mm SWR",            category:"Pipes & Fittings", brand:"Finolex",  unit:"Mtr", masterPrice:480},
  {id:"P010",name:"Franke SS Kitchen Sink (Single Bowl)",   category:"Kitchen",          brand:"Franke",   unit:"Nos", masterPrice:16200},
  {id:"P011",name:"Hafele Pull-out Kitchen Mixer Tap",      category:"Kitchen",          brand:"Hafele",   unit:"Nos", masterPrice:19500},
  {id:"P012",name:"Jaquar 3-in-1 Health Faucet Set",        category:"Accessories",      brand:"Jaquar",   unit:"Set", masterPrice:2800},
  {id:"P013",name:"Toto S300e Wall-hung WC with Washlet",   category:"Sanitaryware",     brand:"Toto",     unit:"Set", masterPrice:145000},
  {id:"P014",name:"Roca Hall Bath Tub 170cm",               category:"Bath",             brand:"Roca",     unit:"Nos", masterPrice:88000},
  {id:"P015",name:"Cera Quartz Basin Mixer Chrome",         category:"CP Fittings",      brand:"Cera",     unit:"Nos", masterPrice:6800},
];

const INIT_LEADS = [
  {id:"L001",name:"Sajeev Mohan",   company:"SM Constructions",  phone:"9876543210",email:"sajeev@smcon.in",  source:"Architect Referral",stage:"Quotation Sent",assignedTo:4,value:185000,city:"Kochi",        project:"Villa in Kakkanad",             createdAt:"2025-04-10",notes:"4-bed villa, full bathroom package",activity:[{date:"2025-04-10",by:4,text:"Lead created from architect referral"},{date:"2025-04-12",by:4,text:"Called client — confirmed budget ₹1.8L"},{date:"2025-04-15",by:4,text:"Quotation Q001 sent via WhatsApp"}]},
  {id:"L002",name:"Aneesh Kumar",   company:"AK Builders",       phone:"9645321087",email:"aneesh@ak.com",    source:"Walk-in",            stage:"Negotiation",    assignedTo:5,value:320000,city:"Thrissur",    project:"Apartment complex G+3 — 20 units",createdAt:"2025-04-12",notes:"Bulk order, wants 12% disc",        activity:[{date:"2025-04-12",by:5,text:"Walk-in at showroom"},{date:"2025-04-18",by:5,text:"Site visit done"},{date:"2025-04-20",by:5,text:"Quotation Q002 submitted"}]},
  {id:"L003",name:"Rekha Pillai",   company:"",                  phone:"9745123456",email:"rekha@gmail.com",  source:"WhatsApp",           stage:"Contacted",      assignedTo:4,value:45000, city:"Ernakulam",  project:"Home renovation — 2 bathrooms", createdAt:"2025-04-18",notes:"Wants Jaquar / Cera range",          activity:[{date:"2025-04-18",by:4,text:"Enquiry via WhatsApp"}]},
  {id:"L004",name:"Thomas Varghese",company:"SkyBuild Infra",    phone:"9846012345",email:"thomas@sky.in",    source:"Website",            stage:"Won",            assignedTo:5,value:560000,city:"Kottayam",   project:"Commercial complex — 5 floors",  createdAt:"2025-03-28",notes:"Full project supply incl. pipes",    activity:[{date:"2025-03-28",by:5,text:"Website enquiry"},{date:"2025-04-02",by:5,text:"Quotation sent"},{date:"2025-04-10",by:5,text:"Deal WON — order confirmed"}]},
  {id:"L005",name:"Meera Nair",     company:"",                  phone:"9562345678",email:"meera@yahoo.com",  source:"Phone",              stage:"New Lead",       assignedTo:4,value:28000, city:"Aluva",      project:"New house — 1 bathroom set",     createdAt:"2025-05-01",notes:"Interested in Hindware",             activity:[{date:"2025-05-01",by:4,text:"Inbound phone call"}]},
  {id:"L006",name:"Ravi Chandran",  company:"RC Hotels Pvt Ltd", phone:"9447123321",email:"ravi@rchotels.in", source:"Exhibition",         stage:"Site Visit",     assignedTo:5,value:890000,city:"Kochi",      project:"Boutique hotel 3-star — 28 rooms",createdAt:"2025-04-22",notes:"Premium brands only: Toto, Grohe",  activity:[{date:"2025-04-22",by:5,text:"Met at Kerala Builds exhibition"},{date:"2025-04-25",by:5,text:"Site visit scheduled"}]},
  {id:"L007",name:"Sunitha Joseph", company:"Artech Homes",      phone:"9895321456",email:"sunitha@art.in",   source:"Builder Referral",   stage:"Lost",           assignedTo:4,value:75000, city:"Thrippunithura",project:"Row houses — 4 units",         createdAt:"2025-04-05",notes:"Lost to competitor on price",       activity:[{date:"2025-04-05",by:4,text:"Referral from Artech"},{date:"2025-04-14",by:4,text:"Lead lost — went with competitor"}]},
  {id:"L008",name:"Bijo Mathew",    company:"BM Interiors",      phone:"9656234567",email:"bijo@bm.com",      source:"Architect Referral", stage:"Quotation Sent", assignedTo:5,value:210000,city:"Edapally",   project:"Luxury apartment fit-out",       createdAt:"2025-04-28",notes:"High-end brands only",               activity:[{date:"2025-04-28",by:5,text:"Referred by Arch. Sreejith Menon"},{date:"2025-04-30",by:5,text:"Quotation Q004 sent"}]},
];

const INIT_QUOTES = [
  {id:"Q001",leadId:"L001",leadName:"Sajeev Mohan",   clientPhone:"9876543210",clientProject:"Villa in Kakkanad",         date:"2025-04-15",status:"Sent",         subtotal:168000,discount:10,total:151200,createdBy:4,items:[{id:"i1",productId:"P001",customName:"",qty:4,masterPrice:8500, clientPrice:8500, unit:"Nos",isCustom:false},{id:"i2",productId:"P003",customName:"",qty:2,masterPrice:18700,clientPrice:18700,unit:"Set",isCustom:false},{id:"i3",productId:"P012",customName:"",qty:4,masterPrice:2800, clientPrice:2800, unit:"Set",isCustom:false}]},
  {id:"Q002",leadId:"L002",leadName:"Aneesh Kumar",   clientPhone:"9645321087",clientProject:"Apartment complex G+3",     date:"2025-04-20",status:"Under Review", subtotal:295000,discount:8, total:271400,createdBy:5,items:[{id:"i4",productId:"P004",customName:"",qty:10,masterPrice:22000,clientPrice:22000,unit:"Set",isCustom:false},{id:"i5",productId:"P008",customName:"",qty:200,masterPrice:320, clientPrice:300,  unit:"Mtr",isCustom:false}]},
  {id:"Q003",leadId:"L004",leadName:"Thomas Varghese",clientPhone:"9846012345",clientProject:"Commercial complex",         date:"2025-04-02",status:"Accepted",      subtotal:520000,discount:12,total:457600,createdBy:5,items:[]},
  {id:"Q004",leadId:"L008",leadName:"Bijo Mathew",    clientPhone:"9656234567",clientProject:"Luxury apartment fit-out", date:"2025-04-30",status:"Sent",         subtotal:198000,discount:5, total:188100,createdBy:5,items:[{id:"i6",productId:"P013",customName:"",qty:1,masterPrice:145000,clientPrice:145000,unit:"Set",isCustom:false}]},
];

// ── styles object (no class-name-with-spaces) ─────────────────────────────────
const S = {
  // layout
  app:     {display:"flex",flexDirection:"column",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",background:"#F2EFE9",color:"#1C1C1C"},
  topbar:  {background:"#0C2537",display:"flex",alignItems:"center",padding:"0 20px",height:58,gap:14,boxShadow:"0 3px 12px rgba(0,0,0,.35)",position:"sticky",top:0,zIndex:100,flexShrink:0},
  tbName:  {fontFamily:"Georgia,serif",color:"#D9A24E",fontSize:19,fontWeight:700},
  tbSub:   {fontSize:10,color:"rgba(255,255,255,.38)",letterSpacing:"1.8px",textTransform:"uppercase",marginTop:1},
  tbRight: {marginLeft:"auto",display:"flex",alignItems:"center",gap:10},
  roleBadge:{background:"rgba(192,138,53,.18)",border:"1px solid rgba(192,138,53,.35)",color:"#EDB96A",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:500},
  avatar:  (size=30)=>({width:size,height:size,borderRadius:"50%",background:"#206080",border:"2px solid #C08A35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size>28?12:10,fontWeight:700,color:"#fff",flexShrink:0}),
  lgtBtn:  {background:"none",border:"1px solid rgba(255,255,255,.18)",color:"rgba(255,255,255,.55)",padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer"},
  tabBar:  {background:"#0C2537",display:"flex",padding:"0 20px",borderBottom:"2px solid rgba(192,138,53,.25)",overflowX:"auto"},
  tab:     (on)=>({padding:"11px 18px",fontSize:13,fontWeight:500,color:on?"#EDB96A":"rgba(255,255,255,.45)",border:"none",background:"none",borderBottom:`3px solid ${on?"#C08A35":"transparent"}`,marginBottom:-2,cursor:"pointer",whiteSpace:"nowrap",transition:"color .15s"}),
  main:    {padding:"22px 20px",maxWidth:1400,margin:"0 auto",width:"100%"},
  // cards
  card:    {background:"#fff",borderRadius:16,boxShadow:"0 2px 14px rgba(12,37,55,.10)",border:"1px solid #E4DDD3",overflow:"hidden",marginBottom:16},
  ch:      {padding:"13px 18px",borderBottom:"1px solid #EDE8E0",display:"flex",alignItems:"center",justifyContent:"space-between"},
  chTitle: {fontFamily:"Georgia,serif",fontSize:15,color:"#0C2537",fontWeight:600},
  cb:      {padding:18},
  // stat cards
  sc:      (accent="#C08A35")=>({background:"#fff",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 14px rgba(12,37,55,.10)",border:"1px solid #E4DDD3",borderTop:`3px solid ${accent}`,flex:1,minWidth:130}),
  sl:      {fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:".9px",marginBottom:4},
  sv:      {fontSize:24,fontWeight:700,color:"#0C2537",fontFamily:"Georgia,serif",lineHeight:1.1},
  ss:      {fontSize:11,color:"#828282",marginTop:3},
  // buttons
  btn:     (variant="primary")=>{
    const v={
      primary:  {background:"#C08A35",color:"#fff",border:"none"},
      navy:     {background:"#0C2537",color:"#fff",border:"none"},
      outline:  {background:"transparent",color:"#484848",border:"1px solid #CCC5B8"},
      danger:   {background:"#FEF2F2",color:"#B91C1C",border:"1px solid #FECACA"},
      green:    {background:"#F0FDF4",color:"#166534",border:"1px solid #86EFAC"},
      blue:     {background:"#EFF6FF",color:"#1D4ED8",border:"1px solid #93C5FD"},
    };
    return {display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",transition:"opacity .15s",...(v[variant]||v.primary)};
  },
  // form
  field:   {display:"flex",flexDirection:"column",gap:4,marginBottom:0},
  flabel:  {fontSize:11,fontWeight:600,color:"#484848",textTransform:"uppercase",letterSpacing:".5px",marginBottom:2},
  finput:  {padding:"9px 11px",border:"1px solid #D8D1C7",borderRadius:8,fontSize:13,color:"#1C1C1C",outline:"none",background:"#fff",width:"100%",boxSizing:"border-box"},
  // table
  th:      {padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:"#828282",textTransform:"uppercase",letterSpacing:".8px",background:"#F7F4EF",borderBottom:"1px solid #EDE8E0"},
  td:      {padding:"10px 12px",fontSize:13,color:"#484848",borderBottom:"1px solid #EDE8E0"},
  // misc
  modal:   {position:"fixed",inset:0,background:"rgba(0,0,0,.58)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16,overflowY:"auto"},
  mdBox:   (w=680)=>({background:"#fff",borderRadius:16,width:"100%",maxWidth:w,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 8px 36px rgba(12,37,55,.2)"}),
  mhead:   {padding:"16px 20px",borderBottom:"1px solid #EDE8E0",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:2},
  mfoot:   {padding:"13px 20px",borderTop:"1px solid #EDE8E0",display:"flex",justifyContent:"flex-end",gap:8,position:"sticky",bottom:0,background:"#fff"},
  mbody:   {padding:20},
  row:     {display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18},
  grid2:   {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  grid3:   {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},
  grid4:   {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12},
  pill:    (bg="#E3F2FD",color="#1565C0")=>({display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:bg,color}),
  tag:     (bg="#F3F4F6",color="#374151")=>({display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:11,fontWeight:700,background:bg,color}),
};

// ── small reusable components ─────────────────────────────────────────────────
const Btn = ({variant="primary",sm,xs,onClick,children,style={}}) => (
  <button onClick={onClick} style={{...S.btn(variant),fontSize:xs?11:sm?12:13,padding:xs?"3px 8px":sm?"5px 11px":"7px 14px",...style}}>{children}</button>
);
const Field = ({label,children,full}) => (
  <div style={{...S.field,gridColumn:full?"1/-1":"auto"}}>
    <label style={S.flabel}>{label}</label>
    {children}
  </div>
);
const Input = ({value,onChange,placeholder,type="text",disabled,style={}}) => (
  <input value={value||""} onChange={onChange} placeholder={placeholder} type={type} disabled={disabled}
    style={{...S.finput,...style}} />
);
const Select = ({value,onChange,children,style={}}) => (
  <select value={value} onChange={onChange} style={{...S.finput,...style}}>{children}</select>
);
const StageBadge = ({stage}) => {
  const c = STAGE_COLOR[stage]||{bg:"#f3f4f6",color:"#374151"};
  return <span style={{...S.pill(c.bg,c.color),whiteSpace:"nowrap"}}>{stage}</span>;
};
const StatusBadge = ({status}) => {
  const c = STATUS_COLOR[status]||{bg:"#f3f4f6",color:"#374151"};
  return <span style={S.tag(c.bg,c.color)}>{status}</span>;
};
const Avatar = ({name,size=30}) => (
  <div style={S.avatar(size)}>{initials(name)}</div>
);
const Table = ({cols,rows,empty="No data"}) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr>{cols.map((c,i)=><th key={i} style={{...S.th,textAlign:c.right?"right":"left"}}>{c.label}</th>)}</tr></thead>
      <tbody>
        {rows.length===0
          ? <tr><td colSpan={cols.length} style={{padding:32,textAlign:"center",color:"#828282",fontSize:13}}>{empty}</td></tr>
          : rows.map((r,i)=><tr key={i} style={{background:i%2===0?"#fff":"#FAFAF8"}}>{cols.map((c,j)=><td key={j} style={{...S.td,textAlign:c.right?"right":"left",fontWeight:c.bold?"700":"400"}}>{r[c.key]}</td>)}</tr>)
        }
      </tbody>
    </table>
  </div>
);

// ── amount in words ───────────────────────────────────────────────────────────
function amtWords(n) {
  const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const w=n=>{
    if(!n) return "";
    if(n<20) return a[n];
    if(n<100) return b[Math.floor(n/10)]+(n%10?" "+a[n%10]:"");
    if(n<1000) return a[Math.floor(n/100)]+" Hundred"+(n%100?" "+w(n%100):"");
    if(n<100000) return w(Math.floor(n/1000))+" Thousand"+(n%1000?" "+w(n%1000):"");
    if(n<10000000) return w(Math.floor(n/100000))+" Lakh"+(n%100000?" "+w(n%100000):"");
    return w(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+w(n%10000000):"");
  };
  return n===0?"Zero":w(Math.round(n));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]     = useState(null);
  const [tab, setTab]       = useState("crm");
  const [leads, setLeads]   = useState(INIT_LEADS);
  const [quotes, setQuotes] = useState(INIT_QUOTES);
  const [prods, setProds]   = useState(INIT_PRODUCTS);
  const [users, setUsers]   = useState(INIT_USERS);

  // modal state
  const [leadM,  setLeadM]  = useState(null);  // null | "new" | lead
  const [quoteM, setQuoteM] = useState(null);  // null | lead | existing-quote context
  const [invM,   setInvM]   = useState(null);  // null | quote
  const [prodM,  setProdM]  = useState(null);  // null | "new" | product
  const [actM,   setActM]   = useState(null);  // null | lead
  const [bulkM,  setBulkM]  = useState(false);

  if (!user) return <Login onLogin={setUser} />;

  const isSU   = user.role === ROLES.SUPER;
  const isHead = user.role === ROLES.SUPER || user.role === ROLES.HEAD;
  const isMgr  = user.role !== ROLES.REP;
  const uName  = id => users.find(u=>u.id===id)?.name || "—";

  const myLeads = isMgr ? leads : leads.filter(l=>l.assignedTo===user.id);

  const TABS = [
    {k:"crm",      l:"CRM — Leads"},
    {k:"dash",     l:"Dashboard"},
    {k:"quotes",   l:"Quotations"},
    {k:"products", l:"Product Master"},
    {k:"reports",  l:"Reports"},
    ...(isSU?[{k:"users",l:"Users"}]:[]),
  ];

  return (
    <div style={S.app}>
      {/* TOPBAR */}
      <div style={S.topbar}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:6,background:"linear-gradient(135deg,#C08A35,#1A4D69)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif"}}>B</div>
          <div>
            <div style={S.tbName}>Kurikkal Beyoncé</div>
            <div style={S.tbSub}>Sales CRM · Beyond The Concepts</div>
          </div>
        </div>
        <div style={S.tbRight}>
          <span style={S.roleBadge}>{user.role}</span>
          <div style={{display:"flex",alignItems:"center",gap:7,color:"rgba(255,255,255,.82)",fontSize:13}}>
            <Avatar name={user.name} size={30} />
            {user.name}
          </div>
          <button onClick={()=>setUser(null)} style={S.lgtBtn}>Sign out</button>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={S.tabBar}>
        {TABS.map(t=><button key={t.k} style={S.tab(tab===t.k)} onClick={()=>setTab(t.k)}>{t.l}</button>)}
      </div>

      {/* CONTENT */}
      <div style={S.main}>
        {tab==="crm"      && <CRMTab leads={myLeads} setLeads={setLeads} quotes={quotes} user={user} isMgr={isMgr} uName={uName} onNew={()=>setLeadM("new")} onEdit={setLeadM} onQuote={l=>{setQuoteM({lead:l})}} onBulk={()=>setBulkM(true)} onActivity={setActM} />}
        {tab==="dash"     && <Dashboard leads={leads} quotes={quotes} isMgr={isMgr} user={user} uName={uName} />}
        {tab==="quotes"   && <QuotesTab quotes={quotes} leads={leads} prods={prods} user={user} isMgr={isMgr} setQuotes={setQuotes} uName={uName} onInv={setInvM} onNew={()=>setQuoteM({lead:{}})} onEdit={q=>setQuoteM({lead:leads.find(l=>l.id===q.leadId)||{},existing:q})} />}
        {tab==="products" && <ProductsTab prods={prods} setProds={setProds} isMgr={isMgr} isSU={isSU} onAdd={()=>setProdM("new")} onEdit={setProdM} />}
        {tab==="reports"  && <Reports leads={leads} quotes={quotes} uName={uName} />}
        {tab==="users"    && <UsersTab users={users} setUsers={setUsers} />}
      </div>

      {/* MODALS */}
      {leadM  && <LeadModal mode={leadM} setLeads={setLeads} user={user} isMgr={isMgr} users={users} onClose={()=>setLeadM(null)} onQuote={l=>{setLeadM(null);setQuoteM({lead:l});}} />}
      {quoteM && <QuoteModal lead={quoteM.lead} existing={quoteM.existing} prods={prods} quotes={quotes} setQuotes={setQuotes} user={user} onClose={()=>setQuoteM(null)} onInv={q=>{setQuoteM(null);setInvM(q);}} />}
      {invM   && <InvoiceModal quote={invM} onClose={()=>setInvM(null)} />}
      {prodM  && <ProdModal mode={prodM} setProds={setProds} onClose={()=>setProdM(null)} />}
      {actM   && <ActivityModal lead={actM} setLeads={setLeads} user={user} onClose={()=>setActM(null)} />}
      {bulkM  && <BulkModal setLeads={setLeads} user={user} onClose={()=>setBulkM(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [sel,  setSel]  = useState(null);
  const [email,setEmail]= useState("");
  const [pw,   setPw]   = useState("");
  const [err,  setErr]  = useState("");

  const go = () => {
    const u = sel || INIT_USERS.find(u=>u.email===email && u.pw===pw);
    if (u) onLogin(u); else setErr("Invalid credentials.");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0C2537 60%,#1A4D69)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"#fff",borderRadius:16,width:400,maxWidth:"100%",boxShadow:"0 8px 36px rgba(0,0,0,.25)",overflow:"hidden"}}>
        {/* header */}
        <div style={{background:"linear-gradient(140deg,#0C2537,#1A4D69)",padding:"28px 28px 22px",textAlign:"center"}}>
          <div style={{width:64,height:64,borderRadius:12,background:"linear-gradient(135deg,#C08A35,#EDB96A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif",margin:"0 auto 14px"}}>B</div>
          <div style={{fontFamily:"Georgia,serif",color:"#fff",fontSize:22,fontWeight:700}}>Kurikkal Beyoncé</div>
          <div style={{color:"#EDB96A",fontSize:10,letterSpacing:"2.5px",textTransform:"uppercase",marginTop:2}}>Sales CRM Platform</div>
        </div>
        {/* body */}
        <div style={{padding:"22px 26px 26px"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#828282",textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Quick select user</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
            {INIT_USERS.map(u=>(
              <div key={u.id} onClick={()=>setSel(u)} style={{padding:"9px 10px",border:`1px solid ${sel?.id===u.id?"#C08A35":"#D8D1C7"}`,borderRadius:8,cursor:"pointer",background:sel?.id===u.id?"rgba(192,138,53,.08)":"#F7F4EF",transition:"all .15s"}}>
                <div style={{fontSize:12,fontWeight:600,color:sel?.id===u.id?"#C08A35":"#1C1C1C"}}>{u.name}</div>
                <div style={{fontSize:10,color:"#828282"}}>{u.role}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",fontSize:11,color:"#aaa",marginBottom:14}}>— or enter credentials —</div>
          {err && <div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#B91C1C",padding:"8px 11px",borderRadius:7,fontSize:12,marginBottom:12}}>{err}</div>}
          <div style={{marginBottom:10}}>
            <div style={S.flabel}>Email</div>
            <Input value={email} onChange={e=>{setEmail(e.target.value);setSel(null);}} placeholder="user@beyonce.in" />
          </div>
          <div style={{marginBottom:18}}>
            <div style={S.flabel}>Password</div>
            <Input type="password" value={pw} onChange={e=>{setPw(e.target.value);setSel(null);}} placeholder="Password" />
          </div>
          <button onClick={go} style={{...S.btn("primary"),width:"100%",justifyContent:"center",padding:"10px 0",fontSize:14}}>Sign In →</button>
          <div style={{marginTop:12,fontSize:11,color:"#aaa",textAlign:"center"}}>Demo: select any user above or use admin@beyonce.in / admin123</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRM TAB
// ═══════════════════════════════════════════════════════════════════════════════
function CRMTab({ leads, setLeads, quotes, user, isMgr, uName, onNew, onEdit, onQuote, onBulk, onActivity }) {
  const [q,   setQ]   = useState("");
  const [stg, setStg] = useState("");
  const [src, setSrc] = useState("");

  const filtered = leads.filter(l => {
    const s=q.toLowerCase();
    return (!q||l.name.toLowerCase().includes(s)||(l.company||"").toLowerCase().includes(s)||l.city.toLowerCase().includes(s)||l.id.includes(q.toUpperCase()))
      && (!stg||l.stage===stg)
      && (!src||l.source===src);
  });

  const accentOf = s => s==="Won"?"#166534":s==="Lost"?"#B91C1C":s==="Negotiation"?"#7E22CE":"#0C2537";

  return (
    <div>
      <div style={S.row}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>CRM — Lead Pipeline</h1>
          <p style={{fontSize:13,color:"#828282"}}>Track every enquiry from first contact to order confirmation</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {isMgr && <Btn variant="outline" sm onClick={onBulk}>↑ Bulk Upload</Btn>}
          <Btn onClick={onNew}>+ New Lead</Btn>
        </div>
      </div>

      {/* Stage pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {STAGES.map(s=>{
          const cnt=leads.filter(l=>l.stage===s).length;
          const active=stg===s;
          return (
            <div key={s} onClick={()=>setStg(active?"":s)} style={{padding:"8px 14px",borderRadius:10,cursor:"pointer",background:active?accentOf(s):"#fff",color:active?"#fff":accentOf(s),border:`2px solid ${accentOf(s)}`,fontSize:12,fontWeight:600,transition:"all .15s",userSelect:"none"}}>
              {s} <span style={{fontSize:15,fontWeight:700,marginLeft:4}}>{cnt}</span>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",background:"#fff",border:"1px solid #D8D1C7",borderRadius:8,padding:"0 11px",gap:7}}>
          <span style={{color:"#aaa",fontSize:14}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, company, city, ID..." style={{border:"none",outline:"none",fontSize:13,padding:"8px 0",width:"100%",background:"transparent"}} />
        </div>
        <Select value={stg} onChange={e=>setStg(e.target.value)} style={{width:160}}>
          <option value="">All Stages</option>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </Select>
        <Select value={src} onChange={e=>setSrc(e.target.value)} style={{width:170}}>
          <option value="">All Sources</option>
          {SOURCES.map(s=><option key={s}>{s}</option>)}
        </Select>
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={{...S.ch,paddingBottom:10}}>
          <span style={S.chTitle}>
            Leads &nbsp;
            <span style={{background:"#C08A35",color:"#fff",borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:700}}>{filtered.length}</span>
          </span>
          <span style={{fontSize:12,color:"#828282"}}>Pipeline: <strong style={{color:"#0C2537"}}>{fmtL(filtered.reduce((s,l)=>s+(l.value||0),0))}</strong></span>
        </div>
        <Table
          cols={[
            {key:"_id",    label:"ID"},
            {key:"_name",  label:"Client"},
            {key:"_proj",  label:"Project"},
            {key:"_src",   label:"Source"},
            {key:"_stage", label:"Stage"},
            {key:"_val",   label:"Value", right:true, bold:true},
            {key:"_asgn",  label:"Assigned"},
            {key:"_date",  label:"Date"},
            {key:"_act",   label:"Actions"},
          ]}
          rows={filtered.map(l=>({
            _id:    <span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>{l.id}</span>,
            _name:  <div><div style={{fontWeight:600,color:"#1C1C1C"}}>{l.name}</div>{l.company&&<div style={{fontSize:11,color:"#828282"}}>{l.company}</div>}<div style={{fontSize:11,color:"#828282"}}>📍 {l.city}</div></div>,
            _proj:  <div style={{fontSize:12,maxWidth:150}}>{l.project}</div>,
            _src:   <span style={{...S.pill("#E3F2FD","#1565C0")}}>{l.source}</span>,
            _stage: <StageBadge stage={l.stage} />,
            _val:   <span style={{color:"#0C2537"}}>{fmtL(l.value)}</span>,
            _asgn:  <div style={{display:"flex",alignItems:"center",gap:5}}><Avatar name={uName(l.assignedTo)} size={22}/><span style={{fontSize:11}}>{uName(l.assignedTo).split(" ")[0]}</span></div>,
            _date:  <span style={{fontSize:11,color:"#828282"}}>{l.createdAt}</span>,
            _act:   <div style={{display:"flex",gap:4}}>
                      <Btn variant="outline" xs onClick={()=>onEdit(l)}>Edit</Btn>
                      <Btn variant="navy" xs onClick={()=>onQuote(l)}>+ Quote</Btn>
                      <Btn variant="outline" xs onClick={()=>onActivity(l)}>📋</Btn>
                    </div>,
          }))}
          empty="No leads match your filters"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEAD MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function LeadModal({ mode, setLeads, user, isMgr, users, onClose, onQuote }) {
  const isEdit = mode !== "new";
  const [f, setF] = useState(isEdit ? {...mode} : {
    name:"", company:"", phone:"", email:"", source:"Walk-in", stage:"New Lead",
    assignedTo:user.id, value:"", city:"", project:"", notes:""
  });
  const s=(k,v)=>setF(p=>({...p,[k]:v}));

  const save = () => {
    if (!f.name||!f.phone) return alert("Name and phone required.");
    const lead = {...f, value:parseFloat(f.value)||0};
    if (isEdit) {
      setLeads(ls=>ls.map(l=>l.id===f.id?lead:l));
    } else {
      setLeads(ls=>[...ls,{...lead,id:"L"+uid(),createdAt:todayStr(),activity:[{date:todayStr(),by:user.id,text:`Lead created — source: ${f.source}`}]}]);
    }
    onClose();
  };

  const reps = users.filter(u=>[ROLES.REP,ROLES.COORD].includes(u.role));

  return (
    <div style={S.modal}>
      <div style={S.mdBox(680)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{isEdit?`Edit — ${f.name}`:"New Lead"}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          <div style={{...S.grid2,marginBottom:0}}>
            <Field label="Full Name *"><Input value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Client / contact name" /></Field>
            <Field label="Company / Builder"><Input value={f.company} onChange={e=>s("company",e.target.value)} /></Field>
            <Field label="Phone *"><Input value={f.phone} onChange={e=>s("phone",e.target.value)} /></Field>
            <Field label="Email"><Input value={f.email} onChange={e=>s("email",e.target.value)} /></Field>
            <Field label="City"><Input value={f.city} onChange={e=>s("city",e.target.value)} /></Field>
            <Field label="Source"><Select value={f.source} onChange={e=>s("source",e.target.value)}>{SOURCES.map(x=><option key={x}>{x}</option>)}</Select></Field>
            <Field label="Stage"><Select value={f.stage} onChange={e=>s("stage",e.target.value)}>{STAGES.map(x=><option key={x}>{x}</option>)}</Select></Field>
            <Field label="Estimated Value (₹)"><Input type="number" value={f.value} onChange={e=>s("value",e.target.value)} placeholder="e.g. 85000" /></Field>
            {isMgr && <Field label="Assign To"><Select value={f.assignedTo} onChange={e=>s("assignedTo",parseInt(e.target.value))}>{reps.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</Select></Field>}
            <Field label="Project Description" full><Input value={f.project} onChange={e=>s("project",e.target.value)} placeholder="e.g. 3BHK villa — 3 bathrooms" /></Field>
            <Field label="Notes" full><textarea value={f.notes} onChange={e=>s("notes",e.target.value)} style={{...S.finput,minHeight:65,resize:"vertical"}} /></Field>
          </div>
        </div>
        <div style={S.mfoot}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          {isEdit && <Btn variant="blue" onClick={()=>onQuote(f)}>Create Quotation</Btn>}
          <Btn onClick={save}>{isEdit?"Save Changes":"Create Lead"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ActivityModal({ lead, setLeads, user, onClose }) {
  const [note, setNote] = useState("");
  const addNote = () => {
    if (!note.trim()) return;
    setLeads(ls=>ls.map(l=>l.id===lead.id?{...l,activity:[...(l.activity||[]),{date:todayStr(),by:user.id,text:note.trim()}]}:l));
    setNote(""); onClose();
  };
  const acts = [...(lead.activity||[])].reverse();
  return (
    <div style={S.modal}>
      <div style={S.mdBox(560)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>Activity — {lead.name}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <div style={{flex:1}}>
              <Field label="Add Note / Update"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Called client — confirmed site visit Monday..." style={{...S.finput,minHeight:55,resize:"vertical"}} /></Field>
            </div>
            <Btn onClick={addNote} style={{marginTop:18,alignSelf:"flex-start"}}>Add</Btn>
          </div>
          <div style={{fontSize:11,fontWeight:600,color:"#828282",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>Timeline</div>
          {acts.length===0
            ? <div style={{textAlign:"center",padding:24,color:"#aaa"}}>No activity yet</div>
            : <div style={{position:"relative",paddingLeft:20}}>
                <div style={{position:"absolute",left:6,top:0,bottom:0,width:2,background:"#EDE8E0",borderRadius:1}} />
                {acts.map((a,i)=>(
                  <div key={i} style={{position:"relative",marginBottom:14}}>
                    <div style={{position:"absolute",left:-17,top:4,width:8,height:8,borderRadius:"50%",background:"#C08A35",border:"2px solid #fff",boxShadow:"0 0 0 1px #C08A35"}} />
                    <div style={{fontSize:10,color:"#aaa",marginBottom:1}}>{a.date}</div>
                    <div style={{fontSize:13,color:"#484848"}}>{a.text}</div>
                    <div style={{fontSize:10,color:"#2B7BA0",fontWeight:500}}>— {lead.activity ? (INIT_USERS.find(u=>u.id===a.by)?.name||"—") : "—"}</div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// BULK UPLOAD MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function BulkModal({ setLeads, user, onClose }) {
  const [step, setStep] = useState(0);
  const sample = [
    {name:"Harish Nambiar",company:"HN Builders",phone:"9876000001",source:"Walk-in",   stage:"New Lead",  value:95000, city:"Kochi",   project:"Apartment 2BHK"},
    {name:"Lekha Varghese",company:"",            phone:"9876000002",source:"Phone",    stage:"Contacted", value:42000, city:"Palakkad",project:"Home renovation"},
    {name:"Sunil Thomas",  company:"Royal Infra", phone:"9876000003",source:"Email",    stage:"New Lead",  value:280000,city:"Thrissur",project:"Commercial complex"},
    {name:"Ajith Kumar",   company:"AJ Homes",    phone:"9876000004",source:"WhatsApp", stage:"New Lead",  value:65000, city:"Kottayam",project:"Villa bathrooms"},
  ];
  const confirm = () => {
    setLeads(ls=>[...ls,...sample.map(r=>({...r,id:"L"+uid(),email:"",notes:"Bulk imported",assignedTo:user.id,createdAt:todayStr(),activity:[{date:todayStr(),by:user.id,text:"Imported via bulk upload"}]}))]);
    onClose();
  };
  return (
    <div style={S.modal}>
      <div style={S.mdBox(800)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>Bulk Lead Upload</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          {step===0 && (
            <>
              <div style={{border:"2px dashed #D8D1C7",borderRadius:10,padding:28,textAlign:"center",background:"#F7F4EF",marginBottom:16}}>
                <div style={{fontSize:28,marginBottom:8}}>📂</div>
                <div style={{fontSize:14,fontWeight:600,color:"#484848"}}>Upload Excel or CSV file</div>
                <div style={{fontSize:12,color:"#828282",marginTop:4}}>Required columns: Name, Phone · Optional: Company, Email, Source, Stage, Value, City, Project</div>
                <Btn style={{marginTop:14}} onClick={()=>setStep(1)}>Load Sample Data (Demo)</Btn>
              </div>
              <div style={{background:"#F7F4EF",borderRadius:8,padding:12,fontSize:12,color:"#828282",lineHeight:1.9}}>
                <strong style={{color:"#0C2537"}}>Valid Stages:</strong> {STAGES.join(", ")}<br/>
                <strong style={{color:"#0C2537"}}>Valid Sources:</strong> {SOURCES.join(", ")}
              </div>
            </>
          )}
          {step===1 && (
            <>
              <div style={{marginBottom:12,fontSize:13}}><strong style={{color:"#166534"}}>✓ {sample.length} records</strong> ready to import:</div>
              <Table
                cols={[
                  {key:"name",label:"Name"},{key:"phone",label:"Phone"},{key:"company",label:"Company"},
                  {key:"_src",label:"Source"},{key:"_stg",label:"Stage"},{key:"_val",label:"Value",right:true},{key:"city",label:"City"},
                ]}
                rows={sample.map(r=>({...r,_src:<span style={S.pill("#E3F2FD","#1565C0")}>{r.source}</span>,_stg:<StageBadge stage={r.stage}/>,_val:<span style={{fontWeight:700,color:"#0C2537"}}>{fmt(r.value)}</span>}))}
              />
            </>
          )}
        </div>
        <div style={S.mfoot}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          {step===1 && <Btn variant="outline" onClick={()=>setStep(0)}>← Back</Btn>}
          {step===1 && <Btn onClick={confirm}>Import {sample.length} Leads</Btn>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function QuotesTab({ quotes, leads, prods, user, isMgr, setQuotes, uName, onInv, onNew, onEdit }) {
  const [q, setQ] = useState("");
  const [sf, setSf] = useState("");
  const filtered = quotes.filter(x=>(!q||x.leadName.toLowerCase().includes(q.toLowerCase())||x.id.includes(q.toUpperCase()))&&(!sf||x.status===sf));
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
        <Select value={sf} onChange={e=>setSf(e.target.value)} style={{width:160}}>
          <option value="">All Status</option>
          {["Draft","Sent","Under Review","Accepted","Rejected"].map(s=><option key={s}>{s}</option>)}
        </Select>
      </div>
      <div style={S.card}>
        <Table
          cols={[
            {key:"_id",label:"Quote #"},{key:"_name",label:"Client"},{key:"date",label:"Date"},
            {key:"_sub",label:"Subtotal",right:true},{key:"_disc",label:"Disc%",right:true},
            {key:"_net",label:"Net",right:true},{key:"_gst",label:"GST 18%",right:true},
            {key:"_tot",label:"Grand Total",right:true,bold:true},
            {key:"_st",label:"Status"},{key:"_by",label:"By"},{key:"_act",label:"Actions"},
          ]}
          rows={filtered.map(qt=>{
            const gst=Math.round(qt.total*.18);
            return {
              _id:  <span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>{qt.id}</span>,
              _name:<span style={{fontWeight:600}}>{qt.leadName}</span>,
              date: <span style={{fontSize:11,color:"#828282"}}>{qt.date}</span>,
              _sub: fmt(qt.subtotal),
              _disc:<span style={{color:"#C2590A"}}>{qt.discount}%</span>,
              _net: fmt(qt.total),
              _gst: <span style={{color:"#828282"}}>{fmt(gst)}</span>,
              _tot: <span style={{color:"#0C2537"}}>{fmt(qt.total+gst)}</span>,
              _st:  <StatusBadge status={qt.status} />,
              _by:  <span style={{fontSize:11}}>{uName(qt.createdBy).split(" ")[0]}</span>,
              _act: <div style={{display:"flex",gap:4}}>
                      <Btn variant="outline" xs onClick={()=>onEdit(qt)}>Edit</Btn>
                      <Btn variant="navy" xs onClick={()=>onInv(qt)}>Invoice</Btn>
                    </div>,
            };
          })}
          empty="No quotations yet. Create one from a lead."
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function QuoteModal({ lead, existing, prods, quotes, setQuotes, user, onClose, onInv }) {
  const ex = existing;
  const [cName,  setCName]  = useState(ex?.leadName      || lead?.name    || "");
  const [cPhone, setCPhone] = useState(ex?.clientPhone   || lead?.phone   || "");
  const [cProj,  setCProj]  = useState(ex?.clientProject || lead?.project || "");
  const [disc,   setDisc]   = useState(ex?.discount ?? 0);
  const [status, setStatus] = useState(ex?.status  || "Draft");
  const [showWA, setShowWA] = useState(false);
  const [items, setItems]   = useState(
    ex?.items?.length ? ex.items
    : [{id:uid(),productId:"",customName:"",qty:1,masterPrice:0,clientPrice:0,unit:"Nos",isCustom:false}]
  );

  const addItem = () => setItems(i=>[...i,{id:uid(),productId:"",customName:"",qty:1,masterPrice:0,clientPrice:0,unit:"Nos",isCustom:false}]);
  const delItem = id => setItems(i=>i.filter(x=>x.id!==id));
  const upd = (id,k,v) => setItems(items=>items.map(item=>{
    if (item.id!==id) return item;
    let u={...item,[k]:v};
    if (k==="productId") {
      if (v==="__other__") { u.isCustom=true; u.masterPrice=0; u.clientPrice=0; }
      else { const p=prods.find(p=>p.id===v); if(p){u.isCustom=false;u.masterPrice=p.masterPrice;u.clientPrice=p.masterPrice;u.unit=p.unit;} }
    }
    return u;
  }));

  const sub   = items.reduce((s,i)=>s+(parseFloat(i.clientPrice)||0)*(parseFloat(i.qty)||0),0);
  const dAmt  = sub*(parseFloat(disc)||0)/100;
  const net   = sub-dAmt;
  const gst   = Math.round(net*.18);
  const grand = net+gst;

  const buildQuote = () => ({
    id:ex?ex.id:"Q"+uid(), leadId:lead?.id||"", leadName:cName,
    clientPhone:cPhone, clientProject:cProj,
    date:ex?ex.date:todayStr(), status,
    subtotal:Math.round(sub), discount:parseFloat(disc)||0, total:Math.round(net),
    createdBy:user.id, items,
  });

  const save = (andClose=true) => {
    if (!cName) return alert("Client name required.");
    const q=buildQuote();
    if (ex) setQuotes(qs=>qs.map(x=>x.id===q.id?q:x)); else setQuotes(qs=>[...qs,q]);
    if (andClose) onClose();
    return q;
  };

  const waText = `*Kurikkal Beyoncé — Quotation*\n\nDear ${cName},\n\n`+
    items.filter(i=>i.qty>0&&i.clientPrice>0).map((i,n)=>{
      const nm=i.customName||prods.find(p=>p.id===i.productId)?.name||"Item";
      return `${n+1}. ${nm} × ${i.qty} = ${fmt((i.clientPrice||0)*(i.qty||0))}`;
    }).join("\n")+
    `\n\nSubtotal: ${fmt(sub)}\nDiscount (${disc}%): -${fmt(dAmt)}\nNet: ${fmt(net)}\nGST 18%: ${fmt(gst)}\n*Grand Total: ${fmt(grand)}*\n\nKurikkal Beyoncé | Beyond The Concepts\n📞 +91 99XXXXXXXX`;

  const thStyle={padding:"7px 8px",textAlign:"left",fontSize:10,color:"#828282",background:"#F7F4EF",fontWeight:600,textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #EDE8E0"};
  const tdStyle={padding:"5px 5px",borderBottom:"1px solid #F0EBE3"};
  const qInput={padding:"6px 8px",border:"1px solid #D8D1C7",borderRadius:6,fontSize:12,outline:"none",background:"#fff",width:"100%"};

  return (
    <div style={S.modal}>
      <div style={S.mdBox(1050)}>
        <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{ex?`Quotation — ${ex.id}`:"Create Quotation"}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        <div style={S.mbody}>
          {/* Client info */}
          <div style={{...S.grid3,marginBottom:16}}>
            <Field label="Client Name *"><Input value={cName} onChange={e=>setCName(e.target.value)} /></Field>
            <Field label="Phone"><Input value={cPhone} onChange={e=>setCPhone(e.target.value)} /></Field>
            <Field label="Project"><Input value={cProj} onChange={e=>setCProj(e.target.value)} /></Field>
          </div>

          {/* Line items */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:600,color:"#0C2537"}}>Line Items</div>
            <Btn variant="outline" sm onClick={addItem}>+ Add Item</Btn>
          </div>
          <div style={{overflowX:"auto",marginBottom:16}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr>
                <th style={{...thStyle,width:24}}>#</th>
                <th style={{...thStyle,minWidth:200}}>Product / Description</th>
                <th style={{...thStyle,width:60}}>Qty</th>
                <th style={{...thStyle,width:65}}>Unit</th>
                <th style={{...thStyle,width:110}}>Master Rate (₹)</th>
                <th style={{...thStyle,width:120}}>Client Rate (₹)</th>
                <th style={{...thStyle,width:100,textAlign:"right"}}>Total</th>
                <th style={{...thStyle,width:30}}></th>
              </tr></thead>
              <tbody>
                {items.map((item,i)=>{
                  const prod=prods.find(p=>p.id===item.productId);
                  const discounted=parseFloat(item.clientPrice)<parseFloat(item.masterPrice);
                  return (
                    <tr key={item.id}>
                      <td style={{...tdStyle,textAlign:"center",color:"#aaa"}}>{i+1}</td>
                      <td style={tdStyle}>
                        {item.isCustom
                          ? <div style={{display:"flex",gap:4}}><input value={item.customName} onChange={e=>upd(item.id,"customName",e.target.value)} placeholder="Custom description" style={{...qInput,flex:1}} /><button onClick={()=>upd(item.id,"productId","")} style={{...S.btn("outline"),fontSize:10,padding:"3px 7px"}}>↩</button></div>
                          : <select value={item.productId} onChange={e=>upd(item.id,"productId",e.target.value)} style={qInput}>
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
                      <td style={tdStyle}><input type="number" min=".01" step=".01" value={item.qty} onChange={e=>upd(item.id,"qty",e.target.value)} style={qInput} /></td>
                      <td style={tdStyle}>{prod&&!item.isCustom?<span style={{padding:"6px 0",display:"block",color:"#828282"}}>{prod.unit}</span>:<input value={item.unit||"Nos"} onChange={e=>upd(item.id,"unit",e.target.value)} style={qInput} />}</td>
                      <td style={tdStyle}><input type="number" value={item.masterPrice} onChange={e=>upd(item.id,"masterPrice",e.target.value)} style={{...qInput,background:"#F7F4EF",color:"#828282"}} /></td>
                      <td style={tdStyle}><input type="number" value={item.clientPrice} onChange={e=>upd(item.id,"clientPrice",e.target.value)} style={{...qInput,borderColor:discounted?"#FCA5A5":""}} /></td>
                      <td style={{...tdStyle,textAlign:"right",fontWeight:700,color:"#0C2537"}}>
                        {fmt((item.clientPrice||0)*(item.qty||0))}
                        {discounted&&<div style={{fontSize:9,color:"#C2590A"}}>Discounted</div>}
                      </td>
                      <td style={tdStyle}><button onClick={()=>delItem(item.id)} style={{...S.btn("danger"),padding:"3px 7px",fontSize:11}}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals + controls */}
          <div style={{display:"flex",gap:14,alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
              <Field label="Discount %"><input type="number" min="0" max="100" step=".5" value={disc} onChange={e=>setDisc(e.target.value)} style={{...S.finput,width:110}} /></Field>
              <Field label="Status"><Select value={status} onChange={e=>setStatus(e.target.value)} style={{width:150}}>{["Draft","Sent","Under Review","Accepted","Rejected"].map(s=><option key={s}>{s}</option>)}</Select></Field>
              <Btn variant="green" sm onClick={()=>setShowWA(!showWA)} style={{marginBottom:2}}>💬 WhatsApp</Btn>
            </div>
            <div style={{background:"#F7F4EF",borderRadius:10,padding:"13px 16px",border:"1px solid #E4DDD3",minWidth:260}}>
              {[["Subtotal",fmt(sub)],["Discount ("+disc+"%)",`− ${fmt(dAmt)}`],["Net Amount",fmt(net)],["CGST 9%",fmt(Math.round(net*.09))],["SGST 9%",fmt(Math.round(net*.09))],["Grand Total (incl. GST)",fmt(grand)]].map(([l,v],i)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:i===5?14:13,fontWeight:i===5?700:400,color:i===5?"#0C2537":"#484848",padding:"3px 0",borderTop:i===5?"1px solid #E4DDD3":"none",marginTop:i===5?4:0}}>
                  <span>{l}</span><span style={{color:i===1?"#C2590A":""}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp preview */}
          {showWA && (
            <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:10,padding:14,marginTop:14}}>
              <div style={{fontSize:11,color:"#1B5E20",fontWeight:600,marginBottom:4}}>💬 WhatsApp Preview</div>
              <pre style={{fontSize:12,color:"#2E7D32",whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{waText}</pre>
              <Btn variant="green" sm style={{marginTop:8}} onClick={()=>{ if(cPhone) window.open(`https://wa.me/91${cPhone.replace(/\D/g,"")}?text=${encodeURIComponent(waText)}`,"_blank"); else alert("Add client phone to send via WhatsApp."); }}>Open in WhatsApp ↗</Btn>
            </div>
          )}
        </div>
        <div style={S.mfoot}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="outline" onClick={()=>save(true)}>Save</Btn>
          <Btn variant="navy" onClick={()=>{const q=buildQuote();if(!cName){alert("Client name required.");return;}if(ex)setQuotes(qs=>qs.map(x=>x.id===q.id?q:x));else setQuotes(qs=>[...qs,q]);onInv(q);}}>Save & Invoice</Btn>
          <Btn onClick={()=>save(true)}>Save & Close</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVOICE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function InvoiceModal({ quote:qt, onClose }) {
  const gst=Math.round(qt.total*.18), grand=qt.total+gst;
  const isInv=qt.status==="Accepted";
  const trow=(l,v,bold)=><div style={{display:"flex",justifyContent:"space-between",padding:"6px 12px",fontSize:bold?13:12,fontWeight:bold?"700":"400",color:bold?"#0C2537":"#484848",borderBottom:bold?"none":"1px solid #EDE8E0",background:bold?"#F7F4EF":"#fff"}}><span>{l}</span><span>{v}</span></div>;
  return (
    <div style={{...S.modal,alignItems:"flex-start",paddingTop:30}}>
      <div style={S.mdBox(820)}>
        <div style={S.mhead}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{isInv?"Tax Invoice":"Quotation"} — {qt.id}</h2>
          <div style={{display:"flex",gap:8}}><Btn variant="outline" sm onClick={()=>window.print()}>🖨️ Print</Btn><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
        </div>
        <div style={S.mbody}>
          <div style={{background:"#fff",padding:"28px 32px",border:"1px solid #E4DDD3",borderRadius:8,fontFamily:"'DM Sans',sans-serif"}}>
            {/* Header */}
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
                <div><strong>{isInv?"Invoice":"Quote"} No:</strong> {isInv?"INV-":"QT-"}{qt.id}</div>
                <div><strong>Date:</strong> {todayStr()}</div>
                <div><strong>Valid:</strong> 30 days</div>
                <div><StatusBadge status={qt.status} /></div>
              </div>
            </div>
            <div style={{height:3,background:"linear-gradient(90deg,#0C2537 60%,#C08A35)",borderRadius:2,marginBottom:16}} />
            <div style={{fontFamily:"Georgia,serif",fontSize:22,color:"#C08A35",fontWeight:700,marginBottom:14}}>{isInv?"TAX INVOICE":"QUOTATION"}</div>
            {/* Parties */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,background:"#F7F4EF",padding:14,borderRadius:10,marginBottom:16,fontSize:12}}>
              <div><div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>Bill To</div><p style={{lineHeight:1.7,color:"#484848"}}><strong>{qt.leadName}</strong><br/>{qt.clientPhone||""}<br/>{qt.clientProject||"—"}</p></div>
              <div><div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>From</div><p style={{lineHeight:1.7,color:"#484848"}}><strong>Kurikkal Beyoncé</strong><br/>Plumbing & Sanitaryware<br/>Kochi, Kerala — 682 001<br/>enquiry@kurikkalbeyonce.in</p></div>
            </div>
            {/* Items */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14,fontSize:12}}>
              <thead><tr style={{background:"#0C2537",color:"#fff"}}>
                {["#","Description","Qty","Unit","Master Rate","Client Rate","Amount"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:h==="Amount"?"right":"left",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {qt.items&&qt.items.length>0
                  ? qt.items.map((it,i)=>{
                      const prod=INIT_PRODUCTS.find(p=>p.id===it.productId);
                      return <tr key={i} style={{background:i%2===0?"#fff":"#F7F4EF"}}>
                        <td style={{padding:"8px 10px"}}>{i+1}</td>
                        <td style={{padding:"8px 10px",fontWeight:500}}>{it.customName||prod?.name||"—"}</td>
                        <td style={{padding:"8px 10px"}}>{it.qty}</td>
                        <td style={{padding:"8px 10px"}}>{it.unit||prod?.unit||"Nos"}</td>
                        <td style={{padding:"8px 10px",color:"#828282"}}>{fmt(it.masterPrice||0)}</td>
                        <td style={{padding:"8px 10px"}}>{fmt(it.clientPrice||0)}</td>
                        <td style={{padding:"8px 10px",fontWeight:700,textAlign:"right"}}>{fmt((it.clientPrice||0)*(it.qty||0))}</td>
                      </tr>;
                    })
                  : <tr><td colSpan={7} style={{padding:20,textAlign:"center",color:"#aaa",fontStyle:"italic"}}>Open quote editor to add line items</td></tr>
                }
              </tbody>
            </table>
            {/* Totals */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <div style={{width:270,border:"1px solid #E4DDD3",borderRadius:10,overflow:"hidden"}}>
                {trow("Subtotal",fmt(qt.subtotal))}
                {trow(`Discount (${qt.discount}%)`,`− ${fmt(Math.round(qt.subtotal*qt.discount/100))}`)}
                {trow("Net Amount",fmt(qt.total))}
                {trow("CGST @ 9%",fmt(Math.round(qt.total*.09)))}
                {trow("SGST @ 9%",fmt(Math.round(qt.total*.09)))}
                {trow("Grand Total",fmt(grand),true)}
              </div>
            </div>
            {/* Amount in words */}
            <div style={{fontSize:11,background:"#F7F4EF",borderRadius:8,padding:"8px 12px",marginBottom:14,border:"1px solid #E4DDD3"}}>
              <strong>Amount in Words:</strong> Rupees {amtWords(grand)} Only
            </div>
            {/* Terms */}
            <div style={{fontSize:11,color:"#828282",lineHeight:1.9,marginBottom:20}}>
              <strong style={{color:"#0C2537",display:"block",marginBottom:3}}>Terms & Conditions</strong>
              1. Payment due within 30 days of invoice date.<br/>
              2. Goods once dispatched will not be accepted back without prior written approval.<br/>
              3. Installation charges not included unless explicitly specified.<br/>
              4. All disputes subject to Ernakulam jurisdiction. E&OE.
            </div>
            {/* Footer */}
            <div style={{background:"#0C2537",color:"#fff",padding:12,borderRadius:10,textAlign:"center",fontSize:11,lineHeight:1.9}}>
              <strong style={{color:"#EDB96A"}}>Kurikkal Beyoncé — Beyond The Concepts</strong><br/>
              Plumbing, Sanitaryware, CP Fittings &amp; Allied Products | Kochi, Kerala<br/>
              📞 +91 99XXXXXXXX &nbsp;|&nbsp; ✉ enquiry@kurikkalbeyonce.in &nbsp;|&nbsp; 🌐 www.kurikkalbeyonce.in
            </div>
          </div>
        </div>
        <div style={S.mfoot}><Btn variant="outline" onClick={onClose}>Close</Btn><Btn onClick={()=>window.print()}>🖨️ Print / PDF</Btn></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsTab({ prods, setProds, isMgr, isSU, onAdd, onEdit }) {
  const [q, setQ]   = useState("");
  const [cat,setCat]= useState("");
  const [brnd,setBrnd]=useState("");
  const brands=[...new Set(prods.map(p=>p.brand))].sort();
  const filtered=prods.filter(p=>(!q||p.name.toLowerCase().includes(q.toLowerCase())||p.brand.toLowerCase().includes(q.toLowerCase())||p.id.toLowerCase().includes(q.toLowerCase()))&&(!cat||p.category===cat)&&(!brnd||p.brand===brnd));
  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Product Master</h1><p style={{fontSize:13,color:"#828282"}}>{prods.length} SKUs in catalogue</p></div>
        <div style={{display:"flex",gap:8}}>
          {isMgr&&<Btn variant="outline" sm onClick={()=>alert("Upload .xlsx with columns: Code, Name, Category, Brand, Unit, MasterPrice")}>↑ Excel Upload</Btn>}
          {isMgr&&<Btn onClick={onAdd}>+ Add Product</Btn>}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180,display:"flex",alignItems:"center",background:"#fff",border:"1px solid #D8D1C7",borderRadius:8,padding:"0 11px",gap:7}}>
          <span style={{color:"#aaa"}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, brand, code..." style={{border:"none",outline:"none",fontSize:13,padding:"8px 0",width:"100%"}} />
        </div>
        <Select value={cat} onChange={e=>setCat(e.target.value)} style={{width:155}}><option value="">All Categories</option>{CATS.map(c=><option key={c}>{c}</option>)}</Select>
        <Select value={brnd} onChange={e=>setBrnd(e.target.value)} style={{width:140}}><option value="">All Brands</option>{brands.map(b=><option key={b}>{b}</option>)}</Select>
      </div>
      <div style={S.card}>
        <Table
          cols={[
            {key:"_id",label:"Code"},{key:"_name",label:"Product Name"},{key:"_cat",label:"Category"},
            {key:"brand",label:"Brand"},{key:"unit",label:"Unit"},{key:"_price",label:"Master Price",right:true,bold:true},
            ...(isMgr?[{key:"_act",label:"Actions"}]:[]),
          ]}
          rows={filtered.map(p=>({
            _id:   <span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>{p.id}</span>,
            _name: <span style={{fontWeight:500}}>{p.name}</span>,
            _cat:  <span style={{...S.pill("#E0F2F1","#00695C")}}>{p.category}</span>,
            brand: p.brand, unit:p.unit,
            _price:<span style={{color:"#0C2537"}}>{fmt(p.masterPrice)}</span>,
            _act:  <div style={{display:"flex",gap:4}}>
                     <Btn variant="outline" xs onClick={()=>onEdit(p)}>Edit</Btn>
                     {isSU&&<Btn variant="danger" xs onClick={()=>{if(window.confirm(`Delete ${p.name}?`))setProds(ps=>ps.filter(x=>x.id!==p.id));}}>Del</Btn>}
                   </div>,
          }))}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ProdModal({ mode, setProds, onClose }) {
  const isEdit=mode!=="new";
  const [f,setF]=useState(isEdit?{...mode}:{id:"",name:"",category:"CP Fittings",brand:"",unit:"Nos",masterPrice:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.name||!f.masterPrice) return alert("Name and price required.");
    if(isEdit) setProds(ps=>ps.map(p=>p.id===f.id?{...f,masterPrice:parseFloat(f.masterPrice)}:p));
    else setProds(ps=>[...ps,{...f,id:"P"+uid(),masterPrice:parseFloat(f.masterPrice)}]);
    onClose();
  };
  return (
    <div style={S.modal}><div style={S.mdBox(480)}>
      <div style={S.mhead}><h2 style={{fontFamily:"Georgia,serif",fontSize:17,color:"#0C2537"}}>{isEdit?"Edit Product":"Add Product"}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#828282",cursor:"pointer"}}>✕</button></div>
      <div style={S.mbody}>
        <div style={S.grid2}>
          <Field label="Code"><Input value={f.id} onChange={e=>s("id",e.target.value)} disabled={isEdit} placeholder="e.g. P016" /></Field>
          <Field label="Brand"><Input value={f.brand} onChange={e=>s("brand",e.target.value)} /></Field>
          <Field label="Name *" full><Input value={f.name} onChange={e=>s("name",e.target.value)} /></Field>
          <Field label="Category"><Select value={f.category} onChange={e=>s("category",e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</Select></Field>
          <Field label="Unit"><Select value={f.unit} onChange={e=>s("unit",e.target.value)}>{["Nos","Set","Mtr","Rmt","Sqft","Box","Lot","Kg"].map(u=><option key={u}>{u}</option>)}</Select></Field>
          <Field label="Master Price (₹) *" full><Input type="number" value={f.masterPrice} onChange={e=>s("masterPrice",e.target.value)} /></Field>
        </div>
      </div>
      <div style={S.mfoot}><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn onClick={save}>Save Product</Btn></div>
    </div></div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
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
  const repIds=[...new Set(leads.map(l=>l.assignedTo))];
  const repData=repIds.map(id=>({name:uName(id),n:leads.filter(l=>l.assignedTo===id).length,won:leads.filter(l=>l.assignedTo===id&&l.stage==="Won").length,v:leads.filter(l=>l.assignedTo===id).reduce((s,l)=>s+(l.value||0),0)})).sort((a,b)=>b.v-a.v);
  const cities=[...new Set(leads.map(l=>l.city).filter(Boolean))];

  return (
    <div>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Dashboard</h1>
      <p style={{fontSize:13,color:"#828282",marginBottom:18}}>Live pipeline &amp; performance overview</p>

      {/* KPI row */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
        {[
          {l:"Pipeline Value",  v:fmtL(tv),     accent:"#2B7BA0"},
          {l:"Active Leads",    v:open.length,  accent:"#C2590A"},
          {l:"Won Value",       v:fmtL(wv),     accent:"#166534"},
          {l:"Conversion",      v:cv+"%",       accent:"#C08A35"},
          {l:"Lost Value",      v:fmtL(lv),     accent:"#B91C1C"},
          {l:"Quote Value",     v:fmtL(qv),     accent:"#1553A8"},
        ].map(k=>(
          <div key={k.l} style={S.sc(k.accent)}>
            <div style={S.sl}>{k.l}</div>
            <div style={S.sv}>{k.v}</div>
            <div style={S.ss}>{leads.length} total leads</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        {/* Funnel */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Pipeline Funnel</span></div>
          <div style={S.cb}>
            {stData.map(d=>(
              <div key={d.s} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#484848",marginBottom:3}}><span>{d.s}</span><span style={{fontWeight:600}}>{d.n} · {fmtL(d.v)}</span></div>
                <div style={{height:9,background:"#EDE9E1",borderRadius:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(d.n/maxN)*100}%`,background:"linear-gradient(90deg,#0C2537,#2B7BA0)",borderRadius:5,transition:"width .5s"}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart — sources */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Leads by Source</span></div>
          <div style={S.cb}>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120,paddingBottom:4}}>
              {srcData.map(d=>(
                <div key={d.s} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#0C2537"}}>{d.n}</span>
                  <div style={{width:"100%",background:"linear-gradient(180deg,#EDB96A,#C08A35)",borderRadius:"4px 4px 0 0",height:`${Math.max((d.n/maxS)*100,6)}%`,minHeight:6}} />
                  <span style={{fontSize:8,color:"#828282",textAlign:"center",lineHeight:1.2}}>{d.s.replace(" Referral","").replace("Social Media","Social")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Team Performance</span></div>
          <div style={S.cb}>
            {repData.map(r=>(
              <div key={r.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #EDE8E0"}}>
                <Avatar name={r.name} size={34} />
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>{r.name}</div>
                  <div style={{fontSize:11,color:"#828282"}}>{r.n} leads · {r.won} won · {r.n?Math.round(r.won/r.n*100):0}% conv.</div>
                </div>
                <div style={{fontWeight:700,fontSize:13,color:"#0C2537",textAlign:"right"}}>{fmtL(r.v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* By city */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>Leads by City</span></div>
          <div style={S.cb}>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {cities.map(city=>{
                const cl=leads.filter(l=>l.city===city);
                return (
                  <div key={city} style={{background:"#F7F4EF",borderRadius:10,padding:"10px 14px",border:"1px solid #E4DDD3"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0C2537"}}>{city}</div>
                    <div style={{fontSize:11,color:"#828282"}}>{cl.length} leads</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#C08A35"}}>{fmtL(cl.reduce((s,l)=>s+(l.value||0),0))}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function Reports({ leads, quotes, uName }) {
  const won=leads.filter(l=>l.stage==="Won");
  const lost=leads.filter(l=>l.stage==="Lost");
  const open=leads.filter(l=>!["Won","Lost"].includes(l.stage));
  const tv=leads.reduce((s,l)=>s+(l.value||0),0);
  const wv=won.reduce((s,l)=>s+(l.value||0),0);
  const lv=lost.reduce((s,l)=>s+(l.value||0),0);
  const qvAcc=quotes.filter(q=>q.status==="Accepted").reduce((s,q)=>s+q.total,0);
  const byStage=STAGES.map(s=>({s,n:leads.filter(l=>l.stage===s).length,v:leads.filter(l=>l.stage===s).reduce((a,l)=>a+(l.value||0),0)}));
  const bySrc=SOURCES.map(s=>({s,n:leads.filter(l=>l.source===s).length,v:leads.filter(l=>l.source===s).reduce((a,l)=>a+(l.value||0),0)})).filter(d=>d.n>0).sort((a,b)=>b.v-a.v);
  const repIds=[...new Set(leads.map(l=>l.assignedTo))];
  const byRep=repIds.map(id=>({name:uName(id),n:leads.filter(l=>l.assignedTo===id).length,won:leads.filter(l=>l.assignedTo===id&&l.stage==="Won").length,v:leads.filter(l=>l.assignedTo===id).reduce((s,l)=>s+(l.value||0),0)})).sort((a,b)=>b.v-a.v);

  const kpis=[
    ["Total Leads",       leads.length,                                          "#0C2537"],
    ["Pipeline Value",    fmtL(tv),                                             "#2B7BA0"],
    ["Open / Active",     open.length,                                          "#C2590A"],
    ["Quotation Sent",    leads.filter(l=>l.stage==="Quotation Sent").length,   "#1553A8"],
    ["Won Deals",         won.length,                                            "#166534"],
    ["Won Value",         fmtL(wv),                                             "#166534"],
    ["Lost Deals",        lost.length,                                           "#B91C1C"],
    ["Lost Value",        fmtL(lv),                                             "#B91C1C"],
    ["Conversion",        leads.length?Math.round(won.length/leads.length*100)+"%":"—","#C08A35"],
    ["Accepted Quotes",   quotes.filter(q=>q.status==="Accepted").length,       "#166534"],
    ["Accepted Value",    fmtL(qvAcc),                                          "#166534"],
    ["Avg Deal (Won)",    won.length?fmtL(Math.round(wv/won.length)):"—",       "#0C2537"],
  ];

  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>Reports & Analytics</h1><p style={{fontSize:13,color:"#828282"}}>Full sales performance, pipeline health &amp; team metrics</p></div>
        <Btn variant="outline" sm onClick={()=>alert("Exports all data tables to a formatted Excel file")}>↓ Export Excel</Btn>
      </div>
      {/* KPI grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:18}}>
        {kpis.map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:12,padding:"12px 14px",boxShadow:"0 2px 14px rgba(12,37,55,.08)",border:"1px solid #E4DDD3",borderTop:`3px solid ${c}`}}>
            <div style={{fontSize:10,color:"#828282",textTransform:"uppercase",letterSpacing:".8px",marginBottom:4}}>{l}</div>
            <div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"Georgia,serif"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:13,marginBottom:16}}>
        {/* By Stage */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>By Stage</span></div>
          <Table cols={[{key:"_s",label:"Stage"},{key:"n",label:"Count",right:true,bold:true},{key:"_v",label:"Value",right:true},{key:"_p",label:"%",right:true}]}
            rows={byStage.filter(d=>d.n>0).map(d=>({_s:<StageBadge stage={d.s}/>,n:d.n,_v:<span style={{fontWeight:600,color:"#0C2537"}}>{fmtL(d.v)}</span>,_p:<span style={{color:"#828282"}}>{Math.round(d.n/leads.length*100)}%</span>}))} />
        </div>
        {/* By Source */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>By Source</span></div>
          <Table cols={[{key:"_s",label:"Source"},{key:"n",label:"Leads",right:true,bold:true},{key:"_v",label:"Value",right:true}]}
            rows={bySrc.map(d=>({_s:<span style={S.pill("#E3F2FD","#1565C0")}>{d.s}</span>,n:d.n,_v:<span style={{fontWeight:700,color:"#0C2537"}}>{fmtL(d.v)}</span>}))} />
        </div>
        {/* By Rep */}
        <div style={S.card}>
          <div style={S.ch}><span style={S.chTitle}>By Sales Rep</span></div>
          <Table cols={[{key:"name",label:"Rep"},{key:"n",label:"Leads",right:true},{key:"won",label:"Won",right:true},{key:"_v",label:"Value",right:true},{key:"_c",label:"Conv%",right:true}]}
            rows={byRep.map(r=>({name:<span style={{fontWeight:600}}>{r.name.split(" ")[0]}</span>,n:r.n,won:<span style={{color:"#166534",fontWeight:700}}>{r.won}</span>,_v:<span style={{fontWeight:700,color:"#0C2537"}}>{fmtL(r.v)}</span>,_c:<span style={{color:"#C08A35"}}>{r.n?Math.round(r.won/r.n*100):0}%</span>}))} />
        </div>
      </div>
      {/* Full register */}
      <div style={S.card}>
        <div style={S.ch}><span style={S.chTitle}>Full Lead Register</span><span style={{fontSize:12,color:"#828282"}}>{leads.length} records</span></div>
        <Table
          cols={[{key:"_id",label:"ID"},{key:"_nm",label:"Name"},{key:"_co",label:"Company"},{key:"city",label:"City"},{key:"_src",label:"Source"},{key:"_stg",label:"Stage"},{key:"_val",label:"Value",right:true,bold:true},{key:"_asgn",label:"Assigned"},{key:"createdAt",label:"Date"}]}
          rows={leads.map(l=>({_id:<span style={{fontFamily:"monospace",fontSize:11,color:"#2B7BA0",fontWeight:700}}>{l.id}</span>,_nm:<span style={{fontWeight:600}}>{l.name}</span>,_co:<span style={{fontSize:11}}>{l.company||"—"}</span>,city:l.city,_src:<span style={S.pill("#E3F2FD","#1565C0")}>{l.source}</span>,_stg:<StageBadge stage={l.stage}/>,_val:<span style={{color:"#0C2537"}}>{fmt(l.value)}</span>,_asgn:<span style={{fontSize:11}}>{uName(l.assignedTo)}</span>,createdAt:<span style={{fontSize:11,color:"#828282"}}>{l.createdAt}</span>}))}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ users, setUsers }) {
  const [adding,setAdding]=useState(false);
  const [f,setF]=useState({name:"",email:"",role:ROLES.REP,pw:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const add=()=>{
    if(!f.name||!f.email||!f.pw) return alert("All fields required.");
    setUsers(us=>[...us,{...f,id:Date.now(),active:true}]);
    setF({name:"",email:"",role:ROLES.REP,pw:""});setAdding(false);
  };
  const toggle=id=>setUsers(us=>us.map(u=>u.id===id?{...u,active:!u.active}:u));
  return (
    <div>
      <div style={S.row}>
        <div><h1 style={{fontFamily:"Georgia,serif",fontSize:23,color:"#0C2537",marginBottom:3}}>User Management</h1><p style={{fontSize:13,color:"#828282"}}>Manage system users and access levels</p></div>
        <Btn onClick={()=>setAdding(true)}>+ Add User</Btn>
      </div>
      {adding&&(
        <div style={{...S.card,marginBottom:16}}>
          <div style={S.ch}><span style={S.chTitle}>New User</span></div>
          <div style={S.cb}>
            <div style={S.grid4}>
              <Field label="Full Name *"><Input value={f.name} onChange={e=>s("name",e.target.value)} /></Field>
              <Field label="Email *"><Input value={f.email} onChange={e=>s("email",e.target.value)} /></Field>
              <Field label="Password *"><Input type="password" value={f.pw} onChange={e=>s("pw",e.target.value)} /></Field>
              <Field label="Role"><Select value={f.role} onChange={e=>s("role",e.target.value)}>{Object.values(ROLES).map(r=><option key={r}>{r}</option>)}</Select></Field>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <Btn onClick={add}>Create User</Btn>
              <Btn variant="outline" onClick={()=>setAdding(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
      <div style={S.card}>
        <Table
          cols={[{key:"_av",label:"User"},{key:"email",label:"Email"},{key:"_role",label:"Role"},{key:"_st",label:"Status"},{key:"_act",label:"Actions"}]}
          rows={users.map(u=>({
            _av:<div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={u.name} size={28}/><span style={{fontWeight:600}}>{u.name}</span></div>,
            email:<span style={{fontSize:12,color:"#828282"}}>{u.email}</span>,
            _role:<span style={{...S.pill("#E0F2F1","#00695C")}}>{u.role}</span>,
            _st:<span style={{...S.tag(u.active?"#DCFCE7":"#FEE2E2",u.active?"#166534":"#B91C1C")}}>{u.active?"Active":"Inactive"}</span>,
            _act:<Btn variant={u.active?"danger":"green"} xs onClick={()=>toggle(u.id)}>{u.active?"Deactivate":"Activate"}</Btn>,
          }))}
        />
        <div style={{padding:"12px 18px",background:"#F7F4EF",borderTop:"1px solid #EDE8E0",fontSize:12,color:"#828282",lineHeight:1.9}}>
          <strong style={{color:"#0C2537"}}>Access levels: </strong>
          🔴 <strong>Superuser</strong> — full access incl. user management &nbsp;·&nbsp;
          🟡 <strong>Sales Head</strong> — all leads, approve quotes, reports &nbsp;·&nbsp;
          🟢 <strong>Coordinator</strong> — all leads, bulk uploads &nbsp;·&nbsp;
          🔵 <strong>Sales Rep</strong> — own leads, create &amp; send quotations
        </div>
      </div>
    </div>
  );
}
