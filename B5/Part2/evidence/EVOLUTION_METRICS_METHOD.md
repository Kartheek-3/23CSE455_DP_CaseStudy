# Evolution metrics method

Application source LOC uses one fixed rule across all four snapshots:

- include `app/**/*.rb` and `config/routes.rb`;
- exclude blank lines and lines whose first non-whitespace character is `#`;
- exclude tests, views, generated schema/structure files, documentation, fixtures and evidence scripts.

Results: baseline 1797; Scenario 1 2011; Scenario 2 2197; Scenario 3 2332.

Concrete variable-role classes are deduplicated by class within each snapshot. Baseline = 8. Scenario 1 = 8 because the new Controller collaboration reuses `TripItemsController`. Scenario 2 = 11 after adding `BookingOptionsController`, `AtlasAdapter`, and `BeaconAdapter`. Scenario 3 = 15 after adding `CancellationQuotesController` and the three concrete cancellation-policy classes.

Test values are actual recorded results only. Missing Rails results for earlier snapshots are described as blocked, not estimated.
