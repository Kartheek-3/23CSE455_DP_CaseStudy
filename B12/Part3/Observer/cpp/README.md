# Observer — C++

Compile and run (from this directory):

```
g++ -O2 -static observer_test.cpp -o observer_test.exe
observer_test.exe
```

Expected output: `OBSERVER_CPP PASS 8/8`.

- Production snippet: `occupancy_observer.hpp` (44 LOC), header-only.
- Test file: `observer_test.cpp` (kept separate from the snippet).
- Compiler/runtime: g++ (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0. `-static`
  removes any runtime-DLL dependency so the binary runs standalone.
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (15.937 ms) is whole-process wall time of the native
  binary.
- Raw evidence: `../evidence/Observer_cpp.txt`.
