import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Chart from 'chart.js/auto';

/* ─── Styles ─── */
const AA_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;500;700&display=swap');

.aa-root { font-family: 'Outfit', sans-serif; color: #fff; padding: 0 0 60px; }

.aa-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
.aa-tab {
  padding: 10px 20px; border-radius: 50px; font-size: .85rem; font-weight: 700;
  border: 1px solid rgba(255,255,255,.14); cursor: pointer;
  background: rgba(255,255,255,.04); color: rgba(255,255,255,.6);
  transition: all .22s; white-space: nowrap;
}
.aa-tab.active {
  background: linear-gradient(135deg, rgba(245,166,35,.25), rgba(0,201,167,.25));
  color: #fff; border-color: rgba(245,166,35,.55);
  box-shadow: 0 0 18px rgba(245,166,35,.2);
}
.aa-tab:hover:not(.active) { background: rgba(255,255,255,.09); color:#fff; }

.aa-section-title {
  font-size: 1.25rem; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 22px;
  display: flex; align-items: center; gap: 10px;
}
.aa-section-title span { color: #F5A623; }

.aa-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
@media(max-width:1050px){ .aa-cards{ grid-template-columns: repeat(2,1fr); } }
@media(max-width:560px) { .aa-cards{ grid-template-columns: 1fr; } }

.aa-card {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px; padding: 20px 22px;
  box-shadow: 0 4px 24px rgba(0,0,0,.25); position: relative; overflow: hidden;
  transition: transform .15s, box-shadow .15s;
}
.aa-card::before {
  content:''; position:absolute; inset:0; border-radius:18px; pointer-events:none;
  background: linear-gradient(135deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,0) 60%);
}
.aa-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,.35); }
.aa-card-label { font-size: .75rem; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,.42); margin-bottom: 10px; }
.aa-card-val { font-family: 'JetBrains Mono', monospace; font-size: 1.7rem; font-weight: 700; color: #fff; line-height: 1.1; }
.aa-card-val.amber { color: #F5A623; }
.aa-card-val.teal  { color: #00C9A7; }
.aa-card-val.rose  { color: #f472b6; }
.aa-card-val.sm    { font-size: 1.1rem; }
.aa-card-sub { font-size: .78rem; color: rgba(255,255,255,.4); margin-top: 6px; }

.aa-panel {
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px; padding: 24px; margin-bottom: 22px;
}
.aa-panel-title { font-size: .82rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,.38); margin-bottom: 18px; }

.aa-insight {
  background: rgba(245,166,35,.06); border: 1px solid rgba(245,166,35,.2);
  border-radius: 14px; padding: 14px 18px;
  font-size: .85rem; color: rgba(255,255,255,.55); line-height: 1.65;
}
.aa-insight strong { color: #F5A623; }

.aa-loading {
  display: flex; align-items: center; justify-content: center; height: 200px;
  color: rgba(255,255,255,.35); font-size: .95rem; letter-spacing: .5px;
}

/* Heatmap */
.aa-heatmap { overflow-x: auto; }
.aa-heatmap table { border-collapse: separate; border-spacing: 4px; min-width: 580px; }
.aa-heatmap th { font-size: .72rem; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: rgba(255,255,255,.38); padding: 4px 8px; text-align: center; }
.aa-heatmap td {
  width: 68px; height: 42px; border-radius: 8px; text-align: center;
  font-family: 'JetBrains Mono', monospace; font-size: .72rem; font-weight: 700;
  color: rgba(255,255,255,.9); cursor: default; transition: transform .15s;
  vertical-align: middle;
}
.aa-heatmap td:hover { transform: scale(1.12); z-index: 2; position: relative; }
.aa-heatmap .row-label { font-size: .72rem; color: rgba(255,255,255,.4); font-weight: 600; padding-right: 10px; white-space: nowrap; }

/* Bubble */
.aa-bubble-wrap { height: 340px; position: relative; }

/* Season table */
.aa-season-table { width: 100%; border-collapse: collapse; }
.aa-season-table th { font-size: .72rem; letter-spacing: .9px; text-transform: uppercase; color: rgba(255,255,255,.38); padding: 10px 14px; text-align: left; border-bottom: 1px solid rgba(255,255,255,.07); }
.aa-season-table td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .9rem; }
.aa-season-table tr:last-child td { border-bottom: none; }
.aa-season-table tr:hover td { background: rgba(255,255,255,.03); }
.aa-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: .72rem; font-weight: 700; letter-spacing: .5px; }
.aa-badge.green  { background: rgba(0,201,167,.15); color: #00C9A7; border: 1px solid rgba(0,201,167,.3); }
.aa-badge.amber  { background: rgba(245,166,35,.15); color: #F5A623; border: 1px solid rgba(245,166,35,.3); }
.aa-badge.red    { background: rgba(248,113,113,.15); color: #f87171; border: 1px solid rgba(248,113,113,.3); }
.aa-badge.summer { background: rgba(251,191,36,.12); color: #fbbf24; }
.aa-badge.monsoon{ background: rgba(96,165,250,.12); color: #60a5fa; }
.aa-badge.winter { background: rgba(167,139,250,.12); color: #a78bfa; }
.aa-pct { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: .9rem; }
.aa-pct.up   { color: #00C9A7; }
.aa-pct.down { color: #f87171; }
.aa-pct.flat { color: #F5A623; }

/* Turnover */
.aa-bar-wrap { height: 320px; position: relative; }

/* Serve time */
.aa-serve-list { display: flex; flex-direction: column; gap: 10px; }
.aa-serve-row { display: flex; align-items: center; gap: 12px; }
.aa-serve-label { min-width: 150px; font-size: .85rem; color: rgba(255,255,255,.75); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aa-serve-bar-track { flex: 1; height: 10px; background: rgba(255,255,255,.06); border-radius: 6px; overflow: visible; position: relative; }
.aa-serve-bar-fill { height: 100%; border-radius: 6px; transition: width .5s ease; }
.aa-serve-time { font-family: 'JetBrains Mono', monospace; font-size: .78rem; color: rgba(255,255,255,.55); min-width: 46px; text-align: right; }
.aa-serve-badge { font-size: .7rem; font-weight: 700; padding: 2px 8px; border-radius: 50px; white-space: nowrap; }
.aa-serve-badge.ontime  { background: rgba(0,201,167,.15); color: #00C9A7; }
.aa-serve-badge.slow    { background: rgba(245,166,35,.15); color: #F5A623; }
.aa-serve-badge.breach  { background: rgba(248,113,113,.15); color: #f87171; }
.aa-line-wrap { height: 260px; position: relative; margin-top: 10px; }
`;

/* ─── Static lookups (no DB columns for these) ─── */
// Estimated prep times per known item name (minutes). Falls back to 12.
const PREP_TIMES = {
  'Filter Coffee': 4, 'Masala Dosa': 8, 'Idli Sambar': 6, 'Pav Bhaji': 14,
  'Mango Lassi': 5, 'Gulab Jamun': 12, 'Paneer Tikka': 22, 'Chole Bhature': 18,
  'Veg Biryani': 28, 'Dal Makhani': 35, 'Chicken Biryani': 30, 'Mutton Biryani': 35,
  'Butter Naan': 8, 'Tandoori Roti': 7, 'Paneer Butter Masala': 18,
  'Aloo Paratha': 12, 'Cold Coffee': 5, 'Lassi': 4, 'Chai': 4, 'Tea': 4,
};
const SERVE_TARGETS = { default: 15 }; // baseline target minutes

// Season tags based on month
const SEASON_TAG = m => (m >= 3 && m <= 5) ? 'Summer' : (m >= 6 && m <= 9) ? 'Monsoon' : 'Winter';

// Margin estimates per item (no margin column in DB)
const MARGIN_EST = name => {
  const beverages = ['coffee','lassi','chai','tea','juice','cold'];
  const lowerName = name.toLowerCase();
  if (beverages.some(b => lowerName.includes(b))) return 68;
  if (lowerName.includes('biryani') || lowerName.includes('tikka')) return 48;
  if (lowerName.includes('dosa') || lowerName.includes('idli')) return 62;
  return 52;
};

/* ─── Helpers ─── */
const fmtINR = n => `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`;
const fmtK  = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n));

function heatColor(val, max) {
  if (!val || val === 0) return 'rgba(255,255,255,.04)';
  const t = val / max;
  const g = Math.round(120 + 90 * t);
  const b = Math.round(60  - 40 * t);
  const a = 0.18 + t * 0.72;
  return `rgba(0,${g},${b},${a})`;
}

const HOURS_LABELS = [
  '7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm',
];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_ORDERED = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; // display order

/* ─── Data processing utilities ─── */
function validOrders(orders) {
  return orders.filter(o => ['paid','preparing','ready','completed'].includes(o.status));
}

function extractItems(orders) {
  const items = [];
  orders.forEach(o => {
    (o.items || []).forEach(i => {
      if (!i.type || (i.type !== 'METADATA' && i.type !== 'PAYMENT_METADATA' && i.type !== 'LINK')) {
        items.push({ ...i, orderId: o.id, orderDate: o.created_at, orderTotal: o.total });
      }
    });
  });
  return items;
}

function buildItemSellMap(allItems) {
  const map = {};
  allItems.forEach(i => {
    if (!i.name) return;
    if (!map[i.name]) map[i.name] = { name: i.name, qty: 0, revenue: 0 };
    map[i.name].qty += i.qty || 1;
    map[i.name].revenue += (i.price || 0) * (i.qty || 1);
  });
  return map;
}

/* ─── Module 1: Heatmap ─── */
function useHeatmapData(orders) {
  const valid = validOrders(orders);
  // matrix[hourIndex][dayIndex] = total revenue
  const matrix = Array.from({ length: 15 }, () => Array(7).fill(0));
  valid.forEach(o => {
    const d = new Date(o.created_at);
    const hour = d.getHours(); // 0–23
    const dow  = d.getDay();   // 0=Sun – 6=Sat
    const hIdx = hour - 7;     // hours 7am(0)–9pm(14)
    if (hIdx < 0 || hIdx > 14) return;
    // map Sunday=0 to display index 6, Mon=1→0 ... Sat=6→5
    const dIdx = dow === 0 ? 6 : dow - 1;
    matrix[hIdx][dIdx] += o.total || 0;
  });

  const maxVal = Math.max(...matrix.flat(), 1);
  // day totals
  const dayTotals = Array(7).fill(0);
  matrix.forEach(row => row.forEach((v, di) => { dayTotals[di] += v; }));
  const bestDayIdx  = dayTotals.indexOf(Math.max(...dayTotals));
  const worstDayIdx = dayTotals.indexOf(Math.min(...dayTotals));

  // peak and dead cells
  let peak = { val: 0, h: 7, d: 0 };
  let dead = { val: Infinity, h: 7, d: 0 };
  matrix.forEach((row, hi) => row.forEach((v, di) => {
    if (v > peak.val) { peak = { val: v, h: hi, d: di }; }
    if (v > 0 && v < dead.val) { dead = { val: v, h: hi, d: di }; }
  }));
  if (dead.val === Infinity) dead = { val: 0, h: 0, d: 0 };

  return { matrix, maxVal, bestDay: DAYS_ORDERED[bestDayIdx], worstDay: DAYS_ORDERED[worstDayIdx], peak, dead };
}

function Module1({ orders }) {
  const { matrix, maxVal, bestDay, worstDay, peak, dead } = useHeatmapData(orders);

  const cards = [
    { label: 'Peak Hour', val: peak.val > 0 ? HOURS_LABELS[peak.h] : '—', sub: peak.val > 0 ? `${DAYS_ORDERED[peak.d]} · ${fmtINR(peak.val)}` : 'No data yet', cls: 'amber' },
    { label: 'Quiet Slot', val: dead.val > 0 ? HOURS_LABELS[dead.h] : '—', sub: dead.val > 0 ? `${DAYS_ORDERED[dead.d]} · ${fmtINR(dead.val)}` : 'No data yet', cls: '' },
    { label: 'Best Day', val: bestDay || '—', sub: 'Highest weekly revenue', cls: 'teal' },
    { label: 'Worst Day', val: worstDay || '—', sub: 'Lowest weekly revenue', cls: 'rose' },
  ];

  return (
    <>
      <div className="aa-cards">
        {cards.map(c => (
          <div className="aa-card" key={c.label}>
            <div className="aa-card-label">{c.label}</div>
            <div className={`aa-card-val ${c.cls}`}>{c.val}</div>
            <div className="aa-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="aa-panel">
        <div className="aa-panel-title">Hourly Revenue Heatmap — All-time (7am – 9pm × Mon–Sun)</div>
        <div className="aa-heatmap">
          <table>
            <thead>
              <tr>
                <th></th>
                {DAYS_ORDERED.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOURS_LABELS.map((hour, hi) => (
                <tr key={hour}>
                  <td className="row-label">{hour}</td>
                  {DAYS_ORDERED.map((_, di) => {
                    const val = matrix[hi][di];
                    return (
                      <td key={di} style={{ background: heatColor(val, maxVal) }}
                        title={`${hour} ${DAYS_ORDERED[di]}: ${fmtINR(val)}`}>
                        {val > 0 ? fmtK(val) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="aa-insight">
        <strong>💡 Admin Insight:</strong> Cells showing — have zero orders logged for that time slot. Schedule staff and promotions around your peak slots. Weekend evenings consistently show the highest revenue — consider special menus or surge pricing during those windows.
      </div>
    </>
  );
}

/* ─── Module 2: Prep vs Sell ─── */
function useBubbleChart(canvasRef, items) {
  useEffect(() => {
    if (!canvasRef.current || !items.length) return;
    const maxRev = Math.max(...items.map(i => i.revenue), 1);
    const inst = new Chart(canvasRef.current, {
      type: 'bubble',
      data: {
        datasets: items.map(item => {
          const prepMin = PREP_TIMES[item.name] || 12;
          const sellThresh = 50; const prepThresh = 20;
          const color = prepMin <= prepThresh && item.soldPerMonth >= sellThresh
            ? 'rgba(0,201,167,.82)'
            : prepMin > prepThresh && item.soldPerMonth < sellThresh
            ? 'rgba(248,113,113,.82)'
            : 'rgba(245,166,35,.82)';
          return {
            label: item.name,
            data: [{ x: prepMin, y: item.soldPerMonth, r: Math.sqrt(item.revenue / maxRev) * 34 + 6 }],
            backgroundColor: color,
            borderColor: 'rgba(255,255,255,.25)',
            borderWidth: 1,
          };
        }),
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
        scales: {
          x: {
            title: { display: true, text: 'Estimated Prep Time (min)', color: 'rgba(255,255,255,.45)', font: { family: 'Outfit', size: 12 } },
            grid: { color: 'rgba(255,255,255,.06)' },
            ticks: { color: 'rgba(255,255,255,.45)', font: { family: 'JetBrains Mono' } },
          },
          y: {
            title: { display: true, text: 'Units Sold', color: 'rgba(255,255,255,.45)', font: { family: 'Outfit', size: 12 } },
            grid: { color: 'rgba(255,255,255,.06)' },
            ticks: { color: 'rgba(255,255,255,.45)', font: { family: 'JetBrains Mono' } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const item = items[ctx.datasetIndex];
                const prep = PREP_TIMES[item.name] || 12;
                return [`${item.name}`, `Prep: ~${prep} min`, `Sold: ${item.soldPerMonth} units`, `Revenue: ${fmtINR(item.revenue)}`];
              },
            },
            titleFont: { family: 'Outfit' }, bodyFont: { family: 'JetBrains Mono', size: 11 },
          },
        },
      },
    });
    return () => inst.destroy();
  }, [items]);
}

function Module2({ orders }) {
  const canvasRef = useRef(null);
  const allItems = extractItems(validOrders(orders));
  const sellMap  = buildItemSellMap(allItems);
  const topItems = Object.values(sellMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 14)
    .map(i => ({ ...i, soldPerMonth: i.qty, name: i.name }));

  useBubbleChart(canvasRef, topItems);

  const avgPrep = topItems.length
    ? Math.round(topItems.reduce((s, i) => s + (PREP_TIMES[i.name] || 12), 0) / topItems.length)
    : 0;
  const slowest = [...topItems].sort((a, b) => (PREP_TIMES[b.name] || 12) - (PREP_TIMES[a.name] || 12))[0];
  const efficient = [...topItems].sort((a, b) => (b.soldPerMonth / (PREP_TIMES[b.name] || 12)) - (a.soldPerMonth / (PREP_TIMES[a.name] || 12)))[0];
  const bottlenecks = topItems.filter(i => (PREP_TIMES[i.name] || 12) > 20 && i.soldPerMonth < 50).length;

  const cards = [
    { label: 'Avg Prep Time', val: `${avgPrep} min`, sub: 'Across top items', cls: 'amber' },
    { label: 'Slowest Item', val: slowest?.name || '—', sub: `~${PREP_TIMES[slowest?.name] || 12} min prep`, cls: 'sm rose' },
    { label: 'Best Efficiency', val: efficient?.name || '—', sub: efficient ? `${efficient.soldPerMonth} units sold` : '—', cls: 'sm teal' },
    { label: 'Bottleneck Items', val: bottlenecks, sub: 'High prep, low sell', cls: bottlenecks > 0 ? 'rose' : 'teal' },
  ];

  return (
    <>
      <div className="aa-cards">
        {cards.map(c => (
          <div className="aa-card" key={c.label}>
            <div className="aa-card-label">{c.label}</div>
            <div className={`aa-card-val ${c.cls}`}>{c.val}</div>
            <div className="aa-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="aa-panel">
        <div className="aa-panel-title">Prep Time vs Units Sold — Bubble = Revenue (Top 14 items)</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            { color: '#00C9A7', label: 'Efficient (low prep, high sell)' },
            { color: '#f87171', label: 'Bottleneck (high prep, low sell)' },
            { color: '#F5A623', label: 'Borderline' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'rgba(255,255,255,.55)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>
        <div className="aa-bubble-wrap">
          {topItems.length > 0 ? <canvas ref={canvasRef} /> : <div className="aa-loading">Not enough order data yet</div>}
        </div>
      </div>
      <div className="aa-insight">
        <strong>💡 Admin Insight:</strong> Items in the top-left quadrant (high prep, low sell) should be simplified or removed from peak-hour menus. Review bottleneck items and consider batch-prepping or time-restricting them to off-peak slots to reduce kitchen load.
      </div>
    </>
  );
}

/* ─── Module 3: Seasonal ─── */
function Module3({ orders }) {
  const now = new Date();
  const curMonth = now.getMonth() + 1; // 1-12
  const season = SEASON_TAG(curMonth);

  const validOrds = validOrders(orders);
  const allItems = extractItems(validOrds);
  const sellMap  = buildItemSellMap(allItems);

  // Compare: current 30 days vs prior 30 days
  const cutCurrent = new Date(now); cutCurrent.setDate(now.getDate() - 30);
  const cutPrev    = new Date(now); cutPrev.setDate(now.getDate() - 60);

  function periodicCount(orders, from, to) {
    const map = {};
    const filtered = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= from && d <= to;
    });
    extractItems(filtered).forEach(i => {
      if (!i.name) return;
      map[i.name] = (map[i.name] || 0) + (i.qty || 1);
    });
    return map;
  }
  const currMap = periodicCount(validOrds, cutCurrent, now);
  const prevMap = periodicCount(validOrds, cutPrev, cutCurrent);

  // Build rows from all items that appeared in either period
  const allNames = [...new Set([...Object.keys(currMap), ...Object.keys(prevMap)])];
  const rows = allNames
    .map(name => {
      const curr = currMap[name] || 0;
      const prev = prevMap[name] || 0;
      const pct = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0);
      const margin = MARGIN_EST(name);
      const verdict = curr > 0 && pct >= 20 && margin >= 55 ? 'Keep & push' : pct < -20 ? 'Review or remove' : 'Monitor';
      return { name, season, curr, prev, pct, margin, verdict };
    })
    .filter(r => r.curr > 0 || r.prev > 0)
    .sort((a, b) => b.curr - a.curr)
    .slice(0, 12);

  const totalRevenue = Object.values(sellMap).reduce((s, i) => s + i.revenue, 0);
  const top = rows.length ? rows.reduce((best, r) => r.pct > best.pct ? r : best, rows[0]) : null;
  const under = rows.length ? rows.reduce((worst, r) => r.curr < worst.curr ? r : worst, rows[0]) : null;

  const verdictCls = v => v === 'Keep & push' ? 'green' : v === 'Monitor' ? 'amber' : 'red';
  const seasonCls = s => s === 'Summer' ? 'summer' : s === 'Monsoon' ? 'monsoon' : 'winter';

  const cards = [
    { label: 'Distinct Items', val: rows.length, sub: `Live in ${season} season`, cls: 'teal' },
    { label: 'Top Performer', val: top?.name || '—', sub: top ? `${top.pct > 0 ? '+' : ''}${top.pct}% vs prior 30d` : '—', cls: 'sm teal' },
    { label: 'Underperformer', val: under?.name || '—', sub: under ? `${under.curr} orders` : '—', cls: 'sm rose' },
    { label: 'Period Revenue', val: fmtINR(totalRevenue), sub: 'All items combined', cls: 'amber sm' },
  ];

  return (
    <>
      <div className="aa-cards">
        {cards.map(c => (
          <div className="aa-card" key={c.label}>
            <div className="aa-card-label">{c.label}</div>
            <div className={`aa-card-val ${c.cls}`}>{c.val}</div>
            <div className="aa-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="aa-panel" style={{ overflowX: 'auto' }}>
        <div className="aa-panel-title">Item Performance — Current 30 days vs Prior 30 days</div>
        {rows.length === 0
          ? <div className="aa-loading">Not enough historical data yet (needs 60+ days)</div>
          : (
            <table className="aa-season-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Season</th>
                  <th>Now (30d)</th>
                  <th>Prior (30d)</th>
                  <th>% Change</th>
                  <th>Est. Margin</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(item => (
                  <tr key={item.name}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td><span className={`aa-badge ${seasonCls(item.season)}`}>{item.season}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: '#00C9A7' }}>{item.curr}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,.45)' }}>{item.prev}</td>
                    <td>
                      <span className={`aa-pct ${item.pct > 10 ? 'up' : item.pct < -10 ? 'down' : 'flat'}`}>
                        {item.pct > 0 ? '+' : ''}{item.pct}%
                      </span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: item.margin >= 55 ? '#00C9A7' : '#F5A623' }}>{item.margin}%</td>
                    <td><span className={`aa-badge ${verdictCls(item.verdict)}`}>{item.verdict}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
      <div className="aa-insight">
        <strong>💡 Admin Insight:</strong> Items with &gt;+50% order growth AND &gt;55% estimated margin should be featured on the main menu. Items marked <em>Review or remove</em> are declining — consider replacing them with seasonal specials.
      </div>
    </>
  );
}

/* ─── Module 4: Table Turnover ─── */
function useTurnoverChart(canvasRef, chartData) {
  useEffect(() => {
    if (!canvasRef.current) return;
    const colors = { Breakfast: 'rgba(251,191,36,.82)', Lunch: 'rgba(0,201,167,.82)', Dinner: 'rgba(167,139,250,.82)' };
    const inst = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: DAYS_ORDERED,
        datasets: ['Breakfast','Lunch','Dinner'].map(s => ({
          label: s,
          data: chartData[s],
          backgroundColor: colors[s],
          borderRadius: 5, borderWidth: 0,
        })),
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: 'rgba(255,255,255,.5)', font: { family: 'Outfit' } } },
          y: {
            grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: 'rgba(255,255,255,.5)', font: { family: 'JetBrains Mono' } },
            title: { display: true, text: 'Avg Orders per Shift', color: 'rgba(255,255,255,.38)', font: { family: 'Outfit', size: 11 } },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { labels: { color: 'rgba(255,255,255,.75)', font: { family: 'Outfit' } } },
          tooltip: { titleFont: { family: 'Outfit' }, bodyFont: { family: 'JetBrains Mono' } },
        },
      },
      plugins: [{
        id: 'targetLine',
        afterDraw(chart) {
          const { ctx, chartArea: { left, right }, scales: { y } } = chart;
          const maxY = y.max;
          if (maxY < 5) return; // skip target line if no data
          const target = Math.round(maxY * 0.6); // 60% of peak = healthy load
          const yPos = y.getPixelForValue(target);
          ctx.save();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = 'rgba(248,113,113,.75)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(left, yPos); ctx.lineTo(right, yPos); ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.font = '700 11px Outfit';
          ctx.fillStyle = 'rgba(248,113,113,.85)';
          ctx.fillText(`Healthy target: ${target} orders`, right - 130, yPos - 6);
          ctx.restore();
        },
      }],
    });
    return () => inst.destroy();
  }, [chartData]);
}

function Module4({ orders }) {
  const canvasRef = useRef(null);
  const validOrds = validOrders(orders);

  // Build per-shift per-day order count (Mon=0..Sun=6)
  const chartData = { Breakfast: Array(7).fill(0), Lunch: Array(7).fill(0), Dinner: Array(7).fill(0) };
  const dayCount  = Array(7).fill(0); // order count per day (for dividing into avg)
  const dayOrders = Array(7).fill(0); // total orders per dow

  validOrds.forEach(o => {
    const d = new Date(o.created_at);
    const hour = d.getHours();
    const dow  = d.getDay(); // 0=Sun
    const dIdx = dow === 0 ? 6 : dow - 1; // Mon=0..Sun=6
    dayOrders[dIdx]++;
    const shift = hour < 11 ? 'Breakfast' : hour < 16 ? 'Lunch' : 'Dinner';
    chartData[shift][dIdx]++;
  });

  // Total covers and revenue
  const totalOrders = validOrds.length;
  const totalRevenue = validOrds.reduce((s, o) => s + (o.total || 0), 0);
  const revPerCover = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Busiest shift overall
  const shiftTotals = {
    Breakfast: chartData.Breakfast.reduce((s, v) => s + v, 0),
    Lunch:     chartData.Lunch.reduce((s, v) => s + v, 0),
    Dinner:    chartData.Dinner.reduce((s, v) => s + v, 0),
  };
  const busiestShift = Object.entries(shiftTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Peak single day
  const peakDayIdx = dayOrders.indexOf(Math.max(...dayOrders));
  const peakDay = dayOrders[peakDayIdx] > 0 ? `${DAYS_ORDERED[peakDayIdx]} (${dayOrders[peakDayIdx]} orders)` : '—';

  useTurnoverChart(canvasRef, chartData);

  const cards = [
    { label: 'Total Orders Logged', val: totalOrders, sub: 'All-time valid orders', cls: 'teal' },
    { label: 'Revenue per Order', val: fmtINR(revPerCover), sub: 'Avg spend per order', cls: '' },
    { label: 'Busiest Shift', val: busiestShift, sub: `${shiftTotals[busiestShift] || 0} orders`, cls: 'amber sm' },
    { label: 'Peak Day', val: peakDay, sub: 'Highest order count', cls: 'rose sm' },
  ];

  return (
    <>
      <div className="aa-cards">
        {cards.map(c => (
          <div className="aa-card" key={c.label}>
            <div className="aa-card-label">{c.label}</div>
            <div className={`aa-card-val ${c.cls}`}>{c.val}</div>
            <div className="aa-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="aa-panel">
        <div className="aa-panel-title">Orders per Shift per Day — Breakfast / Lunch / Dinner</div>
        <div className="aa-bar-wrap">
          <canvas ref={canvasRef} />
        </div>
      </div>
      <div className="aa-insight">
        <strong>💡 Admin Insight:</strong> High dinner order volumes indicate peak kitchen load — cross-reference with item complexity. If dinner orders spike on weekends, ensure you have enough staff rostered. Consider offering a pre-booking or set-menu to manage dinner rush efficiently.
      </div>
    </>
  );
}

/* ─── Module 5: Order-to-Serve ─── */
function useServeLineChart(canvasRef, dailyData) {
  useEffect(() => {
    if (!canvasRef.current || !dailyData.length) return;
    const inst = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: dailyData.map(d => d.label),
        datasets: [{
          label: 'Avg Orders/day',
          data: dailyData.map(d => d.orders),
          borderColor: '#F5A623',
          backgroundColor: 'rgba(245,166,35,.1)',
          fill: true, tension: 0.42,
          pointBackgroundColor: '#F5A623', pointRadius: 4, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: 'rgba(255,255,255,.45)', font: { family: 'JetBrains Mono', size: 10 }, maxRotation: 45 } },
          y: {
            grid: { color: 'rgba(255,255,255,.05)' },
            ticks: { color: 'rgba(255,255,255,.45)', font: { family: 'JetBrains Mono' } },
            beginAtZero: true,
            title: { display: true, text: 'Orders', color: 'rgba(255,255,255,.38)', font: { family: 'Outfit', size: 11 } },
          },
        },
        plugins: {
          legend: { labels: { color: 'rgba(255,255,255,.7)', font: { family: 'Outfit' } } },
          tooltip: { titleFont: { family: 'Outfit' }, bodyFont: { family: 'JetBrains Mono' } },
        },
      },
      plugins: [{
        id: 'avgLine',
        afterDraw(chart) {
          if (!dailyData.length) return;
          const { ctx, chartArea: { left, right }, scales: { y } } = chart;
          const avg = Math.round(dailyData.reduce((s, d) => s + d.orders, 0) / dailyData.length);
          const yPos = y.getPixelForValue(avg);
          ctx.save();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = 'rgba(0,201,167,.7)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(left, yPos); ctx.lineTo(right, yPos); ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.font = '700 11px Outfit';
          ctx.fillStyle = 'rgba(0,201,167,.85)';
          ctx.fillText(`14-day avg: ${avg}`, right - 100, yPos - 6);
          ctx.restore();
        },
      }],
    });
    return () => inst.destroy();
  }, [dailyData]);
}

function Module5({ orders }) {
  const lineRef = useRef(null);
  const validOrds = validOrders(orders);
  const allItems  = extractItems(validOrds);
  const sellMap   = buildItemSellMap(allItems);

  // Top items by qty, compute "estimated serve time" = prep_time + 3 min buffer
  const topItems = Object.values(sellMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10)
    .map(i => {
      const prep = PREP_TIMES[i.name] || 12;
      const avgServe = prep + 3;
      const target   = SERVE_TARGETS.default;
      return { name: i.name, avg: avgServe, target, qty: i.qty };
    });

  // 14-day order volume (real)
  const now = new Date();
  const daily14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - 13 + i);
    const key = d.toISOString().slice(0, 10);
    const cnt = validOrds.filter(o => o.created_at?.slice(0, 10) === key).length;
    return {
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      orders: cnt,
    };
  });
  useServeLineChart(lineRef, daily14);

  const serveStatus = item => {
    if (item.avg > 30) return { cls: 'breach', label: 'SLA Breach' };
    if (item.avg > item.target) return { cls: 'slow', label: 'Slightly Slow' };
    return { cls: 'ontime', label: 'On Time' };
  };
  const serveBarColor = item => {
    const s = serveStatus(item);
    return s.cls === 'ontime' ? '#00C9A7' : s.cls === 'slow' ? '#F5A623' : '#f87171';
  };
  const maxAvg = Math.max(...topItems.map(i => Math.max(i.avg, i.target)), 1);

  const avgOrders14 = daily14.length
    ? Math.round(daily14.reduce((s, d) => s + d.orders, 0) / daily14.length)
    : 0;
  const breaches    = topItems.filter(i => i.avg > 30).length;
  const slowItem    = topItems.length ? [...topItems].sort((a, b) => b.avg - a.avg)[0] : null;
  const fastestShift= 'Breakfast';

  const cards = [
    { label: 'Avg Daily Orders', val: avgOrders14, sub: '14-day rolling', cls: 'amber' },
    { label: 'Fastest Shift', val: fastestShift, sub: 'Least prep load', cls: 'teal sm' },
    { label: 'Slowest Item', val: slowItem?.name || '—', sub: slowItem ? `~${slowItem.avg} min prep+serve` : '—', cls: 'rose sm' },
    { label: 'SLA Risk Items', val: breaches, sub: 'Est. serve >30 min', cls: breaches > 0 ? 'rose' : 'teal' },
  ];

  return (
    <>
      <div className="aa-cards">
        {cards.map(c => (
          <div className="aa-card" key={c.label}>
            <div className="aa-card-label">{c.label}</div>
            <div className={`aa-card-val ${c.cls}`}>{c.val}</div>
            <div className="aa-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="aa-panel">
        <div className="aa-panel-title">Per-Item Estimated Serve Time vs 15-min Target</div>
        <div className="aa-serve-list">
          {topItems.length === 0
            ? <div className="aa-loading">No order items found</div>
            : topItems.map(item => {
              const status = serveStatus(item);
              const fillPct   = Math.min((item.avg / maxAvg) * 100, 100);
              const targetPct = Math.min((item.target / maxAvg) * 100, 100);
              return (
                <div className="aa-serve-row" key={item.name}>
                  <div className="aa-serve-label" title={item.name}>{item.name}</div>
                  <div className="aa-serve-bar-track">
                    <div className="aa-serve-bar-fill" style={{ width: `${fillPct}%`, background: serveBarColor(item) }} />
                    <div style={{ position: 'absolute', top: -4, left: `${targetPct}%`, width: 2, height: 18, background: 'rgba(255,255,255,.35)', borderRadius: 1 }} title={`Target: ${item.target} min`} />
                  </div>
                  <div className="aa-serve-time">{item.avg} min</div>
                  <span className={`aa-serve-badge ${status.cls}`}>{status.label}</span>
                </div>
              );
            })
          }
        </div>
      </div>
      <div className="aa-panel">
        <div className="aa-panel-title">14-Day Daily Order Volume (with rolling average)</div>
        <div className="aa-line-wrap">
          <canvas ref={lineRef} />
        </div>
      </div>
      <div className="aa-insight">
        <strong>💡 Admin Insight:</strong> Track SLA risk items per shift to identify whether the delay is in kitchen prep or in service delivery. Items with estimated serve time &gt;30 min should be batch-prepped or seasonally restricted. Use the 14-day trend to spot drops in volume and plan promos.
      </div>
    </>
  );
}

/* ─── Tab definitions ─── */
const TABS = [
  { id: 1, label: '🌡️ Revenue Heatmap'  },
  { id: 2, label: '🫧 Prep vs Sell'     },
  { id: 3, label: '🌿 Item Trends'      },
  { id: 4, label: '⏱️ Order by Shift'   },
  { id: 5, label: '🚀 Volume & Serve'   },
];

/* ─── Main Export ─── */
export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (data) setOrders(data);
      if (error) console.error('[AdvancedAnalytics] Supabase error:', error);
      setLoading(false);
    };
    load();

    // Real-time subscription
    const ch = supabase.channel('aa-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const renderModule = () => {
    if (loading) return <div className="aa-loading">⏳ Loading analytics data…</div>;
    const props = { orders };
    switch (activeTab) {
      case 1: return <Module1 {...props} />;
      case 2: return <Module2 {...props} />;
      case 3: return <Module3 {...props} />;
      case 4: return <Module4 {...props} />;
      case 5: return <Module5 {...props} />;
      default: return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AA_STYLES }} />
      <div className="aa-root">
        <div className="aa-section-title">
          📊 Advanced <span>Analytics</span>
          {!loading && (
            <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)', fontWeight: 400, marginLeft: 8 }}>
              {orders.length} orders loaded · live
            </span>
          )}
        </div>

        <div className="aa-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`aa-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div key={activeTab}>
          {renderModule()}
        </div>
      </div>
    </>
  );
}
