# Data Dictionary

## forecast_runs
- run_id (string, PK)
- init_time (timestamp UTC)
- model_id (string)
- model_version (string)
- data_mode (enum: REAL|SIMULATED|PROXY)
- created_at (timestamp)

## regions
- region_id (string, PK)
- name (string)
- geometry (GeoJSON/geometry)
- type (enum: subdivision|district|grid)

## predictions
- prediction_id (string, PK)
- run_id (FK)
- region_id (FK)
- variable (string)
- lead_hours (int)
- forecast_day (int 1-10)
- raw/forecast_value (float)
- bust_probability (float 0-1)
- confidence_label (string)
- features (jsonb)
- data_quality (jsonb)
- generated_at (timestamp UTC)

## error_labels
- label_id (string, PK)
- run_id, region_id, valid_time
- forecast_value, observed_value
- abs_error, bust (bool)
- threshold_used (float)
- regime (string)
