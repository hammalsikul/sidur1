import { useState, useEffect } from "react";

const WORKERS_BASHAL=['יוסף','ליאן','נועה','שירה נ','שירה ח','חנה','תהילה','נורית','לאה','עמית'];
const WORKERS_STUDENT=['עידו','נויה','לינור'];
const WORKERS_KEVA=['שמואל','תמר','נועם','אוראל'];
const ALL_WORKERS=[...WORKERS_BASHAL,...WORKERS_STUDENT,...WORKERS_KEVA];
const DESK_MAP={'יוסף':'סד"צ','נורית':'סד"צ','תהילה':'סד"צ','לינור':'סד"צ','נועה':'פלילי','ליאן':'פלילי','שירה נ':'פלילי','חנה':'פלילי','נויה':'פלילי','שירה ח':'פח"ע','לאה':'פח"ע','עמית':'פח"ע','עידו':'פח"ע','שמואל':'מפקד','תמר':'מפקד','נועם':'מפקד','אוראל':'מפקד'};
const POP_MAP={...Object.fromEntries(WORKERS_BASHAL.map(n=>[n,'bashal'])),...Object.fromEntries(WORKERS_STUDENT.map(n=>[n,'student'])),...Object.fromEntries(WORKERS_KEVA.map(n=>[n,'keva']))};
const POP_LABEL={bashal:'בש"ל',student:'🎓 סטודנט',keva:'👮 קבע'};
const POP_COLOR={bashal:'#3b82f6',student:'#8b5cf6',keva:'#f59e0b'};
const NO_SAT_NIGHT=['תהילה','נורית','שירה ח','עמית'];
const ACHMASH=['נועה','ליאן','יוסף','עמית'];
const MGR_PW='7100';
const MAX_C=8;
const SHIFT_HOURS={a:8,b:6.5,c:9.5};
const SHIFTS_K=[{key:'a',label:'א׳',time:'07:00–15:00'},{key:'b',label:'ב׳',time:'15:00–21:30'},{key:'c',label:'ג׳',time:'21:30–07:00'}];
const HEB_DAYS=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const HEB_MONTHS=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DESKS=['sadatz','plili','paha'];
const VACATION_REASONS=['חופש','טיסה','אירוע משפחתי','חתונה','אבל','מחלה','לימודים','אחר'];
const REASONS_NEED_FORM=['חופש','טיסה'];
const ROSTER=ALL_WORKERS.map(n=>{const pop=POP_MAP[n];const dh=DESK_MAP[n]||'';const desk=dh==='סד"צ'?'sadatz':dh==='פלילי'?'plili':dh==='פח"ע'?'paha':'keva';return{name:n,pop,desk};});

function buildScheduleDays(){
  const today=new Date();let y=today.getFullYear(),m=today.getMonth()+2;
  if(m>12){m=1;y++;}
  const days=[];const dim=new Date(y,m,0).getDate();
  for(let i=1;i<=dim;i++){const jd=new Date(y,m-1,i).getDay();days.push({day:i,month:m,year:y,label:`${i}/${m}`,jsDay:jd,isWeekend:jd===5||jd===6,isFri:jd===5,isSat:jd===6});}
  const last=days[days.length-1];
  if(last.jsDay!==6){let d=last.day+1,mo=m,yr=y;while(true){if(d>new Date(yr,mo,0).getDate()){d=1;mo++;if(mo>12){mo=1;yr++;}}const jd=new Date(yr,mo-1,d).getDay();days.push({day:d,month:mo,year:yr,label:`${d}/${mo}`,jsDay:jd,isWeekend:jd===5||jd===6,isFri:jd===5,isSat:jd===6});if(jd===6)break;d++;}}
  return days;
}
const SCHEDULE_DAYS=buildScheduleDays();
const MONTH_LABEL=`${HEB_MONTHS[(SCHEDULE_DAYS[0]?.month||1)-1]} ${SCHEDULE_DAYS[0]?.year||new Date().getFullYear()}`;
function getWeeks(){const weeks=[];let week=[];SCHEDULE_DAYS.forEach(d=>{if(d.jsDay===0&&week.length){weeks.push(week);week=[];}week.push(d);});if(week.length)weeks.push(week);return weeks;}

const S={
  wrap:{maxWidth:520,margin:'0 auto',padding:'0 1rem 3rem',fontFamily:"'Heebo',sans-serif",direction:'rtl'},
  card:{background:'#0f1623',border:'1px solid #1e2a40',borderRadius:12,padding:'1rem',marginBottom:'.75rem'},
  btn:(bg='#1e2a40',color='#e2e8f0')=>({padding:'.5rem 1rem',borderRadius:8,border:'none',background:bg,color,fontFamily:"'Heebo',sans-serif",fontSize:'.82rem',fontWeight:700,cursor:'pointer'}),
  sel:{width:'100%',padding:'.55rem .7rem',borderRadius:8,background:'#0f1623',border:'1px solid #243048',color:'#e2e8f0',fontFamily:"'Heebo',sans-serif",fontSize:'.85rem',marginBottom:'.4rem'},
  tag:(bg,color,border)=>({display:'inline-block',padding:'.15rem .5rem',borderRadius:6,background:bg,color,border:`1px solid ${border}`,fontSize:'.68rem',fontWeight:700}),
};

function Toast({msg}){return msg?<div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1e3a5f',border:'1px solid #3b82f6',borderRadius:10,padding:'.6rem 1.2rem',color:'#93c5fd',fontWeight:700,fontSize:'.85rem',zIndex:9999}}>{msg}</div>:null;}
function Header({title,sub,onBack}){return<div style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'1.25rem 0 .75rem',marginBottom:'.5rem',borderBottom:'1px solid #1e2a40'}}><button onClick={onBack} style={{...S.btn('#1e2a40','#94a3b8'),padding:'.4rem .7rem'}}>← חזרה</button><div><div style={{fontWeight:900,fontSize:'1rem'}}>{title}</div>{sub&&<div style={{fontSize:'.7rem',color:'#64748b'}}>{sub}</div>}</div></div>;}
function WSelect({value,onChange,showDesk}){return<select style={S.sel} value={value} onChange={e=>onChange(e.target.value)}><option value="">— בחר/י שם —</option>{[{g:'בש"ל',list:WORKERS_BASHAL},{g:'🎓 סטודנטים',list:WORKERS_STUDENT},{g:'👮 קבע',list:WORKERS_KEVA}].map(({g,list})=><optgroup key={g} label={g}>{list.map(n=><option key={n} value={n}>{n}{showDesk&&DESK_MAP[n]?' — '+DESK_MAP[n]:''}</option>)}</optgroup>)}</select>;}

export default function App(){
  const [page,setPage]=useState('deploy');
  const [allC,setAllC]=useState({});
  const [allV,setAllV]=useState([]);
  const [schedule,setSchedule]=useState({});
  const [schedReady,setSchedReady]=useState(false);
  const [allSick,setAllSick]=useState([]);
  const [toast,setToast]=useState('');
  const [mgrAuthed,setMgrAuthed]=useState(false);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(''),2800);};
  const saveC=d=>setAllC(d);
  const saveV=d=>setAllV(d);
  const saveS=(s,r)=>{setSchedule(s);setSchedReady(r);};
  const saveSick=d=>setAllSick(d);

  const props={allC,allV,schedule,schedReady,allSick,saveC,saveV,saveS,saveSick,showToast,setPage,mgrAuthed,setMgrAuthed};

  return(
    <div style={{background:'#080c14',minHeight:'100vh',color:'#e2e8f0',fontSize:'14px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap" rel="stylesheet"/>
      {page==='deploy'&&<DeployPage setPage={setPage}/>}
      {page==='home'&&<HomePage {...props}/>}
      {page==='vac'&&<VacPage {...props}/>}
      {page==='emp'&&<EmpPage {...props}/>}
      {page==='mgr'&&<MgrPage {...props}/>}
      {page==='sick'&&<SickPage {...props}/>}
      <Toast msg={toast}/>
    </div>
  );
}

function DeployPage({setPage}){
  const [step,setStep]=useState(0);
  const steps=[
    {icon:'🔥',title:'Firebase — כבר מוכן!',desc:'יצרת פרויקט Firebase וקיבלת את ה-config. הנתונים יישמרו שם בזמן אמת.',done:true},
    {icon:'📄',title:'הורד את הקובץ',desc:'הקובץ sidur-hagalui.html כבר הורד לך בשיחה זו. הוא מכיל את כל המערכת + Firebase.',done:true},
    {icon:'🌐',title:'Google Sites',desc:'כנס ל-sites.google.com ← צור אתר חדש ← תן שם ← לחץ על "+" ← Embed ← Embed code'},
    {icon:'📋',title:'הדבק את ה-HTML',desc:'פתח את sidur-hagalui.html בעורך טקסט (Notepad) ← העתק הכל ← הדבק בחלון Embed ב-Google Sites'},
    {icon:'🚀',title:'פרסם',desc:'לחץ Publish בפינה הימנית העליונה ← תן כתובת ← Share with Anyone ← קבל קישור'},
  ];
  return(
    <div style={{...S.wrap,maxWidth:520,margin:'0 auto'}}>
      <div style={{textAlign:'center',padding:'2rem 0 1.5rem'}}>
        <div style={{fontSize:'1.8rem',fontWeight:900}}>⬡ הסידור הגלוי</div>
        <div style={{color:'#94a3b8',fontWeight:600,fontSize:'.82rem',marginTop:'.2rem'}}>שקוף • שווה • חכם</div>
      </div>
      <div style={{background:'rgba(37,99,235,.08)',border:'1px solid rgba(37,99,235,.3)',borderRadius:12,padding:'1rem',marginBottom:'1rem'}}>
        <div style={{fontWeight:900,fontSize:'.9rem',color:'#93c5fd',marginBottom:'.5rem'}}>🌐 איך להריץ דרך Google</div>
        <div style={{fontSize:'.78rem',color:'#94a3b8',lineHeight:1.7}}>
          הפתרון: <strong style={{color:'#e2e8f0'}}>Google Sites + Firebase</strong><br/>
          — Google Sites = אתר גוגל חינמי, קישור אחד לכולם<br/>
          — Firebase = מסד נתונים של גוגל, סנכרון בזמן אמת<br/>
          — הכל בחינם, הכל של גוגל, אפס תחזוקה
        </div>
      </div>
      <div style={S.card}>
        <div style={{fontWeight:900,fontSize:'.85rem',marginBottom:'.75rem'}}>📋 שלבי הקמה</div>
        {steps.map((s,i)=>(
          <div key={i} onClick={()=>setStep(i)} style={{display:'flex',gap:'.75rem',padding:'.6rem',borderRadius:8,background:step===i?'rgba(37,99,235,.08)':'transparent',cursor:'pointer',marginBottom:'.25rem',border:`1px solid ${step===i?'rgba(37,99,235,.3)':'transparent'}`}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:s.done?'#059669':step===i?'#2563eb':'#1e2a40',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',flexShrink:0,fontWeight:900,color:'white'}}>{s.done?'✓':i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:'.82rem',color:s.done?'#6ee7b7':step===i?'#93c5fd':'#e2e8f0'}}>{s.icon} {s.title}</div>
              {step===i&&<div style={{fontSize:'.75rem',color:'#94a3b8',marginTop:'.25rem',lineHeight:1.6}}>{s.desc}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:'rgba(5,150,105,.08)',border:'1px solid rgba(5,150,105,.3)',borderRadius:12,padding:'1rem',marginBottom:'1rem'}}>
        <div style={{fontWeight:700,fontSize:'.82rem',color:'#6ee7b7',marginBottom:'.4rem'}}>⚠️ חשוב — הגבלת Google Sites</div>
        <div style={{fontSize:'.75rem',color:'#94a3b8',lineHeight:1.7}}>
          Google Sites חוסם JavaScript חיצוני ב-Embed.<br/>
          <strong style={{color:'#e2e8f0'}}>הפתרון הכי פשוט שנשאר בגוגל:</strong><br/>
          השתמש ב-<strong style={{color:'#fcd34d'}}>Google Sites + iFrame מ-GitHub Pages</strong> — <br/>
          GitHub Pages חינמי לחלוטין, הקובץ אצלך, הקישור ב-Google Sites.
        </div>
      </div>
      <button onClick={()=>setPage('home')} style={{...S.btn('#2563eb','white'),width:'100%',padding:'.9rem',fontSize:'.95rem',borderRadius:12}}>
        👁 צפה במערכת
      </button>
    </div>
  );
}

function HomePage({allC,allV,allSick,setPage}){
  const sub=Object.values(allC).filter(v=>v.submitted).length,total=ALL_WORKERS.length;
  const pend=allV.filter(v=>v.status==='pending').length;
  const decided=allV.filter(v=>v.status==='approved'||v.status==='rejected').length;
  const activeSick=allSick.filter(r=>!r.resolved).length;
  const BigBtn=({icon,title,sub,color,onClick,badge})=>(
    <div style={{position:'relative'}}>
      <button onClick={onClick} style={{width:'100%',padding:'.9rem',borderRadius:12,background:`linear-gradient(135deg,${color}20,${color}10)`,border:`1px solid ${color}40`,color:'#e2e8f0',fontFamily:"'Heebo',sans-serif",cursor:'pointer',textAlign:'center'}}>
        <div style={{fontSize:'1.5rem',marginBottom:'.25rem'}}>{icon}</div>
        <div style={{fontWeight:800,fontSize:'.9rem'}}>{title}</div>
        <div style={{fontSize:'.68rem',opacity:.7,marginTop:'.1rem'}}>{sub}</div>
      </button>
      {badge&&<div style={{position:'absolute',top:8,left:8,background:color,color:'white',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',fontWeight:900}}>🔔</div>}
    </div>
  );
  return(
    <div style={S.wrap}>
      <div style={{textAlign:'center',padding:'2rem 0 1.5rem'}}>
        <div style={{fontSize:'1.8rem',fontWeight:900}}>⬡ הסידור הגלוי</div>
        <div style={{color:'#94a3b8',fontWeight:600,fontSize:'.82rem',marginTop:'.2rem'}}>שקוף • שווה • חכם</div>
        <div style={{fontSize:'.78rem',color:'#475569',marginTop:'.15rem'}}>{MONTH_LABEL} | חמ"ל</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.6rem',marginBottom:'1rem'}}>
        {[{icon:'📋',val:`${sub}/${total}`,lbl:'הגישו',color:'#93c5fd'},{icon:'🏖',val:allV.length,lbl:'חופשות',color:'#6ee7b7'},{icon:'⏳',val:pend,lbl:'ממתינות',color:'#fcd34d'}].map(s=>(
          <div key={s.lbl} style={{...S.card,textAlign:'center',padding:'.75rem .5rem',marginBottom:0}}>
            <div>{s.icon}</div><div style={{fontSize:'1.3rem',fontWeight:900,color:s.color}}>{s.val}</div><div style={{fontSize:'.62rem',color:'#64748b'}}>{s.lbl}</div>
          </div>
        ))}
      </div>
      {activeSick>0&&<div style={{background:'rgba(220,38,38,.1)',border:'1px solid rgba(220,38,38,.35)',borderRadius:10,padding:'.65rem .9rem',marginBottom:'.75rem',fontSize:'.8rem',color:'#fca5a5',fontWeight:700,cursor:'pointer'}} onClick={()=>setPage('sick')}>
        🚨 {activeSick} דיווח מחלה פעיל
      </div>}
      <div style={{display:'flex',flexDirection:'column',gap:'.65rem'}}>
        <BigBtn icon="🏖" title="בקשת חופשה" sub="הגשת בקשה ומעקב" color="#059669" onClick={()=>setPage('vac')} badge={decided>0}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem'}}>
          <BigBtn icon="📋" title="אילוצים" sub="בש״ל, סטודנטים, קבע" color="#2563eb" onClick={()=>setPage('emp')}/>
          <BigBtn icon="🔐" title="מפקד" sub="אישורים וסידור" color="#7c3aed" onClick={()=>setPage('mgr')}/>
        </div>
        <BigBtn icon="🤒" title="דיווח מחלה" sub="דיווח בזמן אמת" color="#dc2626" onClick={()=>setPage('sick')}/>
      </div>
      <div style={{...S.card,marginTop:'1rem'}}>
        <div style={{fontSize:'.68rem',color:'#64748b',fontWeight:600,marginBottom:'.4rem'}}>הגשת אילוצים</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:'.4rem'}}>
          {ALL_WORKERS.map(n=>{const s=allC[n]?.submitted;const col=POP_COLOR[POP_MAP[n]];return<div key={n} title={n} style={{width:28,height:28,borderRadius:'50%',background:s?col:'#1e2a40',border:`2px solid ${s?col:'#243048'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.5rem',fontWeight:800,color:s?'white':'#64748b'}}>{n[0]}</div>;})}
        </div>
        <div style={{height:4,borderRadius:2,background:'#1e2a40',overflow:'hidden'}}>
          <div style={{height:'100%',background:'linear-gradient(90deg,#3b82f6,#8b5cf6)',borderRadius:2,width:`${total?sub/total*100:0}%`,transition:'width .4s'}}/>
        </div>
      </div>
    </div>
  );
}

function VacPage({allV,saveV,showToast,setPage}){
  const [worker,setWorker]=useState('');const [fromD,setFromD]=useState('');const [toD,setToD]=useState('');
  const [reason,setReason]=useState('');const [note,setNote]=useState('');const [editId,setEditId]=useState(null);
  const needsForm=REASONS_NEED_FORM.includes(reason);
  const myVacs=allV.filter(v=>v.worker===worker);
  const submit=()=>{
    if(!worker||!fromD||!toD||!reason){showToast('⚠️ יש למלא הכל');return;}
    const fi=SCHEDULE_DAYS.findIndex(d=>`${d.day}-${d.month}`===fromD),ti=SCHEDULE_DAYS.findIndex(d=>`${d.day}-${d.month}`===toD);
    if(fi<0||ti<0||ti<fi){showToast('⚠️ תאריכים לא תקינים');return;}
    const days=SCHEDULE_DAYS.slice(fi,ti+1).map(d=>({day:d.day,month:d.month}));
    const entry={id:editId||Date.now(),worker,pop:POP_MAP[worker]||'bashal',from:SCHEDULE_DAYS[fi],to:SCHEDULE_DAYS[ti],days,reason,note,status:'pending',needsForm};
    saveV(editId?allV.map(v=>v.id===editId?entry:v):[...allV,entry]);
    showToast(editId?'✅ עודכן':'✅ נשלח');setEditId(null);setFromD('');setToD('');setReason('');setNote('');
  };
  const SC={pending:'#fcd34d',approved:'#6ee7b7',rejected:'#fca5a5'},SL={pending:'⏳ ממתין',approved:'✅ אושר',rejected:'❌ נדחה'};
  return(
    <div style={S.wrap}>
      <Header title="🏖 בקשת חופשה" sub={MONTH_LABEL} onBack={()=>setPage('home')}/>
      <div style={S.card}><WSelect value={worker} onChange={w=>{setWorker(w);setEditId(null);}} showDesk/></div>
      {worker&&<div style={S.card}>
        <div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'.6rem'}}>{editId?'✏️ עריכה':'➕ בקשה חדשה'}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',marginBottom:'.5rem'}}>
          <div><div style={{fontSize:'.68rem',color:'#64748b',marginBottom:'.2rem'}}>מתאריך</div><select style={S.sel} value={fromD} onChange={e=>setFromD(e.target.value)}><option value="">בחר...</option>{SCHEDULE_DAYS.map(d=><option key={`${d.day}-${d.month}`} value={`${d.day}-${d.month}`}>{d.label} {HEB_DAYS[d.jsDay]}</option>)}</select></div>
          <div><div style={{fontSize:'.68rem',color:'#64748b',marginBottom:'.2rem'}}>עד תאריך</div><select style={S.sel} value={toD} onChange={e=>setToD(e.target.value)}><option value="">בחר...</option>{SCHEDULE_DAYS.map(d=><option key={`${d.day}-${d.month}`} value={`${d.day}-${d.month}`}>{d.label} {HEB_DAYS[d.jsDay]}</option>)}</select></div>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'.3rem',marginBottom:'.5rem'}}>
          {VACATION_REASONS.map(r=><button key={r} onClick={()=>setReason(r)} style={{...S.btn(reason===r?'#2563eb':'#1e2a40',reason===r?'white':'#94a3b8'),padding:'.28rem .6rem',fontSize:'.75rem',border:`1px solid ${reason===r?'#3b82f6':'#243048'}`}}>{r}</button>)}
        </div>
        {needsForm&&<div style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.4)',borderRadius:9,padding:'.5rem .75rem',marginBottom:'.5rem',fontSize:'.75rem',color:'#fcd34d'}}>📋 נדרש טופס נפרד</div>}
        <input style={{...S.sel,marginBottom:'.5rem'}} placeholder="הערה..." value={note} onChange={e=>setNote(e.target.value)}/>
        <div style={{display:'flex',gap:'.4rem'}}>
          <button onClick={submit} style={{...S.btn('#059669','white'),flex:1,padding:'.6rem'}}>📤 {editId?'עדכן':'שלח'}</button>
          {editId&&<button onClick={()=>{setEditId(null);setFromD('');setToD('');setReason('');setNote('');}} style={{...S.btn('transparent','#64748b'),border:'1px solid #243048',padding:'.6rem .9rem'}}>ביטול</button>}
        </div>
      </div>}
      {myVacs.length>0&&<div style={S.card}>
        <div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'.6rem'}}>הבקשות שלי</div>
        {myVacs.map(v=><div key={v.id} style={{borderBottom:'1px solid #1e2a40',padding:'.55rem 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'.5rem'}}>
            <div style={{flex:1}}><div style={{fontSize:'.85rem',fontWeight:700}}>{v.from?.label} – {v.to?.label}</div><div style={{fontSize:'.7rem',color:'#64748b'}}>{v.reason}</div></div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'.25rem'}}>
              <span style={S.tag('transparent',SC[v.status],SC[v.status])}>{SL[v.status]}</span>
              {v.status==='pending'&&<div style={{display:'flex',gap:'.25rem'}}>
                <button onClick={()=>{setEditId(v.id);setFromD(`${v.from.day}-${v.from.month}`);setToD(`${v.to.day}-${v.to.month}`);setReason(v.reason);setNote(v.note||'');}} style={{...S.btn('rgba(37,99,235,.12)','#93c5fd'),border:'1px solid rgba(37,99,235,.25)',padding:'.15rem .4rem',fontSize:'.65rem'}}>✏️</button>
                <button onClick={()=>saveV(allV.filter(x=>x.id!==v.id))} style={{...S.btn('rgba(220,38,38,.1)','#fca5a5'),border:'1px solid rgba(220,38,38,.25)',padding:'.15rem .4rem',fontSize:'.65rem'}}>🗑</button>
              </div>}
            </div>
          </div>
        </div>)}
      </div>}
    </div>
  );
}

function EmpPage({allC,schedule,schedReady,saveC,showToast,setPage}){
  const [worker,setWorker]=useState('');const [tab,setTab]=useState('cons');
  const [selDay,setSelDay]=useState(`${SCHEDULE_DAYS[0]?.day}-${SCHEDULE_DAYS[0]?.month}`);
  const [selShift,setSelShift]=useState('a');const [selType,setSelType]=useState('block');
  const pop=POP_MAP[worker]||'bashal';
  const wData=allC[worker]||{constraints:[],submitted:false};const cons=wData.constraints||[];
  const shL={a:'א׳',b:'ב׳',c:'ג׳'};
  const friDays=SCHEDULE_DAYS.filter(d=>d.isFri),satDays=SCHEDULE_DAYS.filter(d=>d.isSat),wdDays=SCHEDULE_DAYS.filter(d=>!d.isWeekend);
  const totalH=cons.reduce((s,c)=>(SHIFT_HOURS[c.shiftKey]||8)+s,0);
  const toggleSlot=(day,month,sh)=>{const idx=cons.findIndex(c=>c.day===day&&c.month===month&&c.shiftKey===sh&&c.type==='prefer');let nc=[...cons];if(idx>=0)nc.splice(idx,1);else{const dObj=SCHEDULE_DAYS.find(d=>d.day===day&&d.month===month);nc.push({day,month,dayLabel:dObj.label,jsDay:dObj.jsDay,shiftKey:sh,type:'prefer',isWeekend:true});}saveC({...allC,[worker]:{...wData,constraints:nc,submitted:false}});};
  const addCons=()=>{if(cons.length>=MAX_C&&pop!=='keva'){showToast('❌ מכסה מלא');return;}const[d,m]=selDay.split('-').map(Number);if(cons.find(c=>c.day===d&&c.month===m&&c.shiftKey===selShift)){showToast('⚠️ כבר קיים');return;}const dObj=SCHEDULE_DAYS.find(x=>x.day===d&&x.month===m);saveC({...allC,[worker]:{...wData,constraints:[...cons,{day:d,month:m,dayLabel:dObj.label,jsDay:dObj.jsDay,shiftKey:selShift,type:pop==='keva'?'block':selType,isWeekend:false}],submitted:false}});};
  const delCons=i=>{const nc=[...cons];nc.splice(i,1);saveC({...allC,[worker]:{...wData,constraints:nc,submitted:false}});};
  const submit=()=>{
    const yr=SCHEDULE_DAYS[0]?.year||new Date().getFullYear();
    if(pop==='student'){const fC=cons.filter(c=>new Date(yr,c.month-1,c.day).getDay()===5&&c.type==='prefer').length,sC=cons.filter(c=>new Date(yr,c.month-1,c.day).getDay()===6&&c.type==='prefer').length;if(fC<2||sC<2){showToast('❌ חסר שישי/שבת');return;}if(totalH<80){showToast('❌ מינימום 80h');return;}}
    if(pop==='keva'){const fC=cons.filter(c=>new Date(yr,c.month-1,c.day).getDay()===5&&c.type==='prefer').length,sC=cons.filter(c=>new Date(yr,c.month-1,c.day).getDay()===6&&c.type==='prefer').length;if(fC<1||sC<1){showToast('❌ חסר שישי/שבת');return;}}
    if(!cons.length){showToast('⚠️ אין בחירות');return;}
    saveC({...allC,[worker]:{...wData,submitted:true}});showToast('✅ נשלח!');
  };
  const SlotRow=({day,shifts})=><div style={{background:'#0a1120',border:'1px solid #1e2a40',borderRadius:8,padding:'.4rem .6rem',marginBottom:'.3rem',display:'flex',alignItems:'center',gap:'.35rem',flexWrap:'wrap'}}>
    <span style={{fontSize:'.75rem',fontWeight:700,color:'#fcd34d',minWidth:'3rem'}}>{day.label}</span>
    {shifts.map(sh=>{const ch=cons.some(c=>c.day===day.day&&c.month===day.month&&c.shiftKey===sh&&c.type==='prefer');return<button key={sh} onClick={()=>toggleSlot(day.day,day.month,sh)} style={{...S.btn(ch?'rgba(167,139,250,.2)':'#0f1623',ch?'#c4b5fd':'#64748b'),border:`1.5px solid ${ch?'#a78bfa':'#243048'}`,padding:'.25rem .55rem',fontSize:'.72rem'}}>{ch?'✓ ':''}{shL[sh]}</button>;})}</div>;
  const myShifts=[];if(worker&&schedReady){SCHEDULE_DAYS.forEach(d=>{const sk=`${d.day}-${d.month}`;const slot=schedule[sk]||{};Object.entries(slot).forEach(([k,v])=>{if(v===worker&&!k.includes('achmash')){const shKey=k.split('_')[0];if(['a','b','c'].includes(shKey))myShifts.push({...d,shKey});}});});}
  return(
    <div style={S.wrap}>
      <Header title="📋 אילוצים ומשמרות" sub={MONTH_LABEL} onBack={()=>setPage('home')}/>
      <div style={S.card}><WSelect value={worker} onChange={w=>{setWorker(w);setTab('cons');}} showDesk/>{worker&&<div style={{fontSize:'.72rem',color:POP_COLOR[pop],marginTop:'.3rem'}}>{POP_LABEL[pop]} | {DESK_MAP[worker]||''}</div>}</div>
      {worker&&<>
        <div style={{display:'flex',gap:'.3rem',marginBottom:'.1rem'}}>
          {['cons','sched'].map(t=><button key={t} onClick={()=>setTab(t)} style={{...S.btn(tab===t?'#1e3a5f':'#080c14',tab===t?'#93c5fd':'#64748b'),flex:1,borderRadius:'8px 8px 0 0',border:`1px solid ${tab===t?'#3b82f6':'#243048'}`,borderBottom:'none',fontWeight:tab===t?900:400}}>{t==='cons'?'📋 אילוצים':'📅 הסידור שלי'}</button>)}
        </div>
        <div style={{border:'1px solid #243048',borderRadius:'0 0 12px 12px',padding:'.75rem',background:'#0a1120'}}>
          {tab==='cons'&&<>
            {pop==='student'&&<><div style={{fontWeight:700,color:'#a78bfa',fontSize:'.8rem',marginBottom:'.5rem'}}>📌 סוף שבוע (חובה)</div><div style={{marginBottom:'.6rem'}}><div style={{fontSize:'.68rem',color:'#fcd34d',marginBottom:'.3rem'}}>שישי — לפחות 2</div>{friDays.map(d=><SlotRow key={`${d.day}-${d.month}`} day={d} shifts={['a','b','c']}/>)}</div><div style={{marginBottom:'.75rem'}}><div style={{fontSize:'.68rem',color:'#fcd34d',marginBottom:'.3rem'}}>שבת — לפחות 2</div>{satDays.map(d=><SlotRow key={`${d.day}-${d.month}`} day={d} shifts={['a','b']}/>)}</div><div style={{fontWeight:700,color:'#a78bfa',fontSize:'.8rem',marginBottom:'.4rem'}}>➕ ימי חול</div><div style={{display:'flex',gap:'.4rem',marginBottom:'.5rem',flexWrap:'wrap'}}><select style={{...S.sel,flex:1,marginBottom:0}} value={selDay} onChange={e=>setSelDay(e.target.value)}>{wdDays.map(d=><option key={`${d.day}-${d.month}`} value={`${d.day}-${d.month}`}>{d.label} {HEB_DAYS[d.jsDay]}</option>)}</select><select style={{...S.sel,width:90,marginBottom:0}} value={selShift} onChange={e=>setSelShift(e.target.value)}><option value="a">א׳</option><option value="b">ב׳</option><option value="c">ג׳</option></select><button onClick={addCons} style={{...S.btn('#8b5cf6','white'),padding:'.4rem .7rem'}}>➕</button></div></>}
            {pop==='keva'&&<><div style={{fontWeight:700,color:'#fcd34d',fontSize:'.8rem',marginBottom:'.5rem'}}>⭐ סוף שבוע (חובה)</div><div style={{marginBottom:'.5rem'}}><div style={{fontSize:'.68rem',color:'#fcd34d',marginBottom:'.3rem'}}>שישי — 1</div>{friDays.map(d=><SlotRow key={`${d.day}-${d.month}`} day={d} shifts={['a','b','c']}/>)}</div><div style={{marginBottom:'.75rem'}}><div style={{fontSize:'.68rem',color:'#fcd34d',marginBottom:'.3rem'}}>שבת — 1</div>{satDays.map(d=><SlotRow key={`${d.day}-${d.month}`} day={d} shifts={['a','b']}/>)}</div><div style={{fontWeight:700,color:'#fcd34d',fontSize:'.8rem',marginBottom:'.4rem'}}>⛔ חסימות</div><div style={{display:'flex',gap:'.4rem',marginBottom:'.5rem',flexWrap:'wrap'}}><select style={{...S.sel,flex:1,marginBottom:0}} value={selDay} onChange={e=>setSelDay(e.target.value)}>{wdDays.map(d=><option key={`${d.day}-${d.month}`} value={`${d.day}-${d.month}`}>{d.label} {HEB_DAYS[d.jsDay]}</option>)}</select><select style={{...S.sel,width:90,marginBottom:0}} value={selShift} onChange={e=>setSelShift(e.target.value)}><option value="a">א׳</option><option value="b">ב׳</option></select><button onClick={addCons} style={{...S.btn('#f59e0b','#080c14'),padding:'.4rem .7rem'}}>⛔</button></div></>}
            {pop==='bashal'&&<><div style={{fontWeight:700,color:'#93c5fd',fontSize:'.8rem',marginBottom:'.4rem'}}>הוסף אילוץ</div><div style={{display:'grid',gridTemplateColumns:'1fr auto auto auto',gap:'.35rem',alignItems:'center',marginBottom:'.5rem'}}><select style={{...S.sel,marginBottom:0}} value={selDay} onChange={e=>setSelDay(e.target.value)}>{SCHEDULE_DAYS.map(d=><option key={`${d.day}-${d.month}`} value={`${d.day}-${d.month}`}>{d.label} {HEB_DAYS[d.jsDay]}</option>)}</select><select style={{...S.sel,width:75,marginBottom:0}} value={selShift} onChange={e=>setSelShift(e.target.value)}><option value="a">א׳</option><option value="b">ב׳</option><option value="c">ג׳</option></select><select style={{...S.sel,width:150,marginBottom:0}} value={selType} onChange={e=>setSelType(e.target.value)}><option value="block">❌ לא לעבוד</option><option value="prefer">✅ לעבוד</option></select><button onClick={addCons} style={{...S.btn('#3b82f6','white'),padding:'.4rem .6rem'}}>➕</button></div></>}
            {cons.length>0&&<><div style={{fontSize:'.7rem',color:'#64748b',marginBottom:'.3rem'}}>{pop==='student'?`${totalH}h${totalH>=80?' ✅':' ⚠️'}`:`${cons.length}${pop!=='keva'?`/${MAX_C}`:''}`}</div>{cons.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'.35rem',padding:'.3rem 0',borderBottom:'1px solid #1e2a40',flexWrap:'wrap'}}><span style={{fontWeight:700,fontSize:'.8rem',color:c.isWeekend?'#fcd34d':'#e2e8f0',minWidth:'3rem'}}>{c.dayLabel}</span><span style={S.tag('rgba(37,99,235,.12)','#93c5fd','rgba(37,99,235,.25)')}>{shL[c.shiftKey]}</span><span style={S.tag(c.type==='block'?'rgba(220,38,38,.12)':'rgba(5,150,105,.12)',c.type==='block'?'#fca5a5':'#6ee7b7',c.type==='block'?'rgba(220,38,38,.25)':'rgba(5,150,105,.25)')}>{c.type==='block'?'❌ לא לעבוד':'✅ לעבוד'}</span>{!wData.submitted&&<button onClick={()=>delCons(i)} style={{...S.btn('transparent','#475569'),marginRight:'auto',padding:'.1rem .3rem'}}>🗑</button>}</div>)}</>}
            {!wData.submitted?<button onClick={submit} style={{...S.btn('#2563eb','white'),width:'100%',padding:'.65rem',marginTop:'.6rem'}}>✅ שלח למפקד</button>:<div style={{textAlign:'center',marginTop:'.5rem'}}><div style={{color:'#6ee7b7',fontSize:'.82rem',fontWeight:700}}>✅ נשלח</div><button onClick={()=>saveC({...allC,[worker]:{...wData,submitted:false}})} style={{...S.btn('rgba(245,158,11,.1)','#fcd34d'),marginTop:'.3rem',fontSize:'.72rem',border:'1px solid rgba(245,158,11,.3)'}}>✏️ ערוך</button></div>}
          </>}
          {tab==='sched'&&<>{!schedReady&&<div style={{textAlign:'center',color:'#64748b',padding:'2rem'}}>הסידור טרם נוצר</div>}{schedReady&&myShifts.length===0&&<div style={{textAlign:'center',color:'#64748b',padding:'2rem'}}>אין משמרות</div>}{schedReady&&myShifts.length>0&&myShifts.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'.4rem',padding:'.35rem 0',borderBottom:'1px solid #1e2a40'}}><span style={{fontWeight:700,color:s.isWeekend?'#fcd34d':'#e2e8f0',fontSize:'.82rem',minWidth:'3rem'}}>{s.label}</span><span style={{fontSize:'.65rem',color:'#64748b'}}>{HEB_DAYS[s.jsDay]}</span><span style={S.tag('rgba(37,99,235,.12)','#93c5fd','rgba(37,99,235,.25)')}>{({a:'א׳',b:'ב׳',c:'ג׳'})[s.shKey]}</span></div>)}</>}
        </div>
      </>}
    </div>
  );
}

function MgrPage({allC,allV,schedule,schedReady,allSick,saveV,saveS,showToast,setPage,mgrAuthed,setMgrAuthed}){
  const [pw,setPw]=useState('');const [err,setErr]=useState(false);const [tab,setTab]=useState('cons');
  const [wkIdx,setWkIdx]=useState(0);const [modal,setModal]=useState(null);
  const shL={a:'א׳',b:'ב׳',c:'ג׳'};const weeks=getWeeks();
  const login=()=>{if(pw===MGR_PW){setMgrAuthed(true);setErr(false);}else setErr(true);};
  const canAssign=(name,day,month,shKey,used,mC,wC,lS,sH)=>{const w=ROSTER.find(r=>r.name===name);if(!w||used.has(name))return false;const yr=SCHEDULE_DAYS[0]?.year||new Date().getFullYear(),jd=new Date(yr,month-1,day).getDay(),isFri=jd===5,isSat=jd===6;if(allV.some(v=>v.status==='approved'&&v.worker===name&&v.days?.some(d=>d.day===day&&d.month===month)))return false;if((allC[name]?.constraints||[]).some(c=>c.day===day&&c.month===month&&c.shiftKey===shKey&&c.type==='block'))return false;if(shKey==='a'&&lS[name]==='c')return false;if(shKey==='c'&&lS[name]==='c')return false;if(w.pop==='keva'&&shKey==='c')return false;if(w.pop==='bashal'){if(isFri)return false;if(isSat&&(shKey==='a'||shKey==='b'))return false;}if(w.pop==='student'&&isSat&&shKey==='c')return false;if(isSat&&shKey==='c'){if(w.pop!=='bashal')return false;if(NO_SAT_NIGHT.includes(name))return false;}if(w.pop!=='student'&&(wC[name]||0)>=5)return false;if(w.pop==='student'&&!allC[name]?.submitted)return false;if(w.pop==='student'){const h=(sH[name]||0)+(SHIFT_HOURS[shKey]||8);if(h>120)return false;}return true;};
  const scoreW=(name,day,month,shKey,mC)=>{const w=ROSTER.find(r=>r.name===name);let s=mC[name]||0;if((allC[name]?.constraints||[]).some(c=>c.day===day&&c.month===month&&c.shiftKey===shKey&&c.type==='prefer'))s-=3;if(w?.pop==='student'){const yr=SCHEDULE_DAYS[0]?.year||new Date().getFullYear(),jd=new Date(yr,month-1,day).getDay();if(jd===5)s-=8;if(jd===6)s-=8;}return s+(Math.random()-.5)*.4;};
  const generate=()=>{const mC={},wC={},lS={},sH={};const sc={};SCHEDULE_DAYS.forEach(({day,month,isWeekend,isFri,isSat,jsDay})=>{const sk=`${day}-${month}`;sc[sk]={};const used=new Set();if(jsDay===0)Object.keys(wC).forEach(n=>wC[n]=0);const elig=(f,sk2)=>ROSTER.filter(r=>f(r)&&canAssign(r.name,day,month,sk2,used,mC,wC,lS,sH)).sort((a,b)=>scoreW(a.name,day,month,sk2,mC)-scoreW(b.name,day,month,sk2,mC));const asgn=(name,field,shKey)=>{if(!name)return;sc[sk][`${shKey}_${field}`]=name;used.add(name);mC[name]=(mC[name]||0)+1;wC[name]=(wC[name]||0)+1;lS[name]=shKey;if(POP_MAP[name]==='student')sH[name]=(sH[name]||0)+(SHIFT_HOURS[shKey]||8);};SHIFTS_K.forEach(sh=>{if(isWeekend){if(isFri){const kp=elig(w=>w.pop==='keva',sh.key);if(kp.length)asgn(kp[0].name,'keva',sh.key);DESKS.forEach(d=>{const p=elig(w=>w.desk===d&&w.pop==='student',sh.key);if(p.length)asgn(p[0].name,d+'_stu',sh.key);});}else if(isSat&&sh.key==='c'){DESKS.forEach(d=>{const p=elig(w=>w.desk===d&&w.pop==='bashal'&&!NO_SAT_NIGHT.includes(w.name),sh.key);if(p.length)asgn(p[0].name,d,sh.key);});}else{const kp=elig(w=>w.pop==='keva',sh.key);if(kp.length)asgn(kp[0].name,'keva',sh.key);DESKS.forEach(d=>{const p=elig(w=>w.desk===d&&w.pop==='student',sh.key);if(p.length)asgn(p[0].name,d+'_stu',sh.key);});}}else{if(sh.key==='a'||sh.key==='b'){const kp=elig(w=>w.pop==='keva',sh.key);if(kp.length)asgn(kp[0].name,'keva',sh.key);}DESKS.forEach(d=>{const p=elig(w=>w.desk===d&&w.pop==='bashal',sh.key);if(p.length)asgn(p[0].name,d,sh.key);});DESKS.forEach(d=>{const p=elig(w=>w.desk===d&&w.pop==='student',sh.key);if(p.length)asgn(p[0].name,d+'_stu',sh.key);});if(sh.key==='a'||sh.key==='b'){const isE=n=>ACHMASH.includes(n)||POP_MAP[n]==='student';const inS=Object.entries(sc[sk]).filter(([k,v])=>v&&k.startsWith(sh.key+'_')&&!k.includes('achmash')).map(([,v])=>v);const cands=inS.filter(isE);const cnts={};Object.values(sc).forEach(slot=>Object.entries(slot||{}).forEach(([k,v])=>{if(k.includes('achmash')&&v)cnts[v]=(cnts[v]||0)+1;}));if(cands.length){cands.sort((a,b)=>(cnts[a]||0)-(cnts[b]||0));sc[sk][`${sh.key}_achmash`]=cands[0];}else{const ki=inS.find(n=>POP_MAP[n]==='keva');sc[sk][`${sh.key}_achmash`]=ki||null;}}}}});});saveS(sc,true);showToast('✅ סידור נוצר!');};
  const popC=n=>POP_COLOR[POP_MAP[n]]||'#64748b';
  const Cell=({sk,shKey,field})=>{const name=(schedule[sk]||{})[`${shKey}_${field}`];const isAch=field==='achmash';const empty=!name;return<div onClick={()=>setModal({sk,field:`${shKey}_${field}`,shKey})} style={{border:`1px solid ${isAch?(empty?'rgba(220,38,38,.5)':'rgba(16,185,129,.4)'):'rgba(100,116,139,.2)'}`,borderRadius:5,padding:'2px 4px',marginBottom:2,cursor:'pointer',minHeight:26,fontSize:'.66rem',fontWeight:700,background:isAch?(empty?'rgba(220,38,38,.08)':'rgba(16,185,129,.06)'):'transparent'}}>{isAch&&<div style={{fontSize:'.52rem',color:empty?'#fca5a5':'#10b981'}}>אחמ"ש{empty?' ⚠️':''}</div>}<div style={{color:name?popC(name):'#374151'}}>{name||''}</div></div>;};
  const WT=({week})=><div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',width:'100%'}}><thead><tr><th style={{background:'#080c14',position:'sticky',right:0,zIndex:3,minWidth:68,border:'none'}}></th>{week.map(d=><th key={d.day} style={{minWidth:72,background:d.isWeekend?'rgba(245,158,11,.04)':'#080c14',padding:'.25rem .2rem',borderRight:'1px solid #1e2a40',borderBottom:'1px solid #1e2a40',textAlign:'center'}}><div style={{fontWeight:800,color:d.isWeekend?'#fcd34d':'#e2e8f0',fontSize:'.68rem'}}>{HEB_DAYS[d.jsDay]}</div><div style={{fontSize:'.55rem',color:'#64748b'}}>{d.label}</div></th>)}</tr></thead><tbody>{SHIFTS_K.map(sh=><tr key={sh.key}><td style={{background:'#080c14',position:'sticky',right:0,zIndex:1,whiteSpace:'nowrap',padding:'.35rem .4rem',minWidth:68,borderRight:'1px solid #1e2a40',borderBottom:'1px solid #1e2a40'}}><div style={{fontWeight:700,color:'#e2e8f0',fontSize:'.68rem'}}>{sh.label}</div><div style={{fontSize:'.52rem',color:'#64748b'}}>{sh.time}</div></td>{week.map(d=>{const sk=`${d.day}-${d.month}`;return<td key={sk} style={{minWidth:72,padding:'.25rem .2rem',borderRight:'1px solid #1e2a40',borderBottom:'1px solid #1e2a40',verticalAlign:'top'}}>{d.isWeekend?(d.isFri||(d.isSat&&sh.key!=='c')?<>{(sh.key==='a'||sh.key==='b')&&<Cell sk={sk} shKey={sh.key} field="keva"/>}{DESKS.map(dk=><Cell key={dk} sk={sk} shKey={sh.key} field={dk+'_stu'}/>)}</>:d.isSat&&sh.key==='c'?DESKS.map(dk=><Cell key={dk} sk={sk} shKey={sh.key} field={dk}/>):null):<>{(sh.key==='a'||sh.key==='b')&&<><Cell sk={sk} shKey={sh.key} field="keva"/><Cell sk={sk} shKey={sh.key} field="achmash"/></>}{DESKS.map(dk=><div key={dk}><Cell sk={sk} shKey={sh.key} field={dk}/><Cell sk={sk} shKey={sh.key} field={dk+'_stu'}/></div>)}</>}</td>;})}</tr>)}</tbody></table></div>;
  const pool=modal?ROSTER.filter(r=>{const f=modal.field,sk=modal.shKey;if(f.includes('achmash'))return ACHMASH.includes(r.name)||r.pop==='student'||r.pop==='keva';if(f.endsWith('_stu'))return r.pop==='student';if(f===`${sk}_keva`)return r.pop==='keva';const desk=f.replace(`${sk}_`,'').replace('_stu','');if(['sadatz','plili','paha'].includes(desk))return r.desk===desk&&r.pop==='bashal';return r.pop==='keva';}):[];
  const SC={pending:'#fcd34d',approved:'#6ee7b7',rejected:'#fca5a5'},SL={pending:'ממתין',approved:'אושר',rejected:'נדחה'};
  if(!mgrAuthed)return<div style={S.wrap}><Header title="🔐 לוח מפקד" sub={MONTH_LABEL} onBack={()=>setPage('home')}/><div style={{...S.card,maxWidth:320,margin:'0 auto',textAlign:'center'}}><div style={{fontWeight:700,marginBottom:'.75rem'}}>כניסת מפקד</div><input type="password" style={S.sel} placeholder="סיסמה..." value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}/>{err&&<div style={{color:'#fca5a5',fontSize:'.78rem',marginBottom:'.4rem'}}>❌ שגויה</div>}<button onClick={login} style={{...S.btn('#7c3aed','white'),width:'100%',padding:'.65rem'}}>כניסה</button></div></div>;
  return(
    <div style={S.wrap}>
      <Header title="🔐 לוח מפקד" sub={MONTH_LABEL} onBack={()=>setPage('home')}/>
      {allSick.filter(r=>!r.resolved).length>0&&<div style={{background:'rgba(220,38,38,.1)',border:'1px solid rgba(220,38,38,.35)',borderRadius:10,padding:'.65rem .9rem',marginBottom:'.75rem',fontSize:'.78rem',color:'#fca5a5'}}>🚨 {allSick.filter(r=>!r.resolved).map(r=>r.worker).join(', ')}</div>}
      <div style={{display:'flex',gap:'.35rem',marginBottom:'.75rem'}}>
        {['cons','vacs','sched'].map(t=><button key={t} onClick={()=>setTab(t)} style={{...S.btn(tab===t?'#1e3a5f':'#1e2a40',tab===t?'#93c5fd':'#64748b'),border:`1px solid ${tab===t?'#3b82f6':'#243048'}`}}>{t==='cons'?'📋':t==='vacs'?'🏖':'📅'} {t==='cons'?'אילוצים':t==='vacs'?'חופשות':'סידור'}</button>)}
      </div>
      {tab==='cons'&&[{label:'בש"ל',list:WORKERS_BASHAL,color:'#3b82f6'},{label:'סטודנטים',list:WORKERS_STUDENT,color:'#8b5cf6'},{label:'קבע',list:WORKERS_KEVA,color:'#f59e0b'}].map(grp=><div key={grp.label} style={S.card}><div style={{fontWeight:900,fontSize:'.8rem',color:grp.color,marginBottom:'.5rem'}}>{grp.label}</div>{grp.list.map(n=>{const wd=allC[n],sub=wd?.submitted;return<div key={n} style={{borderBottom:'1px solid #1e2a40',padding:'.4rem 0'}}><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:700,fontSize:'.82rem'}}>{n}</span><span style={S.tag(sub?'rgba(5,150,105,.1)':'rgba(100,116,139,.1)',sub?'#6ee7b7':'#64748b',sub?'rgba(5,150,105,.3)':'rgba(100,116,139,.3)')}>{sub?'✅':'⏳'}</span></div></div>;})}</div>)}
      {tab==='vacs'&&<>{allV.filter(v=>v.status==='pending').length>0&&<div style={S.card}><div style={{fontWeight:900,color:'#fcd34d',marginBottom:'.5rem'}}>⏳ ממתינות</div>{allV.filter(v=>v.status==='pending').map(v=><div key={v.id} style={{borderBottom:'1px solid #1e2a40',padding:'.5rem 0'}}><div style={{fontWeight:700,fontSize:'.82rem'}}>{v.worker} — {v.from?.label}–{v.to?.label}</div><div style={{fontSize:'.7rem',color:'#64748b'}}>{v.reason}</div><div style={{display:'flex',gap:'.4rem',marginTop:'.4rem'}}><button onClick={()=>saveV(allV.map(x=>x.id===v.id?{...x,status:'approved'}:x))} style={{...S.btn('#059669','white'),fontSize:'.75rem',padding:'.3rem .7rem'}}>✅ אשר</button><button onClick={()=>saveV(allV.map(x=>x.id===v.id?{...x,status:'rejected'}:x))} style={{...S.btn('#dc2626','white'),fontSize:'.75rem',padding:'.3rem .7rem'}}>❌ דחה</button></div></div>)}</div>}{!allV.length&&<div style={{...S.card,color:'#64748b',textAlign:'center'}}>אין בקשות</div>}</>}
      {tab==='sched'&&<><div style={{display:'flex',gap:'.5rem',marginBottom:'.75rem',alignItems:'center'}}><button onClick={generate} style={{...S.btn('#2563eb','white'),padding:'.55rem 1rem'}}>⚡ צור סידור</button>{schedReady&&<><button onClick={()=>setWkIdx(i=>Math.max(0,i-1))} disabled={wkIdx===0} style={{...S.btn('#1e2a40','#94a3b8'),padding:'.3rem .6rem'}}>‹</button><span style={{fontSize:'.82rem',fontWeight:700}}>{weeks[wkIdx]?.[0]?.label}–{weeks[wkIdx]?.[weeks[wkIdx].length-1]?.label}</span><button onClick={()=>setWkIdx(i=>Math.min(weeks.length-1,i+1))} disabled={wkIdx>=weeks.length-1} style={{...S.btn('#1e2a40','#94a3b8'),padding:'.3rem .6rem'}}>›</button></>}</div>{!schedReady&&<div style={{textAlign:'center',color:'#475569',padding:'2rem'}}>לחץ ⚡</div>}{schedReady&&weeks[wkIdx]&&<WT week={weeks[wkIdx]}/>}</>}
      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={()=>setModal(null)}><div style={{background:'#0f1623',border:'1px solid #243048',borderRadius:14,padding:'1.25rem',width:'100%',maxWidth:340,maxHeight:'82vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'.75rem'}}><div style={{fontWeight:900}}>✏️ שיבוץ</div><button onClick={()=>setModal(null)} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'1.3rem'}}>✕</button></div>{pool.map(r=><button key={r.name} onClick={()=>{const ns={...schedule};if(!ns[modal.sk])ns[modal.sk]={};ns[modal.sk][modal.field]=r.name;saveS(ns,true);showToast(`✏️ ${r.name}`);setModal(null);}} style={{...S.btn((schedule[modal.sk]||{})[modal.field]===r.name?'#1e3a5f':'#0f1623','#e2e8f0'),textAlign:'right',width:'100%',border:`1px solid ${POP_COLOR[r.pop]}40`,marginBottom:'.3rem'}}><span style={{color:POP_COLOR[r.pop],fontWeight:700}}>{r.name}</span></button>)}<button onClick={()=>{const ns={...schedule};if(!ns[modal.sk])ns[modal.sk]={};ns[modal.sk][modal.field]=null;saveS(ns,true);showToast('🗑');setModal(null);}} style={{...S.btn('rgba(220,38,38,.1)','#fca5a5'),width:'100%',border:'1px solid rgba(220,38,38,.25)',marginTop:'.3rem'}}>🗑 פנה תא</button></div></div>}
    </div>
  );
}

function SickPage({schedule,schedReady,allSick,saveSick,saveS,showToast,setPage}){
  const [worker,setWorker]=useState('');const [sel,setSel]=useState(null);
  const today=new Date(),tom=new Date(today);tom.setDate(tom.getDate()+1);
  const keys=[`${today.getDate()}-${today.getMonth()+1}`,`${tom.getDate()}-${tom.getMonth()+1}`];
  const upcoming=worker&&schedReady?keys.flatMap(sk=>{const slot=schedule[sk]||{};return Object.entries(slot).filter(([k,v])=>v===worker&&!k.includes('achmash')).map(([k])=>{const shKey=k.split('_')[0];if(!['a','b','c'].includes(shKey))return null;const[d,m]=sk.split('-').map(Number);const dObj=SCHEDULE_DAYS.find(x=>x.day===d&&x.month===m);return{day:d,month:m,shKey,field:k,slotKey:sk,label:dObj?.label||sk,jsDay:dObj?.jsDay};}).filter(Boolean);}):[];
  const submit=()=>{if(!sel)return;const{day,month,shKey,field,slotKey,label}=sel;const ns={...schedule,[slotKey]:{...schedule[slotKey],[field]:null}};const ak=`${shKey}_achmash`;if(ns[slotKey][ak]===worker){const inS=Object.entries(ns[slotKey]).filter(([k,v])=>v&&k.startsWith(shKey+'_')&&!k.includes('achmash')).map(([,v])=>v);ns[slotKey][ak]=inS.find(n=>ACHMASH.includes(n)||POP_MAP[n]==='student')||null;}saveS(ns,true);saveSick([...allSick,{id:Date.now(),worker,day,month,shKey,label,reportedAt:new Date().toLocaleTimeString('he-IL'),resolved:false}]);showToast(`🤒 ${worker} הוסר/ה`);setWorker('');setSel(null);};
  const active=allSick.filter(r=>!r.resolved);const shLbl={a:'א׳',b:'ב׳',c:'ג׳'};
  return(
    <div style={S.wrap}>
      <Header title="🤒 דיווח מחלה" onBack={()=>setPage('home')}/>
      <div style={S.card}><WSelect value={worker} onChange={w=>{setWorker(w);setSel(null);}} showDesk/></div>
      {worker&&schedReady&&upcoming.length>0&&<div style={S.card}><div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'.5rem'}}>בחר/י משמרת:</div>{upcoming.map((s,i)=><button key={i} onClick={()=>setSel(s)} style={{...S.btn(sel?.field===s.field?'rgba(220,38,38,.1)':'#0f1623','#e2e8f0'),width:'100%',textAlign:'right',display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.35rem',border:`1.5px solid ${sel?.field===s.field?'#fca5a5':'#243048'}`}}><span style={{fontWeight:700}}>{s.label} {HEB_DAYS[s.jsDay||0]}</span><span style={S.tag('rgba(37,99,235,.12)','#93c5fd','rgba(37,99,235,.25)')}>{shLbl[s.shKey]}</span></button>)}{sel&&<button onClick={submit} style={{...S.btn('#dc2626','white'),width:'100%',padding:'.6rem',marginTop:'.4rem'}}>🤒 אשר</button>}</div>}
      {worker&&schedReady&&!upcoming.length&&<div style={{...S.card,color:'#64748b',textAlign:'center'}}>אין משמרות קרובות</div>}
      {active.length>0&&<div style={S.card}><div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'.5rem'}}>דיווחים פעילים</div>{active.map(r=><div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.35rem 0',borderBottom:'1px solid #1e2a40'}}><div><span style={{fontWeight:700,color:'#fca5a5'}}>🤒 {r.worker}</span><span style={{fontSize:'.7rem',color:'#64748b'}}> {r.label} | {shLbl[r.shKey]}</span></div><button onClick={()=>saveSick(allSick.map(x=>x.id===r.id?{...x,resolved:true}:x))} style={{...S.btn('rgba(5,150,105,.1)','#6ee7b7'),fontSize:'.7rem',padding:'.2rem .5rem',border:'1px solid rgba(5,150,105,.3)'}}>✅ סגור</button></div>)}</div>}
    </div>
  );
}
