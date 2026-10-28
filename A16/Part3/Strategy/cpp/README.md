# C++ Strategy example

From this folder with GCC supporting C++17:

```powershell
g++ -std=c++17 -O2 strategy_example.cpp -o strategy_example.exe
g++ -std=c++17 -O2 strategy_test.cpp -o strategy_test.exe
./strategy_example.exe
./strategy_test.exe
```

The test translation unit includes the production implementation with its demo entry point renamed. Generated executables are temporary and are not committed.
