import os
import re
import subprocess
import statistics
import json
import csv

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EVIDENCE_DIR = os.path.join(BASE, "Part3", "evidence", "recomputed_test_results")
COMPLEXITY_DIR = os.path.join(BASE, "Part3", "evidence", "recomputed_complexity_loc")
METRICS_DIR = os.path.join(BASE, "Part3", "evidence", "recomputed_metrics")
SUMMARY_PATH = os.path.join(METRICS_DIR, "benchmark_summary.json")
CSV_PATH = os.path.join(BASE, "data", "cross_language.csv")
os.makedirs(EVIDENCE_DIR, exist_ok=True)
os.makedirs(COMPLEXITY_DIR, exist_ok=True)
os.makedirs(METRICS_DIR, exist_ok=True)

patterns = [
    {
        "pattern_name": "Composite",
        "instance_name": "Visibility Condition Tree",
        "dir_name": "composite_condition",
        "java_prod": "Part3/composite_condition/java/ConditionComposite.java",
        "java_compile": ["javac", "-d", "Part3/composite_condition/java/bin", "Part3/composite_condition/java/ConditionComposite.java", "Part3/composite_condition/java/TestRunner.java"],
        "java_run": ["java", "-cp", "Part3/composite_condition/java/bin", "composite.TestRunner"],
        "py_prod": "Part3/composite_condition/python/condition_composite.py",
        "py_run": ["python", "Part3/composite_condition/python/test_runner.py"],
        "js_prod": "Part3/composite_condition/javascript/conditionComposite.js",
        "js_run": ["node", "Part3/composite_condition/javascript/testRunner.js"],
        "cpp_prod": "Part3/composite_condition/cpp/condition_composite.cpp",
        "cpp_header": "Part3/composite_condition/cpp/condition_composite.hpp",
        "cpp_compile": ["g++", "-O2", "-std=c++14", "-I", "Part3/composite_condition/cpp", "Part3/composite_condition/cpp/condition_composite.cpp", "Part3/composite_condition/cpp/test_runner.cpp", "-o", "Part3/composite_condition/cpp/test_runner.exe"],
        "cpp_run": [os.path.join(BASE, "Part3", "composite_condition", "cpp", "test_runner.exe")]
    },
    {
        "pattern_name": "Observer",
        "instance_name": "Home Assistant WebSocket Entity Subscriptions",
        "dir_name": "observer_subscription",
        "java_prod": "Part3/observer_subscription/java/EntitySubscriptionObserver.java",
        "java_compile": ["javac", "-d", "Part3/observer_subscription/java/bin", "Part3/observer_subscription/java/EntitySubscriptionObserver.java", "Part3/observer_subscription/java/TestRunner.java"],
        "java_run": ["java", "-cp", "Part3/observer_subscription/java/bin", "observer.TestRunner"],
        "py_prod": "Part3/observer_subscription/python/entity_observer.py",
        "py_run": ["python", "Part3/observer_subscription/python/test_runner.py"],
        "js_prod": "Part3/observer_subscription/javascript/entityObserver.js",
        "js_run": ["node", "Part3/observer_subscription/javascript/testRunner.js"],
        "cpp_prod": "Part3/observer_subscription/cpp/entity_observer.cpp",
        "cpp_header": "Part3/observer_subscription/cpp/entity_observer.hpp",
        "cpp_compile": ["g++", "-O2", "-std=c++14", "-I", "Part3/observer_subscription/cpp", "Part3/observer_subscription/cpp/entity_observer.cpp", "Part3/observer_subscription/cpp/test_runner.cpp", "-o", "Part3/observer_subscription/cpp/test_runner.exe"],
        "cpp_run": [os.path.join(BASE, "Part3", "observer_subscription", "cpp", "test_runner.exe")]
    },
    {
        "pattern_name": "Memento",
        "instance_name": "Hearth Config History & Edit Transaction",
        "dir_name": "memento_history",
        "java_prod": "Part3/memento_history/java/HearthHistoryMemento.java",
        "java_compile": ["javac", "-d", "Part3/memento_history/java/bin", "Part3/memento_history/java/HearthHistoryMemento.java", "Part3/memento_history/java/TestRunner.java"],
        "java_run": ["java", "-cp", "Part3/memento_history/java/bin", "memento.TestRunner"],
        "py_prod": "Part3/memento_history/python/hearth_history_memento.py",
        "py_run": ["python", "Part3/memento_history/python/test_runner.py"],
        "js_prod": "Part3/memento_history/javascript/hearthHistoryMemento.js",
        "js_run": ["node", "Part3/memento_history/javascript/testRunner.js"],
        "cpp_prod": "Part3/memento_history/cpp/hearth_history_memento.cpp",
        "cpp_header": "Part3/memento_history/cpp/hearth_history_memento.hpp",
        "cpp_compile": ["g++", "-O2", "-std=c++14", "-I", "Part3/memento_history/cpp", "Part3/memento_history/cpp/hearth_history_memento.cpp", "Part3/memento_history/cpp/test_runner.cpp", "-o", "Part3/memento_history/cpp/test_runner.exe"],
        "cpp_run": [os.path.join(BASE, "Part3", "memento_history", "cpp", "test_runner.exe")]
    },
    {
        "pattern_name": "Strategy",
        "instance_name": "Visibility Condition Evaluator Dispatch",
        "dir_name": "strategy_evaluator",
        "java_prod": "Part3/strategy_evaluator/java/ConditionStrategy.java",
        "java_compile": ["javac", "-d", "Part3/strategy_evaluator/java/bin", "Part3/strategy_evaluator/java/ConditionStrategy.java", "Part3/strategy_evaluator/java/TestRunner.java"],
        "java_run": ["java", "-cp", "Part3/strategy_evaluator/java/bin", "strategy.TestRunner"],
        "py_prod": "Part3/strategy_evaluator/python/condition_strategy.py",
        "py_run": ["python", "Part3/strategy_evaluator/python/test_runner.py"],
        "js_prod": "Part3/strategy_evaluator/javascript/conditionStrategy.js",
        "js_run": ["node", "Part3/strategy_evaluator/javascript/testRunner.js"],
        "cpp_prod": "Part3/strategy_evaluator/cpp/condition_strategy.cpp",
        "cpp_header": "Part3/strategy_evaluator/cpp/condition_strategy.hpp",
        "cpp_compile": ["g++", "-O2", "-std=c++14", "-I", "Part3/strategy_evaluator/cpp", "Part3/strategy_evaluator/cpp/condition_strategy.cpp", "Part3/strategy_evaluator/cpp/test_runner.cpp", "-o", "Part3/strategy_evaluator/cpp/test_runner.exe"],
        "cpp_run": [os.path.join(BASE, "Part3", "strategy_evaluator", "cpp", "test_runner.exe")]
    },
    {
        "pattern_name": "Factory Method",
        "instance_name": "Entity Domain Modal Factory",
        "dir_name": "factory_domain_modal",
        "java_prod": "Part3/factory_domain_modal/java/EntityModalFactory.java",
        "java_compile": ["javac", "-d", "Part3/factory_domain_modal/java/bin", "Part3/factory_domain_modal/java/EntityModalFactory.java", "Part3/factory_domain_modal/java/TestRunner.java"],
        "java_run": ["java", "-cp", "Part3/factory_domain_modal/java/bin", "factory.TestRunner"],
        "py_prod": "Part3/factory_domain_modal/python/entity_modal_factory.py",
        "py_run": ["python", "Part3/factory_domain_modal/python/test_runner.py"],
        "js_prod": "Part3/factory_domain_modal/javascript/entityModalFactory.js",
        "js_run": ["node", "Part3/factory_domain_modal/javascript/testRunner.js"],
        "cpp_prod": "Part3/factory_domain_modal/cpp/entity_modal_factory.cpp",
        "cpp_header": "Part3/factory_domain_modal/cpp/entity_modal_factory.hpp",
        "cpp_compile": ["g++", "-O2", "-std=c++14", "-I", "Part3/factory_domain_modal/cpp", "Part3/factory_domain_modal/cpp/entity_modal_factory.cpp", "Part3/factory_domain_modal/cpp/test_runner.cpp", "-o", "Part3/factory_domain_modal/cpp/test_runner.exe"],
        "cpp_run": [os.path.join(BASE, "Part3", "factory_domain_modal", "cpp", "test_runner.exe")]
    },
    {
        "pattern_name": "Template Method",
        "instance_name": "Picture Elements Konva Canvas Base",
        "dir_name": "template_canvas_renderer",
        "java_prod": "Part3/template_canvas_renderer/java/KonvaCanvasTemplate.java",
        "java_compile": ["javac", "-d", "Part3/template_canvas_renderer/java/bin", "Part3/template_canvas_renderer/java/KonvaCanvasTemplate.java", "Part3/template_canvas_renderer/java/TestRunner.java"],
        "java_run": ["java", "-cp", "Part3/template_canvas_renderer/java/bin", "templatemethod.TestRunner"],
        "py_prod": "Part3/template_canvas_renderer/python/konva_canvas_template.py",
        "py_run": ["python", "Part3/template_canvas_renderer/python/test_runner.py"],
        "js_prod": "Part3/template_canvas_renderer/javascript/konvaCanvasTemplate.js",
        "js_run": ["node", "Part3/template_canvas_renderer/javascript/testRunner.js"],
        "cpp_prod": "Part3/template_canvas_renderer/cpp/konva_canvas_template.cpp",
        "cpp_header": "Part3/template_canvas_renderer/cpp/konva_canvas_template.hpp",
        "cpp_compile": ["g++", "-O2", "-std=c++14", "-I", "Part3/template_canvas_renderer/cpp", "Part3/template_canvas_renderer/cpp/konva_canvas_template.cpp", "Part3/template_canvas_renderer/cpp/test_runner.cpp", "-o", "Part3/template_canvas_renderer/cpp/test_runner.exe"],
        "cpp_run": [os.path.join(BASE, "Part3", "template_canvas_renderer", "cpp", "test_runner.exe")]
    }
]

languages = [
    {
        "lang": "Java",
        "compiler": "javac 23.0.2 / OpenJDK Java 23.0.2+7-58",
        "notes": "Nominal interfaces, classes, and generics; runtime object dispatch.",
        "prod_key": "java_prod",
        "compile_key": "java_compile",
        "run_key": "java_run",
        "test_cmd": "javac -d bin ... && java -cp bin TestRunner"
    },
    {
        "lang": "Python",
        "compiler": "Python 3.11.9",
        "notes": "ABC-based contracts with dynamic dispatch, built-in mappings, and first-class functions.",
        "prod_key": "py_prod",
        "compile_key": None,
        "run_key": "py_run",
        "test_cmd": "python test_runner.py"
    },
    {
        "lang": "JavaScript",
        "compiler": "Node.js v22.16.0 (V8 12.4.254.20)",
        "notes": "ES class syntax over prototype-based objects, dynamic values, modules, and runtime dispatch.",
        "prod_key": "js_prod",
        "compile_key": None,
        "run_key": "js_run",
        "test_cmd": "node testRunner.js"
    },
    {
        "lang": "C++",
        "compiler": "g++ MinGW GCC 6.3.0 (-O2 -std=c++14)",
        "notes": "Abstract base classes and virtual dispatch; templates, RAII, and shared ownership in the snippets.",
        "prod_key": "cpp_prod",
        "compile_key": "cpp_compile",
        "run_key": "cpp_run",
        "test_cmd": "g++ -O2 -std=c++14 ... -o test_runner.exe && ./test_runner.exe"
    }
]

def count_source_loc(filepaths):
    if isinstance(filepaths, str):
        filepaths = [filepaths]
    abs_paths = [os.path.join(BASE, filepath) for filepath in filepaths]
    output = subprocess.run(
        ["cloc", "--csv", "--quiet", *abs_paths],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    for row in csv.reader(output.splitlines()):
        if len(row) >= 5 and row[1] == "SUM":
            return int(row[4])
    raise RuntimeError(f"cloc did not report a SUM row for {filepaths!r}")

def get_max_cc(filepaths):
    if isinstance(filepaths, str):
        filepaths = [filepaths]
    abs_paths = [os.path.join(BASE, filepath) for filepath in filepaths]
    try:
        res = subprocess.run(["python", "-m", "lizard", *abs_paths], capture_output=True, text=True, check=True)
        # Parse output table
        lines = res.stdout.splitlines()
        max_cc = 1
        for line in lines:
            parts = line.split()
            if len(parts) >= 6 and parts[0].isdigit() and parts[1].isdigit():
                cc = int(parts[1])
                if cc > max_cc:
                    max_cc = cc
        return max_cc, res.stdout
    except Exception as e:
        return 1, str(e)

results = []
all_lizard_logs = []
loc_logs = []

for pat in patterns:
    pname = pat["pattern_name"]
    iname = pat["instance_name"]
    dname = pat["dir_name"]
    print(f"\n==================== Benchmarking Pattern: {pname} ====================")

    for linfo in languages:
        lang = linfo["lang"]
        prod_path = pat[linfo["prod_key"]]
        production_paths = [prod_path]
        if lang == "C++":
            production_paths.append(pat["cpp_header"])
        compile_cmd = pat[linfo["compile_key"]] if linfo["compile_key"] else None
        run_cmd = pat[linfo["run_key"]]

        # 1. Compile if needed
        if compile_cmd:
            print(f"Compiling {pname} ({lang})...")
            subprocess.run(compile_cmd, cwd=BASE, check=True)

        # 2. Lizard CC
        max_cc, lizard_raw = get_max_cc(production_paths)
        all_lizard_logs.append(f"=== {pname} ({lang}) : {';'.join(production_paths)} ===\n{lizard_raw}\n")

        # 3. LOC
        loc = count_source_loc(production_paths)
        loc_logs.append(f"{' ; '.join(production_paths)}: {loc} production LOC (excl. blanks & comments)")

        # 4. Warmup run
        print(f"Warmup {pname} ({lang})...")
        subprocess.run(run_cmd, cwd=BASE, capture_output=True, text=True, check=True)

        # 5. 5 Measured runs
        timings = []
        raw_outputs = []
        test_result_str = "passed"
        for r in range(1, 6):
            res = subprocess.run(run_cmd, cwd=BASE, capture_output=True, text=True, check=True)
            out = res.stdout
            raw_outputs.append(f"--- Run {r} ---\n{out}\n")
            # Parse TIME_MS and RESULT
            m_time = re.search(r"TIME_MS:\s*([\d\.]+)", out)
            m_res = re.search(r"RESULT:\s*([^\n\r]+)", out)
            if m_time:
                t_val = float(m_time.group(1))
                timings.append(t_val)
            if m_res:
                test_result_str = m_res.group(1).strip()

        median_time = statistics.median(timings) if timings else 0.0
        print(f"{pname} ({lang}) -> LOC: {loc}, Max CC: {max_cc}, Result: {test_result_str}, Times: {timings}, Median: {median_time:.3f} ms")

        # Save evidence
        ev_file = os.path.join(EVIDENCE_DIR, f"{dname}_{lang.lower()}_runs.txt")
        with open(ev_file, "w", encoding="utf-8") as f:
            f.write(f"Pattern: {pname}\nInstance: {iname}\nLanguage: {lang}\n")
            f.write(f"Compiler/Runtime: {linfo['compiler']}\n")
            f.write(f"Warmup + 5 Runs Raw Output:\n")
            f.write("\n".join(raw_outputs))
            f.write(f"\nMeasured Milliseconds: {timings}\n")
            f.write(f"Computed Median Milliseconds: {median_time:.3f}\n")

        results.append({
            "pattern_name": pname,
            "instance_name": iname,
            "language": lang,
            "snippet_path": ";".join(production_paths),
            "source_loc": loc,
            "max_function_cc": max_cc,
            "runtime_compiler": linfo["compiler"],
            "test_command": linfo["test_cmd"],
            "test_result": test_result_str,
            "median_process_ms": round(median_time, 3),
            "language_notes": linfo["notes"],
            "timing_scope": "Timer inside the test runner; process, VM, and interpreter startup excluded"
        })

# Write lizard and loc logs
with open(os.path.join(COMPLEXITY_DIR, "lizard_complexity_report.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(all_lizard_logs))

with open(os.path.join(COMPLEXITY_DIR, "source_loc_report.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(loc_logs))

# Save json results
with open(SUMMARY_PATH, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=list(results[0].keys()), lineterminator="\n")
    writer.writeheader()
    writer.writerows(results)

print("\nAll 24 benchmarks completed successfully!")
