# Part 2 — Diagrams

Editable PlantUML sources for the three evolution changes, one class diagram per
change. They mirror the actual source under `../code/evolved/`.

- `change1_strategy.puml` — Strategy pattern for dynamic slot allocation
- `change2_state.puml` — State pattern for the EV charging session lifecycle
- `change3_observer.puml` — Observer pattern for real-time occupancy monitoring

Render with PlantUML, e.g.:

```
plantuml change1_strategy.puml change2_state.puml change3_observer.puml
```

Rendered PNGs are committed under `rendered/` alongside these `.puml` sources;
both the editable sources and the rendered images are checked-in deliverables.
