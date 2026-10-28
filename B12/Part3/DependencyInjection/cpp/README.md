# Dependency Injection — C++

Compile and run (from this directory):

```
g++ -O2 -static dependency_injection_test.cpp -o dependency_injection_test.exe
dependency_injection_test.exe
```

Expected output: `DEPENDENCY_INJECTION_CPP PASS 6/6`.

- Production snippet: `notification_service.hpp` (34 LOC), header-only.
- Test file: `dependency_injection_test.cpp` (kept separate from the snippet).
- Compiler/runtime: g++ (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0. `-static`
  removes any runtime-DLL dependency so the binary runs standalone.
- max_function_cc: 1 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (17.053 ms) is whole-process wall time of the native
  binary.
- Raw evidence: `../evidence/DependencyInjection_cpp.txt`.
