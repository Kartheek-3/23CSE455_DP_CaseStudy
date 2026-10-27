# Java Adapter example

From this folder with JDK 17 on `PATH`:

```powershell
javac AdapterExample.java AdapterTest.java
java AdapterExample
java AdapterTest
```

`LegacyGatewayAdapter` implements the target interface and composes the incompatible legacy gateway. Delete generated `.class` files after local runs.
