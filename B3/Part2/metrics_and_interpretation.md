\# Part 2 — Metrics and Interpretation



\## 1. Test Verification



The combined test suite passed \*\*28 tests with 0 failures\*\*. The tests cover the Observer pattern, GraphQL recruiter permissions, and State pattern transitions.



Evidence: `Part2/CH01\_CH02\_CH03\_combined\_test\_result.txt`



\## 2. Lines of Code (LOC)



The current implementation contains the following nonblank, non-comment lines across five production files.



| File | LOC |

|---|---:|

| `jobsapp/observers.py` | 43 |

| `jobsapp/application\_states.py` | 58 |

| `jobsapp/graphql/permissions.py` | 36 |

| `jobsapp/graphql/queries.py` | 26 |

| `jobsapp/api/views/employer.py` | 113 |

| \*\*Total\*\* | \*\*276\*\* |



\*\*Limitation:\*\* These are current-state measurements only. A valid before-and-after comparison requires measuring the same files and counting method in the baseline version.



\## 3. Pattern Evolution



The changes introduced or extended the following design patterns:



\- \*\*Observer:\*\* Job-creation notifications are separated from the main job-creation flow.

\- \*\*State:\*\* Applicant status transitions are represented using explicit states and permitted-transition rules.

\- \*\*Authorization:\*\* Recruiter-specific GraphQL permissions were added. This is a \*partial Strategy candidate\*, not a confirmed full Strategy implementation, because the policy is not yet demonstrated as interchangeable strategies.

\- \*\*Factory Method-like hook:\*\* The existing serializer-selection method is framework-style selection; it should not automatically be counted as a classic GoF Factory Method.



Pattern counts must distinguish confirmed implementations from partial candidates to avoid overstating the results.



\## 4. Benefits and Trade-offs



\### Observer



\*\*Benefit:\*\* Notification handling is separated from job creation, making additional observers easier to add.



\*\*Trade-off:\*\* The notification flow introduces additional components and requires tests for observer failures.



\### State



\*\*Benefit:\*\* Valid and invalid applicant status transitions can be handled explicitly, improving consistency and maintainability.



\*\*Trade-off:\*\* Additional state classes and transition rules increase the amount of code to maintain.



\### Recruiter authorization



\*\*Benefit:\*\* Permission checks are more explicit and can be tested independently.



\*\*Trade-off:\*\* The current implementation does not yet demonstrate fully interchangeable authorization strategies.



\## 5. Limitations and Next Steps



1\. Measure baseline LOC using the same counting method and comparable files.

2\. Record before-and-after metrics only after both versions have been measured.

3\. Verify the pattern counts against the source code and distinguish confirmed patterns from candidates.

4\. Preserve the individual change patches and test logs as evidence.

5\. Report test results as evidence of tested behavior, not proof that every possible case is covered.



\## 6. Before-and-After LOC Comparison



LOC was measured by counting nonblank, non-comment lines in the same five production file paths in the baseline and final versions.



| File | Baseline LOC | Final LOC | Change |

|---|---:|---:|---:|

| `jobsapp/observers.py` | 0 | 43 | +43 |

| `jobsapp/application\_states.py` | 0 | 58 | +58 |

| `jobsapp/graphql/permissions.py` | 28 | 36 | +8 |

| `jobsapp/graphql/queries.py` | 16 | 26 | +10 |

| `jobsapp/api/views/employer.py` | 91 | 113 | +22 |

| \*\*Total\*\* | \*\*135\*\* | \*\*276\*\* | \*\*+141\*\* |



The measured LOC increased by 141 lines, from 135 to 276, a 104.44% increase within this selected file scope. The increase includes two newly introduced modules for Observer and State behavior, along with changes to existing GraphQL and employer-view files.



This increase reflects additional implementation code; it does not, by itself, demonstrate improved or reduced maintainability. The measurements cover only the five listed files, not the entire project. Newly introduced files were counted as zero LOC in the baseline because they were absent there.



\*\*Measurement method:\*\* PowerShell script counting nonblank lines that do not begin with `#`. This is a simple LOC metric and does not measure complexity, quality, or maintainability directly.



s

