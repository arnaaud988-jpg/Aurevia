import { useState } from 'react';
import { X, ChevronRight, ChevronDown, HelpCircle, Search, FolderOpen, Zap, CalendarCheck, CreditCard, Star, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

// ── Mockup building blocks ────────────────────────────────────────────────────

function MockupShell({ light = false, children }: { light?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden w-full"
      style={{ background: light ? '#F1F5F9' : '#07111f', border: `1px solid ${light ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}` }}>
      {/* Fake nav */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: light ? 'white' : '#0A1628', borderBottom: `1px solid ${light ? '#F1F5F9' : 'rgba(255,255,255,0.06)'}` }}>
        <div className="flex items-center gap-2">
          <div className="size-5 rounded" style={{ background: light ? '#0A1628' : 'rgba(255,255,255,0.15)' }} />
          <div className="h-2 w-12 rounded" style={{ background: light ? '#E2E8F0' : 'rgba(255,255,255,0.12)' }} />
        </div>
        <div className="flex gap-1.5">
          <Pill light={light} w={20} gold />
          <Pill light={light} w={16} />
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Pill({ light = false, w = 14, gold = false }: { light?: boolean; w?: number; gold?: boolean }) {
  return (
    <div className="h-5 rounded-full"
      style={{ width: `${w * 4}px`, background: gold ? 'rgba(212,175,55,0.35)' : light ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />
  );
}

function Bar({ light = false, w = '100%', gold = false, h = 2, className, style }: { light?: boolean; w?: string; gold?: boolean; h?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ height: `${h * 4}px`, width: w, borderRadius: '4px', background: gold ? 'rgba(212,175,55,0.5)' : light ? '#E2E8F0' : 'rgba(255,255,255,0.12)', ...style }} />
  );
}

// ── Screen mockups ────────────────────────────────────────────────────────────

function MkSearchHero() {
  return (
    <MockupShell>
      <div className="text-center py-2">
        <Bar w="60%" h={2} gold className="mx-auto mb-1.5" style={{ margin: '0 auto 6px' }} />
        <div style={{ height:'6px', width:'40%', background:'rgba(255,255,255,0.1)', borderRadius:'4px', margin:'0 auto 10px' }} />
        <div className="flex rounded-xl overflow-hidden" style={{ background:'white', height:'36px' }}>
          <div className="flex-1 flex items-center gap-2 px-3">
            <div className="size-4 rounded" style={{ background:'rgba(212,175,55,0.6)' }} />
            <div style={{ height:'6px', width:'50px', background:'#E2E8F0', borderRadius:'4px' }} />
          </div>
          <div style={{ width:'1px', background:'#E2E8F0', margin:'6px 0' }} />
          <div className="flex-1 flex items-center gap-2 px-3">
            <div className="size-4 rounded-full bg-gray-200" />
            <div style={{ height:'6px', width:'60px', background:'#E2E8F0', borderRadius:'4px' }} />
          </div>
          <div className="flex items-center px-4" style={{ background:'#0A1628' }}>
            <div style={{ height:'6px', width:'40px', background:'rgba(255,255,255,0.4)', borderRadius:'4px' }} />
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function MkServicePicker() {
  const items = ['Home Staging','Photographie','Inspection','Notaire','Évaluation','Nettoyage'];
  return (
    <MockupShell>
      <div className="flex rounded-xl overflow-hidden mb-2" style={{ background:'white', height:'32px' }}>
        <div className="flex-1 flex items-center gap-2 px-3">
          <div className="size-3 rounded" style={{ background:'rgba(212,175,55,0.6)' }} />
          <div style={{ height:'5px', width:'60px', background:'#E2E8F0', borderRadius:'3px' }} />
          <div className="ml-auto size-3 rounded-sm bg-gray-200" />
        </div>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background:'white', border:'1px solid #F1F5F9' }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: i < items.length-1 ? '1px solid #F8FAFC' : 'none' }}>
            <div className="size-3.5 rounded" style={{ background: i < 2 ? '#0A1628' : '#E2E8F0' }} />
            <div style={{ height:'5px', width:`${50+i*8}px`, background: i < 2 ? '#0A1628' : '#E2E8F0', borderRadius:'3px' }} />
            {i < 2 && <div className="ml-auto size-1.5 rounded-full" style={{ background:'#D4AF37' }} />}
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

function MkResults() {
  return (
    <MockupShell light>
      <div className="flex gap-2">
        {/* List */}
        <div className="flex-1 space-y-1.5">
          {[4.9, 4.7, 4.8].map((r, i) => (
            <div key={i} className="rounded-lg p-2 bg-white" style={{ border:'1px solid #E2E8F0' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="size-5 rounded-full" style={{ background:'#0A1628' }} />
                <div style={{ height:'5px', width:'70px', background:'#CBD5E1', borderRadius:'3px' }} />
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className="size-2 rounded-sm" style={{ background: s <= Math.floor(r) ? '#D4AF37' : '#E2E8F0' }} />
                ))}
                <span style={{ fontSize:'9px', color:'#64748B', marginLeft:'4px' }}>{r}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Map */}
        <div className="w-1/2 rounded-lg" style={{ background:'#CBD5E1', minHeight:'100px', position:'relative' }}>
          <div style={{ position:'absolute', top:'30%', left:'40%', width:'10px', height:'10px', borderRadius:'50%', background:'#D4AF37', boxShadow:'0 0 6px rgba(212,175,55,0.6)' }} />
          <div style={{ position:'absolute', top:'50%', left:'55%', width:'8px', height:'8px', borderRadius:'50%', background:'#0A1628' }} />
        </div>
      </div>
    </MockupShell>
  );
}

function MkDualRating() {
  return (
    <MockupShell light>
      <div className="rounded-lg bg-white p-2 mb-2" style={{ border:'1px solid #E2E8F0' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="size-6 rounded-full" style={{ background:'#0A1628' }} />
          <div style={{ height:'5px', width:'80px', background:'#CBD5E1', borderRadius:'3px' }} />
        </div>
        {/* Rating trigger */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(s => (
            <div key={s} className="size-2.5 rounded-sm" style={{ background: s < 5 ? '#D4AF37' : '#E2E8F0' }} />
          ))}
          <span style={{ fontSize:'9px', color:'#0A1628', fontWeight:'600', marginLeft:'3px' }}>4.8</span>
          <span style={{ fontSize:'8px', color:'#94A3B8' }}>(124)</span>
        </div>
      </div>
      {/* Tooltip */}
      <div className="rounded-xl p-2.5" style={{ background:'#0F1622', border:'1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ height:'4px', width:'80px', background:'rgba(255,255,255,0.2)', borderRadius:'4px', marginBottom:'6px' }} />
        <div className="flex items-center gap-1.5 mb-1">
          <div className="size-3.5 rounded-full bg-white flex items-center justify-center" style={{ fontSize:'7px', color:'#4285F4', fontWeight:'900' }}>G</div>
          <div style={{ height:'4px', width:'50px', background:'rgba(255,255,255,0.15)', borderRadius:'3px' }} />
          <div className="flex gap-0.5 ml-auto">
            {[1,2,3,4].map(s => <div key={s} className="size-1.5 rounded-sm" style={{ background:'#D4AF37' }} />)}
            <div className="size-1.5 rounded-sm" style={{ background:'rgba(212,175,55,0.3)' }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3.5 rounded-full flex items-center justify-center" style={{ background:'rgba(212,175,55,0.2)', border:'1px solid rgba(212,175,55,0.35)', fontSize:'7px', color:'#D4AF37', fontWeight:'900' }}>A</div>
          <div style={{ height:'4px', width:'55px', background:'rgba(212,175,55,0.3)', borderRadius:'3px' }} />
          <div className="flex gap-0.5 ml-auto">
            {[1,2,3,4,5].map(s => <div key={s} className="size-1.5 rounded-sm" style={{ background:'#D4AF37' }} />)}
          </div>
        </div>
        {['💰','🏆','⚡'].map((e,i) => (
          <div key={i} className="flex items-center gap-1 mt-1">
            <span style={{ fontSize:'8px' }}>{e}</span>
            <div style={{ flex:1, height:'2px', background:'rgba(255,255,255,0.07)', borderRadius:'2px' }}>
              <div style={{ height:'100%', width:`${75+i*8}%`, background:'#D4AF37', borderRadius:'2px' }} />
            </div>
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

function MkProviderActions() {
  return (
    <MockupShell light>
      <div className="rounded-lg bg-white p-2.5" style={{ border:'1px solid #E2E8F0' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="size-6 rounded-full" style={{ background:'#0A1628' }} />
          <div>
            <div style={{ height:'5px', width:'80px', background:'#CBD5E1', borderRadius:'3px', marginBottom:'3px' }} />
            <div style={{ height:'4px', width:'50px', background:'#E2E8F0', borderRadius:'3px' }} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <div className="grid gap-1" style={{ gridTemplateColumns:'1fr 1fr 1fr' }}>
            {['Copier','Appeler','Planifier'].map((l, i) => (
              <div key={i} className="flex items-center justify-center gap-1 rounded py-1.5"
                style={{ border: i === 2 ? '1px solid rgba(212,175,55,0.5)' : '1px solid #E2E8F0', background: i === 2 ? 'rgba(212,175,55,0.06)' : 'transparent' }}>
                <span style={{ fontSize:'8px', color: i === 2 ? '#B8960C' : '#64748B' }}>{l}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns:'1fr auto 1fr' }}>
            <div className="flex items-center justify-center gap-1 rounded py-1.5"
              style={{ border:'1px solid rgba(212,175,55,0.4)', background:'rgba(212,175,55,0.05)' }}>
              <span style={{ fontSize:'8px', color:'#B8960C' }}>Exporter Fiche</span>
            </div>
            <div className="flex items-center justify-center rounded" style={{ width:'26px', border:'1px solid rgba(212,175,55,0.4)', background:'rgba(212,175,55,0.05)' }}>
              <span style={{ fontSize:'8px', color:'#B8960C' }}>↗</span>
            </div>
            <div className="flex items-center justify-center gap-1 rounded py-1.5" style={{ background:'#0A1628' }}>
              <span style={{ fontSize:'8px', color:'white' }}>Concierge</span>
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function MkDossierDropdown() {
  return (
    <MockupShell>
      <div className="mb-2 flex items-center gap-1.5">
        <div style={{ height:'5px', width:'40px', background:'rgba(255,255,255,0.15)', borderRadius:'3px' }} />
        <div className="h-4 w-px" style={{ background:'rgba(255,255,255,0.1)' }} />
        <div className="rounded px-2 py-1 flex items-center gap-1" style={{ border:'1px solid rgba(212,175,55,0.3)', background:'rgba(212,175,55,0.08)' }}>
          <div className="size-2.5 rounded-sm" style={{ background:'#D4AF37' }} />
          <div style={{ height:'4px', width:'40px', background:'rgba(212,175,55,0.4)', borderRadius:'3px' }} />
        </div>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background:'rgba(8,16,32,0.97)', border:'1px solid rgba(255,255,255,0.08)' }}>
        {[
          { addr:'700, rue des Éclaircies', experts:4, color:'#34D399' },
          { addr:'1240, boul. des Écluses', experts:2, color:'#D4AF37' },
          { addr:'550, rue Saint-Laurent',  experts:1, color:'#60A5FA' },
        ].map((d, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div className="size-2 rounded-full shrink-0" style={{ background: d.color, boxShadow:`0 0 4px ${d.color}60` }} />
            <div className="flex-1 min-w-0">
              <div style={{ height:'4px', width:'90px', background:'rgba(255,255,255,0.35)', borderRadius:'3px', marginBottom:'4px' }} />
              <div className="flex gap-1">
                {['📷','🔍','📋','🏠'].slice(0,d.experts).map((e,ei) => (
                  <span key={ei} style={{ fontSize:'8px' }}>{e}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize:'8px', padding:'2px 6px', borderRadius:'20px', background:`${d.color}18`, color: d.color }}>
              {i === 0 ? 'ACTIF' : i === 1 ? 'EN COURS' : 'NOUVEAU'}
            </div>
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

function MkDossierDetail() {
  return (
    <MockupShell>
      <div style={{ height:'5px', width:'120px', background:'rgba(255,255,255,0.4)', borderRadius:'4px', marginBottom:'6px' }} />
      <div style={{ height:'4px', width:'80px', background:'rgba(255,255,255,0.15)', borderRadius:'3px', marginBottom:'10px' }} />
      <div className="grid gap-2" style={{ gridTemplateColumns:'1fr 1fr' }}>
        {[{e:'📋',c:'evaluation'},{e:'🔍',c:'inspection'},{e:'📷',c:'photo'},{e:'🏠',c:'staging'}].map((item, i) => (
          <div key={i} className="rounded-xl p-2" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ background:'rgba(212,175,55,0.15)', color:'#D4AF37', fontSize:'7px', fontWeight:'bold', padding:'2px 6px', borderRadius:'20px', display:'inline-block', marginBottom:'5px' }}>
              {item.e} {item.c.toUpperCase()}
            </div>
            <div style={{ height:'4px', width:'80px', background:'rgba(255,255,255,0.25)', borderRadius:'3px', marginBottom:'4px' }} />
            <div style={{ height:'3px', width:'50px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }} />
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

function MkFileManager() {
  return (
    <MockupShell>
      <div className="rounded-xl mb-2 flex flex-col items-center justify-center py-3"
        style={{ border:'2px dashed rgba(212,175,55,0.3)', background:'rgba(212,175,55,0.04)' }}>
        <div className="size-6 rounded-lg mb-1 flex items-center justify-center" style={{ background:'rgba(212,175,55,0.15)' }}>
          <div style={{ width:'10px', height:'8px', border:'2px solid rgba(212,175,55,0.7)', borderRadius:'2px' }} />
        </div>
        <div style={{ height:'4px', width:'80px', background:'rgba(212,175,55,0.3)', borderRadius:'3px', marginBottom:'3px' }} />
        <div style={{ height:'3px', width:'50px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }} />
      </div>
      {[{ emoji:'📸', w:80 }, { emoji:'📄', w:60 }, { emoji:'📐', w:50 }].map((s, i) => (
        <div key={i} className="rounded-lg px-2.5 py-2 mb-1 flex items-center gap-2" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize:'10px' }}>{s.emoji}</span>
          <div style={{ flex:1, height:'4px', background:'rgba(255,255,255,0.15)', borderRadius:'3px' }} />
          <div style={{ height:'4px', width:`${s.w}px`, background:'rgba(255,255,255,0.25)', borderRadius:'3px' }} />
          <div style={{ height:'4px', width:'20px', background:'rgba(212,175,55,0.3)', borderRadius:'3px' }} />
        </div>
      ))}
    </MockupShell>
  );
}

function MkUrgentModal() {
  return (
    <MockupShell>
      <div className="rounded-xl overflow-hidden" style={{ background:'#0A1220', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ height:'3px', background:'linear-gradient(90deg,#B91C1C,#EF4444,#F97316)' }} />
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="size-5 rounded-lg flex items-center justify-center" style={{ background:'rgba(239,68,68,0.15)' }}>
              <Zap className="size-3 fill-red-400 text-red-400" />
            </div>
            <div style={{ height:'5px', width:'70px', background:'rgba(255,255,255,0.4)', borderRadius:'3px' }} />
          </div>
          {/* Mode toggle */}
          <div className="flex gap-1 mb-2 p-1 rounded-lg" style={{ background:'rgba(255,255,255,0.05)' }}>
            <div className="flex-1 rounded py-1 flex items-center justify-center gap-1" style={{ background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)' }}>
              <Search className="size-2.5" style={{ color:'#D4AF37' }} />
              <span style={{ fontSize:'7px', color:'#D4AF37' }}>Disponibles 72h</span>
            </div>
            <div className="flex-1 rounded py-1 flex items-center justify-center gap-1">
              <span style={{ fontSize:'7px', color:'rgba(255,255,255,0.35)' }}>Notifier</span>
            </div>
          </div>
          {/* Provider results */}
          {[{r:'4.9', slot:'Auj. 16:00', c:'#34D399'},{r:'4.7', slot:'Dem. 9:00', c:'#FBBF24'}].map((p,i) => (
            <div key={i} className="rounded-lg px-2.5 py-2 mb-1 flex items-center gap-2" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:`2px solid ${p.c}` }}>
              <div style={{ flex:1, height:'4px', background:'rgba(255,255,255,0.25)', borderRadius:'3px' }} />
              <span style={{ fontSize:'7px', padding:'1px 5px', borderRadius:'20px', background:`${p.c}18`, color:p.c }}>{p.slot}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
}

function MkCalendar() {
  const days = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
  const avail = [3,5,9,11,12,15,17,18,22,23,24];
  return (
    <MockupShell>
      <div className="flex gap-2">
        {/* Calendar */}
        <div style={{ flex:1 }}>
          <div className="flex items-center justify-between mb-2">
            <div style={{ height:'4px', width:'30px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }} />
            <div style={{ height:'5px', width:'70px', background:'rgba(255,255,255,0.3)', borderRadius:'3px' }} />
            <div style={{ height:'4px', width:'30px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }} />
          </div>
          <div className="grid mb-1" style={{ gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
            {days.map(d => <div key={d} style={{ fontSize:'6px', textAlign:'center', color:'rgba(255,255,255,0.2)', fontWeight:'bold' }}>{d}</div>)}
          </div>
          <div className="grid" style={{ gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
            {Array.from({length:30},(_,i) => i+1).map(d => (
              <div key={d} className="flex items-center justify-center rounded"
                style={{ height:'14px', fontSize:'6px', fontWeight:'500',
                  background: d === 9 ? '#D4AF37' : avail.includes(d) ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color: d === 9 ? '#07111f' : avail.includes(d) ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                }}>
                {d}
              </div>
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div style={{ width:'90px' }}>
          <div className="rounded-lg p-2 mb-1.5" style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.15)' }}>
            <div style={{ fontSize:'7px', color:'rgba(212,175,55,0.6)', marginBottom:'3px' }}>TARIF HORAIRE</div>
            <div style={{ fontSize:'13px', color:'white', fontWeight:'300' }}>125 <span style={{ fontSize:'8px', color:'rgba(255,255,255,0.35)' }}>$/h</span></div>
          </div>
          <div style={{ fontSize:'7px', color:'rgba(255,255,255,0.25)', marginBottom:'4px' }}>CRÉNEAUX</div>
          {['10:00','13:30','15:00'].map((s,i) => (
            <div key={i} className="rounded px-2 py-1 mb-1 flex items-center gap-1"
              style={{ background: i===0 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)', border:`1px solid ${i===0?'rgba(212,175,55,0.4)':'rgba(255,255,255,0.07)'}` }}>
              <span style={{ fontSize:'7px', color: i===0 ? '#D4AF37' : 'rgba(255,255,255,0.45)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
}

function MkCheckout() {
  return (
    <MockupShell light>
      <div className="flex gap-2">
        {/* Table */}
        <div style={{ flex:1 }}>
          {[{e:'📷',s:'Photographie',t:'375 $'},{e:'🏠',s:'Staging',t:'650 $'},{e:'🔍',s:'Inspection',t:'220 $'}].map((r,i) => (
            <div key={i} className="flex items-center gap-1.5 py-1.5" style={{ borderBottom:'1px solid #F1F5F9' }}>
              <span style={{ fontSize:'10px' }}>{r.e}</span>
              <div style={{ flex:1, height:'4px', background:'#E2E8F0', borderRadius:'3px' }} />
              <div style={{ height:'4px', width:'30px', background:'#CBD5E1', borderRadius:'3px' }} />
              <span style={{ fontSize:'8px', fontWeight:'600', color:'#0A1628' }}>{r.t}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1.5">
            <div style={{ height:'5px', width:'50px', background:'#CBD5E1', borderRadius:'3px' }} />
            <span style={{ fontSize:'9px', fontWeight:'700', color:'#0A1628' }}>1 477 $</span>
          </div>
        </div>
        {/* Payment sidebar */}
        <div style={{ width:'90px' }}>
          <div className="rounded-lg p-2 bg-white" style={{ border:'1px solid #E2E8F0' }}>
            <div style={{ fontSize:'7px', color:'#94A3B8', marginBottom:'3px' }}>TOTAL</div>
            <div style={{ fontSize:'13px', color:'#0A1628', fontWeight:'300', marginBottom:'6px' }}>1 477 $</div>
            <div className="rounded px-2 py-1 mb-2 flex items-center gap-1" style={{ background:'#F8FAFC', border:'1px solid #E2E8F0' }}>
              <CreditCard style={{ width:'10px', height:'10px', color:'#64748B' }} />
              <span style={{ fontSize:'7px', color:'#64748B' }}>•••• 4829</span>
            </div>
            <div className="rounded py-1.5 flex items-center justify-center" style={{ background:'#0A1628' }}>
              <span style={{ fontSize:'7px', color:'white', fontWeight:'600' }}>Payer</span>
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function MkClientNotify() {
  return (
    <MockupShell>
      <div className="rounded-xl p-3" style={{ background:'rgba(10,16,32,0.98)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="size-5 rounded-lg" style={{ background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.22)' }} />
          <div>
            <div style={{ height:'4px', width:'70px', background:'rgba(255,255,255,0.4)', borderRadius:'3px', marginBottom:'3px' }} />
            <div style={{ height:'3px', width:'50px', background:'rgba(255,255,255,0.1)', borderRadius:'3px' }} />
          </div>
        </div>
        <div className="rounded-lg p-1.5 mb-2" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ height:'4px', width:'100px', background:'rgba(255,255,255,0.2)', borderRadius:'3px' }} />
        </div>
        {/* Channel toggle */}
        <div className="flex gap-1 p-0.5 rounded-lg mb-2" style={{ background:'rgba(255,255,255,0.04)' }}>
          <div className="flex-1 rounded flex items-center justify-center gap-1 py-1" style={{ background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)' }}>
            <span style={{ fontSize:'7px', color:'rgba(255,255,255,0.7)' }}>📱 SMS</span>
          </div>
          <div className="flex-1 flex items-center justify-center py-1">
            <span style={{ fontSize:'7px', color:'rgba(255,255,255,0.3)' }}>✉️ Email</span>
          </div>
        </div>
        {/* Phone input */}
        <div className="flex gap-1.5">
          <div className="rounded-lg px-2 py-1.5 flex items-center gap-1" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', minWidth:'65px' }}>
            <span style={{ fontSize:'8px', fontWeight:'700', color:'rgba(255,255,255,0.7)' }}>CA +1</span>
            <div style={{ width:'6px', height:'3px', border:'1.5px solid rgba(255,255,255,0.25)', borderTop:'none', borderRadius:'0 0 2px 2px', marginLeft:'2px' }} />
          </div>
          <div className="flex-1 rounded-lg px-2 py-1.5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.3)' }}>
            <div style={{ height:'4px', width:'70px', background:'rgba(255,255,255,0.15)', borderRadius:'3px' }} />
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

// ── Tutorial content ─────────────────────────────────────────────────────────

interface TutStep { id: string; title: string; desc: string; mockup: () => JSX.Element }
interface TutSection { id: string; icon: React.ReactNode; title: string; steps: TutStep[] }

function buildSections(lang: string): TutSection[] {
  const fr = lang === 'fr';
  return [
    {
      id: 'start',
      icon: <HelpCircle className="size-4" />,
      title: fr ? 'Démarrage rapide' : 'Quick Start',
      steps: [
        {
          id: 's1', mockup: MkSearchHero,
          title: fr ? "Bienvenue sur Aurevia" : "Welcome to Aurevia",
          desc: fr
            ? "Aurevia est une plateforme de concierge immobilier B2B conçue pour les courtiers. Elle vous permet de trouver, réserver et gérer des prestataires locaux vérifiés en quelques clics. La page d'accueil est votre point de départ : entrez une adresse et choisissez un service pour lancer votre première recherche."
            : "Aurevia is a B2B real estate concierge platform designed for brokers. It lets you find, book and manage verified local providers in just a few clicks. The home page is your starting point — enter an address and choose a service to launch your first search.",
        },
        {
          id: 's2', mockup: MkDossierDropdown,
          title: fr ? "La barre de navigation" : "The navigation bar",
          desc: fr
            ? "En haut à droite vous trouvez les accès principaux :\n\n• ⚡ Urgent — demande urgente à des prestataires proches\n• 📁 Mes Dossiers — gérer vos dossiers de propriété actifs (badge doré = nombre actif)\n• ❤️ Mes Favoris — prestataires sauvegardés\n• ⚙️ Version (bas de page) — basculer entre mode Stable et Alpha\n• ? (bas gauche) — ouvrir ce guide"
            : "In the top right you'll find the main access points:\n\n• ⚡ Urgent — urgent request to nearby providers\n• 📁 My Files — manage your active property files (gold badge = active count)\n• ❤️ My Favorites — saved providers\n• ⚙️ Version (page bottom) — switch between Stable and Alpha mode\n• ? (bottom left) — open this guide",
        },
      ],
    },
    {
      id: 'search',
      icon: <Search className="size-4" />,
      title: fr ? 'Recherche d\'experts' : 'Finding Experts',
      steps: [
        {
          id: 'se1', mockup: MkServicePicker,
          title: fr ? "Choisir un ou plusieurs services" : "Choose one or more services",
          desc: fr
            ? "Cliquez sur le champ 'Service' pour ouvrir le sélecteur. Vous pouvez cocher plusieurs services simultanément (ex: Photographie + Inspection). Un badge dorée s'affiche à côté des services sélectionnés. Cliquez sur 'Tous les services' pour tout sélectionner en un clic. Confirmez avec le bouton 'Confirmer'."
            : "Click the 'Service' field to open the selector. You can check multiple services at once (e.g. Photography + Inspection). A gold dot appears next to selected services. Click 'All services' to select everything at once. Confirm with the 'Confirm' button.",
        },
        {
          id: 'se2', mockup: MkSearchHero,
          title: fr ? "Saisir l'adresse de la propriété" : "Enter the property address",
          desc: fr
            ? "Tapez l'adresse de la propriété dans le champ 'Adresse'. Une liste d'autocomplétion OpenStreetMap apparaît après 4 caractères. Sélectionnez une suggestion pour valider l'adresse précisément. La plateforme géocode ensuite l'adresse pour centrer la carte sur votre propriété et calculer les distances des prestataires."
            : "Type the property address in the 'Address' field. An OpenStreetMap autocomplete list appears after 4 characters. Select a suggestion to precisely validate the address. The platform then geocodes the address to center the map on your property and calculate provider distances.",
        },
        {
          id: 'se3', mockup: MkResults,
          title: fr ? "Comprendre les résultats" : "Understanding results",
          desc: fr
            ? "Les résultats s'affichent en vue divisée : la liste à gauche, la carte interactive à droite. Chaque carte prestataire affiche : nom, note globale (survol pour le détail), distance, adresse et actions rapides. Les marqueurs sur la carte correspondent aux prestataires de la liste."
            : "Results appear in split view: the list on the left, the interactive map on the right. Each provider card shows: name, global rating (hover for detail), distance, address and quick actions. Map markers correspond to list providers.",
        },
        {
          id: 'se4', mockup: MkResults,
          title: fr ? "Filtrer et trier les résultats" : "Filter and sort results",
          desc: fr
            ? "Utilisez la barre de filtres pour affiner :\n\n• Distance (km) — rayon de recherche depuis la propriété\n• Tri — meilleure note, plus proche, plus d'avis\n• ⚡ Disponible rapidement — en mode Alpha, filtre par disponibilité dans les 4 prochains jours; en mode Stable, filtre par note ≥ 4.6\n• Chips de catégories — filtrer par type de service\n• Réinitialiser — effacer tous les filtres"
            : "Use the filter bar to refine:\n\n• Distance (km) — search radius from the property\n• Sort — best rating, nearest, most reviews\n• ⚡ Available quickly — in Alpha mode, filters by availability in the next 4 days; in Stable mode, filters by rating ≥ 4.6\n• Category chips — filter by service type\n• Reset — clear all filters",
        },
      ],
    },
    {
      id: 'cards',
      icon: <Star className="size-4" />,
      title: fr ? 'Fiches prestataires' : 'Provider Cards',
      steps: [
        {
          id: 'c1', mockup: MkDualRating,
          title: fr ? "La note duale Aurevia / Google" : "The dual Aurevia / Google rating",
          desc: fr
            ? "Survolez la note ★ sur une fiche pour afficher l'info-bulle de réputation. Deux sources sont présentées :\n\n• Note Google — avis publics du grand public (source Nominatim/OpenStreetMap)\n• Note Courtiers Aurevia — note exclusive basée uniquement sur le réseau de courtiers, avec 3 critères détaillés : 💰 Prix, 🏆 Qualité, ⚡ Rapidité\n\nEn mode Alpha, le dernier avis d'un courtier du réseau s'affiche également en bas de l'info-bulle."
            : "Hover over the ★ rating on a card to display the reputation tooltip. Two sources are shown:\n\n• Google rating — public reviews from the general public\n• Aurevia Broker rating — exclusive rating based only on the broker network, with 3 detailed criteria: 💰 Price, 🏆 Quality, ⚡ Speed\n\nIn Alpha mode, the latest broker review from the network also appears at the bottom of the tooltip.",
        },
        {
          id: 'c2', mockup: MkProviderActions,
          title: fr ? "Actions rapides sur la fiche" : "Quick card actions",
          desc: fr
            ? "Chaque fiche propose 5 actions :\n\n• Copier — copie nom, téléphone et adresse dans le presse-papier\n• Appeler — ouvre l'application téléphonique\n• Planifier — en mode Alpha uniquement : ouvre le calendrier de réservation\n• 📄 Exporter Fiche — ajoute ce prestataire à l'un de vos dossiers actifs\n• [↗] Partager — notifie votre client par SMS ou email avec un message pré-rempli\n• Concierge — ouvre l'assistant IA Aurevia pour ce prestataire"
            : "Each card offers 5 actions:\n\n• Copy — copies name, phone and address to clipboard\n• Call — opens the phone app\n• Schedule — Alpha mode only: opens the booking calendar\n• 📄 Export Sheet — adds this provider to one of your active files\n• [↗] Share — notifies your client by SMS or email with a pre-filled message\n• Concierge — opens the Aurevia AI assistant for this provider",
        },
        {
          id: 'c3', mockup: MkClientNotify,
          title: fr ? "Notifier le client (SMS ou Email)" : "Notify the client (SMS or Email)",
          desc: fr
            ? "Cliquez sur l'icône de partage [↗] à côté du bouton 'Exporter Fiche'. Une fenêtre s'ouvre avec un message de confirmation pré-rédigé (nom du prestataire, service, téléphone).\n\n• Onglet SMS — sélectionnez le pays (CA +1, FR +33, etc.) et entrez le numéro du client. Le bouton 'Envoyer par SMS' ouvre votre application SMS avec le message pré-rempli.\n• Onglet Email — entrez l'email du client. 'Envoyer via Aurevia' simule l'envoi par la plateforme. 'Application externe' ouvre Outlook, Gmail, etc."
            : "Click the share icon [↗] next to the 'Export Sheet' button. A window opens with a pre-written confirmation message (provider name, service, phone).\n\n• SMS tab — select the country (CA +1, FR +33, etc.) and enter the client's number. 'Send SMS' opens your SMS app with the pre-filled message.\n• Email tab — enter the client's email. 'Send via Aurevia' simulates platform sending. 'External app' opens Outlook, Gmail, etc.",
        },
      ],
    },
    {
      id: 'dossiers',
      icon: <FolderOpen className="size-4" />,
      title: fr ? 'Mes Dossiers' : 'My Files',
      steps: [
        {
          id: 'd1', mockup: MkDossierDropdown,
          title: fr ? "Voir les dossiers actifs" : "View active files",
          desc: fr
            ? "Cliquez sur 'Mes Dossiers' dans la barre de navigation. Un panneau déroulant affiche vos dossiers de propriété avec pour chacun :\n\n• Un point coloré indiquant le statut (vert = Actif, doré = En cours, bleu = Nouveau)\n• L'adresse et la ville\n• Les emojis des services engagés (📷 🔍 📋 🏠…)\n• Le badge de statut\n• Un bouton 'Accéder' au survol pour ouvrir le dossier complet"
            : "Click 'My Files' in the navigation bar. A dropdown panel shows your property files with for each:\n\n• A colored dot indicating status (green = Active, gold = In progress, blue = New)\n• Address and city\n• Service emojis of engaged providers (📷 🔍 📋 🏠…)\n• Status badge\n• An 'Open' button on hover to access the full file",
        },
        {
          id: 'd2', mockup: MkDossierDetail,
          title: fr ? "Gérer un dossier" : "Manage a file",
          desc: fr
            ? "Cliquez sur 'Accéder' pour ouvrir le détail d'un dossier. Vous y trouvez :\n\n• En-tête — adresse, statut animé, date de création et nombre d'experts\n• 3 boutons d'action — Exporter Excel, Clôturer/Réouvrir, Supprimer\n• Grille des experts — fiches des prestataires Aurevia associés (2 colonnes)\n• Bouton Paiement — procéder à la facturation groupée\n\nCliquer 'Clôturer' passe le dossier en mode ARCHIVÉ (lecture seule). 'Réouvrir' annule cette action."
            : "Click 'Open' to access a file's detail. You'll find:\n\n• Header — address, animated status, creation date and expert count\n• 3 action buttons — Export Excel, Close/Reopen, Delete\n• Expert grid — Aurevia provider cards (2 columns)\n• Payment button — proceed to grouped billing\n\nClicking 'Close' sets the file to ARCHIVED (read-only). 'Reopen' reverses this.",
        },
        {
          id: 'd3', mockup: MkFileManager,
          title: fr ? "Gérer les documents" : "Manage documents",
          desc: fr
            ? "Faites défiler vers le bas dans un dossier pour accéder à la section Documents. Elle comprend :\n\n• Zone de glisser-déposer — glissez des fichiers depuis votre ordinateur ou cliquez pour parcourir\n• 3 sections organisées — 📸 Photos de la propriété, 📄 Rapports PDF, 📐 Plans & Arpentage\n• Chaque fichier — nom, taille, date, bouton Télécharger et Supprimer (au survol)\n• Bouton Partager — copie un lien de partage du dossier\n• Bouton 'Tout télécharger' par section"
            : "Scroll down in a file to access the Documents section. It includes:\n\n• Drag & drop zone — drag files from your computer or click to browse\n• 3 organized sections — 📸 Property Photos, 📄 PDF Reports, 📐 Plans & Surveys\n• Each file — name, size, date, Download and Delete button (on hover)\n• Share button — copies a sharing link for the file\n• 'Download all' button per section",
        },
      ],
    },
    {
      id: 'urgent',
      icon: <Zap className="size-4" />,
      title: fr ? 'Demande Urgente' : 'Urgent Request',
      steps: [
        {
          id: 'u1', mockup: MkUrgentModal,
          title: fr ? "Ouvrir la demande urgente" : "Open urgent request",
          desc: fr
            ? "Le bouton ⚡ Urgent se trouve dans la barre de navigation principale (entre 'Plateforme B2B' et 'Mes Dossiers'). Il est toujours accessible depuis l'écran de recherche.\n\nLa fenêtre qui s'ouvre propose deux modes :\n\n• 🔍 Disponibles 72h (défaut) — trouve les prestataires disponibles dans les 72 prochaines heures\n• 🔔 Notifier — envoie une alerte en temps réel à tous les prestataires à proximité"
            : "The ⚡ Urgent button is in the main navigation bar (between 'B2B Platform' and 'My Files'). Always accessible from the search screen.\n\nThe window that opens offers two modes:\n\n• 🔍 Available 72h (default) — finds providers available in the next 72 hours\n• 🔔 Notify — sends a real-time alert to all nearby providers",
        },
        {
          id: 'u2', mockup: MkUrgentModal,
          title: fr ? "Mode 72h : voir les disponibilités" : "72h mode: view availability",
          desc: fr
            ? "Dans le mode '🔍 Disponibles 72h' :\n\n1. Sélectionnez le service requis (6 options)\n2. Entrez l'adresse de la propriété (champ optionnel)\n3. Choisissez le rayon de recherche (5 / 10 / 25 / 50 km)\n4. Cliquez 'Rechercher les disponibilités'\n\nLes résultats affichent chaque prestataire avec sa note duale (au survol), sa distance, et ses 3 prochains créneaux colorés :\n• 🟢 Aujourd'hui  • 🟡 Demain  • ⚫ Dans 2 jours\n\nCliquez 'Planifier' pour ouvrir directement le calendrier de réservation."
            : "In '🔍 Available 72h' mode:\n\n1. Select the required service (6 options)\n2. Enter the property address (optional)\n3. Choose the search radius (5 / 10 / 25 / 50 km)\n4. Click 'Search availability'\n\nResults show each provider with their dual rating (on hover), distance, and 3 next available slots colored:\n• 🟢 Today  • 🟡 Tomorrow  • ⚫ In 2 days\n\nClick 'Schedule' to open the booking calendar directly.",
        },
        {
          id: 'u3', mockup: MkUrgentModal,
          title: fr ? "Mode Notifier : alerte en temps réel" : "Notify mode: real-time alert",
          desc: fr
            ? "Dans le mode '🔔 Notifier' :\n\n1. Sélectionnez le service requis\n2. Entrez l'adresse (optionnel)\n3. Choisissez le rayon de notification\n4. Cliquez 'Envoyer la demande urgente'\n\nLa plateforme notifie instantanément tous les prestataires du service choisi dans le rayon défini. Un écran de confirmation s'affiche avec :\n• Les noms des prestataires notifiés (apparaissent un par un)\n• Un décompte du temps de réponse attendu\n• Un bouton 'Annuler la demande' si besoin"
            : "In '🔔 Notify' mode:\n\n1. Select the required service\n2. Enter the address (optional)\n3. Choose the notification radius\n4. Click 'Send urgent request'\n\nThe platform instantly notifies all providers of the chosen service within the set radius. A confirmation screen appears with:\n• Names of notified providers (appearing one by one)\n• A countdown for expected response time\n• A 'Cancel request' button if needed",
        },
      ],
    },
    {
      id: 'booking',
      icon: <CalendarCheck className="size-4" />,
      title: fr ? 'Réservation (Alpha)' : 'Booking (Alpha)',
      steps: [
        {
          id: 'b1', mockup: MkCalendar,
          title: fr ? "Planifier une réservation" : "Schedule a booking",
          desc: fr
            ? "Le bouton 'Planifier' sur les fiches prestataires est activé uniquement en mode Alpha (⚙️ bas de page → Alpha). Au clic, la fenêtre de réservation s'ouvre avec :\n\n• Bascule Heures / Jours — le mode est pré-sélectionné selon le service (ex: Inspection = Jours, Photo = Heures)\n• Tarif dynamique — TARIF HORAIRE ($/h) ou TARIF JOURNALIER ($/j) selon le mode\n• Calendrier — jours disponibles marqués d'un point vert, week-ends désactivés"
            : "The 'Schedule' button on provider cards is only active in Alpha mode (⚙️ page bottom → Alpha). On click, the booking window opens with:\n\n• Hours / Days toggle — mode is pre-selected based on the service (e.g. Inspection = Days, Photo = Hours)\n• Dynamic rate — HOURLY RATE ($/hr) or DAILY RATE ($/day) depending on mode\n• Calendar — available days marked with a green dot, weekends disabled",
        },
        {
          id: 'b2', mockup: MkCalendar,
          title: fr ? "Calendrier et créneaux" : "Calendar and time slots",
          desc: fr
            ? "Sélection selon le mode :\n\n• Mode Heures — cliquez sur un jour disponible (vert) pour voir les créneaux horaires. Sélectionnez un créneau, choisissez la durée (1h à 8h) avec le sélecteur [-] X heures [+]. Le total se met à jour en temps réel.\n\n• Mode Jours — cliquez sur une date de début. La plage de jours est colorée automatiquement selon la durée (-/+ jours). La section droite affiche 'DATE DE DÉBUT' avec les dates calculées.\n\nConfirmez avec 'Confirmer la réservation' (bouton doré activé quand tout est sélectionné)."
            : "Selection depending on mode:\n\n• Hours mode — click an available day (green) to see time slots. Select a slot, choose duration (1h to 8h) with the [-] X hours [+] selector. Total updates in real time.\n\n• Days mode — click a start date. The day range is colored automatically based on duration (-/+ days). The right section shows 'START DATE' with calculated dates.\n\nConfirm with 'Confirm booking' (gold button activates when everything is selected).",
        },
        {
          id: 'b3', mockup: MkCalendar,
          title: fr ? "Bouton d'intervention urgente" : "Urgent intervention button",
          desc: fr
            ? "Sous le bouton de confirmation, un bouton secondaire ⚡ 'Demander une intervention urgente (hors délais)' est toujours disponible.\n\nUtilisez-le si :\n• Aucun créneau ne convient dans les délais souhaités\n• Le délai est inférieur à 24h\n• Vous avez besoin d'un contact direct immédiat\n\nAu clic, une demande est envoyée directement au prestataire avec notification de priorité. Un message de confirmation apparaît en bas de l'écran."
            : "Below the confirmation button, a secondary ⚡ 'Request urgent intervention (out-of-hours)' button is always available.\n\nUse it if:\n• No slot fits within the desired timeframe\n• The deadline is less than 24h\n• You need immediate direct contact\n\nOn click, a request is sent directly to the provider with priority notification. A confirmation message appears at the bottom of the screen.",
        },
      ],
    },
    {
      id: 'billing',
      icon: <CreditCard className="size-4" />,
      title: fr ? 'Facturation' : 'Billing',
      steps: [
        {
          id: 'bi1', mockup: MkCheckout,
          title: fr ? "Récapitulatif de commande" : "Order summary",
          desc: fr
            ? "L'écran de facturation est accessible depuis :\n• Le bouton 'Procéder au paiement' en bas d'un dossier\n• Le bouton de facturation en bas de 'Mes Favoris' (quand des prestataires sont sauvegardés)\n\nLe tableau liste tous les prestataires sélectionnés avec service, durée, tarif unitaire et total. Cliquez 'Retirer' sur une ligne pour l'exclure de la commande. Les montants (sous-total, TPS 5%, TVQ 9,975%, total) se recalculent automatiquement."
            : "The billing screen is accessible from:\n• The 'Proceed to payment' button at the bottom of a file\n• The billing button at the bottom of 'My Favorites' (when providers are saved)\n\nThe table lists all selected providers with service, duration, unit rate and total. Click 'Remove' on a line to exclude it. Amounts (subtotal, GST 5%, QST 9.975%, total) recalculate automatically.",
        },
        {
          id: 'bi2', mockup: MkCheckout,
          title: fr ? "Paiement sécurisé" : "Secure payment",
          desc: fr
            ? "Le panneau de paiement (à droite) affiche :\n• Le montant total TTC en grand\n• La carte enregistrée (•••• 4829) — cliquez pour changer\n• Le bouton 'Payer X $' — active le processus de paiement sécurisé Stripe\n• Les badges de sécurité SSL · PCI DSS · Stripe\n\nAprès le paiement :\n• Un écran de confirmation vert s'affiche avec une animation de succès\n• Une facture unifiée couvrant tous les prestataires est générée et envoyée par email\n• Toutes les réservations sont automatiquement confirmées"
            : "The payment panel (right) shows:\n• Total amount incl. tax in large format\n• Saved card (•••• 4829) — click to change\n• 'Pay X $' button — activates the secure Stripe payment process\n• Security badges SSL · PCI DSS · Stripe\n\nAfter payment:\n• A green confirmation screen appears with a success animation\n• A unified invoice covering all providers is generated and emailed\n• All bookings are automatically confirmed",
        },
      ],
    },
  ];
}

// ── FAB ───────────────────────────────────────────────────────────────────────

export function TutorialFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.5 }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 left-6 z-40 size-11 rounded-full flex items-center justify-center"
      style={{
        background:   'rgba(10,22,40,0.92)',
        border:       '1px solid rgba(255,255,255,0.18)',
        boxShadow:    '0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        color:        'rgba(255,255,255,0.65)',
      }}
      title="Guide d'utilisation"
    >
      <HelpCircle className="size-5" />
    </motion.button>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function TutorialPanel({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();
  const sections = buildSections(lang);

  const [activeSec, setActiveSec]   = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded]     = useState<Record<number,boolean>>({ 0: true });

  const section = sections[activeSec];
  const step    = section.steps[activeStep];
  const Mockup  = step.mockup;

  const totalSteps  = sections.reduce((a, s) => a + s.steps.length, 0);
  const stepsBeforeActive = sections.slice(0, activeSec).reduce((a, s) => a + s.steps.length, 0);
  const globalProgress = ((stepsBeforeActive + activeStep + 1) / totalSteps) * 100;

  const goNext = () => {
    if (activeStep < section.steps.length - 1) {
      setActiveStep(s => s + 1);
    } else if (activeSec < sections.length - 1) {
      const next = activeSec + 1;
      setActiveSec(next);
      setActiveStep(0);
      setExpanded(p => ({ ...p, [next]: true }));
    }
  };

  const goPrev = () => {
    if (activeStep > 0) {
      setActiveStep(s => s - 1);
    } else if (activeSec > 0) {
      const prev = activeSec - 1;
      setActiveSec(prev);
      setActiveStep(sections[prev].steps.length - 1);
      setExpanded(p => ({ ...p, [prev]: true }));
    }
  };

  const isFirst = activeSec === 0 && activeStep === 0;
  const isLast  = activeSec === sections.length - 1 && activeStep === section.steps.length - 1;

  const fr = lang === 'fr';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 flex items-center justify-center z-[1500] p-4"
      style={{ background: 'rgba(3,8,18,0.82)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col w-full rounded-3xl overflow-hidden"
        style={{ maxWidth:'980px', maxHeight:'88vh', background:'#0A1220', border:'1px solid rgba(255,255,255,0.09)', boxShadow:'0 48px 96px rgba(0,0,0,0.78)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-4 shrink-0"
          style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)' }}>
              <HelpCircle className="size-4" style={{ color:'#D4AF37' }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{fr ? "Guide d'utilisation Aurevia" : 'Aurevia User Guide'}</p>
              <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>
                {section.title} — {step.title}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                <motion.div animate={{ width:`${globalProgress}%` }} transition={{ duration:0.3 }}
                  className="h-full rounded-full" style={{ background:'linear-gradient(90deg,#D4AF37,#F0CD6A)' }} />
              </div>
              <span className="text-[10px] tabular-nums" style={{ color:'rgba(255,255,255,0.3)' }}>
                {stepsBeforeActive + activeStep + 1}/{totalSteps}
              </span>
            </div>
            <button onClick={onClose}
              className="transition-colors" style={{ color:'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.25)')}>
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar TOC */}
          <div className="w-56 shrink-0 overflow-y-auto py-4"
            style={{ background:'rgba(5,10,20,0.7)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
            {sections.map((sec, si) => {
              const isActiveSec = si === activeSec;
              const isOpen = expanded[si];
              return (
                <div key={sec.id}>
                  <button
                    onClick={() => {
                      setActiveSec(si);
                      setActiveStep(0);
                      setExpanded(p => ({ ...p, [si]: !p[si] }));
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                    style={{ color: isActiveSec ? '#D4AF37' : 'rgba(255,255,255,0.45)' }}>
                    <span style={{ color: isActiveSec ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>{sec.icon}</span>
                    <span className="text-xs font-semibold flex-1 leading-tight">{sec.title}</span>
                    <ChevronDown className={`size-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color:'rgba(255,255,255,0.2)' }} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}>
                        {sec.steps.map((st, sti) => {
                          const isActiveStep = isActiveSec && sti === activeStep;
                          return (
                            <button
                              key={st.id}
                              onClick={() => { setActiveSec(si); setActiveStep(sti); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-left transition-all"
                              style={{
                                paddingLeft:'36px',
                                background: isActiveStep ? 'rgba(212,175,55,0.07)' : 'transparent',
                                borderLeft: isActiveStep ? '2px solid #D4AF37' : '2px solid transparent',
                              }}>
                              <span className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                                style={{
                                  background: isActiveStep ? '#D4AF37' : 'rgba(255,255,255,0.07)',
                                  color: isActiveStep ? '#07111f' : 'rgba(255,255,255,0.3)',
                                }}>
                                {sti + 1}
                              </span>
                              <span className="text-[11px] leading-snug"
                                style={{ color: isActiveStep ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}>
                                {st.title.length > 28 ? st.title.slice(0, 28) + '…' : st.title}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeSec}-${activeStep}`}
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                transition={{ duration:0.22, ease:'easeOut' }}
                className="flex-1 overflow-y-auto p-8"
              >
                <div className="max-w-2xl">
                  {/* Section badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style={{ background:'rgba(212,175,55,0.1)', color:'#D4AF37', border:'1px solid rgba(212,175,55,0.2)' }}>
                      {section.icon}
                      {section.title}
                    </span>
                    <span className="text-[10px]" style={{ color:'rgba(255,255,255,0.25)' }}>
                      Étape {activeStep + 1} sur {section.steps.length}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-white text-xl font-light mb-3 leading-snug" style={{ letterSpacing:'-0.01em' }}>
                    {step.title}
                  </h2>

                  {/* Mockup illustration */}
                  <div className="mb-6 max-w-sm">
                    <Mockup />
                  </div>

                  {/* Description */}
                  <div className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color:'rgba(255,255,255,0.65)' }}>
                    {step.desc}
                  </div>

                  {/* Step dots */}
                  {section.steps.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-8">
                      {section.steps.map((_, i) => (
                        <button key={i} onClick={() => setActiveStep(i)}
                          className="rounded-full transition-all"
                          style={{
                            width: i === activeStep ? '20px' : '6px',
                            height:'6px',
                            background: i === activeStep ? '#D4AF37' : 'rgba(255,255,255,0.15)',
                          }} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-8 py-4 shrink-0"
              style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={goPrev} disabled={isFirst}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                style={{
                  color: isFirst ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
                  border:`1px solid ${isFirst ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}`,
                  cursor: isFirst ? 'default' : 'pointer',
                }}
                onMouseEnter={e => { if (!isFirst) (e.currentTarget.style.color='white'); }}
                onMouseLeave={e => { if (!isFirst) (e.currentTarget.style.color='rgba(255,255,255,0.5)'); }}>
                <ChevronRight className="size-4 rotate-180" />
                {fr ? 'Précédent' : 'Previous'}
              </button>

              <div className="flex items-center gap-1">
                {sections.map((_, i) => (
                  <div key={i} className="rounded-full transition-all"
                    style={{ width: i === activeSec ? '16px' : '5px', height:'5px', background: i === activeSec ? '#D4AF37' : 'rgba(255,255,255,0.12)' }} />
                ))}
              </div>

              {isLast ? (
                <button onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background:'linear-gradient(135deg,#D4AF37,#B8962F)', color:'#07111f', boxShadow:'0 4px 16px rgba(212,175,55,0.25)' }}>
                  {fr ? 'Commencer ✓' : 'Get started ✓'}
                </button>
              ) : (
                <button onClick={goNext}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color='white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.8)'; }}>
                  {fr ? 'Suivant' : 'Next'}
                  <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
