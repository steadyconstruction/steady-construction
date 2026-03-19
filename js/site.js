
  function switchTab(id) {
    document.querySelectorAll('.client-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.client-content').forEach(c => c.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // activate matching tab button
    const labels = { 'residential-tab': 'Residential', 'commercial-tab': 'Commercial', 'landlord-tab': 'Landlords & Managers' };
    document.querySelectorAll('.client-tab').forEach(t => {
      if (t.textContent.trim() === labels[id]) t.classList.add('active');
    });
  }



(function(){
'use strict';
/* ============================================================
   STEADY CONSTRUCTION CLIENT PORTAL DEMO v6
   Key fix: dropdowns stored in pendingDropdowns[], drawn LAST
   so they always appear on top of all other canvas content.
   No voiceover. Caption bar only.
   ============================================================ */

var CV=null,CX=null,RAF=null,playing=false,frame=0;
var W=860,H=520,TOTAL=7000;
/* Chapter start frames */
var CH=[0,540,1020,1680,2900,3950,4900,5800];

var cur={x:430,y:260,tx:430,ty:260};
var ripples=[];

/* ── PALETTE ── */
var BG='#f7f8fa',WH='#ffffff',NV='#1a1a2e',
    OR='#D4601D',ORL='#e87a3a',ORBG='#fff3ec',
    G1='#f0f1f3',G2='#dde0e6',G3='#9199a8',G4='#4a5264',
    GRN='#16a34a',GRNBG='#f0fdf4',
    BLU='#2563eb',BLUBG='#eff6ff',
    AMB='#d97706',AMBBG='#fffbeb',
    PUR='#7c3aed',PURBG='#f5f3ff',
    DRK='#0f172a';

/* ── MATH ── */
function ei(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}
function lp(a,b,t){return a+(b-a)*t;}
function cl(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function pf(f,s,e){return cl((f-s)/(e-s),0,1);}

/* ── DROPDOWN QUEUE ──
   Each scene calls queueDropdown() instead of drawing directly.
   After all scene content is painted, flushDropdowns() draws them
   on top of everything — solving the z-order issue. */
var pendingDropdowns=[];
function queueDropdown(x,y,w,opts,sel){
  pendingDropdowns.push({x:x,y:y,w:w,opts:opts,sel:sel});
}
function flushDropdowns(){
  pendingDropdowns.forEach(function(d){
    drawDropdownOpen(d.x,d.y,d.w,d.opts,d.sel);
  });
  pendingDropdowns=[];
}
function drawDropdownOpen(x,y,w,opts,sel){
  var rowH=28,pad=8;
  var oh=opts.length*rowH+pad*2;
  /* Drop shadow beneath */
  CX.save();
  CX.shadowColor='rgba(0,0,0,0.18)';CX.shadowBlur=20;CX.shadowOffsetY=4;
  rr(x,y+32,w,oh,8,WH,G2,1);CX.fill();
  CX.restore();
  /* Background & border */
  rr(x,y+32,w,oh,8,WH,G2,1);
  /* Options */
  opts.forEach(function(o,i){
    var oy=y+32+pad+i*rowH;
    var oStr=typeof o==='string'?o:(o.label||o.val);
    var isSel=typeof o==='string'?(o===sel):(o.val===sel);
    if(isSel){
      rr(x+4,oy,w-8,rowH-2,5,ORBG);
    } else if(i>0){
      CX.fillStyle=G2;CX.fillRect(x+10,oy,w-20,1);
    }
    CX.font=(isSel?'600':'400')+' 11px "DM Sans",sans-serif';
    CX.fillStyle=isSel?OR:NV;CX.textAlign='left';
    CX.fillText(oStr,x+14,oy+rowH/2+4);
    if(typeof o==='object'&&o.sub){
      CX.font='300 9px "DM Sans",sans-serif';CX.fillStyle=G3;
      var mainW=CX.measureText(oStr).width;
      CX.fillText(o.sub,x+14+mainW+8,oy+rowH/2+4);
    }
  });
}

/* ── PRIMITIVES ── */
function rr(x,y,w,h,r,fill,stroke,lw){
  if(w<=0||h<=0)return;
  r=Math.min(r,w/2,h/2);
  CX.beginPath();
  CX.moveTo(x+r,y);CX.arcTo(x+w,y,x+w,y+r,r);
  CX.arcTo(x+w,y+h,x+w-r,y+h,r);CX.arcTo(x,y+h,x,y+h-r,r);
  CX.arcTo(x,y,x+r,y,r);CX.closePath();
  if(fill){CX.fillStyle=fill;CX.fill();}
  if(stroke){CX.strokeStyle=stroke;CX.lineWidth=lw||1;CX.stroke();}
}
function tx(s,x,y,sz,col,wt,al){
  CX.font=(wt||'400')+' '+(sz||12)+'px "DM Sans",sans-serif';
  CX.fillStyle=col||NV;CX.textAlign=al||'left';
  CX.fillText(String(s),x,y);
}
function serif(s,x,y,sz,col,al){
  CX.font='600 '+(sz||14)+'px "DM Serif Display",serif';
  CX.fillStyle=col||NV;CX.textAlign=al||'left';
  CX.fillText(String(s),x,y);
}
function lbl(s,x,y){
  CX.font='600 9px "DM Sans",sans-serif';CX.fillStyle=G3;CX.textAlign='left';
  CX.fillText(s.toUpperCase(),x,y);
}
function pill(s,x,y,bg,col){
  CX.font='600 9px "DM Sans",sans-serif';
  var w=CX.measureText(s).width+14;
  rr(x,y,w,18,9,bg);
  CX.fillStyle=col;CX.textAlign='center';CX.fillText(s,x+w/2,y+12);
  return w;
}
function field(x,y,w,val,focused){
  rr(x,y,w,30,6,focused?WH:G1,focused?OR:G2,focused?1.5:1);
  CX.font='400 11px "DM Sans",sans-serif';
  CX.fillStyle=val?NV:'#aaa';CX.textAlign='left';
  CX.fillText(val||'',x+9,y+19);
}
function ddBox(x,y,w,val,focused){
  rr(x,y,w,30,6,focused?WH:G1,focused?OR:G2,focused?1.5:1);
  CX.font='400 11px "DM Sans",sans-serif';
  CX.fillStyle=val?NV:'#aaa';CX.textAlign='left';
  CX.fillText(val||'Select...',x+9,y+19);
  CX.save();CX.strokeStyle=focused?OR:G3;CX.lineWidth=1.5;
  CX.beginPath();CX.moveTo(x+w-14,y+11);CX.lineTo(x+w-9,y+17);CX.lineTo(x+w-4,y+11);
  CX.stroke();CX.restore();
}
function radio(x,y,on,lbl2){
  CX.save();
  CX.beginPath();CX.arc(x+7,y+7,7,0,Math.PI*2);
  CX.strokeStyle=on?OR:G2;CX.lineWidth=1.5;CX.stroke();
  if(on){CX.beginPath();CX.arc(x+7,y+7,3.5,0,Math.PI*2);CX.fillStyle=OR;CX.fill();}
  CX.restore();
  tx(lbl2,x+20,y+11,11,NV);
}
function tickMark(cx2,cy2,sz,col){
  CX.save();CX.strokeStyle=col||WH;CX.lineWidth=sz/4.5;
  CX.lineCap='round';CX.lineJoin='round';
  CX.beginPath();
  CX.moveTo(cx2-sz*0.35,cy2);CX.lineTo(cx2-sz*0.05,cy2+sz*0.32);
  CX.lineTo(cx2+sz*0.42,cy2-sz*0.28);
  CX.stroke();CX.restore();
}
function moveTo(x,y){cur.tx=x;cur.ty=y;}
function doRipple(){ripples.push({x:cur.x,y:cur.y,age:0,max:22});}
function drawRipples(){
  ripples.forEach(function(r){
    var p=r.age/r.max;
    CX.beginPath();CX.arc(r.x,r.y,p*24,0,Math.PI*2);
    CX.strokeStyle='rgba(212,96,29,'+(1-p)*0.55+')';CX.lineWidth=1.5;CX.stroke();r.age++;
  });
  ripples=ripples.filter(function(r){return r.age<r.max;});
}
function drawCursor(){
  var pressed=ripples.some(function(r){return r.age<8;});
  CX.save();
  CX.shadowColor='rgba(0,0,0,0.22)';CX.shadowBlur=5;
  CX.translate(cur.x,cur.y);
  CX.beginPath();
  CX.moveTo(0,0);CX.lineTo(0,14);CX.lineTo(3.5,11);
  CX.lineTo(5.5,16.5);CX.lineTo(7.5,15.5);CX.lineTo(5.5,10);CX.lineTo(10,10);
  CX.closePath();
  CX.fillStyle=pressed?OR:WH;CX.fill();
  CX.shadowBlur=0;CX.strokeStyle='rgba(0,0,0,0.45)';CX.lineWidth=0.8;CX.stroke();
  CX.restore();
}

/* ── SIDEBAR NAV ── */
function navBar(activeIdx){
  rr(0,0,178,H,0,WH,G2,1);
  var lg=CX.createLinearGradient(16,14,48,48);
  lg.addColorStop(0,OR);lg.addColorStop(1,ORL);
  rr(16,14,32,32,8,lg);
  CX.font='700 11px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';CX.fillText('SC',32,34);
  CX.font='700 11px "DM Sans",sans-serif';CX.fillStyle=NV;CX.textAlign='left';CX.fillText('Steady',56,24);
  CX.font='300 9px "DM Sans",sans-serif';CX.fillStyle=G3;CX.fillText('Client Portal',56,36);
  ['Dashboard','Tickets','Payments','Properties','Messages'].forEach(function(item,i){
    var iy=60+i*46,isA=i===activeIdx;
    if(isA)rr(8,iy,162,34,8,ORBG);
    rr(16,iy+9,14,14,3,isA?OR:G2);
    CX.font=(isA?'600':'400')+' 11px "DM Sans",sans-serif';
    CX.fillStyle=isA?OR:G4;CX.textAlign='left';CX.fillText(item,38,iy+22);
  });
  rr(16,H-50,30,30,15,OR);
  CX.font='600 10px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';CX.fillText('JM',31,H-30);
  tx('John Murphy',54,H-37,10,NV,'600');
  tx('Landlord',54,H-25,9,G3,'300');
  rr(178,0,W-178,48,0,WH,G2,1);
}

/* ── CAPTION BAR ── */
function cap(line1,line2){
  rr(0,H-52,W,52,0,'rgba(8,8,8,0.88)');
  CX.fillStyle=OR;CX.fillRect(0,H-52,3,52);
  CX.font='600 12px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';
  CX.fillText(line1,W/2,H-33);
  if(line2){CX.font='300 10px "DM Sans",sans-serif';CX.fillStyle='rgba(255,255,255,0.45)';CX.fillText(line2,W/2,H-17);}
}
function chBadge(s){
  CX.font='600 9px "DM Sans",sans-serif';
  var w=CX.measureText(s).width+18;
  rr(188,10,w,22,5,OR);
  CX.fillStyle=WH;CX.textAlign='left';CX.fillText(s,197,24);
}

/* ═══════════════════════════════════════════
   SCENE 0 — LOGIN  (0-539)
   ═══════════════════════════════════════════ */
function s0Login(f){
  CX.fillStyle='#0f172a';CX.fillRect(0,0,W,H);
  CX.save();CX.strokeStyle='rgba(255,255,255,0.025)';CX.lineWidth=1;
  for(var xi=0;xi<W;xi+=44){CX.beginPath();CX.moveTo(xi,0);CX.lineTo(xi,H);CX.stroke();}
  for(var yi=0;yi<H;yi+=44){CX.beginPath();CX.moveTo(0,yi);CX.lineTo(W,yi);CX.stroke();}
  CX.restore();
  var gr=CX.createRadialGradient(W/2,H/2,0,W/2,H/2,300);
  gr.addColorStop(0,'rgba(212,96,29,0.13)');gr.addColorStop(1,'transparent');
  CX.fillStyle=gr;CX.fillRect(0,0,W,H);

  var appear=ei(pf(f,0,40));
  var cardY=lp(H+30,H/2-160,ei(pf(f,0,50)));
  var cw=320,cx2=W/2-cw/2;

  CX.save();CX.globalAlpha=appear;
  CX.save();CX.shadowColor='rgba(0,0,0,0.3)';CX.shadowBlur=50;
  rr(cx2,cardY,cw,315,16,WH);CX.fill();CX.restore();
  rr(cx2,cardY,cw,315,16,WH);
  var lg2=CX.createLinearGradient(W/2-20,cardY+22,W/2+20,cardY+62);
  lg2.addColorStop(0,OR);lg2.addColorStop(1,ORL);
  rr(W/2-20,cardY+22,40,40,10,lg2);
  CX.font='700 12px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';CX.fillText('SC',W/2,cardY+46);
  serif('Client Portal',W/2,cardY+88,18,NV,'center');
  tx('Sign in to your account',W/2,cardY+104,11,G3,'300','center');
  lbl('Email Address',cx2+16,cardY+126);
  var em='john.murphy@landlord.ie';
  var emV=f>80?em.substring(0,Math.floor(pf(f,80,180)*em.length)):'';
  field(cx2+16,cardY+130,cw-32,emV,f>80&&f<180);
  if(f>80&&f<180)moveTo(cx2+cw/2,cardY+145);
  lbl('Password',cx2+16,cardY+176);
  var pwV=f>200?'**********'.substring(0,Math.floor(pf(f,200,300)*10)):'';
  field(cx2+16,cardY+180,cw-32,pwV,f>200&&f<300);
  if(f>200&&f<300)moveTo(cx2+cw/2,cardY+195);
  var ba=ei(pf(f,320,370));
  rr(cx2+16,cardY+228,cw-32,38,8,'rgba(212,96,29,'+ba+')');
  CX.font='600 13px "DM Sans",sans-serif';CX.fillStyle='rgba(255,255,255,'+ba+')';CX.textAlign='center';
  CX.fillText('Sign In',W/2,cardY+251);
  if(f>=325)moveTo(W/2,cardY+247);
  if(f>390&&f<490){
    var n=Math.floor(pf(f,390,470)*3)%3+1;
    rr(cx2+16,cardY+228,cw-32,38,8,OR);
    CX.font='600 13px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';
    CX.fillText('Signing in'+'...'.substring(0,n),W/2,cardY+251);
  }
  CX.restore();
  if(f<180) cap('Secure client login','Each landlord has their own private account and password');
  else cap('Works on any device','Desktop, tablet or mobile — access your portal anywhere');
}

/* ═══════════════════════════════════════════
   SCENE 1 — DASHBOARD  (540-1019)
   ═══════════════════════════════════════════ */
function s1Dashboard(f){
  CX.fillStyle=BG;CX.fillRect(0,0,W,H);
  navBar(0);
  var p=ei(pf(f,0,28));
  CX.save();CX.globalAlpha=p;
  tx('Welcome back, John',190,30,15,NV,'600');
  tx('Wednesday 18 March 2026',190,45,10,G3,'300');
  var kpis=[
    {lbl:'Active Tickets',val:'12',sub:'+2 this week',sc:OR,sbg:ORBG},
    {lbl:'In Progress',val:'5',sub:'3 on site today',sc:BLU,sbg:BLUBG},
    {lbl:'Completed',val:'28',sub:'This month',sc:GRN,sbg:GRNBG},
    {lbl:'Pending Payments',val:'EUR 2,450',sub:'2 invoices',sc:AMB,sbg:AMBBG},
  ];
  var kw=(W-190)/4-6;
  kpis.forEach(function(k,i){
    var kx=190+i*(kw+6),ky=58;
    var ka=ei(pf(f,4+i*10,28+i*10));
    CX.save();CX.globalAlpha*=ka;
    rr(kx,ky,kw,70,10,WH,G2);rr(kx,ky,kw,3,2,k.sc);
    lbl(k.lbl,kx+10,ky+18);
    CX.font='400 21px "DM Serif Display",serif';CX.fillStyle=k.sc;CX.textAlign='left';
    CX.fillText(k.val,kx+10,ky+46);
    tx(k.sub,kx+10,ky+60,9,G3,'300');
    CX.restore();
  });
  tx('Recent Activity',190,142,12,NV,'600');
  var acts=[
    {ref:'#T-1023',type:'Electrical',addr:'8 Pearse St, D2',status:'In Progress',sc:BLU,sbg:BLUBG},
    {ref:'#T-1022',type:'Carpentry',addr:'5 Cork Ave, D4',status:'Scheduled',sc:OR,sbg:ORBG},
    {ref:'#T-1019',type:'Roofing',addr:'5 Cork Ave, D4',status:'Completed',sc:GRN,sbg:GRNBG},
  ];
  acts.forEach(function(a,i){
    var ay=155+i*54,aa=ei(pf(f,18+i*12,40+i*12));
    CX.save();CX.globalAlpha*=aa;
    rr(190,ay,W-198,46,8,WH,G2);rr(190,ay,3,46,2,a.sc);
    tx(a.ref,200,ay+16,9,G3,'600');
    tx(a.type+' — '+a.addr,200,ay+30,12,NV,'500');
    pill(a.status,W-132,ay+15,a.sbg,a.sc);
    CX.restore();
  });
  if(f<80)moveTo(190+kw*0.5,93);
  else if(f<180)moveTo(190+kw*1.6,93);
  else if(f<280)moveTo(190+kw*2.6,93);
  else moveTo(190+kw*3.6,93);
  CX.restore();
  chBadge('01  Dashboard');
  if(f<130) cap('Live dashboard overview','Active tickets, jobs in progress, completions and pending payments');
  else if(f<280) cap('Four key metrics update in real time','See what is active, who is on site, and what is outstanding');
  else cap('Recent activity feed','Every update across all your properties — no chasing required');
}

/* ═══════════════════════════════════════════
   SCENE 2 — CREATE TICKET  (1020-1679)
   All dropdowns queued and flushed LAST
   ═══════════════════════════════════════════ */
function s2Create(f){
  CX.fillStyle=BG;CX.fillRect(0,0,W,H);
  navBar(1);
  tx('Create New Ticket',190,30,15,NV,'600');
  tx('Raise a maintenance or construction job',190,44,10,G3,'300');
  rr(190,52,W-198,H-60,10,WH,G2);

  var lx=202,rx=202+(W-220)/2+8,fw=(W-220)/2-8;

  /* ── Draw all static form content first ── */

  /* Property address label + box */
  lbl('Property Address',lx,76);
  var propV=f>20?'12 Dublin Street, Dublin 1':'';
  ddBox(lx,80,fw,propV,f>15&&f<90);
  if(f>15&&f<90)moveTo(lx+fw/2,95);

  /* Issue type label + box */
  lbl('Issue Type',rx,76);
  var issV=f>100?'Plumbing':'';
  ddBox(rx,80,fw,issV,f>95&&f<190);
  if(f>95&&f<190)moveTo(rx+fw/2,95);

  /* Contractor label + box */
  lbl('Contractor Required',lx,130);
  var conV=f>200?'Plumber':'';
  ddBox(lx,134,fw,conV,f>195&&f<370);
  if(f>195&&f<370)moveTo(lx+fw/2,149);

  /* Request type label + box */
  lbl('Request Type',rx,130);
  var reqV=f>380?'Call Out + Quote':'';
  ddBox(rx,134,fw,reqV,f>375&&f<470);
  if(f>375&&f<470)moveTo(rx+fw/2,149);

  /* Description textarea */
  lbl('Description of Issue',lx,182);
  var descFull='Leak under kitchen sink — water dripping from waste pipe connection.';
  var descV=f>480?descFull.substring(0,Math.floor(pf(f,480,555)*descFull.length)):'';
  rr(lx,186,W-220,44,6,f>480&&f<555?WH:G1,f>480&&f<555?OR:G2,f>480?1.5:1);
  CX.font='400 10px "DM Sans",sans-serif';CX.fillStyle=descV?NV:'#aaa';CX.textAlign='left';
  var dwords=descV.split(' '),dline='',dly=200;
  dwords.forEach(function(w){
    var test=dline+(dline?' ':'')+w;
    if(CX.measureText(test).width>W-232){CX.fillText(dline,lx+8,dly);dline=w;dly+=13;}
    else dline=test;
  });
  if(dline)CX.fillText(dline,lx+8,dly);
  if(f>480&&f<555)moveTo(lx+120,200);

  /* Occupancy */
  lbl('Property Occupied?',lx,248);
  radio(lx,252,f>565,'Yes — Tenant in residence');
  radio(lx+180,252,false,'No — Vacant');
  if(f>560&&f<610)moveTo(lx+7,259);

  /* Access */
  lbl('Access Instructions',rx,248);
  var accFull='Tenant available after 2pm. Key in lockbox — code 4821.';
  var accV=f>620?accFull.substring(0,Math.floor(pf(f,620,680)*accFull.length)):'';
  field(rx,252,fw,accV,f>618&&f<680);
  if(f>618&&f<680)moveTo(rx+fw/2,267);

  /* Submit */
  var sba=ei(pf(f,690,720));
  rr(lx,306,170,36,8,'rgba(212,96,29,'+sba+')');
  CX.font='600 12px "DM Sans",sans-serif';CX.fillStyle='rgba(255,255,255,'+sba+')';CX.textAlign='center';
  CX.fillText('Submit Ticket',lx+85,328);
  if(f>=694)moveTo(lx+85,324);

  /* Success */
  if(f>740){
    var sp=ei(pf(f,740,775));
    CX.save();CX.globalAlpha*=sp;
    rr(lx,350,W-220,50,10,GRNBG,GRN,1.5);
    CX.font='600 12px "DM Sans",sans-serif';CX.fillStyle=GRN;CX.textAlign='center';
    CX.fillText('Ticket #T-1024 created — your team has been notified',W/2,373);
    CX.font='300 10px "DM Sans",sans-serif';CX.fillStyle=GRN;
    CX.fillText('You will receive live updates as the job progresses.',W/2,389);
    CX.restore();
  }

  chBadge('02  New Ticket');

  /* Caption (drawn before dropdowns so dropdowns sit on top) */
  if(f<90) cap('Select the property address','Choose from all your registered properties');
  else if(f<190) cap('Select the issue type','Plumbing, electrical, carpentry, roofing, painting and more');
  else if(f<370) cap('Select the contractor category','Choose the trade you need — plumber, electrician, carpenter and more');
  else if(f<470) cap('Request type — Call Out and Quote','We visit, assess, and provide a fixed price before work begins');
  else if(f<560) cap('Describe the issue','Detail helps the contractor arrive fully prepared');
  else if(f<680) cap('Occupancy and access instructions','Is a tenant in? What is the key access? Any notes for the contractor?');
  else cap('Submit — ticket created instantly','Reference generated, team notified. No phone call needed.');

  /* ── QUEUE DROPDOWNS — drawn on top of everything including caption ── */
  if(f>15&&f<90){
    queueDropdown(lx,80,fw,[
      {val:'12 Dublin Street, Dublin 1',label:'12 Dublin Street, Dublin 1'},
      {val:'5 Cork Avenue, Dublin 4',label:'5 Cork Avenue, Dublin 4'},
      {val:'8 Pearse Street, Dublin 2',label:'8 Pearse Street, Dublin 2'},
    ],f>45?'12 Dublin Street, Dublin 1':'');
  }
  if(f>95&&f<190){
    queueDropdown(rx,80,fw,[
      {val:'Plumbing',label:'Plumbing',sub:'leaks, pipes, drains'},
      {val:'Electrical',label:'Electrical',sub:'wiring, sockets, fuse box'},
      {val:'Carpentry',label:'Carpentry',sub:'doors, windows, joinery'},
      {val:'Roofing',label:'Roofing',sub:'slates, gutters, felt'},
      {val:'Painting',label:'Painting',sub:'interior & exterior'},
      {val:'General',label:'General Maintenance'},
    ],f>140?'Plumbing':'');
  }
  if(f>195&&f<370){
    /* Contractor — category only, no names. SLOWED (175 frames) */
    queueDropdown(lx,134,fw,[
      {val:'Plumber',label:'Plumber',sub:'water, pipes & drainage'},
      {val:'Electrician',label:'Electrician',sub:'wiring, sockets & fuse box'},
      {val:'Carpenter',label:'Carpenter',sub:'doors, frames & joinery'},
      {val:'Roofer',label:'Roofer',sub:'slates, gutters & felt'},
      {val:'Painter',label:'Painter',sub:'interior & exterior painting'},
      {val:'Cleaning',label:'Cleaning Team',sub:'end of tenancy & maintenance'},
    ],f>270?'Plumber':'');
  }
  if(f>375&&f<470){
    queueDropdown(rx,134,fw,[
      {val:'Call Out + Quote',label:'Call Out + Quote',sub:'visit & fixed price'},
      {val:'Call Out Only',label:'Call Out Only',sub:'emergency attendance'},
      {val:'Quote Only',label:'Quote Only',sub:'estimate without work'},
    ],f>420?'Call Out + Quote':'');
  }
}

/* ═══════════════════════════════════════════
   SCENE 3 — PROGRESS  (1680-2899)
   Fixed-height rows, no overlapping text
   ═══════════════════════════════════════════ */
function s3Progress(f){
  CX.fillStyle=BG;CX.fillRect(0,0,W,H);
  navBar(1);
  tx('Tickets',190,28,10,G3);tx(' > ',222,28,10,G3);tx('#T-1024',240,28,10,OR,'600');
  serif('#T-1024 — Plumbing',190,46,15,NV);
  tx('12 Dublin Street, Dublin 1',190,60,10,G3,'300');

  var stIdx=Math.min(3,Math.floor(pf(f,60,600)*4));
  var statuses=['Pending','Assigned','Scheduled','In Progress'];
  var stCols=[AMB,PUR,OR,BLU];
  var stBgs=[AMBBG,PURBG,ORBG,BLUBG];
  pill(statuses[stIdx],W-162,36,stBgs[stIdx],stCols[stIdx]);

  var p=ei(pf(f,0,22));CX.save();CX.globalAlpha=p;

  /* Info grid */
  var infos=[
    ['Contractor',stIdx>=1?'Plumber assigned':'Pending'],
    ['Trade','Plumbing'],
    ['Scheduled',stIdx>=2?'Tomorrow at 11:00 AM':'To be confirmed'],
    ['Estimate',stIdx>=2?'EUR 180 - 260':'Pending quote'],
    ['Occupancy','Tenant in residence'],
    ['Access','After 2pm — code 4821'],
  ];
  var iw=(W-198)/3-4,igap=6;
  infos.forEach(function(inf,i){
    var ix=190+(i%3)*(iw+igap),iy=70+(Math.floor(i/3)*44);
    var ia=ei(pf(f,4+i*6,24+i*6));
    CX.save();CX.globalAlpha*=ia;
    rr(ix,iy,iw,36,6,WH,G2);lbl(inf[0],ix+10,iy+13);
    var vc=(inf[1]==='Pending'||inf[1]==='To be confirmed'||inf[1]==='Pending quote')?G3:NV;
    tx(inf[1],ix+10,iy+28,10,vc,'500');
    CX.restore();
  });

  /* Progress bar */
  var barY=164;
  tx('Job Progress',190,barY,12,NV,'600');
  rr(190,barY+6,W-198,46,8,WH,G2);
  var stages=['Received','Assigned','Scheduled','In Progress','Completed'];
  var sw=(W-218)/stages.length;
  stages.forEach(function(s,i){
    var sx=204+i*sw+sw/2,done=i<stIdx,active=i===stIdx;
    var sfa=ei(pf(f,8+i*14,32+i*14));
    CX.save();CX.globalAlpha*=sfa;
    if(i<stages.length-1){
      CX.beginPath();CX.moveTo(sx+10,barY+26);CX.lineTo(sx+sw-10,barY+26);
      CX.strokeStyle=done?stCols[stIdx]:G2;CX.lineWidth=2;CX.stroke();
    }
    CX.beginPath();CX.arc(sx,barY+26,9,0,Math.PI*2);
    CX.fillStyle=active?stCols[stIdx]:(done?NV:G2);CX.fill();
    if(done)tickMark(sx,barY+26,9,WH);
    if(active){CX.font='700 8px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';CX.fillText('>',sx,barY+30);}
    CX.font=(active?'600':'400')+' 8px "DM Sans",sans-serif';
    CX.fillStyle=active?stCols[stIdx]:(done?NV:G3);CX.textAlign='center';
    CX.fillText(s,sx,barY+46);
    CX.restore();
  });

  /* Status timeline — fixed-height rows, no shifting */
  var tlY=220;
  tx('Status Updates',190,tlY,12,NV,'600');
  var rowH=48,rows=4;
  rr(190,tlY+8,W-198,rowH*rows+10,8,WH,G2);

  var updates=[
    {t:'Today 09:15',m:'Ticket #T-1024 created — plumbing job at 12 Dublin St.',at:0},
    {t:'Today 09:42',m:'Plumber assigned to this job.',at:160},
    {t:'Today 10:05',m:'Job scheduled — arriving tomorrow at 11:00 AM.',at:330},
    {t:'Tomorrow 11:08',m:'Contractor on site — work now in progress.',at:500},
  ];
  updates.forEach(function(u,i){
    var ry=tlY+16+i*rowH;
    if(i>0){CX.fillStyle=G1;CX.fillRect(202,ry,W-220,1);}
    var da=f>=u.at?ei(pf(f,u.at,u.at+30)):0;
    CX.save();CX.globalAlpha*=da;
    CX.beginPath();CX.arc(202,ry+22,5,0,Math.PI*2);
    CX.fillStyle=i===stIdx?stCols[stIdx]:NV;CX.fill();
    /* Time on one line */
    tx(u.t,214,ry+16,9,G3,'600');
    /* Message on next line, clipped */
    CX.save();
    CX.beginPath();CX.rect(214,ry+22,W-232,16);CX.clip();
    tx(u.m,214,ry+33,10,NV);
    CX.restore();
    CX.restore();
  });

  /* Email notification toast */
  if(f>200&&stIdx>=1){
    var na=ei(pf(f,200+stIdx*80,230+stIdx*80));
    CX.save();CX.globalAlpha*=na;
    rr(W-250,14,238,52,10,DRK);rr(W-250,14,3,52,2,OR);
    tx('Email sent to client',W-240,30,11,WH,'600');
    var ntxt=['','Plumber assigned to your job','Scheduled: tomorrow 11am','Contractor is now on site'];
    tx(ntxt[stIdx]||'',W-240,46,10,'rgba(255,255,255,0.42)','300');
    CX.restore();
  }

  CX.restore();
  chBadge('03  Progress Tracker');
  if(f<150) cap('Track your ticket live','Every status change is visible here in real time');
  else if(f<350) cap('Five-stage progress tracker','Received, Assigned, Scheduled, In Progress, Completed');
  else if(f<560) cap('Each update logged with time and detail','Full transparency on every stage of your job');
  else cap('Automatic email at every stage change','Always informed — even when not logged in');
}

/* ═══════════════════════════════════════════
   SCENE 4 — MESSAGING  (2900-3949)
   ═══════════════════════════════════════════ */
function s4Messaging(f){
  CX.fillStyle=BG;CX.fillRect(0,0,W,H);
  navBar(1);
  tx('Tickets',190,28,10,G3);tx(' > ',222,28,10,G3);tx('#T-1024 — Messages',240,28,10,OR,'600');
  serif('Communication Log',190,46,15,NV);
  tx('All messages stored permanently against this job.',190,60,10,G3,'300');

  var msgs=[
    {from:'system',text:'Ticket created. Team notified.',time:'09:15'},
    {from:'team',  text:'Hi John — the plumber will be with you tomorrow at 11am. He will call 30 minutes before arrival.',time:'09:42',name:'Steady Team'},
    {from:'client',text:'Perfect. Key is in the lockbox at the front. Code is 4821.',time:'10:05',name:'You'},
    {from:'team',  text:'On site now. Found the issue — faulty waste trap. Replacing now, approximately 45 minutes.',time:'11:14',name:'Plumber'},
    {from:'client',text:'Great, thank you for the update.',time:'11:22',name:'You'},
    {from:'team',  text:'All done. Before and after photos attached. Invoice to follow.',time:'11:58',name:'Plumber'},
  ];
  var my=72;
  msgs.forEach(function(m,i){
    var showAt=i*90;if(f<showAt)return;
    var ma=ei(pf(f,showAt,showAt+28));
    CX.save();CX.globalAlpha*=ma;
    var isClient=m.from==='client',isSys=m.from==='system';
    if(isSys){
      CX.font='300 9px "DM Sans",sans-serif';CX.fillStyle=G3;CX.textAlign='center';
      CX.fillText(m.text,W/2,my+8);my+=22;CX.restore();return;
    }
    CX.font='400 11px "DM Sans",sans-serif';
    var lines=[''];
    m.text.split(' ').forEach(function(w){
      var cur2=lines[lines.length-1];
      if(CX.measureText(cur2+(cur2?' ':'')+w).width>285)lines.push(w);
      else lines[lines.length-1]=cur2+(cur2?' ':'')+w;
    });
    var bw=0;
    lines.forEach(function(l){var lw=CX.measureText(l).width+24;if(lw>bw)bw=lw;});
    bw=Math.min(bw,310);
    var bh=lines.length*15+20;
    var bx=isClient?W-14-bw:190;
    rr(bx,my,bw,bh,10,isClient?OR:WH,isClient?'transparent':G2);
    lines.forEach(function(l,li){
      CX.fillStyle=isClient?WH:NV;CX.textAlign='left';CX.fillText(l,bx+12,my+15+li*15);
    });
    CX.font='300 9px "DM Sans",sans-serif';
    CX.fillStyle=isClient?'rgba(255,255,255,0.5)':G3;
    CX.textAlign=isClient?'right':'left';
    CX.fillText((m.name||'')+' - '+m.time,isClient?bx+bw-8:bx+12,my+bh+9);
    my+=bh+22;CX.restore();
  });

  rr(190,H-86,W-198,34,7,WH,G2);
  var typing=f>520?'Is there anything else needed after the repair?'.substring(0,Math.floor(pf(f,520,620)*48)):'';
  tx(typing||'Type a message to your team...',200,H-64,11,typing?NV:G3);
  if(f>520)moveTo(330,H-69);
  rr(W-76,H-90,62,38,7,OR);
  CX.font='600 11px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';CX.fillText('Send',W-45,H-65);

  chBadge('04  Messaging');
  if(f<80) cap('Dedicated messaging on every ticket','Your direct line to the team handling your job');
  else if(f<250) cap('Full conversation history stored permanently','Every message kept — even after the job is completed');
  else cap('Real-time replies from contractor on site','Ask questions, share access details, get live updates');
}

/* ═══════════════════════════════════════════
   SCENE 5 — PAYMENT  (3950-4899)
   ═══════════════════════════════════════════ */
function s5Payment(f){
  CX.fillStyle=BG;CX.fillRect(0,0,W,H);
  navBar(2);
  var p=ei(pf(f,0,22));CX.save();CX.globalAlpha=p;
  tx('Payments',190,30,15,NV,'600');
  rr(190,44,124,26,6,ORBG);tx('Unpaid: EUR 2,450',198,61,10,OR,'600');
  rr(322,44,158,26,6,GRNBG);tx('Paid this month: EUR 4,820',330,61,10,GRN,'600');

  rr(190,78,W-198,84,10,WH,G2);rr(190,78,3,84,2,AMB);
  tx('#T-1024 — Plumbing',200,96,12,NV,'600');
  tx('12 Dublin Street, Dublin 1',200,110,10,G3,'300');
  tx('Completed — 19 March 2026',200,122,10,G3,'300');
  CX.font='400 22px "DM Serif Display",serif';CX.fillStyle=NV;CX.textAlign='right';
  CX.fillText('EUR 180.00',W-206,108);
  CX.font='300 10px "DM Sans",sans-serif';CX.fillStyle=G3;CX.textAlign='right';
  CX.fillText('Due within 5 days',W-206,122);

  var underReview=f>530;
  pill(underReview?'Under Review':'Awaiting Payment',W-170,82,underReview?PURBG:AMBBG,underReview?PUR:AMB);

  var fa=ei(pf(f,40,75));CX.save();CX.globalAlpha*=fa;
  tx('Log Your Payment',190,175,12,NV,'600');
  tx('Make your bank transfer then enter the details below. We will cross-reference and confirm.',190,189,10,G3,'300');
  rr(190,198,W-198,150,10,WH,G2);
  lbl('Bank Transfer Reference',202,218);
  var refV=f>200?'REF-2024-78241'.substring(0,Math.floor(pf(f,200,310)*14)):'';
  field(202,222,(W-218)/2,refV,f>198&&f<310);
  if(f>198&&f<310)moveTo(202+(W-218)/4,237);
  lbl('Amount Paid',202+(W-218)/2+8,218);
  var amtV=f>330?'EUR 180.00':'';
  field(202+(W-218)/2+8,222,(W-218)/2,amtV,f>328&&f<400);
  if(f>328&&f<400)moveTo(202+(W-218)/2+8+(W-218)/4,237);
  lbl('Date of Transfer',202,266);
  var dateV=f>415?'19 March 2026':'';
  field(202,270,(W-218)/2,dateV,f>413&&f<480);
  if(f>413&&f<480)moveTo(202+(W-218)/4,285);
  lbl('Notes (optional)',202+(W-218)/2+8,266);
  field(202+(W-218)/2+8,270,(W-218)/2,'',false);
  var sba=ei(pf(f,495,525));
  if(!underReview){
    rr(202,312,230,34,8,'rgba(212,96,29,'+sba+')');
    CX.font='600 12px "DM Sans",sans-serif';CX.fillStyle='rgba(255,255,255,'+sba+')';CX.textAlign='center';
    CX.fillText('I have made this payment',317,333);
    if(f>=500)moveTo(317,329);
  }
  CX.restore();
  if(underReview){
    var ua=ei(pf(f,530,560));
    CX.save();CX.globalAlpha*=ua;
    rr(202,312,W-210,52,10,PURBG,PUR,1.5);
    CX.font='600 12px "DM Sans",sans-serif';CX.fillStyle=PUR;CX.textAlign='center';
    CX.fillText('Payment submitted — Under Review',W/2,334);
    CX.font='300 10px "DM Sans",sans-serif';CX.fillStyle=PUR;
    CX.fillText('Our team will cross-reference your bank transfer and confirm within 1 business day.',W/2,350);
    CX.restore();
    if(f===531)doRipple();
  }
  CX.restore();
  chBadge('05  Payments');
  if(f<100) cap('Invoice appears when job is complete','Amount, due date and payment status — all visible');
  else if(f<300) cap('Enter your bank transfer reference','The reference number from your online banking transfer');
  else if(f<495) cap('Add amount and date of transfer','Gives our team everything needed to match your payment');
  else if(!underReview) cap('"I have made this payment"','No card payment — transfer directly, then log it here');
  else cap('Status: Under Review','Admin confirms your payment within one business day');
}

/* ═══════════════════════════════════════════
   SCENE 6 — DASHBOARD RETURN  (4900-5799)
   ═══════════════════════════════════════════ */
function s6DashReturn(f){
  CX.fillStyle=BG;CX.fillRect(0,0,W,H);
  navBar(0);
  var p=ei(pf(f,0,28));CX.save();CX.globalAlpha=p;
  tx('Welcome back, John',190,30,15,NV,'600');
  tx('Wednesday 18 March 2026  —  Updated',190,45,10,G3,'300');
  var kpis=[
    {lbl:'Active Tickets',val:'11',sub:'-1 completed today',sc:OR,sbg:ORBG,upd:true},
    {lbl:'In Progress',val:'4',sub:'Plumber job done',sc:BLU,sbg:BLUBG,upd:false},
    {lbl:'Completed',val:'29',sub:'+1 just now',sc:GRN,sbg:GRNBG,upd:true},
    {lbl:'Pending Payments',val:'EUR 2,270',sub:'Payment under review',sc:PUR,sbg:PURBG,upd:true},
  ];
  var kw=(W-190)/4-6;
  kpis.forEach(function(k,i){
    var kx=190+i*(kw+6),ky=58,ka=ei(pf(f,4+i*10,28+i*10));
    CX.save();CX.globalAlpha*=ka;
    rr(kx,ky,kw,70,10,k.upd?'#fefdf8':WH,k.upd?k.sc:G2,k.upd?1.5:1);
    rr(kx,ky,kw,3,2,k.sc);
    lbl(k.lbl,kx+10,ky+18);
    CX.font='400 21px "DM Serif Display",serif';CX.fillStyle=k.sc;CX.textAlign='left';
    CX.fillText(k.val,kx+10,ky+46);
    tx(k.sub,kx+10,ky+60,9,k.upd?k.sc:G3,k.upd?'500':'300');
    CX.restore();
  });
  tx('Recent Activity',190,142,12,NV,'600');
  var acts=[
    {ref:'#T-1024',type:'Plumbing — Completed',addr:'12 Dublin St, D1',status:'Under Review',sc:PUR,sbg:PURBG,fresh:true},
    {ref:'#T-1023',type:'Electrical',addr:'8 Pearse St, D2',status:'In Progress',sc:BLU,sbg:BLUBG,fresh:false},
    {ref:'#T-1022',type:'Carpentry',addr:'5 Cork Ave, D4',status:'Scheduled',sc:OR,sbg:ORBG,fresh:false},
  ];
  acts.forEach(function(a,i){
    var ay=155+i*54,aa=ei(pf(f,12+i*12,36+i*12));
    CX.save();CX.globalAlpha*=aa;
    rr(190,ay,W-198,46,8,a.fresh?PURBG:WH,a.fresh?PUR:G2,a.fresh?1.5:1);
    rr(190,ay,3,46,2,a.sc);
    tx(a.ref,200,ay+16,9,G3,'600');
    tx(a.type+' — '+a.addr,200,ay+30,12,NV,'500');
    pill(a.status,W-140,ay+15,a.sbg,a.sc);
    if(a.fresh)tx('Just now',W-50,ay+22,9,PUR,'600','right');
    CX.restore();
  });
  if(f<80)moveTo(190+kw*2.5,93);
  else if(f<200)moveTo(190+kw*3.6,93);
  else moveTo(190+kw*0.5,180);
  CX.restore();
  chBadge('06  Dashboard Updated');
  if(f<120) cap('Dashboard updated automatically','Completed jobs up, active tickets down, payments reflect the review');
  else if(f<280) cap('Everything stays in sync','Multiple properties, multiple jobs — all in one clean overview');
  else cap('Nothing falls through the cracks','Full audit trail of every job across your entire portfolio');
}

/* ═══════════════════════════════════════════
   SCENE 7 — CLOSING  (5800+)
   ═══════════════════════════════════════════ */
function s7Closing(f){
  CX.fillStyle='#0f172a';CX.fillRect(0,0,W,H);
  CX.save();CX.strokeStyle='rgba(255,255,255,0.02)';CX.lineWidth=1;
  for(var xi=0;xi<W;xi+=44){CX.beginPath();CX.moveTo(xi,0);CX.lineTo(xi,H);CX.stroke();}
  for(var yi=0;yi<H;yi+=44){CX.beginPath();CX.moveTo(0,yi);CX.lineTo(W,yi);CX.stroke();}
  CX.restore();
  var gr=CX.createRadialGradient(W/2,H/2-40,0,W/2,H/2-40,380);
  gr.addColorStop(0,'rgba(212,96,29,0.14)');gr.addColorStop(1,'transparent');
  CX.fillStyle=gr;CX.fillRect(0,0,W,H);

  var la=ei(pf(f,0,35));
  CX.save();CX.globalAlpha=la;
  var lg3=CX.createLinearGradient(W/2-22,H/2-158,W/2+22,H/2-118);
  lg3.addColorStop(0,OR);lg3.addColorStop(1,ORL);
  rr(W/2-22,H/2-162,44,44,12,lg3);
  CX.font='700 14px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';CX.fillText('SC',W/2,H/2-134);
  CX.restore();

  CX.save();CX.globalAlpha=ei(pf(f,40,80));
  CX.font='300 26px "DM Serif Display",serif';CX.fillStyle='rgba(255,255,255,0.9)';CX.textAlign='center';
  CX.fillText('Full Control.',W/2,H/2-68);CX.restore();

  CX.save();CX.globalAlpha=ei(pf(f,90,130));
  CX.font='600 34px "DM Serif Display",serif';CX.fillStyle=OR;CX.textAlign='center';
  CX.fillText('Real-Time Updates.',W/2,H/2-24);CX.restore();

  CX.save();CX.globalAlpha=ei(pf(f,140,180));
  CX.font='300 26px "DM Serif Display",serif';CX.fillStyle='rgba(255,255,255,0.9)';CX.textAlign='center';
  CX.fillText('Complete Transparency.',W/2,H/2+20);CX.restore();

  CX.save();CX.globalAlpha=ei(pf(f,200,240));
  CX.font='300 14px "DM Sans",sans-serif';CX.fillStyle='rgba(255,255,255,0.42)';CX.textAlign='center';
  CX.fillText('Manage your properties smarter.',W/2,H/2+65);CX.restore();

  var ba2=ei(pf(f,255,295));
  CX.save();CX.globalAlpha=ba2;
  rr(W/2-110,H/2+82,220,42,12,OR);
  var glw=CX.createRadialGradient(W/2,H/2+103,0,W/2,H/2+103,90);
  glw.addColorStop(0,'rgba(212,96,29,0.3)');glw.addColorStop(1,'transparent');
  CX.fillStyle=glw;CX.fillRect(W/2-110,H/2+60,220,60);
  CX.font='600 13px "DM Sans",sans-serif';CX.fillStyle=WH;CX.textAlign='center';
  CX.fillText('Get Started Today',W/2,H/2+107);CX.restore();

  CX.save();CX.globalAlpha=ei(pf(f,310,350));
  CX.font='500 10px "DM Sans",sans-serif';
  var features=['Saves time','Full transparency','Centralised comms','Landlord control','Live tracking'];
  var totalFW=0;
  features.forEach(function(ft){totalFW+=CX.measureText(ft).width+28+10;});totalFW-=10;
  var fsx=W/2-totalFW/2;
  features.forEach(function(ft){
    var fw2=CX.measureText(ft).width+28;
    rr(fsx,H/2+142,fw2,22,11,'rgba(255,255,255,0.07)','rgba(255,255,255,0.14)',1);
    CX.fillStyle='rgba(255,255,255,0.52)';CX.textAlign='center';CX.fillText(ft,fsx+fw2/2,H/2+156);
    fsx+=fw2+10;
  });
  CX.restore();
  if(f>255)moveTo(W/2,H/2+103);
}

/* ══════════════════════════════════════════
   DISPATCH — scene draws content, queues
   dropdowns, then flushDropdowns() renders
   them on top of ALL canvas content
   ══════════════════════════════════════════ */
function dispatch(f){
  cur.x=lp(cur.x,cur.tx,0.16);
  cur.y=lp(cur.y,cur.ty,0.16);

  if     (f<CH[1])s0Login(f-CH[0]);
  else if(f<CH[2])s1Dashboard(f-CH[1]);
  else if(f<CH[3])s2Create(f-CH[2]);
  else if(f<CH[4])s3Progress(f-CH[3]);
  else if(f<CH[5])s4Messaging(f-CH[4]);
  else if(f<CH[6])s5Payment(f-CH[5]);
  else if(f<CH[7])s6DashReturn(f-CH[6]);
  else            s7Closing(f-CH[7]);

  /* Draw dropdowns on top of everything */
  flushDropdowns();

  /* Cursor and ripples always on very top */
  drawCursor();
  drawRipples();

  if(CH.indexOf(f)!==-1&&f>0)doRipple();
}

/* ══════════════════════════════════════════
   ENGINE
   ══════════════════════════════════════════ */
function loop(){
  if(!playing)return;
  frame=Math.min(frame+1,TOTAL);
  dispatch(frame);
  document.getElementById('pvBar').style.width=((frame/TOTAL)*100)+'%';
  var s=Math.floor(frame/60),m=Math.floor(s/60),sec=s%60;
  document.getElementById('pvTime').textContent=m+':'+(sec<10?'0':'')+sec;
  if(frame>=TOTAL){
    playing=false;
    document.getElementById('pvPlayBtn').innerHTML='&#9654;';
    var ov=document.getElementById('pvOverlay');ov.style.opacity='1';ov.style.pointerEvents='auto';
    return;
  }
  RAF=requestAnimationFrame(loop);
}

window.pvToggle=function(){
  if(!CV){CV=document.getElementById('pvCanvas');CX=CV.getContext('2d');}
  playing=!playing;
  if(playing){
    var ov=document.getElementById('pvOverlay');ov.style.opacity='0';ov.style.pointerEvents='none';
    document.getElementById('pvPlayBtn').innerHTML='&#9646;&#9646;';
    if(frame>=TOTAL)frame=0;
    RAF=requestAnimationFrame(loop);
  }else{
    document.getElementById('pvPlayBtn').innerHTML='&#9654;';
    cancelAnimationFrame(RAF);
  }
};
window.pvRestart=function(){
  if(!CV){CV=document.getElementById('pvCanvas');CX=CV.getContext('2d');}
  frame=0;cur.x=430;cur.y=260;cur.tx=430;cur.ty=260;playing=true;
  var ov=document.getElementById('pvOverlay');ov.style.opacity='0';ov.style.pointerEvents='none';
  document.getElementById('pvPlayBtn').innerHTML='&#9646;&#9646;';
  cancelAnimationFrame(RAF);RAF=requestAnimationFrame(loop);
};
window.pvJump=function(idx){
  if(!CV){CV=document.getElementById('pvCanvas');CX=CV.getContext('2d');}
  frame=CH[idx]||0;cur.x=430;cur.y=260;cur.tx=430;cur.ty=260;playing=true;
  var ov=document.getElementById('pvOverlay');ov.style.opacity='0';ov.style.pointerEvents='none';
  document.getElementById('pvPlayBtn').innerHTML='&#9646;&#9646;';
  cancelAnimationFrame(RAF);RAF=requestAnimationFrame(loop);
};
window.pvScrub=function(e,el){
  if(!CV){CV=document.getElementById('pvCanvas');CX=CV.getContext('2d');}
  var r=el.getBoundingClientRect();
  frame=Math.floor(((e.clientX-r.left)/r.width)*TOTAL);
  document.getElementById('pvBar').style.width=((frame/TOTAL)*100)+'%';
  if(!playing)dispatch(frame);
};
window.addEventListener('load',function(){
  CV=document.getElementById('pvCanvas');CX=CV.getContext('2d');
  cur.x=430;cur.y=260;cur.tx=430;cur.ty=260;
  dispatch(0);
});
})();
