# Design Patterns Case Study – Gym Management System

**Course:** 23CSE455 – Design Patterns  
**Project:** Gym Management System  
**Team:** B8

---

## 1. Project Overview

This case study analyses the design and implementation of a Gym Management System. The application supports role-based gym operations for administrators, trainers, and members.

The system uses an Angular frontend, a FastAPI backend, and an SQLite database. The case study studies the application's architecture and design-pattern collaborations, examines how selected features and implementations evolve, and compares representative pattern implementations across programming languages.

## 2. Team Members

| S. No. | Name | Roll Number |
|---:|---|---|
| 1 | K. Madhuri | AM.SC.U4AIE23117 |
| 2 | M. Sri Lakshmi Snigdha | AM.SC.U4AIE23127 |
| 3 | N. Meghana Prasad | AM.SC.U4AIE23137 |
| 4 | W. Venkat Ashrith | AM.SC.U4AIE23162 |

## 3. Case Study Parts

### Part 1 – Original Application and Pattern Discovery

This part documents the original application before the requested feature changes.

It covers:
- Original source repository and baseline version/commit.
- Application environment and technology stack.
- Scope of source-code inspection.
- Application architecture and request/event flow.
- Design-pattern identification supported by source-code evidence.
- Pattern instances, participant roles, source locations, and pattern counts.
- Part 1 report and supporting data.

### Part 2 – Pattern Evolution Through Feature Changes

This part records the effect of feature enhancements on the application's design and pattern collaborations.

The three feature areas studied are:
1. Personalized Workout Plans.
2. Trainer-Assignment Policies.
3. Attendance Notifications.

It covers:
- The requirement and implementation for each change.
- Before-and-after source-code evidence.
- Design-pattern collaborations introduced, modified, retained, or removed.
- Pattern evolution records and counts.
- Regression/test evidence and review findings.

### Part 3 – Cross-Language Pattern Implementation

This part implements selected representative pattern instances in multiple languages and compares their structure and behaviour.

The cross-language work covers:
- Strategy – Trainer Assignment Policy.
- Observer – Notification State Observer.
- Java, Python, C++, and JavaScript implementations.
- Code snippets, test runners, and README instructions for each implementation.
- Cross-language comparison records and test/measurement evidence.

The language implementations are educational, standalone demonstrations of the selected pattern behaviour. They should not be described as direct integrations with the Angular/FastAPI production application unless such integration has separately been implemented and verified.

## 4. Technology Stack

| Layer / Purpose | Technology |
|---|---|
| Frontend | Angular |
| Backend | Python, FastAPI |
| Database | SQLite |
| Frontend language | TypeScript / JavaScript |
| Pattern implementation languages | Java, Python, C++, JavaScript |
| Version control | Git / GitHub |

Use the dependency files and runtime output in the submitted source repository for exact version numbers. Do not infer or substitute version numbers.

## 5. Suggested Repository Structure

The following is the intended high-level organization. Keep the actual submitted folder and file names consistent with the contents of the repository.

```text
23CSE455_DP_CaseStudy/
|
|-- README.md                         # Overall case-study guide
|
|-- A1/                               # Part 1: original application analysis
|   |-- README.md
|   |-- A1_Report.pdf
|   |-- A1_Report.tex
|   |-- data/
|       |-- code/                     # Original application source
|       |-- prompts/                  # Saved LLM prompts, if maintained here
|       |-- results/                  # Saved LLM outputs, if maintained here
|       |-- patterns.csv
|       |-- Pattern_count.csv
|       |-- llm.csv
|
|-- Part2/                            # Part 2: feature changes and evolution
|   |-- README.md
|   |-- changes/
|   |   |-- Change1/                  # Personalized workout plans
|   |   |-- Change2/                  # Trainer-assignment policies
|   |   |-- Change3/                  # Attendance notifications
|   |-- pattern_evolution.csv
|   |-- Pattern_count.csv
|   |-- llm.csv
|
|-- Part3/                            # Part 3: cross-language implementations
|   |-- README.md
|   |-- strategy_trainerassignment_snigdha/
|   |-- observer_notificationstate_snigdha/
|   |-- strategy_workout_madhuri/
|   |-- singleton_plansservice_madhuri/
|   |-- dependencyinjection_angularconstructor_meghana/
|   |-- observer_attendance_meghana/
|   |-- dependencyinjection_fastapidb_ashrith/
|   |-- singleton_authservice_ashrith/
|   |-- llm/
|       |-- pattern_crosslanguage.csv
|       |-- llm.csv
|
```

**Note:** The tree is a documentation guide, not a claim that every listed file or folder is present in every submitted copy. If your final B8 directory uses different names or locations, update this tree to match the actual files. Do not create empty folders solely to make the tree appear complete.

## 6. LLM Usage and Verification Records

Each part maintains its own `llm.csv` to document the use of language models during the case study.

The records include:
- Part and team-member details.
- Model name and interaction date.
- Exact prompt-file path.
- Input/context-file path.
- Output-file path.
- Evaluation of the generated response.
- Verification evidence.
- Shareable LLM conversation link, where available.

The LLM records are evidence of assistance and verification. Generated suggestions are not automatically treated as correct: pattern claims, source locations, implementation behaviour, and test results must be checked against the project files.

## 7. Running the Application

Run the backend and frontend in separate terminals.

### Backend

From the project repository, navigate to the backend directory:

```powershell
cd backend
```

Activate the existing virtual environment. Use the command matching the environment folder in the repository:

```powershell
.\venv\Scripts\Activate.ps1
```

or:

```powershell
.\.venv\Scripts\Activate.ps1
```

Start the FastAPI server:

```powershell
python -m uvicorn app.main:app --reload
```

### Frontend

Open another terminal and navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies only if required by the current checkout:

```powershell
npm install
```

Start Angular using the project script or Angular CLI:

```powershell
ng serve
```

Open the application at:

- Frontend: `http://localhost:4200/login`
- FastAPI documentation: `http://localhost:8000/docs`

Use the actual scripts and setup instructions in the backend and frontend README/package files if they differ from these commands. Do not commit passwords, tokens, or other secrets to the repository.

## 8. Verification and Submission Checklist

Before submission, verify the following:

- [ ] The original repository URL, baseline commit, access date, and license are documented accurately.
- [ ] Environment and dependency versions are taken from the actual project.
- [ ] Architecture diagram matches the inspected application.
- [ ] Every reported design-pattern instance has source-code evidence.
- [ ] Pattern names, categories, participant roles, and source locations are consistent across reports and CSV files.
- [ ] Each Part 2 change has implementation evidence and actual test results.
- [ ] Pattern evolution claims are supported by before-and-after evidence.
- [ ] Each Part 3 language implementation includes production snippet, test runner, and README.
- [ ] Cross-language CSV values are measured or verified; missing measurements are left blank rather than estimated.
- [ ] Each part's `llm.csv` maps actual prompts to their corresponding saved outputs.
- [ ] LLM conversation links are genuine shareable links.
- [ ] All report PDFs open correctly and match their source documents.
- [ ] No virtual environments, caches, generated build folders, credentials, or unrelated personal files are included.

## 9. Evidence and Academic Integrity

This repository is intended to preserve traceability from requirements and prompts to source changes, pattern analysis, test results, and final reports.

Only claim that a feature, pattern, test, runtime measurement, or verification was completed when the corresponding evidence is present. Clearly label assumptions, incomplete checks, and items that could not be confirmed.

---

**Team B8 – 23CSE455 Design Patterns Case Study**
