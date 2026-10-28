# Python Strategy example

From this folder with Python 3.10 or later:

```powershell
python strategy_example.py
python -m unittest -v test_strategy.py
```

The policy objects are injected into `PriceCalculator`; Python relies on duck typing rather than a declared interface. The standard library is sufficient.
