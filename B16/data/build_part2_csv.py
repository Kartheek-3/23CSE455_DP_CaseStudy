"""Builds Part2/pattern_evolution.csv and data/pattern_counts.csv (counts for every version).

One row per confirmed instance per source version (original + after each change, in the order the
changes were applied). Participants come from Part1/evidence/part1_records.py plus the changes below;
every line range is found in the JUnit fork at that version's commit (git show), never typed by hand.
Run from B16/:  python3 data/build_part2_csv.py
"""
import csv
import re
import subprocess
import sys

sys.dont_write_bytecode = True  # no __pycache__ in the submission folder
from pathlib import Path

B16 = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(B16 / "Part1" / "evidence"))
sys.path.insert(0, str(B16 / "data"))
from build_part1_csv import block_end  # noqa: E402
from part1_records import INSTANCES, JA, JE, PL, p  # noqa: E402

FORK = Path.home() / "Desktop/dp-work/junit-framework"
ABSENT = "ABSENT"  # role exists in the design but has no class in production code
# paths relative to the team folder where a full copy of that version exists; other versions: path @commit
PREFIX = {"f59f60d": "data/code/", "99987b0": "Part2/code/"}

VERSIONS = [  # (label exactly as the assignment names versions, commit, change id); applied in this order
    ("Original code", "f59f60d", None),
    ("Code after Change3", "6f98fbf", "CH03"),
    ("Code after Change1", "e55fefe", "CH01"),  # includes Change3
    ("Code after Change2", "99987b0", "CH02"),  # includes Change3 and Change1
]

# change id -> instance id -> (status, added participants, change_description)
CHANGES = {
    "CH03": {
        "A2": ("extended", [p("Leaf", "org.junit.platform.launcher.core.FilterPolicy", PL + "core/FilterPolicy.java")],
               "Added Leaf FilterPolicy (configurable post-discovery filter). It is combined with the other filters by "
               "the unchanged CompositeFilter (AND), so it can only narrow the result."),
        "A3": ("extended", [p("ConcreteStrategy", "org.junit.platform.launcher.core.FilterPolicy", PL + "core/FilterPolicy.java"),
                            p("Context (assembles strategies)",
                              "org.junit.platform.launcher.core.EngineDiscoveryOrchestrator#collectPostDiscoveryFilters",
                              PL + "core/EngineDiscoveryOrchestrator.java")],
               "Added ConcreteStrategy FilterPolicy (mode off/exclude/only over tag expressions and method patterns, "
               "read from configuration). New context method collectPostDiscoveryFilters (CH03a Extract Method) adds it "
               "after the ServiceLoader and request filters."),
    },
    "CH01": {
        "C1": ("extended", [p("ConcreteObserver", "org.junit.platform.launcher.listeners.ClassSummaryListener",
                              PL + "listeners/ClassSummaryListener.java")],
               "Added ConcreteObserver ClassSummaryListener (per-class summary + slowest tests, ServiceLoader-registered, "
               "disabled by default). ConcreteObserver SummaryGeneratingListener refactored internally (CH01a Extract "
               "Method count()); its role is unchanged."),
    },
    "CH02": {
        "D3": ("extended", [p("ConcreteStrategy", "org.junit.jupiter.api.extension.support.ManagedResourceExtension",
                              JA + "extension/support/ManagedResourceExtension.java")],
               "Added ConcreteStrategy ManagedResourceExtension, which resolves @ManagedResource parameters. The context "
               "(ParameterResolutionUtils) is unchanged."),
    },
}

NEW_INSTANCES = {
    "CH02": [
        dict(id="N1", name="Managed Resource Factory", pattern="Strategy", type="Behavioral", concrete=0,
             intent="How a @ManagedResource is created and destroyed is a ResourceFactory<T> chosen per parameter by "
                    "@ManagedResource(Factory.class); ManagedResourceExtension instantiates it and calls create(context), "
                    "Holder later calls destroy(resource) (default: close AutoCloseable). ConcreteStrategy role is absent "
                    "from production code: factories are supplied by users (e.g. HttpServerFactory in Part2/code/demo, "
                    "CountingFactory in ManagedResourceTests).",
             parts=[p("Strategy", "org.junit.jupiter.api.extension.support.ResourceFactory",
                      JA + "extension/support/ResourceFactory.java"),
                    p("ConcreteStrategy", "user-supplied (none in production code)", ABSENT),
                    p("Context", "org.junit.jupiter.api.extension.support.ManagedResourceExtension#resolveParameter",
                      JA + "extension/support/ManagedResourceExtension.java"),
                    p("Context (destroy)", "org.junit.jupiter.api.extension.support.ManagedResourceExtension.Holder",
                      JA + "extension/support/ManagedResourceExtension.java", "Holder")]),
        dict(id="N2", name="Managed Resource Holder", pattern="Adapter", type="Structural", concrete=1,
             intent="The store's close action only knows AutoCloseable.close() / Store.CloseableResource.close(); "
                    "ResourceFactory offers destroy(T resource). Holder binds the resource to its factory and exposes "
                    "close() that calls factory.destroy(resource), so any factory's cleanup runs through JUnit's existing "
                    "close mechanism (both close paths, so it also works with auto-close disabled).",
             parts=[p("Target", "java.lang.AutoCloseable", None),
                    p("Target", "org.junit.jupiter.api.extension.ExtensionContext.Store.CloseableResource",
                      JA + "extension/ExtensionContext.java", "CloseableResource"),
                    p("Adapter", "org.junit.jupiter.api.extension.support.ManagedResourceExtension.Holder",
                      JA + "extension/support/ManagedResourceExtension.java", "Holder"),
                    p("Adaptee", "org.junit.jupiter.api.extension.support.ResourceFactory#destroy",
                      JA + "extension/support/ResourceFactory.java"),
                    p("Client", "org.junit.jupiter.engine.descriptor.AbstractExtensionContext#createCloseAction",
                      JE + "descriptor/AbstractExtensionContext.java")]),
    ],
}

_cache = {}


def lines_at(commit, path):
    key = (commit, path)
    if key not in _cache:
        out = subprocess.run(["git", "-C", str(FORK), "show", f"{commit}:{path}"], capture_output=True, text=True,
                             check=True).stdout
        _cache[key] = out.splitlines()
    return _cache[key]


def locate(commit, symbol, path, token):
    import re
    lines = lines_at(commit, path)
    token = token or symbol.split("#")[-1].split(".")[-1]
    if "#" in symbol:
        pat = re.compile(r"(\w|>|\])\s+" + re.escape(token) + r"\s*\(")
        cands = [i for i, l in enumerate(lines) if pat.search(l) and not l.strip().startswith(("*", "//", "return"))]
    else:
        pat = re.compile(r"\b(class|interface|enum|record|@interface)\s+" + re.escape(token) + r"\b")
        cands = [i for i, l in enumerate(lines) if pat.search(l)]
    if not cands:
        raise SystemExit(f"NOT FOUND at {commit}: {symbol} in {path}")
    return cands[0] + 1, block_end(lines, cands[0]) + 1


def row(version, commit, inst, parts, status, description, intent):
    roles, locs = [], []
    for role, symbol, path, token in parts:
        roles.append(f"{role}={symbol}")
        if path is None:
            locs.append(f"{symbol} (JDK)")
        elif path == ABSENT:
            locs.append(f"{role}: absent in production code")
        else:
            start, end = locate(commit, symbol, path, token)
            locs.append(f"{PREFIX.get(commit, '')}{path}:{start}-{end}" + ("" if commit in PREFIX else f" @{commit}"))
    return dict(source_version=version, pattern_name=inst["pattern"], pattern_type=inst["type"],
                instance_name=f'{inst["id"]} {inst["name"]}', participant_roles="; ".join(roles),
                source_locations="; ".join(locs), intent_and_evidence=intent, status_after_change=status,
                change_description=description)


def main():
    current = [dict(i, parts=list(i["parts"])) for i in INSTANCES]
    rows, counts, previous_locs = [], [], {}
    for version, commit, change in VERSIONS:
        for inst in NEW_INSTANCES.get(change, []):
            current.append(dict(inst, new_in=change))
        for inst in current:
            status, description = "baseline", "Instance as found in the original code (Part 1)."
            if change:
                status, description = "preserved", f"Not affected by {change}; participants unchanged."
                if inst.get("new_in") == change:
                    status, description = "newly_introduced", f"Introduced by {change}."
                elif inst["id"] in CHANGES.get(change, {}):
                    status, added, description = CHANGES[change][inst["id"]]
                    inst["parts"] = inst["parts"] + added
            r = row(version, commit, inst, inst["parts"], status, description, inst["intent"])
            norm = re.sub(r"^(data/code/|Part2/code/)| @\w+|(?<=; )(data/code/|Part2/code/)", "", r["source_locations"])
            old = previous_locs.get(inst["id"])
            if status == "preserved" and old and old != norm:
                r["change_description"] += " Line ranges updated because surrounding code in a participant file changed."
            previous_locs[inst["id"]] = norm
            rows.append(r)
        per = {}
        for inst in current:
            per[inst["pattern"]] = per.get(inst["pattern"], 0) + 1
        for name in sorted(per):
            counts.append([version, "per_pattern", name, per[name]])
        counts.append([version, "total_pattern_types", "", len(per)])
        counts.append([version, "total_pattern_instances", "", len(current)])
        statuses = sorted({r["status_after_change"] for r in rows if r["source_version"] == version})
        print(f"{version}: {len(current)} instances, {len(per)} types, statuses {statuses}")

    with (B16 / "Part2" / "pattern_evolution.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    with (B16 / "data" / "pattern_counts.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["source_version", "summary", "pattern_name", "count"])
        w.writerows(counts)
    print(f"{len(rows)} rows -> Part2/pattern_evolution.csv; {len(counts)} rows -> data/pattern_counts.csv")


if __name__ == "__main__":
    main()
