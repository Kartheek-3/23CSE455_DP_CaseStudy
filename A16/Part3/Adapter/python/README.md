# Python Adapter example

From this folder with Python 3.10 or later:

```powershell
python adapter_example.py
python -m unittest -v test_adapter.py
```

The adapter translates cents into the legacy gateway's decimal dollar argument and normalizes its reference into a receipt. Only the standard library is used.
