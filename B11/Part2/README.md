# Part 2 — Evolution and refactoring

Three changes. The Java under each Change*/src/ is written to drop into the
legalSystem app's com.dcm package. Strategy and Observer logic was compiled and
asserted standalone (see each test_result.txt); CH03 is a diff against the real
baseline file.

| Change | Pattern effect | Files |
|--------|----------------|-------|
| CH01 | newly_introduced: Overdue Fine Strategy | changes/Change1/src/.../strategy/*.java |
| CH02 | modified: Hearing Notification -> true Observer | changes/Change2/src/.../observer/*.java |
| CH03 | modified: Password Strategy concrete class (refactor) | changes/Change3/change3.diff + before/after |

All three changes were applied to the baseline clone, committed, and unit-tested (`./mvnw test` -> 7 tests, 0 failures); the full app boots against MySQL. Real logs: `../test_result/mvn_test.log`, `../test_result/app_startup.log`.
