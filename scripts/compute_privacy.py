#!/usr/bin/env python3
"""Reproduce the privacy bound reported for the main DP-ES configuration."""

from __future__ import annotations

import argparse

from dpes import privacy_report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset-size", type=int, default=200)
    parser.add_argument("--batch-size", type=int, default=10)
    parser.add_argument("--noise-multiplier", type=float, default=10.0)
    parser.add_argument("--population-size", type=int, default=6)
    parser.add_argument("--iterations", type=int, default=3)
    parser.add_argument("--delta", type=float, default=1e-5)
    args = parser.parse_args()

    report = privacy_report(
        dataset_size=args.dataset_size,
        batch_size=args.batch_size,
        noise_multiplier=args.noise_multiplier,
        num_releases=args.population_size * args.iterations,
        delta=args.delta,
    )
    print(f"epsilon={report.epsilon:.6f}")
    print(f"delta={report.delta:g}")
    print(f"releases={report.num_releases}")
    print(f"sampling_rate={report.batch_size / report.dataset_size:.6f}")


if __name__ == "__main__":
    main()
