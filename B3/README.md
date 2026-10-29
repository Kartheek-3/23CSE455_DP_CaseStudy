# Design Patterns Case Study — Django Job Portal

## Project Overview

This project studies design patterns in a Django Job Portal application across three parts:

- **Part 1:** Identify and analyze design patterns in the original application.
- **Part 2:** Introduce and evaluate design-pattern-related changes and refactoring.
- **Part 3:** Implement selected design patterns in Python, Java, JavaScript, and C++ and compare their complexity and runtime measurements.

The application uses Django REST Framework (DRF) for REST APIs and Graphene for GraphQL operations.

## Part 1 — Design Pattern Discovery

Part 1 analyzes selected source files to identify pattern collaborations and distinguish application-defined behavior from framework-provided mechanisms.

### Baseline pattern inventory

| Pattern | Instances | Finding |
|---|---:|---|
| Strategy | 2 | GraphQL Permission Policy and DRF Role Permission Policy |
| Template Method | 2 | GraphQL Mutation Pipeline and DRF Create Hook |
| Factory Method | 1 candidate | Company Serializer Selection; a qualified candidate |

The documented baseline contains **5 pattern instances across 3 pattern types** in the inspected source scope. This is not a claim that every file in the entire repository was exhaustively audited.

### Baseline testing

The recorded command was:

```powershell
python manage.py test --keepdb
```

The baseline discovered 59 tests. Of these, 41 were executed: 31 passed, 5 failed, and 5 errored. Another 18 tests were not executed because four test classes failed during `setUpClass`.

A separate Part 1 pattern-test suite reported 17 passing tests. These results represent separate runs and must not be combined into one total.

## Part 2 — Pattern Evolution and Refactoring

Part 2 documents three changes to the Django Job Portal.

| Change | Description | Pattern interpretation |
|---|---|---|
| CH01 — Observer | Introduces job-creation notifications through a subject and registered observers. | Observer-style collaboration |
| CH02 — Recruiter authorization | Adds recruiter-specific permission behavior and a GraphQL recruiter-jobs query. | Partial Strategy candidate unless interchangeable policy selection is demonstrated |
| CH03 — State | Introduces state classes for applicant-status behavior and transitions. | State pattern candidate, subject to source verification |

### Recorded test results

| Test run | Reported result |
|---|---|
| CH01 — Observer | 6 tests passed |
| CH02 — Permission tests | 5 tests passed; end-to-end GraphQL query behavior was not confirmed by this test log |
| CH03 — State/API | 13 tests passed in the supplied test run |

The recorded pattern-count data describes an evolution from **3 pattern types and 5 instances in the baseline to 5 types and 8 instances after CH03**. Interpret these totals with the qualifications in the case-study report.

## Part 3 — Cross-Language Implementations

Part 3 implements three selected patterns in four programming languages.

| Pattern | Example |
|---|---|
| Strategy | Permission checks for employer, employee, and job creator |
| Observer | A job service notifies observers when a job is created |
| Template Method | A common mutation workflow with customizable steps |

The implementations are standalone examples intended to demonstrate pattern structure. They are not complete integrations with Django, DRF, or Graphene.

### Languages

- Python
- Java
- JavaScript
- C++

### Project structure

```text
Part3/
├── Strategy/
│   ├── Python/
│   ├── Java/
│   ├── JavaScript/
│   └── C++/
├── Observer/
│   ├── Python/
│   ├── Java/
│   ├── JavaScript/
│   └── C++/
└── TemplateMethod/
    ├── Python/
    ├── Java/
    ├── JavaScript/
    └── C++/
```

## Cyclomatic Complexity

Complexity measurements were performed using **Lizard 1.24.3**. The values below represent maximum CCN per implementation file, not average CCN or Big-O time complexity.

| Pattern | Python | Java | JavaScript | C++ |
|---|---:|---:|---:|---:|
| Strategy | 3 | 3 | 6 | 3 |
| Observer | 2 | 2 | 2 | Pending verification |
| Template Method | 3 | 2 | 3 | 3 |

The Observer C++ value should be verified against the current source file. An earlier project report records a maximum CCN of 2.

### Running Lizard

Run these commands from the `Part3` directory, adjusting paths to match the actual source files:

```powershell
python -m lizard .\Strategy\Python\main.py
python -m lizard .\Strategy\Java\Main.java
python -m lizard .\Strategy\JavaScript\main.js
```

Record the highest value in the `CCN` column as the maximum cyclomatic complexity for the measured file. Exclude test runners to keep measurements consistent.

## Runtime Measurements

The following median runtime values were recorded in the case-study artifacts.

| Pattern | Language | Environment | Median runtime |
|---|---|---|---:|
| Observer | Python | Python 3.13.15 | 64.955 ms |
| Observer | Java | OpenJDK 25.0.5.0.2 LTS | 98.713 ms |
| Observer | JavaScript | Node.js v24.22.1 | 82.355 ms |
| Observer | C++ | GCC 16.2.0 (MSYS2) | 102.5902 ms |
| Strategy | Python | Python 3.13.15 | 66.214 ms |
| Strategy | Java | OpenJDK 25.0.5.0.2 LTS | 83.283 ms |
| Strategy | JavaScript | Node.js v24.22.1 | 108.211 ms |
| Strategy | C++ | GCC 16.2.0 (MSYS2) | 104.2196 ms |
| Template Method | Python | Python 3.13.15 | 88.082 ms |
| Template Method | Java | OpenJDK 25.0.5.0.2 LTS | 73.920 ms |
| Template Method | JavaScript | Node.js v24.22.1 | 89.399 ms |
| Template Method | C++ | GCC 16.2.0 (MSYS2) | 114.1219 ms |

These measurements depend on the benchmark and execution environment. Python and Node.js timings include process startup; Java timings include JVM startup and exclude compilation; C++ compilation was excluded. Raw timing observations were not available for every row, so not all medians can be independently reproduced from the supplied records.

## Setup and Execution

Use the project's existing README, dependency files, settings, and environment configuration as the authoritative instructions for installation and startup.

General workflow:

1. Clone or open the repository.
2. Create and activate a Python virtual environment.
3. Install the dependencies specified by the project.
4. Configure environment variables and the database.
5. Apply migrations using the project's documented procedure.
6. Start the Django application using its documented command.
7. Run the relevant tests.

The baseline test command recorded for the project is:

```powershell
python manage.py test --keepdb
```

Its recorded result was mixed, as described in Part 1. Do not report the baseline suite as fully passing.

## Limitations and Pending Work

- Verify final pattern classifications against the actual source code and change patches.
- Verify the Observer C++ complexity measurement.
- Verify the Strategy C++ test runner before final submission.
- Align the Python and C++ Template Method implementations with the original GraphQL mutation workflow if required.
- Repair malformed cross-language CSV rows before using them as machine-readable data.
- Apply a consistent source-LOC counting method if LOC comparisons are required.
- Preserve raw timing observations if reproducible benchmark analysis is required.
- Replace any team or student information placeholders with verified official information.
- Ensure the README, diagrams, CSV files, test logs, and report totals match the final repository.

## References

- Django REST Framework — Permissions: https://www.django-rest-framework.org/api-guide/permissions/
- Django REST Framework — Generic Views: https://www.django-rest-framework.org/api-guide/generic-views/
- Graphene-Python documentation: https://docs.graphene-python.org/
- Case-study repository: https://github.com/aswathymohan-amrita/23CSE455_DP_CaseStudy
- Gamma, E., Helm, R., Johnson, R., and Vlissides, J. *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994.

---

This README summarizes the available evidence for Parts 1, 2, and 3. Verify the final source files and assignment requirements before submission.
