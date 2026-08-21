# DP-ES

Official implementation for **DP-ES: Differentially Private Evolution
Strategies for Prompt Optimization**, accepted to the EMNLP 2026 main
conference.

DP-ES diagnoses structural failures in token-level private prompt construction
and instead evolves full prompts. Mutations do not access the private dataset;
privacy is spent only when candidate utilities are released through a
sampled-Gaussian scorer. Parent selection uses only privatized scores and is
therefore post-processing.

## What is included

- A standalone sampled-Gaussian scorer with a fixed public release plan.
- RDP accounting through AutoDP for uniform sampling without replacement.
- Deterministic and Gumbel-smoothed selection over privatized scores.
- A minimal full-prompt evolution loop with an isolated mutation interface.
- Regression tests for the paper's main privacy configuration.
- Prompt-only trajectory excerpts supporting the GSM8K case study.
- Camera-ready paper source.

## Install

```bash
git clone https://github.com/StephCpa/dp-es.git
cd dp-es
python -m venv .venv
source .venv/bin/activate
python -m pip install -e .
```

## Reproduce the privacy bound

The paper's conservative plan uses a dataset of 200 records, batch size 10,
noise multiplier 10, population size 6, and 3 iterations. This yields 18
sampled-Gaussian releases and the bound
`(epsilon <= 0.705168, delta = 1e-5)`.

```bash
python scripts/compute_privacy.py
```

Expected output:

```text
epsilon=0.705168
delta=1e-05
releases=18
sampling_rate=0.050000
```

## Run the local example and tests

```bash
python examples/toy_prompt_optimization.py
python -m unittest discover -s tests -v
```

The toy example uses no external model and requires no API key. In an actual
LLM setup, implement `mutation_fn(prompt, rng)` with your model client and keep
that callback independent of private records and record-derived feedback.

## Privacy contract

The formal guarantee depends on the following conditions:

1. Per-record utilities are clipped to the public interval configured by
   `clipping_value`.
2. All data-dependent candidate evaluations pass through
   `SampledGaussianScorer`; raw utilities are not released.
3. The number of releases is fixed in advance and does not exceed
   `max_releases`.
4. Prompt mutation receives no private records or record-derived textual
   feedback.
5. Selection and all later computation use only privatized outputs.

Empirical audits can help detect implementation errors, but they do not prove
differential privacy. The guarantee comes from the mechanism definition and
the RDP accounting under these assumptions.

## Paper

The camera-ready LaTeX source is under [`paper/`](paper/). A complete citation
will be added when the ACL Anthology record becomes available.

```bibtex
@inproceedings{liu2026dpes,
  title     = {{DP-ES}: Differentially Private Evolution Strategies for Prompt Optimization},
  author    = {Liu, Ziniu and Li, Aiping and Han, Yue and Yu, Han and Zhang, Junjian and Zhu, Dong and Li, Changjian and Zhang, Shiqiang},
  booktitle = {Proceedings of the 2026 Conference on Empirical Methods in Natural Language Processing},
  year      = {2026}
}
```

## License and provenance

Released under the MIT License. The research code originated from experiments
built on TextGrad; see [`NOTICE`](NOTICE) for provenance. The standalone public
package has no TextGrad runtime dependency.
