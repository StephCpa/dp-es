from __future__ import annotations

import random
import unittest

from dpes import (
    Candidate,
    DPEvolutionStrategy,
    EvolutionConfig,
    SampledGaussianScorer,
    ScorerConfig,
    sampled_gaussian_epsilon,
    select_top_k,
)


class DPESTest(unittest.TestCase):
    def test_main_configuration_accounting(self) -> None:
        epsilon = sampled_gaussian_epsilon(
            dataset_size=200,
            batch_size=10,
            noise_multiplier=10.0,
            num_releases=18,
            delta=1e-5,
        )
        self.assertAlmostEqual(epsilon, 0.705168, places=6)
        self.assertLessEqual(epsilon, 0.71)

    def test_full_set_variant(self) -> None:
        epsilon = sampled_gaussian_epsilon(
            dataset_size=200,
            batch_size=200,
            noise_multiplier=200.0,
            num_releases=18,
            delta=1e-5,
        )
        self.assertAlmostEqual(epsilon, 0.070084, places=6)

    def test_selection_only_uses_dp_scores(self) -> None:
        candidates = [Candidate("a", 0.2), Candidate("b", 0.8)]
        selected = select_top_k(candidates, 1, rng=random.Random(0))
        self.assertEqual(selected[0].prompt, "b")

    def test_fixed_release_plan(self) -> None:
        evolution = EvolutionConfig(population_size=2, iterations=2, seed=1)
        scorer = SampledGaussianScorer(
            ["a", "b", "c", "d"],
            ScorerConfig(
                dataset_size=4,
                batch_size=2,
                noise_multiplier=10.0,
                max_releases=4,
                delta=1e-5,
            ),
        )
        optimizer = DPEvolutionStrategy(
            scorer=scorer,
            mutation_fn=lambda prompt, _rng: prompt + "!",
            utility_fn=lambda prompt, record: float(record in prompt),
            config=evolution,
        )
        result = optimizer.optimize("a")
        self.assertEqual(scorer.releases, 4)
        self.assertIsNotNone(result.dp_score)

    def test_release_plan_exhaustion(self) -> None:
        scorer = SampledGaussianScorer(
            [0, 1],
            ScorerConfig(2, 1, 10.0, 1, 1e-5),
        )
        candidate = Candidate("prompt")
        scorer.score(candidate, lambda _prompt, record: float(record), rng=random.Random(0))
        with self.assertRaises(RuntimeError):
            scorer.score(candidate, lambda _prompt, record: float(record), rng=random.Random(0))


if __name__ == "__main__":
    unittest.main()
