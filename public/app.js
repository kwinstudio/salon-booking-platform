const STORAGE_KEY='salon-booking-platform-recovery-v2';
const todayISO=()=>new Date().toISOString().slice(0,10);
const money=new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'});
const dateFmt=new Intl.DateTimeFormat('nl-NL',{weekday:'short',day:'numeric',month:'short'});

const seed=()=>({
  salon:{name:'Studio Nova',location:'Rotterdam'},
  clients:[
    {id:'c1',name:'Sophie van Dijk',email:'sophie@example.nl',phone:'06 18 44 20 11',visits:8,last:'2026-09-26'},
    {id:'c2',name:'Mila de Jong',email:'mila@example.nl',phone:'06 27 50 11 83',visits:4,last:'2026-09-29'},
    {id:'c3',name:'Noor Bakker',email:'noor@example.nl',phone:'06 31 89 20 66',visits:11,last:'2026-10-01'},
    {id:'c4',name:'Emma Smit',email:'emma@example.nl',phone:'06 48 72 39 10',visits:2,last:'2026-09-18'},
    {id:'c5',name:'Lina Visser',email:'lina@example.nl',phone:'06 22 14 90 75',visits:6,last:'2026-09-30'}
  ],
  services:[
    {id:'s1',name:'Knippen & stylen',duration:45,price:42.5,category:'Hair'},
    {id:'s2',name:'Balayage',duration:150,price:135,category:'Color'},
    {id:'s3',name:'Wenkbrauwen',duration:30,price:29.5,category:'Beauty'},
    {id:'s4',name:'Manicure',duration:60,price:45,category:'Nails'},
    {id:'s5',name:'Gezichtsbehandeling',duration:75,price:79,category:'Skin'}
  ],
  staff:[
    {id:'t1',name:'Naomi',role:'Senior stylist',hours:32},{id:'t2',name:'Yara',role:'Beauty specialist',hours:28},{id:'t3',name:'Fleur',role:'Stylist',hours:24}
  ],
  bookings:[
    {id:'b1',clientId:'c1',serviceId:'s1',staffId:'t1',date:todayISO(),time:'09:30',status:'confirmed'},
    {id:'b2',clientId:'c3',serviceId:'s3',staffId:'t2',date:todayISO(),time:'11:00',status:'confirmed'},
    {id:'b3',clientId:'c2',serviceId:'s2',staffId:'t1',date:todayISO(),time:'13:00',status:'confirmed'},
    {id:'b4',clientId:'c5',serviceId:'s4',staffId:'t3',date:todayISO(),time:'15:30',status:'pending'}
  ],
  waitlist:[{id:'w1',clientId:'c4',serviceId:'s1',preferred:'Deze week',note:'Na 15:00'}]
});
let state=load();
let selectedAgendaDate=todayISO();
function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||seed()}catch{return seed()}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function byId(arr,id){return arr.find(x=>x.id===id)}
function initials(name){return name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function titleFor(route){return ({dashboard:'Overzicht',agenda:'Agenda',clients:'Klanten',services:'Diensten',team:'Team',waitlist:'Wachtlijst',settings:'Instellingen'})[route]||'Overzicht'}
function route(){return location.hash.replace('#','')||'dashboard'}
function setActive(routeName){document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===routeName));document.querySelector('#page-title').textContent=titleFor(routeName)}
function options(arr,label){return arr.map(x=>`<option value="${x.id}">${escapeHtml(label(x))}</option>`).join('')}

function dashboard(){
  const day=state.bookings.filter(b=>b.date===todayISO()&&b.status!=='cancelled').sort((a,b)=>a.time.localeCompare(b.time));
  const revenue=day.reduce((n,b)=>n+(byId(state.services,b.serviceId)?.price||0),0);
  const confirmed=day.filter(b=>b.status==='confirmed').length;
  const occupancy=Math.min(100,Math.round(day.reduce((n,b)=>n+(byId(state.services,b.serviceId)?.duration||0),0)/(state.staff.length*8*60)*100));
  return `<section class="page"><div class="hero-row"><div><h1>Goedemorgen 👋</h1><p>Dit gebeurt er vandaag in ${escapeHtml(state.salon.name)}.</p></div></div>
  <div class="metrics">
    <article class="metric"><div class="label">Afspraken vandaag</div><div class="value">${day.length}</div><div class="delta">${confirmed} bevestigd</div></article>
    <article class="metric"><div class="label">Verwachte omzet</div><div class="value">${money.format(revenue)}</div><div class="delta">Op basis van geplande diensten</div></article>
    <article class="metric"><div class="label">Bezetting</div><div class="value">${occupancy}%</div><div class="delta">Vandaag</div></article>
    <article class="metric"><div class="label">Actieve klanten</div><div class="value">${state.clients.length}</div><div class="delta">Lokale recovery-data</div></article>
  </div>
  <div class="layout-2">
    <section class="panel"><div class="panel-head"><div><h2>Vandaag</h2><p>Geplande afspraken</p></div><button class="ghost-btn" data-go="agenda">Open agenda</button></div><div class="panel-body appointment-list">${day.length?day.map(bookingRow).join(''):'<div class="empty">Nog geen afspraken vandaag.</div>'}</div></section>
    <div style="display:grid;gap:18px;align-content:start">
      <section class="panel"><div class="panel-head"><div><h2>Snel regelen</h2><p>Veelgebruikte acties</p></div></div><div class="panel-body quick-actions">
        <button class="quick-action" data-action="new-booking"><b>Nieuwe afspraak</b><span>Plan klant + dienst + medewerker</span></button>
        <button class="quick-action" data-action="new-client"><b>Nieuwe klant</b><span>Voeg een CRM-profiel toe</span></button>
        <button class="quick-action" data-go="waitlist"><b>Wachtlijst</b><span>${state.waitlist.length} wachtend</span></button>
        <button class="quick-action" data-go="services"><b>Diensten</b><span>${state.services.length} actief</span></button>
      </div></section>
      <section class="panel"><div class="panel-head"><div><h2>Teamcapaciteit</h2><p>Indicatieve planning vandaag</p></div></div><div class="panel-body">${state.staff.map(s=>{const mins=day.filter(b=>b.staffId===s.id).reduce((n,b)=>n+(byId(state.services,b.serviceId)?.duration||0),0);const pct=Math.min(100,Math.round(mins/(8*60)*100));return `<div class="mini-stat"><span>${escapeHtml(s.name)}</span><strong>${pct}%</strong></div><div class="bar"><i style="width:${pct}%"></i></div>`}).join('')}</div></section>
    </div>
  </div></section>`
}
function bookingRow(b){const c=byId(state.clients,b.clientId),s=byId(state.services,b.serviceId),t=byId(state.staff,b.staffId);return `<div class="appointment"><div class="time">${b.time}</div><div class="client-cell"><div class="avatar">${initials(c?.name||'?')}</div><div><strong>${escapeHtml(c?.name||'Onbekend')}</strong><small>${escapeHtml(s?.name||'Dienst')} · ${escapeHtml(t?.name||'Team')}</small></div></div><span class="badge ${b.status}">${b.status==='confirmed'?'Bevestigd':'In afwachting'}</span></div>`}
function agenda(){const bookings=state.bookings.filter(b=>b.date===selectedAgendaDate&&b.status!=='cancelled').sort((a,b)=>a.time.localeCompare(b.time));const hours=Array.from({length:11},(_,i)=>8+i);return `<section class="page"><div class="hero-row"><div><h1>Agenda</h1><p>Bekijk en plan afspraken per dag.</p></div><div class="toolbar"><input id="agenda-date" type="date" value="${selectedAgendaDate}"><button class="primary-btn" data-action="new-booking">+ Afspraak</button></div></div><section class="calendar-day"><div class="calendar-head"><strong>${dateFmt.format(new Date(selectedAgendaDate+'T12:00:00'))}</strong><span class="badge confirmed">${bookings.length} afspraken</span></div><div class="timeline">${hours.map(h=>{const hs=String(h).padStart(2,'0');const inHour=bookings.filter(b=>b.time.startsWith(hs+':'));return `<div class="hour">${hs}:00</div><div class="slot">${inHour.map(b=>{const c=byId(state.clients,b.clientId),s=byId(state.services,b.serviceId),t=byId(state.staff,b.staffId);return `<div class="slot-card"><b>${b.time} · ${escapeHtml(c?.name||'')}</b>${escapeHtml(s?.name||'')} · ${escapeHtml(t?.name||'')}</div>`}).join('')}</div>`}).join('')}</div></section></section>`}
function clients(){return `<section class="page"><div class="hero-row"><div><h1>Klanten</h1><p>CRM-overzicht met contactgegevens en bezoekhistorie.</p></div><div class="toolbar"><input type="search" id="client-search" placeholder="Zoek klant…"><button class="primary-btn" data-action="new-client">+ Klant</button></div></div><section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Klant</th><th>Contact</th><th>Bezoeken</th><th>Laatste bezoek</th></tr></thead><tbody id="clients-body">${clientRows(state.clients)}</tbody></table></div></section></section>`}
function clientRows(list){return list.map(c=>`<tr><td><div class="client-cell"><div class="avatar">${initials(c.name)}</div><strong>${escapeHtml(c.name)}</strong></div></td><td>${escapeHtml(c.email||'—')}<br><small>${escapeHtml(c.phone||'')}</small></td><td>${c.visits||0}</td><td>${c.last?dateFmt.format(new Date(c.last+'T12:00:00')):'—'}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">Geen klanten gevonden.</td></tr>'}
function services(){return `<section class="page"><div class="hero-row"><div><h1>Diensten</h1><p>Prijzen en behandeltijden die in de boekingsflow gebruikt worden.</p></div></div><div class="cards">${state.services.map(s=>`<article class="service-card"><div class="service-top"><div><span class="badge confirmed">${escapeHtml(s.category)}</span><h3 style="margin-top:10px">${escapeHtml(s.name)}</h3></div><div class="price">${money.format(s.price)}</div></div><p>${s.duration} minuten · online boekbaar in deze recovery-build</p></article>`).join('')}</div></section>`}
function team(){return `<section class="page"><div class="hero-row"><div><h1>Team</h1><p>Medewerkers die aan afspraken gekoppeld kunnen worden.</p></div></div><div class="cards">${state.staff.map(s=>`<article class="team-card"><div class="team-top"><div class="team-avatar">${initials(s.name)}</div><span class="badge confirmed">Actief</span></div><h3 style="margin-top:14px">${escapeHtml(s.name)}</h3><p>${escapeHtml(s.role)}<br>${s.hours} uur per week</p></article>`).join('')}</div></section>`}
function waitlist(){return `<section class="page"><div class="hero-row"><div><h1>Wachtlijst</h1><p>Klanten die willen worden gebeld als er een plek vrijkomt.</p></div></div><div class="cards">${state.waitlist.length?state.waitlist.map(w=>{const c=byId(state.clients,w.clientId),s=byId(state.services,w.serviceId);return `<article class="wait-card"><span class="badge pending">Wachtend</span><h3>${escapeHtml(c?.name||'Klant')}</h3><p>${escapeHtml(s?.name||'Dienst')} · ${escapeHtml(w.preferred)}<br>${escapeHtml(w.note||'')}</p><button class="ghost-btn" data-wait-book="${w.id}">Plan afspraak</button></article>`}).join(''):'<div class="empty">De wachtlijst is leeg.</div>'}</div></section>`}
function settings(){return `<section class="page"><div class="hero-row"><div><h1>Instellingen</h1><p>Basisgegevens voor deze recovery-build.</p></div></div><div class="layout-2"><section class="panel"><div class="panel-head"><div><h2>Salonprofiel</h2><p>Lokaal opgeslagen</p></div></div><div class="panel-body"><form class="settings-form" id="settings-form"><label>Salonnaam<input id="salon-name" value="${escapeHtml(state.salon.name)}" required></label><label>Vestiging<input id="salon-location" value="${escapeHtml(state.salon.location)}"></label><button class="primary-btn" type="submit">Opslaan</button></form></div></section><div class="notice"><strong>Recovery mode</strong><br>Deze live build heeft nog geen Supabase-productiedatabase gekoppeld. Data blijft daarom op dit apparaat in localStorage. De bestaande treatment-record securitypatches staan wel in de bronrepo en blijven onderdeel van de herstelroute.</div></div></section>`}
function render(){const r=route();setActive(r);const view={dashboard,agenda,clients,services,team,waitlist,settings}[r]||dashboard;document.querySelector('#app').innerHTML=view();bindPage();document.querySelector('#app').focus({preventScroll:true})}
function bindPage(){document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>location.hash=el.dataset.go));document.querySelectorAll('[data-action="new-booking"]').forEach(el=>el.addEventListener('click',openBooking));document.querySelectorAll('[data-action="new-client"]').forEach(el=>el.addEventListener('click',()=>document.querySelector('#client-dialog').showModal()));const d=document.querySelector('#agenda-date');if(d)d.addEventListener('change',()=>{selectedAgendaDate=d.value;render()});const search=document.querySelector('#client-search');if(search)search.addEventListener('input',()=>{const q=search.value.toLowerCase();document.querySelector('#clients-body').innerHTML=clientRows(state.clients.filter(c=>[c.name,c.email,c.phone].join(' ').toLowerCase().includes(q)))});document.querySelectorAll('[data-wait-book]').forEach(btn=>btn.addEventListener('click',()=>{const w=state.waitlist.find(x=>x.id===btn.dataset.waitBook);openBooking(w?.clientId,w?.serviceId)}));const sf=document.querySelector('#settings-form');if(sf)sf.addEventListener('submit',e=>{e.preventDefault();state.salon.name=document.querySelector('#salon-name').value.trim();state.salon.location=document.querySelector('#salon-location').value.trim();save();document.querySelector('#brand-name').textContent=state.salon.name;toast('Salonprofiel opgeslagen')})}
function openBooking(clientId,serviceId){const dlg=document.querySelector('#booking-dialog');document.querySelector('#booking-client').innerHTML=options(state.clients,c=>c.name);document.querySelector('#booking-service').innerHTML=options(state.services,s=>`${s.name} · ${money.format(s.price)}`);document.querySelector('#booking-staff').innerHTML=options(state.staff,s=>s.name);document.querySelector('#booking-date').value=selectedAgendaDate||todayISO();document.querySelector('#booking-time').value='10:00';if(clientId)document.querySelector('#booking-client').value=clientId;if(serviceId)document.querySelector('#booking-service').value=serviceId;dlg.showModal()}
function conflict(candidate){const service=byId(state.services,candidate.serviceId);const start=parseTime(candidate.time),end=start+(service?.duration||30);return state.bookings.some(b=>{if(b.date!==candidate.date||b.staffId!==candidate.staffId||b.status==='cancelled')return false;const s=byId(state.services,b.serviceId),bs=parseTime(b.time),be=bs+(s?.duration||30);return start<be&&end>bs})}
function parseTime(t){const [h,m]=t.split(':').map(Number);return h*60+m}

document.querySelector('#booking-form').addEventListener('submit',e=>{e.preventDefault();const booking={id:crypto.randomUUID(),clientId:document.querySelector('#booking-client').value,serviceId:document.querySelector('#booking-service').value,staffId:document.querySelector('#booking-staff').value,date:document.querySelector('#booking-date').value,time:document.querySelector('#booking-time').value,status:document.querySelector('#booking-status').value};if(conflict(booking)){toast('Deze medewerker heeft dan al een afspraak.');return}state.bookings.push(booking);save();document.querySelector('#booking-dialog').close();selectedAgendaDate=booking.date;toast('Afspraak opgeslagen');render()});
document.querySelector('#client-form').addEventListener('submit',e=>{e.preventDefault();const c={id:crypto.randomUUID(),name:document.querySelector('#client-name').value.trim(),email:document.querySelector('#client-email').value.trim(),phone:document.querySelector('#client-phone').value.trim(),visits:0,last:null};state.clients.push(c);save();document.querySelector('#client-dialog').close();e.target.reset();toast('Klant toegevoegd');render()});
document.querySelector('#new-booking').addEventListener('click',()=>openBooking());document.querySelector('#mobile-new-booking').addEventListener('click',()=>openBooking());document.querySelector('#reset-demo').addEventListener('click',()=>{if(confirm('Demo-data terugzetten naar de beginstand?')){state=seed();save();render();toast('Demo-data gereset')}});document.querySelector('#menu-button').addEventListener('click',()=>{const s=document.querySelector('.sidebar');s.classList.toggle('open');document.querySelector('#menu-button').setAttribute('aria-expanded',String(s.classList.contains('open')))});document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.sidebar').classList.remove('open')));
window.addEventListener('hashchange',render);document.querySelector('#brand-name').textContent=state.salon.name;document.querySelector('#today-label').textContent=new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long'}).format(new Date());render();
