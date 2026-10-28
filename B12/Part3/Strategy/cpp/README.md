# Strategy — C++

Compile and run (from this directory):

```
g++ -O2 -static strategy_test.cpp -o strategy_test.exe
strategy_test.exe
```

Expected output: `STRATEGY_CPP PASS 5/5`.

- Production snippet: `slot_allocation_strategy.hpp` (70 LOC), header-only.
- Test file: `strategy_test.cpp` (kept separate from the snippet).
- Compiler/runtime: g++ (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0. `-static`
  removes any runtime-DLL dependency so the binary runs standalone.
- max_function_cc: 8 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (18.977 ms) is whole-process wall time of the native
  binary.
- Raw evidence: `../evidence/Strategy_cpp.txt`.
