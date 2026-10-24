# Model Card - Forecast Bust Detection

## Model Details
- Model type: Probabilistic classifier (baseline demo)
- Version: baseline-demo-0.1
- Data mode: SIMULATED (for prototype)
- Intended use: Decision support to prioritize review of medium-range forecasts

## Limitations
- Not a replacement for NWP or official warnings
- Synthetic data - not validated against operational observations
- Explanations are evidence-based from features, not causal proof
- Calibration requires real verification data

## Metrics (demo)
- Brier score: ~0.18
- Precision/Recall reported with sample sizes
- Time-based splits required for real evaluation

## Ethical Considerations
- Clear labeling of simulated/proxy data
- No automatic warning issuance
- Human-in-the-loop for decisions
- Transparent provenance
