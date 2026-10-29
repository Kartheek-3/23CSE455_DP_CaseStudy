# JavaScript Adapter example

From this folder with Node.js 18 or later:

```powershell
node adapter_example.js
node adapter.test.js
```

The wrapper translates the target `charge` call into the legacy gateway's `authorize` call and converts its return value into the target receipt shape. Node's built-in assertions are used; no package installation is needed.
