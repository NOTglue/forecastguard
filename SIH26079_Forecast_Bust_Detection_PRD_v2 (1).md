PRODUCT REQUIREMENTS DOCUMENT

AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts

Version 2.0 • Expanded problem rationale, stakeholder analysis and
implementation specification

# Document Control

# 1. Why This Problem Matters

## The problem in plain language

A medium-range weather forecast can look precise while being wrong about
the location, timing or intensity of an important weather event. A
forecast bust is a case where the forecast error is unusually large
under an agreed definition. The challenge is not simply that forecasts
sometimes make errors; it is that users may not know in advance which
forecast locations and lead times deserve extra caution.

## Why this is a problem

Operational users often need to make decisions before the verifying
weather is observed. If a forecast is treated as equally reliable
everywhere, users may over-trust a weak forecast or spend limited review
time checking every region equally. Rapidly evolving systems---including
monsoon depressions, heavy-rainfall events, western disturbances,
cyclones, heat waves and active/break monsoon phases---can be difficult
periods for medium-range prediction. A missed signal of low reliability
can therefore leave decision-makers unaware that a forecast deserves
closer scrutiny.

## Why it should be solved

A forecast-reliability layer can help users prioritize expert review,
communicate uncertainty more honestly, compare risk across regions and
lead times, and identify recurring weaknesses in forecast performance.
It may support better planning for agriculture, transport, water
management, emergency preparedness and public-service operations. These
are potential benefits, not guaranteed outcomes: they depend on data
quality, model skill, calibration and appropriate use by domain experts.

## What exactly is being solved

For each available forecast run, region, variable and lead time from Day
1 to Day 10, estimate the probability that the forecast error will
exceed a documented threshold. Then present that probability as a
regional confidence view, flag areas that may be error-prone, and
provide evidence-backed reasons for the estimate. The system adds a
reliability estimate to an existing forecast; it does not replace the
NWP forecast or independently declare the actual weather.

## Why existing forecast values alone are not enough

A deterministic forecast gives a predicted weather value, but that value
alone does not necessarily communicate how reliable similar forecasts
have been for the same region, lead time or weather situation.
Historical errors and available uncertainty signals can add information
about reliability. The proposed system must demonstrate that these
signals improve on simple baselines before claiming practical value.

# 2. Stakeholders and Their Needs

## Primary stakeholders

NCMRWF and other authorized forecast analysts are central users because
the PS is assigned to NCMRWF under the Ministry of Earth Sciences. Their
needs include region/lead-time reliability estimates, transparent
evidence, verification and traceability to forecast runs and model
versions.

## Operational decision-makers

Disaster-management agencies, state/district control rooms and emergency
planners may use the reliability layer as one input when prioritizing
review and preparedness. The product should not issue official warnings
or replace authorized warning channels.

## Weather-sensitive sectors

Agriculture and fisheries planners, water-resource managers,
transport/logistics operators, energy providers and infrastructure
operators may benefit from understanding where a forecast is less
reliable. Their exact needs should be validated through user interviews;
the PS does not explicitly name these sectors.

## Scientific and technical stakeholders

Meteorologists, climate/weather researchers, data engineers, ML
engineers and model evaluators define event thresholds, verify data
alignment, assess skill, explain limitations and maintain reproducible
pipelines.

## Data providers and governance stakeholders

Providers of NWP runs, observations, analyses, regional boundaries and
derived data determine access, licensing, attribution, coverage and
quality constraints. Their data terms must be respected.

## System operators and administrators

Platform administrators and ML/data operations personnel monitor
ingestion, freshness, failed jobs, model releases, access control, audit
logs and rollback.

## Indirectly affected people

Communities and organizations whose planning may be influenced by
weather-related decisions can be indirectly affected. The product should
communicate uncertainty responsibly and avoid implying that low bust
probability means no hazardous weather.

# 3. Stakeholder Pain Points and Value

## Forecast analysts

Pain point: it may be difficult to scan every region, lead day and
variable for likely forecast failure. Value: a ranked review queue,
historical context and evidence-backed explanations.

## Disaster-management planners

Pain point: decisions may rely on forecasts with differing reliability,
while time for expert review is limited. Value: visibility into forecast
uncertainty as an additional decision-support signal, alongside official
forecasts and warnings.

## Weather-sensitive sector planners

Pain point: plans made from a single forecast value can hide uncertainty
in timing, location or intensity. Value: an explicit signal to consider
contingencies or seek further expert guidance.

## Researchers and evaluators

Pain point: forecast failure patterns can vary by lead time, region,
season and weather regime. Value: reproducible case histories,
stratified verification and comparison against baselines.

## Data/ML operators

Pain point: missing, stale or misaligned input data can create
misleading predictions. Value: lineage, quality flags, health
monitoring, versioned thresholds and model rollback.

# 4. Theory of Change and Success Conditions

## Proposed chain of value

Reliable forecast and observation archives → correctly aligned
historical errors → a documented bust label → calibrated probability
model → region/lead-time confidence map and explanations → expert review
and more informed planning.

## Conditions for success

The team needs access to suitable historical forecast and verifying
data, a domain-approved bust definition, leakage-safe validation, useful
probability calibration, clear presentation of limitations and feedback
from representative users.

## How value will be demonstrated

Show that the model improves probabilistic skill over a base-rate
baseline on a time-separated test period; measure calibration and
event-detection trade-offs; report performance by lead time and region;
and demonstrate that a user can find and interpret a low-confidence
region faster than with raw forecast data alone.

## What success does not mean

The system will not eliminate forecast errors, guarantee detection of
every bust, prove that a weather event will occur, or substitute for
official forecasts, warnings or expert judgement.

# 5. Executive Summary

ForecastGuard is a decision-support platform that estimates when and
where medium-range weather forecasts may be unreliable. It compares
current numerical weather prediction (NWP) forecast patterns with
historical forecast-error behaviour, estimates the probability of a
large error, shows region-wise confidence for Day 1--Day 10, highlights
error-prone areas, and explains the meteorological signals associated
with low confidence.

The product is not intended to replace an official forecast or
independently issue public warnings. It adds a calibrated reliability
layer to forecasts so operational users can identify forecasts that
deserve closer review, communicate uncertainty, and prioritize
verification.

## 5.1 Product goals

Produce a region- and lead-time-specific forecast-bust probability.

Convert probabilities into an understandable confidence indicator with
clear caveats.

Display error-prone areas on an interactive map and in a sortable
regional table.

Explain why confidence is low using auditable weather and model-error
signals.

Provide a traceable forecast run, data provenance, model version and
verification summary.

Expose the same core outputs through a documented API.

## 5.2 Non-goals

Replacing the underlying NWP model or generating a new deterministic
weather forecast.

Automatically issuing official cyclone, rainfall, heat-wave or other
public warnings.

Claiming operational-grade accuracy before independent historical and
prospective validation.

Treating an LLM-generated explanation as the source of the probability
or as meteorological proof.

# 6. Problem Statement and Interpretation

The supplied SIH26079 statement says medium-range forecasts can show
large errors during rapidly evolving systems such as monsoon
depressions, heavy-rainfall events, western disturbances, cyclones, heat
waves and active/break monsoon phases. Such forecast failures can affect
operational decision-making. The requested system should compare current
NWP patterns with historical error behaviour and provide forecast
confidence.

The exact bust threshold, forecast variables, spatial unit, data
sources, and operational cut-offs are not supplied in the PS. The PRD
proposes defaults for a prototype; these are configuration choices, not
official NCMRWF definitions.

# 7. Users, Roles and Jobs-to-be-Done

# 8. Product Scope and Priorities

# 9. Key Definitions and Product Semantics

## 9.1 Recommended confidence mapping

For the prototype, use a simple, configurable mapping from bust
probability to confidence. Display both values so the transformation is
transparent.

These bands are initial UI defaults only. They must be tuned using
validation and user feedback. Do not call them scientifically calibrated
until calibration testing supports that claim.

# 10. Core User Journeys

## Journey A --- Identify unreliable regions

User opens the dashboard and sees the latest available forecast run,
data freshness, model version and a map for the default lead day.

User selects Day 4 and a variable/region filter.

The map updates to confidence or bust probability; legend and threshold
remain visible.

The error-prone area table ranks regions by probability and flags
missing/stale data.

User selects a region to open a detail drawer with time series,
probability, contributing signals and historical verification.

User exports a CSV or copies the region/run identifier for follow-up.

## Journey B --- Understand why confidence is low

User selects a low-confidence region.

System shows top evidence signals with direction, observed value,
reference baseline and availability status.

User can inspect historical analogues or error statistics where
available.

System distinguishes measured inputs from model-derived signals and
clearly labels unavailable evidence.

## Journey C --- Evaluate model usefulness

Evaluator opens Verification.

Evaluator selects model version, date range, forecast day, variable and
event threshold.

System shows Brier score, reliability/calibration plot, precision/recall
and event metrics where labels exist.

Evaluator compares against a baseline and checks sample size and
missing-data coverage.

Evaluator exports the report with metric definitions and data split
details.

# 11. Frontend Requirements

## 11.1 Information architecture

## 11.2 Dashboard screen

Header: product name, selected forecast initialization time, latest-data
timestamp, model version and environment badge (Demo / Research /
Operational).

KPI cards: regions evaluated, high-bust-risk regions, current run
freshness, and percentage of regions with usable inputs.

Main map: colored regions/grid cells according to selected metric; hover
tooltip shows region, lead day, probability, confidence label and valid
time.

Controls: Day 1--Day 10, variable, region/administrative level, model
run, metric (bust probability/confidence), and risk threshold.

Ranked list: top error-prone regions with probability, change from prior
run where comparable, data-quality status and link to detail.

Data caveat: visible message when data is stale, incomplete, simulated
or not independently verified.

## 11.3 Forecast map

Map and table must show the same selected run, lead day, variable and
region filters.

Legend must state whether colors represent bust probability or
confidence; never use one legend for both.

Provide accessible table alternative to map for keyboard and
screen-reader users.

Show no-data separately from low confidence. Missing data must not be
colored as high confidence.

Support zoom, pan, region selection, tooltip and reset-to-default.

Map data should be served as GeoJSON/vector tiles or a precomputed grid
layer; do not send large raw gridded arrays to the browser
unnecessarily.

## 11.4 Region detail panel

Summary: region name/ID, initialization time, valid time, forecast day,
probability, confidence label and model version.

Evidence: top contributing features, current value, reference range or
baseline, and direction of contribution if the model supports it.

Historical context: performance for the same region/lead/variable and
similar weather regime, with sample size.

Input quality: missing, stale, out-of-range or imputed fields.

Audit metadata: prediction ID, model version, feature pipeline version
and generation timestamp.

Acknowledge uncertainty: explain that factors are model evidence, not
necessarily causal meteorological explanations.

## 11.5 Verification screen

Filters: date range, region, forecast day, variable, model version,
threshold and weather regime (when labels exist).

Show baseline and candidate metrics together with sample size, event
prevalence and missing-data coverage.

Classification metrics: precision, recall/POD, FAR, CSI and ETS when a
binary bust label is defined.

Probability metrics: Brier score and reliability/calibration curve;
ROC-AUC/PR-AUC as supplementary ranking metrics, not substitutes for
calibration.

Continuous-error metrics: MAE/RMSE for underlying forecast errors where
appropriate.

Use time-based and event-aware evaluation splits; prevent the same
weather event from leaking across train and test.

## 11.6 UX, accessibility and responsiveness

Desktop-first for operational map analysis; responsive tablet layout and
usable mobile summary.

Use a clear, restrained scientific dashboard style: neutral base,
consistent risk palette, legible map labels and high contrast.

Do not rely on color alone: include text labels, icons or patterns and a
tabular alternative.

Provide loading, empty, stale-data, partial-data, API-error and
permission-denied states.

Use UTC internally for timestamps and display IST by default for
India-based users, with timezone label always visible.

Target WCAG 2.2 AA practices where feasible, including keyboard
navigation and focus states.

# 12. Backend and Data Platform Requirements

## 12.1 Logical architecture

These are recommended implementation choices, not requirements specified
by SIH. For a time-limited hackathon, use a modular monolith plus
background worker before introducing microservices.

## 12.2 End-to-end data flow

Ingest forecast runs and associated metadata from an approved data
source or a clearly labelled sample dataset.

Ingest verifying observations/analysis or archived reference data needed
to calculate forecast error.

Normalize timestamps, units, coordinates, variable names, region
identifiers and model/run identifiers.

Run data-quality checks and record missingness, stale inputs, duplicate
records and schema failures.

Generate region × variable × lead-time examples and align forecast
values with verifying values.

Calculate historical errors and create labels using the agreed
forecast-bust definition.

Generate current-run features and pass them through the selected model
and calibration layer.

Persist probabilities, confidence mapping, evidence features, model
version and data lineage.

Serve the map/table/detail APIs; calculate verification metrics
asynchronously or from pre-aggregated results.

Monitor input freshness, feature drift, probability calibration and
model performance after new observations arrive.

## 12.3 Data sources and acquisition policy

The supplied PS file does not include a dataset link. Before
implementation, the team must confirm access, licensing, terms of use,
temporal coverage, spatial resolution and variable availability with the
relevant data provider or mentor. Do not assume that an operational
NCMRWF feed or archive is publicly accessible.

Preferred inputs: archived NWP forecast fields with initialization and
valid times; corresponding verifying observations or analysis; model/run
metadata; regional boundaries; optional ensemble members and derived
weather-regime labels.

Potential research/prototype sources to investigate: official
MoES/NCMRWF/IMD data access routes and documented public reanalysis or
forecast archives such as ERA5 or other openly licensed datasets.
Confirm that each source is appropriate for the task before use.

If official data cannot be obtained during the hackathon, create a
synthetic/demo dataset or use a documented public proxy. Mark every
screen, API response and presentation chart as DEMO/SIMULATED or PROXY
DATA.

Never present synthetic outputs as real NCMRWF predictions or claim
operational validation from a proxy dataset.

## 12.4 Minimum data contract

# 13. ML/AI Requirements

## 13.1 Define the target before training

A supervised model needs a reproducible label for a forecast bust.
Define it per variable and spatial/temporal aggregation. For example, a
bust event may be the absolute forecast error exceeding a
variable-specific threshold at a region and lead time. For
precipitation, a threshold may need to account for event severity and
distribution; a single universal error threshold is unlikely to be
suitable for all variables. Thresholds must be agreed with a
meteorological domain expert and documented.

## 13.2 Candidate feature groups

Forecast-state features: regional means, maxima, minima, gradients and
temporal changes for available forecast variables.

Spatial-pattern features: neighboring-region contrasts, spatial
gradients, displacement or pattern-change indicators, where source
resolution permits.

Temporal-evolution features: changes between consecutive lead times or
successive model runs, only where runs are comparable and available.

Historical error features: rolling error summaries by region, variable,
lead time, season and weather regime, computed without future leakage.

Ensemble uncertainty: spread, quantiles and member disagreement, only if
ensemble data are available.

Regime/context features: monsoon phase, cyclone/depression indicators,
western-disturbance context or other documented regime labels, only if
reliable labels/features are available.

Data-quality features: missing fraction, age of input, source
availability, out-of-distribution indicators and imputation flags.

## 13.3 Training and evaluation protocol

Create an auditable dataset manifest listing source, coverage, variable,
resolution, units, missingness and licensing.

Build a deterministic feature pipeline and unit tests for timestamp
alignment, region aggregation and error calculations.

Split by time, not random rows. Keep entire major weather events in one
split where possible to reduce event leakage.

Train a simple baseline and at least one candidate model.

Tune only on training/validation periods; reserve the final test period
for one-time evaluation.

Calibrate probabilities on a separate calibration period or within a
leakage-safe validation design.

Report skill by forecast day, variable, region, season/regime and event
severity where sample sizes support it.

Compare against a meaningful baseline and report uncertainty/sample
size; avoid presenting only overall accuracy.

Store model artifact, code version, feature schema, training-data
period, thresholds, metrics and release notes.

## 13.4 Metrics

## 13.5 Explanation design

Generate explanations from stored feature values and validated model
attributions.

Each explanation item should include a human-readable label, current
value, comparison baseline, contribution direction and data-quality
status.

Example phrasing: "Confidence reduced: historical errors for this region
and lead time are elevated in the available training archive."

Only mention ensemble spread, rapid pressure changes, monsoon regime or
similar factors if the corresponding input exists and has passed
validation.

If a feature is missing, state "not available"; do not infer a
meteorological reason from unrelated inputs.

If using an LLM to rewrite technical evidence into plain language,
provide it only the structured evidence, constrain its output, and label
the text as a generated explanation. The LLM must not generate or alter
the probability.

# 14. Backend API Specification

Base path: /api/v1. All timestamps are ISO 8601 UTC. JSON responses
include request_id and data/model provenance where relevant. Use
pagination for lists and explicit error schemas.

## 14.1 Example confidence-map response

{ "request_id": "req_demo_001", "run_id": "run_demo_2026_10_18_00",
"model_version": "baseline-demo-0.1", "data_mode": "SIMULATED",
"init_time": "2026-10-18T00:00:00Z", "forecast_day": 4, "variable":
"precipitation", "metric": "bust_probability", "threshold_definition":
"DEMO ONLY: absolute error exceeds configured threshold", "features": \[
{ "region_id": "REGION_001", "bust_probability": 0.67,
"confidence_label": "Low confidence / high bust risk", "data_quality":
\["SIMULATED"\], "prediction_id": "pred_demo_001" } \] }

## 14.2 API behaviour and errors

Return 400 for invalid filters, 401/403 for authentication/authorization
failures, 404 for unknown resources, 409 for conflicting job state, 422
for schema validation errors, and 500/503 for internal or dependency
failures.

Return 200 with an explicit empty result when a valid query has no
records; distinguish that from an error.

Never silently substitute the latest run if the caller requested a
specific run_id.

Include data_mode, generated_at, source freshness and model_version on
prediction-related responses.

Protect admin job endpoints with authentication, authorization, rate
limits and audit logging.

Version breaking changes under a new API version; document schemas in
OpenAPI.

# 15. Data Model / Database Schema

## 15.1 Storage and indexing guidance

Use PostgreSQL/PostGIS for metadata, region geometries, aggregated
predictions and queryable outputs.

Use object storage for large gridded arrays, raw files, model artifacts
and reproducible training datasets.

Index forecast_runs(init_time, model_id), predictions(run_id, variable,
lead_hours), predictions(region_id, generated_at), and
error_labels(valid_time, variable, region_id).

Partition large time-series tables by date if data volume requires it;
do not prematurely optimize a small hackathon dataset.

Retain source checksums and transformation versions to reproduce
results.

# 16. Security, Privacy and Governance

Treat weather datasets as governed data: comply with source terms,
attribution and redistribution restrictions.

Use secrets through environment variables or a secrets manager; never
commit credentials, tokens or private source URLs.

Apply least-privilege roles to admin operations and restrict model
deployment/configuration changes.

Validate and sanitize filters, uploaded metadata and exported filenames;
limit export size.

Use HTTPS in deployment, secure cookies or established token handling,
CSRF protections where applicable, and rate limiting.

Keep audit trails for ingestion, threshold changes, model releases and
administrative actions.

Do not use generated explanations as a substitute for official
meteorological judgement or emergency guidance.

Show dataset provenance and demo/proxy labels on all outputs.

# 17. Reliability, Performance and Observability

These are proposed MVP targets, not source-defined operational service
levels. Revisit them after data size, deployment environment and user
expectations are known.

# 18. Acceptance Criteria

# 19. Testing Strategy

# 20. Delivery Plan for an SIH Prototype

The schedule is an illustrative 14-day plan. Compress or expand based on
team size, event timeline and actual data access. If the data source is
not secured early, prioritize a clearly labelled demo path while
continuing validation.

# 21. Suggested Repository Structure

forecastguard/ apps/ web/ \# React/Next.js dashboard api/ \# FastAPI
application worker/ \# ingestion and inference jobs ml/ data_contracts/
features/ labels/ training/ evaluation/ inference/ explainability/ data/
samples/ \# small, synthetic/demo data only manifests/ db/ migrations/
seeds/ docs/ PRD.md API.md DATA_DICTIONARY.md MODEL_CARD.md RUNBOOK.md
tests/ unit/ integration/ e2e/ infra/ docker/ deployment/ .env.example
README.md

# 22. Recommended Technology Stack

# 23. Risks, Assumptions and Mitigations

# 24. Open Questions to Resolve with Mentors / Domain Experts

Which NWP forecast model(s), archived runs and variables can the team
access?

What verifying observations or analysis are available, at what
spatial/temporal resolution and with what latency?

What is the authoritative definition of a "large error" or "forecast
bust" for each variable?

Should the prediction unit be grid cell, district, meteorological
subdivision or another region?

Should Day 1--Day 10 correspond to fixed 24-hour bins or exact lead-hour
ranges?

Are ensemble members or weather-regime labels available?

What operational decision should a low-confidence indicator support, and
what thresholds are useful to users?

Are there restrictions on redistributing maps, raw data, derived
products or model outputs?

What minimum verification period and sample size are expected for
judging performance?

Is deployment expected to be a local prototype, hosted dashboard, API
integration or all three?

# 25. Definition of Done

A user can select a forecast run and Day 1--Day 10 and view region-wise
bust probability/confidence.

The map and ranked table are consistent and distinguish no-data from low
confidence.

A region detail view provides probability, provenance, data-quality
flags and evidence-backed explanations.

The verification screen reports appropriate metrics, sample counts and a
baseline on a leakage-safe test period.

Core outputs are available through documented API endpoints.

Pipeline failures and stale inputs are visible rather than silently
hidden.

Synthetic/proxy data is labelled wherever shown or exported.

Tests cover labels, time alignment, API contracts, key UI interactions
and failure states.

A model card, data dictionary, run instructions, limitations and demo
scenario are included.

The team can explain what has and has not been validated, without
presenting the prototype as an official forecasting service.

# Appendix A --- Demo Scenario

Use a prepared sample forecast run with multiple regions and Day 1--Day
10 predictions. Select Day 5, switch from confidence to bust
probability, open a high-risk region, inspect its top evidence signals,
then open Verification and compare the candidate model with a base-rate
baseline. End by opening Data Status to show source timestamps and the
DEMO/SIMULATED label. This demonstrates the whole product without
implying live operational data.

# Appendix B --- Product Guardrails

Never display a probability without identifying its model version and
target definition.

Never call a forecast "safe" solely because the bust probability is low.

Never equate low bust probability with certainty or absence of hazardous
weather.

Never hide missingness, stale data, model limitations or small
evaluation sample sizes.

Never claim a metric is operationally validated unless the test data,
evaluation period and baseline support that claim.

  -----------------------------------------------------------------------
  Field                               Details
  ----------------------------------- -----------------------------------
  Product / working name              ForecastGuard --- AI-Based Forecast
                                      Bust Detection

  Problem Statement ID                SIH26079

  Source-defined problem              Identify regions and lead times
                                      where medium-range NWP forecasts
                                      are likely to have high uncertainty
                                      or large error.

  Primary users                       Weather analysts, forecast
                                      operations teams,
                                      disaster-management planners,
                                      researchers and technical
                                      administrators.

  Target forecast horizon             Day 1 to Day 10, as specified in
                                      the problem statement.

  Document status                     Proposed product requirements;
                                      validate data availability,
                                      operational definitions and
                                      thresholds with domain experts.

  Important limitation                The PS does not provide a dataset
                                      link, contact details, model
                                      specification or numerical
                                      definition of a forecast bust.
                                      These must be agreed before
                                      operational claims are made.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Stakeholder group       Primary concern         What ForecastGuard
                                                  provides
  ----------------------- ----------------------- -----------------------
  NCMRWF / forecast       Identify unreliable     Confidence map, risk
  analysts                regions and lead times. ranking, traceable
                                                  evidence and
                                                  verification.

  Disaster-management     Know where forecast     Risk summary alongside
  planners                uncertainty warrants    official forecast
                          extra review.           products; no automated
                                                  official warnings.

  Weather-sensitive       Plan when forecast      Region-specific
  sectors                 timing/intensity is     uncertainty signal and
                          uncertain.              exportable summaries.

  Researchers /           Measure model skill and Case explorer,
  evaluators              recurring failure       stratified metrics,
                          patterns.               data splits and
                                                  baseline comparisons.

  Data and ML operations  Keep data and models    Freshness status,
                          reliable and auditable. data-quality flags,
                                                  model registry and
                                                  audit trail.

  Data providers /        Ensure permitted,       Source registry,
  governance              attributable and        provenance, license
                          appropriate data use.   notes and access
                                                  controls.

  Affected communities    Avoid misleading        Clear caveats and
  (indirect)              certainty in            explicit separation
                          weather-dependent       from official warnings.
                          decisions.              
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  PS requirement          Product interpretation  Acceptance evidence
  ----------------------- ----------------------- -----------------------
  Forecast confidence map Map of confidence by    User can select a lead
                          region and lead day,    day and see mapped
                          Day 1--Day 10.          values, legend and
                                                  valid time.

  Forecast bust           Probability of          Every score has a
  probability             exceeding a defined     documented event
                          large-error threshold.  definition, calibration
                                                  status and model
                                                  version.

  Error-prone area        Rank or flag regions    Regions can be filtered
  detection               with high bust          and sorted; selected
                          probability.            region opens its
                                                  evidence.

  Explainable output      Key meteorological and  Explanation lists
                          data-quality reasons    contributing signals
                          linked to low           and does not invent
                          confidence.             causal claims.

  Prototype dashboard/API Browser dashboard and   Core screens work with
                          versioned API for       demo data and
                          operational             documented API
                          integration.            responses.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Role                    Primary needs           Permissions
  ----------------------- ----------------------- -----------------------
  Forecast analyst /      Review low-confidence   View forecasts, maps,
  meteorologist           forecasts, compare      explanations,
                          regions and lead days,  verification and
                          inspect reasons and     export.
                          historical performance. 

  Operations /            Know which forecast     View operational
  disaster-management     areas require caution   summary and export; no
  planner                 or expert follow-up.    model configuration.

  Researcher / evaluator  Inspect event           Access verification,
                          definitions, validation case studies and
                          metrics, model versions eligible datasets.
                          and historical cases.   

  Administrator / ML      Monitor ingestion, data Manage pipeline
  operator                quality, model          configuration,
                          versions, jobs and      thresholds, users and
                          audit logs.             model deployment.

  Demo / guest user       Explore sample forecast Read-only demo dataset.
                          confidence without      
                          access to protected     
                          controls.               
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Priority                Scope                   Release target
  ----------------------- ----------------------- -----------------------
  P0 --- Must have        Forecast confidence     SIH MVP
                          map; Day 1--10          
                          selector; bust          
                          probability;            
                          error-prone region      
                          table; region detail;   
                          explanation panel;      
                          data/model timestamps;  
                          basic verification      
                          metrics; API; demo      
                          dataset.                

  P1 --- Should have      Historical case         Post-MVP / if time
                          explorer; forecast-run  allows
                          comparison; user        
                          filters; CSV export;    
                          data freshness and      
                          pipeline health;        
                          confidence calibration  
                          view.                   

  P2 --- Could have       Saved watchlists;       Future
                          notification rules;     
                          multilingual interface; 
                          role-based workspaces;  
                          external operational    
                          integrations.           

  Out of scope            Official warning        Not planned
                          issuance, autonomous    
                          high-impact decisions,  
                          guaranteed prediction   
                          of every forecast       
                          failure.                
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Term                                Definition for this product
  ----------------------------------- -----------------------------------
  Forecast run                        A specific NWP model run identified
                                      by model, initialization time,
                                      source and version.

  Lead time / forecast day            Time between forecast
                                      initialization and valid time. The
                                      UI groups results as Day 1--Day 10;
                                      backend should retain exact valid
                                      timestamps.

  Forecast bust                       A forecast whose error exceeds a
                                      pre-agreed threshold for a
                                      specified variable, region and lead
                                      time.

  Bust probability                    Estimated probability of the
                                      defined bust event, from 0 to 1 or
                                      0--100%.

  Confidence score                    A user-facing transformation of
                                      bust probability. It is not the
                                      probability that the forecast is
                                      correct unless explicitly defined
                                      and calibrated that way.

  Error-prone area                    A region whose bust probability or
                                      uncertainty exceeds a configured
                                      threshold, or ranks among the
                                      highest-risk regions.

  Explanation                         A set of evidence-backed
                                      contributing signals, such as
                                      historical error for similar
                                      conditions, rapid pattern change,
                                      ensemble spread or missing/stale
                                      inputs.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Bust probability        Confidence label        UI treatment
  ----------------------- ----------------------- -----------------------
  0.00--0.20              Higher confidence       Cool/neutral color;
                                                  still show probability
                                                  and caveat.

  \>0.20--0.40            Moderate confidence     Intermediate color;
                                                  encourage checking
                                                  evidence.

  \>0.40--0.60            Reduced confidence      Highlight for analyst
                                                  review.

  \>0.60--1.00            Low confidence / high   Prominent warning-style
                          bust risk               highlight; not an
                                                  official weather
                                                  warning.
  -----------------------------------------------------------------------

  --------------------------------------------------------------------------
  Route / screen          Purpose                 Core components
  ----------------------- ----------------------- --------------------------
  /dashboard              Operational overview    Latest run banner, KPI
                                                  cards, confidence map,
                                                  lead-day selector,
                                                  error-prone areas,
                                                  freshness status.

  /forecast-map           Explore confidence      Interactive map, variable
                          spatially               selector, Day 1--10
                                                  selector,
                                                  probability/confidence
                                                  toggle, filters and
                                                  legend.

  /regions/:id            Inspect one region      Bust probability,
                                                  confidence label, forecast
                                                  timeline, evidence
                                                  factors, data-quality
                                                  panel, historical cases.

  /verification           Assess model skill      Date/model/lead filters,
                                                  metric cards, reliability
                                                  plot, confusion matrix,
                                                  baseline comparison and
                                                  export.

  /cases                  Review past forecast    Searchable case list,
                          busts                   filters, case detail,
                                                  observed-versus-forecast
                                                  comparison where data is
                                                  available.

  /data-status            Monitor pipeline inputs Source status, latest
                                                  ingestion, missingness,
                                                  schema validation,
                                                  processing failures and
                                                  last successful run.

  /admin/models           Manage model releases   Model registry, version,
                                                  training period, feature
                                                  schema, validation summary
                                                  and deployment state.

  /settings               Configure preferences   Default region, units, map
                                                  layer, threshold presets
                                                  and language
                                                  (future/P1--P2).
  --------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Layer                   Responsibilities        Suggested
                                                  implementation
  ----------------------- ----------------------- -----------------------
  Frontend                Map, filters,           Next.js/React +
                          dashboards,             TypeScript; map library
                          verification and data   such as MapLibre GL JS
                          status.                 or Leaflet; chart
                                                  library such as
                                                  Recharts.

  API / application       Auth, filters, forecast Python FastAPI;
                          queries, prediction     Pydantic schemas;
                          metadata, exports and   OpenAPI documentation.
                          audit events.           

  Data ingestion          Load NWP forecasts,     Python workers and
                          observations/analyses   scheduled jobs;
                          and metadata; validate  adapters per source.
                          schemas and timestamps. 

  Storage                 Store metadata,         PostgreSQL + PostGIS;
                          regions, run records,   object storage for
                          predictions,            gridded files and model
                          verification results    artifacts.
                          and user settings.      

  ML pipeline             Feature generation,     Python, pandas/xarray,
                          training, validation,   scikit-learn;
                          calibration, inference  XGBoost/LightGBM as
                          and model registry.     candidate tabular
                                                  models.

  Async jobs              Long-running ingestion, Celery/RQ with Redis,
                          grid aggregation,       or a simpler scheduled
                          backfills, training and worker for MVP.
                          exports.                

  Observability           Logs, health, job       Structured logs,
                          status, latency,        metrics endpoint and
                          failures, data          dashboard/log
                          freshness and model     aggregation appropriate
                          drift.                  to deployment.
  -----------------------------------------------------------------------

  -------------------------------------------------------------------------------
  Field                Type / example    Required?            Notes
  -------------------- ----------------- -------------------- -------------------
  source_id            string            Yes                  Dataset/feed
                                                              identifier.

  model_id             string            Yes                  NWP model
                                                              identifier.

  run_id               string/UUID       Yes                  Unique run record.

  init_time            timestamp UTC     Yes                  Model
                                                              initialization.

  valid_time           timestamp UTC     Yes                  Time the forecast
                                                              describes.

  lead_hours           integer           Yes                  Difference between
                                                              valid and
                                                              initialization
                                                              time.

  forecast_day         integer 1--10     Yes                  UI grouping; exact
                                                              lead hours remain
                                                              canonical.

  variable             string            Yes                  For example
                                                              precipitation,
                                                              temperature or
                                                              wind;
                                                              source-dependent.

  region_id            string            At aggregation stage Administrative unit
                                                              or grid-cell
                                                              identifier.

  geometry/grid_ref    GeoJSON or object Yes for map          Store large gridded
                       reference                              data in object
                                                              storage if needed.

  forecast_value       number/null       For each feature     Keep units and
                                                              missing-value
                                                              semantics.

  observed_value       number/null       For                  Must be aligned to
                                         label/verification   the appropriate
                                                              valid time and
                                                              source.

  data_quality_flags   array/string      Yes                  Missing, stale,
                                                              imputed,
                                                              out-of-range,
                                                              proxy/synthetic.

  ingested_at          timestamp UTC     Yes                  Provenance and
                                                              freshness tracking.
  -------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Design decision         Recommended MVP default Must be validated
  ----------------------- ----------------------- -----------------------
  Prediction unit         Region × variable ×     Whether grid-cell
                          forecast day × forecast predictions are
                          run                     required or regional
                                                  aggregation is
                                                  acceptable.

  Target                  Binary event: error     Threshold and treatment
                          exceeds a configured    of near-zero, missing
                          threshold               or extreme
                                                  observations.

  Baseline                Historical event rate   Baseline must use
                          by                      training data only.
                          region/lead/variable;   
                          optionally a simple     
                          logistic model          

  Candidate model         Gradient-boosted trees  Compare with simple
                          (LightGBM/XGBoost) or   baseline; avoid
                          Random Forest on        claiming the most
                          tabular features        complex model is best.

  Probability calibration Platt/logistic or       Choose based on data
                          isotonic calibration    volume and reliability
                          using a held-out        curve.
                          calibration period      

  Interpretability        SHAP or feature         Attributions describe
                          attribution plus        model contribution, not
                          explicit data-quality   causal proof.
                          indicators              

  Update strategy         Offline retraining      Do not retrain
                          after sufficient new    automatically without
                          verified cases; version validation and
                          every model             rollback.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Metric                  Purpose                 Caution
  ----------------------- ----------------------- -----------------------
  Brier score             Quality of              Compare against
                          probabilistic bust      climatology/base-rate
                          predictions.            baseline.

  Reliability diagram /   Check whether predicted Needs enough cases per
  calibration error       probabilities match     bin; show counts.
                          observed event          
                          frequencies.            

  Precision               Fraction of flagged     Depends on event
                          busts that were actual  prevalence and
                          busts.                  threshold.

  Recall / POD            Fraction of actual      A high-recall system
                          busts detected.         may create many false
                                                  alarms.

  FAR                     False-alarm ratio among State exact formula
                          predicted events.       used.

  CSI / ETS               Event-detection skill   Only meaningful after
                          relative to             defining binary events
                          misses/false alarms and and formula.
                          chance, respectively.   

  PR-AUC / ROC-AUC        Ranking discrimination. Does not prove
                                                  calibration or
                                                  operational usefulness.

  MAE / RMSE              Underlying              Do not confuse error
                          forecast-error          magnitude metrics with
                          magnitude or a          bust-probability
                          regression target, if   quality.
                          used.                   
  -----------------------------------------------------------------------

  ------------------------------------------------------------------------------------------
  Method + endpoint                          Purpose                 Key query/body fields
  ------------------------------------------ ----------------------- -----------------------
  GET /health                                Liveness check.         No auth; returns status
                                                                     and service version.

  GET /api/v1/forecast-runs                  List available runs.    from, to, model_id,
                                                                     status, page,
                                                                     page_size.

  GET /api/v1/forecast-runs/latest           Get latest usable run.  Optional model_id.

  GET /api/v1/confidence-map                 Map data for selected   run_id, forecast_day,
                                             run/lead.               variable, metric,
                                                                     region_level,
                                                                     threshold.

  GET /api/v1/regions                        List/search regions.    query, region_level,
                                                                     bbox, page, page_size.

  GET /api/v1/regions/{region_id}/risk       Region-level bust risk  run_id, forecast_day,
                                             and confidence.         variable.

  GET                                        Evidence-backed         prediction_id or
  /api/v1/regions/{region_id}/explanations   explanation.            run_id + lead +
                                                                     variable.

  GET /api/v1/verification/summary           Aggregated model skill. model_version, date
                                                                     range, lead, variable,
                                                                     region, threshold.

  GET /api/v1/verification/series            Time-series/lead-time   same filters;
                                             metrics.                aggregation interval.

  GET /api/v1/cases                          Search historical bust  date range, region,
                                             cases.                  variable, lead, regime,
                                                                     page.

  GET /api/v1/data-status                    Source freshness and    source_id optional.
                                             quality.                

  GET /api/v1/models                         List registered models. status, version.

  POST /api/v1/admin/ingestion-jobs          Trigger                 Admin-only; source,
                                             ingestion/backfill.     date range.

  POST /api/v1/admin/prediction-jobs         Generate predictions    Admin-only; run_id,
                                             for a run.              model_version.

  GET /api/v1/exports/regions.csv            Download filtered       Same filters as map;
                                             regional table.         size limits.
  ------------------------------------------------------------------------------------------

  ----------------------------------------------------------------------------
  Table                     Important fields          Purpose
  ------------------------- ------------------------- ------------------------
  forecast_sources          id, name, type, license,  Source registry; secrets
                            config_ref, enabled       stored outside the
                                                      database.

  forecast_runs             id, source_id, model_id,  Run metadata and
                            init_time, status,        lineage.
                            ingested_at, checksum     

  forecast_records          id, run_id, valid_time,   Normalized forecast
                            lead_hours, variable,     values or regional
                            region_id/grid_ref,       aggregates.
                            value, unit,              
                            quality_flags             

  observation_records       id, source_id,            Verifying
                            valid_time, variable,     observations/analysis.
                            region_id/grid_ref,       
                            value, unit,              
                            quality_flags             

  error_labels              id, run_id, valid_time,   Auditable labels and
                            variable, region_id,      threshold history.
                            error_value, bust_label,  
                            threshold_version         

  feature_rows              id, run_id, valid_time,   Features used for
                            variable, region_id,      training/inference;
                            feature_schema_version,   large arrays may be in
                            features_ref              object storage.

  model_versions            id, name, version,        Model registry and
                            artifact_uri,             release lifecycle.
                            feature_schema_version,   
                            training_period,          
                            metrics_json, status      

  predictions               id, run_id,               Prediction outputs.
                            model_version_id,         
                            region_id, variable,      
                            lead_hours,               
                            bust_probability,         
                            confidence_label,         
                            generated_at,             
                            quality_flags             

  prediction_explanations   id, prediction_id,        Evidence items shown in
                            explanation_json,         UI.
                            explainer_version         

  verification_metrics      id, model_version_id,     Precomputed evaluation
                            period_start, period_end, results.
                            region_id, variable,      
                            lead_hours, metrics_json, 
                            sample_count              

  pipeline_jobs             id, job_type, status,     Ingestion and inference
                            started_at, ended_at,     status.
                            error_summary, source_id  

  audit_events              id, actor_id, action,     Admin and security audit
                            resource_type,            trail.
                            resource_id, created_at,  
                            metadata_json             
  ----------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Requirement             MVP target              Measurement
  ----------------------- ----------------------- -----------------------
  Dashboard initial load  Under 3 seconds for     Frontend performance
                          cached demo/aggregated  measurement.
                          data on a typical       
                          broadband connection.   

  Map/filter response     Under 2 seconds for     API p95 latency.
                          precomputed regional    
                          aggregates under normal 
                          demo load.              

  API reliability         Graceful error state if Integration tests and
                          data/ML service is      uptime checks.
                          unavailable; never show 
                          stale values as         
                          current.                

  Data freshness          Display latest source   Pipeline health job.
                          timestamp and age;      
                          configure a             
                          source-specific         
                          freshness SLA.          

  Inference               Batch inference for a   Job duration and
                          forecast run should     failed-job rate.
                          complete within an      
                          agreed operational      
                          window.                 

  Reproducibility         Every prediction can be Audit/lineage
                          traced to run, data     completeness test.
                          version, feature schema 
                          and model version.      

  Observability           Structured logs and     Health endpoint and
                          metrics for ingestion,  operator view.
                          validation, inference,  
                          API latency and         
                          exceptions.             
  -----------------------------------------------------------------------

  --------------------------------------------------------------------------
  ID                      Requirement                Acceptance test
  ----------------------- -------------------------- -----------------------
  AC-01                   Day 1--Day 10 forecast     Selecting each day
                          view                       updates map, table and
                                                     detail data
                                                     consistently.

  AC-02                   Bust probability           Each displayed
                                                     probability is in
                                                     \[0,1\], carries model
                                                     version and references
                                                     a defined
                                                     target/threshold.

  AC-03                   Confidence map             Map legend describes
                                                     the selected metric;
                                                     no-data is visually
                                                     distinct from low
                                                     confidence.

  AC-04                   Error-prone area detection Table sorts by bust
                                                     probability and filters
                                                     by variable, lead and
                                                     region.

  AC-05                   Explanation                Every evidence item
                                                     maps to an available
                                                     feature or validated
                                                     attribution; missing
                                                     features are not
                                                     fabricated.

  AC-06                   Data provenance            UI and API show run
                                                     initialization,
                                                     generated timestamp,
                                                     model version and data
                                                     mode.

  AC-07                   Verification               Metrics include
                                                     formula/definition,
                                                     sample count and
                                                     baseline comparison
                                                     where available.

  AC-08                   Data-quality handling      Stale/missing input is
                                                     flagged and cannot
                                                     silently become a
                                                     high-confidence
                                                     prediction.

  AC-09                   API                        OpenAPI docs cover core
                                                     endpoints and
                                                     valid/error response
                                                     schemas.

  AC-10                   Access control             Unauthenticated users
                                                     cannot trigger admin
                                                     jobs or modify
                                                     thresholds/models.

  AC-11                   Reproducibility            A prediction record can
                                                     be traced to run, model
                                                     and feature schema.

  AC-12                   Demo integrity             Synthetic or proxy data
                                                     is labelled on every
                                                     relevant screen and
                                                     exported file.

  AC-13                   Responsive/accessibility   Core workflows work by
                                                     keyboard and remain
                                                     usable at tablet width;
                                                     map has a table
                                                     alternative.

  AC-14                   Failure states             API failure, empty
                                                     dataset and stale
                                                     dataset each have
                                                     distinct UI states.
  --------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Test layer                          Coverage
  ----------------------------------- -----------------------------------
  Unit tests                          Bust-label calculation,
                                      timestamp/lead-time arithmetic,
                                      probability bounds, confidence
                                      mapping, aggregation and metric
                                      formulas.

  Data tests                          Schema validation, duplicate runs,
                                      missing values, unit consistency,
                                      timestamp alignment and region
                                      mapping.

  ML tests                            Leakage checks, baseline
                                      comparison, calibration,
                                      reproducible split and performance
                                      by lead/region/season.

  API tests                           Authentication, validation errors,
                                      pagination, filter consistency,
                                      provenance fields and OpenAPI
                                      schema.

  Frontend tests                      Lead-day controls, map/table
                                      synchronization, legends,
                                      loading/error states, accessibility
                                      and export.

  End-to-end tests                    Ingest sample run → validate →
                                      generate prediction → render map →
                                      open region → view explanation →
                                      view verification.

  Security tests                      Admin route protection, secret
                                      scanning, injection-safe filters,
                                      export limits and dependency
                                      checks.

  Operational tests                   Worker restart, failed ingestion
                                      retry, partial source outage,
                                      stale-data warning and model
                                      rollback.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Phase                   Tasks                   Deliverable / exit
                                                  criteria
  ----------------------- ----------------------- -----------------------
  Phase 0 --- Validate    Confirm data source,    Data/label decision
  (Day 1)                 access, variable(s),    log; risk register.
                          spatial unit, bust      
                          threshold, lead-time    
                          definition and          
                          demo-data plan.         

  Phase 1 --- Foundation  Set up repository, API, App runs locally;
  (Days 2--3)             database schema, sample sample API contract
                          dataset, frontend shell passes.
                          and map component.      

  Phase 2 --- Baseline    Ingest/normalize data,  Reproducible training
  pipeline (Days 4--5)    create error labels,    script and baseline
                          build historical        metrics.
                          baseline and one        
                          candidate model.        

  Phase 3 --- Product     Implement dashboard,    End-to-end user journey
  workflow (Days 6--7)    lead-day filters,       works on sample or
                          map/table, region       approved data.
                          detail and evidence     
                          panel.                  

  Phase 4 ---             Implement metrics,      Verification report and
  Verification and API    baseline comparison,    documented endpoints.
  (Days 8--9)             OpenAPI docs,           
                          data-status view and    
                          export.                 

  Phase 5 --- Hardening   Add data-quality        Acceptance criteria
  (Days 10--11)           states, tests,          pass for core flow.
                          audit/provenance,       
                          loading/error states    
                          and deployment config.  

  Phase 6 --- Demo        Run a scripted          Reliable
  readiness (Days 12--14) scenario, prepare case  offline-capable demo
                          study, architecture     with transparent
                          diagram, model card,    evidence.
                          limitations and         
                          presentation.           
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Area                    Recommendation          Reason
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js/React +         Strong dashboard
                          TypeScript              ecosystem and
                                                  maintainable UI.

  Maps                    MapLibre GL JS or       Interactive spatial
                          Leaflet; GeoJSON for    visualization without
                          prototype               coupling ML logic to
                                                  the browser.

  Charts                  Recharts or ECharts     Time series,
                                                  reliability plots and
                                                  verification summaries.

  Backend                 FastAPI + Pydantic      Python-native ML
                                                  integration and
                                                  auto-generated API
                                                  documentation.

  ML                      pandas, NumPy,          Practical tabular
                          scikit-learn;           baseline and candidate
                          LightGBM/XGBoost if     modelling.
                          installable             

  Weather data            xarray/netCDF/Zarr as   Useful for gridded
                          required by source      meteorological
                          format                  datasets.

  Database                PostgreSQL + PostGIS    Queryable metadata and
                                                  regional geospatial
                                                  features.

  Jobs                    Scheduled Python        Keep slow
                          worker; Celery/Redis if ingestion/training out
                          needed                  of request-response
                                                  path.

  Deployment              Docker Compose for      Repeatable environment
                          local demo; managed     and simpler team
                          hosting for final demo  onboarding.

  Monitoring              Structured logs +       Enough visibility for a
                          health/status endpoints prototype without heavy
                                                  platform overhead.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Risk / assumption       Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  No dataset link in      Core model cannot be    Confirm access
  supplied PS             validated.              immediately; document a
                                                  proxy/demo path and
                                                  label it honestly.

  No agreed definition of Labels and metrics      Agree variable-specific
  forecast bust           become arbitrary.       thresholds with domain
                                                  guidance; version
                                                  threshold definitions.

  Sparse examples of      Model may miss rare     Use time/event-aware
  extreme events          high-impact busts.      evaluation, report
                                                  uncertainty and avoid
                                                  overselling rare-event
                                                  performance.

  Data leakage across     Inflated test           Split by time and
  weather events          performance.            event; fit
                                                  preprocessing only on
                                                  training data.

  Spatial/temporal        Incorrect error labels. Test valid-time
  misalignment                                    alignment, units, grids
                                                  and aggregation
                                                  explicitly.

  Model drift across      Reliability degrades.   Monitor performance by
  seasons/regimes                                 lead/season/regime and
                                                  retrain only after
                                                  review.

  Explanations overstate  Users may misinterpret  Use evidence-grounded
  causality               model signals.          wording and explicitly
                                                  distinguish attribution
                                                  from causal
                                                  explanation.

  Operational users       Poor decisions from     Show probability,
  mistake confidence for  misunderstood output.   caveats, source
  certainty                                       freshness and
                                                  official-forecast
                                                  disclaimer.

  Hackathon timeline      Overbuilt architecture  Build a modular
                          and unfinished demo.    monolith and one strong
                                                  end-to-end workflow
                                                  first.
  -----------------------------------------------------------------------
