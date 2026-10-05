# EMNLP 2026 talk

Slides for the online presentation of **DP-ES: Differentially Private Evolution
Strategies for Prompt Optimization**.

| File | Purpose |
| --- | --- |
| `DP-ES_EMNLP2026_Talk.pptx` | The talk: 18 main slides plus 3 backup slides, with speaker notes on every slide |
| `DP-ES_EMNLP2026_Talk.pdf` | Static backup for screen sharing |
| `DP-ES_ Differentially Private Evolution Strategies for Prompt Op.pptx` | The team's 10-slide version; its design is the basis of the talk, and the build copies its embedded fonts |
| `build_slides.js` | Generator for the talk; all numbers come from the camera-ready paper in `../paper` |

## Design

The talk keeps the team version's look: paper background, Unna titles,
Quattrocento Sans body text, JetBrains Mono labels, a crimson accent, hairline
rules and booktabs tables. The three fonts are embedded in the `.pptx`, so it
renders the same on machines that do not have them. Greek letters and math
symbols, which those fonts lack, are set in Cambria (ships with Microsoft
Office); the PDF uses a substitute for Cambria.

## Structure (about 12-15 minutes)

| # | Section | Slides |
| --- | --- | --- |
| 1-2 | Opening | Title; outline |
| 3-6 | 01 Problem | Why privacy and stability; setting and related methods; DP-OPT run-to-run spread; diagnosis with the logged trajectory |
| 7 | 02 Idea | Decouple exploration from privacy spending |
| 8-9 | 03 Method | Three phases per iteration; the formal update rule and configuration |
| 10-13 | 04 Results | Setup; main results; stability under noise; ablations and local model |
| 14-15 | 05 Privacy | End-to-end guarantee and accounting; implementation checks and stress test |
| 16-18 | 06 Efficiency & scope | Efficiency and its token trade-off; scope and limitations; takeaway |
| B1-B3 | Backup | Threat model; efficiency breakdown; reproducing the privacy bound |

Speaker notes total about 1,750 words for slides 1-18, roughly 12-13 minutes at a
normal speaking pace. For a 10-minute slot, slides 5 (run-to-run spread),
9 (formal update rule) and 13 (ablations) can be skipped without breaking the
narrative.

## Rebuild

```bash
npm install pptxgenjs          # in any directory
NODE_PATH=<that directory>/node_modules node presentation/build_slides.js
```

The build reads the team version (for its embedded fonts) and
`../paper/figures/diversity_curve.png`.
