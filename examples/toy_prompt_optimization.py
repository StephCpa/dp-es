"""Run DP-ES on a tiny local objective without any API credentials."""

from __future__ import annotations

import random

from dpes import DPEvolutionStrategy, EvolutionConfig, SampledGaussianScorer, ScorerConfig


def mutate(prompt: str, rng: random.Random) -> str:
    suffixes = [" Explain each step.", " Be concise.", " Verify the answer."]
    return prompt + rng.choice(suffixes)


def utility(prompt: str, desired_phrase: str) -> float:
    return float(desired_phrase.lower() in prompt.lower())


def main() -> None:
    records = ["explain", "verify"] * 100
    evolution = EvolutionConfig(population_size=6, iterations=3, seed=42)
    scorer = SampledGaussianScorer(
        records,
        ScorerConfig(
            dataset_size=200,
            batch_size=10,
            noise_multiplier=10.0,
            max_releases=evolution.population_size * evolution.iterations,
            delta=1e-5,
        ),
    )
    optimizer = DPEvolutionStrategy(
        scorer=scorer,
        mutation_fn=mutate,
        utility_fn=utility,
        config=evolution,
    )
    best = optimizer.optimize("Solve the question: {question}")
    print(best.prompt)
    print(f"privatized_score={best.dp_score:.6f}")
    print(f"epsilon<={scorer.config.epsilon_bound:.6f}")


if __name__ == "__main__":
    main()
