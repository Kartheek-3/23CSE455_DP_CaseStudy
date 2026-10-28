# Rejected and uncertain baseline candidates

The frozen baseline retains **5 rejected candidates and 0 uncertain candidates**.

| Candidate | Decision | Reason |
|---|---|---|
| Geocoding - Template Method | Rejected | No application-defined template algorithm with overridable primitive steps. |
| Geocoding - Strategy | Rejected | Biased and fallback lookups are fixed sequential methods rather than interchangeable algorithm implementations. |
| Geocoding - Adapter | Rejected | Direct Geocoder API use does not demonstrate incompatible-interface translation. |
| Itinerary Timeline-Map Event Coordination - Observer | Rejected | Targeted DOM events directed at a known map component are a better explanation than an Observer collaboration. |
| Beta Invite Eligibility Evaluation - Information Expert | Rejected | Simple predicates do not establish an independently significant Information Expert responsibility collaboration. |

No candidate remained uncertain when the baseline was frozen. Rejected classifications are not included in `data/patterns.csv`.
