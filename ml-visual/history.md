# WiDS 2025 — Complete Approach History

This document catalogues every distinct modelling approach used across the entire project.

---

## Phase 1: Baseline Statistical Models (ai_model_v3 → v8)

These were the first-generation models using standard survival analysis libraries.

| Model | Strategy | Key Library | Submission |
|---|---|---|---|
| `ai_model_v3.py` | RSF + CoxPH ensemble with imputed data | sksurv | `submission_v3_imputed_data.csv` |
| `ai_model_v4.py` | GBSA + RSF blend, Platt Scaling calibration | sksurv | `submission_v4.csv` |
| `ai_model_v5.py` | Claude V1 — full pipeline with Optuna tuning | sksurv + optuna | `submission_claude_v1.csv` |
| `ai_model_v6.py` | Simplified GBSA | sksurv | `submission_v6.csv` |
| `ai_model_v7.py` | Isotonic calibration added | sksurv | `submission_v7.csv` |
| `ai_model_v8.py` | Weighted ensemble (GBSA/RSF) | sksurv | `submission_v8.csv` |

**Key Lesson:** Pure statistical models plateau around 0.955–0.960 without physics features.

---

## Phase 2: Physics-Informed ML (ai_model_v9 → v10i)

Discovered the 4.8km "Oracle" boundary from EDA. Added physics features.

| Model | Strategy | Innovation |
|---|---|---|
| `ai_model_v9.py` | Physics features (dist_sigmoid, TTI) added | First use of `dist_sigmoid` boundary |
| `ai_model_v9b.py` | Soft Expert version with calibration | Isotonic post-calibration |
| `ai_model_v10.py` through `v10i.py` | Iterative tuning of blend weights + KM correction | 9 variants exploring weight space |

**Key Lesson:** `dist_sigmoid` (4.8km boundary) was the single most powerful feature in the entire project.

---

## Phase 3: The "Soft Expert" Two-Brain Architecture (final_soft_16_04)

First true specialisation of the model by fire type.

| Model | Strategy | Innovation |
|---|---|---|
| `final_soft_16_04.py` | Split into Static Brain (1-perimeter) + Dynamic Brain (multi-perimeter) | Two-Brain architecture |
| `final_soft_16_04_fixed.py` | Bug-fixed version | Fixed indentation/structural errors |
| `final_soft_17_04.py` | Added seasonal weighting | Extended Two-Brain with time features |
| `FIXED_RANK_BLENDED_16_04.py` | Fixed ranking with blended output | Rank-blended submission |

**Key Lesson:** Separating static fires (distance-only) from dynamic fires (kinematics) dramatically improved C-index.

---

## Phase 4: Physics Ensemble with Digital Twins (V11)

The first model to combine all physics insights into a single rigorous CV pipeline.

| Model | Strategy | Score |
|---|---|---|
| `v11_physics_ensemble.py` | 5-fold CatBoost Two-Brain + 15x Digital Twins + Isotonic Calibration + TTI Gate | **0.9695 OOF Hybrid** |

**Key Innovations:**
- **Independent-Jitter Digital Twins** (1,200 synthetic fires)
- **TTI Physics Gate** — only silences fires that are physically unable to arrive in 72h
- **Per-horizon Isotonic Calibration** — maps model scores to real-world frequencies

---

## Phase 5: Stability & Diversity Ensemble (V12 → V15)

Explored three different ways to improve upon V11.

| Model | Strategy | OOF Hybrid | File |
|---|---|---|---|
| `v12_seed_blender.py` | 10-seed average of V11 | **0.9719** 🏆 | `submission_v12_seed_blender.csv` |
| `v13_pseudo_labeling.py` | High-confidence test fires added to training | 0.9669 | `submission_v13_pseudo.csv` |
| `v14_meta_stacker.py` | CatBoost + GBSA + RSF blended by Ridge meta-learner | 0.9706 | `submission_v14_stacking.csv` |
| `v15_master_blend.py` | 60% V12 + 40% V14 weighted average | ~0.9713 | `submission_v15_master_blend.csv` |

---

## Phase 6: Physics-Calibration Expert System (widsv37 → wids50 → final1/final2)

Moved away from ML entirely. Used empirical training distributions + mathematical solvers.

| Model | Strategy | Key Innovation |
|---|---|---|
| `widsv37.py` | Pure calibration: Empirical targets + Additive Mean Snap | Foundation approach |
| `wids50.py` | Kinetic Momentum Ranking + Solar Window Factor + Polarization (^1.6) + 250-cycle Lagrangian Solver | **0.974+ score** |
| `widsfinal.py` | Post-processor: loads V31, applies rank-preserving multiplicative scaling + "Squeeze" | Best calibration corrector |
| `final1.py` (V58) | Wids50 + Seasonal Hazard multiplier + Dynamic per-horizon spread | 0.974+ |
| `final2.py` (V75) | 5-fold WeibullAFT + CoxPH ranking + Power-1.5 polarization | Private LB Shield |

---

## Complete Approach Taxonomy

```
APPROACH 1: Pure Survival Statistics
  RSF, GBSA, CoxPH (sksurv) — V3 to V8

APPROACH 2: Physics-Feature ML
  dist_sigmoid, TTI, vector_momentum — V9 to V10i

APPROACH 3: Specialised Two-Brain
  Static Expert + Dynamic Expert — final_soft_16_04

APPROACH 4: Digital Twin Augmentation
  Independent-jitter synthetic fires — V11

APPROACH 5: Seed Stability Blending
  10-seed averaging of best model — V12

APPROACH 6: Pseudo-Labeling
  High-confidence test fires → training set — V13

APPROACH 7: Multi-Model Meta-Stacking
  CatBoost + GBSA + RSF → Ridge meta-learner — V14

APPROACH 8: Pure Calibration Expert
  Empirical KM targets + Lagrangian Snap — widsv37, wids50

APPROACH 9: Kinetic Momentum Expert
  Area × Speed / sqrt(Distance) × SolarFactor — wids50, final1

APPROACH 10: Cross-Validated Survival Ranking
  5-fold WeibullAFT + CoxPH blend — final2
```

---

## Best Submissions by Approach

| Approach | Best File | Known Score |
|---|---|---|
| Pure Calibration + Kinetic | `submission_momentum_oracle.csv` | **0.974+** |
| Kinetic + Seasonal | `submission_v52.csv` (final1 output) | **0.974+** |
| Seed Blender | `submission_v12_seed_blender.csv` | 0.9719 OOF |
| Meta-Stacker | `submission_v14_stacking.csv` | 0.9706 OOF |
| Physics Ensemble | `submission_v11_physics_ensemble.csv` | 0.9695 OOF |
