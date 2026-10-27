# Data Transfer Object - API Payload DTO Assembly (Python)

Snippet of the confirmed instance **API Payload DTO Assembly** (Data Transfer Object) implemented in Python. Behaviour and test cases are identical in all four languages.

- Production code: `snippet.py` (measured for LOC / complexity)
- Test driver: `run_tests.py` (not measured); shared fixtures: `../test-cases/cases.txt` (5 cases)
- Runtime: CPython 3.13.16

## Run (working folder: `Part3/dto_user_assembly/python`)
```
python3 run_tests.py ../test-cases/cases.txt
```
Expected last line: `RESULT passed=5 total=5` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
| DataTransferObject | `UserDto` | declared in `snippet.py` |
| DomainObject | `User` | declared in `snippet.py` |
| Assembler | `UserAssembler` | declared in `snippet.py` |
