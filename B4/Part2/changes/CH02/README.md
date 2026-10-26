# CH02 - Advanced property filtering

Acceptance criteria: availability, city, inclusive rent range, amenity, and furnished rules can run alone or as one AND composite; the composite fixture returns only property id 1; an inverted rent range fails; a new rule does not require editing the existing rules.

Refactoring: Replace Conditional with Polymorphism and introduce Specification. `PropertyFilterService` evaluates a common `PropertySpecification`; `PropertyController` composes request-driven address, rent, and status rules. The domain also includes the shared five-rule cross-language fixture. Evidence is in `advanced_filtering.patch` and the four-language Specification fixtures. Commit: `2b2dd6246dd50f4a53a991e5429b22da1b1a5c4f`.

Effect: one new **Advanced Property Filtering** Specification instance is introduced.
