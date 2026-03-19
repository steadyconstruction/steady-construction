
/* ============================================================
   STEADY CONSTRUCTION — CLIENT PORTAL
   Zero innerHTML string building with onclick.
   All interactivity uses DOM createElement + addEventListener.
   ============================================================ */

/* ── DATA ── */
var portalTickets = [
  { ref:'SC-2024-041', type:'Plumbing', priority:'Urgent',
    address:'14 Maple Street, Dublin 6',
    desc:'Leak under bathroom sink — water dripping from waste pipe connection. Started yesterday evening.',
    status:'In Progress', contractor:'Plumber', scheduled:'Today 2:00 PM',
    price:'EUR 220–380', paid:false, payRef:'', payStatus:'Awaiting Payment',
    progress:3,
    messages:[
      {from:'system', text:'Ticket SC-2024-041 created.', time:'9:02 AM'},
      {from:'team', text:'Hi John, our plumber will be there at 2pm today. He will call 30 minutes before arrival.', time:'9:45 AM', name:'Steady Team'},
      {from:'client', text:'No problem — key safe at front door, code 1234.', time:'10:12 AM', name:'You'},
      {from:'team', text:'On site now. Found the issue — faulty waste trap. Replacing now, about 30 minutes.', time:'2:15 PM', name:'Plumber'}
    ]
  },
  { ref:'SC-2024-039', type:'Cleaning', priority:'Standard',
    address:'8 Orchard Road, Dublin 4',
    desc:'End-of-tenancy deep clean required. 3-bed apartment, tenants leaving on Wed 18 Mar.',
    status:'Scheduled', contractor:'Cleaning Team', scheduled:'Thu 18 Mar, 9:00 AM',
    price:'EUR 280', paid:false, payRef:'', payStatus:'Awaiting Payment',
    progress:2,
    messages:[
      {from:'system', text:'Ticket SC-2024-039 created.', time:'Yesterday 4:00 PM'},
      {from:'team', text:'Hi John, the clean is booked for Thursday at 9am. Estimated 4 hours.', time:'Yesterday 5:00 PM', name:'Steady Team'}
    ]
  },
  { ref:'SC-2024-037', type:'Electrical', priority:'Standard',
    address:'22 Pine Avenue, Dublin 4',
    desc:'Full consumer unit upgrade — outdated fuse box replaced with modern RCD board.',
    status:'Completed', contractor:'Electrician', scheduled:'10 Mar 2026',
    price:'EUR 480', paid:false, payRef:'', payStatus:'Awaiting Payment',
    progress:4,
    messages:[
      {from:'system', text:'Job completed on 10 Mar 2026. Invoice issued.', time:'10 Mar'},
      {from:'team', text:'All done John. New RCD board fitted and tested. Certificate of compliance issued. Invoice to follow.', time:'10 Mar', name:'Electrician'}
    ]
  },
  { ref:'SC-2024-031', type:'Roofing', priority:'Urgent',
    address:'14 Maple Street, Dublin 6',
    desc:'Roof repair — several slates displaced after storm damage. Repaired and sealed.',
    status:'Completed', contractor:'Roofer', scheduled:'22 Feb 2026',
    price:'EUR 1,250', paid:true, payRef:'REF-2024-1192', payStatus:'Paid',
    progress:4,
    messages:[
      {from:'system', text:'Job completed.', time:'22 Feb'},
      {from:'team', text:'All sorted John. 14 slates replaced and ridge repointed. Before and after photos attached.', time:'22 Feb', name:'Roofer'}
    ]
  }
];

/* ── HELPERS ── */
var STATUS_COLOURS = {
  'In Progress':      {bg:'#fff3ec', col:'#D4601D'},
  'Scheduled':        {bg:'#eff6ff', col:'#2563eb'},
  'Completed':        {bg:'#f0fdf4', col:'#16a34a'},
  'Pending':          {bg:'#fafafa', col:'#9199a8'},
  'Awaiting Payment': {bg:'#fffbeb', col:'#d97706'},
  'Under Review':     {bg:'#f5f3ff', col:'#7c3aed'},
  'Paid':             {bg:'#f0fdf4', col:'#16a34a'},
  'Active':           {bg:'#f0fdf4', col:'#16a34a'},
  'Inactive':         {bg:'#fafafa', col:'#9199a8'},
  'Urgent':           {bg:'#fef2f2', col:'#dc2626'}
};

function mkEl(tag, styles, text) {
  var e = document.createElement(tag);
  if (styles) e.style.cssText = styles;
  if (text !== undefined) e.textContent = String(text);
  return e;
}

function mkPill(text) {
  var s = STATUS_COLOURS[text] || {bg:'#f0f1f3', col:'#9199a8'};
  var e = mkEl('span', 'font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;background:' + s.bg + ';color:' + s.col + ';white-space:nowrap;display:inline-block;', text);
  return e;
}

/* ── AUTH ── */
function openPortal() {
  document.getElementById('portal-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closePortal() {
  document.getElementById('portal-modal').style.display = 'none';
  document.body.style.overflow = '';
}
function doLogin() {
  var email = document.getElementById('portal-email').value.trim().toLowerCase();
  var pass = document.getElementById('portal-password').value;
  var err = document.getElementById('login-error');
  if (email === 'demo@steadyconstruction.ie' && pass === 'demo1234') {
    closePortal();
    document.getElementById('portal-dashboard').style.display = 'block';
    document.body.style.overflow = 'hidden';
    initPortal();
  } else {
    err.style.display = 'block';
    err.textContent = 'Incorrect email or password. Try demo@steadyconstruction.ie / demo1234';
  }
}
function logoutPortal() {
  document.getElementById('portal-dashboard').style.display = 'none';
  document.body.style.overflow = '';
}
window.addEventListener('load', function() {
  var pw = document.getElementById('portal-password');
  if (pw) pw.addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });
});

/* ── NAV ── */
function showPortalView(view) {
  ['dashboard','tickets','payments','new-request'].forEach(function(v) {
    var el = document.getElementById('pview-' + v);
    var btn = document.getElementById('pnav-' + v);
    if (el) el.style.display = 'none';
    if (btn) { btn.style.background = 'transparent'; btn.style.color = '#9199a8'; btn.style.fontWeight = '500'; }
  });
  var active = document.getElementById('pview-' + view);
  var activeBtn = document.getElementById('pnav-' + view);
  if (active) active.style.display = 'block';
  if (activeBtn) { activeBtn.style.background = '#D4601D'; activeBtn.style.color = '#fff'; activeBtn.style.fontWeight = '600'; }
  if (view === 'tickets') { renderTicketList(); showTicketList(); }
  if (view === 'payments') renderPayments();
  if (view === 'dashboard') renderDashboard();
}

function initPortal() {
  renderDashboard();
  showPortalView('dashboard');
}

/* ── DASHBOARD ── */
function renderDashboard() {
  var active = portalTickets.filter(function(t){ return t.status==='In Progress'||t.status==='Scheduled'||t.status==='Pending'; });
  var pendingPay = portalTickets.filter(function(t){ return !t.paid && t.status==='Completed'; });

  var countEl = document.getElementById('dash-active-count');
  var payCountEl = document.getElementById('dash-payment-count');
  var kpiActive = document.getElementById('kpi-active');
  var kpiPay = document.getElementById('kpi-payment');
  if (countEl) countEl.textContent = active.length;
  if (payCountEl) payCountEl.textContent = pendingPay.length;
  if (kpiActive) kpiActive.textContent = active.length;
  if (kpiPay) kpiPay.textContent = pendingPay.length;

  /* Active job cards — DOM only */
  var ajEl = document.getElementById('dash-active-jobs');
  if (ajEl) {
    ajEl.innerHTML = '';
    if (!active.length) {
      ajEl.appendChild(mkEl('div', 'background:#fff;border-radius:14px;padding:32px;text-align:center;color:#9199a8;border:1px solid #e5e1dd;', 'No active jobs at the moment.'));
    } else {
      active.forEach(function(t) {
        var card = mkEl('div', 'background:#fff;border-radius:14px;padding:22px 24px;border:1px solid #e5e1dd;cursor:pointer;margin-bottom:12px;');
        card.addEventListener('mouseover', function(){ card.style.borderColor='#D4601D'; card.style.boxShadow='0 4px 20px rgba(212,96,29,0.1)'; });
        card.addEventListener('mouseout',  function(){ card.style.borderColor='#e5e1dd'; card.style.boxShadow='none'; });
        card.addEventListener('click', function(){ openTicketDetail(t.ref); });

        var top = mkEl('div', 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;');
        var pillRow = mkEl('div', 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;');
        pillRow.appendChild(mkEl('span', 'font-size:12px;font-weight:600;color:#9199a8;', t.ref));
        pillRow.appendChild(mkPill(t.status));
        var right = mkEl('div', 'text-align:right;font-size:12px;color:#9199a8;');
        right.appendChild(mkEl('div', '', t.priority));
        right.appendChild(mkEl('span', 'font-weight:500;color:#4a5264;', t.type));
        top.appendChild(pillRow); top.appendChild(right);

        var title = mkEl('div', 'font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px;', t.type + ' — ' + t.address);
        var sub = mkEl('div', 'font-size:13px;color:#9199a8;margin-bottom:14px;', t.contractor + ' assigned · Scheduled: ' + t.scheduled);

        var barCol = t.status==='Scheduled' ? '#2563eb' : '#D4601D';
        var pct = Math.round((t.progress/4)*100);
        var barWrap = mkEl('div', 'background:#f0f1f3;border-radius:4px;height:5px;overflow:hidden;margin-bottom:6px;');
        barWrap.appendChild(mkEl('div', 'width:'+pct+'%;height:100%;background:'+barCol+';border-radius:4px;'));

        var barLabel = mkEl('div', 'display:flex;justify-content:space-between;font-size:11px;color:#9199a8;');
        barLabel.appendChild(mkEl('span', '', 'Job received'));
        var mid = mkEl('span', 'color:'+barCol+';font-weight:600;', t.status);
        barLabel.appendChild(mid);
        barLabel.appendChild(mkEl('span', '', 'Completed'));

        card.appendChild(top); card.appendChild(title); card.appendChild(sub);
        card.appendChild(barWrap); card.appendChild(barLabel);
        ajEl.appendChild(card);
      });
    }
  }

  /* Activity feed */
  var acEl = document.getElementById('dash-activity');
  if (acEl) {
    var activities = [
      {icon:'OK', text:'Job completed — Electrical upgrade, 22 Pine Ave', sub:'2 days ago · SC-2024-037', col:'#f0fdf4', tc:'#16a34a'},
      {icon:'$',  text:'Invoice issued — EUR 480.00 due by 23 Mar', sub:'3 days ago · SC-2024-037', col:'#fff3ec', tc:'#D4601D'},
      {icon:'P',  text:'Plumber assigned to SC-2024-041', sub:'Today · SC-2024-041', col:'#eff6ff', tc:'#2563eb'}
    ];
    acEl.innerHTML = '';
    activities.forEach(function(a, i) {
      var row = mkEl('div', 'padding:16px 20px;' + (i < activities.length-1 ? 'border-bottom:1px solid #f0f1f3;' : '') + 'display:flex;align-items:center;gap:14px;');
      row.appendChild(mkEl('div', 'width:34px;height:34px;background:'+a.col+';border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:'+a.tc+';flex-shrink:0;', a.icon));
      var info = mkEl('div', '');
      info.appendChild(mkEl('div', 'font-size:14px;font-weight:500;color:#1a1a2e;', a.text));
      info.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;margin-top:2px;', a.sub));
      row.appendChild(info);
      acEl.appendChild(row);
    });
  }
}

/* ── TICKET LIST ── */
function renderTicketList() {
  var search = ((document.getElementById('ticket-search')||{}).value||'').toLowerCase();
  var statusF = (document.getElementById('ticket-status-filter')||{}).value||'';
  var filtered = portalTickets.filter(function(t){
    return (!search || t.ref.toLowerCase().includes(search) || t.type.toLowerCase().includes(search) || t.address.toLowerCase().includes(search) || t.desc.toLowerCase().includes(search))
      && (!statusF || t.status===statusF);
  });
  var container = document.getElementById('ticket-list-items');
  if (!container) return;
  container.innerHTML = '';
  if (!filtered.length) {
    container.appendChild(mkEl('div', 'background:#fff;border-radius:14px;padding:40px;text-align:center;color:#9199a8;border:1px solid #e5e1dd;', 'No tickets match your search.'));
    return;
  }
  filtered.forEach(function(t) {
    var card = mkEl('div', 'background:#fff;border-radius:14px;padding:20px 24px;border:1px solid #e5e1dd;margin-bottom:10px;cursor:pointer;');
    card.addEventListener('mouseover', function(){ card.style.borderColor='#D4601D'; card.style.boxShadow='0 2px 12px rgba(212,96,29,0.08)'; });
    card.addEventListener('mouseout',  function(){ card.style.borderColor='#e5e1dd'; card.style.boxShadow='none'; });
    card.addEventListener('click', function(){ openTicketDetail(t.ref); });

    var row = mkEl('div', 'display:flex;justify-content:space-between;align-items:flex-start;gap:12px;');
    var left = mkEl('div', 'flex:1;min-width:0;');
    var pills = mkEl('div', 'display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;');
    pills.appendChild(mkEl('span', 'font-size:11px;font-weight:700;color:#9199a8;', t.ref));
    pills.appendChild(mkPill(t.status));
    left.appendChild(pills);
    left.appendChild(mkEl('div', 'font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px;', t.type + ' — ' + t.address));
    left.appendChild(mkEl('div', 'font-size:13px;color:#9199a8;', t.desc.substring(0,80) + '...'));
    var right = mkEl('div', 'flex-shrink:0;text-align:right;');
    right.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;', t.priority));
    right.appendChild(mkEl('div', 'font-size:13px;font-weight:500;color:#4a5264;margin-top:2px;', t.type));
    row.appendChild(left); row.appendChild(right);
    card.appendChild(row);
    container.appendChild(card);
  });
}

function showTicketList() {
  var lv = document.getElementById('ticket-list-view');
  var dv = document.getElementById('ticket-detail-view');
  if (lv) lv.style.display = 'block';
  if (dv) dv.style.display = 'none';
}

/* ── TICKET DETAIL ── */
function openTicketDetail(ref) {
  var t = portalTickets.find(function(x){ return x.ref===ref; });
  if (!t) return;
  showPortalView('tickets');
  var listView = document.getElementById('ticket-list-view');
  var detailView = document.getElementById('ticket-detail-view');
  if (listView) listView.style.display = 'none';
  if (!detailView) return;
  detailView.style.display = 'block';
  detailView.innerHTML = '';
  detailView.appendChild(buildTicketDetail(t));
}

function buildTicketDetail(t) {
  var wrap = mkEl('div', '');

  /* Back button */
  var back = mkEl('button', 'background:none;border:none;cursor:pointer;font-size:13px;color:#9199a8;margin-bottom:20px;padding:0;font-family:"DM Sans",sans-serif;', '\u2190 Back to Tickets');
  back.addEventListener('mouseover', function(){ back.style.color='#D4601D'; });
  back.addEventListener('mouseout',  function(){ back.style.color='#9199a8'; });
  back.addEventListener('click', function(){
    document.getElementById('ticket-detail-view').style.display='none';
    document.getElementById('ticket-list-view').style.display='block';
    renderTicketList();
  });
  wrap.appendChild(back);

  /* Header */
  var header = mkEl('div', 'display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:24px;');
  var hl = mkEl('div', '');
  hl.appendChild(mkEl('div', 'font-size:12px;font-weight:700;color:#9199a8;margin-bottom:4px;', t.ref + ' · ' + t.type));
  hl.appendChild(mkEl('h2', 'font-size:22px;font-family:"DM Serif Display",serif;color:#1a1a2e;margin-bottom:4px;', t.type + ' — ' + t.address));
  hl.appendChild(mkEl('div', 'font-size:13px;color:#9199a8;', t.priority + ' priority'));
  header.appendChild(hl);
  header.appendChild(mkPill(t.status));
  wrap.appendChild(header);

  /* Info grid */
  var grid = mkEl('div', 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;');
  [['Contractor',t.contractor],['Scheduled',t.scheduled],['Estimate',t.price],['Occupancy','Tenant in residence'],['Access','Key safe — code 1234'],['Trade',t.type]].forEach(function(inf){
    var cell = mkEl('div', 'background:#fff;border-radius:12px;padding:14px 16px;border:1px solid #e5e1dd;');
    cell.appendChild(mkEl('div', 'font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9199a8;margin-bottom:4px;', inf[0]));
    cell.appendChild(mkEl('div', 'font-size:13px;font-weight:600;color:#1a1a2e;', inf[1]));
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);

  /* Progress bar */
  var stageNames = ['Received','Assigned','Scheduled','In Progress','Completed'];
  var progressBox = mkEl('div', 'background:#fff;border-radius:14px;padding:20px 24px;border:1px solid #e5e1dd;margin-bottom:24px;');
  progressBox.appendChild(mkEl('div', 'font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:16px;', 'Job Progress'));
  var stageRow = mkEl('div', 'display:flex;align-items:flex-start;');
  stageNames.forEach(function(s, i) {
    var done = i < t.progress, active = i === t.progress;
    var stageWrap = mkEl('div', 'display:flex;flex-direction:column;align-items:center;flex:1;min-width:0;');
    var lineRow = mkEl('div', 'display:flex;align-items:center;width:100%;');
    var circleBg = active ? '#D4601D' : (done ? '#1a1a2e' : '#dde0e6');
    var circle = mkEl('div', 'width:20px;height:20px;border-radius:50%;background:'+circleBg+';display:flex;align-items:center;justify-content:center;flex-shrink:0;');
    if (done) {
      var tick = document.createElementNS('http://www.w3.org/2000/svg','svg');
      tick.setAttribute('width','12'); tick.setAttribute('height','12'); tick.setAttribute('viewBox','0 0 12 12');
      var poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
      poly.setAttribute('points','2,6 5,9 10,3'); poly.setAttribute('stroke','#fff'); poly.setAttribute('stroke-width','1.8'); poly.setAttribute('fill','none'); poly.setAttribute('stroke-linecap','round');
      tick.appendChild(poly); circle.appendChild(tick);
    } else if (active) {
      circle.appendChild(mkEl('span', 'color:#fff;font-size:8px;font-weight:700;', '>'));
    }
    lineRow.appendChild(circle);
    if (i < stageNames.length-1) {
      lineRow.appendChild(mkEl('div', 'flex:1;height:2px;background:'+(done && t.progress>i?'#D4601D':'#dde0e6')+';margin-top:0;'));
    }
    stageWrap.appendChild(lineRow);
    stageWrap.appendChild(mkEl('div', 'font-size:9px;font-weight:'+(active?'700':'400')+';color:'+(active?'#D4601D':(done?'#1a1a2e':'#9199a8'))+';margin-top:6px;text-align:center;', s));
    stageRow.appendChild(stageWrap);
  });
  progressBox.appendChild(stageRow);
  wrap.appendChild(progressBox);

  /* Description */
  var descBox = mkEl('div', 'background:#fff;border-radius:14px;padding:20px 24px;border:1px solid #e5e1dd;margin-bottom:24px;');
  descBox.appendChild(mkEl('div', 'font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:8px;', 'Issue Description'));
  descBox.appendChild(mkEl('div', 'font-size:13px;color:#4a5264;line-height:1.6;', t.desc));
  wrap.appendChild(descBox);

  /* Chat */
  var chatBox = mkEl('div', 'background:#fff;border-radius:14px;border:1px solid #e5e1dd;overflow:hidden;margin-bottom:24px;');
  var chatHdr = mkEl('div', 'padding:16px 20px;border-bottom:1px solid #f0f1f3;');
  chatHdr.appendChild(mkEl('div', 'font-size:13px;font-weight:700;color:#1a1a2e;', 'Messages'));
  chatHdr.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;', 'Replies go directly to your team'));
  chatBox.appendChild(chatHdr);

  var chatThread = mkEl('div', 'padding:16px 20px;background:#f7f8fa;min-height:80px;max-height:320px;overflow-y:auto;');
  chatThread.id = 'chat-thread-' + t.ref;
  appendMessages(chatThread, t.messages);
  chatBox.appendChild(chatThread);

  var chatFoot = mkEl('div', 'padding:14px 16px;border-top:1px solid #f0f1f3;display:flex;gap:10px;');
  var chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.id = 'chat-input-' + t.ref;
  chatInput.placeholder = 'Type a message...';
  chatInput.style.cssText = 'flex:1;border:1px solid #e5e1dd;border-radius:8px;padding:10px 14px;font-size:13px;font-family:"DM Sans",sans-serif;outline:none;';
  chatInput.addEventListener('focus', function(){ chatInput.style.borderColor='#D4601D'; });
  chatInput.addEventListener('blur',  function(){ chatInput.style.borderColor='#e5e1dd'; });
  chatInput.addEventListener('keydown', function(e){ if(e.key==='Enter') sendPortalMsg(t.ref); });
  var sendBtn = mkEl('button', 'background:#D4601D;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;white-space:nowrap;', 'Send');
  sendBtn.addEventListener('click', function(){ sendPortalMsg(t.ref); });
  chatFoot.appendChild(chatInput); chatFoot.appendChild(sendBtn);
  chatBox.appendChild(chatFoot);
  wrap.appendChild(chatBox);

  /* Payment section */
  wrap.appendChild(buildPaymentSection(t));
  setTimeout(function(){ chatThread.scrollTop = chatThread.scrollHeight; }, 50);
  return wrap;
}

function appendMessages(thread, messages) {
  if (!messages || !messages.length) {
    thread.appendChild(mkEl('div', 'text-align:center;color:#9199a8;font-size:13px;padding:20px 0;', 'No messages yet.'));
    return;
  }
  messages.forEach(function(m) {
    if (m.from === 'system') {
      var sys = mkEl('div', 'text-align:center;margin:8px 0;');
      sys.appendChild(mkEl('span', 'font-size:11px;color:#9199a8;background:#f0f1f3;padding:3px 12px;border-radius:100px;', m.text + ' · ' + m.time));
      thread.appendChild(sys);
    } else {
      var isClient = m.from === 'client';
      var row = mkEl('div', 'display:flex;' + (isClient?'justify-content:flex-end;':'') + 'margin-bottom:12px;');
      var bubble = mkEl('div', 'max-width:72%;background:'+(isClient?'#D4601D':'#fff')+';color:'+(isClient?'#fff':'#1a1a2e')+';border-radius:'+(isClient?'14px 14px 4px 14px':'14px 14px 14px 4px')+';padding:12px 16px;border:'+(isClient?'none':'1px solid #e5e1dd')+';');
      bubble.appendChild(mkEl('div', 'font-size:13px;line-height:1.5;', m.text));
      bubble.appendChild(mkEl('div', 'font-size:11px;'+(isClient?'color:rgba(255,255,255,0.65)':'color:#9199a8')+';margin-top:6px;', (m.name||m.from) + ' · ' + m.time));
      row.appendChild(bubble);
      thread.appendChild(row);
    }
  });
}

function sendPortalMsg(ref) {
  var t = portalTickets.find(function(x){ return x.ref===ref; });
  var input = document.getElementById('chat-input-' + ref);
  if (!t || !input) return;
  var msg = input.value.trim();
  if (!msg) return;
  t.messages.push({from:'client', text:msg, time:'Just now', name:'You'});
  input.value = '';
  var thread = document.getElementById('chat-thread-' + ref);
  if (thread) {
    var row = mkEl('div', 'display:flex;justify-content:flex-end;margin-bottom:12px;');
    var bubble = mkEl('div', 'max-width:72%;background:#D4601D;color:#fff;border-radius:14px 14px 4px 14px;padding:12px 16px;');
    bubble.appendChild(mkEl('div', 'font-size:13px;line-height:1.5;', msg));
    bubble.appendChild(mkEl('div', 'font-size:11px;color:rgba(255,255,255,0.65);margin-top:6px;', 'You · Just now'));
    row.appendChild(bubble);
    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
  }
  /* Sync to admin */
  if (typeof adminTickets !== 'undefined') {
    var at = adminTickets.find(function(x){ return x.ref===ref; });
    if (at) at.messages.push({from:'client', text:msg, time:'Just now', name:'John Murphy'});
  }
}

/* ── PAYMENT SECTION ── */
function buildPaymentSection(t) {
  var wrap = mkEl('div', '');
  if (t.payStatus === 'Paid') {
    var paidBox = mkEl('div', 'background:#f0fdf4;border:1.5px solid #16a34a;border-radius:14px;padding:20px 22px;');
    var pr = mkEl('div', 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;');
    var pl = mkEl('div', '');
    pl.appendChild(mkEl('div', 'font-size:13px;font-weight:700;color:#16a34a;margin-bottom:4px;', 'Payment Confirmed'));
    pl.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;', 'Ref: ' + t.payRef + ' · Verified by admin'));
    pr.appendChild(pl);
    pr.appendChild(mkEl('div', 'font-size:22px;font-family:"DM Serif Display",serif;color:#16a34a;', t.price));
    paidBox.appendChild(pr);
    wrap.appendChild(paidBox);
  } else if (t.payStatus === 'Under Review') {
    var revBox = mkEl('div', 'background:#f5f3ff;border:1.5px solid #7c3aed;border-radius:14px;padding:20px 22px;');
    var rr2 = mkEl('div', 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;');
    var rl = mkEl('div', '');
    rl.appendChild(mkEl('div', 'font-size:13px;font-weight:700;color:#7c3aed;margin-bottom:4px;', 'Payment Under Review'));
    rl.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;', 'Ref submitted: ' + t.payRef + ' · Admin cross-referencing'));
    rr2.appendChild(rl);
    rr2.appendChild(mkEl('div', 'font-size:20px;font-family:"DM Serif Display",serif;color:#1a1a2e;', t.price));
    revBox.appendChild(rr2);
    revBox.appendChild(mkEl('div', 'font-size:12px;color:#7c3aed;', 'Our team will confirm your payment within 1 business day. You will be notified by email.'));
    wrap.appendChild(revBox);
  } else if (t.status === 'Completed' || t.payStatus === 'Awaiting Payment') {
    var invBox = mkEl('div', 'background:#fff;border:1px solid #e5e1dd;border-radius:14px;padding:24px;');
    /* Invoice header */
    var invHead = mkEl('div', 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;');
    var invL = mkEl('div', '');
    invL.appendChild(mkEl('div', 'font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:2px;', 'Invoice — ' + t.ref));
    invL.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;', 'Completed job · Due within 5 days'));
    var invR = mkEl('div', 'text-align:right;');
    invR.appendChild(mkEl('div', 'font-size:22px;font-family:"DM Serif Display",serif;color:#1a1a2e;', t.price));
    invR.appendChild(mkPill('Awaiting Payment'));
    invHead.appendChild(invL); invHead.appendChild(invR);
    invBox.appendChild(invHead);

    /* Log payment form */
    var formWrap = mkEl('div', 'background:#f7f8fa;border-radius:10px;padding:18px;border:1px solid #e5e1dd;margin-bottom:16px;');
    formWrap.appendChild(mkEl('div', 'font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:8px;', 'Log Your Bank Transfer'));
    formWrap.appendChild(mkEl('div', 'font-size:12px;color:#9199a8;margin-bottom:14px;line-height:1.5;', 'Make your bank transfer to us, then enter the reference below. Our admin will cross-reference and confirm within 1 business day.'));

    var fgrid = mkEl('div', 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;');
    var refWrap = mkEl('div', '');
    refWrap.appendChild(mkEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;', 'Bank Transfer Reference'));
    var refInput = document.createElement('input');
    refInput.type = 'text'; refInput.id = 'pay-ref-' + t.ref; refInput.placeholder = 'e.g. REF-2024-78241';
    refInput.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:8px;padding:10px 12px;font-size:13px;font-family:"DM Sans",sans-serif;outline:none;box-sizing:border-box;';
    refInput.addEventListener('focus', function(){ refInput.style.borderColor='#D4601D'; });
    refInput.addEventListener('blur',  function(){ refInput.style.borderColor='#e5e1dd'; });
    refWrap.appendChild(refInput);
    var amtWrap = mkEl('div', '');
    amtWrap.appendChild(mkEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;', 'Amount Transferred'));
    var amtInput = document.createElement('input');
    amtInput.type = 'text'; amtInput.id = 'pay-amt-' + t.ref; amtInput.placeholder = 'e.g. EUR 220.00';
    amtInput.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:8px;padding:10px 12px;font-size:13px;font-family:"DM Sans",sans-serif;outline:none;box-sizing:border-box;';
    amtInput.addEventListener('focus', function(){ amtInput.style.borderColor='#D4601D'; });
    amtInput.addEventListener('blur',  function(){ amtInput.style.borderColor='#e5e1dd'; });
    amtWrap.appendChild(amtInput);
    fgrid.appendChild(refWrap); fgrid.appendChild(amtWrap);
    formWrap.appendChild(fgrid);

    var dateWrap = mkEl('div', 'margin-bottom:14px;');
    dateWrap.appendChild(mkEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;', 'Date of Transfer'));
    var dateInput = document.createElement('input');
    dateInput.type = 'text'; dateInput.placeholder = 'e.g. 18 March 2026';
    dateInput.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:8px;padding:10px 12px;font-size:13px;font-family:"DM Sans",sans-serif;outline:none;box-sizing:border-box;';
    dateInput.addEventListener('focus', function(){ dateInput.style.borderColor='#D4601D'; });
    dateInput.addEventListener('blur',  function(){ dateInput.style.borderColor='#e5e1dd'; });
    dateWrap.appendChild(dateInput);
    formWrap.appendChild(dateWrap);

    var submitBtn = mkEl('button', 'background:#D4601D;color:#fff;border:none;border-radius:8px;padding:12px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;width:100%;', 'I have made this payment');
    submitBtn.addEventListener('mouseover', function(){ submitBtn.style.background='#e87a3a'; });
    submitBtn.addEventListener('mouseout',  function(){ submitBtn.style.background='#D4601D'; });
    submitBtn.addEventListener('click', function(){ submitPayment(t.ref); });
    formWrap.appendChild(submitBtn);
    invBox.appendChild(formWrap);
    wrap.appendChild(invBox);
  }
  return wrap;
}

function submitPayment(ref) {
  var t = portalTickets.find(function(x){ return x.ref===ref; });
  var refInput = document.getElementById('pay-ref-' + ref);
  if (!t || !refInput) return;
  var payRef = refInput.value.trim();
  if (!payRef) { refInput.style.borderColor='#dc2626'; refInput.placeholder='Please enter your bank reference'; return; }
  t.payRef = payRef;
  t.payStatus = 'Under Review';
  openTicketDetail(ref);
  renderDashboard();
}

/* ── PAYMENTS TAB ── */
function renderPayments() {
  var container = document.getElementById('payments-content');
  if (!container) return;
  container.innerHTML = '';

  var tableWrap = mkEl('div', 'background:#fff;border-radius:14px;border:1px solid #e5e1dd;overflow:hidden;');
  /* Header */
  var hdr = mkEl('div', 'padding:12px 20px;background:#f7f8fa;display:flex;gap:10px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9199a8;border-bottom:1px solid #e5e1dd;');
  ['Job','Property','Amount','Status','Action'].forEach(function(h, i){
    hdr.appendChild(mkEl('div', 'flex:'+(i<2?'2':'1')+';', h));
  });
  tableWrap.appendChild(hdr);

  portalTickets.forEach(function(t) {
    var row = mkEl('div', 'padding:16px 20px;border-bottom:1px solid #f0f1f3;display:flex;gap:10px;align-items:center;');
    var jobCol = mkEl('div', 'flex:2;');
    jobCol.appendChild(mkEl('div', 'font-size:13px;font-weight:600;color:#1a1a2e;', t.type));
    jobCol.appendChild(mkEl('div', 'font-size:11px;color:#9199a8;', t.ref));
    row.appendChild(jobCol);
    row.appendChild(mkEl('div', 'flex:2;font-size:13px;color:#4a5264;', t.address.substring(0,26)+'...'));
    row.appendChild(mkEl('div', 'flex:1;font-size:14px;font-weight:700;color:#1a1a2e;', t.price));
    var statusCol = mkEl('div', 'flex:1;');
    statusCol.appendChild(mkPill(t.payStatus||'Awaiting Payment'));
    row.appendChild(statusCol);
    var actCol = mkEl('div', 'flex:1;');
    var viewBtn = mkEl('button', 'background:#f0f1f3;color:#1a1a2e;border:none;padding:6px 14px;border-radius:7px;font-size:12px;cursor:pointer;font-family:"DM Sans",sans-serif;', 'View Job');
    viewBtn.addEventListener('click', function(){ openTicketDetail(t.ref); });
    actCol.appendChild(viewBtn);
    row.appendChild(actCol);
    tableWrap.appendChild(row);
  });
  container.appendChild(tableWrap);
}

/* ── FILE UPLOAD SETUP ── */
window.addEventListener('load', function() {
  var dropZone = document.getElementById('req-drop-zone');
  var fileInput = document.getElementById('req-file-input');
  if (!dropZone || !fileInput) return;

  /* Click zone → open file picker */
  dropZone.addEventListener('click', function() { fileInput.click(); });

  /* File input change */
  fileInput.addEventListener('change', function() {
    handleFiles(fileInput.files);
  });

  /* Drag over */
  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.style.borderColor = '#D4601D';
    dropZone.style.background = '#fff3ec';
  });

  /* Drag leave */
  dropZone.addEventListener('dragleave', function() {
    dropZone.style.borderColor = '#e5e1dd';
    dropZone.style.background = '#f7f8fa';
  });

  /* Drop */
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.style.borderColor = '#e5e1dd';
    dropZone.style.background = '#f7f8fa';
    handleFiles(e.dataTransfer.files);
  });
});

var uploadedFiles = [];

function handleFiles(files) {
  var list = document.getElementById('req-file-list');
  if (!list) return;
  Array.prototype.forEach.call(files, function(file) {
    uploadedFiles.push(file);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#f7f8fa;border:1px solid #e5e1dd;border-radius:8px;padding:8px 12px;';
    var left = document.createElement('div');
    left.style.cssText = 'display:flex;align-items:center;gap:8px;';
    var icon = document.createElement('div');
    icon.style.cssText = 'width:28px;height:28px;background:#eff6ff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#2563eb;font-weight:700;flex-shrink:0;';
    icon.textContent = file.type.includes('pdf') ? 'PDF' : 'IMG';
    var nameDiv = document.createElement('div');
    var fname = document.createElement('div');
    fname.style.cssText = 'font-size:13px;font-weight:500;color:#1a1a2e;';
    fname.textContent = file.name;
    var fsize = document.createElement('div');
    fsize.style.cssText = 'font-size:11px;color:#9199a8;';
    fsize.textContent = (file.size / 1024).toFixed(0) + ' KB';
    nameDiv.appendChild(fname); nameDiv.appendChild(fsize);
    left.appendChild(icon); left.appendChild(nameDiv);
    var removeBtn = document.createElement('button');
    removeBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:#9199a8;font-size:18px;line-height:1;padding:0 2px;';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', function() {
      uploadedFiles = uploadedFiles.filter(function(f) { return f !== file; });
      list.removeChild(row);
    });
    row.appendChild(left); row.appendChild(removeBtn);
    list.appendChild(row);
  });

  /* Update drop zone text */
  var dropZone = document.getElementById('req-drop-zone');
  if (dropZone && uploadedFiles.length) {
    dropZone.querySelector('div:nth-child(2)').textContent = uploadedFiles.length + ' file' + (uploadedFiles.length > 1 ? 's' : '') + ' selected — click to add more';
  }
}

/* ── NEW REQUEST SUBMIT ── */
function submitNewRequest() {
  var address = (document.getElementById('req-address') || {}).value || '';
  var desc = (document.getElementById('req-desc') || {}).value || '';

  /* Basic validation */
  if (!address.trim()) {
    var addrInput = document.getElementById('req-address');
    if (addrInput) { addrInput.style.borderColor = '#dc2626'; addrInput.focus(); addrInput.placeholder = 'Please enter the property address'; }
    return;
  }
  if (!desc.trim()) {
    var descInput = document.getElementById('req-desc');
    if (descInput) { descInput.style.borderColor = '#dc2626'; descInput.focus(); descInput.placeholder = 'Please describe the issue'; }
    return;
  }

  var ref = 'SC-2026-0' + String(Math.floor(Math.random()*90)+10);
  var service = (document.getElementById('req-service') || {}).value || 'General';
  var priority = (document.getElementById('req-priority') || {}).value || 'Standard';

  /* Add to portalTickets so it shows in the Tickets tab */
  portalTickets.unshift({
    ref: ref, type: service, priority: priority,
    address: address.trim(),
    desc: desc.trim(),
    status: 'Pending', contractor: '', scheduled: 'To be confirmed',
    price: 'Pending quote', paid: false, payRef: '', payStatus: 'Awaiting Payment',
    progress: 0,
    messages: [{ from: 'system', text: 'Ticket ' + ref + ' created. Team notified.', time: 'Just now' }]
  });

  /* Show success */
  var msg = document.getElementById('new-req-success');
  if (msg) {
    msg.style.display = 'block';
    msg.textContent = 'Request submitted — Reference: ' + ref + '. Your team will be in touch shortly to confirm.';
  }

  /* Reset form */
  ['req-address','req-desc','req-access'].forEach(function(id) {
    var el = document.getElementById(id); if (el) { el.value = ''; el.style.borderColor = '#e5e1dd'; }
  });
  var fileList = document.getElementById('req-file-list');
  if (fileList) fileList.innerHTML = '';
  var fileInput = document.getElementById('req-file-input');
  if (fileInput) fileInput.value = '';
  uploadedFiles = [];
  var dropZone = document.getElementById('req-drop-zone');
  if (dropZone) {
    var inner = dropZone.querySelector('div:nth-child(2)');
    if (inner) inner.textContent = 'Click to choose files or drag and drop here';
  }

  /* Update dashboard */
  renderDashboard();

  setTimeout(function() {
    var m = document.getElementById('new-req-success');
    if (m) m.style.display = 'none';
  }, 10000);
}

/* ── EXPOSE GLOBALS ── */
window.openPortal = openPortal;
window.closePortal = closePortal;
window.doLogin = doLogin;
window.logoutPortal = logoutPortal;
window.showPortalView = showPortalView;
window.openTicketDetail = openTicketDetail;
window.sendPortalMsg = sendPortalMsg;
window.submitPayment = submitPayment;
window.renderTicketList = renderTicketList;
window.submitNewRequest = submitNewRequest;
