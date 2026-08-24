/* =====================================================================
   DP-ES Figure 1 - camera-ready alignment (v2)
   Visual system carried over from v1; mechanism content updated to the
   EMNLP camera-ready (three privacy zones, sampled-Gaussian scoring,
   post-processing selection, threshold-free stability row).
   Canvas 6.30 in wide (ACL \textwidth), scale 1.0, zero raster objects.
   Regions: R1 header-loop | R2 zone-frames | R3 phase-cards
            R4 zone-bands  | R5 accounting  | R6 comparison-table
   Build dependency: pptxgenjs. Running this script writes
   DPES_Fig1_v2.pptx; export that deck to PDF for LaTeX inclusion.
   ===================================================================== */
const pptxgen = require('pptxgenjs');

const REGIONS = (process.env.REGIONS || 'R1,R2,R3,R4,R5,R6').split(',');
const on = (r) => REGIONS.includes(r);

const W = 6.30, H = Number(process.env.CANVAS_H || 4.87);

/* ---------- design tokens (v1 palette + green post-processing zone) --- */
const TEAL = '0E7C7B', TEAL_T = 'E1F1F1';   // privacy-free
const INDI = '1F3D7A', INDI_T = 'E6EDF8';   // private-data access
const GREEN = '2E7D32', GREEN_T = 'E8F4E6'; // post-processing
const BRICK = 'B23124', BRICK_T = 'FBEDEB'; // DP-OPT
const INK = '1A1F2B', BODY = '333B48', MUTE = '5B6572';
const RULE_L = 'C9D1DC', CARD_BD = 'C8D0DC', WHITE = 'FFFFFF';
const SANS = 'Arial', SERIF = 'Times New Roman', MATH = 'Cambria Math';

/* ---------- layout anchors ---------- */
const MX = 0.12, ZGAP = 0.10, PAD = 0.09;
const ZW = (W - 2 * MX - 2 * ZGAP) / 3;              // 1.9533
const Z1 = MX, Z2 = Z1 + ZW + ZGAP, Z3 = Z2 + ZW + ZGAP;
const CW = ZW - 2 * PAD;                              // 1.7733
const C1 = Z1 + PAD, C2 = Z2 + PAD, C3 = Z3 + PAD;
const z1c = Z1 + ZW / 2, z2c = Z2 + ZW / 2, z3c = Z3 + ZW / 2;

const A_TITLE_Y = 0.050;
const LOOP_Y = 0.400;
const ZT = 0.600, HDR_Y = 0.655;
const CY = 0.870, CH = 1.510;
const BAND_Y = 2.530, BAND_H = 0.300;
const ZB = 2.900;
const ACC_Y = 2.990, ACC_H = 0.440;
const B_TITLE_Y = 3.550;
const TBL_Y = 3.800;

const pres = new pptxgen();
pres.defineLayout({ name: 'ACLFIG', width: W, height: H });
pres.layout = 'ACLFIG';
const s = pres.addSlide();
s.background = { color: WHITE };

/* ---------- rich text: _{sub} ^{sup} @{math} #{italic} !{bold} $/%/&{colour} */
function rt(str, base) {
  const out = [];
  const re = /([_^@#!$%&])\{([^}]*)\}/g;
  let last = 0, m;
  const push = (t, extra) => {
    const parts = String(t).split('\n');
    parts.forEach((p, i) => {
      if (p !== '' || parts.length > 1)
        out.push({ text: p, options: { ...base, ...extra, breakLine: i < parts.length - 1 } });
    });
  };
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) push(str.slice(last, m.index), {});
    const k = m[1];
    push(m[2], k === '_' ? { subscript: true }
      : k === '^' ? { superscript: true }
        : k === '@' ? { fontFace: MATH }
          : k === '#' ? { italic: true }
            : k === '$' ? { bold: true, color: TEAL }
              : k === '%' ? { bold: true, color: BRICK }
                : k === '&' ? { bold: true, color: GREEN }
                  : { bold: true });
    last = re.lastIndex;
  }
  if (last < str.length) push(str.slice(last), {});
  if (out.length) out[out.length - 1].options.breakLine = false;
  return out.length ? out : [{ text: str, options: { ...base } }];
}
function T(name, text, x, y, w, h, o = {}) {
  const base = {
    fontFace: o.mono ? SERIF : SANS, fontSize: o.size || 6.8,
    color: o.color || INK, bold: !!o.bold, italic: !!o.italic,
  };
  s.addText(rt(text, base), {
    objectName: name, x, y, w, h, margin: 0, isTextBox: true,
    align: o.align || 'left', valign: o.valign || 'top',
    lineSpacingMultiple: o.lsm || 1.0, charSpacing: o.cs || 0, ...base,
  });
}
function shape(name, type, opts) { s.addShape(pres.ShapeType[type], { objectName: name, ...opts }); }
const noFill = { type: 'none' };
const hline = (n, x1, x2, y, color, width, dash) => shape(n, 'line', {
  x: Math.min(x1, x2), y, w: Math.abs(x2 - x1), h: 0,
  line: { color, width, ...(dash ? { dashType: dash } : {}) },
});
const arrowR = (n, x1, x2, y, color, width) => shape(n, 'line', {
  x: x1, y, w: x2 - x1, h: 0, line: { color, width, endArrowType: 'triangle' },
});
const arrowD = (n, x, y1, y2, color, width) => shape(n, 'line', {
  x, y: y1, w: 0, h: y2 - y1, line: { color, width, endArrowType: 'triangle' },
});
const arrowU = (n, x, yTop, yBot, color, width) => shape(n, 'line', {
  x, y: yTop, w: 0, h: yBot - yTop, line: { color, width, beginArrowType: 'triangle' },
});

/* ---------- native composite icons (carried over from v1) ---------- */
function iconDNA(n, cx, cy, sz, col) {
  const w = sz * 0.54, h = sz * 0.70, x = cx - w / 2, y = cy - h / 2;
  shape(n + '.strandA', 'custGeom', {
    x, y, w, h, fill: noFill, line: { color: col, width: 1.5 },
    points: [{ x: 0, y: 0 }, { x: 0, y: h, curve: { type: 'cubic', x1: w * 0.70, y1: h * 0.30, x2: w * 0.70, y2: h * 0.70 } }],
  });
  shape(n + '.strandB', 'custGeom', {
    x, y, w, h, fill: noFill, line: { color: col, width: 1.5 },
    points: [{ x: w, y: 0 }, { x: w, y: h, curve: { type: 'cubic', x1: w * 0.30, y1: h * 0.30, x2: w * 0.30, y2: h * 0.70 } }],
  });
  [0.24, 0.76].forEach((f, i) => hline(`${n}.rung${i + 1}`, x + w * 0.37, x + w * 0.63, y + h * f, col, 1.2));
}
function iconBell(n, cx, cy, sz, col) {
  const w = sz * 0.66, h = sz * 0.40, x = cx - w / 2, y = cy - h / 2 - sz * 0.03;
  shape(n + '.curve', 'custGeom', {
    x, y, w, h, fill: noFill, line: { color: col, width: 1.5 },
    points: [{ x: 0, y: h },
    { x: w * 0.5, y: 0, curve: { type: 'cubic', x1: w * 0.19, y1: h, x2: w * 0.29, y2: 0 } },
    { x: w, y: h, curve: { type: 'cubic', x1: w * 0.71, y1: 0, x2: w * 0.81, y2: h } }],
  });
  hline(n + '.axis', x - sz * 0.04, x + w + sz * 0.04, y + h, col, 1.5);
  shape(n + '.sample', 'ellipse', {
    x: x + w * 0.74, y: y + h * 0.52, w: sz * 0.10, h: sz * 0.10, fill: { color: col }, line: noFill,
  });
}
function iconFunnel(n, cx, cy, sz, col) {
  const w = sz * 0.56, h = sz * 0.54, x = cx - w / 2, y = cy - h / 2;
  shape(n, 'custGeom', {
    x, y, w, h, fill: { color: col }, line: noFill,
    points: [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w * 0.62, y: h * 0.44 },
    { x: w * 0.62, y: h }, { x: w * 0.38, y: h }, { x: w * 0.38, y: h * 0.44 }, { close: true }],
  });
}
function iconNoAccess(n, cx, cy, sz, col) {
  shape(n + '.ring', 'ellipse', {
    x: cx - sz / 2, y: cy - sz / 2, w: sz, h: sz,
    fill: { color: WHITE }, line: { color: col, width: 2.0 },
  });
  shape(n + '.slash', 'line', {
    x: cx - sz * 0.24, y: cy - sz * 0.24, w: sz * 0.48, h: sz * 0.48,
    line: { color: col, width: 2.0 },
  });
}

/* =====================================================================
   R1 - title + iteration return lane
   ===================================================================== */
if (on('R1')) {
  T('a.title', '(a)   One !{DP-ES} iteration: privacy-free exploration, private scoring',
    MX, A_TITLE_Y, W - 2 * MX, 0.17, { size: 9, bold: true, color: INK });

  hline('a.loop.rail', z1c, z3c, LOOP_Y, INDI, 1.1);
  arrowD('a.loop.enter', z1c, LOOP_Y, ZT - 0.005, INDI, 1.1);
  shape('a.loop.exit', 'line', {
    x: z3c, y: LOOP_Y, w: 0, h: ZT - LOOP_Y,
    line: { color: INDI, width: 1.1, beginArrowType: 'triangle' },
  });
  shape('a.loop.chip', 'roundRect', {
    x: 1.85, y: LOOP_Y - 0.095, w: 2.60, h: 0.19, rectRadius: 0.09,
    fill: { color: WHITE }, line: { color: INDI, width: 0.75 },
  });
  T('a.loop.label', 'Top-M parents  #{S}_{t}  →  next iteration  (× #{T})',
    1.85, LOOP_Y - 0.055, 2.60, 0.13, { size: 6.8, color: INDI, align: 'center', bold: true });
}

/* =====================================================================
   R2 - three privacy zones
   ===================================================================== */
function zone(id, x, fill, accent, header) {
  shape(`${id}.frame`, 'roundRect', {
    x, y: ZT, w: ZW, h: ZB - ZT, rectRadius: 0.025,
    fill: { color: fill }, line: { color: RULE_L, width: 0.75 },
  });
  T(`${id}.header`, header, x + 0.06, HDR_Y, ZW - 0.12, 0.15,
    { size: 7.6, bold: true, color: accent, align: 'center', cs: 0.35 });
}
if (on('R2')) {
  zone('a.z1', Z1, TEAL_T, TEAL, 'PRIVACY-FREE');
  zone('a.z2', Z2, INDI_T, INDI, 'PRIVATE-DATA ACCESS');
  zone('a.z3', Z3, GREEN_T, GREEN, 'POST-PROCESSING');
}

/* =====================================================================
   R3 - three phase cards
   ===================================================================== */
function phaseCard(id, x, accent, iconFn, title, f1, f2, body, cost, fSize) {
  shape(`${id}.frame`, 'roundRect', {
    x, y: CY, w: CW, h: CH, rectRadius: 0.035,
    fill: { color: WHITE }, line: { color: CARD_BD, width: 0.75 },
  });
  shape(`${id}.iconDisc`, 'ellipse', {
    x: x + 0.09, y: CY + 0.085, w: 0.40, h: 0.40, fill: { color: accent }, line: noFill,
  });
  iconFn(`${id}.icon`, x + 0.29, CY + 0.285, 0.40, WHITE);
  T(`${id}.title`, title, x + 0.52, CY + 0.085, CW - 0.61, 0.40,
    { size: 7.8, bold: true, color: accent, align: 'center', valign: 'middle', lsm: 1.04 });
  if (f2) {
    T(`${id}.formula1`, f1, x + 0.07, CY + 0.545, CW - 0.14, 0.13, { size: fSize || 7.6, mono: true, align: 'center' });
    T(`${id}.formula2`, f2, x + 0.07, CY + 0.675, CW - 0.14, 0.13, { size: fSize || 7.6, mono: true, align: 'center' });
  } else {
    T(`${id}.formula1`, f1, x + 0.07, CY + 0.610, CW - 0.14, 0.13, { size: 7.6, mono: true, align: 'center' });
  }
  T(`${id}.body`, body, x + 0.10, CY + 0.830, CW - 0.20, 0.36, { size: 6.6, color: BODY, lsm: 0.96 });
  shape(`${id}.costPill`, 'roundRect', {
    x: x + 0.20, y: CY + 1.240, w: CW - 0.40, h: 0.20, rectRadius: 0.05,
    fill: { color: accent }, line: noFill,
  });
  T(`${id}.costLabel`, cost, x + 0.20, CY + 1.272, CW - 0.40, 0.15,
    { size: 6.4, bold: true, color: WHITE, align: 'center' });
}

if (on('R3')) {
  phaseCard('a.p1', C1, TEAL, iconDNA,
    'Phase 1\nLLM mutation',
    '#{P}_{t}  ←  Mutate-To-K(#{S}_{t−1}),   |#{P}_{t}| = #{K}', null,
    'Builds a fixed K-candidate population from selected parents; never reads the private set @{𝒟}.',
    '0 additional privacy loss');

  phaseCard('a.p2', C2, INDI, iconBell,
    'Phase 2\nDP scoring',
    '#{s}_{p}(#{B}) = #{b}^{−1} Σ_{i∈B} clip(#{u}_{i})',
    'release  #{s}_{p} + @{𝒩}(0, (#{zC}_{clip}/#{b})²)',
    'Each candidate releases one clipped, sampled-Gaussian score from @{𝒟}.',
    '≤ #{TK} score releases total', 7.4);

  phaseCard('a.p3', C3, GREEN, iconFunnel,
    'Phase 3\nPost-process & select',
    'Gumbel-smoothed or deterministic',
    'Top-M(privatized scores)',
    'Top-M uses only released scores; both options are post-processing.',
    '0 additional privacy loss', 7.2);

  arrowR('a.flow.p1p2', C1 + CW + 0.02, C2 - 0.02, CY + CH / 2, MUTE, 1.5);
  arrowR('a.flow.p2p3', C2 + CW + 0.02, C3 - 0.02, CY + CH / 2, MUTE, 1.5);
}

/* =====================================================================
   R4 - per-zone bottom bands: who touches the private set
   ===================================================================== */
if (on('R4')) {
  const midY = BAND_Y + BAND_H / 2;

  iconNoAccess('a.z1.noAccess', Z1 + 0.28, midY, 0.28, TEAL);
  T('a.z1.note', 'Mutation never\nreads @{𝒟}',
    Z1 + 0.46, BAND_Y, ZW - 0.54, BAND_H, { size: 6.8, bold: true, color: TEAL, lsm: 1.02, valign: 'middle' });

  shape('a.z2.dataset', 'can', {
    x: Z2 + 0.20, y: BAND_Y - 0.005, w: 0.28, h: 0.32,
    fill: { color: INDI }, line: { color: INDI, width: 1 },
  });
  T('a.z2.note', '@{𝒟}: !{private} optimization\nset (#{n} records)',
    Z2 + 0.56, BAND_Y, ZW - 0.64, BAND_H, { size: 6.8, color: INDI, lsm: 1.02, valign: 'middle' });
  arrowU('a.z2.feed', Z2 + 0.34, CY + CH + 0.020, BAND_Y + 0.010, INDI, 1.2);

  iconNoAccess('a.z3.noAccess', Z3 + 0.28, midY, 0.28, GREEN);
  T('a.z3.note', 'Selection reads only\nprivatized scores',
    Z3 + 0.46, BAND_Y, ZW - 0.54, BAND_H, { size: 6.8, bold: true, color: GREEN, lsm: 1.02, valign: 'middle' });
}

/* =====================================================================
   R5 - privacy accounting statement
   ===================================================================== */
if (on('R5')) {
  shape('a.acct.frame', 'roundRect', {
    x: 0.50, y: ACC_Y, w: W - 1.00, h: ACC_H, rectRadius: 0.05,
    fill: { color: WHITE }, line: { color: RULE_L, width: 0.75 },
  });
  T('a.acct.line1', '!{Privacy accounting:}  at most #{TK} sampled-Gaussian score releases compose in one',
    0.57, ACC_Y + 0.075, W - 1.14, 0.14, { size: 7.2, color: INDI, align: 'center' });
  T('a.acct.line2', 'RDP accountant  ⟹  overall (ε, δ)-DP.   Mutation and selection add no privacy loss.',
    0.57, ACC_Y + 0.235, W - 1.14, 0.14, { size: 7.2, color: INDI, align: 'center' });
}

/* =====================================================================
   R6 - panel (b) native comparison table
   ===================================================================== */
if (on('R6')) {
  T('b.title', '(b)   ${DP-ES} vs. %{DP-OPT}: mechanism and observed stability',
    MX, B_TITLE_Y, W - 2 * MX, 0.17, { size: 9, bold: true, color: INK });

  const NOB = { type: 'none' };
  const bd = (top, bottom) => [top, NOB, bottom, NOB];
  const thin = { type: 'solid', pt: 0.5, color: RULE_L };
  const thick = { type: 'solid', pt: 1.0, color: INK };
  const cell = (runs, o = {}) => ({ text: runs, options: { valign: 'middle', margin: [1, 3, 1, 3], ...o } });
  const rr = (str, o = {}) => rt(str, { fontFace: SANS, fontSize: o.size || 6.8, color: o.color || INK, bold: !!o.bold });

  const rows = [[
    cell(rr('Aspect', { size: 7.4, bold: true }), { align: 'center', border: bd(thick, thick) }),
    cell(rr('DP-ES (ours)', { size: 7.4, bold: true, color: TEAL }), { align: 'center', border: bd(thick, thick) }),
    cell(rr('DP-OPT', { size: 7.4, bold: true, color: BRICK }), { align: 'center', border: bd(thick, thick) }),
  ]];

  const body = [
    ['Search unit', 'Population of complete prompts', 'Greedy token-by-token construction'],
    ['Private-data access', 'Sampled utility scoring only', 'Private histogram queries during construction'],
    ['Selection / recovery', 'Top-M on privatized scores; alternatives persist', 'Private token releases; no token-level backtracking'],
  ];
  body.forEach(([a, e, o], i) => {
    const last = i === body.length - 1;
    rows.push([
      cell(rr(a, { bold: true, size: 7 }), { align: 'center', border: bd(NOB, last ? thick : thin) }),
      cell(rr(e), { align: 'center', border: bd(NOB, last ? thick : thin) }),
      cell(rr(o), { align: 'center', border: bd(NOB, last ? thick : thin) }),
    ]);
  });

  rows.push([
    cell(rr('GSM8K (30 runs)', { bold: true, size: 7 }), { align: 'center', border: bd(NOB, thick) }),
    cell(rr('88.1 ± 3.2%', { bold: true, size: 8, color: TEAL }),
      { align: 'center', border: bd(NOB, thick), fill: { color: TEAL_T } }),
    cell(rr('49.5 ± 28.5%', { bold: true, size: 8, color: BRICK }),
      { align: 'center', border: bd(NOB, thick), fill: { color: BRICK_T } }),
  ]);

  s.addTable(rows, {
    objectName: 'b.table', x: MX, y: TBL_Y, w: W - 2 * MX,
    colW: [1.18, 2.44, 2.44], rowH: [0.16, 0.19, 0.19, 0.19, 0.22],
    border: { type: 'none' }, autoPage: false,
  });
}

pres.writeFile({ fileName: 'DPES_Fig1_v2.pptx' })
  .then(() => console.log('regions:', REGIONS.join(','), '| canvas', W, 'x', H));
