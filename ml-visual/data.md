# Detailed Analysis Report — WiDS Datathon 2026 Wildfire Prediction Project

## Project Overview

The project titled **“WiDS Datathon 2026”** focuses on predicting whether an active wildfire will reach within **5 km of an evacuation zone within 72 hours** using advanced Machine Learning and Survival Analysis techniques.

The project was developed under the guidance of **Prof. Sneha Varur** in the Department of Computer Science and Engineering (Artificial Intelligence).

This work combines:

* Survival Analysis
* Ensemble Learning
* Graph Neural Networks (GNNs)
* Spatial-Temporal Data Analysis
* Disaster Prediction
* Climate & Social Impact Analytics

The project is highly aligned with current trends in:

* AI for Climate
* Disaster Intelligence
* Geo-spatial AI
* Risk Forecasting
* Smart Emergency Systems

---

# 1. Core Problem Understanding

## Problem Statement

The system predicts:

> “Will a wildfire reach within 5 km of an evacuation zone in the next 72 hours?”

This is not a simple classification problem.

It is a:

* **Time-to-event prediction problem**
* Survival analysis problem
* Spatio-temporal forecasting problem

The project attempts to understand:

* Fire growth
* Fire movement direction
* Speed
* Distance reduction
* Infrastructure threat
* Temporal progression

---

# 2. Why This Problem is Important

Wildfires globally are increasing because of:

* Climate change
* Drought
* Heat waves
* Deforestation
* Human activity

Impacts include:

* Loss of human life
* Infrastructure destruction
* Air pollution
* Ecological collapse
* Economic losses

The project has real-world operational importance because it can support:

* Emergency evacuation systems
* Fire department planning
* Infrastructure protection
* Government disaster response
* Smart city resilience systems

---

# 3. Dataset Analysis

## Dataset Characteristics

| Parameter             | Value                    |
| --------------------- | ------------------------ |
| Total wildfire events | 221                      |
| Features              | 37                       |
| Prediction horizon    | 72 hours                 |
| Positive class        | 31.2%                    |
| Source                | Watch Duty / WiDS Kaggle |

This is a **small but highly specialized dataset**.

---

# 4. Dataset Feature Categories

The dataset is very well-structured and scientifically designed.

## A. Temporal Features

These represent time-related wildfire behavior.

Examples:

* Number of perimeter snapshots
* Time gap between observations
* Event start month
* Day of week
* Event start hour

Purpose:

* Capture wildfire evolution over time.

---

## B. Growth Features

These describe how rapidly the wildfire expands.

Examples:

* Area growth
* Growth rate
* Relative growth
* Radial expansion

These are extremely important because fast-growing fires are more dangerous.

---

## C. Kinematic Features

Kinematics means motion.

Examples:

* Fire centroid displacement
* Fire movement speed
* Spread direction
* Movement trajectory

This helps estimate:

* How fast the fire moves
* Which direction it is traveling

---

## D. Distance Features

These are the most important features in the project.

Examples:

* Minimum distance to evacuation zone
* Distance slope
* Closing speed
* Projected advance distance

The report clearly shows:

> Fires reaching evacuation zones start dramatically closer to infrastructure.

---

## E. Direction Features

These determine whether the wildfire is moving toward or away from the evacuation zone.

Examples:

* Alignment cosine
* Along-track speed
* Cross-track movement

This is a very intelligent engineering addition.

---

# 5. Strong Domain Understanding

One of the strongest parts of this project is the domain understanding.

The team did not simply apply ML blindly.

They understood:

* Fire spread physics
* Spatial behavior
* Distance progression
* Survival prediction logic
* Disaster management implications

This is extremely important in real AI projects.

---

# 6. Survival Analysis — Advanced Concept

The project uses **Survival Analysis**, which is usually used in:

* Healthcare
* Reliability engineering
* Failure prediction
* Risk modeling

Here it is adapted for wildfire prediction.

## Meaning

The model predicts:

> “How long until the wildfire becomes dangerous?”

instead of only:

* Fire / No Fire

This makes the system far more realistic.

---

# 7. Censoring Handling

A highly advanced concept included in the project is:

## Censoring

Some fires never reach the evacuation zone within 72 hours.

These are not failures.
They are “censored observations.”

This is exactly why survival analysis is appropriate.

This shows excellent technical maturity.

---

# 8. Feature Engineering Quality

The feature engineering is one of the strongest components.

The project created meaningful derived features such as:

* Closing speed
* Alignment metrics
* Distance acceleration
* Projected advance
* Relative growth

These are high-value engineered features.

In ML competitions and industry projects:

> Good features often matter more than complex models.

---

# 9. Data Preprocessing Analysis

The preprocessing pipeline is properly structured.

## Steps Included

### A. Data Generation / Expansion

Because the dataset had only 220 records:

* Temporal expansion was used.

Purpose:

* Reduce overfitting
* Increase training diversity
* Improve generalization

This is a smart decision for small datasets.

---

### B. Data Cleaning

Includes:

* Missing value handling
* Duplicate removal
* Error correction
* Consistency checking

This is standard but essential.

---

### C. Feature Scaling

Scaling ensures:

* Numerical stability
* Faster convergence
* Balanced feature contribution

Especially useful for:

* Distance metrics
* Growth metrics
* Speed-based variables

---

# 10. Exploratory Data Analysis (EDA)

The EDA section is excellent.

---

## A. Class Imbalance

| Class     | Percentage |
| --------- | ---------- |
| Event = 0 | 68.8%      |
| Event = 1 | 31.2%      |

The project correctly identifies:

* Moderate imbalance

Solutions used:

* SMOTE
* Class weighting

Good industry-standard approach.

---

## B. Seasonal Trend Analysis

The report found:

> 62% of wildfire events occur during July–August.

This is highly meaningful.

Temporal seasonality is important in:

* Disaster forecasting
* Environmental AI
* Climate modeling

---

## C. Correlation Analysis

Top predictors:

* Time-to-hit
* Distance to infrastructure
* Temporal resolution
* Closing speed
* Growth rate

This validates the domain assumptions.

---

# 11. Key Insight — Most Important Finding

The strongest analytical insight:

> Fires breaching evacuation zones begin 54× closer to infrastructure.

Median distances:

* Dangerous fires: 2.4 km
* Safe fires: 131 km

This is a very powerful and actionable result.

Real-world implications:

* Infrastructure zoning
* Early warning thresholds
* Evacuation prioritization
* Smart alert systems

---

# 12. Feature Selection Strategy

The project combines:

* Correlation analysis
* Tree-based importance
* Domain expertise

This is the correct professional approach.

Not relying only on statistics is important.

---

# 13. Machine Learning Architecture

The project uses an **ensemble survival framework**.

Models used:

| Model                  | Purpose                  |
| ---------------------- | ------------------------ |
| XGBoost AFT            | Time-to-event prediction |
| XGBoost Cox            | Risk ranking             |
| Random Survival Forest | Nonlinear relationships  |
| Weibull Survival Model | Probabilistic estimation |

This is a highly advanced pipeline.

---

# 14. Why Ensemble Learning Was Smart

Each model captures different patterns.

## Advantages

### XGBoost Cox

Good for ranking risk.

### AFT Model

Good for estimating actual time.

### RSF

Captures nonlinear interactions.

### Weibull

Provides statistical survival estimation.

Combining them improves:

* Robustness
* Stability
* Accuracy

---

# 15. Performance Evaluation

## Main Metric: Concordance Index (C-Index)

The project achieved:

| Model    | C-Index |
| -------- | ------- |
| XGB AFT  | 0.942   |
| XGB Cox  | 0.951   |
| RSF      | 0.958   |
| Weibull  | 0.946   |
| Ensemble | 0.981   |

A C-Index near **0.98** is extremely high.

This indicates:

* Excellent ranking capability
* Strong predictive performance

---

# 16. Optimization Techniques

The project includes sophisticated optimization methods.

## A. Rank-Based Blending

Very strong competition-level technique.

Improves:

* Calibration
* Stability
* Final score quality

---

## B. Confidence Weighting

High-quality observations receive higher weight.

This reduces:

* Noise
* Low-resolution data impact

Excellent engineering choice.

---

## C. Survival Constraints

Including:

* Monotonicity constraints
* Forecast horizon consistency

This improves realism.

---

# 17. Training Curves Analysis

The training curves indicate:

* Stable convergence
* No severe overfitting
* Good validation consistency

Loss decreases smoothly.
Accuracy increases progressively.

This indicates:

* Proper hyperparameter tuning
* Good preprocessing
* Stable learning pipeline

---

# 18. Graph Neural Networks (GNNs)

The project mentions GNN usage for:

* Spatial relationships
* k-NN graph construction

This is modern and highly relevant.

GNNs are increasingly important in:

* Traffic systems
* Climate forecasting
* Geo-spatial AI
* Satellite analysis
* Disaster intelligence

Although detailed implementation is not shown, inclusion of GNN concepts significantly strengthens the project.

---

# 19. SDG Alignment Analysis

The project strongly aligns with global sustainability goals.

## SDG 13 — Climate Action

Core relevance:

* Wildfire prediction
* Climate resilience

## SDG 11 — Sustainable Cities

Supports:

* Safer infrastructure
* Evacuation planning


## SDG 15 — Life on Land

Supports ecosystem preservation.

This makes the project socially impactful, not just technically strong.

---

# 20. Strengths of the Project

## Major Strengths

### Strong problem selection

Very relevant to modern AI.

### Advanced ML concepts

Uses survival analysis and ensembles.

### Excellent feature engineering

Scientifically meaningful variables.

### Real-world impact

High practical usefulness.

### Good EDA

Insights are actionable.

### Strong evaluation methodology

Proper metrics and optimization.

### Interdisciplinary approach

Combines:

* AI
* Climate science
* Spatial analytics
* Risk systems

---

# 21. Weaknesses / Areas for Improvement

## A. Small Dataset

221 records is very small.

Risk:

* Overfitting
* Limited generalization

---

## B. GNN Details Missing

The presentation mentions GNNs but lacks:

* Architecture details
* Graph construction explanation
* Results comparison

---

## C. No Real-Time Pipeline

Current system appears offline.

Could improve using:

* Live satellite feeds
* Weather APIs
* Streaming systems

---

## D. Limited Explainability

Could include:

* SHAP analysis
* Feature contribution plots
* Explainable AI

Very important for disaster systems.

---

# 22. Future Improvements

The future work section is excellent.

Potential additions:

## Weather Integration

* Wind speed
* Humidity
* Temperature
* Rainfall

These strongly influence wildfire behavior.

---

## Satellite Imagery

Using:

* Landsat
* VIIRS
* Sentinel

Could enable:

* Computer vision
* Real-time detection

---

## Terrain Modeling

Include:

* Elevation
* Vegetation
* Slope

Terrain heavily affects fire spread.

---

## Real-Time Deployment

Could become:

* Government dashboard
* Emergency warning system
* Smart wildfire monitoring platform

---

# 23. Industry Relevance

This project is highly aligned with modern AI industry trends.

Relevant domains:

* Climate AI
* DisasterTech
* GeoAI
* Spatial ML
* Smart governance
* Environmental analytics

This is significantly stronger than typical academic mini-projects.

---

# 24. Academic Evaluation

## Technical Depth: 9/10

Strong advanced ML usage.

## Innovation: 8.5/10

Good interdisciplinary integration.

## Practical Relevance: 10/10

Very real-world oriented.

## Presentation Quality: 8.5/10

Well structured and visually organized.

## Research Orientation: 9/10

Good analytical maturity.

---

# 25. Final Overall Assessment

This is a **high-quality AI/ML project** with:

* Strong domain understanding
* Advanced predictive modeling
* Excellent feature engineering
* Real-world social impact
* Modern survival analysis techniques

The project stands out because it is:

* Not merely “classification”
* Not only “deep learning”
* But a realistic risk forecasting system

It demonstrates:

* Good engineering thinking
* Research-oriented analysis
* Practical AI application capability

For a 4th semester AI/ML academic project, this is significantly above average in:

* Topic quality
* Technical sophistication
* Real-world relevance
* Research alignment

The project has strong potential to evolve into:

* Research publication
* Kaggle competition solution
* Government disaster analytics prototype
* Operational wildfire intelligence platform
