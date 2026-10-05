/* =====================================================================
   DP-ES - EMNLP 2026 conference talk (16:9, 13.33 x 7.5 in)
   Every number on the slides is taken from the camera-ready paper in
   ../paper (main text, tables and appendix).

   Build:  NODE_PATH=<dir with pptxgenjs, react, react-dom, react-icons,
           sharp> node build_slides.js
   Output: DP-ES_EMNLP2026_Talk.pptx (next to this script)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');

const OUT = path.join(__dirname, 'DP-ES_EMNLP2026_Talk.pptx');
const FIG = path.join(__dirname, '..', 'paper', 'figures');

/* ---------- theme ------------------------------------------------------ */
const THEME = {
  name: 'DP-ES Ivy',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1B1B1B',     // body text
    lt1: 'FFFFFF',
    dk2: '173A2C',     // deep ivy: titles, dark slides
    lt2: 'EEF3EF',     // pale ivy: card tint
    accent1: '2E6B4F', // ivy green: DP-ES, privacy-free steps
    accent2: 'A6192E', // crimson: DP-OPT, leakage
    accent3: '6E747C', // neutral grey: Non-DP reference, captions
    accent4: 'B07D1A', // ochre: highlights
    accent5: '35587A', // slate blue: private-data access
    accent6: '9DC0AC', // sage: accents on dark slides
    hlink: '2E6B4F',
    folHlink: '5B3A6E',
  },
};
const HEX = THEME.colors;
const GRID = 'D9DEDB';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
pres.author = 'Ziniu Liu, Aiping Li, Yue Han, Han Yu, Junjian Zhang, Dong Zhu, Changjian Li, Shiqiang Zhang';
pres.title = 'DP-ES: Differentially Private Evolution Strategies for Prompt Optimization';
pres.subject = 'EMNLP 2026 main conference talk';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const HEAD = '+mj-lt'; // theme heading font (Cambria)
const MONO = 'Courier New';

const W = 13.333;
const MX = 0.6;               // side margin
const CW = W - 2 * MX;        // content width 12.133
const COL3 = (CW - 2 * 0.4) / 3; // three columns with 0.4 in gaps

/* ---------- layouts ---------------------------------------------------- */
const FOOTER = 'Liu et al.  ·  DP-ES  ·  EMNLP 2026';

pres.defineSlideMaster({
  title: 'DPES_TITLE',
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.8, y: 0.85, w: 8.0, h: 0.4,
      fontSize: 14, bold: true, color: C.accent6, charSpacing: 2, margin: 0, valign: 'top' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 1.35, w: 8.0, h: 2.3,
      fontFace: HEAD, fontSize: 40, bold: true, color: C.background1, margin: 0, valign: 'top', align: 'left' }, text: '' } },
  ],
});

pres.defineSlideMaster({
  title: 'DPES_CONTENT',
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: MX, y: 0.36, w: 6.0, h: 0.32,
      fontSize: 12, bold: true, color: C.accent1, charSpacing: 1.5, margin: 0, valign: 'top' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.7, w: CW, h: 0.7,
      fontFace: HEAD, fontSize: 30, bold: true, color: C.text2, margin: 0, valign: 'top', align: 'left' }, text: '' } },
    { text: { text: FOOTER, options: { x: MX, y: 7.0, w: 6.0, h: 0.3, fontSize: 10, color: C.accent3, margin: 0, valign: 'middle' } } },
  ],
  slideNumber: { x: W - MX - 0.8, y: 7.0, w: 0.8, h: 0.3, fontSize: 10, color: C.accent3, align: 'right', margin: 0 },
});

pres.defineSlideMaster({
  title: 'DPES_DARK',
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: MX, y: 0.36, w: 6.0, h: 0.32,
      fontSize: 12, bold: true, color: C.accent6, charSpacing: 1.5, margin: 0, valign: 'top' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.7, w: CW, h: 0.7,
      fontFace: HEAD, fontSize: 30, bold: true, color: C.background1, margin: 0, valign: 'top', align: 'left' }, text: '' } },
    { text: { text: FOOTER, options: { x: MX, y: 7.0, w: 6.0, h: 0.3, fontSize: 10, color: C.accent6, margin: 0, valign: 'middle' } } },
  ],
  slideNumber: { x: W - MX - 0.8, y: 7.0, w: 0.8, h: 0.3, fontSize: 10, color: C.accent6, align: 'right', margin: 0 },
});

/* ---------- helpers ---------------------------------------------------- */
// Rich text: _{sub} ^{sup} /{italic} !{bold} %{DP-ES green bold} &{DP-OPT crimson bold}
// @{monospace}. Inside a marker, «» stand for literal braces.
function rt(str, base = {}) {
  const out = [];
  const re = /([_^/!%&@])\{([^}]*)\}/g;
  const lit = (s) => s.replace(/«/g, '{').replace(/»/g, '}');
  const push = (t, extra = {}) => {
    const parts = String(t).split('\n');
    parts.forEach((p, i) => {
      const last = i === parts.length - 1;
      if (p === '' && last) return;
      out.push({ text: lit(p), options: { ...base, ...extra, ...(last ? {} : { breakLine: true }) } });
    });
  };
  let last = 0, m;
  while ((m = re.exec(str))) {
    if (m.index > last) push(str.slice(last, m.index));
    const [, k, v] = m;
    if (k === '_') push(v, { subscript: true });
    else if (k === '^') push(v, { superscript: true });
    else if (k === '/') push(v, { italic: true });
    else if (k === '!') push(v, { bold: true });
    else if (k === '%') push(v, { bold: true, color: C.accent1 });
    else if (k === '&') push(v, { bold: true, color: C.accent2 });
    else if (k === '@') push(v, { fontFace: MONO });
    last = re.lastIndex;
  }
  if (last < str.length) push(str.slice(last));
  return out;
}

function text(slide, str, opts) {
  const runs = typeof str === 'string' ? rt(str) : str;
  slide.addText(runs, { margin: 0, valign: 'top', fontSize: 15, color: C.text1, isTextBox: true, ...opts });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.08,
    fill: opts.fill || { color: C.background2 },
    line: opts.line || { type: 'none' },
    objectName: opts.name,
  });
}

function pill(slide, label, x, y, w, color, opts = {}) {
  slide.addText(label, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.14, x, y, w, h: opts.h || 0.32,
    fill: { color }, color: opts.textColor || C.background1, fontSize: opts.fontSize || 12, bold: true,
    align: 'center', valign: 'middle', margin: 0, isTextBox: true,
  });
}

function line(slide, x1, y1, x2, y2, lineOpts) {
  slide.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipV: (y2 < y1) !== (x2 < x1), line: lineOpts,
  });
}

const iconCache = {};
async function iconPng(name, hex) {
  const key = `${name}-${hex}`;
  if (!iconCache[key]) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: `#${hex}`, size: 256 }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    iconCache[key] = 'image/png;base64,' + buf.toString('base64');
  }
  return iconCache[key];
}

async function icon(slide, name, x, y, size, hex) {
  slide.addImage({ data: await iconPng(name, hex), x, y, w: size, h: size, altText: name.replace(/^Fa/, '') + ' icon' });
}

// icon centred in a filled circle (the deck's recurring motif)
async function badge(slide, name, x, y, d, circle, iconHex = HEX.lt1) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: circle }, line: { type: 'none' } });
  const s = d * 0.5;
  await icon(slide, name, x + (d - s) / 2, y + (d - s) / 2, s, iconHex);
}

function numBadge(slide, label, x, y, d, circle, fontSize = 16) {
  slide.addText(label, {
    shape: pres.shapes.OVAL, x, y, w: d, h: d, fill: { color: circle }, line: { type: 'none' },
    fontFace: HEAD, fontSize, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, isTextBox: true,
  });
}

// Beamer-style section navigation, top right of content slides
const SECTIONS = ['Motivation', 'Diagnosis', 'Method', 'Results', 'Scope'];
function nav(slide, current) {
  const runs = [];
  SECTIONS.forEach((s, i) => {
    runs.push({ text: s, options: { bold: s === current, color: s === current ? C.accent1 : C.accent3 } });
    if (i < SECTIONS.length - 1) runs.push({ text: '   ·   ', options: { color: C.accent3 } });
  });
  slide.addText(runs, { x: W - MX - 6.0, y: 0.36, w: 6.0, h: 0.32, fontSize: 11, align: 'right', valign: 'top', margin: 0, isTextBox: true });
}

function content(section, kicker, title, navSection) {
  const s = pres.addSlide({ masterName: 'DPES_CONTENT', sectionTitle: section });
  s.addText(kicker, { placeholder: 'kicker' });
  s.addText(typeof title === 'string' ? rt(title) : title, { placeholder: 'title' });
  if (navSection) nav(s, navSection);
  return s;
}

const chartText = { catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt',
  legendFontFace: '+mn-lt', titleFontFace: '+mn-lt', catAxisLabelColor: '444444', valAxisLabelColor: '444444',
  dataLabelColor: '333333', legendColor: '333333' };

/* ======================================================================
   SLIDES
   ====================================================================== */
async function build() {
  /* ---------------- 1. Title ---------------- */
  pres.addSection({ title: 'Opening' });
  {
    const s = pres.addSlide({ masterName: 'DPES_TITLE', sectionTitle: 'Opening' });
    s.addText('EMNLP 2026  ·  MAIN CONFERENCE', { placeholder: 'kicker' });
    s.addText('DP-ES: Differentially Private Evolution Strategies for Prompt Optimization', { placeholder: 'title' });
    const au = (n, sup) => [{ text: n, options: {} }, { text: sup, options: { superscript: true } }];
    const authors = [
      ['Ziniu Liu', '1'], ['Aiping Li', '1,*'], ['Yue Han', '1'], ['Han Yu', '1'],
      ['Junjian Zhang', '1'], ['Dong Zhu', '1'], ['Changjian Li', '1'], ['Shiqiang Zhang', '2'],
    ];
    const runs = [];
    authors.forEach(([n, sup], i) => { runs.push(...au(n, sup)); if (i < authors.length - 1) runs.push({ text: ',  ', options: {} }); });
    s.addText(runs, { x: 0.8, y: 3.85, w: 8.0, h: 0.85, fontSize: 18, color: C.background1, margin: 0, valign: 'top', isTextBox: true });
    s.addText([
      { text: '1', options: { superscript: true } }, { text: ' National University of Defense Technology', options: { breakLine: true } },
      { text: '2', options: { superscript: true } }, { text: ' CRRC Zhuzhou Electric Locomotive Research Institute Co., Ltd.,', options: { breakLine: true } },
      { text: '   China Academy of Railway Sciences', options: { breakLine: true } },
      { text: '*', options: { superscript: true } }, { text: ' Corresponding author: liaiping@nudt.edu.cn', options: {} },
    ], { x: 0.8, y: 4.8, w: 8.0, h: 1.2, fontSize: 13, color: C.background2, margin: 0, valign: 'top', paraSpaceAfter: 2, isTextBox: true });
    await icon(s, 'FaGithub', 0.8, 6.42, 0.3, HEX.accent6);
    s.addText('github.com/StephCpa/dp-es', { x: 1.2, y: 6.4, w: 5.0, h: 0.34, fontSize: 14, color: C.accent6, margin: 0, valign: 'middle', isTextBox: true,
      hyperlink: { url: 'https://github.com/StephCpa/dp-es' } });

    // motif: K = 6 candidates per round, M = 2 parents kept, T = 3 rounds
    const xs = [9.65, 10.95, 12.25], y0 = 1.55, dy = 0.62, d = 0.3;
    const sel = [[1, 4], [2, 3], [2]];
    const cy = (i) => y0 + i * dy + d / 2;
    for (let g = 0; g < 2; g++) {
      for (const p of sel[g]) for (let j = 0; j < 6; j++) {
        line(s, xs[g] + d / 2, cy(p), xs[g + 1] - d / 2 + 0.02, cy(j), { color: HEX.accent6, width: 0.75, transparency: 45 });
      }
    }
    for (let g = 0; g < 3; g++) for (let i = 0; i < 6; i++) {
      const chosen = sel[g].includes(i);
      s.addShape(pres.shapes.OVAL, { x: xs[g] - d / 2, y: y0 + i * dy, w: d, h: d,
        fill: chosen ? { color: C.accent4 } : { color: C.text2 }, line: chosen ? { type: 'none' } : { color: C.accent6, width: 1.25 } });
    }
    s.addText(rt('/{p}^{*}'), { x: xs[2] + 0.22, y: cy(2) - 0.2, w: 0.5, h: 0.4, fontFace: HEAD, fontSize: 18, color: C.accent4, margin: 0, valign: 'middle', isTextBox: true });
    xs.forEach((x, g) => s.addText(rt(`/{t} = ${g + 1}`), { x: x - 0.5, y: 5.35, w: 1.0, h: 0.3, fontFace: HEAD, fontSize: 13, color: C.accent6, align: 'center', margin: 0, isTextBox: true }));
    s.addText(rt('/{K} = 6 candidates  ·  /{M} = 2 parents  ·  /{T} = 3 rounds'), { x: 8.95, y: 5.75, w: 4.0, h: 0.3, fontSize: 12, color: C.accent6, align: 'center', margin: 0, isTextBox: true });
    s.addNotes(
      'Hello everyone. I am presenting DP-ES, Differentially Private Evolution Strategies for Prompt Optimization, joint work with colleagues at the National University of Defense Technology and CRRC Zhuzhou. ' +
      'In one sentence: when we optimize prompts on private data under differential privacy, the structure of the search matters. Token-by-token private construction is fragile; evolving a population of complete prompts, and spending privacy only on noisy scoring, is far more robust. ' +
      'The graphic on the right is the method in miniature: six candidate prompts per round, two parents kept, three rounds.');
  }

  /* ---------------- 2. Outline ---------------- */
  {
    const s = content('Opening', 'OVERVIEW', 'Outline');
    const items = [
      ['Motivation', 'Why prompt optimization on sensitive data needs formal privacy'],
      ['Diagnosis', 'Why token-level DP prompt construction is unstable under tight budgets'],
      ['Method', 'DP-ES: privacy-free mutation, private scoring, post-processed selection'],
      ['Results', 'Accuracy, stability, efficiency, ablations, memorization stress test'],
      ['Scope', 'What the evidence does and does not establish'],
    ];
    items.forEach(([h, d], i) => {
      const y = 1.75 + i * 0.98;
      numBadge(s, String(i + 1), MX, y + 0.05, 0.55, C.accent1, 18);
      text(s, h, { x: MX + 0.8, y, w: 6.2, h: 0.4, fontFace: HEAD, fontSize: 20, bold: true, color: C.text2 });
      text(s, d, { x: MX + 0.8, y: y + 0.42, w: 6.2, h: 0.4, fontSize: 15, color: C.accent3 });
    });
    card(s, 8.1, 1.75, W - MX - 8.1, 4.75);
    text(s, 'THE TALK IN ONE SENTENCE', { x: 8.45, y: 2.05, w: 4.0, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1.5 });
    text(s, 'Evolving a population of complete prompts — instead of building one prompt token by token — makes differentially private prompt optimization markedly more robust at ε ≤ 1.',
      { x: 8.45, y: 2.5, w: 3.95, h: 2.4, fontFace: HEAD, fontSize: 20, italic: true, color: C.text2, lineSpacingMultiple: 1.05 });
    const stats = [['88.1%', 'GSM8K'], ['~9×', 'lower std'], ['2.5×', 'faster']];
    stats.forEach(([v, l], i) => {
      const x = 8.45 + i * 1.35;
      text(s, v, { x, y: 5.15, w: 1.3, h: 0.5, fontFace: HEAD, fontSize: 24, bold: true, color: C.accent1 });
      text(s, l, { x, y: 5.68, w: 1.3, h: 0.3, fontSize: 12, color: C.accent3 });
    });
    s.addNotes(
      'The talk has five parts. First, why prompt optimization on sensitive data needs formal privacy. Second, a diagnosis of why the main existing approach, token-level private construction as in DP-OPT, is unstable under tight budgets. ' +
      'Third, our method, DP-ES. Fourth, results on accuracy, stability, efficiency, ablations and a memorization stress test. And finally, an explicit statement of scope: what our evidence does and does not establish.');
  }

  /* ---------------- 3. Motivation ---------------- */
  pres.addSection({ title: 'Motivation' });
  {
    const s = content('Motivation', 'MOTIVATION', 'Prompt optimizers can memorize private data', 'Motivation');
    card(s, MX, 1.75, 5.5, 4.2, { fill: { color: C.accent2, transparency: 92 } });
    text(s, 'WHAT A NAIVE OPTIMIZER CAN OUTPUT', { x: MX + 0.4, y: 2.05, w: 4.8, h: 0.3, fontSize: 12, bold: true, color: C.accent2, charSpacing: 1.5 });
    text(s, '“Remember how patient #12847 had atrial fibrillation …”', { x: MX + 0.4, y: 2.6, w: 4.7, h: 1.6, fontFace: HEAD, fontSize: 26, italic: true, color: C.text2 });
    text(s, 'An illustrative optimized prompt that copies a record from the optimization set.',
      { x: MX + 0.4, y: 3.85, w: 4.7, h: 0.8, fontSize: 15, color: C.text1 });
    await icon(s, 'FaUserSecret', MX + 0.4, 4.87, 0.34, HEX.accent2);
    text(s, 'Membership-inference and extraction attacks on LLMs make this a practical risk (Wang et al., 2023; Fu et al., 2023; Shanmugarasa et al., 2025).',
      { x: MX + 0.95, y: 4.8, w: 4.2, h: 1.0, fontSize: 13, color: C.accent3 });
    const rows = [
      ['FaNotesMedical', 'Sensitive optimization data', 'Optimizers such as APE, OPRO and TextGrad tune prompts on task data — e.g., patient records or financial logs — with no privacy guarantee.'],
      ['FaCloud', 'Black-box LLM APIs', 'Frontier models are API-only, so weight-based private training (DP-SGD, DP-LoRA) does not apply.'],
      ['FaShieldAlt', 'What we need', 'Formal record-level (ε, δ)-DP for the released prompt — and an optimizer that stays robust under DP noise.'],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [ic, h, d] = rows[i];
      const y = 1.8 + i * 1.45;
      await badge(s, ic, 6.7, y, 0.7, i === 2 ? HEX.accent1 : HEX.dk2);
      text(s, h, { x: 7.65, y: y - 0.02, w: 5.08, h: 0.4, fontFace: HEAD, fontSize: 19, bold: true, color: C.text2 });
      text(s, d, { x: 7.65, y: y + 0.4, w: 5.08, h: 1.0, fontSize: 15 });
    }
    s.addNotes(
      'Automatic prompt optimization works well, but it needs task data, and in many applications that data is sensitive: patient records, financial logs. An optimizer can memorize what it sees; in the worst case it returns a prompt like the one on the left, which literally contains a patient record. ' +
      'Model-training defenses such as DP-SGD or DP-LoRA need access to weights, which we do not have with API-only models. So we need formal, record-level differential privacy for the released prompt, and, crucially, an optimizer that remains robust under the noise that DP introduces. That robustness question is the focus of this paper.');
  }

  /* ---------------- 4. Problem setting ---------------- */
  {
    const s = content('Motivation', 'PROBLEM SETTING', 'Goal: optimize a discrete prompt under DP', 'Motivation');
    card(s, MX, 1.75, 5.7, 4.4);
    const lx = MX + 0.35, lw = 5.0;
    text(s, 'OBJECTIVE', { x: lx, y: 2.0, w: lw, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1.5 });
    text(s, 'Private dataset /{D} = {(/{x}_{i}, /{y}_{i})}_{i=1}^{n}, prompt space /{P}:', { x: lx, y: 2.35, w: lw, h: 0.35, fontSize: 15 });
    text(s, '/{p}^{*} = arg max_{p ∈ P} /{f}(/{p}, /{D})', { x: lx, y: 2.8, w: lw, h: 0.5, fontFace: HEAD, fontSize: 22, align: 'center', color: C.text2 });
    text(s, 'PRIVACY REQUIREMENT', { x: lx, y: 3.55, w: lw, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1.5 });
    text(s, 'The optimizer /{M} is (ε, δ)-DP if, for all neighbouring datasets /{D} ~ /{D}′ and all sets /{S},', { x: lx, y: 3.9, w: lw, h: 0.6, fontSize: 15 });
    text(s, 'Pr[/{M}(/{D}) ∈ /{S}] ≤ /{e}^{ε} · Pr[/{M}(/{D}′) ∈ /{S}] + δ', { x: lx, y: 4.6, w: lw, h: 0.5, fontFace: HEAD, fontSize: 21, align: 'center', color: C.text2 });
    text(s, 'Privacy unit: one record (/{x}_{i}, /{y}_{i}). Released object: the final prompt. The LLM is a black box reached through an API.',
      { x: lx, y: 5.3, w: lw, h: 0.75, fontSize: 15 });

    const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align: 'center' } });
    const yes = { text: '✓', options: { color: C.accent1, bold: true, align: 'center' } };
    const no = { text: '✗', options: { color: C.accent2, bold: true, align: 'center' } };
    const row = (m, p, d, mech, hl) => [
      { text: m, options: { bold: !!hl, color: hl ? C.accent1 : C.text1, fill: hl ? { color: C.background2 } : undefined } },
      { ...p, options: { ...p.options, fill: hl ? { color: C.background2 } : undefined } },
      { ...d, options: { ...d.options, fill: hl ? { color: C.background2 } : undefined } },
      { text: mech, options: { bold: !!hl, color: hl ? C.accent1 : C.text1, fill: hl ? { color: C.background2 } : undefined } },
    ];
    s.addTable([
      [{ ...hdr('Method'), options: { ...hdr('Method').options, align: 'left' } }, hdr('Formal DP'), hdr('Discrete'), { ...hdr('Mechanism'), options: { ...hdr('Mechanism').options, align: 'left' } }],
      row('TextGrad', no, yes, 'LLM “gradients”'),
      row('OPRO', no, yes, 'LLM scoring'),
      row('EvoPrompt', no, yes, 'Evolutionary search'),
      row('PromptBreeder', no, yes, 'Evolutionary search'),
      row('DP-SGD', yes, no, 'Gaussian noise'),
      row('DP-OPT', yes, yes, 'Histogram + exp. mech.'),
      row('DP-ES (ours)', yes, yes, 'Evolution + Gaussian', true),
    ], { x: 6.75, y: 1.75, w: W - MX - 6.75, colW: [1.65, 1.1, 0.95, 2.283], rowH: 0.46, fontSize: 14, color: C.text1,
      border: { type: 'solid', pt: 0.75, color: GRID }, valign: 'middle', margin: [0.03, 0.08, 0.03, 0.08] });
    text(s, 'DP-ES adds formal record-level DP to evolutionary optimization over discrete prompts.', { x: 6.75, y: 5.6, w: W - MX - 6.75, h: 0.6, fontSize: 12, italic: true, color: C.accent3 });
    s.addNotes(
      'Formally, we have a private dataset of input-output pairs and want the prompt that maximizes task performance, for example accuracy. The constraint is (epsilon, delta)-differential privacy with respect to that dataset: changing one record may change the distribution of the released prompt only by a factor e to the epsilon, plus delta. ' +
      'The table positions us. Non-private prompt optimizers, including evolutionary ones like EvoPrompt and PromptBreeder, give no guarantee. DP-SGD gives a guarantee but needs continuous parameters. DP-OPT is the closest prior work: private and discrete, using token histograms with the exponential mechanism. DP-ES is private and discrete, using evolution plus Gaussian scoring.');
  }

  /* ---------------- 5. DP-OPT instability ---------------- */
  pres.addSection({ title: 'Diagnosis' });
  {
    const s = content('Diagnosis', 'DIAGNOSIS', 'DP-OPT is unstable on multi-step reasoning', 'Diagnosis');
    const px0 = 2.75, px1 = 8.15, sc = (px1 - px0) / 100, X = (v) => px0 + v * sc;
    const gy0 = 1.95, gy1 = 5.55;
    [0, 20, 40, 60, 80, 100].forEach((v) => {
      line(s, X(v), gy0, X(v), gy1, { color: GRID, width: 0.75 });
      text(s, String(v), { x: X(v) - 0.4, y: gy1 + 0.08, w: 0.8, h: 0.3, fontSize: 12, color: C.accent3, align: 'center' });
    });
    text(s, 'GSM8K accuracy (%), mean ± 1 std over 30 runs', { x: px0, y: gy1 + 0.45, w: px1 - px0, h: 0.3, fontSize: 12, color: C.accent3, align: 'center' });
    const rows = [
      ['DP-OPT', 'ε = 1', 49.5, 28.5, C.accent2],
      ['DP-ES (ours)', 'ε ≤ 0.71', 88.1, 3.2, C.accent1],
      ['Non-DP', 'TextGrad', 95.0, 0.9, C.accent3],
    ];
    rows.forEach(([name, sub, m, sd, col], i) => {
      const yc = 2.75 + i * 1.15;
      text(s, name, { x: MX, y: yc - 0.3, w: 1.95, h: 0.35, fontSize: 17, bold: true, color: col, align: 'right' });
      text(s, sub, { x: MX, y: yc + 0.04, w: 1.95, h: 0.3, fontSize: 12, color: C.accent3, align: 'right' });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X(m - sd), y: yc - 0.13, w: Math.max(2 * sd * sc, 0.08), h: 0.26, rectRadius: 0.12,
        fill: { color: col, transparency: 65 }, line: { type: 'none' } });
      s.addShape(pres.shapes.OVAL, { x: X(m) - 0.13, y: yc - 0.13, w: 0.26, h: 0.26, fill: { color: col }, line: { color: C.background1, width: 1.5 } });
      text(s, `${m.toFixed(1)} ± ${sd.toFixed(1)}`, { x: X(m) - 0.8, y: yc - 0.55, w: 1.6, h: 0.32, fontSize: 15, bold: true, color: col, align: 'center' });
    });
    const rx = 8.95, rw = W - MX - rx;
    card(s, rx, 1.75, rw, 4.75);
    text(s, '±28.5 pp', { x: rx + 0.35, y: 2.0, w: rw - 0.7, h: 0.85, fontFace: HEAD, fontSize: 48, bold: true, color: C.accent2 });
    text(s, 'run-to-run standard deviation of DP-OPT on GSM8K: one run may succeed, the next may collapse.', { x: rx + 0.35, y: 2.9, w: rw - 0.7, h: 0.95, fontSize: 15 });
    text(s, '~9×', { x: rx + 0.35, y: 4.0, w: rw - 0.7, h: 0.8, fontFace: HEAD, fontSize: 44, bold: true, color: C.accent1 });
    text(s, 'lower standard deviation with DP-ES (3.2 pp), at a tighter privacy bound.', { x: rx + 0.35, y: 4.85, w: rw - 0.7, h: 0.8, fontSize: 15 });
    text(s, 'DP-OPT: black-box adaptation of Hong et al. (ICLR 2024); LLM: DeepSeek-V3.2.', { x: rx + 0.35, y: 5.8, w: rw - 0.7, h: 0.5, fontSize: 11, italic: true, color: C.accent3 });
    s.addNotes(
      'We start with a diagnosis. We ran our black-box adaptation of DP-OPT thirty times on GSM8K at epsilon equal to one. Mean accuracy is 49.5 percent, but the standard deviation is 28.5 points: the band covers roughly 21 to 78 percent. Some runs work well; others collapse. ' +
      'For reference, DP-ES reaches 88.1 plus or minus 3.2 percent under a tighter bound, about nine times lower standard deviation, and the non-private TextGrad reference is at 95. Note that we report the full distribution rather than imposing a post-hoc threshold to label failures. The question is: where does this variance come from?');
  }

  /* ---------------- 6. Trajectory ---------------- */
  {
    const s = content('Diagnosis', 'DIAGNOSIS', 'A logged DP-OPT run drifts from its template', 'Diagnosis');
    const P = [
      ['Iteration 0  ·  selected', 'Carefully solve the following math question and provide a clear explanation of your reasoning: %{«question»}', true],
      ['Iteration 1  ·  selected', 'Solve the math problem step-by-step, ensuring each step is clearly explained and justified before proceeding to the next.', false],
      ['Iteration 2  ·  selected (final)', 'Present a structured solution by enumerating each step, explaining the purpose of that step, and confirming its correctness before continuing.', false],
    ];
    const cw = 7.6;
    P.forEach(([h, p, ok], i) => {
      const y = 1.75 + i * 1.6;
      card(s, MX, y, cw, 1.3, { fill: { color: ok ? C.accent1 : C.accent2, transparency: 92 } });
      text(s, h, { x: MX + 0.3, y: y + 0.15, w: 4.5, h: 0.3, fontSize: 13, bold: true, color: C.text2 });
      pill(s, ok ? '{question} kept' : '{question} lost', MX + cw - 2.05, y + 0.13, 1.8, ok ? C.accent1 : C.accent2);
      text(s, rt(p, { italic: true }), { x: MX + 0.3, y: y + 0.52, w: cw - 0.6, h: 0.7, fontSize: 15 });
      if (i < 2) {
        s.addShape(pres.shapes.LINE, { x: MX + 0.6, y: y + 1.32, w: 0, h: 0.26, line: { color: HEX.accent3, width: 1.5, endArrowType: 'triangle' } });
      }
    });
    const rx = 8.75, rw = W - MX - rx;
    text(s, '21 / 33', { x: rx, y: 1.7, w: rw, h: 0.8, fontFace: HEAD, fontSize: 44, bold: true, color: C.accent2 });
    text(s, 'candidate prompts (64%) omit the !{{question}} placeholder during search', { x: rx, y: 2.5, w: rw, h: 0.7, fontSize: 15 });
    text(s, '2 / 3', { x: rx, y: 3.3, w: rw, h: 0.8, fontFace: HEAD, fontSize: 44, bold: true, color: C.accent2 });
    text(s, 'selected prompts omit it in this run', { x: rx, y: 4.1, w: rw, h: 0.4, fontSize: 15 });
    card(s, rx, 4.75, rw, 1.75);
    await icon(s, 'FaInfoCircle', rx + 0.25, 4.95, 0.3, HEX.accent3);
    text(s, '!{Caveat.} This seed still scores 91%: the harness appends the question when the placeholder is missing. We read omission as structural drift, not as a failure label.',
      { x: rx + 0.7, y: 4.92, w: rw - 0.95, h: 1.45, fontSize: 14 });
    s.addNotes(
      'To see the mechanism, here is a real logged DP-OPT trajectory on GSM8K, seed 42. At iteration 0 the selected prompt contains the question placeholder. By iterations 1 and 2 the selected prompts are fluent instructions, but the placeholder has disappeared. ' +
      'Across the whole search, 21 of 33 candidates omit it. We are careful here: this particular run still reaches 91 percent, because our harness appends the question when the placeholder is missing. So we do not count this as a failure. It is evidence of template drift: token-level construction has no global view of what the prompt must contain.');
  }

  /* ---------------- 7. Root causes ---------------- */
  {
    const s = content('Diagnosis', 'DIAGNOSIS', 'Three structural sources of instability', 'Diagnosis');
    const cols = [
      ['FaLowVision', 'Token-level myopia', 'Prompts are built greedily, one token at a time, by voting over private histograms. Nothing checks global coherence, so placeholders can be dropped and text drifts toward generic instructions.'],
      ['FaUndoAlt', 'No backtracking', 'Once a token is released it cannot be revised. An early poor choice is locked in for the rest of construction.'],
      ['FaRandom', 'Noise-sensitive selection', 'DP noise can reverse the ranking of candidates with similar utility, and small evaluation samples (10–20 examples) add variance. With no recovery path, one inversion can redirect the search.'],
    ];
    for (let i = 0; i < 3; i++) {
      const [ic, h, d] = cols[i];
      const x = MX + i * (COL3 + 0.4);
      card(s, x, 1.75, COL3, 3.55);
      await badge(s, ic, x + 0.35, 2.05, 0.75, HEX.accent2);
      text(s, h, { x: x + 0.35, y: 2.98, w: COL3 - 0.7, h: 0.4, fontFace: HEAD, fontSize: 20, bold: true, color: C.text2 });
      text(s, d, { x: x + 0.35, y: 3.45, w: COL3 - 0.7, h: 1.75, fontSize: 15 });
    }
    card(s, MX, 5.6, CW, 0.9, { fill: { color: C.accent1, transparency: 88 } });
    await icon(s, 'FaLightbulb', MX + 0.3, 5.82, 0.42, HEX.accent1);
    text(s, '!{Implication:} change the search unit. Evolve /{complete} prompts in a population that can recover, and spend privacy only on scoring — the Private Evolution principle (Lin et al., 2024; Xie et al., 2024).',
      { x: MX + 0.95, y: 5.72, w: CW - 1.2, h: 0.7, fontSize: 15, valign: 'middle' });
    s.addNotes(
      'We see three structural causes. First, token-level myopia: the prompt is built greedily by private voting over next tokens, and nothing checks global coherence. Second, there is no backtracking: a released token cannot be revised. Third, selection is noise-sensitive: DP noise can swap the ranking of similar candidates, and with no recovery path one inversion can redirect the whole search. ' +
      'These are properties of the search structure, not of a particular noise level. So our response is to change the search unit: optimize complete prompts with a population, and borrow the key idea of Private Evolution from DP data synthesis: only evaluation touches private data.');
  }

  /* ---------------- 8. DP-ES overview ---------------- */
  pres.addSection({ title: 'Method' });
  {
    const s = content('Method', 'METHOD', 'DP-ES: only scoring touches private data', 'Method');
    const zy = 2.3, zh = 2.95;
    const zones = [
      { x: MX, label: 'PRIVACY-FREE', col: C.accent1, hex: HEX.accent1, ic: 'FaDna', ph: 'Phase 1: Mutate',
        eq: '/{P}_{t} ← Mutate-to-/{K}(/{S}_{t−1})', d: 'An LLM rewrites the parents into /{K} complete candidate prompts.', tag: '0 privacy loss' },
      { x: MX + COL3 + 0.4, label: 'PRIVATE-DATA ACCESS', col: C.accent5, hex: HEX.accent5, ic: 'FaLock', ph: 'Phase 2: Score',
        eq: '/{s̃}_{p} = /{s}_{p}(/{B}) + /{N}(0, (/{zC}//{b})^{2})', d: 'One clipped, sampled-Gaussian score per candidate.', tag: '≤ TK releases in total' },
      { x: MX + 2 * (COL3 + 0.4), label: 'POST-PROCESSING', col: C.accent1, hex: HEX.accent1, ic: 'FaFilter', ph: 'Phase 3: Select',
        eq: '/{S}_{t} = top-/{M} of privatized scores', d: 'Gumbel-smoothed (default) or deterministic top-/{M}.', tag: '0 privacy loss' },
    ];
    for (const z of zones) {
      card(s, z.x, zy, COL3, zh, { fill: { color: z.col, transparency: 90 } });
      text(s, z.label, { x: z.x + 0.25, y: zy + 0.15, w: COL3 - 0.5, h: 0.3, fontSize: 12, bold: true, color: z.col, charSpacing: 1.5, align: 'center' });
      card(s, z.x + 0.2, zy + 0.55, COL3 - 0.4, zh - 0.75, { fill: { color: C.background1 } });
      await badge(s, z.ic, z.x + 0.4, zy + 0.75, 0.6, z.hex);
      text(s, z.ph, { x: z.x + 1.15, y: zy + 0.85, w: COL3 - 1.45, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: C.text2, valign: 'middle' });
      text(s, z.eq, { x: z.x + 0.35, y: zy + 1.45, w: COL3 - 0.7, h: 0.35, fontFace: HEAD, fontSize: 15, align: 'center', color: C.text2 });
      text(s, z.d, { x: z.x + 0.4, y: zy + 1.85, w: COL3 - 0.8, h: 0.62, fontSize: 14, align: 'center' });
      pill(s, z.tag, z.x + (COL3 - 2.4) / 2, zy + zh - 0.6, 2.4, z.col);
    }
    for (let i = 0; i < 2; i++) {
      const x = MX + (i + 1) * COL3 + i * 0.4;
      s.addShape(pres.shapes.LINE, { x: x + 0.04, y: zy + zh / 2, w: 0.32, h: 0, line: { color: HEX.accent3, width: 2, endArrowType: 'triangle' } });
    }
    // feedback loop
    const c1 = MX + COL3 / 2, c3 = MX + 2 * (COL3 + 0.4) + COL3 / 2, ly = 1.82;
    line(s, c3, zy, c3, ly, { color: HEX.accent3, width: 1.5 });
    line(s, c1, ly, c3, ly, { color: HEX.accent3, width: 1.5 });
    s.addShape(pres.shapes.LINE, { x: c1, y: ly, w: 0, h: zy - ly, line: { color: HEX.accent3, width: 1.5, endArrowType: 'triangle' } });
    s.addText(rt('top-/{M} parents /{S}_{t} → next round  (× /{T})'), { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.14,
      x: W / 2 - 1.9, y: ly - 0.18, w: 3.8, h: 0.36, fill: { color: C.background1 }, line: { color: HEX.accent3, width: 1 },
      fontSize: 13, color: C.text1, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    // private dataset under phase 2
    const z2 = MX + COL3 + 0.4;
    s.addShape(pres.shapes.CAN, { x: z2 + 0.55, y: 5.42, w: 0.55, h: 0.62, fill: { color: C.accent5 }, line: { type: 'none' } });
    s.addShape(pres.shapes.LINE, { x: z2 + 0.825, y: zy + zh + 0.02, w: 0, h: 0.15, line: { color: HEX.accent5, width: 1.5, beginArrowType: 'triangle' } });
    text(s, rt('/{D}: private dataset (/{n} records)', { bold: true, color: C.accent5 }), { x: z2 + 1.25, y: 5.5, w: COL3 - 1.3, h: 0.5, fontSize: 14, valign: 'middle' });
    await icon(s, 'FaBan', MX + 0.35, 5.55, 0.32, HEX.accent1);
    text(s, 'Mutation never reads /{D}', { x: MX + 0.8, y: 5.5, w: COL3 - 0.9, h: 0.42, fontSize: 14, bold: true, color: C.accent1, valign: 'middle' });
    const z3 = MX + 2 * (COL3 + 0.4);
    await icon(s, 'FaBan', z3 + 0.35, 5.55, 0.32, HEX.accent1);
    text(s, 'Selection reads only privatized scores', { x: z3 + 0.8, y: 5.5, w: COL3 - 0.9, h: 0.42, fontSize: 14, bold: true, color: C.accent1, valign: 'middle' });
    card(s, MX, 6.2, CW, 0.55, { fill: { color: C.background1 }, line: { color: HEX.accent5, width: 1 } });
    text(s, '!{Privacy accounting:} ≤ /{TK} sampled-Gaussian score releases, composed by one Rényi-DP accountant ⇒ end-to-end (ε, δ)-DP.',
      { x: MX + 0.3, y: 6.2, w: CW - 0.6, h: 0.55, fontSize: 14, align: 'center', valign: 'middle' });
    s.addNotes(
      'Here is DP-ES. Each round has three phases. Phase one, in green: an LLM mutates the current parent prompts into K complete candidates. The mutation LLM sees only prompts, never records, so this step is post-processing and costs no privacy. ' +
      'Phase two, in blue, is the only place private data enters: each candidate is scored on a freshly sampled batch, the per-record utility is clipped, averaged, and released with Gaussian noise. ' +
      'Phase three selects the top M parents using only the privatized scores, so it is again post-processing. The loop repeats T times. Over the whole run there are at most T times K score releases, and that number alone determines the privacy cost.');
  }

  /* ---------------- 9. One round, formally ---------------- */
  {
    const s = content('Method', 'METHOD', 'One round: mutate, score privately, select', 'Method');
    const lw = 7.65;
    const blocks = [
      ['1', C.accent1, 'Privacy-free mutation', [
        '/{P}_{t} ← Mutate-to-/{K}(/{S}_{t−1}),   |/{P}_{t}| = /{K}',
      ], 'Sees only parent prompts — never records or record-derived feedback.'],
      ['2', C.accent5, 'Sampled-Gaussian scoring', [
        '/{u}_{i}(/{p}) = !{1}[LLM(/{p}, /{x}_{i}) = /{y}_{i}],    /{s}_{p}(/{B}) = (1//{b}) Σ_{i∈B} clip(/{u}_{i}(/{p}), [0, /{C}])',
        '/{s̃}_{p} = /{s}_{p}(/{B}) + /{N}(0, σ^{2}),    σ = /{zC}//{b}',
      ], 'Fresh uniform batch /{B} ⊂ /{D}, |/{B}| = /{b}, per candidate; sensitivity /{C}//{b}.'],
      ['3', C.accent1, 'Selection over privatized scores', [
        '/{ŝ}_{p} = /{s̃}_{p} + Gumbel(0, β)   (default)     or     /{ŝ}_{p} = /{s̃}_{p}   (deterministic)',
      ], '/{S}_{t} ← top-/{M}(/{P}_{t}, /{ŝ}). Both rules are post-processing.'],
    ];
    const hs = [1.4, 1.75, 1.4];
    let y = 1.75;
    blocks.forEach(([n, col, h, eqs, d], i) => {
      card(s, MX, y, lw, hs[i]);
      numBadge(s, n, MX + 0.25, y + 0.17, 0.45, col, 16);
      text(s, h, { x: MX + 0.9, y: y + 0.17, w: lw - 1.1, h: 0.42, fontFace: HEAD, fontSize: 18, bold: true, color: C.text2, valign: 'middle' });
      eqs.forEach((e, j) => text(s, e, { x: MX + 0.9, y: y + 0.62 + j * 0.37, w: lw - 1.1, h: 0.35, fontFace: HEAD, fontSize: 14.5, color: C.text2 }));
      text(s, d, { x: MX + 0.9, y: y + 0.66 + eqs.length * 0.37, w: lw - 1.1, h: 0.32, fontSize: 14, color: C.accent3 });
      y += hs[i] + 0.2;
    });
    const rx = 8.75, rw = W - MX - rx;
    card(s, rx, 1.75, rw, 4.75, { fill: { color: C.text2 } });
    text(s, 'CONFIGURATION (ALL TASKS)', { x: rx + 0.35, y: 2.0, w: rw - 0.7, h: 0.3, fontSize: 12, bold: true, color: C.accent6, charSpacing: 1.5 });
    const cfg = [['/{K} = 6', 'candidates per round'], ['/{M} = 2', 'parents kept'], ['/{T} = 3', 'rounds'], ['/{b} = 10', 'scoring batch size'],
      ['/{z} = 10', 'noise multiplier'], ['/{C} = 1', 'clipping bound'], ['/{n} = 200', 'optimization records'], ['Mode', 'BALANCED mutation']];
    cfg.forEach(([k, v], i) => {
      const yy = 2.42 + i * 0.43;
      text(s, rt(k, { color: C.background1 }), { x: rx + 0.35, y: yy, w: 1.3, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, valign: 'middle' });
      text(s, v, { x: rx + 1.7, y: yy, w: rw - 2.0, h: 0.4, fontSize: 15, color: C.background2, valign: 'middle' });
    });
    text(s, 'Fixed in advance; not selected using task utility.', { x: rx + 0.35, y: 5.95, w: rw - 0.7, h: 0.45, fontSize: 13, italic: true, color: C.accent6 });
    s.addNotes(
      'Slightly more formally. Mutation produces exactly K candidates from the parent set. In our experiments we use a balanced mode that mixes larger and smaller semantic edits. ' +
      'Scoring: for each candidate we draw a fresh batch of b records, compute a zero-one correctness utility, clip it, average it, and add Gaussian noise with standard deviation z times C over b. ' +
      'Selection: by default we add Gumbel noise with a fixed, data-independent scale before taking the top M, purely to smooth rank inversions; deterministic top-M is the beta equals zero case. Both are post-processing. ' +
      'On the right is the single configuration we use for every task. These values were fixed in advance and not tuned on task utility.');
  }

  /* ---------------- 10. Privacy guarantee ---------------- */
  {
    const s = content('Method', 'PRIVACY ANALYSIS', 'End-to-end guarantee: ε ≤ 0.71 at δ = 10^{−5}', 'Method');
    const lw = 7.4;
    const st = [
      ['Proposition 1', 'Mutation is privacy-free', 'Mutate sees only a public or previously privatized parent prompt, so by post-processing it consumes zero privacy budget.'],
      ['Proposition 2', 'Decoupled exploration', 'Privacy loss depends only on the score releases — not on the number or strength of mutations per round.'],
      ['Theorem', 'End-to-end (ε, δ)-DP', 'Composing ≤ /{TK} sampled-Gaussian releases in Rényi DP (subsampling without replacement) gives (ε, δ)-DP for the released prompt.'],
    ];
    st.forEach(([tag, h, d], i) => {
      const y = 1.75 + i * 1.62;
      card(s, MX, y, lw, 1.42);
      pill(s, tag, MX + 0.3, y + 0.22, 1.55, i === 2 ? C.text2 : C.accent1);
      text(s, h, { x: MX + 2.05, y: y + 0.17, w: lw - 2.3, h: 0.42, fontFace: HEAD, fontSize: 18, bold: true, color: C.text2, valign: 'middle' });
      text(s, d, { x: MX + 0.3, y: y + 0.68, w: lw - 0.6, h: 0.7, fontSize: 15 });
    });
    const rx = 8.5, rw = W - MX - rx;
    card(s, rx, 1.75, rw, 4.75, { fill: { color: C.background1 }, line: { color: GRID, width: 1 } });
    text(s, 'ACCOUNTING FOR THE REPORTED RUNS', { x: rx + 0.3, y: 1.95, w: rw - 0.6, h: 0.3, fontSize: 12, bold: true, color: C.accent5, charSpacing: 1.2 });
    const acc = [['/{n} = 200, /{b} = 10', '/{q} = /{b}//{n} = 0.05'], ['/{z} = 10, /{C} = 1', 'σ = /{zC}//{b} = 1.0'], ['/{K} = 6, /{T} = 3', '≤ 18 releases']];
    acc.forEach(([a, b], i) => {
      const y = 2.42 + i * 0.55;
      text(s, a, { x: rx + 0.3, y, w: 1.75, h: 0.4, fontFace: HEAD, fontSize: 15, valign: 'middle' });
      text(s, '→', { x: rx + 2.05, y, w: 0.35, h: 0.4, fontSize: 16, color: C.accent3, align: 'center', valign: 'middle' });
      text(s, b, { x: rx + 2.4, y, w: rw - 2.6, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: C.accent5, valign: 'middle' });
    });
    text(s, 'AutoDP Rényi-DP accountant at δ = 10^{−5}', { x: rx + 0.3, y: 4.15, w: rw - 0.6, h: 0.35, fontSize: 14, color: C.accent3 });
    text(s, 'ε = 0.705', { x: rx + 0.3, y: 4.5, w: rw - 0.6, h: 0.85, fontFace: HEAD, fontSize: 44, bold: true, color: C.accent5 });
    text(s, 'Reported conservatively as ε ≤ 1, the setting used for DP-OPT.', { x: rx + 0.3, y: 5.4, w: rw - 0.6, h: 0.7, fontSize: 14 });
    s.addNotes(
      'The privacy argument is short. Proposition one: mutation sees only public or already privatized prompts, so it is post-processing and free. Proposition two follows: privacy loss is independent of how many or how strong the mutations are, which is exactly the decoupling we want. ' +
      'The theorem composes at most T times K sampled-Gaussian releases with a Renyi-DP accountant for sampling without replacement. ' +
      'With 200 records, batch 10, noise multiplier 10, and 18 releases, AutoDP gives epsilon 0.705 at delta ten to the minus five. We report the common conservative ceiling epsilon at most one, which is DP-OPT\'s stated setting. The script in our repository reproduces this number.');
  }

  /* ---------------- 11. Setup ---------------- */
  pres.addSection({ title: 'Results' });
  {
    const s = content('Results', 'EXPERIMENTAL SETUP', 'Four tasks, one fixed configuration', 'Results');
    const tw = (CW - 3 * 0.3) / 4;
    const tasks = [
      ['FaCalculator', 'GSM8K', 'Multi-step math reasoning', '200-example optimization set; full 1,319-example test set'],
      ['FaStethoscope', 'MedQA', 'Medical multiple-choice QA', '200-question USMLE subset; near-ceiling regime'],
      ['FaMoneyCheckAlt', 'BANKING77', 'Intent classification', '77 classes, 200 examples; large label space'],
      ['FaComments', 'Alpaca', 'Instruction following', '200 instructions; LLM-judge score (DeepSeek-Chat)'],
    ];
    for (let i = 0; i < 4; i++) {
      const [ic, n, t, d] = tasks[i];
      const x = MX + i * (tw + 0.3);
      card(s, x, 1.75, tw, 2.6);
      await badge(s, ic, x + 0.3, 2.0, 0.6, HEX.dk2);
      text(s, n, { x: x + 1.05, y: 2.08, w: tw - 1.2, h: 0.45, fontFace: HEAD, fontSize: 20, bold: true, color: C.text2, valign: 'middle' });
      text(s, t, { x: x + 0.3, y: 2.78, w: tw - 0.5, h: 0.32, fontSize: 14, bold: true, color: C.accent1 });
      text(s, d, { x: x + 0.3, y: 3.12, w: tw - 0.5, h: 0.95, fontSize: 14 });
    }
    const info = [
      ['FaServer', 'Models', ['DeepSeek-V3.2 via API (main results)', 'Qwen2.5-7B-Instruct, local (validation)']],
      ['FaBalanceScale', 'Baselines', ['DP-OPT, black-box adaptation (ε = 1)', 'Non-DP TextGrad (reference, not a bound)', 'PromptDPSGD, soft prompts (local)']],
      ['FaClipboardList', 'Protocol', ['Common ceiling ε ≤ 1, δ = 10^{−5}', '30 runs on GSM8K; 3 seeds elsewhere', 'Same initial prompt for all methods']],
    ];
    for (let i = 0; i < 3; i++) {
      const [ic, h, items] = info[i];
      const x = MX + i * (COL3 + 0.4);
      await icon(s, ic, x, 4.78, 0.36, HEX.accent1);
      text(s, h, { x: x + 0.5, y: 4.75, w: COL3 - 0.5, h: 0.42, fontFace: HEAD, fontSize: 18, bold: true, color: C.text2, valign: 'middle' });
      // rt() splits an item into several runs: the bullet goes on the first, the break on the last
      const fixed = [];
      items.forEach((it, j) => {
        const r = rt(it);
        r.forEach((run, k) => {
          const o = { ...run.options };
          if (k === 0) o.bullet = { indent: 14 };
          if (k === r.length - 1 && j < items.length - 1) o.breakLine = true;
          fixed.push({ text: run.text, options: o });
        });
      });
      text(s, fixed, { x, y: 5.3, w: COL3, h: 1.4, fontSize: 15, paraSpaceAfter: 4 });
    }
    s.addNotes(
      'We evaluate on four task families: GSM8K for multi-step math reasoning, MedQA for medical multiple-choice questions, BANKING77 for 77-way intent classification, and Alpaca for open-ended instruction following, scored by an LLM judge. ' +
      'The main experiments use DeepSeek-V3.2 through its API, and we validate locally with Qwen2.5-7B. We compare against DP-OPT in a black-box adaptation at epsilon one, and against non-private TextGrad as a reference. ' +
      'All methods share the same initial prompt, and DP-ES uses one fixed configuration for every task.');
  }

  /* ---------------- 12. Main results ---------------- */
  {
    const s = content('Results', 'MAIN RESULTS', 'Largest gains where prompt structure matters', 'Results');
    const cats = ['GSM8K', 'MedQA', 'BANKING77', 'Alpaca†'];
    s.addChart(pres.charts.BAR, [
      { name: 'Non-DP (TextGrad)', labels: cats, values: [95.0, 100.0, 75.0, 91.7] },
      { name: 'DP-OPT (ε = 1)', labels: cats, values: [49.5, 93.5, 75.3, 87.1] },
      { name: 'DP-ES (ε ≤ 0.71)', labels: cats, values: [88.1, 99.7, 73.5, 86.8] },
    ], {
      x: MX, y: 1.65, w: 7.9, h: 4.6, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60,
      chartColors: [HEX.accent3, HEX.accent2, HEX.accent1],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 11,
      valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 20, valAxisLabelFontSize: 12, catAxisLabelFontSize: 14,
      valAxisTitle: 'Accuracy / score (%)', showValAxisTitle: true, valAxisTitleFontSize: 12, valAxisTitleColor: '444444', valAxisTitleFontFace: '+mn-lt',
      valGridLine: { color: GRID, size: 0.75 }, catGridLine: { style: 'none' },
      showLegend: true, legendPos: 't', legendFontSize: 13, ...chartText,
    });
    text(s, 'Mean over 30 runs (GSM8K) or 3 seeds; δ = 10^{−5}. †LLM-judge score scaled to %.', { x: MX, y: 6.3, w: 7.9, h: 0.35, fontSize: 11, italic: true, color: C.accent3 });
    const rx = 8.95, rw = W - MX - rx;
    card(s, rx, 1.75, rw, 4.75);
    text(s, 'DP-ES − DP-OPT (pp)', { x: rx + 0.35, y: 1.98, w: rw - 0.7, h: 0.35, fontSize: 13, bold: true, color: C.text2 });
    const deltas = [['GSM8K', '+38.6', C.accent1], ['MedQA', '+6.2', C.accent1], ['BANKING77', '−1.8', C.accent3], ['Alpaca', '−0.3', C.accent3]];
    deltas.forEach(([t, v, col], i) => {
      const y = 2.45 + i * 0.62;
      text(s, t, { x: rx + 0.35, y, w: 1.8, h: 0.5, fontSize: 16, valign: 'middle' });
      text(s, v, { x: rx + 2.0, y, w: rw - 2.35, h: 0.5, fontFace: HEAD, fontSize: 26, bold: true, color: col, align: 'right', valign: 'middle' });
    });
    text(s, 'Large gains on reasoning-heavy tasks; parity on well-structured classification and instruction following. MedQA is near ceiling.',
      { x: rx + 0.35, y: 5.05, w: rw - 0.7, h: 1.3, fontSize: 14 });
    s.addNotes(
      'Here are the main results. On GSM8K, DP-ES reaches 88.1 percent versus 49.5 for DP-OPT, a gain of 38.6 points, and within seven points of the non-private reference. On MedQA, 99.7 versus 93.5. ' +
      'On BANKING77 and Alpaca the two private methods are within two points of each other. So the advantage is task-dependent: it is largest when prompt structure is critical, as in multi-step reasoning, and we see parity on well-structured classification and instruction following. ' +
      'One caveat: MedQA is near ceiling on this 200-question subset, so we do not over-interpret that gap.');
  }

  /* ---------------- 13. Population dynamics ---------------- */
  {
    const s = content('Results', 'ANALYSIS', 'Populations retain alternatives under noise', 'Results');
    s.addImage({ path: path.join(FIG, 'diversity_curve.png'), x: MX, y: 1.75, w: 6.9, h: 6.9 * 1460 / 2361,
      altText: 'Line plot: mean pairwise cosine distance between prompt embeddings falls from about 0.15 at iteration 1 to about 0.03 by iteration 4; mean 0.096.' });
    text(s, 'Population diversity: mean pairwise cosine distance of prompt embeddings (all-mpnet-base-v2) across iterations.',
      { x: MX, y: 6.12, w: 6.9, h: 0.5, fontSize: 12, italic: true, color: C.accent3 });
    const rx = 7.95, rw = W - MX - rx;
    card(s, rx, 1.75, rw, 2.0, { fill: { color: C.accent1, transparency: 92 } });
    text(s, 'Final DP-ES prompt (GSM8K)', { x: rx + 0.3, y: 1.92, w: rw - 2.4, h: 0.32, fontSize: 13, bold: true, color: C.text2 });
    pill(s, '{question} kept', rx + rw - 2.0, 1.9, 1.75, C.accent1);
    text(s, rt('You are a math tutor. Solve the question carefully and show reasoning: %{«question»}  (Provide detailed reasoning and justification.)  (Be concise and accurate.)', { italic: true }),
      { x: rx + 0.3, y: 2.38, w: rw - 0.6, h: 1.6, fontSize: 15 });
    const pts = [
      ['FaLayerGroup', 'Mutations edit /{complete} strings, preserving global prompt structure.'],
      ['FaRandom', 'Six candidates per round supply alternatives after noise-induced rank inversions.'],
      ['FaSeedling', 'Exploration is free: richer mutation costs no privacy budget.'],
    ];
    for (let i = 0; i < 3; i++) {
      const y = 4.15 + i * 0.8;
      await badge(s, pts[i][0], rx, y, 0.5, HEX.accent1);
      text(s, pts[i][1], { x: rx + 0.7, y: y - 0.04, w: rw - 0.7, h: 0.62, fontSize: 15, valign: 'middle' });
    }
    s.addNotes(
      'Why does evolution work better under noise? On the left is population diversity, the mean pairwise embedding distance between prompts. Early iterations are diverse, around 0.15, before the population converges. That diversity means DP-ES holds several complete hypotheses at once, so when Gaussian noise swaps two scores, a good alternative is still in the population. ' +
      'On the right is the final DP-ES prompt from a logged GSM8K run. Because mutations operate on whole strings, the question placeholder is preserved. And because mutation is free, we can afford rich exploration without spending more privacy budget.');
  }

  /* ---------------- 14. Efficiency ---------------- */
  {
    const s = content('Results', 'EFFICIENCY', '2.5× faster, 3.3× fewer private-data calls', 'Results');
    const stats = [
      ['2.5×', 'faster wall-clock', '17.9 h vs. 45.7 h on GSM8K (API)', C.accent1],
      ['3.3×', 'fewer private-data call groups', '10 vs. 33 in a representative run', C.accent1],
      ['2.8×', 'more tokens — the trade-off', '11,120 vs. 4,016: DP-ES trades tokens for robustness', C.accent4],
    ];
    stats.forEach(([v, l, d, col], i) => {
      const x = MX + i * (COL3 + 0.4);
      card(s, x, 1.75, COL3, 1.75);
      text(s, v, { x: x + 0.3, y: 1.9, w: 1.7, h: 0.8, fontFace: HEAD, fontSize: 40, bold: true, color: col, valign: 'middle' });
      text(s, l, { x: x + 1.95, y: 1.95, w: COL3 - 2.15, h: 0.75, fontSize: 15, bold: true, color: C.text2, valign: 'middle' });
      text(s, d, { x: x + 0.3, y: 2.78, w: COL3 - 0.6, h: 0.6, fontSize: 14, color: C.accent3 });
    });
    s.addChart(pres.charts.BAR, [
      { name: 'DP-ES', labels: ['MedQA (Qwen2.5-7B)', 'GSM8K (Qwen2.5-7B)', 'MedQA (API)', 'GSM8K (API)'], values: [1.87, 7.37, 7.0, 17.9] },
      { name: 'DP-OPT', labels: ['MedQA (Qwen2.5-7B)', 'GSM8K (Qwen2.5-7B)', 'MedQA (API)', 'GSM8K (API)'], values: [3.24, 14.6, 18.4, 45.7] },
    ], {
      x: MX, y: 3.75, w: 8.0, h: 2.95, barDir: 'bar', barGrouping: 'clustered', barGapWidthPct: 45,
      chartColors: [HEX.accent1, HEX.accent2],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0#', dataLabelFontSize: 11,
      valAxisMinVal: 0, valAxisMaxVal: 50, valAxisMajorUnit: 10, valAxisLabelFontSize: 11, catAxisLabelFontSize: 12,
      valAxisTitle: 'Wall-clock hours', showValAxisTitle: true, valAxisTitleFontSize: 11, valAxisTitleColor: '444444', valAxisTitleFontFace: '+mn-lt',
      valGridLine: { color: GRID, size: 0.75 }, catGridLine: { style: 'none' },
      showLegend: true, legendPos: 'r', legendFontSize: 12, ...chartText,
    });
    const rx = 9.0, rw = W - MX - rx;
    text(s, 'Why faster?', { x: rx, y: 3.85, w: rw, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: C.text2 });
    text(s, 'DP-OPT queries private aggregates both while constructing tokens and while evaluating. DP-ES mutations never touch /{D}, so far fewer serial private-data round trips are needed — latency drops even though token count rises.',
      { x: rx, y: 4.3, w: rw, h: 2.3, fontSize: 15 });
    s.addNotes(
      'DP-ES is also cheaper in time. On GSM8K through the API it takes 17.9 hours versus 45.7 for DP-OPT, 2.5 times faster, and the speed-up holds on MedQA and with the local Qwen model. ' +
      'The reason is the number of private-data round trips: 10 logged call groups versus 33, because DP-OPT queries private aggregates during token construction as well as evaluation. ' +
      'To be transparent about the trade-off: DP-ES uses larger contexts, about 2.8 times more tokens. So the advantage is lower wall-clock time and fewer private-data round trips, not uniformly lower provider cost.');
  }

  /* ---------------- 15. Ablations ---------------- */
  {
    const s = content('Results', 'ABLATIONS AND VALIDATION', 'Robust to selector, population size, and model', 'Results');
    const heads = ['(a) Selection rule', '(b) Population size (/{K}·/{T} ≤ 24)', '(c) Local Qwen2.5-7B (ε ≤ 1)'];
    heads.forEach((h, i) => {
      const x = MX + i * (COL3 + 0.4);
      card(s, x, 1.75, COL3, 4.75);
      text(s, h, { x: x + 0.3, y: 1.95, w: COL3 - 0.6, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: C.text2 });
    });
    const tblOpts = { fontSize: 14, color: C.text1, border: { type: 'solid', pt: 0.75, color: GRID }, valign: 'middle', margin: [0.03, 0.08, 0.03, 0.08] };
    const th = (t, align = 'center') => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align } });
    const td = (t, o = {}) => ({ text: t, options: { align: 'center', fill: { color: C.background1 }, ...o } });
    // (a)
    const xa = MX + 0.3, wa = COL3 - 0.6;
    s.addTable([
      [th('Selector', 'left'), th('GSM8K (%)')],
      [td('Gumbel-smoothed', { align: 'left' }), td('88.8 ± 3.4')],
      [td('Deterministic', { align: 'left' }), td('88.6 ± 2.9')],
    ], { x: xa, y: 2.55, w: wa, colW: [wa * 0.55, wa * 0.45], rowH: 0.45, ...tblOpts });
    text(s, 'Five seeds. Both rules post-process privatized scores, so the privacy guarantee is identical; accuracy differs by only 0.2 pp.',
      { x: xa, y: 4.1, w: wa, h: 2.2, fontSize: 15 });
    // (b)
    const xb = MX + COL3 + 0.4;
    s.addChart(pres.charts.BAR, [{ name: 'GSM8K accuracy (%)', labels: ['K=3, T=4', 'K=6, T=3', 'K=9, T=2', 'K=12, T=2'], values: [78.5, 86.5, 82.0, 82.0] }], {
      x: xb + 0.15, y: 2.45, w: COL3 - 0.3, h: 2.6, barDir: 'col', barGapWidthPct: 50,
      chartColors: [HEX.accent3, HEX.accent1, HEX.accent3, HEX.accent3],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 11,
      valAxisMinVal: 60, valAxisMaxVal: 95, valAxisMajorUnit: 10, valAxisLabelFontSize: 11, catAxisLabelFontSize: 11,
      valGridLine: { color: GRID, size: 0.75 }, catGridLine: { style: 'none' }, showLegend: false, ...chartText,
    });
    text(s, '/{K} = 6, /{T} = 3 balances diversity and depth: small /{K} explores too narrowly, large /{K} leaves too few refinement rounds.',
      { x: xb + 0.3, y: 5.15, w: COL3 - 0.6, h: 1.2, fontSize: 14 });
    // (c)
    const xc = MX + 2 * (COL3 + 0.4) + 0.3, wc = COL3 - 0.6;
    s.addTable([
      [th('Method', 'left'), th('GSM8K'), th('MedQA')],
      [td('DP-ES', { align: 'left', bold: true, color: C.accent1 }), td('53.8 ± 6.1', { bold: true, color: C.accent1 }), td('81.2 ± 1.3')],
      [td('DP-OPT', { align: 'left' }), td('37.4 ± 11.6'), td('83.0 ± 2.1')],
      [td('PromptDPSGD', { align: 'left' }), td('20.0 ± 5.8'), td('34.8 ± 19.0')],
      [td('Non-DP', { align: 'left' }), td('26.2 ± 10.2'), td('79.5 ± 4.2')],
    ], { x: xc, y: 2.55, w: wc, colW: [wc * 0.38, wc * 0.31, wc * 0.31], rowH: 0.42, ...tblOpts, fontSize: 12.5 });
    text(s, 'Three seeds. The reasoning gain transfers (+16.4 pp on GSM8K); MedQA is comparable, matching the API trend.',
      { x: xc, y: 4.85, w: wc, h: 1.5, fontSize: 14 });
    s.addNotes(
      'Three robustness checks. Panel a: Gumbel-smoothed and deterministic top-M selection reach 88.8 and 88.6 percent over five seeds. Both are post-processing, so privacy is identical; we keep smoothing as the default but do not claim a variance advantage. ' +
      'Panel b: with K times T capped at 24, K equals six and T equals three gives the best trade-off between population diversity and number of refinement rounds. ' +
      'Panel c: with a local Qwen2.5-7B model, DP-ES beats DP-OPT by 16.4 points on GSM8K with half the standard deviation, and the two are comparable on MedQA, the same task-dependent pattern as with the API model. The soft-prompt baseline PromptDPSGD trails both discrete methods.');
  }

  /* ---------------- 16. Stress test ---------------- */
  {
    const s = content('Results', 'PRIVACY DIAGNOSTICS', 'Stress test: no listed PII strings in DP-ES prompts', 'Results');
    card(s, MX, 1.75, CW, 0.85);
    await badge(s, 'FaUserSecret', MX + 0.25, 1.88, 0.58, HEX.dk2);
    text(s, '!{Setup.} 200 synthetic customer profiles × 6 sensitive strings (name, phone, email, full address, street fragment, account ID) = !{1,200 strings}. We count exact and near-verbatim matches in the final prompt.',
      { x: MX + 1.05, y: 1.8, w: CW - 1.3, h: 0.75, fontSize: 15, valign: 'middle' });
    const cw2 = (CW - 0.4) / 2;
    const sides = [
      { x: MX, col: C.accent2, title: 'Adversarial non-DP control', sub: 'Given raw records and instructed to embed a directory',
        ex: 'Use this customer directory:\nJessica Moore, (713) 907-8800,\njessica.moore83@mail.com;\nAnthony Williams, (312) 991-9095,\nanthony.williams60@mail.com; …', big: '40', lbl: 'strings leaked (3.33%)' },
      { x: MX + cw2 + 0.4, col: C.accent1, title: 'DP-ES', sub: 'Mutation never receives records',
        ex: 'You are a customer service\nassistant. Retrieve relevant\ninformation based on user queries.\nIf the query involves account\ninformation, verify before\nresponding.', big: '0', lbl: 'strings leaked (0.0%)' },
    ];
    sides.forEach((sd) => {
      card(s, sd.x, 2.85, cw2, 3.0, { fill: { color: sd.col, transparency: 92 } });
      text(s, sd.title, { x: sd.x + 0.3, y: 3.0, w: cw2 - 0.6, h: 0.4, fontFace: HEAD, fontSize: 19, bold: true, color: sd.col });
      text(s, sd.sub, { x: sd.x + 0.3, y: 3.4, w: cw2 - 0.6, h: 0.32, fontSize: 14, color: C.accent3 });
      card(s, sd.x + 0.3, 3.82, 3.65, 1.85, { fill: { color: C.background1 } });
      text(s, sd.ex, { x: sd.x + 0.45, y: 3.92, w: 3.4, h: 1.7, fontFace: MONO, fontSize: 11, color: C.text1, valign: 'middle' });
      text(s, sd.big, { x: sd.x + 4.15, y: 3.85, w: cw2 - 4.35, h: 1.05, fontFace: HEAD, fontSize: 54, bold: true, color: sd.col, align: 'center', valign: 'middle' });
      text(s, sd.lbl, { x: sd.x + 4.15, y: 4.9, w: cw2 - 4.35, h: 0.6, fontSize: 14, bold: true, color: sd.col, align: 'center' });
    });
    await icon(s, 'FaInfoCircle', MX, 6.13, 0.3, HEX.accent3);
    text(s, 'Also: 1,000 logged noise draws are consistent with the configured Gaussian (Kolmogorov–Smirnov). These are diagnostics — they cannot certify DP; the guarantee comes from the RDP accountant.',
      { x: MX + 0.45, y: 6.05, w: CW - 0.45, h: 0.6, fontSize: 14, color: C.accent3 });
    s.addNotes(
      'Beyond the formal guarantee, we ran targeted diagnostics. We built 200 synthetic customer profiles with six sensitive strings each, 1,200 strings in total, and searched final prompts for exact or near-verbatim matches. ' +
      'An intentionally adversarial non-private control, which is shown raw records and asked to embed a directory, ends up with 40 of those strings in its prompt. DP-ES, whose mutation never sees records, contains none. ' +
      'We also checked that 1,000 logged noise draws match the configured Gaussian. To be clear, these are sanity checks for implementation errors; they do not test semantic leakage or membership inference, and they cannot certify DP. The guarantee comes from the accountant.');
  }

  /* ---------------- 17. Scope ---------------- */
  pres.addSection({ title: 'Scope and conclusion' });
  {
    const s = content('Scope and conclusion', 'SCOPE AND LIMITATIONS', 'What we establish — and what remains open', 'Scope');
    const cw2 = (CW - 0.4) / 2;
    const L = [
      'More robust optimization under DP noise than token-level construction',
      'A formal record-level guarantee (ε ≤ 0.71, δ = 10^{−5}) from mechanism-level RDP accounting',
      'Lower wall-clock time and fewer private-data round trips than DP-OPT',
    ];
    const R = [
      'End-to-end validation on genuinely sensitive, non-saturated deployment data',
      'MedQA is near ceiling (Non-DP 100.0%), limiting its discriminative power',
      'Attacks: exact-match only — no membership inference or reconstruction',
      'One privacy level (ε ≤ 1) rather than a dense privacy–utility frontier',
      'Advantage is task-dependent: parity on BANKING77 and Alpaca',
    ];
    const col = async (x, head, items, ic, hex, colr) => {
      card(s, x, 1.75, cw2, 4.35);
      text(s, head, { x: x + 0.35, y: 1.95, w: cw2 - 0.7, h: 0.4, fontFace: HEAD, fontSize: 19, bold: true, color: colr });
      for (let i = 0; i < items.length; i++) {
        const gap = items.length > 3 ? 0.7 : 0.88;
        const y = 2.55 + i * gap;
        await badge(s, ic, x + 0.35, y + 0.03, 0.34, hex);
        text(s, items[i], { x: x + 0.9, y, w: cw2 - 1.2, h: gap - 0.05, fontSize: 15 });
      }
    };
    await col(MX, 'Supported by the evidence', L, 'FaCheck', HEX.accent1, C.accent1);
    await col(MX + cw2 + 0.4, 'Open — future work', R, 'FaQuestion', HEX.accent4, C.accent4);
    text(s, '!{Next steps:} adaptive population sizing  ·  multi-objective search (utility, privacy, stability)  ·  federated DP-ES for distributed sensitive data',
      { x: MX, y: 6.25, w: CW, h: 0.45, fontSize: 15, color: C.text2, valign: 'middle' });
    s.addNotes(
      'We want to be explicit about scope. Our evidence supports three claims: DP-ES is a structurally more robust DP prompt optimizer than token-level construction, especially when prompt structure matters; it carries a formal record-level guarantee from the accountant; and it is faster with fewer private-data round trips. ' +
      'What we have not shown: end-to-end validation on genuinely sensitive, non-saturated data, which current public benchmarks do not offer; MedQA is near ceiling; our attack coverage is exact-match only; we report one privacy level rather than a full frontier; and the advantage is task-dependent. ' +
      'Natural next steps are adaptive population sizing, multi-objective search, and a federated variant.');
  }

  /* ---------------- 18. Takeaways ---------------- */
  {
    const s = pres.addSlide({ masterName: 'DPES_DARK', sectionTitle: 'Scope and conclusion' });
    s.addText('CONCLUSION', { placeholder: 'kicker' });
    s.addText('Takeaways', { placeholder: 'title' });
    const items = [
      ['01', 'Diagnosis', 'Token-level DP prompt construction is structurally fragile: 49.5 ± 28.5% on GSM8K over 30 runs, with template drift.'],
      ['02', 'Method', 'DP-ES evolves complete prompts; only sampled-Gaussian scoring spends privacy, while mutation and selection are post-processing.'],
      ['03', 'Evidence', '88.1% on GSM8K (+38.6 pp, ~9× lower std) and 2.5× faster, under ε ≤ 0.71, δ = 10^{−5}.'],
    ];
    items.forEach(([n, h, d], i) => {
      const x = MX + i * (COL3 + 0.4);
      card(s, x, 1.75, COL3, 2.65, { fill: { color: C.background1, transparency: 92 } });
      text(s, n, { x: x + 0.35, y: 1.95, w: 1.0, h: 0.55, fontFace: HEAD, fontSize: 28, bold: true, color: C.accent6 });
      text(s, h, { x: x + 0.35, y: 2.55, w: COL3 - 0.7, h: 0.42, fontFace: HEAD, fontSize: 20, bold: true, color: C.background1 });
      text(s, rt(d, { color: C.background2 }), { x: x + 0.35, y: 3.05, w: COL3 - 0.7, h: 1.55, fontSize: 15 });
    });
    text(s, 'Thank you — questions are welcome.', { x: MX, y: 4.85, w: CW, h: 0.6, fontFace: HEAD, fontSize: 28, italic: true, color: C.background1 });
    await icon(s, 'FaGithub', MX, 5.77, 0.32, HEX.accent6);
    s.addText('Code, accountant and paper source:  github.com/StephCpa/dp-es', { x: MX + 0.45, y: 5.75, w: 7.5, h: 0.36, fontSize: 15, color: C.accent6, margin: 0, valign: 'middle', isTextBox: true,
      hyperlink: { url: 'https://github.com/StephCpa/dp-es' } });
    text(s, rt('Contact: liaiping@nudt.edu.cn', { color: C.background2 }), { x: MX + 0.45, y: 6.17, w: 7.5, h: 0.32, fontSize: 13 });
    s.addNotes(
      'To summarize. First, a diagnosis: token-level private prompt construction is structurally fragile, with 49.5 plus or minus 28.5 percent on GSM8K and visible template drift. ' +
      'Second, a method: DP-ES evolves complete prompts and spends privacy only on sampled-Gaussian scoring; mutation and selection are post-processing. ' +
      'Third, the evidence: 88.1 percent on GSM8K, nine times lower variance, and 2.5 times faster, at epsilon 0.71. Code, the privacy accountant and the paper source are on GitHub. Thank you, and I am happy to take questions.');
  }

  /* ---------------- Backup slides ---------------- */
  pres.addSection({ title: 'Backup' });
  {
    const s = content('Backup', 'BACKUP', 'Threat model and assumptions');
    const items = [
      ['FaUserShield', 'Trusted curator', 'The party running DP-ES may access /{D} but releases only the final prompt.'],
      ['FaUser', 'Record-level privacy', 'The unit is one record (/{x}_{i}, /{y}_{i}); group privacy scales ε with group size.'],
      ['FaNetworkWired', 'Trusted boundary', 'The evaluation endpoint is a trusted processor; DP protects the released prompt, not API inputs.'],
      ['FaBan', 'Mutation isolation', 'The mutation LLM sees only parent prompts. PII memorized in pretraining is outside this threat model.'],
      ['FaSyncAlt', 'Post-processing safety', 'Downstream use of the released prompt adds no further loss about /{D}.'],
      ['FaFlask', 'Audits are not proofs', 'Empirical checks can expose implementation errors but cannot certify DP; the guarantee is mechanism-level.'],
    ];
    for (let i = 0; i < 6; i++) {
      const [ic, h, d] = items[i];
      const x = MX + (i % 3) * (COL3 + 0.4), y = 1.75 + Math.floor(i / 3) * 2.45;
      card(s, x, y, COL3, 2.2);
      await badge(s, ic, x + 0.3, y + 0.28, 0.55, i === 5 ? HEX.accent4 : HEX.dk2);
      text(s, h, { x: x + 1.0, y: y + 0.3, w: COL3 - 1.2, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true, color: C.text2, valign: 'middle' });
      text(s, d, { x: x + 0.3, y: y + 1.0, w: COL3 - 0.6, h: 1.1, fontSize: 15 });
    }
    s.addNotes('Backup. These are the assumptions behind the formal guarantee, as stated in the appendix of the paper. They match those of DP-OPT and standard DP machine learning.');
  }
  {
    const s = content('Backup', 'BACKUP', 'Where the efficiency comes from');
    const th = (t, align = 'center') => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align } });
    const grp = (t) => [{ text: t, options: { italic: true, bold: true, color: C.accent1, fill: { color: C.background2 }, colspan: 4 } }];
    const r = (a, b, c, d, bold) => [a, b, c, d].map((t, i) => ({ text: t, options: { align: i ? 'center' : 'left', bold: !!bold } }));
    s.addTable([
      [th('Cost component', 'left'), th('DP-OPT'), th('DP-ES'), th('Ratio')],
      grp('Logged private-data call groups'),
      r('Mutation (token-level / privacy-free)', '3 (DP)', '0 (free)', '—'),
      r('Evaluation (Gaussian-noised)', '30', '10', '3.0× fewer'),
      r('Total private-data groups', '33', '10', '3.3× fewer', true),
      grp('Token usage'),
      r('Input tokens', '1,309', '6,120', '4.7× more'),
      r('Output tokens', '2,707', '5,000', '1.8× more'),
      r('Total tokens', '4,016', '11,120', '2.8× more', true),
      grp('Wall-clock'),
      r('Runtime (hours)', '16.6', '6.5', '2.5× faster', true),
      r('Accuracy (single run)', '91.0%', '86.5%', '—'),
    ], { x: MX, y: 1.75, w: 8.2, colW: [3.5, 1.5, 1.5, 1.7], rowH: 0.39, fontSize: 14, color: C.text1,
      border: { type: 'solid', pt: 0.75, color: GRID }, valign: 'middle', margin: [0.03, 0.1, 0.03, 0.1] });
    const rx = 9.2, rw = W - MX - rx;
    card(s, rx, 1.75, rw, 4.7);
    text(s, 'Reading the table', { x: rx + 0.3, y: 1.95, w: rw - 0.6, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: C.text2 });
    text(s, 'DP-OPT’s token construction queries private counts, so its mutation calls also enter the accountant. DP-ES mutation is post-processing; only its evaluation groups touch records.\n\nFewer serial round trips dominate latency, so runtime drops even though DP-ES uses more tokens.',
      { x: rx + 0.3, y: 2.45, w: rw - 0.6, h: 3.8, fontSize: 15 });
    text(s, 'GSM8K, seed 42, ε ≤ 1, 200-example optimization set. Counts are logger-level call groups, not individual requests.',
      { x: MX, y: 6.5, w: 8.2, h: 0.35, fontSize: 11, italic: true, color: C.accent3 });
    s.addNotes('Backup. Cost decomposition by call purpose for one representative GSM8K run (Appendix, efficiency breakdown). Provider pricing and validation-set size can change the cost comparison.');
  }
  {
    const s = content('Backup', 'BACKUP', 'Reproducing the privacy bound');
    const lw = 6.2;
    card(s, MX, 1.75, lw, 2.75, { fill: { color: C.text2 } });
    const code = [
      ['$ python -m pip install -e .', HEX.accent6],
      ['$ python scripts/compute_privacy.py', HEX.accent6],
      ['epsilon=0.705168', 'FFFFFF'],
      ['delta=1e-05', 'FFFFFF'],
      ['releases=18', 'FFFFFF'],
      ['sampling_rate=0.050000', 'FFFFFF'],
    ];
    s.addText(code.map(([t, c], i) => ({ text: t, options: { color: c, ...(i < code.length - 1 ? { breakLine: true } : {}) } })),
      { x: MX + 0.35, y: 2.0, w: lw - 0.7, h: 2.3, fontFace: MONO, fontSize: 15, margin: 0, valign: 'top', paraSpaceAfter: 6, isTextBox: true });
    text(s, 'Defaults: /{n} = 200, /{b} = 10, /{z} = 10, /{K} = 6, /{T} = 3, δ = 10^{−5}. Recompute whenever any of them changes: larger /{KT} raises both cost and composed privacy loss.',
      { x: MX, y: 4.8, w: lw, h: 1.1, fontSize: 15 });
    const rx = MX + lw + 0.5, rw = W - MX - rx;
    text(s, 'Privacy contract of the released code', { x: rx, y: 1.75, w: rw, h: 0.45, fontFace: HEAD, fontSize: 19, bold: true, color: C.text2 });
    const pc = [
      'Per-record utilities are clipped to a public interval.',
      'Every data-dependent evaluation uses the sampled-Gaussian scorer; raw utilities are never released.',
      'The number of releases is fixed in advance.',
      'Mutation receives no private records or record-derived feedback.',
      'Selection and all later computation use only privatized outputs.',
    ];
    pc.forEach((t, i) => {
      const y = 2.35 + i * 0.85;
      numBadge(s, String(i + 1), rx, y, 0.42, C.accent1, 14);
      text(s, t, { x: rx + 0.6, y: y - 0.02, w: rw - 0.6, h: 0.75, fontSize: 15 });
    });
    s.addNotes('Backup. The repository reproduces the reported bound with AutoDP; the five conditions on the right are the contract under which the formal guarantee holds.');
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
}

/* ---------- write theme colours (pptxgenjs only writes the fonts) ------ */
async function applyTheme(file, theme) {
  const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs')] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const part = 'ppt/theme/theme1.xml';
  const slots = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const scheme = `<a:clrScheme name="${theme.name}">` + slots.map((k) => `<a:${k}><a:srgbClr val="${theme.colors[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const xml = (await zip.file(part).async('string'))
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${theme.name}"`);
  zip.file(part, xml);
  // pptxgenjs writes an <a:pPr> before every run of a multi-run paragraph; the schema allows one,
  // first. Keep the first and drop the rest (later ones only repeat it or reset the bullet).
  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts|slideMasters)\/[^/]+\.xml$/.test(name)) continue;
    const src = await zip.file(name).async('string');
    const out = src.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (para, body) => {
      let seen = false;
      return '<a:p>' + body.replace(/<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, (m) => (seen ? '' : ((seen = true), m))) + '</a:p>';
    });
    if (out !== src) zip.file(name, out);
  }
  for (const name of Object.keys(zip.files)) {
    if (!name.endsWith('.xml')) continue;
    const bad = (await zip.file(name).async('string')).match(/<a:srgbClr val="(?![0-9A-Fa-f]{6}")[^"]*"/);
    if (bad) throw new Error(`${name}: scheme colour passed to a hex-only option (${bad[0]})`);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

build().catch((e) => { console.error(e); process.exit(1); });
