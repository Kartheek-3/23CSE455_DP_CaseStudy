# C++ Adapter example

From this folder with GCC supporting C++17:

```powershell
g++ -std=c++17 -O2 adapter_example.cpp -o adapter_example.exe
g++ -std=c++17 -O2 adapter_test.cpp -o adapter_test.exe
./adapter_example.exe
./adapter_test.exe
```

The adapter implements the target interface and composes a reference to the legacy gateway. Executables are temporary and are not committed.
