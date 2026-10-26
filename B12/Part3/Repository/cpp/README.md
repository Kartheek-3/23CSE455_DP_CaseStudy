# Repository — C++

Compile and run (from this directory):

```
g++ -O2 -static repository_test.cpp -o repository_test.exe
repository_test.exe
```

Expected output: `REPOSITORY_CPP PASS 8/8`.

- Production snippet: `user_repository.hpp` (46 LOC), header-only.
- Test file: `repository_test.cpp` (kept separate from the snippet).
- Compiler/runtime: g++ (MinGW-W64 x86_64-ucrt-posix-seh) 16.2.0. `-static`
  removes any runtime-DLL dependency so the binary runs standalone.
- max_function_cc: 2 (counted with the rule in `../evidence/README.md`).
- Timing rule: compile first, then one warm-up run discarded and five measured
  runs; the reported median (16.189 ms) is whole-process wall time of the native
  binary.
- Raw evidence: `../evidence/Repository_cpp.txt`.
