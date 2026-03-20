
/* ── SUPABASE CONFIG ── */
var SUPA_URL = 'https://rlpungcpuowvgtbgncuq.supabase.co';
var _k1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscHVuZ2Nw';
var _k2 = 'dW93dmd0YmduY3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzkyMzgsImV4cCI6MjA4OTUxNTIzOH0';
var _k3 = '.T-LaFoGjneSRSfcPKeC7D3pAb3EpSK0e1GB8lxiWfqQ';
var supa = null;

function initSupabase() {
  if (!supa && typeof supabase !== 'undefined' && supabase.createClient) {
    supa = supabase.createClient(SUPA_URL, _k1+_k2+_k3);
  }
}
initSupabase();
window.addEventListener('load', function(){ if (!supa) initSupabase(); });

function supaSignIn(email, password) {
  initSupabase();
  if (!supa) return Promise.resolve({ error:{message:'Supabase not loaded — please refresh'} });
  return supa.auth.signInWithPassword({ email:email, password:password });
}
function supaSignOut() { if (supa) supa.auth.signOut(); }
function supaGetRole(email) {
  initSupabase();
  if (!supa) return Promise.resolve(null);
  return supa.from('users').select('role,full_name,id').eq('email', email).single().then(function(r){ return r.data; });
}
function supaLoadTickets(clientId) {
  initSupabase();
  if (!supa) return Promise.resolve([]);
  var q = supa.from('tickets').select('*').order('created_at',{ascending:false});
  if (clientId) q = q.eq('client_id', clientId);
  return q.then(function(r){ return r.data||[]; });
}
function supaLoadClients() {
  initSupabase();
  if (!supa) return Promise.resolve([]);
  return supa.from('users').select('*').eq('role','client').then(function(r){ return r.data||[]; });
}
function supaCreateClient(email, fullName, phone, company) {
  initSupabase();
  return supa.from('users').insert([{email:email,full_name:fullName,phone:phone,company:company,role:'client'}]).select().single();
}
function supaLoadContractors() {
  initSupabase();
  if (!supa) return Promise.resolve([]);
  return supa.from('contractors').select('*').then(function(r){ return r.data||[]; });
}
function supaCreateContractor(fullName, trade, phone, email) {
  initSupabase();
  return supa.from('contractors').insert([{full_name:fullName,trade:trade,phone:phone,email:email}]).select().single();
}
/* ── TICKET WRITES ── */
function _restPatch(table, filter, payload) {
  var key = _k1 + _k2 + _k3;
  return fetch(SUPA_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(t) {
        console.error('PATCH error', res.status, t);
        return { error: { message: t } };
      });
    }
    console.log('PATCH OK:', table, filter, payload);
    return { error: null };
  });
}

function supaUpdateTicket(ref, updates) {
  if (!ref) return Promise.resolve({ error: { message: 'no ref' } });
  var payload = {};
  if (updates.status     !== undefined) payload.status          = updates.status;
  if (updates.contractor !== undefined) payload.contractor_name = updates.contractor;
  if (updates.scheduled  !== undefined) payload.scheduled_at   = updates.scheduled;
  if (updates.price      !== undefined) payload.price          = updates.price;
  return _restPatch('tickets', 'ref=eq.' + encodeURIComponent(ref), payload);
}
function supaSetPaid(ref, paid) {
  if (!ref) return Promise.resolve({ error: { message: 'no ref' } });
  return _restPatch('tickets', 'ref=eq.' + encodeURIComponent(ref), { paid: paid });
}

/* ── MESSAGES ── */
function supaPostMessage(ticketId, senderRole, name, body, fileName, fileUrl, isImage) {
  initSupabase();
  if (!supa || !ticketId) return Promise.resolve({});
  return supa.from('messages').insert([{
    ticket_id: ticketId, sender_role: senderRole, sender_name: name,
    message: body||'', file_name: fileName||null, file_url: fileUrl||null, is_image: !!isImage
  }]);
}
function supaLoadMessages(ticketId) {
  initSupabase();
  if (!supa || !ticketId) return Promise.resolve([]);
  return supa.from('messages').select('*').eq('ticket_id', ticketId).order('created_at', {ascending:true}).then(function(r){ return r.data||[]; });
}
function supaPostContractorMessage(ticketId, senderRole, name, body, fileName, fileUrl, isImage) {
  initSupabase();
  if (!supa || !ticketId) return Promise.resolve({});
  return supa.from('contractor_messages').insert([{
    ticket_id: ticketId, sender_role: senderRole, sender_name: name,
    message: body||'', file_name: fileName||null, file_url: fileUrl||null, is_image: !!isImage
  }]);
}
function supaLoadContractorMessages(ticketId) {
  initSupabase();
  if (!supa || !ticketId) return Promise.resolve([]);
  return supa.from('contractor_messages').select('*').eq('ticket_id', ticketId).order('created_at', {ascending:true}).then(function(r){ return r.data||[]; });
}

/* ── STORAGE ── */
function supaUploadFile(file, ticketRef) {
  initSupabase();
  if (!supa || !file) return Promise.resolve(null);
  var ext = file.name.split('.').pop();
  var path = ticketRef + '/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
  return supa.storage.from('ticket-attachments').upload(path, file, { upsert: false }).then(function(r) {
    if (r.error) { console.error('Upload error:', r.error); return null; }
    return supa.storage.from('ticket-attachments').getPublicUrl(path).data.publicUrl;
  });
}

function mapSupaTicketsToAdmin(rows) {
  var prev = adminTickets.slice();
  var now  = Date.now();
  adminTickets = rows.map(function(r) {
    var existing = prev.find(function(t){ return t.ref === r.ref; });
    /* If admin saved this ticket within the last 60s, keep local editable fields
       so the poll does not overwrite an in-flight or recently committed save. */
    if (existing && existing._savedAt && (now - existing._savedAt) < 300000) {
      existing._id      = r.id;
      existing._clientId = r.client_id || '';
      return existing;
    }
    return {_id:r.id, ref:r.ref, _clientId:r.client_id||'', client:r.client_name||r.client_id||'',
      address:r.address||'', type:r.service_type||'', desc:r.description||'',
      status:r.status||'Pending', priority:r.priority||'Standard',
      contractor:r.contractor_name||'', scheduled:r.scheduled_at||'', price:r.price||'',
      paid:r.paid||false, messages:[], contractorMessages:[]};
  });
}
function mapSupaClientsToAdmin(rows) {
  adminClients = rows.map(function(r){
    return {_id:r.id,name:r.full_name,email:r.email,phone:r.phone||'',company:r.company||'',props:0,tickets:0,active:r.is_active};
  });
}
function mapSupaContractorsToAdmin(rows) {
  adminContractors = rows.map(function(r){
    return {_id:r.id,name:r.full_name,trade:r.trade,phone:r.phone||'',email:r.email||'',jobs:r.jobs_count||0,active:r.is_active};
  });
}
