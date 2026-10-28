# Part 2 — Code

`evolved/smart-parking-backend/src/` holds the **changed and new** source files that
turn the baseline NestJS app into the evolved app. It is an overlay onto the original
app; unchanged baseline files are not duplicated here.

Apply the overlay onto a copy of the baseline backend, then run the tests:

```powershell
# from a copy of the baseline backend that has node_modules installed
Copy-Item -Recurse "<overlay>\charging"  src\
Copy-Item -Recurse "<overlay>\occupancy" src\
Copy-Item -Recurse "<overlay>\slots\allocation" src\slots\
Copy-Item "<overlay>\slots\slot.entity.ts","<overlay>\slots\slots.service.ts","<overlay>\slots\slots.module.ts","<overlay>\slots\slots.controller.ts" src\slots\ -Force
Copy-Item "<overlay>\app.module.ts" src\ -Force
npx jest --runInBand
```

Baseline files edited: `slots/slot.entity.ts`, `slots/slots.service.ts`,
`slots/slots.module.ts`, `slots/slots.controller.ts`, `app.module.ts`. Everything
else is new.

The three per-change diffs are in `../changes/ChangeN/diff/`.
