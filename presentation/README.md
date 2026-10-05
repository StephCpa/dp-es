# EMNLP 2026 talk

Slides for the online presentation of **DP-ES: Differentially Private Evolution
Strategies for Prompt Optimization**.

| File | Purpose |
| --- | --- |
| `DP-ES_EMNLP2026_Talk.pptx` | Editable 16:9 deck with speaker notes on every slide |
| `DP-ES_EMNLP2026_Talk.pdf` | Static backup for screen sharing (rendered with metric-compatible substitutes for Cambria/Calibri) |
| `build_slides.js` | Generator for the deck; all numbers come from the camera-ready paper in `../paper` |

## Structure (about 12-15 minutes)

| # | Section | Slide |
| --- | --- | --- |
| 1-2 | Opening | Title; outline and one-sentence summary |
| 3-4 | Motivation | Leakage risk in prompt optimization; problem setting and related methods |
| 5-7 | Diagnosis | DP-OPT variance on GSM8K (30 runs); logged template drift; three structural causes |
| 8-10 | Method | DP-ES workflow; one round in detail; privacy guarantee and accounting |
| 11-16 | Results | Setup; main results; population dynamics; efficiency; ablations and local model; memorization stress test |
| 17-18 | Scope and conclusion | What is and is not established; takeaways and Q&A |
| 19-21 | Backup | Threat model; efficiency breakdown; reproducing the privacy bound |

Speaker notes total about 1,750 words for slides 1-18, roughly 12-13 minutes at a
normal speaking pace. For a 10-minute slot, slides 13 (population dynamics) and
15 (ablations) can be skipped without breaking the narrative.

## Rebuild

The script needs `pptxgenjs`, `react`, `react-dom`, `react-icons` and `sharp`:

```bash
npm install pptxgenjs react react-dom react-icons sharp   # in any directory
NODE_PATH=<that directory>/node_modules node presentation/build_slides.js
```

The deck uses the theme fonts Cambria (headings) and Calibri (body), which ship
with Microsoft Office.
