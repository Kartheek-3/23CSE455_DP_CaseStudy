# Application source versions

| Folder | Version |
|---|---|
| `baseline_83998629/` | Commit `83998629e633594037cfa25e583542f9f6f0f968` of HarshavardhanVemali/campus-food-ordering, extracted from the hash-verified archive (`../provenance/provenance.json`). |
| `evolved_CH01/` | The application after CH01: baseline + `../../Part2/changes/Change1/CH01.diff`. |

Run `python3 data/code/verify_baseline.py` from the team folder to check the baseline copy against the 170 upstream hashes. Expected result: 167 identical, 2 redacted, 1 omitted.

- **Redacted (2 files, one line each):** `canteen/settings.py:147` contained a database URL with a user name and password, and `static/js/firebase.js:10` a Firebase API key. Both values are replaced with `REDACTED_*` placeholders. Before and after hashes are in `../provenance/REDACTIONS.md`. The same two lines are redacted in `evolved_CH01/`.
- **Omitted (1 file):** `static/images/vecteezy_back-to-school-with-illustration-of-child-holding-book_25872389 (1) (1).mp4`, a 15 MB third-party stock video used only as a background on `deliveryapphome.html`. It is not source code, and it would push the submission ZIP over the 30 MB transfer limit. Its upstream hash is in `../provenance/baseline-files.sha256.json`; it can be restored from the commit archive.
- **`evolved_CH01/` without media:** it omits `static/images/` and `samples/`, which CH01 did not touch. Restore them from the baseline copy before running the evolved application:

  ```bash
  cp -r data/code/baseline_83998629/static/images data/code/evolved_CH01/static/
  cp -r data/code/baseline_83998629/samples data/code/evolved_CH01/
  ```

No database, virtual environment, credentials file or compiled file is included.
