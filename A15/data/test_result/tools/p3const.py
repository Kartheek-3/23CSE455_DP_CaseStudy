import csv, os, re, statistics, subprocess, sys, tempfile, time, json
A = "/home/claude/A1"; P3 = A + "/Part3"
os.environ["JAVA_TOOL_OPTIONS"] = ""
PROBLEMS = [  # dir, pattern_name, instance_name
 ("dao_account_persistence", "Data Access Object", "Account and User Persistence DAO"),
 ("dto_user_assembly", "Data Transfer Object", "API Payload DTO Assembly"),
 ("service_layer_bank", "Service Layer", "Banking Use-Case Service Layer"),
 ("transaction_script_account", "Transaction Script", "Account Deposit and Withdrawal Script"),
 ("controller_rest_use_case", "Controller", "REST Use-Case Controller"),
 ("dependency_injection_wiring", "Dependency Injection", "CDI Field Injection Wiring"),
 ("exception_translation_http", "Exception Translation", "HTTP Error Translation"),
 ("strategy_account_policy", "Strategy", "Account Type Policy"),
 ("observer_transaction_events", "Observer", "Transaction Audit and Alert Notification"),
 ("domain_model_account", "Domain Model", "Account Balance Domain Model"),
]
LANGS = [("Java", "java", "Snippet.java", "java"), ("Python", "python", "snippet.py", "python"),
         ("JavaScript", "javascript", "snippet.js", "javascript"), ("C++", "cpp", "snippet.hpp", "cpp")]
def sh(c, cwd=None): return subprocess.run(c, shell=True, cwd=cwd, capture_output=True, text=True)
ver = {"Java": [l for l in sh("java -version 2>&1").stdout.splitlines() if "version" in l and "Picked" not in l][0],
       "Python": "CPython " + sh("python3 --version").stdout.split()[1],
       "JavaScript": "Node.js " + sh("node --version").stdout.strip(),
       "C++": "g++ " + sh("g++ --version").stdout.splitlines()[0].split()[-1] + " (-std=c++17 -O1)"}
ver["Java"] = "OpenJDK " + re.search(r'"([^"]+)"', ver["Java"]).group(1) + " (javac --release default)"
TESTCMD = {"Java": "javac -d out Snippet.java Runner.java && java -cp out Runner ../test-cases/cases.txt",
           "Python": "python3 run_tests.py ../test-cases/cases.txt",
           "JavaScript": "node run_tests.js ../test-cases/cases.txt",
           "C++": "g++ -std=c++17 -O1 -o run_tests run_tests.cpp && ./run_tests ../test-cases/cases.txt"}

def lizard(path, lang):
    out = sh("python3 -m lizard -l %s --csv %s" % (lang, path)).stdout.splitlines()
    rows = list(csv.reader(out)); cc = max((int(r[1]) for r in rows), default=0)
    table = sh("python3 -m lizard -l %s %s" % (lang, path)).stdout
    m = re.search(r"^\s*(\d+)\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+\d+\s+\d+\s+[\d.]+\s+[\d.]+\s*$", table, re.M)
    return int(m.group(1)), cc, len(rows)

def notes(lang, path, nloc, cc, nfun):
    src = open(path, encoding="utf-8").read()
    ncls = len(re.findall(r"^\s*(?:export\s+)?(?:abstract\s+)?(?:final\s+)?(?:class|struct|interface)\s+\w+", src, re.M))
    nint = len(re.findall(r"^\s*interface\s+\w+", src, re.M))
    base = {"Java": "static types, package-private classes/interfaces in one file, unchecked RuntimeException subclasses; roles realised by %d classes/interfaces (%d interfaces)",
            "Python": "dynamic typing; abstract roles are plain base classes or duck-typed; roles realised by %d classes; no compile step",
            "JavaScript": "ES6 classes with duck typing and CommonJS exports; abstract roles are base classes or implicit; roles realised by %d classes; no compile step",
            "C++": "header-only; pure-virtual interfaces where the role is abstract, exceptions derive from std::runtime_error; roles realised by %d classes/structs"}[lang]
    base = base % ((ncls, nint) if lang == "Java" else ncls)
    return base + "; %d functions measured" % nfun

def run(cmd, cwd):
    t0 = time.perf_counter(); r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True); ms = (time.perf_counter() - t0) * 1000
    return r, ms

