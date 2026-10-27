# Part 2 → Software Evolution / Refactoring Handoff

**Project:** DaPlanStan  
**Before-version source label:** `baseline`  
**Source snapshot:** `daplanstan-main.zip`  
**Frozen BEFORE inventory:** P01–P09, 9 instances, 3 types.  
**Purpose:** Source comparison instructions only; no prescribed design or implementation solution.

## Baseline IDs to preserve

| ID | Frozen instance |
|---|---|
| P01 | Parsed Email to Trip Record Linking |
| P02 | Inbound Travel Email Intake Coordination |
| P03 | Trip Creation Coordination |
| P04 | Trip Membership Management Coordination |
| P05 | Bulk Itinerary Import Coordination |
| P06 | OAuth Sign-in and Identity Linking Coordination |
| P07 | Account Traveler Enrollment Coordination |
| P08 | Outbound Mail Delivery Logging |
| P09 | Trip-Scoped Turbo Refresh Notifications |

## Evolution comparison instructions


The evolved application should use the nine-instance `baseline` as the unchanged **BEFORE** source version. Preserve P01–P09 identifiers while comparing implementation changes, and record whether each existing collaboration is **preserved, modified, extended, replaced or removed**. Record genuinely new patterns separately and use `patterns_evolution.csv` for status tracking. Do not retroactively modify baseline counts because of subsequent evolution.

| Next-stage requirement | Baseline source areas to examine | Existing references where applicable |
|---|---|---|
| Personalized itinerary generation | `Trip`, `TripItem`, itinerary import and related coordination | P03, P05; P01 only where record interpretation/linking changes |
| Multiple booking providers | External integration boundaries, provider interactions and booking-related data | P01, P02 or P06 only if their existing responsibilities are affected |
| Different cancellation policies | New cancellation logic and any affected trip, membership or controller responsibilities | P03, P04 or P07 only if actually affected |

New booking and cancellation code should be compared against the baseline, not described as having existed in the original snapshot. These are investigation entry points, **not refactoring or pattern-design prescriptions**.

## Evidence and reporting boundary

Keep the original `patterns.csv`, `pattern_counts.csv`, nine Mermaid diagrams and verification records unchanged as the BEFORE snapshot. Maintain an independently evidenced AFTER record for any changed or new collaboration, with file paths and source verification in `patterns_evolution.csv`. Baseline Git provenance is unverified; do not equate the ZIP to commit `da54d9ab8bfc118e99375fdd6c506efb20b66e5b` as a verified fact. Original baseline runtime and human-review limitations also remain documented.
