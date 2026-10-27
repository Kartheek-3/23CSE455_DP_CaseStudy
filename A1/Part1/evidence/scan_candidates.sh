#!/usr/bin/env bash
# Reproducible candidate scan over the baseline snapshot (commit 83998629).
# Run from the team folder:  bash Part1/evidence/scan_candidates.sh > Part1/evidence/candidate_scan.txt
set -u
B=data/code/baseline_83998629
echo "# Candidate scan of $B (generated $(date -u +%Y-%m-%dT%H:%M:%SZ))"
echo; echo "## 1. Django signal receivers and registration"
grep -rn "@receiver\|\.connect(\|import canteenapp.signals\|def ready" $B/canteenapp $B/canteen
echo; echo "## 2. Channels subscriptions (group_add) by consumer"
grep -n "^class \|group_add" $B/canteenapp/consumers.py | grep -B1 group_add
echo; echo "## 3. Routed WebSocket consumers"
grep -n "as_asgi" $B/canteenapp/routing.py
echo; echo "## 4. Triple-quoted (disabled) regions in consumers.py"
grep -n '"""' $B/canteenapp/consumers.py
echo; echo "## 5. Channels publications (group_send) per enclosing view function"
python3 - "$B/canteenapp/views.py" <<'PY'
import re, sys
src = open(sys.argv[1], encoding="utf-8").read().split("\n")
cur = None; res = {}
for i, l in enumerate(src, 1):
    m = re.match(r"(async )?def (\w+)", l)
    if m: cur = f"{m.group(2)} (def at line {i})"
    if "group_send" in l:
        g = None
        for j in range(i - 1, min(i + 4, len(src))):
            mm = re.search(r"['\"]([a-z_]+_group)['\"]|f['\"](delivery_person_\{[^'\"]*)['\"]", src[j])
            if mm: g = mm.group(1) or mm.group(2); break
        res.setdefault(cur, []).append((i, g))
for k, v in res.items():
    print(f"{k}: {len(v)} call(s); groups={sorted(set(x[1] for x in v))}; lines={[x[0] for x in v]}")
print("TOTAL group_send calls:", sum(len(v) for v in res.values()))
PY
echo; echo "## 6. Abstract classes / interchangeable-policy declarations"
grep -rn "ABC\|abstractmethod\|Strategy\|Policy" $B/canteenapp --include=*.py || echo "(none found)"
echo; echo "## 7. Named GoF participants (Factory, Adapter, Facade, Command, Repository, Singleton, State, Visitor, Builder)"
grep -rnE "class \w*(Factory|Adapter|Facade|Command|Repository|Singleton|State|Visitor|Builder)\b" $B/canteenapp --include=*.py || echo "(none found)"
echo; echo "## 8. Status-driven workflow (State candidate)"
grep -n "def get_status_index\|STATUS_CHOICES = \|def get_status_display\|def add_additional_charges" $B/canteenapp/views.py $B/canteenapp/models.py
echo; echo "## 9. Module-level payment client (Singleton candidate)"
grep -n "^phonepe_client\|PhonePePaymentClient(" $B/canteenapp/views.py
echo; echo "## 10. Social-auth pipeline (pipeline/chain candidate)"
grep -n -A10 "SOCIAL_AUTH_PIPELINE" $B/canteen/settings.py
echo; echo "## 11. Access-control decorators (Decorator candidate)"
grep -n -A4 "^def admin_required\|^def user_required" $B/canteenapp/views.py
echo; echo "## 12. Baseline delivery assignment (Strategy candidate)"
sed -n '1788,1821p' $B/canteenapp/views.py
