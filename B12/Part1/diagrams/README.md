# Part 1 — Diagrams

Editable PlantUML sources for the baseline architecture at commit `940daee`.

- `class_model.puml` — entity / class model and repository dependencies
- `module_component.puml` — NestJS module / component wiring
- `reservation_sequence.puml` — reservation request/event sequence

Render with PlantUML, e.g.:

```
plantuml class_model.puml module_component.puml reservation_sequence.puml
```

Rendered PNGs are committed under `rendered/` alongside these `.puml` sources;
both the editable sources and the rendered images are checked-in deliverables.
