# A17: PlantUML design-pattern case study

## Team and status

| Roll number | Name | Batch |
| --- | --- | --- |
| AM.SC.U4CSE23064 | Sathvik Pasuvula | CSE A |
| AM.SC.U4CSE23142 | P Sai Satvik Chowdary | CSE A |

This package contains the completed local analysis, code changes, diagrams,
datasets and measured results. The connected GitHub account can read the course
repository but cannot push to it. No GitHub screenshot is represented as a
submission. Faculty approval and individual student contributions were not
confirmed in this interaction. Human verification remains for the students to
record in `data/human_verification.csv`. The LLM's displayed UI label/access tier
were not independently confirmed, so the course's free/public LLM condition
also needs a student check.

`team_contributions.md` divides the technical source review, evolution checks
and four-language verification between the two students. Its items are assigned
work, not completed contributions until each student records actual evidence.

## Application and source

- Application: [PlantUML](https://github.com/plantuml/plantuml), class-diagram family.
- Tag: `v1.2026.8`; annotated tag object:
  `b531f7b00ebf733d9079a7b0a0180c64ded21ef0`.
- Peeled baseline commit: `149874a1bb2b64c42889d7178cb89f6647ac14bc`.
- Source access date: 2026-10-11.
- License: GPL-3.0-or-later notices in inspected Java files. Upstream `LICENSE`,
  `COPYING` and `LICENSES.md` are copied under `data/code/`.
- Repository source: <https://github.com/plantuml/plantuml/tree/v1.2026.8>.

The verified scope covers `CommandCreateClass`, `CommandLinkClass`,
`PSystemCommandFactory`, `ClassDiagramFactory`, `Entity`, `Link`,
`CucaDiagram.getTextBlock`, the four layout backends selected there,
class-header `TextBlock` composition, `GraphvizJs` and its stream bridge.
The output trace additionally follows `SourceStringReader`, `UgDiagram`,
`TextBlockExporter`, `EntityImageClass` and `PortableSvgDocument`.
Other diagram families, full web-server behavior, TeaVM browser execution,
optional VizJs runtime and all other PlantUML commands were excluded. The five
pattern types are a scoped inventory, not a whole-repository count.

## Environment and measured outcomes

The recorded machine used macOS 27.0.1 arm64, OpenJDK 25.0.2, Gradle 9.3.1,
Graphviz 16.1.0, Python 3.14.2, Node.js 22.19.0 and Apple clang 21.0.0.
The PlantUML project compiles production Java with release 11. Its version
catalog pins JUnit 6.1.3, ELK 0.12.0, TeaVM 0.14.1, JLaTeXMath 1.0.7 and
OpenPDF 3.0.5. There is no database in the inspected path.

Both original and final full PlantUML builds produced JARs. In both trees,
`GPL_ONLY=1 bash gradlew jar test -Pfast --console=plain` completed 3,189 tests:
3,177 passed, 2 failed and 10 skipped in the console summary. The generated
JUnit XML and HTML count 3,191 entries: 3,177 passed, 2 failed and 12 skipped.
The two additional skipped entries appear in both trees. The same two
`PicowebTest` cases expected HTTP 200 and received 503. See
`Part2/evidence/upstream/summary.json` and raw
logs. The final built JAR passed 20/20 focused integration checks. The four
language programs each passed 16/16 shared cases.

## Files and reproduction

- `A17_Report.tex` and `A17_Report.pdf`: one report and its editable source.
- `Part1/diagrams/*.puml`: editable architecture and pattern UML, each with PNG
  and SVG output. `Part1/evidence/` records exact participants and candidate decisions.
- `Part2/changes/Change1` to `Change3`: requirements, parent/child commits,
  cumulative Java source snapshots, patches, logs and example diagrams.
  `Part2/code/` is the final modified source subset.
- `Part3/diagram/`: one equivalent program in Java, Python, JavaScript and C++.
  `Part3/test-cases/fixtures.json` holds expected outputs. The slide PDF and its
  editable PPTX are in `Part3/`.
- `data/`: the authoritative CSVs and a readable Excel workbook. CSVs use one
  UTF-8 header row; all paths inside them are relative to this A17 folder.
- `llm/`: exact supplied prompt text, captured public assistant output and
  correction record. This is one actual interaction, not invented sessions.

To reconstruct final application source in an **absent** destination directory:

```bash
bash Part2/reconstruct.sh /absolute/output/plantuml-a17
cd /absolute/output/plantuml-a17
GPL_ONLY=1 bash gradlew jar test -Pfast --console=plain
```

The script clones the pinned tag and applies the three saved patches in order.
The expected broad test result is above; a clean suite is not claimed. The
commits listed in `Part2/evidence/snapshots.json` are from the local experiment.
The saved cumulative files and patches make the content reproducible without
access to that local Git branch.

For focused snapshot checks, supply the official release JAR for v1.2026.8:

```bash
python3 Part2/run_evolution.py /absolute/path/plantuml-1.2026.8.jar /absolute/output/snapshot-builds
```

The test script compiles saved changed Java files against the official baseline
runtime and runs the real `SourceStringReader` parser, model and SVG/PNG exporter.
Expected checked cases: baseline 3/3, CH01 11/11, CH02 15/15, CH03 20/20.
Full-built-JAR confirmation is in `Part2/evidence/full-build/tests.log`.
No compiled JAR, class file or dependency cache is included in the team folder.

For the language comparison:

```bash
python3 Part3/run_tests.py
```

This compiles Java and C++ to a temporary folder, runs all four languages on
sixteen common fixtures, then measures one warm-up and five fresh process runs
on the same three-line fixture. Timing includes startup, standard input,
execution and captured output. It excludes compilation and the sixteen-case
loop. Raw samples are in `Part3/evidence/results.json`. The source code and
commands for each language are explained in `Part3/diagram/*/README.md`.

Metrics were generated with Lizard 1.24.1. `data/evolution_metrics.csv` measures
the same nine production Java paths listed in
`Part2/evidence/measurement_scope.txt` at every snapshot; an absent new file
contributes zero. `data/cross_language.csv` measures production code only,
excluding runners and tests. `source_loc` excludes blank/comment lines.
`max_function_cc` is Lizard's highest per-function cyclomatic complexity using
its language parser and decision count. The per-function results appear in
`Part3/evidence/*-functions.json`. Process timing is repeated on each of five
pattern rows for a language because those rows describe one shared program;
the values must not be added.

## Dataset definitions

`patterns.csv` has one row for each baseline collaboration. The continuing
version-specific records are in `patterns_evolution.csv`; added `status_after_change`
and `change_description` columns describe the effect. `pattern_counts.csv`
counts each version independently. `cross_language.csv` uses one row per
confirmed pattern instance and language, with shared-program metrics repeated.
`llm.csv` maps the three course parts to the actual session materials.
`evolution_metrics.csv` and `human_verification.csv` support the requested
before/after analysis and reviewer sign-off. The workbook includes these CSV
records with typed numeric fields and an overview sheet.

## Submission follow-up

The course repository was checked through the connected account on 2026-10-11:
`aswathymohan-amrita/23CSE455_DP_CaseStudy` is readable, but the account has
`push: false`. Once the team has write access, upload **this entire A17 folder**
at the repository root, then take a real GitHub screenshot of that uploaded folder.
Check faculty approval, the required free/public LLM tool tier, actual student
contributions and human verification before submission. No placeholder screenshot
or invented approval is included.
