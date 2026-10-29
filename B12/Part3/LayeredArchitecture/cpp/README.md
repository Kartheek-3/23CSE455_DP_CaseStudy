# Layered Architecture — C++

Compile and run (from this directory):

```
g++ -O2 -static layered_architecture_test.cpp -o layered_architecture_test.exe
layered_architecture_test.exe
```

Expected output: `LAYERED_ARCHITECTURE_CPP PASS 8/8`.

- Production snippet: `layered_architecture.hpp` (48 LOC), header-only.
- Test file: `layered_architecture_test.cpp` (kept separate from the snippet).
- Compiler/runtime: g++ (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0. `-static`
  removes any runtime-DLL dependency so the binary runs standalone.
- max_function_cc: 3 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (15.814 ms) is whole-process wall time of the native
  binary.
- Raw evidence: `../evidence/LayeredArchitecture_cpp.txt`.
