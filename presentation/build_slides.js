/* =====================================================================
   DP-ES - EMNLP 2026 conference talk (16:9, 13.33 x 7.5 in)

   Visual system: the team deck "DP-ES_ Differentially Private Evolution
   Strategies for Prompt Op.pptx" (paper background, Unna titles,
   Quattrocento Sans body, JetBrains Mono labels, crimson accent, hairline
   rules, booktabs tables). Content: that deck plus the detail of the
   earlier generated version. Every number comes from the camera-ready
   paper in ../paper.

   Build:  NODE_PATH=<dir with pptxgenjs> node build_slides.js
   Output: DP-ES_EMNLP2026_Talk.pptx (next to this script). The fonts the
   team deck embeds are copied into the output so it renders the same on
   machines without them.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const OUT = path.join(__dirname, 'DP-ES_EMNLP2026_Talk.pptx');
const TEAM_DECK = path.join(__dirname, 'DP-ES_ Differentially Private Evolution Strategies for Prompt Op.pptx');
const FIG = path.join(__dirname, '..', 'paper', 'figures');

/* ---------- theme (colours taken from the team deck) ------------------- */
const THEME = {
  name: 'DP-ES Paper',
  headFontFace: 'Unna',
  bodyFontFace: 'Quattrocento Sans',
  colors: {
    dk1: '23201B',     // ink
    lt1: 'F7F3E8',     // paper
    dk2: '6E675C',     // muted text
    lt2: 'EFE9DA',     // highlight row / panel
    accent1: '8C2F39', // crimson: DP-ES, labels, emphasis
    accent2: '6E222B', // deep crimson: statements
    accent3: '9B9489', // faint label
    accent4: 'CFC8B8', // hairline rules
    accent5: 'C9C1AF', // taupe: Non-DP series
    accent6: '4F4A42', // dark taupe: DP-OPT series
    hlink: '8C2F39',
    folHlink: '6E222B',
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Ziniu Liu, Aiping Li, Yue Han, Han Yu, Junjian Zhang, Dong Zhu, Changjian Li, Shiqiang Zhang';
pres.title = 'DP-ES: Differentially Private Evolution Strategies for Prompt Optimization';
pres.subject = 'EMNLP 2026 main conference talk';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const INK = C.text1, MUTED = C.text2, PAPER = C.background1, PANEL = C.background2;
const RED = C.accent1, RED_DK = C.accent2, FAINT = C.accent3, RULE = C.accent4;
const HEAD = '+mj-lt';          // Unna
const MONO = 'JetBrains Mono';
const MATH = 'Cambria';         // Greek and math symbols: Unna and Quattrocento Sans have none

const X0 = 0.833, XW = 11.667, X1 = X0 + XW;
const TITLE_TEXT = 'DP-ES: Differentially Private Evolution Strategies for Prompt Optimization';
const MAIN_TOTAL = 18, BACKUP_TOTAL = 3;

/* ---------- layouts ---------------------------------------------------- */
pres.defineSlideMaster({
  title: 'PAPER_TITLE',
  background: { color: PAPER },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: X0, y: 0.806, w: 8.333, h: 0.25,
      fontSize: 11, color: RED, charSpacing: 3, margin: 0, valign: 'top' }, text: '' } },
    { rect: { x: X0, y: 1.194, w: 0.889, h: 0.042, fill: { color: RED }, line: { type: 'none' } } },
  ],
});

pres.defineSlideMaster({
  title: 'PAPER_CONTENT',
  background: { color: PAPER },
  objects: [
    { text: { text: 'DP-ES · EMNLP 2026', options: { x: X0, y: 0.333, w: 6.944, h: 0.222, fontSize: 11, color: MUTED, charSpacing: 2, margin: 0, valign: 'top' } } },
    { placeholder: { options: { name: 'section', type: 'body', x: 7.778, y: 0.333, w: 4.722, h: 0.222,
      fontSize: 11, color: MUTED, charSpacing: 2, align: 'right', margin: 0, valign: 'top' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: X0, y: 0.667, w: XW, h: 0.556,
      fontFace: HEAD, fontSize: 29, color: INK, align: 'left', margin: 0, valign: 'top' }, text: '' } },
    { rect: { x: X0, y: 1.361, w: XW, h: 0.014, fill: { color: RULE }, line: { type: 'none' } } },
    { rect: { x: X0, y: 7.014, w: XW, h: 0.014, fill: { color: RULE }, line: { type: 'none' } } },
    { text: { text: TITLE_TEXT, options: { x: X0, y: 7.139, w: 9.722, h: 0.194, fontSize: 10, color: MUTED, margin: 0, valign: 'top' } } },
  ],
});

/* ---------- text helpers ----------------------------------------------- */
// Markup: _{sub} ^{sup} /{italic} !{bold} %{crimson bold} @{monospace} ${math font}
// Inside a marker, «» stand for literal braces.
const MATH_CHARS = /([Ͱ-Ͽ←-⇿∀-⋿′̃̂]+)/;
function splitMath(run) {
  if (run.options.fontFace === MONO || run.options.fontFace === MATH) return [run];
  return run.text.split(MATH_CHARS).filter((t) => t !== '').map((t, i, arr) => {
    const o = { ...run.options };
    if (MATH_CHARS.test(t)) o.fontFace = MATH;
    if (i < arr.length - 1) delete o.breakLine;
    return { text: t, options: o };
  });
}
function rt(str, base = {}) {
  const out = [];
  const re = /([_^/!%@$])\{([^}]*)\}/g;
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
    else if (k === '%') push(v, { bold: true, color: RED });
    else if (k === '@') push(v, { fontFace: MONO });
    else if (k === '$') push(v, { fontFace: MATH });
    last = re.lastIndex;
  }
  if (last < str.length) push(str.slice(last));
  return out.flatMap(splitMath);
}
// a list of paragraphs (strings with markup, or run arrays) as one run array
function paras(list, base = {}, gapPt = 0) {
  const runs = [];
  list.forEach((p, i) => {
    const r = typeof p === 'string' ? rt(p, base) : p.flatMap(splitMath);
    r.forEach((run, k) => {
      const o = { ...run.options };
      if (k === 0 && i > 0 && gapPt) o.paraSpaceBefore = gapPt;
      if (k === r.length - 1 && i < list.length - 1) o.breakLine = true;
      runs.push({ text: run.text, options: o });
    });
  });
  return runs;
}
function text(slide, content, opts) {
  const runs = typeof content === 'string' ? rt(content) : content.flatMap(splitMath);
  slide.addText(runs, { margin: 0, valign: 'top', fontSize: 15, color: INK, isTextBox: true, ...opts });
}
function label(slide, s, x, y, w, color = RED) {
  text(slide, s, { x, y, w, h: 0.25, fontSize: 11, color, charSpacing: 2 });
}
function monoLabel(slide, a, b, x, y, w) {
  const runs = [{ text: a, options: { fontFace: MONO, fontSize: 13, bold: true, color: RED, charSpacing: 1 } }];
  if (b) {
    runs[0].options.breakLine = true;
    runs.push({ text: b, options: { fontFace: MONO, fontSize: 11, bold: true, color: FAINT, charSpacing: 1 } });
  }
  text(slide, runs, { x, y, w, h: 0.78, lineSpacingMultiple: 1.2 });
}
function hrule(slide, x, y, w, color = RULE) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.014, fill: { color }, line: { type: 'none' } });
}
function vrule(slide, x, y, h, color = RULE) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.014, h, fill: { color }, line: { type: 'none' } });
}
function frame(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: fill ? { color: fill } : { type: 'none' }, line: { color: HEX.accent4, width: 1 } });
}
function tag(slide, s, x, y, w, filled = true) {
  slide.addText(s, { shape: pres.shapes.RECTANGLE, x, y, w, h: 0.28,
    fill: filled ? { color: RED } : { type: 'none' }, line: filled ? { type: 'none' } : { color: HEX.accent1, width: 1 },
    fontSize: 10, bold: true, color: filled ? PAPER : RED, charSpacing: 2, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
}
// crimson side rule + note: the team deck's callout
function callout(slide, content, y, h, fontSize = 12) {
  slide.addShape(pres.shapes.RECTANGLE, { x: X0, y, w: 0.042, h, fill: { color: RED }, line: { type: 'none' } });
  text(slide, typeof content === 'string' ? rt(content, { color: MUTED }) : content,
    { x: X0 + 0.278, y, w: XW - 0.278, h, fontSize, color: MUTED, valign: 'middle', lineSpacingMultiple: 1.3 });
}
function line(slide, x1, y1, x2, y2, lineOpts) {
  slide.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipV: (y2 < y1) !== (x2 < x1), line: lineOpts });
}
// booktabs table: cells are markup strings or {text, options}; hl = indices of highlighted rows
function booktabs(slide, rows, opts) {
  const { x, y, w, colW, rowH = 0.42, fontSize = 13, hl = [], align = [], headSize } = opts;
  const n = rows.length;
  const none = { type: 'none' };
  const thick = { type: 'solid', pt: 1.5, color: HEX.dk1 }, thin = { type: 'solid', pt: 1, color: HEX.dk1 };
  const data = rows.map((r, i) => r.map((c, j) => {
    const cell = typeof c === 'object' ? c : { text: String(c) };
    const o = { align: align[j] || (j ? 'center' : 'left'), fontSize: i === 0 ? (headSize || fontSize - 0.5) : fontSize,
      bold: i === 0, color: INK, valign: 'middle',
      border: [i === 0 ? thick : none, none, i === 0 ? thin : i === n - 1 ? thick : none, none],
      fill: hl.includes(i) ? { color: PANEL } : { type: 'none' }, ...cell.options };
    if (hl.includes(i)) { o.bold = true; o.color = RED; }
    return { text: rt(cell.text), options: o };
  }));
  slide.addTable(data, { x, y, w, colW, rowH, margin: [0.04, 0.1, 0.04, 0.1], fontSize, color: INK });
}
function page(slide, s) {
  text(slide, s, { x: 11.067, y: 7.139, w: 1.433, h: 0.194, fontSize: 10, color: MUTED, align: 'right' });
}

let mainNo = 0, backupNo = 0;
function content(sectionTitle, sectionLabel, title, backup = false) {
  const s = pres.addSlide({ masterName: 'PAPER_CONTENT', sectionTitle });
  s.addText(sectionLabel, { placeholder: 'section' });
  s.addText(rt(title), { placeholder: 'title' });
  if (backup) page(s, `Backup ${++backupNo} / ${BACKUP_TOTAL}`);
  else page(s, `${++mainNo} / ${MAIN_TOTAL}`);
  return s;
}

const chartText = { catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt',
  legendFontFace: '+mn-lt', titleFontFace: '+mn-lt', catAxisLabelColor: HEX.dk2, valAxisLabelColor: HEX.dk2,
  dataLabelColor: HEX.dk1, legendColor: HEX.dk1, catAxisLineColor: HEX.accent4, valAxisLineShow: false,
  plotArea: { fill: { color: HEX.lt1 } }, chartArea: { fill: { color: HEX.lt1 } } };

/* ======================================================================
   SLIDES
   ====================================================================== */
async function build() {
  /* ---------------- 1. Title ---------------- */
  pres.addSection({ title: 'Opening' });
  {
    const s = pres.addSlide({ masterName: 'PAPER_TITLE', sectionTitle: 'Opening' });
    mainNo++;
    s.addText('EMNLP 2026 · VIRTUAL PRESENTATION', { placeholder: 'kicker' });
    text(s, TITLE_TEXT, { x: X0, y: 1.5, w: XW, h: 1.667, fontFace: HEAD, fontSize: 42, lineSpacingMultiple: 1.12 });
    const authors = [['Ziniu Liu', '1'], ['Aiping Li', '1,*'], ['Yue Han', '1'], ['Han Yu', '1'], ['Junjian Zhang', '1'],
      ['Dong Zhu', '1'], ['Changjian Li', '1'], ['Shiqiang Zhang', '2']];
    const ar = [];
    authors.forEach(([n, sup], i) => {
      ar.push({ text: (i ? ', ' : '') + n, options: {} }, { text: sup, options: { superscript: true } });
    });
    text(s, ar, { x: X0, y: 3.417, w: XW, h: 0.3, fontSize: 15 });
    text(s, paras([
      [{ text: '1', options: { superscript: true } }, { text: ' National University of Defense Technology', options: {} }],
      [{ text: '2', options: { superscript: true } }, { text: ' CRRC Zhuzhou Electric Locomotive Research Institute, China Academy of Railway Sciences', options: {} }],
      [{ text: '* Corresponding author: liaiping@nudt.edu.cn', options: {} }],
    ]), { x: X0, y: 3.778, w: XW, h: 0.8, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.3 });
    s.addShape(pres.shapes.RECTANGLE, { x: X0, y: 4.722, w: 0.042, h: 1.028, fill: { color: RED }, line: { type: 'none' } });
    text(s, [
      { text: 'A population-based DP prompt optimizer that spends privacy budget ', options: { italic: true } },
      { text: 'only on scoring', options: { italic: true, bold: true } },
      { text: ' — stable where token-level DP construction collapses.', options: { italic: true } },
    ], { x: 1.111, y: 4.722, w: 11.111, h: 1.028, fontFace: HEAD, fontSize: 20, color: RED_DK, valign: 'middle', lineSpacingMultiple: 1.35 });
    hrule(s, X0, 6.417, XW);
    text(s, [{ text: 'code & accounting: ', options: { color: MUTED } }, { text: 'github.com/StephCpa/dp-es', options: { color: INK,
      hyperlink: { url: 'https://github.com/StephCpa/dp-es' } } }], { x: X0, y: 6.611, w: 6.944, h: 0.25, fontFace: MONO, fontSize: 13 });
    text(s, 'Camera-ready · October 2026', { x: 7.778, y: 6.611, w: 4.722, h: 0.25, fontSize: 11, color: MUTED, align: 'right' });
    s.addNotes(
      'Hello everyone. I am presenting DP-ES, Differentially Private Evolution Strategies for Prompt Optimization, joint work with colleagues at the National University of Defense Technology and CRRC Zhuzhou. ' +
      'In one sentence: when prompts are optimized on private data under differential privacy, the structure of the search matters. Token-by-token private construction is fragile; evolving a population of complete prompts, and spending privacy only on noisy scoring, is far more robust.');
  }

  /* ---------------- 2. Outline ---------------- */
  {
    const s = content('Opening', 'OVERVIEW', 'Outline: from a diagnosis to a structurally robust optimizer');
    const rows = [
      ['01', 'PROBLEM', 'Why prompt optimization on sensitive data must be private — and why token-level DP is unstable'],
      ['02', 'IDEA', 'Decouple exploration from privacy spending'],
      ['03', 'METHOD', 'Three phases per iteration and the formal update rule'],
      ['04', 'RESULTS', 'Four tasks, stability under noise, ablations, a local model'],
      ['05', 'PRIVACY', 'End-to-end guarantee, implementation checks, memorization stress test'],
      ['06', 'EFFICIENCY & SCOPE', 'Cost profile, and what the evidence does not yet establish'],
    ];
    rows.forEach(([n, h, d], i) => {
      const y = 1.72 + i * 0.86;
      if (i) hrule(s, X0, y - 0.15, XW);
      text(s, n, { x: X0, y, w: 0.8, h: 0.5, fontFace: HEAD, fontSize: 28, color: RED });
      text(s, h, { x: 1.85, y: y + 0.13, w: 2.9, h: 0.3, fontFace: MONO, fontSize: 13, bold: true, color: RED, charSpacing: 1 });
      text(s, d, { x: 4.9, y: y + 0.1, w: 7.6, h: 0.4, fontSize: 15.5 });
    });
    s.addNotes(
      'The talk follows six short parts. First the problem: prompt optimization on sensitive data has to be private, and the main existing approach, token-level private construction as in DP-OPT, is unstable under a tight budget. ' +
      'Then the idea and the method, DP-ES. Then results on four tasks, the privacy evidence, and finally efficiency and an explicit statement of scope.');
  }

  /* ---------------- 3. Problem (team slide) ---------------- */
  pres.addSection({ title: '01 Problem' });
  {
    const s = content('01 Problem', '01 · PROBLEM', 'Prompt optimization on sensitive data must be private — and stable');
    text(s, paras([
      '!{Automatic prompt optimization} tunes prompts directly on task data — when those data are sensitive (patient records, financial logs), the optimizer can !{memorize and expose} private information.',
      'Formal !{(ε, δ)-differential privacy} bounds this leakage — but the required noise stresses the optimizer itself: under a !{tight budget (ε ≤ 1)}, the leading token-level method, DP-OPT, becomes highly unstable.',
    ], {}, 10), { x: X0, y: 1.75, w: 5.972, h: 3.0, fontSize: 15.5, lineSpacingMultiple: 1.32 });
    label(s, 'THE HEADLINE NUMBER', 7.361, 1.75, 5.139);
    text(s, '49.5 ± 28.5%', { x: 7.361, y: 2.056, w: 5.139, h: 1.111, fontFace: HEAD, fontSize: 54, color: RED });
    text(s, rt('DP-OPT accuracy on GSM8K, mean ± std over !{30 runs} at (ε ≤ 1.0, δ = 10^{−5}) — a ±1 std band spanning roughly 21% to 78%.', { color: MUTED }),
      { x: 7.361, y: 3.278, w: 5.139, h: 0.833, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    hrule(s, X0, 5.028, XW);
    tag(s, 'HYPOTHETICAL', X0, 5.361, 1.778);
    text(s, [
      { text: 'What a ', options: { italic: true } }, { text: 'non-private', options: { italic: true, bold: true } },
      { text: ' optimizer could produce: a final prompt that embeds memorized records — e.g. “…patient #12847, diagnosed with …, prescribed …” — shipped to every downstream user of the prompt.', options: { italic: true } },
    ], { x: 2.917, y: 5.222, w: 9.583, h: 1.389, fontFace: HEAD, fontSize: 16, valign: 'middle', lineSpacingMultiple: 1.3 });
    s.addNotes(
      'Automatic prompt optimization works well, but it tunes prompts directly on task data, and in many applications that data is sensitive: patient records, financial logs. An optimizer can memorize what it sees; in the worst case it returns a prompt that literally contains a record, as in the hypothetical at the bottom. ' +
      'Formal differential privacy bounds this leakage, but the noise it requires stresses the optimizer itself. Under a tight budget, epsilon at most one, the leading token-level method, DP-OPT, gets 49.5 percent on GSM8K with a standard deviation of 28.5 points over 30 runs. That instability is the question of this paper.');
  }

  /* ---------------- 4. Setting & positioning ---------------- */
  {
    const s = content('01 Problem', '01 · PROBLEM', 'Setting: discrete prompts, black-box LLMs, record-level DP');
    const lw = 5.5;
    label(s, 'OBJECTIVE', X0, 1.72, lw);
    text(s, rt('Private dataset /{D} = {(/{x}_{i}, /{y}_{i})}_{i=1}^{n}, prompt space /{P}. Find'), { x: X0, y: 2.05, w: lw, h: 0.35, fontSize: 14.5 });
    text(s, rt('/{p}^{*} = arg max_{p ∈ P} /{f}(/{p}, /{D})'), { x: X0, y: 2.48, w: lw, h: 0.5, fontFace: MATH, fontSize: 21, align: 'center' });
    label(s, 'PRIVACY REQUIREMENT', X0, 3.25, lw);
    text(s, rt('The optimizer /{M} is (ε, δ)-DP if, for all neighbouring datasets /{D} ∼ /{D}′ and all output sets /{S},'),
      { x: X0, y: 3.58, w: lw, h: 0.62, fontSize: 14.5, lineSpacingMultiple: 1.25 });
    text(s, rt('Pr[/{M}(/{D}) ∈ /{S}] ≤ /{e}^{ε} · Pr[/{M}(/{D}′) ∈ /{S}] + δ'), { x: X0, y: 4.3, w: lw, h: 0.5, fontFace: MATH, fontSize: 20, align: 'center' });
    text(s, rt('Privacy unit: one record (/{x}_{i}, /{y}_{i}). Released object: the final prompt. The LLM is reached only through an API, so weight-based DP training (DP-SGD, DP-LoRA) does not apply.', { color: MUTED }),
      { x: X0, y: 5.05, w: lw, h: 1.2, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    vrule(s, 6.75, 1.72, 4.6);
    const rx = 7.1, rw = X1 - rx;
    label(s, 'WHERE DP-ES SITS', rx, 1.72, rw);
    const y = '✓', n = '✗';
    booktabs(s, [
      ['Method', 'Formal DP', 'Discrete', 'Mechanism'],
      ['TextGrad', n, y, 'LLM “gradients”'],
      ['OPRO', n, y, 'LLM scoring'],
      ['EvoPrompt', n, y, 'Evolutionary search'],
      ['PromptBreeder', n, y, 'Evolutionary search'],
      ['DP-SGD', y, n, 'Gaussian noise'],
      ['DP-OPT', y, y, 'Histogram + exp. mech.'],
      ['DP-ES (ours)', y, y, 'Evolution + Gaussian'],
    ], { x: rx, y: 2.08, w: rw, colW: [1.4, 0.95, 0.85, rw - 3.2], rowH: 0.42, fontSize: 12.5, hl: [7], align: ['left', 'center', 'center', 'left'] });
    text(s, rt('DP-ES adds formal record-level DP to evolutionary search over discrete prompts.', { color: MUTED }),
      { x: rx, y: 5.6, w: rw, h: 0.5, fontSize: 11, color: MUTED });
    s.addNotes(
      'Formally, we have a private dataset of input-output pairs and want the prompt that maximizes task performance, for example accuracy. The constraint is (epsilon, delta)-differential privacy with respect to that dataset: changing one record may change the distribution of the released prompt only by a factor e to the epsilon, plus delta. The model is a black box behind an API, so weight-based private training does not apply. ' +
      'The table positions us. Non-private optimizers, including evolutionary ones like EvoPrompt and PromptBreeder, give no guarantee. DP-SGD gives a guarantee but needs continuous parameters. DP-OPT is the closest prior work: private and discrete, using token histograms with the exponential mechanism. DP-ES is private and discrete, using evolution plus Gaussian scoring.');
  }

  /* ---------------- 5. Instability across runs ---------------- */
  {
    const s = content('01 Problem', '01 · PROBLEM', 'Token-level DP optimization is unstable under ε ≤ 1');
    const px0 = 2.75, px1 = 8.0, sc = (px1 - px0) / 100, X = (v) => px0 + v * sc;
    const gy0 = 1.85, gy1 = 5.55;
    [0, 20, 40, 60, 80, 100].forEach((v) => {
      vrule(s, X(v) - 0.007, gy0, gy1 - gy0);
      text(s, String(v), { x: X(v) - 0.4, y: gy1 + 0.08, w: 0.8, h: 0.25, fontSize: 11, color: MUTED, align: 'center' });
    });
    text(s, 'GSM8K accuracy (%), mean ± 1 std over 30 runs', { x: px0, y: gy1 + 0.42, w: px1 - px0, h: 0.25, fontSize: 11, color: MUTED, align: 'center' });
    const rows = [
      ['DP-OPT', 'ε = 1', 49.5, 28.5, HEX.accent6],
      ['DP-ES (ours)', 'ε ≤ 0.71', 88.1, 3.2, HEX.accent1],
      ['Non-DP', 'TextGrad reference', 95.0, 0.9, HEX.accent5],
    ];
    rows.forEach(([name, sub, m, sd, col], i) => {
      const yc = 2.65 + i * 1.15;
      text(s, name, { x: X0, y: yc - 0.32, w: 1.75, h: 0.3, fontSize: 15, bold: true, color: i === 1 ? RED : INK, align: 'right' });
      text(s, sub, { x: X0 - 0.3, y: yc + 0.02, w: 2.05, h: 0.25, fontSize: 11, color: MUTED, align: 'right' });
      s.addShape(pres.shapes.RECTANGLE, { x: X(m - sd), y: yc - 0.11, w: Math.max(2 * sd * sc, 0.06), h: 0.22, fill: { color: col, transparency: 55 }, line: { type: 'none' } });
      s.addShape(pres.shapes.OVAL, { x: X(m) - 0.12, y: yc - 0.12, w: 0.24, h: 0.24, fill: { color: col }, line: { color: HEX.lt1, width: 1.5 } });
      text(s, `${m.toFixed(1)} ± ${sd.toFixed(1)}`, { x: X(m) - 0.8, y: yc - 0.5, w: 1.6, h: 0.28, fontSize: 13, bold: true, color: i === 1 ? RED : INK, align: 'center' });
    });
    vrule(s, 8.75, 1.75, 4.6);
    const rx = 9.15, rw = X1 - rx;
    label(s, 'RUN-TO-RUN SPREAD', rx, 1.75, rw);
    text(s, '±28.5 pp', { x: rx, y: 2.05, w: rw, h: 0.95, fontFace: HEAD, fontSize: 48, color: INK });
    text(s, 'DP-OPT standard deviation on GSM8K: one run may succeed, the next may collapse.', { x: rx, y: 3.05, w: rw, h: 0.75, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    label(s, 'WITH DP-ES', rx, 4.05, rw);
    text(s, '≈ 9× lower', { x: rx, y: 4.35, w: rw, h: 0.85, fontFace: HEAD, fontSize: 40, color: RED });
    text(s, 'standard deviation (3.2 pp) under a tighter recomputed bound.', { x: rx, y: 5.25, w: rw, h: 0.6, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    text(s, rt('DP-OPT: black-box adaptation of Hong et al. (ICLR 2024). LLM: DeepSeek-V3.2. We report full distributions, without a post-hoc failure threshold.', { color: MUTED }),
      { x: X0, y: 6.45, w: XW, h: 0.3, fontSize: 10.5, color: MUTED });
    s.addNotes(
      'Here is the instability in one picture. We ran our black-box adaptation of DP-OPT thirty times on GSM8K at epsilon one. The mean is 49.5 percent, but the one-standard-deviation band covers roughly 21 to 78 percent: some runs work well, others collapse. ' +
      'For reference, DP-ES reaches 88.1 plus or minus 3.2 under a tighter bound, about nine times lower standard deviation, and the non-private TextGrad reference is at 95. We report the full distribution rather than labelling runs as failures. The next question is where this variance comes from.');
  }

  /* ---------------- 6. Diagnosis (team slide, native trajectory) ---------------- */
  {
    const s = content('01 Problem', '01 · PROBLEM', 'Diagnosis: why token-level DP construction collapses');
    text(s, paras([
      '!{Greedy token-by-token construction} samples each next token from privately aggregated histogram counts.',
      '!{Noise-driven, irreversible choices.} Privacy noise can flip a token choice; with no backtracking, one early decision redirects all later tokens.',
      '!{Template drift.} The constructed prompt silently loses the structural placeholder the task needs.',
    ], {}, 6), { x: X0, y: 1.6, w: 6.6, h: 2.35, fontSize: 14.5, lineSpacingMultiple: 1.25 });
    text(s, '21 / 33', { x: 8.056, y: 1.55, w: 4.444, h: 0.85, fontFace: HEAD, fontSize: 48, color: RED });
    text(s, rt('candidate prompts omit the @{«question»} placeholder in !{one representative logged GSM8K trajectory} (2/3 selected prompts omit it) — evidence of !{template drift}, not a failure rate.', { color: MUTED }),
      { x: 8.056, y: 2.45, w: 4.444, h: 1.35, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    const steps = [
      ['ITER 0 · SELECTED', 'Carefully solve the following math question and provide a clear explanation of your reasoning: %{«question»}', true],
      ['ITER 1 · SELECTED', 'Solve the math problem step-by-step, ensuring each step is clearly explained and justified before proceeding to the next.', false],
      ['ITER 2 · SELECTED (FINAL)', 'Present a structured solution by enumerating each step, explaining the purpose of that step, and confirming its correctness before continuing.', false],
    ];
    const cw = (XW - 2 * 0.35) / 3, cy = 4.12, ch = 2.35;
    steps.forEach(([h, p, ok], i) => {
      const x = X0 + i * (cw + 0.35);
      frame(s, x, cy, cw, ch, ok ? null : HEX.lt2);
      text(s, h, { x: x + 0.2, y: cy + 0.18, w: cw - 0.4, h: 0.25, fontFace: MONO, fontSize: 10.5, bold: true, color: FAINT, charSpacing: 1 });
      text(s, rt(p, { italic: true }), { x: x + 0.2, y: cy + 0.5, w: cw - 0.4, h: 1.3, fontFace: HEAD, fontSize: 14, lineSpacingMultiple: 1.15 });
      tag(s, ok ? '{QUESTION} KEPT' : '{QUESTION} LOST', x + 0.2, cy + ch - 0.45, 1.75, !ok);
      if (i < 2) text(s, '→', { x: x + cw + 0.02, y: cy + ch / 2 - 0.2, w: 0.31, h: 0.4, fontSize: 18, color: FAINT, align: 'center', valign: 'middle' });
    });
    text(s, rt('Real DP-OPT log (seed 42 — a high-accuracy run, 91%). The evaluator appends the question when the placeholder is absent: a !{structural-drift diagnostic}, not a zero-accuracy event.', { color: MUTED }),
      { x: X0, y: 6.6, w: XW, h: 0.25, fontSize: 10.5, color: MUTED });
    s.addNotes(
      'We see three structural causes. DP-OPT builds the prompt greedily, one token at a time, by private voting over histogram counts. Noise can flip a token choice, and since there is no backtracking, one early decision redirects everything after it. And nothing checks global structure, so the prompt can drift. ' +
      'Below is a real logged trajectory, seed 42. At iteration 0 the selected prompt contains the question placeholder; by iterations 1 and 2 the selected prompts are fluent instructions, but the placeholder is gone. Across the search, 21 of 33 candidates omit it. ' +
      'We are careful here: this run still reaches 91 percent, because our harness appends the question when the placeholder is missing. So this is a drift diagnostic, not a failure count. The implication is to change the search unit.');
  }

  /* ---------------- 7. Core idea (team slide) ---------------- */
  pres.addSection({ title: '02 Idea' });
  {
    const s = content('02 Idea', '02 · IDEA', 'Core idea: decouple exploration from privacy spending');
    text(s, [
      { text: 'Evolve a population of ', options: { italic: true } }, { text: 'complete prompts', options: { italic: true, bold: true } }, { text: '.', options: { italic: true, breakLine: true } },
      { text: 'Pay privacy budget ', options: { italic: true } }, { text: 'only for scoring', options: { italic: true, bold: true } }, { text: '.', options: { italic: true } },
    ], { x: X0, y: 1.694, w: XW, h: 1.083, fontFace: HEAD, fontSize: 30, color: RED_DK, lineSpacingMultiple: 1.2 });
    const rows = [
      ['MUTATION', 'privacy-free', 'An LLM rewrites complete prompt strings. It never accesses /{D} — by the !{post-processing property}, exploration can be arbitrarily rich at !{zero privacy cost}.'],
      ['SCORING', 'touches D', '!{Sampled-Gaussian evaluation} is the only step that reads the private dataset — the entire budget is concentrated here and composed by an !{RDP accountant}.'],
      ['SELECTION', 'post-processing', 'Top-/{M} parents chosen from !{privatized scores} (deterministic or Gumbel-smoothed). Uses only released values — !{zero additional privacy loss}.'],
    ];
    rows.forEach(([a, b, d], i) => {
      const y = 3.139 + i * 1.12;
      hrule(s, X0, y, XW);
      monoLabel(s, a, b, X0, y + 0.22, 2.361);
      text(s, d, { x: 3.472, y: y + 0.22, w: 9.028, h: 0.8, fontSize: 15.5, lineSpacingMultiple: 1.3 });
    });
    hrule(s, X0, 3.139 + 3 * 1.12, XW);
    text(s, rt('This instantiates the Private Evolution principle from DP data synthesis (Lin et al., 2024; Xie et al., 2024) for prompt optimization.', { color: MUTED }),
      { x: X0, y: 6.64, w: XW, h: 0.22, fontSize: 10.5, color: MUTED });
    s.addNotes(
      'So the core idea is to decouple exploration from privacy spending. We evolve a population of complete prompts, and we pay privacy budget only for scoring. ' +
      'Mutation is privacy-free: an LLM rewrites complete prompt strings and never sees the private data, so by post-processing, exploration can be as rich as we like at zero privacy cost. Scoring is the only step that reads the private dataset; the whole budget is concentrated there and composed by a Renyi-DP accountant. Selection picks the top parents from privatized scores only, so it is again post-processing. ' +
      'This is the Private Evolution principle from DP data synthesis, applied to prompt optimization.');
  }

  /* ---------------- 8. Three phases (team slide, native diagram) ---------------- */
  pres.addSection({ title: '03 Method' });
  {
    const s = content('03 Method', '03 · METHOD', 'DP-ES: three phases per iteration');
    const zw = (XW - 2 * 0.45) / 3, zy = 2.0, zh = 3.0;
    const zones = [
      { lab: 'PHASE 1 · PRIVACY-FREE', name: 'LLM mutation', eq: '/{P}_{t} ← Mutate-to-/{K}(/{S}_{t−1}),  |/{P}_{t}| = /{K}', d: 'Builds a fixed /{K}-candidate population from the selected parents; never reads /{D}.', tag: '0 ADDITIONAL PRIVACY LOSS', fill: null },
      { lab: 'PHASE 2 · PRIVATE-DATA ACCESS', name: 'DP scoring', eq: '/{s̃}_{p} = /{s}_{p}(/{B}) + /{N}(0, (/{z}Δ_{B})^{2})', d: 'Each candidate releases one clipped, sampled-Gaussian score computed on a fresh batch /{B} ⊂ /{D}.', tag: '≤ TK SCORE RELEASES', fill: HEX.lt2 },
      { lab: 'PHASE 3 · POST-PROCESSING', name: 'Select parents', eq: '/{S}_{t} = top-/{M} of privatized scores', d: 'Gumbel-smoothed (fixed, data-independent β) or deterministic; reads only released scores.', tag: '0 ADDITIONAL PRIVACY LOSS', fill: null },
    ];
    zones.forEach((z, i) => {
      const x = X0 + i * (zw + 0.45);
      frame(s, x, zy, zw, zh, z.fill);
      text(s, z.lab, { x: x + 0.25, y: zy + 0.22, w: zw - 0.5, h: 0.25, fontFace: MONO, fontSize: 10.5, bold: true, color: i === 1 ? RED : FAINT, charSpacing: 1 });
      text(s, z.name, { x: x + 0.25, y: zy + 0.55, w: zw - 0.5, h: 0.45, fontFace: HEAD, fontSize: 22 });
      text(s, rt(z.eq), { x: x + 0.25, y: zy + 1.12, w: zw - 0.5, h: 0.4, fontFace: MATH, fontSize: 14.5 });
      text(s, rt(z.d, { color: MUTED }), { x: x + 0.25, y: zy + 1.6, w: zw - 0.5, h: 0.8, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
      tag(s, z.tag, x + 0.25, zy + zh - 0.48, zw - 0.5, i === 1);
      if (i < 2) text(s, '→', { x: x + zw + 0.02, y: zy + zh / 2 - 0.25, w: 0.41, h: 0.5, fontSize: 22, color: FAINT, align: 'center', valign: 'middle' });
    });
    // feedback loop
    const c1 = X0 + zw / 2, c3 = X0 + 2 * (zw + 0.45) + zw / 2, ly = 1.66;
    line(s, c3, zy, c3, ly, { color: HEX.dk2, width: 1.25 });
    line(s, c1, ly, c3, ly, { color: HEX.dk2, width: 1.25 });
    s.addShape(pres.shapes.LINE, { x: c1, y: ly, w: 0, h: zy - ly, line: { color: HEX.dk2, width: 1.25, endArrowType: 'triangle' } });
    s.addText(rt('top-/{M} parents /{S}_{t} → next iteration (× /{T})'), { shape: pres.shapes.RECTANGLE, x: X0 + XW / 2 - 1.9, y: ly - 0.16, w: 3.8, h: 0.32,
      fill: { color: PAPER }, line: { type: 'none' }, fontSize: 12, color: INK, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    const z2 = X0 + zw + 0.45;
    text(s, rt('↑  reads %{D}: the private optimization set (/{n} records)', { color: RED }), { x: z2, y: zy + zh + 0.08, w: zw, h: 0.3, fontSize: 12, color: RED, align: 'center' });
    callout(s, '!{Privacy accounting.} Only Phase 2 accesses /{D}. At most /{T}·/{K} sampled-Gaussian score releases compose in one RDP accountant; with /{n} = 200, /{b} = 10, /{z} = 10, /{K} = 6, /{T} = 3, AutoDP gives !{ε ≤ 0.71 at δ = 10}^{−5} — conservatively stated as ε ≤ 1. Mutation and selection add no privacy loss.', 5.65, 0.95, 12);
    s.addNotes(
      'Here is one iteration. Phase one: an LLM mutates the current parents into K complete candidate prompts. The mutation LLM sees only prompts, never records, so this step is post-processing and costs no privacy. ' +
      'Phase two, shaded, is the only place private data enters: each candidate is scored on a freshly sampled batch, the per-record utility is clipped, averaged, and released with Gaussian noise. ' +
      'Phase three selects the top M parents using only the privatized scores, so it is again post-processing. The loop repeats T times. Over the whole run there are at most T times K score releases, and that number alone determines the privacy cost: with our settings, epsilon at most 0.71.');
  }

  /* ---------------- 9. Formal update rule ---------------- */
  {
    const s = content('03 Method', '03 · METHOD', 'One iteration, formally');
    const lw = 7.35;
    const rows = [
      ['MUTATE', 'privacy-free', ['/{P}_{t} ← Mutate-to-/{K}(/{S}_{t−1}),   |/{P}_{t}| = /{K}'],
        'The mutation LLM sees only parent prompts — never records or record-derived feedback.'],
      ['SCORE', 'touches D', ['/{u}_{i}(/{p}) = 1[LLM(/{p}, /{x}_{i}) = /{y}_{i}],   /{s}_{p}(/{B}) = (1//{b}) Σ_{i∈B} clip(/{u}_{i}(/{p}), [0, /{C}])',
        '/{s̃}_{p} = /{s}_{p}(/{B}) + /{N}(0, σ^{2}),   σ = /{zC}//{b}'],
        'Fresh uniform batch /{B} ⊂ /{D}, |/{B}| = /{b}, per candidate; sensitivity /{C}//{b}.'],
      ['SELECT', 'post-processing', ['/{ŝ}_{p} = /{s̃}_{p} + Gumbel(0, β)  (default),   or   /{ŝ}_{p} = /{s̃}_{p}  (deterministic)'],
        '/{S}_{t} ← top-/{M}(/{P}_{t}, /{ŝ}); the best-so-far prompt /{p}^{*} is tracked from /{s̃}.'],
    ];
    const hs = [1.4, 1.75, 1.4];
    let y = 1.62;
    rows.forEach(([a, b, eqs, d], i) => {
      if (i) hrule(s, X0, y - 0.1, lw);
      monoLabel(s, a, b, X0, y + 0.05, 1.9);
      eqs.forEach((e, j) => text(s, rt(e), { x: 2.85, y: y + 0.05 + j * 0.4, w: lw - 2.0, h: 0.36, fontFace: MATH, fontSize: 14 }));
      text(s, rt(d, { color: MUTED }), { x: 2.85, y: y + 0.12 + eqs.length * 0.4, w: lw - 2.0, h: 0.55, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.25 });
      y += hs[i] + 0.2;
    });
    vrule(s, 8.55, 1.62, 5.1);
    const rx = 8.95, rw = X1 - rx;
    label(s, 'CONFIGURATION (ALL TASKS)', rx, 1.62, rw);
    booktabs(s, [
      ['Symbol', 'Value', 'Meaning'],
      ['/{K}', '6', 'candidates per round'],
      ['/{M}', '2', 'parents kept'],
      ['/{T}', '3', 'rounds (iterations)'],
      ['/{b}', '10', 'scoring batch size'],
      ['/{z}', '10', 'noise multiplier'],
      ['/{C}', '1', 'clipping bound'],
      ['/{n}', '200', 'private records'],
      ['mode', '—', 'BALANCED mutation'],
    ], { x: rx, y: 1.95, w: rw, colW: [0.75, 0.6, rw - 1.35], rowH: 0.43, fontSize: 12.5, align: ['left', 'center', 'left'] });
    text(s, rt('Fixed in advance; not selected using task utility.', { italic: true, color: MUTED }), { x: rx, y: 6.0, w: rw, h: 0.3, fontSize: 11, color: MUTED });
    s.addNotes(
      'Slightly more formally. Mutation produces exactly K candidates from the parent set; we use a balanced mode that mixes larger and smaller semantic edits. ' +
      'Scoring: for each candidate we draw a fresh batch of b records, compute a zero-one correctness utility, clip it, average it, and add Gaussian noise with standard deviation z times C over b. ' +
      'Selection: by default we add Gumbel noise with a fixed, data-independent scale before taking the top M, purely to smooth rank inversions; deterministic top-M is the beta-equals-zero case. Both are post-processing. ' +
      'On the right is the single configuration used for every task, fixed in advance and not tuned on utility.');
  }

  /* ---------------- 10. Setup ---------------- */
  pres.addSection({ title: '04 Results' });
  {
    const s = content('04 Results', '04 · RESULTS', 'Experimental setup: four tasks, one fixed configuration');
    const tw = (XW - 3 * 0.5) / 4;
    const tasks = [
      ['GSM8K', 'Multi-step math reasoning', '200-example optimization set; full 1,319-example test set'],
      ['MEDQA', 'Medical multiple-choice QA', '200-question USMLE subset; near-ceiling regime'],
      ['BANKING77', 'Intent classification', '77 classes, 200 examples; large label space'],
      ['ALPACA', 'Instruction following', '200 instructions; LLM-judge score (DeepSeek-Chat)'],
    ];
    tasks.forEach(([n, t, d], i) => {
      const x = X0 + i * (tw + 0.5);
      if (i) vrule(s, x - 0.25, 1.72, 2.3);
      label(s, n, x, 1.72, tw);
      text(s, t, { x, y: 2.05, w: tw, h: 0.8, fontFace: HEAD, fontSize: 21, lineSpacingMultiple: 1.05 });
      text(s, d, { x, y: 2.95, w: tw, h: 1.0, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    });
    hrule(s, X0, 4.3, XW);
    const cw = (XW - 2 * 0.5) / 3;
    const info = [
      ['MODELS', ['DeepSeek-V3.2 via API (main results)', 'Qwen2.5-7B-Instruct, local (validation)']],
      ['BASELINES', ['DP-OPT, black-box adaptation (ε = 1)', 'Non-DP TextGrad (a reference, not a bound)', 'PromptDPSGD, soft prompts (local)']],
      ['PROTOCOL', ['Common ceiling ε ≤ 1, δ = 10^{−5}', '30 runs on GSM8K; 3 seeds elsewhere', 'Same initial prompt for all methods']],
    ];
    info.forEach(([h, items], i) => {
      const x = X0 + i * (cw + 0.5);
      if (i) vrule(s, x - 0.25, 4.6, 2.1);
      monoLabel(s, h, '', x, 4.6, cw);
      text(s, paras(items, {}, 6), { x, y: 5.0, w: cw, h: 1.7, fontSize: 14, lineSpacingMultiple: 1.25 });
    });
    s.addNotes(
      'We evaluate on four task families: GSM8K for multi-step math reasoning, MedQA for medical multiple-choice questions, BANKING77 for 77-way intent classification, and Alpaca for open-ended instruction following, scored by an LLM judge. ' +
      'The main experiments use DeepSeek-V3.2 through its API, and we validate locally with Qwen2.5-7B. We compare against DP-OPT in a black-box adaptation at epsilon one, and against non-private TextGrad as a reference. All methods share the same initial prompt, and DP-ES uses one configuration for every task.');
  }

  /* ---------------- 11. Main results (team slide) ---------------- */
  {
    const s = content('04 Results', '04 · RESULTS', 'Main results across four tasks (ε ≤ 1.0, δ = 10^{−5})');
    label(s, 'GSM8K · 30 RUNS', X0, 1.778, 4.167);
    text(s, '+38.6 pp', { x: X0, y: 2.083, w: 4.167, h: 0.972, fontFace: HEAD, fontSize: 56, color: RED });
    text(s, rt('over DP-OPT, with !{≈ 9× lower standard deviation} (3.2 vs 28.5)', { color: MUTED }), { x: X0, y: 3.167, w: 4.167, h: 0.7, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    text(s, '99.7 ± 0.5', { x: X0, y: 4.167, w: 4.167, h: 0.611, fontFace: HEAD, fontSize: 34 });
    text(s, 'MedQA (+6.2 pp over DP-OPT), near the non-DP ceiling', { x: X0, y: 4.833, w: 4.167, h: 0.556, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    booktabs(s, [
      ['Method', 'GSM8K', 'MedQA', 'BANK77', 'Alpaca†'],
      ['Non-DP', '95.0±0.9', '100.0±0.0', '75.0±2.8', '91.7±0.6'],
      ['DP-OPT', '49.5±28.5', '93.5±12.0', '75.3±2.8', '87.1±1.4'],
      ['DP-ES', '88.1±3.2', '99.7±0.5', '73.5±2.2', '86.8±0.8'],
      [{ text: 'Δ (ES−OPT)', options: { color: MUTED } }, { text: '+38.6', options: { color: MUTED } }, { text: '+6.2', options: { color: MUTED } },
        { text: '−1.8', options: { color: MUTED } }, { text: '−0.3', options: { color: MUTED } }],
    ], { x: 5.556, y: 1.75, w: 6.944, colW: [1.667, 1.319, 1.319, 1.319, 1.32], rowH: 0.78, fontSize: 13, headSize: 12.5, hl: [3] });
    text(s, rt('Mean ± std; 30 runs (GSM8K), three seeds (other tasks). All DP results under the stated ceiling ε ≤ 1.0; DP-ES’s recomputed RDP bound is !{ε ≤ 0.71 at δ = 10}^{−5}. †Alpaca: LLM-judge ratings scaled to percentages. Largest gains where prompt structure matters; parity on BANKING77 and Alpaca.', { color: MUTED }),
      { x: 5.556, y: 5.889, w: 6.944, h: 0.95, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.3 });
    s.addNotes(
      'Here are the main results. On GSM8K, DP-ES reaches 88.1 percent versus 49.5 for DP-OPT, a gain of 38.6 points with about nine times lower standard deviation, and within seven points of the non-private reference. On MedQA, 99.7 versus 93.5. ' +
      'On BANKING77 and Alpaca the two private methods are within two points of each other. So the advantage is task-dependent: it is largest when prompt structure is critical, as in multi-step reasoning. One caveat: MedQA is near ceiling on this 200-question subset, so we do not over-interpret that gap.');
  }

  /* ---------------- 12. Stability (team slide) ---------------- */
  {
    const s = content('04 Results', '04 · RESULTS', 'Stability: population search survives noisy rankings');
    text(s, paras([
      '!{DP-ES does not eliminate noisy rankings} — its population recovers from them.',
      'Prompt-level mutations operate on !{complete strings}, so the @{«question»} placeholder survives the search (real log below).',
      'Six candidates per round supply intact !{alternatives} after noise-induced rank inversions.',
    ], {}, 8), { x: X0, y: 1.639, w: 5.972, h: 2.75, fontSize: 14.5, lineSpacingMultiple: 1.3 });
    s.addImage({ path: path.join(FIG, 'diversity_curve.png'), x: 7.222, y: 1.639, w: 5.278, h: 2.694, sizing: { type: 'contain', w: 5.278, h: 2.694 },
      altText: 'Line plot: mean pairwise cosine distance between prompt embeddings falls from about 0.15 at iteration 1 to about 0.03 by iteration 4; mean 0.096.' });
    frame(s, 7.222, 1.639, 5.278, 2.694);
    text(s, 'Population diversity (mean pairwise prompt-embedding distance): high early, then converges.', { x: 7.222, y: 4.389, w: 5.278, h: 0.45, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.25 });
    frame(s, X0, 5.0, XW, 1.75, HEX.lt2);
    text(s, 'FINAL DP-ES PROMPT · GSM8K · REAL LOG (ε ≤ 1.0)', { x: X0 + 0.25, y: 5.17, w: 7.5, h: 0.25, fontFace: MONO, fontSize: 10.5, bold: true, color: FAINT, charSpacing: 1 });
    tag(s, '{QUESTION} PRESERVED', X1 - 2.45, 5.13, 2.2, false);
    text(s, rt('“You are a math tutor. Solve the question carefully and show reasoning: %{«question»}  (Provide detailed reasoning and justification.)  (Be concise and accurate.)”', { italic: true }),
      { x: X0 + 0.25, y: 5.5, w: XW - 0.5, h: 0.6, fontFace: HEAD, fontSize: 16, lineSpacingMultiple: 1.2 });
    text(s, rt('!{Result:} 88.1 ± 3.2% versus DP-OPT’s 49.5 ± 28.5% across 30 runs — complete alternatives persist across rounds.', { color: MUTED }),
      { x: X0 + 0.25, y: 6.25, w: XW - 0.5, h: 0.3, fontSize: 12, color: MUTED });
    s.addNotes(
      'Why does evolution work better under noise? DP-ES does not eliminate noisy rankings; its population recovers from them. On the right is population diversity, the mean pairwise embedding distance between prompts: early iterations are diverse, around 0.15, before the population converges. So DP-ES holds several complete hypotheses at once, and when Gaussian noise swaps two scores, a good alternative is still in the population. ' +
      'At the bottom is the final DP-ES prompt from a logged GSM8K run. Because mutations operate on whole strings, the question placeholder is preserved.');
  }

  /* ---------------- 13. Ablations & local model ---------------- */
  {
    const s = content('04 Results', '04 · RESULTS', 'Ablations: selector, population size, and a local model');
    const cw = (XW - 2 * 0.5) / 3;
    const xs = [0, 1, 2].map((i) => X0 + i * (cw + 0.5));
    [1, 2].forEach((i) => vrule(s, xs[i] - 0.25, 1.72, 5.0));
    label(s, 'SELECTOR · GSM8K · 5 SEEDS', xs[0], 1.72, cw);
    booktabs(s, [
      ['Selector', 'Accuracy (%)'],
      ['Gumbel-smoothed', '88.8 ± 3.4'],
      ['Deterministic', '88.6 ± 2.9'],
    ], { x: xs[0], y: 2.1, w: cw, colW: [cw * 0.55, cw * 0.45], rowH: 0.46, fontSize: 13 });
    text(s, 'Both rules post-process privatized scores, so the privacy guarantee is identical; accuracy differs by only 0.2 pp. Gumbel smoothing stays the default, with no claimed variance advantage.',
      { x: xs[0], y: 3.7, w: cw, h: 2.2, fontSize: 13.5, lineSpacingMultiple: 1.3 });
    label(s, rt('POPULATION SIZE · K·T ≤ 24'), xs[1], 1.72, cw);
    s.addChart(pres.charts.BAR, [{ name: 'GSM8K accuracy (%)', labels: ['K=3, T=4', 'K=6, T=3', 'K=9, T=2', 'K=12, T=2'], values: [78.5, 86.5, 82.0, 82.0] }], {
      x: xs[1] - 0.1, y: 2.0, w: cw + 0.2, h: 2.85, barDir: 'col', barGapWidthPct: 55,
      chartColors: [HEX.accent5, HEX.accent1, HEX.accent5, HEX.accent5],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0', dataLabelFontSize: 11,
      valAxisMinVal: 60, valAxisMaxVal: 95, valAxisMajorUnit: 10, valAxisLabelFontSize: 10, catAxisLabelFontSize: 10.5,
      valGridLine: { color: HEX.accent4, size: 0.5 }, catGridLine: { style: 'none' }, showLegend: false, ...chartText,
    });
    text(s, rt('/{K} = 6, /{T} = 3 balances diversity and depth: small /{K} explores too narrowly; large /{K} leaves too few refinement rounds.'),
      { x: xs[1], y: 5.0, w: cw, h: 1.2, fontSize: 13.5, lineSpacingMultiple: 1.3 });
    label(s, rt('LOCAL QWEN2.5-7B · ε ≤ 1 · 3 SEEDS'), xs[2], 1.72, cw);
    booktabs(s, [
      ['Method', 'GSM8K', 'MedQA'],
      ['DP-ES', '53.8±6.1', '81.2±1.3'],
      ['DP-OPT', '37.4±11.6', '83.0±2.1'],
      ['PromptDPSGD', '20.0±5.8', '34.8±19.0'],
      ['Non-DP', '26.2±10.2', '79.5±4.2'],
    ], { x: xs[2], y: 2.1, w: cw, colW: [cw * 0.38, cw * 0.31, cw * 0.31], rowH: 0.44, fontSize: 12, hl: [1] });
    text(s, 'The reasoning gain transfers (+16.4 pp on GSM8K, half the std); MedQA is comparable — the main trend is not API-specific.',
      { x: xs[2], y: 4.55, w: cw, h: 1.6, fontSize: 13.5, lineSpacingMultiple: 1.3 });
    s.addNotes(
      'Three robustness checks. Left: Gumbel-smoothed and deterministic top-M selection reach 88.8 and 88.6 percent over five seeds. Both are post-processing, so privacy is identical; we keep smoothing as the default but do not claim a variance advantage. ' +
      'Middle: with K times T capped at 24, K equals six and T equals three gives the best trade-off between population diversity and the number of refinement rounds. ' +
      'Right: with a local Qwen2.5-7B model, DP-ES beats DP-OPT by 16.4 points on GSM8K with half the standard deviation, and the two are comparable on MedQA, the same task-dependent pattern as with the API model. The soft-prompt baseline PromptDPSGD trails both discrete methods.');
  }

  /* ---------------- 14. Formal guarantee ---------------- */
  pres.addSection({ title: '05 Privacy' });
  {
    const s = content('05 Privacy', '05 · PRIVACY', 'Formal guarantee: ε ≤ 0.71 at δ = 10^{−5}');
    const lw = 7.0;
    const st = [
      ['PROPOSITION 1', 'Mutation is privacy-free', 'Mutate sees only a public or previously privatized parent prompt, so by post-processing it consumes zero privacy budget.'],
      ['PROPOSITION 2', 'Decoupled exploration', 'Privacy loss depends only on the score releases — not on the number or strength of mutations per iteration.'],
      ['THEOREM', 'End-to-end (ε, δ)-DP', 'Composing ≤ /{TK} sampled-Gaussian releases in Rényi DP (uniform subsampling without replacement) gives (ε, δ)-DP for the released prompt; selection is post-processing.'],
    ];
    st.forEach(([a, h, d], i) => {
      const y = 1.66 + i * 1.62;
      if (i) hrule(s, X0, y - 0.15, lw);
      text(s, a, { x: X0, y, w: 2.2, h: 0.25, fontFace: MONO, fontSize: 11, bold: true, color: RED, charSpacing: 1 });
      text(s, h, { x: X0, y: y + 0.3, w: lw, h: 0.4, fontFace: HEAD, fontSize: 20 });
      text(s, rt(d), { x: X0, y: y + 0.75, w: lw, h: 0.65, fontSize: 13.5, lineSpacingMultiple: 1.3 });
    });
    vrule(s, 8.25, 1.66, 5.1);
    const rx = 8.65, rw = X1 - rx;
    label(s, 'ACCOUNTING FOR THE REPORTED RUNS', rx, 1.66, rw);
    const acc = [['/{n} = 200, /{b} = 10', '/{q} = /{b}//{n} = 0.05'], ['/{z} = 10, /{C} = 1', 'σ = /{zC}//{b} = 1.0'], ['/{K} = 6, /{T} = 3', '≤ 18 releases']];
    acc.forEach(([a, b], i) => {
      const y = 2.05 + i * 0.5;
      text(s, rt(a), { x: rx, y, w: 1.7, h: 0.38, fontFace: MATH, fontSize: 14, valign: 'middle' });
      text(s, '→', { x: rx + 1.7, y, w: 0.35, h: 0.38, fontSize: 15, color: FAINT, align: 'center', valign: 'middle' });
      text(s, rt(b), { x: rx + 2.05, y, w: rw - 2.05, h: 0.38, fontFace: MATH, fontSize: 14, color: RED, valign: 'middle' });
    });
    hrule(s, rx, 3.68, rw);
    text(s, rt('AutoDP Rényi-DP accountant at δ = 10^{−5}', { color: MUTED }), { x: rx, y: 3.85, w: rw, h: 0.3, fontSize: 12, color: MUTED });
    text(s, 'ε = 0.705', { x: rx, y: 4.2, w: rw, h: 0.95, fontFace: MATH, fontSize: 48, color: RED });
    text(s, rt('Reported conservatively as ε ≤ 1, the setting used for DP-OPT.', { color: MUTED }), { x: rx, y: 5.2, w: rw, h: 0.55, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 });
    text(s, '$ python scripts/compute_privacy.py', { x: rx, y: 6.05, w: rw, h: 0.3, fontFace: MONO, fontSize: 11.5, color: INK });
    s.addNotes(
      'The privacy argument is short. Proposition one: mutation sees only public or already privatized prompts, so it is post-processing and free. Proposition two follows: privacy loss is independent of how many or how strong the mutations are, which is exactly the decoupling we want. ' +
      'The theorem composes at most T times K sampled-Gaussian releases with a Renyi-DP accountant for sampling without replacement. ' +
      'With 200 records, batch 10, noise multiplier 10, and 18 releases, AutoDP gives epsilon 0.705 at delta ten to the minus five. We report the common conservative ceiling epsilon at most one, DP-OPT’s stated setting. The script in our repository reproduces this number.');
  }

  /* ---------------- 15. Checks & stress test (team slide, native) ---------------- */
  {
    const s = content('05 Privacy', '05 · PRIVACY', 'Implementation checks and a memorization stress test');
    text(s, paras([
      '!{Noise-distribution check.} 1,000 injected-noise samples pass a Kolmogorov–Smirnov test against the configured Gaussian mechanism.',
      '!{Stress-test setup.} 200 synthetic customer profiles × 6 sensitive strings (name, phone, email, address, street fragment, account ID) = !{1,200 strings}; we count exact and near-verbatim matches in the final prompt.',
      '!{Adversarial control.} The non-DP optimizer is shown raw records and told to embed a directory; DP-ES mutation never receives records.',
    ], {}, 8), { x: X0, y: 1.639, w: 5.0, h: 3.9, fontSize: 13.5, lineSpacingMultiple: 1.3 });
    const bx = 6.25, bw = (X1 - bx - 0.3) / 2, by = 1.639, bh = 3.75;
    const sides = [
      { x: bx, lab: 'NON-DP CONTROL', big: '40', cap: 'strings leaked (3.33%)', fill: null, red: false,
        ex: 'Use this customer directory:\nJessica Moore, (713) 907-8800,\njessica.moore83@mail.com;\nAnthony Williams,\n(312) 991-9095,\nanthony.williams60@mail.com; …' },
      { x: bx + bw + 0.3, lab: 'DP-ES', big: '0', cap: 'strings leaked (0.0%)', fill: HEX.lt2, red: true,
        ex: 'You are a customer service\nassistant. Retrieve relevant\ninformation based on user\nqueries. If the query involves\naccount information, verify\nbefore responding.' },
    ];
    sides.forEach((d) => {
      frame(s, d.x, by, bw, bh, d.fill);
      text(s, d.lab, { x: d.x + 0.22, y: by + 0.18, w: bw - 0.44, h: 0.25, fontFace: MONO, fontSize: 11, bold: true, color: d.red ? RED : FAINT, charSpacing: 1 });
      text(s, d.big, { x: d.x + 0.22, y: by + 0.45, w: bw - 0.44, h: 0.85, fontFace: HEAD, fontSize: 48, color: d.red ? RED : INK });
      text(s, d.cap, { x: d.x + 0.22, y: by + 1.3, w: bw - 0.44, h: 0.28, fontSize: 12, color: MUTED });
      hrule(s, d.x + 0.22, by + 1.72, bw - 0.44);
      text(s, 'Final prompt (excerpt)', { x: d.x + 0.22, y: by + 1.85, w: bw - 0.44, h: 0.25, fontSize: 10.5, color: MUTED, italic: true });
      text(s, d.ex, { x: d.x + 0.22, y: by + 2.15, w: bw - 0.44, h: 1.5, fontFace: MONO, fontSize: 9.5, color: INK, lineSpacingMultiple: 1.2 });
    });
    text(s, 'Synthetic profiles; excerpts and counts reproduced from the saved run.', { x: bx, y: by + bh + 0.08, w: X1 - bx, h: 0.22, fontSize: 10.5, color: MUTED });
    hrule(s, X0, 5.72, XW);
    callout(s, '!{Reading of the evidence.} The guarantee comes from mechanism-level RDP accounting — attack-agnostic by construction. The stress test is a !{targeted sanity check}: it is not membership inference and does not cover semantic leakage; finite audits cannot certify DP.', 5.95, 0.8, 12);
    s.addNotes(
      'Beyond the formal guarantee, we ran targeted diagnostics. First, the logged noise draws: 1,000 samples are consistent with the configured Gaussian under a Kolmogorov-Smirnov test. ' +
      'Second, a memorization stress test: 200 synthetic customer profiles with six sensitive strings each, 1,200 strings in total. An intentionally adversarial non-private control, shown the raw records and asked to embed a directory, ends up with 40 of those strings in its prompt. DP-ES, whose mutation never sees records, contains none. ' +
      'To be clear, these are sanity checks for implementation errors. They do not test semantic leakage or membership inference, and they cannot certify DP; the guarantee comes from the accountant.');
  }

  /* ---------------- 16. Efficiency (team slide, with trade-off and chart) ---------------- */
  pres.addSection({ title: '06 Efficiency and scope' });
  {
    const s = content('06 Efficiency and scope', '06 · EFFICIENCY & SCOPE', 'Efficiency: faster, with fewer private-data round trips');
    const lw = 5.3;
    const stats = [
      ['WALL-CLOCK (GSM8K, API)', '2.5×', 'faster', '17.9 h vs 45.7 h for DP-OPT', INK],
      ['PRIVATE-DATA ACCESS', '3.3×', 'fewer', 'logged private-data call groups: 10 vs 33 (DP-ES mutations never touch D)', INK],
      ['THE TRADE-OFF', '2.8×', 'more tokens', '11,120 vs 4,016 in a representative run — DP-ES trades tokens for robustness', RED],
    ];
    stats.forEach(([l, v, w, c, col], i) => {
      const y = 1.66 + i * 1.45;
      if (i) hrule(s, X0, y - 0.12, lw);
      label(s, l, X0, y, lw);
      text(s, [{ text: v + ' ', options: { fontSize: 40, color: col } }, { text: w, options: { fontSize: 18, color: MUTED } }],
        { x: X0, y: y + 0.25, w: lw, h: 0.65, fontFace: HEAD, valign: 'bottom' });
      text(s, c, { x: X0, y: y + 0.95, w: lw, h: 0.3, fontSize: 11.5, color: MUTED });
    });
    vrule(s, 6.55, 1.66, 4.0);
    const rx = 6.95, rw = X1 - rx;
    label(s, 'WALL-CLOCK HOURS · FOUR SETTINGS', rx, 1.66, rw);
    s.addChart(pres.charts.BAR, [
      { name: 'DP-ES', labels: ['MedQA (Qwen2.5-7B)', 'GSM8K (Qwen2.5-7B)', 'MedQA (API)', 'GSM8K (API)'], values: [1.87, 7.37, 7.0, 17.9] },
      { name: 'DP-OPT', labels: ['MedQA (Qwen2.5-7B)', 'GSM8K (Qwen2.5-7B)', 'MedQA (API)', 'GSM8K (API)'], values: [3.24, 14.6, 18.4, 45.7] },
    ], {
      x: rx - 0.1, y: 1.95, w: rw + 0.1, h: 3.7, barDir: 'bar', barGrouping: 'clustered', barGapWidthPct: 45,
      chartColors: [HEX.accent1, HEX.accent6],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0#', dataLabelFontSize: 10.5,
      valAxisMinVal: 0, valAxisMaxVal: 50, valAxisMajorUnit: 10, valAxisLabelFontSize: 10, catAxisLabelFontSize: 11,
      valGridLine: { color: HEX.accent4, size: 0.5 }, catGridLine: { style: 'none' },
      showLegend: true, legendPos: 't', legendFontSize: 11, ...chartText,
    });
    hrule(s, X0, 5.85, XW);
    callout(s, '!{Why faster?} DP-OPT queries private aggregates while constructing tokens and while evaluating; DP-ES mutations never touch /{D}. Fewer serial private-data round trips dominate latency, so wall-clock time drops even though DP-ES uses larger contexts — the advantage is not uniformly lower provider cost.', 6.05, 0.82, 12);
    s.addNotes(
      'DP-ES is also cheaper in time. On GSM8K through the API it takes 17.9 hours versus 45.7 for DP-OPT, 2.5 times faster, and the speed-up holds on MedQA and with the local Qwen model, as the chart shows. ' +
      'The reason is the number of private-data round trips: 10 logged call groups versus 33, because DP-OPT queries private aggregates during token construction as well as evaluation. ' +
      'To be transparent about the trade-off: DP-ES uses larger contexts, about 2.8 times more tokens. So the advantage is lower wall-clock time and fewer private-data round trips, not uniformly lower provider cost.');
  }

  /* ---------------- 17. Scope ---------------- */
  {
    const s = content('06 Efficiency and scope', '06 · EFFICIENCY & SCOPE', 'Scope: what we establish — and what remains open');
    const cw = (XW - 0.8) / 2;
    const L = [
      'More robust optimization under DP noise than token-level construction, especially where prompt structure is critical',
      'A formal record-level guarantee (ε ≤ 0.71, δ = 10^{−5}) from mechanism-level RDP accounting',
      'Lower wall-clock time and fewer private-data round trips than DP-OPT',
    ];
    const R = [
      'End-to-end validation on genuinely sensitive, non-saturated deployment data',
      'MedQA is near ceiling (Non-DP 100.0%), limiting its discriminative power',
      'Attacks: exact-match only — no membership inference or record reconstruction',
      'One privacy level (ε ≤ 1), not a densely sampled privacy–utility frontier',
      'Advantage is task-dependent: parity on BANKING77 and Alpaca',
    ];
    const col = (x, head, items, mark, gap) => {
      label(s, head, x, 1.66, cw);
      items.forEach((it, i) => {
        const y = 2.0 + i * gap;
        hrule(s, x, y, cw);
        text(s, mark, { x, y: y + 0.13, w: 0.4, h: 0.3, fontFace: MONO, fontSize: 13, bold: true, color: RED });
        text(s, rt(it), { x: x + 0.45, y: y + 0.12, w: cw - 0.45, h: gap - 0.16, fontSize: 13.5, lineSpacingMultiple: 1.2 });
      });
    };
    col(X0, 'SUPPORTED BY THE EVIDENCE', L, '+', 1.23);
    vrule(s, X0 + cw + 0.4, 1.66, 4.0);
    col(X0 + cw + 0.8, 'OPEN — FUTURE WORK', R, '?', 0.74);
    hrule(s, X0, 5.85, XW);
    callout(s, '!{Next steps.} Adaptive population sizing · multi-objective search over utility, privacy and stability · federated DP-ES for distributed sensitive data · a theory linking prompt search space to privacy budget.', 6.05, 0.82, 12);
    s.addNotes(
      'We want to be explicit about scope. Our evidence supports three claims: DP-ES is a structurally more robust DP prompt optimizer than token-level construction, especially when prompt structure matters; it carries a formal record-level guarantee from the accountant; and it is faster, with fewer private-data round trips. ' +
      'What we have not shown: end-to-end validation on genuinely sensitive, non-saturated data, which current public benchmarks do not offer; MedQA is near ceiling; our attack coverage is exact-match only; we report one privacy level rather than a full frontier; and the advantage is task-dependent.');
  }

  /* ---------------- 18. Takeaway (team slide) ---------------- */
  {
    const s = pres.addSlide({ masterName: 'PAPER_TITLE', sectionTitle: '06 Efficiency and scope' });
    mainNo++;
    s.addText('TAKEAWAY', { placeholder: 'kicker' });
    text(s, [{ text: 'Decouple exploration from privacy: evolve complete prompts, pay budget ', options: {} }, { text: 'only for scoring', options: { color: RED } }, { text: '.', options: {} }],
      { x: X0, y: 1.528, w: XW, h: 1.667, fontFace: HEAD, fontSize: 34, valign: 'middle', lineSpacingMultiple: 1.2 });
    hrule(s, X0, 3.583, XW);
    const stats = [
      ['88.1 ± 3.2%', 'GSM8K under ε ≤ 1.0', '30 runs · ≈ 9× lower std'],
      ['ε ≤ 0.71', 'recomputed RDP bound', 'at δ = 10^{−5}'],
      ['2.5×', 'faster wall-clock', 'than DP-OPT on GSM8K'],
      ['0 strings', 'synthetic exact-match', 'stress test (200 profiles)'],
    ];
    stats.forEach(([v, a, b], i) => {
      const x = X0 + i * 2.95;
      text(s, rt(v), { x, y: 3.861, w: 2.8, h: 0.6, fontFace: HEAD, fontSize: 30 });
      text(s, paras([a, b]), { x, y: 4.5, w: 2.8, h: 0.65, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.25 });
    });
    hrule(s, X0, 5.361, XW);
    text(s, [{ text: 'github.com/StephCpa/dp-es', options: { hyperlink: { url: 'https://github.com/StephCpa/dp-es' } } }],
      { x: X0, y: 5.722, w: 6.0, h: 0.333, fontFace: MONO, fontSize: 16, color: RED });
    text(s, 'Contact: liaiping@nudt.edu.cn', { x: 7.0, y: 5.75, w: 5.5, h: 0.3, fontSize: 12, color: MUTED, align: 'right' });
    text(s, 'Happy to take questions.', { x: X0, y: 6.278, w: 8.0, h: 0.45, fontFace: HEAD, fontSize: 24, italic: true });
    text(s, 'Ziniu Liu et al. · National University of Defense Technology · EMNLP 2026', { x: X0, y: 7.139, w: 9.0, h: 0.194, fontSize: 10, color: MUTED });
    page(s, `${MAIN_TOTAL} / ${MAIN_TOTAL}`);
    s.addNotes(
      'To summarize: decouple exploration from privacy. Evolve complete prompts, and pay privacy budget only for scoring. ' +
      'That gives 88.1 percent on GSM8K under epsilon at most one, with about nine times lower variance than token-level construction; a recomputed bound of epsilon 0.71; 2.5 times faster wall-clock; and no listed sensitive string in our synthetic stress test. Code, the privacy accountant and the paper source are on GitHub. Thank you, and I am happy to take questions.');
  }

  /* ---------------- Backup ---------------- */
  pres.addSection({ title: 'Backup' });
  {
    const s = content('Backup', 'A · BACKUP', 'Threat model and assumptions', true);
    const items = [
      ['TRUSTED CURATOR', 'The party running DP-ES may access /{D} but releases only the final prompt.'],
      ['RECORD-LEVEL PRIVACY', 'The unit is one record (/{x}_{i}, /{y}_{i}); group privacy scales ε with group size.'],
      ['TRUSTED BOUNDARY', 'The evaluation endpoint is a trusted processor; DP protects the released prompt, not API inputs.'],
      ['MUTATION ISOLATION', 'The mutation LLM sees only parent prompts. PII memorized in pretraining is outside this threat model.'],
      ['POST-PROCESSING SAFETY', 'Downstream use of the released prompt adds no further loss about /{D}.'],
      ['AUDITS ARE NOT PROOFS', 'Empirical checks can expose implementation errors but cannot certify DP; the guarantee is mechanism-level.'],
    ];
    const cw = (XW - 2 * 0.5) / 3;
    items.forEach(([h, d], i) => {
      const x = X0 + (i % 3) * (cw + 0.5), y = 1.72 + Math.floor(i / 3) * 2.55;
      if (i % 3) vrule(s, x - 0.25, y, 2.1);
      if (i >= 3) hrule(s, x, y - 0.3, cw);
      text(s, h, { x, y, w: cw, h: 0.3, fontFace: MONO, fontSize: 12, bold: true, color: RED, charSpacing: 1 });
      text(s, rt(d), { x, y: y + 0.45, w: cw, h: 1.5, fontSize: 15, lineSpacingMultiple: 1.3 });
    });
    s.addNotes('Backup. These are the assumptions behind the formal guarantee, as stated in the appendix of the paper. They match those of DP-OPT and standard DP machine learning.');
  }
  {
    const s = content('Backup', 'A · BACKUP', 'Where the efficiency comes from', true);
    const grp = (t) => [{ text: t, options: { italic: true, bold: true, color: RED, colspan: 4, align: 'left' } }];
    booktabs(s, [
      ['Cost component', 'DP-OPT', 'DP-ES', 'Ratio'],
      grp('Logged private-data call groups'),
      ['Mutation (token-level / privacy-free)', '3 (DP)', '0 (free)', '—'],
      ['Evaluation (Gaussian-noised)', '30', '10', '3.0× fewer'],
      ['!{Total private-data groups}', '!{33}', '!{10}', '!{3.3× fewer}'],
      grp('Token usage'),
      ['Input tokens', '1,309', '6,120', '4.7× more'],
      ['Output tokens', '2,707', '5,000', '1.8× more'],
      ['!{Total tokens}', '!{4,016}', '!{11,120}', '!{2.8× more}'],
      grp('Wall-clock'),
      ['!{Runtime (hours)}', '!{16.6}', '!{6.5}', '!{2.5× faster}'],
      ['Accuracy (single run)', '91.0%', '86.5%', '—'],
    ], { x: X0, y: 1.66, w: 7.8, colW: [3.4, 1.4, 1.4, 1.6], rowH: 0.38, fontSize: 13 });
    text(s, rt('GSM8K, seed 42, ε ≤ 1, 200-example optimization set. Counts are logger-level call groups, not individual requests.', { color: MUTED }),
      { x: X0, y: 6.4, w: 7.8, h: 0.4, fontSize: 10.5, color: MUTED });
    vrule(s, 9.05, 1.66, 4.8);
    const rx = 9.45, rw = X1 - rx;
    label(s, 'READING THE TABLE', rx, 1.66, rw);
    text(s, paras([
      'DP-OPT’s token construction queries private counts, so its mutation calls also enter the accountant.',
      'DP-ES mutation is post-processing; only its evaluation groups touch records.',
      'Fewer serial round trips dominate latency, so runtime drops even though DP-ES uses more tokens. Provider pricing and validation size can change the cost comparison.',
    ], {}, 8), { x: rx, y: 2.0, w: rw, h: 4.3, fontSize: 14, lineSpacingMultiple: 1.3 });
    s.addNotes('Backup. Cost decomposition by call purpose for one representative GSM8K run, from the efficiency appendix of the paper.');
  }
  {
    const s = content('Backup', 'A · BACKUP', 'Reproducing the privacy bound', true);
    const lw = 5.5;
    frame(s, X0, 1.66, lw, 2.75, HEX.lt2);
    const code = [['$ python -m pip install -e .', MUTED], ['$ python scripts/compute_privacy.py', MUTED], ['epsilon=0.705168', INK], ['delta=1e-05', INK], ['releases=18', INK], ['sampling_rate=0.050000', INK]];
    text(s, code.map(([t, c], i) => ({ text: t, options: { color: c, ...(i < code.length - 1 ? { breakLine: true } : {}) } })),
      { x: X0 + 0.3, y: 1.9, w: lw - 0.6, h: 2.3, fontFace: MONO, fontSize: 14, lineSpacingMultiple: 1.35 });
    text(s, rt('Defaults: /{n} = 200, /{b} = 10, /{z} = 10, /{K} = 6, /{T} = 3, δ = 10^{−5}. Recompute whenever any of them changes: a larger /{KT} raises both cost and composed privacy loss.'),
      { x: X0, y: 4.65, w: lw, h: 1.1, fontSize: 14, lineSpacingMultiple: 1.3 });
    vrule(s, 6.7, 1.66, 5.0);
    const rx = 7.05, rw = X1 - rx;
    label(s, 'PRIVACY CONTRACT OF THE RELEASED CODE', rx, 1.66, rw);
    const pc = [
      'Per-record utilities are clipped to a public interval.',
      'Every data-dependent evaluation uses the sampled-Gaussian scorer; raw utilities are never released.',
      'The number of releases is fixed in advance.',
      'Mutation receives no private records or record-derived feedback.',
      'Selection and all later computation use only privatized outputs.',
    ];
    pc.forEach((t, i) => {
      const y = 2.05 + i * 0.9;
      if (i) hrule(s, rx, y - 0.14, rw);
      text(s, String(i + 1).padStart(2, '0'), { x: rx, y, w: 0.6, h: 0.35, fontFace: HEAD, fontSize: 20, color: RED });
      text(s, t, { x: rx + 0.65, y: y + 0.03, w: rw - 0.65, h: 0.72, fontSize: 13.5, lineSpacingMultiple: 1.2 });
    });
    s.addNotes('Backup. The repository reproduces the reported bound with AutoDP; the five conditions on the right are the contract under which the formal guarantee holds.');
  }

  await pres.writeFile({ fileName: OUT });
  await finalize(OUT);
  console.log('wrote', OUT);
}

/* ---------- post-processing ------------------------------------------- */
// 1. theme colours (pptxgenjs writes only the fonts)
// 2. one <a:pPr> per paragraph (pptxgenjs repeats it before every run)
// 3. embed the fonts the team deck embeds (Quattrocento Sans, Unna, JetBrains Mono)
async function finalize(file) {
  const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs')] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const slots = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const scheme = `<a:clrScheme name="${THEME.name}">` + slots.map((k) => `<a:${k}><a:srgbClr val="${THEME.colors[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const tpart = 'ppt/theme/theme1.xml';
  zip.file(tpart, (await zip.file(tpart).async('string'))
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${THEME.name}"`));

  for (const name of Object.keys(zip.files)) {
    if (!/^ppt\/(slides|slideLayouts|slideMasters)\/[^/]+\.xml$/.test(name)) continue;
    const src = await zip.file(name).async('string');
    const out = src.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (para, body) => {
      let seen = false;
      return '<a:p>' + body.replace(/<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, (m) => (seen ? '' : ((seen = true), m))) + '</a:p>';
    });
    if (out !== src) zip.file(name, out);
  }

  if (fs.existsSync(TEAM_DECK)) {
    const team = await JSZip.loadAsync(fs.readFileSync(TEAM_DECK));
    const tpres = await team.file('ppt/presentation.xml').async('string');
    const trels = await team.file('ppt/_rels/presentation.xml.rels').async('string');
    const wanted = ['Quattrocento Sans', 'Unna', 'JetBrains Mono'];
    const entries = [];
    for (const m of tpres.matchAll(/<p:embeddedFont>([\s\S]*?)<\/p:embeddedFont>/g)) {
      const face = /typeface="([^"]+)"/.exec(m[1])[1];
      if (!wanted.includes(face)) continue;
      const rid = /r:id="([^"]+)"/.exec(m[1])[1];
      const target = new RegExp(`Id="${rid}"[^>]*Target="([^"]+)"`).exec(trels)[1];
      entries.push({ body: m[1], target });
    }
    let rels = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
    let pxml = await zip.file('ppt/presentation.xml').async('string');
    const list = [];
    for (let i = 0; i < entries.length; i++) {
      const rid = `rIdFont${i + 1}`;
      zip.file(`ppt/fonts/font${i + 1}.fntdata`, await team.file(`ppt/${entries[i].target}`).async('nodebuffer'));
      rels = rels.replace('</Relationships>', `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font${i + 1}.fntdata"/></Relationships>`);
      list.push(`<p:embeddedFont>${entries[i].body.replace(/r:id="[^"]+"/, `r:id="${rid}"`)}</p:embeddedFont>`);
    }
    if (list.length) {
      pxml = pxml.replace('<p:presentation ', '<p:presentation embedTrueTypeFonts="1" ')
        .replace(/(<p:notesSz[^>]*\/>)/, `$1<p:embeddedFontLst>${list.join('')}</p:embeddedFontLst>`);
      zip.file('ppt/presentation.xml', pxml);
      zip.file('ppt/_rels/presentation.xml.rels', rels);
      let ct = await zip.file('[Content_Types].xml').async('string');
      if (!ct.includes('Extension="fntdata"')) ct = ct.replace('<Default ', '<Default Extension="fntdata" ContentType="application/x-fontdata"/><Default ');
      zip.file('[Content_Types].xml', ct);
    }
  }

  for (const name of Object.keys(zip.files)) {
    if (!name.endsWith('.xml')) continue;
    const bad = (await zip.file(name).async('string')).match(/<a:srgbClr val="(?![0-9A-Fa-f]{6}")[^"]*"/);
    if (bad) throw new Error(`${name}: scheme colour passed to a hex-only option (${bad[0]})`);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

build().catch((e) => { console.error(e); process.exit(1); });
