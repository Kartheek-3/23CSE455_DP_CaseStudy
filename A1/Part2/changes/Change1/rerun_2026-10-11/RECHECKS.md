# Independent re-checks during report consolidation, 2026-10-11T15:49:33Z

1. git apply --check CH01.diff against a fresh copy of data/code/baseline_83998629: exit 0 (all four files).
2. git apply CH01.diff, then byte comparison with data/code/evolved_CH01:
   identical canteenapp/delivery_assignment.py
   identical canteenapp/views.py
   identical canteenapp/templates/adminassignorder.html
   identical canteenapp/test_delivery_assignment.py
3. node verification/test_assignment_ui.cjs (original package layout, Node v22.22.0): 9 passed, exit 0 (ui-tests-rerun.log).
4. NOT re-run: the 39 Django tests, manage.py check, makemigrations --check and pip check. The validation virtual environment is not in the package and rebuilding it needs the PhonePe vendor index; the results quoted in the report come from ../evidence/*.log.
