"""RDP accounting for the sampled-Gaussian scorer used by DP-ES."""

from __future__ import annotations

from dataclasses import dataclass
import warnings

import numpy as np

# AutoDP versions before full NumPy 2 support still reference ``np.infty``.
if not hasattr(np, "infty"):
    np.infty = np.inf  # type: ignore[attr-defined]

from autodp import mechanism_zoo, transformer_zoo


@dataclass(frozen=True)
class PrivacyReport:
    """Public accounting parameters and their composed privacy bound."""

    dataset_size: int
    batch_size: int
    noise_multiplier: float
    num_releases: int
    delta: float
    epsilon: float


def sampled_gaussian_epsilon(
    *,
    dataset_size: int,
    batch_size: int,
    noise_multiplier: float,
    num_releases: int,
    delta: float,
) -> float:
    """Compute epsilon for repeated sampled-Gaussian score releases.

    Sampling is uniform without replacement. The base mechanism uses
    replace-one adjacency, and ``noise_multiplier`` is the Gaussian standard
    deviation divided by the sensitivity of the clipped batch mean.
    """
    if dataset_size <= 0:
        raise ValueError("dataset_size must be positive")
    if not 0 < batch_size <= dataset_size:
        raise ValueError("batch_size must be in [1, dataset_size]")
    if noise_multiplier <= 0:
        raise ValueError("noise_multiplier must be positive")
    if num_releases <= 0:
        raise ValueError("num_releases must be positive")
    if not 0 < delta < 1:
        raise ValueError("delta must be in (0, 1)")

    gaussian = mechanism_zoo.GaussianMechanism(noise_multiplier)
    gaussian.neighboring = "replace_one"
    amplify = transformer_zoo.AmplificationBySampling(PoissonSampling=False)
    sampled = amplify(gaussian, batch_size / dataset_size)
    composed = transformer_zoo.Composition()([sampled], [num_releases])

    with warnings.catch_warnings():
        warnings.filterwarnings(
            "ignore",
            message="invalid value encountered in scalar divide",
            category=RuntimeWarning,
        )
        return float(composed.get_approxDP(delta))


def privacy_report(**kwargs: float | int) -> PrivacyReport:
    """Return accounting inputs together with the resulting epsilon."""
    return PrivacyReport(epsilon=sampled_gaussian_epsilon(**kwargs), **kwargs)
