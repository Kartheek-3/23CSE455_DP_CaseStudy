# Team A5

Design Pattern Identification in a Laravel-Based Healthcare Management Application.

23CSE455 Design Patterns. Date: 2026-10-10.

| Roll number | Student name |
|---|---|
| AM.AL.U4AID23014 | Nemali Ashrith Reddy |
| AM.AL.U4AID23062 | Akshay Reddy Velugati |
| AM.SC.U4CSE23212 | B. Pravallika |
| AM.SC.U4CSE23022 | Daripineni Manogna |

## The application

The study uses [esteham/hospital-management](https://github.com/esteham/hospital-management) at commit `1e7420e431771e3f5eec470d8a005e8255fa5fe8`. A page built with Vue 3 and Inertia sends a request to the Laravel router. The router calls a controller. The controller checks the input, calls a Laravel facade when it needs mail or a PDF, and stores the row through an Eloquent model. MySQL holds the tables.

| Item | Value |
|---|---|
| Backend | Laravel 12, PHP ^8.2 |
| Frontend | Vue 3, Inertia |
| Database | MySQL through Eloquent |
| Inspected source | `data/code/` |
| Report | `A5_Report.pdf` |

## How a request moves

| Step | What happens | Where it is in the source |
|---|---|---|
| Patient and doctor | A patient is a `User` with a role. A doctor is a `Doctor` row linked to that user. | `data/code/app/Models/User.php`, `Doctor.php` |
| Appointment | `AppointmentController::store` checks the doctor's daily capacity, creates the `Appointment`, and sends mail. | `data/code/app/Http/Controllers/AppointmentController.php` |
| Laboratory | `DiagnosticBookingController::store` accepts cash, card, or online, sets `payment_status` to pending, and creates a `BookingDiagnostic` row. | `data/code/app/Http/Controllers/Diagnostic/DiagnosticBookingController.php` |
| Medical record | The doctor who owns the appointment writes `prescription_text`, builds a PDF, and emails it. | `data/code/app/Http/Controllers/Doctor/AppointmentController.php` |
| Package booking | A separate table stores `payment_type`, `amount_paid`, and `total_amount`. | `data/code/app/Models/PackageBooking.php` |

## Part 1 findings

| Pattern | Where it appears | Count |
|---|---|---|
| Active Record | Appointment row, diagnostic payment flags, patient and doctor identity | 3 |
| Facade | Prescription mail and PDF, and the controller imports of Auth, Mail, Validator, DB, and Pdf. These are Laravel's own facades. | 2 |

| Pattern | Result in the examined modules |
|---|---|
| Adapter | Not identified |
| Proxy | Not identified |
| Strategy | Not identified. `payment_method` is the list cash, card, online. |
| Repository | Not identified. Queries sit in the controllers. |
| Observer | Not identified. Mail is sent inside `storePrescription`. |
| Service layer | Not identified. `DiagnosticService` is the catalogue model. |

The rows, file paths, and line ranges are in `Part1/patterns.csv` and `Part1/Pattern_count.csv`. The current architecture is `Part1/pattern_architecture/current_architecture.pdf`.

## Part 2 findings

| Integration | Code in the application | Design recorded in this folder |
|---|---|---|
| Laboratory | `DiagnosticBookingController` creates `BookingDiagnostic` | `LaboratoryIntegrationService` and `LaboratoryIntegrationInterface` in `Part2/code/` |
| Billing | The controller stores `payment_method` and `payment_status` | `BillingService` and `PaymentStrategy`, with `StripePayment` and `PayPalPayment` |
| Patient data | Controllers read `User`, `Appointment`, and `Prescription` | `PatientDataService`, `EHRProvider`, `EpicEHRAdapter`, and `EpicFHIRApi` |

| Pattern | Role in the design | Where the runnable code is |
|---|---|---|
| Adapter | Turns a nested FHIR sample into first name, last name, and phone | `Part3/adapter/` |
| Strategy | Swaps Stripe and PayPal behind one payment call | `Part3/strategy/` |
| Proxy | A cache in front of the patient-record call | Recorded with Change 3 |
| Facade | The Laravel facades already in the controllers | Unchanged |

`Part2/pattern_evalution.csv` is the pattern table for this part. `Part2/diagrams/evolved_architecture.pdf`, `adapter_uml.pdf`, and `strategy_uml.pdf` are the figures. Change 1, Change 2, and Change 3 each have a requirement, a difference note, and a test result.

## Part 3 findings

| Language | Adapter command | Strategy command | Result |
|---|---|---|---|
| Java | `javac AdapterDemo.java` then `java AdapterDemo` | `javac StrategyDemo.java` then `java StrategyDemo` | Exit 0 |
| Python | `python adapter_demo.py` | `python strategy_demo.py` | Exit 0 |
| JavaScript | `node adapterDemo.js` | `node strategyDemo.js` | Exit 0. Exit 1 if the checked fields are wrong. |
| C++ | `g++ -std=c++17 adapter_demo.cpp -o adapter_demo` | `g++ -std=c++17 strategy_demo.cpp -o strategy_demo` | Exit 0. Exit 1 if the checked fields are wrong. |

| Check | Printed result | Output file |
|---|---|---|
| Adapter, patient `PT-98765` | first name John, last name Smith, phone `555-1234` | `data/test_result/adapter_java.txt` and the Python, JavaScript, and C++ files beside it |
| Strategy, reference `DX-1001` | provider `stripe`, amount 1200, status paid | `data/test_result/strategy_java.txt` and the three files beside it |
| Strategy, reference `DX-1002` | provider `paypal`, amount 850.5, status paid | same strategy files |

The comparison tables are `Part3/adapter/pattern_crosslanguage.csv` and `Part3/strategy/pattern_crosslanguage.csv`.

## Contributions

| Student | Part |
|---|---|
| Nemali Ashrith Reddy | Part 1. Modules, pattern inventory, current architecture |
| Akshay Reddy Velugati | Part 2. Laboratory, billing, patient data, UML |
| B. Pravallika | Part 3 Adapter in Java, Python, JavaScript, and C++ |
| Daripineni Manogna | Part 3 Strategy in Java, Python, JavaScript, and C++ |

## File structure

```
A5/
|-- README.md
|-- A5_Report.pdf
|-- A5_Report.tex
|-- data/
|   |-- code/                  composer.json, controllers, models
|   |-- test_result/           printed output of the eight programs
|-- Part1/
|   |-- patterns.csv
|   |-- Pattern_count.csv
|   |-- llm.csv
|   |-- llm/verification.md
|   |-- pattern_architecture/current_architecture.pdf
|-- Part2/
|   |-- pattern_evalution.csv
|   |-- Pattern_count.csv
|   |-- llm.csv
|   |-- code/                  LaboratoryIntegrationService, BillingService, PatientDataService
|   |-- diagrams/              evolved architecture, adapter UML, strategy UML
|   |-- changes/Change1, Change2, Change3
|-- Part3/
    |-- adapter/               Java, Python, JavaScript, C++
    |-- strategy/              Java, Python, JavaScript, C++
```

Paths inside the CSV files start from this `A5/` folder. Each diagram PDF sits next to its `.tex` source. The screenshot in the report is the A5 folder.


## Correction branch notes (2026-10-11)

The selected original Laravel source is stored as excerpts in `data/code/`, not as a full runnable Laravel checkout. The Part 2 integration classes and new fake-provider demonstrations are **standalone prototypes**, not deployed Laravel or real external integrations. Execute `php Part2/tests/integration_contracts.php` from `A5/` to check six standalone assertions; no test pass is claimed until executed. The corrected consolidated datasets are in `data/`. Missing timing and complexity values remain unmeasured, not estimated. The existing report and diagrams have not been regenerated and must be reconciled before submission.

## Eight-pattern extension (2026-10-11)

A new standalone PHP 8.2+ demonstration under [Part2/eight_patterns/](Part2/eight_patterns/) implements eight distinct pattern collaborations for four proposed two-pattern team assignments: Nemali Ashrith Reddy (Facade, Repository), Akshay Reddy Velugati (Adapter, Strategy), B. Pravallika (Proxy, Observer), Daripineni Manogna (Factory Method, Decorator). Run `php Part2/eight_patterns/test.php` from A5. This is a proposed allocation, not proof of each student's authorship. The examples are not integrated into the original Laravel application; provider responses are synthetic and test execution must be verified. See [pattern inventory](Part2/eight_patterns/pattern_inventory.csv). Baseline counts remain two observed pattern types; extension counts are separate.

**Remaining deliverables:** Full Laravel integration, verification of all 32 new four-language examples, raw test outputs, measurements, full Laravel integration and regeneration of the compiled PDF report. The GitHub Actions workflow attempts to compile and commit the PDF. The original report PDF is superseded by the new TeX appendix until recompiled.

### Cross-language extension

All eight proposed patterns now have standalone source in Java, Python, JavaScript and C++ (32 programs) under [Part3/eight_patterns](Part3/eight_patterns/). The [matrix and commands](Part3/eight_patterns/cross_language.csv) distinguish files from measured results. GitHub Actions workflow [a5-validate.yml](../.github/workflows/a5-validate.yml) runs the PHP tests and 32 programs and attempts to rebuild the PDF. Check the workflow status before claiming successful validation. The baseline Laravel excerpts cannot be executed as a full application without acquiring and configuring the original full source tree.
