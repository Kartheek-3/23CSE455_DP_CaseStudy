# State — C++

Compile and run (from this directory):

```
g++ -O2 -static state_test.cpp -o state_test.exe
state_test.exe
```

Expected output: `STATE_CPP PASS 13/13`.

- Production snippet: `ev_charging_state.hpp` (97 LOC), header-only. State
  method bodies are defined out-of-line at the end of the header so that each
  state can construct the next state without incomplete-type errors.
- Test file: `state_test.cpp` (kept separate from the snippet).
- Compiler/runtime: g++ (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0, statically
  linked.
- max_function_cc: 2. The only branch is the manual memory-management guard in
  `ChargingSession::setState` (`if (state_ != state)`), which the garbage-
  collected languages do not need.
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (20.833 ms) is whole-process wall time.
- Raw evidence: `../evidence/State_cpp.txt`.
