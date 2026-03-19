
/* ============================================================
   STEADY CONSTRUCTION — ADMIN CRM
   100% DOM-based. Zero innerHTML string building.
   Zero onclick string escaping. Pure addEventListener.
   ============================================================ */

/* ── DATA ── */
var adminTickets = [
  { ref:'SC-2024-043', client:'Mary OSullivan', address:'5 Harbour View, Dublin 2', type:'Electrical',
    desc:'Total power outage on ground floor. No power to sockets or lighting. Fuse box tripped repeatedly.',
    status:'Pending', priority:'Urgent', contractor:'', scheduled:'', price:'', paid:false, messages:[] },
  { ref:'SC-2024-041', client:'John Murphy', address:'14 Maple St, Dublin 6', type:'Plumbing',
    desc:'Leak under bathroom sink — water dripping from waste pipe.',
    status:'In Progress', priority:'Urgent', contractor:'Ciaran OBrien', scheduled:'Today 2:00 PM', price:'EUR 320', paid:false,
    messages:[{from:'team', text:'Ciaran on site — faulty waste trap identified. Replacing now.', time:'2:15 PM', name:'Steady Team'}] },
  { ref:'SC-2024-042', client:'David Walsh', address:'33 Lakeview Drive, Dublin 14', type:'Carpentry',
    desc:'Kitchen cabinet doors warped. 4 doors need replacing. Hinges also loose.',
    status:'Scheduled', priority:'Standard', contractor:'Padraig Doyle', scheduled:'Fri 20 Mar, 10:00 AM', price:'EUR 280', paid:false, messages:[] },
  { ref:'SC-2024-039', client:'John Murphy', address:'8 Orchard Rd, Dublin 4', type:'Cleaning',
    desc:'End-of-tenancy deep clean. 3-bed apartment.',
    status:'Scheduled', priority:'Standard', contractor:'Cleaning Team', scheduled:'Thu 18 Mar, 9:00 AM', price:'EUR 280', paid:false, messages:[] },
  { ref:'SC-2024-037', client:'John Murphy', address:'22 Pine Ave, Dublin 4', type:'Electrical',
    desc:'Full consumer unit upgrade — outdated fuse box replaced with modern RCD board.',
    status:'Completed', priority:'Standard', contractor:'Declan Byrne', scheduled:'10 Mar 2026', price:'EUR 480', paid:false, messages:[] },
  { ref:'SC-2024-031', client:'John Murphy', address:'14 Maple St, Dublin 6', type:'Roofing',
    desc:'Roof repair — several slates displaced after storm damage.',
    status:'Completed', priority:'Urgent', contractor:'Roofing Team', scheduled:'22 Feb 2026', price:'EUR 1,250', paid:true, messages:[] }
];

var adminClients = [
  { name:'John Murphy', email:'demo@steadyconstruction.ie', phone:'+353 87 123 4567', company:'Murphy Properties', props:3, tickets:4, active:true },
  { name:'Mary OSullivan', email:'mary.os@example.ie', phone:'+353 86 234 5678', company:'', props:2, tickets:1, active:true },
  { name:'David Walsh', email:'d.walsh@walshpm.ie', phone:'+353 85 345 6789', company:'Walsh Property Mgmt', props:5, tickets:2, active:true },
  { name:'Claire Brennan', email:'claire@brennanlets.ie', phone:'+353 87 456 7890', company:'Brennan Lettings', props:4, tickets:0, active:false }
];

var adminContractors = [
  { name:'Ciaran OBrien', trade:'Plumber', phone:'+353 87 111 2222', email:'ciaran@example.ie', jobs:12, active:true },
  { name:'Declan Byrne', trade:'Electrician', phone:'+353 86 222 3333', email:'declan@example.ie', jobs:9, active:true },
  { name:'Padraig Doyle', trade:'Carpenter', phone:'+353 85 333 4444', email:'padraig@example.ie', jobs:7, active:true },
  { name:'Roofing Team', trade:'Roofer', phone:'+353 87 444 5555', email:'roof@example.ie', jobs:5, active:true },
  { name:'Cleaning Team', trade:'Cleaner', phone:'+353 86 555 6666', email:'clean@example.ie', jobs:15, active:true }
];

var activityLog = [
  { icon:'OK', text:'Job completed — Electrical upgrade, 22 Pine Ave', sub:'2 days ago · SC-2024-037', col:'#f0fdf4', tc:'#16a34a' },
  { icon:'MSG', text:'Client message on SC-2024-041 from John Murphy', sub:'Today 10:12 AM', col:'#eff6ff', tc:'#2563eb' },
  { icon:'NEW', text:'New ticket — Power outage, 5 Harbour View (URGENT)', sub:'Today 8:30 AM · SC-2024-043', col:'#fef2f2', tc:'#dc2626' },
  { icon:'INV', text:'Invoice issued — EUR 480 for SC-2024-037', sub:'3 days ago', col:'#fffbeb', tc:'#d97706' }
];

/* ── DOM HELPER ── */
function aEl(tag, css, txt) {
  var e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (txt !== undefined) e.textContent = String(txt);
  return e;
}

var ADMIN_STATUS = {
  'In Progress':      {bg:'#fff3ec', col:'#D4601D'},
  'Scheduled':        {bg:'#eff6ff', col:'#2563eb'},
  'Completed':        {bg:'#f0fdf4', col:'#16a34a'},
  'Pending':          {bg:'#fafafa', col:'#9199a8'},
  'Assigned':         {bg:'#f5f3ff', col:'#7c3aed'},
  'Awaiting Payment': {bg:'#fffbeb', col:'#d97706'},
  'Paid':             {bg:'#f0fdf4', col:'#16a34a'},
  'Active':           {bg:'#f0fdf4', col:'#16a34a'},
  'Inactive':         {bg:'#fafafa', col:'#9199a8'},
  'Urgent':           {bg:'#fef2f2', col:'#dc2626'}
};

function aPill(text) {
  var s = ADMIN_STATUS[text] || {bg:'#f0f1f3', col:'#9199a8'};
  return aEl('span', 'font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;background:'+s.bg+';color:'+s.col+';display:inline-block;white-space:nowrap;', text);
}

/* ── AUTH ── */
function openAdminModal() {
  var m = document.getElementById('admin-modal');
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}
function closeAdminModal() {
  var m = document.getElementById('admin-modal');
  if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}
function doAdminLogin() {
  var e = (document.getElementById('admin-email') || {}).value || '';
  var p = (document.getElementById('admin-password') || {}).value || '';
  var err = document.getElementById('admin-login-error');
  if (!e || !p) { if(err){err.style.display='block';err.textContent='Please enter your email and password.';} return; }
  if (err) { err.style.display='block'; err.style.color='rgba(255,255,255,0.5)'; err.textContent='Signing in...'; }

  supaSignIn(e.trim(), p).then(function(result) {
    if (result.error) {
      if (err) { err.style.display='block'; err.style.color='#e87a3a'; err.textContent='Login failed: ' + (result.error.message || 'Invalid credentials'); }
      return;
    }
    supaGetRole(e.trim()).then(function(userData) {
      if (!userData) {
        if (err) { err.style.display='block'; err.style.color='#e87a3a'; err.textContent='Signed in OK but no profile found in users table.'; }
        supaSignOut(); return;
      }
      if (userData.role !== 'admin') {
        if (err) { err.style.display='block'; err.style.color='#e87a3a'; err.textContent='Access denied. Role found: ' + userData.role; }
        supaSignOut(); return;
      }
      if (err) err.style.display = 'none';
      window._adminUser = userData;
      closeAdminModal();
      var dash = document.getElementById('admin-dashboard');
      if (dash) dash.style.display = 'block';
      document.body.style.overflow = 'hidden';
      Promise.all([
        supaLoadTickets().then(function(t){ if(t&&t.length) mapSupaTicketsToAdmin(t); }),
        supaLoadClients().then(function(c){ if(c&&c.length) mapSupaClientsToAdmin(c); }),
        supaLoadContractors().then(function(c){ if(c&&c.length) mapSupaContractorsToAdmin(c); })
      ]).then(function(){ initAdminDashboard(); });
    });
  });
}
function logoutAdmin() {
  var dash = document.getElementById('admin-dashboard');
  if (dash) dash.style.display = 'none';
  document.body.style.overflow = '';
}
window.addEventListener('load', function() {
  var pw = document.getElementById('admin-password');
  if (pw) pw.addEventListener('keydown', function(e) { if (e.key === 'Enter') doAdminLogin(); });
});

/* ── INIT ── */
function initAdminDashboard() {
  var logEl = document.getElementById('admin-activity-log');
  if (logEl) {
    logEl.innerHTML = '';
    activityLog.forEach(function(a) {
      var row = aEl('div', 'padding:14px 20px;border-bottom:1px solid #f0f1f3;display:flex;align-items:center;gap:12px;');
      var icon = aEl('div', 'width:34px;height:34px;background:'+a.col+';border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:'+a.tc+';flex-shrink:0;', a.icon);
      var info = aEl('div', '');
      info.appendChild(aEl('div', 'font-size:13px;font-weight:500;color:#1a1a2e;', a.text));
      info.appendChild(aEl('div', 'font-size:11px;color:#9199a8;margin-top:2px;', a.sub));
      row.appendChild(icon); row.appendChild(info);
      logEl.appendChild(row);
    });
  }
  switchAdminTab('a-overview');
  renderAdminTickets();
  renderAdminClients();
  renderContractorCards();
  renderAdminPayments();
}

/* ── TABS ── */
function switchAdminTab(tab) {
  ['a-overview','a-tickets','a-clients','a-contractors','a-payments'].forEach(function(t) {
    var el = document.getElementById('admin-' + t);
    var btn = document.getElementById('atab-' + t);
    if (el) el.style.display = 'none';
    if (btn) { btn.style.background = 'transparent'; btn.style.color = 'rgba(255,255,255,0.55)'; }
  });
  var active = document.getElementById('admin-' + tab);
  var activeBtn = document.getElementById('atab-' + tab);
  if (active) active.style.display = 'block';
  if (activeBtn) { activeBtn.style.background = '#D4601D'; activeBtn.style.color = '#fff'; }
  var panel = document.getElementById('admin-ticket-panel');
  if (panel && tab !== 'a-tickets') panel.style.display = 'none';
}

/* ── TICKET LIST ── */
function renderAdminTickets() {
  var statusF = ((document.getElementById('filter-status') || {}).value) || '';
  var priorityF = ((document.getElementById('filter-priority') || {}).value) || '';
  var search = (((document.getElementById('search-tickets') || {}).value) || '').toLowerCase();
  var filtered = adminTickets.filter(function(t) {
    return (!statusF || t.status === statusF)
      && (!priorityF || t.priority === priorityF)
      && (!search || t.ref.toLowerCase().includes(search) || t.client.toLowerCase().includes(search) || t.address.toLowerCase().includes(search) || t.type.toLowerCase().includes(search));
  });
  var container = document.getElementById('admin-ticket-list');
  if (!container) return;
  container.innerHTML = '';
  if (!filtered.length) {
    container.appendChild(aEl('div', 'padding:24px;text-align:center;color:#9199a8;', 'No tickets match your filters.'));
    return;
  }

  var statusOrder = ['Pending','Assigned','Scheduled','In Progress','Completed','Awaiting Payment','Closed'];
  var groups = {};
  statusOrder.forEach(function(s) { groups[s] = []; });
  filtered.forEach(function(t) {
    if (!groups[t.status]) groups[t.status] = [];
    groups[t.status].push(t);
  });

  statusOrder.forEach(function(status) {
    var tickets = groups[status];
    if (!tickets || !tickets.length) return;

    var s = ADMIN_STATUS[status] || {bg:'#f0f1f3', col:'#9199a8'};
    var groupHdr = aEl('div', 'display:flex;align-items:center;gap:10px;margin:20px 0 10px;');
    var dot = aEl('div', 'width:10px;height:10px;border-radius:50%;background:'+s.col+';flex-shrink:0;');
    var lbl = aEl('span', 'font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:'+s.col+';', status);
    var cnt = aEl('span', 'font-size:11px;font-weight:600;background:'+s.bg+';color:'+s.col+';padding:2px 8px;border-radius:100px;', String(tickets.length));
    groupHdr.appendChild(dot); groupHdr.appendChild(lbl); groupHdr.appendChild(cnt);
    container.appendChild(groupHdr);

    tickets.forEach(function(t) {
      var card = aEl('div', 'background:#fff;border-radius:12px;padding:18px 20px;border:1px solid #e5e1dd;margin-bottom:8px;cursor:pointer;');
      card.addEventListener('mouseover', function() { card.style.borderColor = '#D4601D'; card.style.boxShadow = '0 4px 16px rgba(212,96,29,0.08)'; });
      card.addEventListener('mouseout',  function() { card.style.borderColor = '#e5e1dd'; card.style.boxShadow = 'none'; });
      card.addEventListener('click', function() { openAdminTicket(t.ref); });

      /* Top row: ref + priority + edit button */
      var topRow = aEl('div', 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;');
      var refPills = aEl('div', 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;');
      refPills.appendChild(aEl('span', 'font-size:11px;font-weight:700;color:#9199a8;letter-spacing:0.3px;', t.ref));
      refPills.appendChild(aEl('span', 'font-size:11px;font-weight:600;background:#f0f1f3;color:#4a5264;padding:2px 8px;border-radius:100px;', t.type));
      if (t.priority === 'Urgent') refPills.appendChild(aPill('Urgent'));
      var editBtn = aEl('button', 'background:#f0f1f3;color:#1a1a2e;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;flex-shrink:0;', 'Manage');
      editBtn.addEventListener('mouseover', function() { editBtn.style.background = '#D4601D'; editBtn.style.color = '#fff'; });
      editBtn.addEventListener('mouseout',  function() { editBtn.style.background = '#f0f1f3'; editBtn.style.color = '#1a1a2e'; });
      editBtn.addEventListener('click', function(e) { e.stopPropagation(); openAdminTicket(t.ref); });
      topRow.appendChild(refPills); topRow.appendChild(editBtn);
      card.appendChild(topRow);

      /* Address + description */
      card.appendChild(aEl('div', 'font-size:14px;font-weight:600;color:#1a1a2e;margin-bottom:4px;', t.address));
      card.appendChild(aEl('div', 'font-size:13px;color:#4a5264;line-height:1.5;margin-bottom:12px;border-bottom:1px solid #f0f1f3;padding-bottom:12px;', t.desc));

      /* Detail grid: client / contractor / scheduled / price / payment */
      var details = aEl('div', 'display:grid;grid-template-columns:1fr 1fr;gap:8px;');

      function detailCell(label, value, highlight) {
        var cell = aEl('div', '');
        cell.appendChild(aEl('div', 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#9199a8;margin-bottom:2px;', label));
        cell.appendChild(aEl('div', 'font-size:13px;font-weight:500;color:'+(highlight||'#1a1a2e')+';', value || '—'));
        return cell;
      }

      details.appendChild(detailCell('Client', t.client));
      details.appendChild(detailCell('Contractor', t.contractor || 'Unassigned', t.contractor ? '#1a1a2e' : '#D4601D'));
      if (t.scheduled) details.appendChild(detailCell('Scheduled', t.scheduled));
      if (t.price) details.appendChild(detailCell('Price', t.price, '#1a1a2e'));
      card.appendChild(details);

      /* Payment badge if applicable */
      if (t.price) {
        var pymtBadge = aEl('div', 'margin-top:10px;');
        pymtBadge.appendChild(aPill(t.paid ? 'Paid' : 'Awaiting Payment'));
        card.appendChild(pymtBadge);
      }

      /* Message count */
      if (t.messages && t.messages.length) {
        var msgRow = aEl('div', 'margin-top:8px;font-size:12px;color:#9199a8;');
        msgRow.textContent = t.messages.length + ' message' + (t.messages.length > 1 ? 's' : '') + ' in thread';
        card.appendChild(msgRow);
      }

      container.appendChild(card);
    });
  });
}

/* ── TICKET EDITOR — full DOM, zero string onclick ── */
function openAdminTicket(ref) {
  var t = adminTickets.find(function(x) { return x.ref === ref; });
  if (!t) return;
  var panel = document.getElementById('admin-ticket-panel');
  var panelContent = document.getElementById('admin-ticket-panel-content');
  if (!panel || !panelContent) return;
  panelContent.innerHTML = '';

  /* Back */
  var back = aEl('button', 'background:none;border:none;cursor:pointer;font-size:13px;color:#9199a8;margin-bottom:20px;padding:0;font-family:"DM Sans",sans-serif;', '\u2190 Back to tickets');
  back.addEventListener('click', function() { panel.style.display = 'none'; });
  panelContent.appendChild(back);

  /* Header */
  var hdr = aEl('div', 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:24px;');
  var hl = aEl('div', '');
  hl.appendChild(aEl('div', 'font-size:12px;font-weight:700;color:#9199a8;margin-bottom:4px;', t.ref + ' · ' + t.type));
  hl.appendChild(aEl('h3', 'font-size:20px;color:#1a1a2e;margin-bottom:2px;', t.client + ' — ' + t.address));
  hl.appendChild(aEl('div', 'font-size:12px;color:#9199a8;', t.priority + ' priority'));
  var saveBtn = aEl('button', 'background:#D4601D;color:#fff;border:none;padding:11px 24px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;', 'Save Changes');
  saveBtn.addEventListener('click', function() { saveAdminTicket(ref); });
  hdr.appendChild(hl); hdr.appendChild(saveBtn);
  panelContent.appendChild(hdr);

  /* Fields grid */
  var grid = aEl('div', 'display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;');

  /* Status */
  var sw = aEl('div', '');
  sw.appendChild(aEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;', 'Status'));
  var ss = document.createElement('select');
  ss.id = 'et-status';
  ss.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:9px;padding:11px 14px;font-size:14px;font-family:"DM Sans",sans-serif;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;';
  ['Pending','Assigned','Scheduled','In Progress','Completed','Awaiting Payment','Closed'].forEach(function(s) {
    var o = document.createElement('option'); o.value = s; o.textContent = s;
    if (t.status === s) o.selected = true;
    ss.appendChild(o);
  });
  sw.appendChild(ss); grid.appendChild(sw);

  /* Contractor */
  var cw = aEl('div', '');
  cw.appendChild(aEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;', 'Assign Contractor'));
  var cs = document.createElement('select');
  cs.id = 'et-contractor';
  cs.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:9px;padding:11px 14px;font-size:14px;font-family:"DM Sans",sans-serif;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;';
  var unOpt = document.createElement('option'); unOpt.value = ''; unOpt.textContent = '— Unassigned —'; cs.appendChild(unOpt);
  adminContractors.forEach(function(c) {
    var o = document.createElement('option'); o.value = c.name; o.textContent = c.name + ' (' + c.trade + ')';
    if (t.contractor === c.name) o.selected = true;
    cs.appendChild(o);
  });
  cw.appendChild(cs); grid.appendChild(cw);

  /* Scheduled */
  var scw = aEl('div', '');
  scw.appendChild(aEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;', 'Scheduled Date / Time'));
  var sci = document.createElement('input'); sci.type = 'text'; sci.id = 'et-scheduled'; sci.value = t.scheduled || ''; sci.placeholder = 'e.g. Fri 20 Mar, 10:00 AM';
  sci.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:9px;padding:11px 14px;font-size:14px;font-family:"DM Sans",sans-serif;outline:none;box-sizing:border-box;';
  sci.addEventListener('focus', function() { sci.style.borderColor = '#D4601D'; });
  sci.addEventListener('blur',  function() { sci.style.borderColor = '#e5e1dd'; });
  scw.appendChild(sci); grid.appendChild(scw);

  /* Price */
  var pw = aEl('div', '');
  pw.appendChild(aEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;', 'Price / Estimate'));
  var pi = document.createElement('input'); pi.type = 'text'; pi.id = 'et-price'; pi.value = t.price || ''; pi.placeholder = 'e.g. EUR 350';
  pi.style.cssText = 'width:100%;border:1px solid #e5e1dd;border-radius:9px;padding:11px 14px;font-size:14px;font-family:"DM Sans",sans-serif;outline:none;box-sizing:border-box;';
  pi.addEventListener('focus', function() { pi.style.borderColor = '#D4601D'; });
  pi.addEventListener('blur',  function() { pi.style.borderColor = '#e5e1dd'; });
  pw.appendChild(pi); grid.appendChild(pw);

  panelContent.appendChild(grid);

  /* Description */
  var dw = aEl('div', 'margin-bottom:20px;');
  dw.appendChild(aEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;', 'Issue Description'));
  dw.appendChild(aEl('div', 'background:#f7f8fa;border-radius:9px;padding:14px;font-size:13px;color:#4a5264;line-height:1.6;border:1px solid #e5e1dd;', t.desc));
  panelContent.appendChild(dw);

  /* Payment */
  var pymtWrap = aEl('div', 'margin-bottom:20px;');
  pymtWrap.appendChild(aEl('label', 'font-size:11px;font-weight:700;color:#4a5264;display:block;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;', 'Payment Status'));
  var pymtRow = aEl('div', 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;');
  var unpaidBtn = aEl('button', 'padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;border:1px solid #e5e1dd;background:'+(t.paid?'#f0f1f3':'#fff3ec')+';color:'+(t.paid?'#9199a8':'#D4601D')+';', 'Mark Unpaid');
  unpaidBtn.addEventListener('click', function() { setPaymentStatus(ref, false); });
  var paidBtn = aEl('button', 'padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;border:1px solid #e5e1dd;background:'+(t.paid?'#f0fdf4':'#f0f1f3')+';color:'+(t.paid?'#16a34a':'#9199a8')+';', 'Mark Paid');
  paidBtn.addEventListener('click', function() { setPaymentStatus(ref, true); });
  var pymtStatus = aEl('span', 'font-size:13px;color:#9199a8;', 'Current: ');
  var bold = aEl('strong', 'color:#1a1a2e;', t.paid ? 'Paid' : 'Unpaid');
  pymtStatus.appendChild(bold);
  pymtRow.appendChild(unpaidBtn); pymtRow.appendChild(paidBtn); pymtRow.appendChild(pymtStatus);
  pymtWrap.appendChild(pymtRow);
  panelContent.appendChild(pymtWrap);

  /* Save confirmation */
  var saveMsg = aEl('div', 'display:none;background:#f0fdf4;border:1px solid #16a34a;border-radius:9px;padding:12px 16px;font-size:13px;color:#16a34a;font-weight:600;margin-bottom:16px;', 'Changes saved successfully.');
  saveMsg.id = 'ticket-save-msg';
  panelContent.appendChild(saveMsg);

  /* Chat */
  var chatBox = aEl('div', 'border:1px solid #e5e1dd;border-radius:14px;overflow:hidden;');
  var chatHdr = aEl('div', 'padding:16px 20px;border-bottom:1px solid #f0f1f3;background:#fff;');
  chatHdr.appendChild(aEl('div', 'font-size:14px;font-weight:700;color:#1a1a2e;', 'Communication Log'));
  chatHdr.appendChild(aEl('div', 'font-size:12px;color:#9199a8;margin-top:2px;', 'Visible to the client in their portal'));
  chatBox.appendChild(chatHdr);

  var chatThread = aEl('div', 'padding:16px 20px;background:#f7f8fa;min-height:80px;max-height:280px;overflow-y:auto;');
  chatThread.id = 'admin-chat-thread';
  if (!t.messages || !t.messages.length) {
    chatThread.appendChild(aEl('div', 'text-align:center;color:#9199a8;font-size:13px;padding:20px 0;', 'No messages yet.'));
  } else {
    t.messages.forEach(function(m) {
      if (m.from === 'system') {
        var sys = aEl('div', 'text-align:center;margin:8px 0;');
        sys.appendChild(aEl('span', 'font-size:11px;color:#9199a8;background:#f0f1f3;padding:3px 12px;border-radius:100px;', m.text + ' · ' + m.time));
        chatThread.appendChild(sys);
      } else {
        var isClient = m.from === 'client';
        var row = aEl('div', 'display:flex;' + (isClient ? 'justify-content:flex-end;' : '') + 'margin-bottom:10px;');
        var bubble = aEl('div', 'max-width:72%;background:'+(isClient?'#D4601D':'#f0f1f3')+';color:'+(isClient?'#fff':'#1a1a2e')+';border-radius:'+(isClient?'14px 14px 4px 14px':'14px 14px 14px 4px')+';padding:10px 14px;font-size:13px;line-height:1.5;');
        bubble.appendChild(aEl('div', '', m.text));
        bubble.appendChild(aEl('div', 'font-size:11px;'+(isClient?'color:rgba(255,255,255,0.6)':'color:#9199a8')+';margin-top:5px;', (m.name || m.from) + ' · ' + m.time));
        row.appendChild(bubble); chatThread.appendChild(row);
      }
    });
  }
  chatBox.appendChild(chatThread);

  var chatFoot = aEl('div', 'padding:14px 16px;border-top:1px solid #f0f1f3;background:#fff;display:flex;gap:10px;');
  var msgInput = document.createElement('input');
  msgInput.type = 'text'; msgInput.id = 'admin-msg-input'; msgInput.placeholder = 'Post an update to the client...';
  msgInput.style.cssText = 'flex:1;border:1px solid #e5e1dd;border-radius:8px;padding:10px 14px;font-size:13px;font-family:"DM Sans",sans-serif;outline:none;';
  msgInput.addEventListener('focus', function() { msgInput.style.borderColor = '#D4601D'; });
  msgInput.addEventListener('blur',  function() { msgInput.style.borderColor = '#e5e1dd'; });
  msgInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') postAdminMsg(ref); });
  var postBtn = aEl('button', 'background:#1c1c1c;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;white-space:nowrap;', 'Post Update');
  postBtn.addEventListener('click', function() { postAdminMsg(ref); });
  chatFoot.appendChild(msgInput); chatFoot.appendChild(postBtn);
  chatBox.appendChild(chatFoot);
  panelContent.appendChild(chatBox);

  panel.style.display = 'block';
  switchAdminTab('a-tickets');
  setTimeout(function() {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    chatThread.scrollTop = chatThread.scrollHeight;
  }, 80);
}

/* ── SAVE TICKET ── */
function saveAdminTicket(ref) {
  var t = adminTickets.find(function(x) { return x.ref === ref; });
  if (!t) return;
  var s = document.getElementById('et-status');
  var c = document.getElementById('et-contractor');
  var sc = document.getElementById('et-scheduled');
  var p = document.getElementById('et-price');
  if (s) t.status = s.value;
  if (c) t.contractor = c.value;
  if (sc) t.scheduled = sc.value;
  if (p) t.price = p.value;
  var msg = document.getElementById('ticket-save-msg');
  if (msg) { msg.style.display = 'block'; setTimeout(function() { msg.style.display = 'none'; }, 3000); }
  renderAdminTickets();
  renderAdminPayments();
}

/* ── PAYMENT STATUS ── */
function setPaymentStatus(ref, paid) {
  var t = adminTickets.find(function(x) { return x.ref === ref; });
  if (t) { t.paid = paid; openAdminTicket(ref); renderAdminPayments(); }
}

/* ── POST MESSAGE ── */
function postAdminMsg(ref) {
  var t = adminTickets.find(function(x) { return x.ref === ref; });
  var inp = document.getElementById('admin-msg-input');
  if (!t || !inp) return;
  var msg = inp.value.trim();
  if (!msg) return;
  t.messages.push({ from: 'team', text: msg, time: 'Just now', name: 'Admin' });
  inp.value = '';
  var thread = document.getElementById('admin-chat-thread');
  if (thread) {
    var row = aEl('div', 'display:flex;margin-bottom:10px;');
    var bubble = aEl('div', 'max-width:72%;background:#f0f1f3;color:#1a1a2e;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:13px;line-height:1.5;');
    bubble.appendChild(aEl('div', '', msg));
    bubble.appendChild(aEl('div', 'font-size:11px;color:#9199a8;margin-top:5px;', 'Admin · Just now'));
    row.appendChild(bubble); thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
  }
  if (typeof portalTickets !== 'undefined') {
    var pt = portalTickets.find(function(x) { return x.ref === ref; });
    if (pt) pt.messages.push({ from: 'team', text: msg, time: 'Just now', name: 'Steady Team' });
  }
}

/* ── CLIENTS ── */
function renderAdminClients() {
  var container = document.getElementById('admin-client-list');
  if (!container) return;
  container.innerHTML = '';
  adminClients.forEach(function(c, i) {
    var row = aEl('div', 'padding:14px 20px;border-bottom:1px solid #f0f1f3;display:flex;align-items:center;gap:12px;flex-wrap:wrap;');
    var nameCol = aEl('div', 'flex:2;min-width:140px;');
    nameCol.appendChild(aEl('div', 'font-size:14px;font-weight:600;color:#1a1a2e;', c.name));
    if (c.company) nameCol.appendChild(aEl('div', 'font-size:12px;color:#9199a8;', c.company));
    row.appendChild(nameCol);
    row.appendChild(aEl('div', 'flex:2;font-size:13px;color:#4a5264;min-width:160px;', c.email));
    row.appendChild(aEl('div', 'flex:1;font-size:13px;color:#4a5264;min-width:110px;', c.phone));
    row.appendChild(aEl('div', 'width:40px;text-align:center;font-size:13px;font-weight:600;color:#1a1a2e;', String(c.props)));
    row.appendChild(aEl('div', 'width:40px;text-align:center;font-size:13px;font-weight:600;color:#1a1a2e;', String(c.tickets)));
    row.appendChild(aPill(c.active ? 'Active' : 'Inactive'));
    var btns = aEl('div', 'display:flex;gap:6px;');
    var toggleBtn = aEl('button', 'background:#f0f1f3;color:#4a5264;border:none;padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;font-family:"DM Sans",sans-serif;', c.active ? 'Disable' : 'Enable');
    toggleBtn.addEventListener('click', function() { toggleClient(i); });
    var resetBtn = aEl('button', 'background:#fff;color:#1a1a2e;border:1px solid #e5e1dd;padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;font-family:"DM Sans",sans-serif;', 'Reset PW');
    resetBtn.addEventListener('click', function() { sendReset(i); });
    btns.appendChild(toggleBtn); btns.appendChild(resetBtn);
    row.appendChild(btns);
    container.appendChild(row);
  });
}

function openNewClientForm() { var f = document.getElementById('new-client-form'); if (f) f.style.display = 'block'; }

function createClient() {
  var name = ((document.getElementById('nc-name') || {}).value || '').trim();
  var email = ((document.getElementById('nc-email') || {}).value || '').trim();
  if (!name || !email) return;
  adminClients.push({ name: name, email: email, phone: ((document.getElementById('nc-phone') || {}).value || ''), company: ((document.getElementById('nc-company') || {}).value || ''), props: 0, tickets: 0, active: true });
  var msg = document.getElementById('client-created-msg');
  if (msg) { msg.style.display = 'block'; msg.textContent = 'Account created for ' + name + '. Activation email sent to ' + email; }
  renderAdminClients();
  ['nc-name','nc-email','nc-phone','nc-company'].forEach(function(id) { var e = document.getElementById(id); if (e) e.value = ''; });
  setTimeout(function() { var m = document.getElementById('client-created-msg'); if (m) m.style.display = 'none'; }, 4000);
}

function toggleClient(i) { adminClients[i].active = !adminClients[i].active; renderAdminClients(); }
function sendReset(i) { alert('Password reset email sent to ' + adminClients[i].email); }

/* ── CONTRACTORS ── */
function renderContractorCards() {
  var container = document.getElementById('contractor-cards');
  if (!container) return;
  container.innerHTML = '';
  var tradeInfo = { Plumber:{bg:'#eff6ff',tc:'#2563eb',ic:'PL'}, Electrician:{bg:'#fefce8',tc:'#d97706',ic:'EL'}, Carpenter:{bg:'#fff3ec',tc:'#D4601D',ic:'CA'}, Roofer:{bg:'#f0fdf4',tc:'#16a34a',ic:'RO'}, Painter:{bg:'#f5f3ff',tc:'#7c3aed',ic:'PA'}, Cleaner:{bg:'#f0f1f3',tc:'#9199a8',ic:'CL'} };
  adminContractors.forEach(function(c) {
    var ti = tradeInfo[c.trade] || {bg:'#f0f1f3', tc:'#9199a8', ic:'GN'};
    var card = aEl('div', 'background:#fff;border-radius:14px;padding:20px;border:1px solid #e5e1dd;');
    var top = aEl('div', 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;');
    top.appendChild(aEl('div', 'width:44px;height:44px;background:'+ti.bg+';border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:'+ti.tc+';', ti.ic));
    top.appendChild(aPill(c.active ? 'Active' : 'Inactive'));
    card.appendChild(top);
    card.appendChild(aEl('div', 'font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:2px;', c.name));
    card.appendChild(aEl('div', 'font-size:13px;color:'+ti.tc+';font-weight:600;margin-bottom:10px;', c.trade));
    card.appendChild(aEl('div', 'font-size:13px;color:#9199a8;margin-bottom:2px;', c.phone));
    card.appendChild(aEl('div', 'font-size:13px;color:#9199a8;margin-bottom:12px;', c.email));
    card.appendChild(aEl('div', 'font-size:12px;color:#9199a8;', c.jobs + ' jobs completed'));
    container.appendChild(card);
  });
}

function openNewContractorForm() { var f = document.getElementById('new-contractor-form'); if (f) f.style.display = 'block'; }

function addContractor() {
  var name = ((document.getElementById('ncon-name') || {}).value || '').trim();
  if (!name) return;
  adminContractors.push({ name: name, trade: ((document.getElementById('ncon-trade') || {}).value || 'General'), phone: ((document.getElementById('ncon-phone') || {}).value || ''), email: ((document.getElementById('ncon-email') || {}).value || ''), jobs: 0, active: true });
  var msg = document.getElementById('contractor-added-msg');
  if (msg) { msg.style.display = 'block'; msg.textContent = name + ' added successfully.'; }
  renderContractorCards();
  ['ncon-name','ncon-phone','ncon-email'].forEach(function(id) { var e = document.getElementById(id); if (e) e.value = ''; });
  setTimeout(function() { var m = document.getElementById('contractor-added-msg'); if (m) m.style.display = 'none'; }, 3000);
}

/* ── PAYMENTS ── */
function renderAdminPayments() {
  var container = document.getElementById('admin-payment-table');
  if (!container) return;
  container.innerHTML = '';
  var hdr = aEl('div', 'padding:12px 20px;background:#f7f8fa;display:flex;gap:10px;font-size:11px;font-weight:700;color:#9199a8;letter-spacing:0.5px;text-transform:uppercase;border-bottom:1px solid #e5e1dd;');
  ['Job', 'Client', 'Property', 'Amount', 'Status', 'Actions'].forEach(function(h, i) {
    hdr.appendChild(aEl('div', 'flex:'+(i < 3 ? '1' : '0 0 '+(i===3?'90px':i===4?'110px':'150px'))+';', h));
  });
  container.appendChild(hdr);
  var withPrice = adminTickets.filter(function(t) { return t.price; });
  if (!withPrice.length) { container.appendChild(aEl('div', 'padding:30px;text-align:center;color:#9199a8;', 'No payment records yet.')); return; }
  withPrice.forEach(function(t) {
    var row = aEl('div', 'padding:14px 20px;border-bottom:1px solid #f0f1f3;display:flex;gap:10px;align-items:center;');
    var jobCol = aEl('div', 'flex:1;');
    jobCol.appendChild(aEl('div', 'font-size:14px;font-weight:500;color:#1a1a2e;', t.type));
    jobCol.appendChild(aEl('div', 'font-size:12px;color:#9199a8;', t.ref));
    row.appendChild(jobCol);
    row.appendChild(aEl('div', 'flex:1;font-size:13px;color:#4a5264;', t.client));
    row.appendChild(aEl('div', 'flex:1;font-size:13px;color:#4a5264;', t.address.substring(0, 22) + '...'));
    row.appendChild(aEl('div', 'flex:0 0 90px;font-size:14px;font-weight:700;color:#1a1a2e;', t.price));
    var stCol = aEl('div', 'flex:0 0 110px;');
    stCol.appendChild(aPill(t.paid ? 'Paid' : 'Awaiting Payment'));
    row.appendChild(stCol);
    var actCol = aEl('div', 'flex:0 0 150px;display:flex;gap:6px;');
    var markBtn = aEl('button', 'background:'+(t.paid?'#f0f1f3':'#D4601D')+';color:'+(t.paid?'#9199a8':'#fff')+';border:none;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;', t.paid ? 'Paid' : 'Mark Paid');
    markBtn.addEventListener('click', function() { setPaymentStatus(t.ref, true); });
    var viewBtn = aEl('button', 'background:#f0f1f3;color:#1a1a2e;border:none;padding:6px 12px;border-radius:7px;font-size:12px;cursor:pointer;font-family:"DM Sans",sans-serif;', 'View');
    viewBtn.addEventListener('click', function() { switchAdminTab('a-tickets'); openAdminTicket(t.ref); });
    actCol.appendChild(markBtn); actCol.appendChild(viewBtn);
    row.appendChild(actCol);
    container.appendChild(row);
  });
}

/* ── EXPOSE GLOBALS ── */
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.doAdminLogin = doAdminLogin;
window.logoutAdmin = logoutAdmin;
window.switchAdminTab = switchAdminTab;
window.renderAdminTickets = renderAdminTickets;
window.openAdminTicket = openAdminTicket;
window.renderAdminClients = renderAdminClients;
window.openNewClientForm = openNewClientForm;
window.createClient = createClient;
window.toggleClient = toggleClient;
window.sendReset = sendReset;
window.renderContractorCards = renderContractorCards;
window.openNewContractorForm = openNewContractorForm;
window.addContractor = addContractor;
window.renderAdminPayments = renderAdminPayments;
