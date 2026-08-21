"""Standalone DP-ES optimization primitives."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
import math
import random
from typing import Any, Callable, Generic, Sequence, TypeVar

from .accounting import sampled_gaussian_epsilon

Record = TypeVar("Record")
MutationFn = Callable[[str, random.Random], str]
UtilityFn = Callable[[str, Record], float]


@dataclass(frozen=True)
class Candidate:
    """A full-prompt candidate carrying only a privatized score."""

    prompt: str
    dp_score: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ScorerConfig:
    """Fixed public parameters for the sampled-Gaussian scorer."""

    dataset_size: int
    batch_size: int
    noise_multiplier: float
    max_releases: int
    delta: float
    clipping_value: float = 1.0

    def __post_init__(self) -> None:
        if self.dataset_size <= 0:
            raise ValueError("dataset_size must be positive")
        if not 0 < self.batch_size <= self.dataset_size:
            raise ValueError("batch_size must be in [1, dataset_size]")
        if self.noise_multiplier <= 0:
            raise ValueError("noise_multiplier must be positive")
        if self.max_releases <= 0:
            raise ValueError("max_releases must be positive")
        if not 0 < self.delta < 1:
            raise ValueError("delta must be in (0, 1)")
        if self.clipping_value <= 0:
            raise ValueError("clipping_value must be positive")

    @property
    def sensitivity(self) -> float:
        return self.clipping_value / self.batch_size

    @property
    def noise_std(self) -> float:
        return self.noise_multiplier * self.sensitivity

    @property
    def epsilon_bound(self) -> float:
        return sampled_gaussian_epsilon(
            dataset_size=self.dataset_size,
            batch_size=self.batch_size,
            noise_multiplier=self.noise_multiplier,
            num_releases=self.max_releases,
            delta=self.delta,
        )


class SampledGaussianScorer(Generic[Record]):
    """Release noisy clipped-mean utilities under a fixed release plan."""

    def __init__(self, private_records: Sequence[Record], config: ScorerConfig):
        if len(private_records) != config.dataset_size:
            raise ValueError("private_records length must equal dataset_size")
        self._private_records = private_records
        self.config = config
        self.releases = 0

    def score(
        self,
        candidate: Candidate,
        utility_fn: UtilityFn[Record],
        *,
        rng: random.Random,
    ) -> Candidate:
        if self.releases >= self.config.max_releases:
            raise RuntimeError("sampled-Gaussian release plan exhausted")

        records = rng.sample(self._private_records, self.config.batch_size)
        values = [
            min(self.config.clipping_value, max(0.0, float(utility_fn(candidate.prompt, record))))
            for record in records
        ]
        mean = sum(values) / self.config.batch_size
        noisy_score = mean + rng.gauss(0.0, self.config.noise_std)
        self.releases += 1
        return replace(candidate, dp_score=float(noisy_score))


def select_top_k(
    candidates: Sequence[Candidate],
    k: int,
    *,
    rng: random.Random,
    gumbel_scale: float = 0.0,
) -> list[Candidate]:
    """Select candidates using only already-privatized scores.

    Deterministic top-k and optional Gumbel-smoothed top-k are post-processing,
    so this function has zero additional privacy cost.
    """
    if k <= 0:
        raise ValueError("k must be positive")
    if gumbel_scale < 0:
        raise ValueError("gumbel_scale must be non-negative")

    ranked: list[tuple[float, Candidate]] = []
    for candidate in candidates:
        if candidate.dp_score is None:
            raise ValueError("all candidates must have a privatized score")
        noise = 0.0
        if gumbel_scale:
            u = min(1.0 - 1e-12, max(1e-12, rng.random()))
            noise = -math.log(-math.log(u)) * gumbel_scale
        ranked.append((candidate.dp_score + noise, candidate))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return [candidate for _, candidate in ranked[: min(k, len(ranked))]]


@dataclass(frozen=True)
class EvolutionConfig:
    population_size: int = 6
    iterations: int = 3
    parents_to_select: int = 2
    gumbel_scale: float = 0.0
    seed: int = 42

    def __post_init__(self) -> None:
        if self.population_size <= 0 or self.iterations <= 0:
            raise ValueError("population_size and iterations must be positive")
        if not 0 < self.parents_to_select <= self.population_size:
            raise ValueError("parents_to_select must be in [1, population_size]")
        if self.gumbel_scale < 0:
            raise ValueError("gumbel_scale must be non-negative")


class DPEvolutionStrategy(Generic[Record]):
    """Optimize full prompts while isolating mutation from private records.

    The mutation callback receives only a parent prompt and an RNG. Private
    records are reachable solely through ``SampledGaussianScorer``.
    """

    def __init__(
        self,
        *,
        scorer: SampledGaussianScorer[Record],
        mutation_fn: MutationFn,
        utility_fn: UtilityFn[Record],
        config: EvolutionConfig = EvolutionConfig(),
    ) -> None:
        expected_releases = config.population_size * config.iterations
        if scorer.config.max_releases != expected_releases:
            raise ValueError(
                "max_releases must equal population_size * iterations for the fixed plan"
            )
        self.scorer = scorer
        self.mutation_fn = mutation_fn
        self.utility_fn = utility_fn
        self.config = config
        self.rng = random.Random(config.seed)

    def _mutate_population(self, parents: Sequence[Candidate]) -> list[Candidate]:
        return [
            Candidate(self.mutation_fn(parents[i % len(parents)].prompt, self.rng))
            for i in range(self.config.population_size)
        ]

    def optimize(self, initial_prompt: str) -> Candidate:
        population = self._mutate_population([Candidate(initial_prompt)])
        best: Candidate | None = None

        for iteration in range(self.config.iterations):
            scored = [
                self.scorer.score(candidate, self.utility_fn, rng=self.rng)
                for candidate in population
            ]
            iteration_best = max(scored, key=lambda item: float(item.dp_score))
            if best is None or float(iteration_best.dp_score) > float(best.dp_score):
                best = iteration_best

            if iteration + 1 < self.config.iterations:
                parents = select_top_k(
                    scored,
                    self.config.parents_to_select,
                    rng=self.rng,
                    gumbel_scale=self.config.gumbel_scale,
                )
                population = self._mutate_population(parents)

        assert best is not None
        return best
