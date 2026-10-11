# Design Pattern Identification and Evolution in a Next.js-Based Healthcare Appointment Application

**Course:** 23CSE455 Software Design Patterns  
**Team:** B2  
**Batch:** CSE D  
**Submission Repository:** [23CSE455_DP_CaseStudy](https://github.com/aswathymohan-amrita/23CSE455_DP_CaseStudy)  
**Team Repository:** [Kartheek-3/B2](https://github.com/Kartheek-3/B2)  

---

## 1. Project Overview and Objectives

This repository contains the complete, evidence-based academic case study for the **CarePulse Healthcare Doctor Appointment Management System**, an open-source Next.js 14 full-stack application backed by Appwrite Backend-as-a-Service (BaaS) and Twilio telephony services.

### Core Objectives
1. **Part 1 (Pattern Discovery & Verification):** Audit the untouched baseline repository (`f846cd4`) using Large Language Model (LLM) prompting cross-verified against Abstract Syntax Tree (AST) analysis to identify genuine GoF patterns, framework idioms, and refactoring opportunities while debunking AI hallucinations.
2. **Part 2 (Architectural Evolution):** Implement three realistic clinical enterprise features using formal Gang-of-Four (GoF) design patterns without vendor lock-in or external credential dependencies:
   - **CH01 (Structural Adapter):** Teleconsultation Video Provider integration.
   - **CH02 (Behavioral Strategy):** Dynamic Doctor Availability scheduling policies.
   - **CH03 (Behavioral Observer):** Asynchronous Domain Event Automated Reminders with persistent JSON queuing and idempotency guarantees.
3. **Part 3 (Cross-Language Empirical Evaluation):** Implement all 7 identified patterns across four distinct programming ecosystems (**Java 21**, **Python 3.11**, **JavaScript/Node.js v24**, and **C++14**) and conduct empirical profiling measuring Lines of Code (LOC), Cyclomatic Complexity (CC via Lizard), and five-run median execution runtimes.

---

## 2. Upstream Baseline and Technology Stack

- **Original Application:** [arnobt78/HealthCare-Doctor-Appointment-Management-System--NextJS-FullStack](https://github.com/arnobt78/HealthCare-Doctor-Appointment-Management-System--NextJS-FullStack)
- **Exact Baseline Commit:** `f846cd4c476d48a04fcaeb530b48a77c5295bb92` (Committed 2024-07-30; *"appointment create, schedule, cancel sms notification with twilio added"*)
- **License:** MIT License

### Technology Stack & Verified Versions
| Component | Baseline (Part 1) | Evolved (Part 2) | Part 3 Cross-Language |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 14.2.5 (App Router, Server Actions) | Next.js 14.2.5 (Preserved) | Standalone micro-benchmarks |
| **UI Layer** | React 18.3.1, Tailwind CSS 3.4.1, Radix UI | React 18.3.1, Tailwind CSS 3.4.1 | N/A (CLI test runners) |
| **Runtime** | Node.js v18.x–v24.x | Node.js v24.19.0 / v24.21.0 | Node.js, OpenJDK 21/25, Python 3.11/3.14, GCC 15.2 (WSL) |
| **Language** | TypeScript 5.x / ECMAScript 2022 | TypeScript 5.x | Java 21, Python 3.11, JavaScript, C++14 |
| **BaaS / Database** | node-appwrite SDK 13.0.0 | node-appwrite 17.2.0 + Local Demonstration Store | In-memory repositories / maps |
| **Validation** | Zod 3.23.8 | Zod 3.23.8 | Native assertions |
| **Telephony** | Twilio SDK 5.1.1 | Twilio SDK 5.1.1 + Event Bus Reminders | N/A |
| **Complexity Tool**| Lizard 1.17.x | Lizard 1.17.x | Lizard 1.17.x |
| **LaTeX Engine** | Tectonic 0.17.0 (XeTeX) | Tectonic 0.17.0 (XeTeX) | Tectonic 0.17.0 (XeTeX) |

---

## 3. Repository Structure and Major Deliverables

```
B2/
├── README.md                      # Comprehensive project documentation & run instructions
├── B2_Report.tex                  # Camera-ready master academic LaTeX report source
├── B2_Report.pdf                  # Compiled 12-page camera-ready PDF academic report
├── B2_slide.pdf                   # Project presentation slide deck
├── B2_slide.pptx                  # Editable project presentation slides
├── repo_structure.png             # Workspace screenshot embedded in Report Section 7
├── data/                          # Canonical unified datasets (avoiding duplication)
│   ├── patterns.csv               # Baseline and evolved pattern inventory
│   ├── pattern_counts.csv         # Aligned classification matrix (Baseline vs. Evolved)
│   ├── cross_language.csv         # 28 multi-language implementations (LOC, CC, runtimes)
│   ├── llm.csv                    # Consolidated AI prompting records & human audits
│   ├── code/                      # Untouched baseline application (commit f846cd4)
│   └── test_result/               # Raw LLM prompt outputs & candidate evaluations
├── Part1/                         # Baseline pattern discovery records
│   ├── pattern_architecture/      # Baseline architecture diagram (architecture.png)
│   ├── Part1_prompt.txt           # Multi-turn prompt template used for GPT 5.5
│   └── llm.csv, patterns.csv      # Phase audit archives
├── Part2/                         # Evolved CarePulse application & GoF implementations
│   ├── code/                      # Fully functional evolved Next.js application
│   │   ├── lib/video/             # CH01: GoF Adapter (LocalDemonstrationVideoAdapter)
│   │   ├── lib/availability/      # CH02: GoF Strategy (DoctorAvailabilityContext)
│   │   ├── lib/events/            # CH03: GoF Observer (DomainEventBus)
│   │   ├── lib/reminders/         # Persistent JsonFileReminderStore & ReminderProcessingEngine
│   │   └── tests/run_all_tests.ts # 17 automated integration tests (100% pass)
│   ├── Diagrams/                  # UML diagrams (CH01_Adapter, CH02_Strategy, CH03_Observer)
│   └── changes/                   # Modular change packages (Change1, Change2, Change3)
└── Part3/                         # 7 design patterns implemented across 4 languages (28 total)
    ├── adapter/                   # VideoConsultationProvider (Java, Python, JS, C++)
    ├── strategy/                  # DoctorAvailabilityEvaluation (Java, Python, JS, C++)
    ├── observer/                  # DomainEventReminder (Java, Python, JS, C++)
    ├── singleton/                 # AppwriteClientManager (Java, Python, JS, C++)
    ├── factory_method/            # AppointmentValidationFactory (Java, Python, JS, C++)
    ├── state/                     # AppointmentLifecycleState (Java, Python, JS, C++)
    ├── command/                   # AppointmentActionCommand (Java, Python, JS, C++)
    └── llm/                       # Part 3 prompting records and benchmark logs
```

---

## 4. Inspected Application Modules

- **Server Action Mutations:** `lib/actions/appointment.actions.ts`, `lib/actions/patient.actions.ts`
- **Configuration & Backend Clients:** `lib/appwrite.config.ts`
- **Data Schemas & Validators:** `lib/validation.ts`, `types/index.d.ts`, `types/appwrite.types.ts`
- **Interactive Forms:** `components/forms/AppointmentForm.tsx`, `components/forms/PatientForm.tsx`, `components/forms/RegisterForm.tsx`
- **Excluded Presentational Modules:** Layout shells (`app/layout.tsx`), static SVGs/images, and Radix UI wrapper primitives under `components/ui/*`.

---

## 5. Setup and Execution Instructions

### Prerequisites
- Node.js (v18.x or later) & npm
- Python 3.11+
- OpenJDK 21+
- GCC / G++ (via Ubuntu WSL or MinGW)

### Running the Baseline Application (Part 1)
```bash
cd data/code/HealthCare-Doctor-Appointment-Management-System
npm install
# Configure Appwrite/Twilio environment variables in .env.local
npm run dev
# Launches on http://localhost:3000
```

### Running the Evolved Application (Part 2)
The evolved application includes an automated **Local Demonstration Store** (`localDemoStore.ts`), enabling 100% functionality and test execution without cloud credentials:
```bash
cd Part2/code
npm install
npm run dev
# Launches on http://localhost:3000
```

---

## 6. Running Automated Tests

### Master Integration Test Suite (Part 2)
Runs all 17 automated integration tests across the three evolved GoF patterns:
```bash
cd Part2/code
npx tsx tests/run_all_tests.ts
```
**Actual Result:** `17/17 Passed (100% Pass Rate)`
- **CH01 Adapter (4/4 Pass):** Room creation, doctor-to-clinician translation, patient-to-client translation, and factory resolution.
- **CH02 Strategy (6/6 Pass):** Weekday acceptance, weekend rejection, in-shift acceptance, out-of-shift rejection, 24/7 emergency acceptance, and emergency recovery buffer rejection.
- **CH03 Observer (7/7 Pass):** Event publication, subscriber dispatch, dual-window calculation (T-24h & T-2h), audit logging, idempotency deduplication, transient failure retries, and cancellation revocation.

### Individual Change Tests
```bash
# CH01 Adapter
cd Part2/changes/Change1 && npx tsx tests/test_adapter.ts

# CH02 Strategy
cd Part2/changes/Change2 && npx tsx tests/test_strategy.ts

# CH03 Observer
cd Part2/changes/Change3 && npx tsx tests/test_observer.ts
```

---

## 7. Executing Part 3 Multi-Language Implementations

All 7 patterns are verified across Java, Python, JavaScript, and C++ (28 implementations total):

### 1. Java (OpenJDK 21+)
```bash
# Strategy
javac -d Part3/strategy/java/bin Part3/strategy/java/src/strategy/*.java Part3/strategy/java/src/strategy/models/*.java Part3/strategy/java/tests/StrategyTest.java
java -cp Part3/strategy/java/bin test.StrategyTest

# Adapter
javac -d Part3/adapter/java/bin Part3/adapter/java/src/adapter/*.java Part3/adapter/java/src/adapter/models/*.java Part3/adapter/java/tests/AdapterTest.java
java -cp Part3/adapter/java/bin test.AdapterTest

# Singleton, Factory Method, Observer, State, Command
java -cp Part3/singleton/java/bin tests.SingletonTest
java -cp Part3/factory_method/java/bin snippet.FactoryMethodTest
java -cp Part3/observer/java/bin snippet.ObserverTest
java -cp Part3/state/java/bin snippet.StateTest
java -cp Part3/command/java/bin snippet.CommandTest
```

### 2. Python (Python 3.11+)
```bash
python Part3/strategy/python/tests/test_strategy.py
python Part3/adapter/python/tests/test_adapter.py
python Part3/observer/python/tests/test_observer.py
python Part3/singleton/python/tests/test_singleton.py
python Part3/factory_method/python/tests/test_factory.py
python Part3/state/python/tests/test_state.py
python Part3/command/python/tests/test_command.py
```

### 3. JavaScript (Node.js v24+)
```bash
node Part3/strategy/javascript/tests/test_strategy.js
node Part3/adapter/javascript/tests/test_adapter.js
node Part3/observer/javascript/tests/test_observer.js
node Part3/singleton/javascript/tests/test_singleton.js
node Part3/factory_method/javascript/tests/test_factory.js
node Part3/state/javascript/tests/test_state.js
node Part3/command/javascript/tests/test_command.js
```

### 4. C++ (GCC 15.2 via Ubuntu WSL or MinGW)
```bash
# Execute precompiled binaries or compile on the fly:
wsl -e bash -c "./Part3/strategy/cpp/tests/test_strategy"
wsl -e bash -c "./Part3/adapter/cpp/tests/test_adapter"
wsl -e bash -c "./Part3/observer/cpp/tests/test_observer"
wsl -e bash -c "./Part3/singleton/cpp/tests/test_singleton"
wsl -e bash -c "./Part3/factory_method/cpp/tests/test_factory"
wsl -e bash -c "./Part3/state/cpp/tests/test_state"
wsl -e bash -c "./Part3/command/cpp/tests/test_command"
```

---

## 8. Measurement Methodology and Benchmark Results

- **Lines of Code (LOC):** Counted using physical lines excluding blanks and test fixtures.
- **Cyclomatic Complexity (CC):** Profiled using `lizard` static analyzer (recording maximum function CC).
- **Execution Runtime:** Median duration of 5 consecutive process runs after 1 warm-up run.
- **Canonical Dataset:** All raw measurements are archived in [`data/cross_language.csv`](data/cross_language.csv).

### Benchmark Summary (28 Implementations)
| Pattern | Java LOC (CC / ms) | Python LOC (CC / ms) | JS LOC (CC / ms) | C++ LOC (CC / ms) |
| :--- | :--- | :--- | :--- | :--- |
| **Strategy** | 152 (CC: 10 / 59.9 ms) | 85 (CC: 9 / 58.5 ms) | 84 (CC: 12 / 49.4 ms) | 138 (CC: 12 / 118.4 ms) |
| **Adapter** | 123 (CC: 6 / 96.8 ms) | 82 (CC: 5 / 55.3 ms) | 78 (CC: 5 / 51.3 ms) | 141 (CC: 5 / 104.5 ms) |
| **Observer** | 117 (CC: 5 / 71.8 ms) | 73 (CC: 4 / 61.6 ms) | 63 (CC: 5 / 50.7 ms) | 108 (CC: 3 / 116.2 ms) |
| **Singleton** | 32 (CC: 4 / 59.4 ms) | 22 (CC: 4 / 39.6 ms) | 20 (CC: 4 / 49.2 ms) | 42 (CC: 6 / 97.9 ms) |
| **Factory Method** | 41 (CC: 5 / 67.2 ms) | 27 (CC: 5 / 34.4 ms) | 41 (CC: 5 / 47.3 ms) | 44 (CC: 3 / 99.6 ms) |
| **State** | 79 (CC: 1 / 58.8 ms) | 47 (CC: 1 / 33.6 ms) | 41 (CC: 1 / 46.9 ms) | 69 (CC: 1 / 107.9 ms) |
| **Command** | 133 (CC: 10 / 67.1 ms) | 71 (CC: 6 / 48.4 ms) | 109 (CC: 10 / 54.0 ms) | 114 (CC: 10 / 110.6 ms) |

*Key Finding:* Python and JavaScript achieved equivalent architectural decoupling with **38% to 55% fewer lines of code** than Java and C++.

---

## 9. Limitations and Known Missing Evidence

1. **In-Memory Concurrency (CH02 Strategy):** Doctor availability is validated in application memory prior to database insertion. In distributed environments without database-level row locking on `[doctorId, slotTimestamp]`, concurrent booking requests remain vulnerable to Time-of-Check to Time-of-Use (TOCTOU) race conditions.
2. **Offline Demonstration Video Engine (CH01 Adapter):** The adapter connects to an offline mock engine (`LocalDemonstrationVideoProvider`) generating valid mock JWT tokens. Production deployment requires bridging to live WebRTC signaling or vendor SDKs (Zoom, Twilio Video, Daily.co).
3. **Single-Process Event Bus (CH03 Observer):** The domain event bus operates within a single Node.js runtime process. Multi-instance serverless deployments require an external distributed message broker (Redis Pub/Sub or AWS SQS).
4. **Portability Notice:** C++ implementations were benchmarked under Ubuntu WSL (GCC 15.2.0). Native Windows host execution requires an installed MinGW or MSVC toolchain.

---

## 10. Team Members and Verified Contributions

**Batch:** CSE D

| Roll Number | Student Name | Batch | Primary Verified Contribution |
| :--- | :--- | :---: | :--- |
| `AM.SC.U4CSE23318` | **Gali Rahul** | CSE D | Led Part 1 baseline repository auditing; authored `Part1/Part1_prompt.txt`; conducted AST inspection of Appwrite and Next.js modules; eliminated LLM false positives; compiled baseline `patterns.csv`. |
| `AM.SC.U4CSE23347` | **T. S. J. Sriharsha** | CSE D | Led Part 2 software evolution; implemented CH01 Adapter (`lib/video/`), CH02 Strategy (`lib/availability/`), and CH03 Observer (`lib/events/`); authored 17 automated integration tests in `run_all_tests.ts`; generated draw.io UML diagrams. |
| `AM.SC.U4CSE23335` | **Kartheek Mudi** | CSE D | Maintained GitHub repository infrastructure; implemented Part 3 Strategy, Adapter, Observer, and Singleton patterns across Java, Python, JS, and C++; configured Ubuntu WSL GCC benchmarking environment; recorded Lizard CC metrics. |
| `AM.SC.U4CSE23339` | **P. Jaswanth** | CSE D | Implemented Part 3 Factory Method, State, and Command patterns across Java, Python, JS, and C++; authored unit test assertions for all 28 language implementations; compiled five-run median execution benchmark datasets. |
| `AM.SC.U4CSE23348` | **Sai Pranay** | CSE D | Project integration lead; conducted cross-artifact audit; consolidated canonical datasets in `data/`; authored runtime verification reports; drafted and compiled the master academic LaTeX report `B2_Report.tex` and camera-ready PDF. |

---

## 11. Academic Report and Artifact Links

- **Final Academic Report (PDF):** [`B2_Report.pdf`](B2_Report.pdf) (12 pages, compiled camera-ready)
- **Academic Report Source (LaTeX):** [`B2_Report.tex`](B2_Report.tex)
- **Presentation Deck (PDF):** [`B2_slide.pdf`](B2_slide.pdf)
- **Presentation Deck (PowerPoint):** [`B2_slide.pptx`](B2_slide.pptx)
- **Canonical Datasets:**
  - Pattern Inventory: [`data/patterns.csv`](data/patterns.csv)
  - Pattern Counts Matrix: [`data/pattern_counts.csv`](data/pattern_counts.csv)
  - Multi-Language Empirical Metrics: [`data/cross_language.csv`](data/cross_language.csv)
  - LLM Prompts & Auditing Records: [`data/llm.csv`](data/llm.csv)
- **Architecture & UML Diagrams:**
  - Baseline Architecture: `Part1/pattern_architecture/architecture.png`
  - CH01 Adapter UML: `Part2/Diagrams/CH01_Adapter_UML.png`
  - CH02 Strategy UML: `Part2/Diagrams/CH02_Strategy_UML.png`
  - CH03 Observer UML: `Part2/Diagrams/CH03_Observer_UML.png`
