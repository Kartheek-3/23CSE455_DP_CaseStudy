Assistant text output for prompt 6 (implementation and measurement).
Only the assistant's text messages are included. Every text message between prompt 6 and prompt 7 is here.
The generator scripts the assistant wrote to produce the snippets follow after the messages; they are the versions as they stood when prompt 6 was finished
(the Observer script was changed afterwards, see review_phase_output.md).

===== assistant message (2026-10-10T11:38:35.115Z) =====
Strategy passes 5/5 in all four languages. I'm now writing Factory, Adapter, Template Method and Proxy the same way.

===== assistant message (2026-10-10T11:41:12.211Z) =====
Batch 1 code and READMEs are written and passing; I'm now building the measurement harness (tests, LOC, complexity, timing).

===== assistant message (2026-10-10T11:47:08.041Z) =====
Router passes in all four languages. Writing Service Layer, Plugin Architecture and Repository now.

===== assistant message (2026-10-10T11:56:09.361Z) =====
Part 3 is implemented and measured: 15 pattern types in Java, Python, JavaScript and C++ (60 snippets), and all 60 pass their tests.

Two deliverables are not done: `A1_slide.pdf` (no team ID or content yet) and the report text for section 4. The LLM records are marked `pending_review`, and every verification file shows reviewer **pending**.

## Source and scope
- **Commit:** HEAD is still `53ac6808ae4921305e761c545863ee6593edd1f4` and the Misskey tree is clean. The original `audit-input/` and `audit-results/` were not touched.
- **Selection:** one representative instance per confirmed type, 15 types in all. The uncertain rows (Mediator, Object Pool, the streaming connection factory) and the three unconfirmed new candidates were left out.

## Results

| check | outcome |
|---|---|
| Snippets and tests | 60 of 60 pass, 96 fixture cases, 384 executions, no compiler warnings |
| Equivalence | one shared fixture per pattern in `Part3/test-cases/`, read by all four test runners |
| Environment | OpenJDK 17.0.19, CPython 3.14.6, Node v24.15.0, g++ 16.1.1 (`-std=c++17 -Wall -Wextra`), lizard 1.24.1 |
| Timing | compile first, 1 warm-up and 5 timed runs per snippet; medians about 3–4 ms C++, 24–57 ms Python, 45–53 ms JavaScript, 76–107 ms Java |

- **Timing caveat:** the times include process start-up and come from one laptop, so they mostly compare runtime start-up and say little about the patterns.
- **LOC and complexity:** both come from lizard 1.24.1 and are in `data/cross_language.csv` for each snippet.
- **Lizard problem found and handled:** it silently dropped JavaScript methods named `get`/`set`/`delete`, which showed a Two-Level Cache complexity of 1 instead of 3. The harness now measures a temporary renamed copy, and this is documented in `Part3/README.md`.
- **Fixes during the work (all kept and recorded):**
  - JS Observer `off(undefined)` throws in Node, so the test passes an unregistered function.
  - The Python `EntityNotFound` message was empty.
  - The service-layer fixture order was changed before its first run.
  - C++ unused-helper warnings were silenced.
  - The Python adapter docstring became a `#` comment so lizard counts LOC consistently.

## Structure and caveats
- **Structure:** follows the newer report template — `Part3/code/pattern_<name>/<lang>/`, `Part3/test-cases/`, `Part3/evidence/`, `Part3/llm/`, with a single `data/cross_language.csv` and a single `data/llm.csv`. The template's boilerplate READMEs and header-only CSV stubs were replaced.
- **Caveated patterns:** Factory, Adapter, Cache-Aside, Front Controller, Service Layer and Repository each carry their caveat in the pattern README. The Repository README states that the snippet models the collaboration with an in-memory store and does not reproduce TypeORM.
- **Model-only rules:** some behaviour in the snippets is the model's own, not Misskey's (for example, null-backend rejection and the 2-call rate limit). These are listed in `Part3/llm/verification/implementation_verification.md`.

## Not done, or needs you
- **`A1_slide.pdf`:** not produced, since the team name and content aren't set. `slide_outline.md` is untouched.
- **Report text:** the .tex content for section 4 is not written. The data it asks for is in `data/cross_language.csv` and `Part3/README.md`.
- **LLM access tier:** I can't see it, so it is recorded as "not recorded" in `data/llm.csv`. Please tell me the tier and I'll fill it in.
- **LLM review:** the three `data/llm.csv` rows are `pending_review`. Go through `Part3/llm/verification/*.md` and set each row to `correct`, `partial`, `incorrect` or `cannot confirm`. The two verification files list what needs a human check.
- **Scope decision:** the 4 unused confirmed Observer instances and 1 unused Factory instance are not implemented. Say if you want all 19 confirmed instances (76 snippets).
- **Audit input origin:** this session did not produce the teammate's `audit-input`. If an LLM did, it needs its own record in Part 1's `llm.csv`.
- **Raw output files:** the implementation-phase output file was extracted from the session transcript before this final message, so it doesn't include it.

Everything is in `TEAM_TEMPLATE/`; start with `Part3/README.md`.

===== generator script: gen.py =====
import os
ROOT = os.path.expanduser("~/design_patterns_case_study/TEAM_TEMPLATE/Part3/code")
def w(p, lang, name, text):
    d = os.path.join(ROOT, "pattern_" + p, lang); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, name), "w", encoding="utf-8").write(text.strip("\n") + "\n")

PY_MAIN = '''
def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        cases = [l.rstrip("\\n").split("|", 2) for l in f if l.strip() and not l.startswith("#")]
    passed = 0
    for name, text, expected in cases:
        got = run(text)
        ok = got == expected
        passed += ok
        print(("PASS " if ok else "FAIL ") + name + ("" if ok else ": expected [%s] got [%s]" % (expected, got)))
    print("passed %d/%d" % (passed, len(cases)))
    sys.exit(0 if passed == len(cases) else 1)


if __name__ == "__main__":
    main()
'''
JS_MAIN = '''
let passed = 0;
const cases = fs.readFileSync(process.argv[2], 'utf8').split('\\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .map(l => { const i = l.indexOf('|'), j = l.indexOf('|', i + 1); return [l.slice(0, i), l.slice(i + 1, j), l.slice(j + 1)]; });
for (const [name, text, expected] of cases) {
  const got = run(text);
  const ok = got === expected;
  if (ok) passed++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : `: expected [${expected}] got [${got}]`));
}
console.log(`passed ${passed}/${cases.length}`);
process.exit(passed === cases.length ? 0 : 1);
'''
JAVA_MAIN = '''
    public static void main(String[] args) throws Exception {
        int passed = 0, total = 0;
        for (String line : Files.readAllLines(Path.of(args[0]))) {
            if (line.isBlank() || line.startsWith("#")) continue;
            String[] f = line.split("\\\\|", 3);
            total++;
            String got = run(f[1]);
            boolean ok = got.equals(f[2]);
            if (ok) passed++;
            System.out.println((ok ? "PASS " : "FAIL ") + f[0] + (ok ? "" : ": expected [" + f[2] + "] got [" + got + "]"));
        }
        System.out.println("passed " + passed + "/" + total);
        System.exit(passed == total ? 0 : 1);
    }
}
'''
CPP_HELP = '''
[[maybe_unused]] static std::vector<std::string> splitN(const std::string& s, char d, size_t n = 0) {
    std::vector<std::string> out;
    size_t start = 0, pos;
    while ((n == 0 || out.size() + 1 < n) && (pos = s.find(d, start)) != std::string::npos) {
        out.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    out.push_back(s.substr(start));
    return out;
}

[[maybe_unused]] static std::string join(const std::vector<std::string>& v, const std::string& sep) {
    std::string r;
    for (size_t i = 0; i < v.size(); ++i) r += (i ? sep : "") + v[i];
    return r;
}
'''
CPP_MAIN = '''
int main(int, char** argv) {
    std::ifstream in(argv[1]);
    std::string line;
    int passed = 0, total = 0;
    while (std::getline(in, line)) {
        if (line.empty() || line[0] == '#') continue;
        auto f = splitN(line, '|', 3);
        ++total;
        std::string got = run(f[1]);
        bool ok = got == f[2];
        if (ok) ++passed;
        std::cout << (ok ? "PASS " : "FAIL ") << f[0] << (ok ? "" : ": expected [" + f[2] + "] got [" + got + "]") << "\\n";
    }
    std::cout << "passed " << passed << "/" << total << "\\n";
    return passed == total ? 0 : 1;
}
'''
def emit(p, snake, pascal, camel, prod, tests):
    """prod: dict lang->source; tests: dict lang->(header, run_code)"""
    w(p, "python", snake + ".py", prod["python"])
    w(p, "python", "test_" + snake + ".py",
      "import os\nimport sys\n\nsys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))\n" + tests["python"][0] + "\n\n\n" + tests["python"][1].strip("\n") + "\n\n" + PY_MAIN.strip("\n"))
    w(p, "javascript", camel + ".js", prod["javascript"])
    w(p, "javascript", camel + ".test.js",
      "const fs = require('fs');\n" + tests["javascript"][0] + "\n\n" + tests["javascript"][1].strip("\n") + "\n" + JS_MAIN)
    w(p, "java", pascal + ".java", prod["java"])
    w(p, "java", pascal + "Test.java",
      "import java.nio.file.Files;\nimport java.nio.file.Path;\nimport java.util.*;\n" + tests["java"][0] + "\n\npublic class " + pascal + "Test {\n" + tests["java"][1].rstrip("\n") + "\n" + JAVA_MAIN)
    w(p, "cpp", snake + ".hpp", prod["cpp"])
    w(p, "cpp", snake + ".test.cpp",
      "#include <fstream>\n#include <iostream>\n#include <string>\n#include <vector>\n" + tests["cpp"][0] + "\n#include \"" + snake + ".hpp\"\n" + CPP_HELP + "\n" + tests["cpp"][1].strip("\n") + "\n" + CPP_MAIN)


===== generator script: p_adapter.py =====
from gen import *
prod = {}
prod["python"] = '''
from abc import ABC, abstractmethod

DEFAULT_SHUTDOWN_TIMEOUT = 5000


class TelemetryAdapter(ABC):
    @abstractmethod
    def capture_message(self, message, user_id=None): ...

    @abstractmethod
    def start_span(self, name, fn): ...

    @abstractmethod
    def shutdown(self): ...


class SentryTelemetryAdapter(TelemetryAdapter):
    # Translates the application's telemetry calls into the Sentry SDK's API.

    def __init__(self, sentry):
        self._sentry = sentry

    def capture_message(self, message, user_id=None):
        options = {"level": "error"}
        if user_id is not None:
            options["user.id"] = user_id
        self._sentry.capture_message(message, options)

    def start_span(self, name, fn):
        return self._sentry.start_span({"name": name}, fn)

    def shutdown(self):
        self._sentry.close(DEFAULT_SHUTDOWN_TIMEOUT)


class TelemetryRegistry:
    def __init__(self, adapters):
        self._adapters = list(adapters)

    def capture_message(self, message, user_id=None):
        for adapter in self._adapters:
            adapter.capture_message(message, user_id)

    def start_span(self, name, fn):
        return self._span(0, name, fn)

    def _span(self, index, name, fn):
        if index == len(self._adapters):
            return fn()
        return self._adapters[index].start_span(name, lambda: self._span(index + 1, name, fn))

    def shutdown(self):
        for adapter in self._adapters:
            adapter.shutdown()
'''
prod["javascript"] = '''
const DEFAULT_SHUTDOWN_TIMEOUT = 5000;

// Translates the application's telemetry calls into the Sentry SDK's API.
class SentryTelemetryAdapter {
  constructor(sentry) { this.sentry = sentry; }

  captureMessage(message, userId) {
    const options = { level: 'error' };
    if (userId != null) options['user.id'] = userId;
    this.sentry.captureMessage(message, options);
  }

  startSpan(name, fn) { return this.sentry.startSpan({ name }, fn); }

  shutdown() { this.sentry.close(DEFAULT_SHUTDOWN_TIMEOUT); }
}

class TelemetryRegistry {
  constructor(adapters) { this.adapters = [...adapters]; }

  captureMessage(message, userId) {
    for (const adapter of this.adapters) adapter.captureMessage(message, userId);
  }

  startSpan(name, fn) { return this.span(0, name, fn); }

  span(index, name, fn) {
    if (index === this.adapters.length) return fn();
    return this.adapters[index].startSpan(name, () => this.span(index + 1, name, fn));
  }

  shutdown() {
    for (const adapter of this.adapters) adapter.shutdown();
  }
}

module.exports = { SentryTelemetryAdapter, TelemetryRegistry };
'''
prod["java"] = '''
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/** What the application needs from a telemetry backend (the Target). */
interface TelemetryAdapter {
    void captureMessage(String message, String userId);
    <T> T startSpan(String name, Supplier<T> fn);
    void shutdown();
}

/** The part of the Sentry SDK the adapter uses (the Adaptee). */
interface SentryClient {
    void captureMessage(String message, Map<String, String> options);
    <T> T startSpan(String name, Supplier<T> fn);
    void close(int timeoutMs);
}

class SentryTelemetryAdapter implements TelemetryAdapter {
    private static final int DEFAULT_SHUTDOWN_TIMEOUT = 5000;
    private final SentryClient sentry;

    SentryTelemetryAdapter(SentryClient sentry) {
        this.sentry = sentry;
    }

    public void captureMessage(String message, String userId) {
        Map<String, String> options = new HashMap<>();
        options.put("level", "error");
        if (userId != null) options.put("user.id", userId);
        sentry.captureMessage(message, options);
    }

    public <T> T startSpan(String name, Supplier<T> fn) {
        return sentry.startSpan(name, fn);
    }

    public void shutdown() {
        sentry.close(DEFAULT_SHUTDOWN_TIMEOUT);
    }
}

public class TelemetryRegistry {
    private final List<TelemetryAdapter> adapters;

    public TelemetryRegistry(List<TelemetryAdapter> adapters) {
        this.adapters = adapters;
    }

    public void captureMessage(String message, String userId) {
        for (TelemetryAdapter adapter : adapters) adapter.captureMessage(message, userId);
    }

    public <T> T startSpan(String name, Supplier<T> fn) {
        return span(0, name, fn);
    }

    private <T> T span(int index, String name, Supplier<T> fn) {
        if (index == adapters.size()) return fn.get();
        return adapters.get(index).startSpan(name, () -> span(index + 1, name, fn));
    }

    public void shutdown() {
        for (TelemetryAdapter adapter : adapters) adapter.shutdown();
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <functional>
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>

// Target: what the application needs from a telemetry backend.
class TelemetryAdapter {
public:
    virtual ~TelemetryAdapter() = default;
    virtual void captureMessage(const std::string& message, const std::optional<std::string>& userId) = 0;
    virtual std::string startSpan(const std::string& name, const std::function<std::string()>& fn) = 0;
    virtual void shutdown() = 0;
};

// Adaptee: the part of the Sentry SDK the adapter uses.
class SentryClient {
public:
    virtual ~SentryClient() = default;
    virtual void captureMessage(const std::string& message, const std::map<std::string, std::string>& options) = 0;
    virtual std::string startSpan(const std::string& name, const std::function<std::string()>& fn) = 0;
    virtual void close(int timeoutMs) = 0;
};

class SentryTelemetryAdapter : public TelemetryAdapter {
public:
    explicit SentryTelemetryAdapter(std::shared_ptr<SentryClient> sentry) : sentry_(std::move(sentry)) {}

    void captureMessage(const std::string& message, const std::optional<std::string>& userId) override {
        std::map<std::string, std::string> options{{"level", "error"}};
        if (userId) options["user.id"] = *userId;
        sentry_->captureMessage(message, options);
    }

    std::string startSpan(const std::string& name, const std::function<std::string()>& fn) override {
        return sentry_->startSpan(name, fn);
    }

    void shutdown() override { sentry_->close(kDefaultShutdownTimeout); }

private:
    static constexpr int kDefaultShutdownTimeout = 5000;
    std::shared_ptr<SentryClient> sentry_;
};

class TelemetryRegistry {
public:
    explicit TelemetryRegistry(std::vector<std::shared_ptr<TelemetryAdapter>> adapters) : adapters_(std::move(adapters)) {}

    void captureMessage(const std::string& message, const std::optional<std::string>& userId) {
        for (auto& adapter : adapters_) adapter->captureMessage(message, userId);
    }

    std::string startSpan(const std::string& name, const std::function<std::string()>& fn) {
        return span(0, name, fn);
    }

    void shutdown() {
        for (auto& adapter : adapters_) adapter->shutdown();
    }

private:
    std::string span(size_t index, const std::string& name, const std::function<std::string()>& fn) {
        if (index == adapters_.size()) return fn();
        return adapters_[index]->startSpan(name, [&] { return span(index + 1, name, fn); });
    }

    std::vector<std::shared_ptr<TelemetryAdapter>> adapters_;
};
'''
tests = {}
tests["python"] = ("from telemetry import SentryTelemetryAdapter, TelemetryRegistry", '''
class FakeSentry:
    def __init__(self, log):
        self.log = log

    def capture_message(self, message, options):
        text = "sentry.captureMessage(%s,level=%s" % (message, options["level"])
        if "user.id" in options:
            text += ",user.id=" + options["user.id"]
        self.log.append(text + ")")

    def start_span(self, options, fn):
        self.log.append("sentry.startSpan(%s)" % options["name"])
        return fn()

    def close(self, timeout):
        self.log.append("sentry.close(%d)" % timeout)


def run(text):
    log = []
    registry = None
    for command in text.split(";"):
        parts = command.split(" ", 2)
        if parts[0] == "adapters":
            registry = TelemetryRegistry([SentryTelemetryAdapter(FakeSentry(log)) for _ in range(int(parts[1]))])
        elif parts[0] == "msg":
            registry.capture_message(parts[2], None if parts[1] == "-" else parts[1])
        elif parts[0] == "span":
            value = parts[2]

            def fn():
                if value.startswith("!"):
                    raise RuntimeError(value[1:])
                return value
            try:
                log.append("result=" + registry.start_span(parts[1], fn))
            except RuntimeError as e:
                log.append("ERR:" + str(e))
        elif parts[0] == "shutdown":
            registry.shutdown()
    return "~".join(log)
''')
tests["javascript"] = ("const { SentryTelemetryAdapter, TelemetryRegistry } = require('./telemetry');", '''
class FakeSentry {
  constructor(log) { this.log = log; }
  captureMessage(message, options) {
    const user = options['user.id'] != null ? `,user.id=${options['user.id']}` : '';
    this.log.push(`sentry.captureMessage(${message},level=${options.level}${user})`);
  }
  startSpan(options, fn) { this.log.push(`sentry.startSpan(${options.name})`); return fn(); }
  close(timeout) { this.log.push(`sentry.close(${timeout})`); }
}

function run(text) {
  const log = [];
  let registry = null;
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'adapters') {
      registry = new TelemetryRegistry(Array.from({ length: Number(parts[1]) }, () => new SentryTelemetryAdapter(new FakeSentry(log))));
    } else if (parts[0] === 'msg') {
      registry.captureMessage(parts.slice(2).join(' '), parts[1] === '-' ? null : parts[1]);
    } else if (parts[0] === 'span') {
      const value = parts[2];
      try {
        log.push('result=' + registry.startSpan(parts[1], () => {
          if (value.startsWith('!')) throw new Error(value.slice(1));
          return value;
        }));
      } catch (e) {
        log.push('ERR:' + e.message);
      }
    } else if (parts[0] === 'shutdown') {
      registry.shutdown();
    }
  }
  return log.join('~');
}
''')
tests["java"] = ("import java.util.function.Supplier;", '''
    static class FakeSentry implements SentryClient {
        private final List<String> log;

        FakeSentry(List<String> log) { this.log = log; }

        public void captureMessage(String message, Map<String, String> options) {
            String user = options.containsKey("user.id") ? ",user.id=" + options.get("user.id") : "";
            log.add("sentry.captureMessage(" + message + ",level=" + options.get("level") + user + ")");
        }

        public <T> T startSpan(String name, Supplier<T> fn) {
            log.add("sentry.startSpan(" + name + ")");
            return fn.get();
        }

        public void close(int timeoutMs) { log.add("sentry.close(" + timeoutMs + ")"); }
    }

    static String run(String text) {
        List<String> log = new ArrayList<>();
        TelemetryRegistry registry = null;
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 3);
            if (parts[0].equals("adapters")) {
                List<TelemetryAdapter> adapters = new ArrayList<>();
                for (int i = 0; i < Integer.parseInt(parts[1]); i++) adapters.add(new SentryTelemetryAdapter(new FakeSentry(log)));
                registry = new TelemetryRegistry(adapters);
            } else if (parts[0].equals("msg")) {
                registry.captureMessage(parts[2], parts[1].equals("-") ? null : parts[1]);
            } else if (parts[0].equals("span")) {
                String value = parts[2];
                try {
                    log.add("result=" + registry.startSpan(parts[1], () -> {
                        if (value.startsWith("!")) throw new RuntimeException(value.substring(1));
                        return value;
                    }));
                } catch (RuntimeException e) {
                    log.add("ERR:" + e.getMessage());
                }
            } else if (parts[0].equals("shutdown")) {
                registry.shutdown();
            }
        }
        return String.join("~", log);
    }
''')
tests["cpp"] = ("#include <functional>\n#include <map>\n#include <memory>\n#include <optional>\n#include <stdexcept>", '''
class FakeSentry : public SentryClient {
public:
    explicit FakeSentry(std::vector<std::string>& log) : log_(log) {}

    void captureMessage(const std::string& message, const std::map<std::string, std::string>& options) override {
        auto user = options.find("user.id");
        log_.push_back("sentry.captureMessage(" + message + ",level=" + options.at("level") +
                       (user != options.end() ? ",user.id=" + user->second : "") + ")");
    }

    std::string startSpan(const std::string& name, const std::function<std::string()>& fn) override {
        log_.push_back("sentry.startSpan(" + name + ")");
        return fn();
    }

    void close(int timeoutMs) override { log_.push_back("sentry.close(" + std::to_string(timeoutMs) + ")"); }

private:
    std::vector<std::string>& log_;
};

static std::string run(const std::string& text) {
    std::vector<std::string> log;
    std::unique_ptr<TelemetryRegistry> registry;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 3);
        if (parts[0] == "adapters") {
            std::vector<std::shared_ptr<TelemetryAdapter>> adapters;
            for (int i = 0; i < std::stoi(parts[1]); ++i)
                adapters.push_back(std::make_shared<SentryTelemetryAdapter>(std::make_shared<FakeSentry>(log)));
            registry = std::make_unique<TelemetryRegistry>(adapters);
        } else if (parts[0] == "msg") {
            registry->captureMessage(parts[2], parts[1] == "-" ? std::nullopt : std::optional<std::string>(parts[1]));
        } else if (parts[0] == "span") {
            std::string value = parts[2];
            try {
                log.push_back("result=" + registry->startSpan(parts[1], [&] {
                    if (value[0] == '!') throw std::runtime_error(value.substr(1));
                    return value;
                }));
            } catch (const std::runtime_error& e) {
                log.push_back(std::string("ERR:") + e.what());
            }
        } else if (parts[0] == "shutdown") {
            registry->shutdown();
        }
    }
    return join(log, "~");
}
''')
emit("adapter", "telemetry", "TelemetryRegistry", "telemetry", prod, tests)


===== generator script: p_cacheaside.py =====
from gen import *
prod = {}
prod["python"] = '''
from collections import namedtuple

Instance = namedtuple("Instance", "host id")


class InMemoryInstanceRepository:
    def __init__(self):
        self._rows = {}
        self.finds = 0    # counters let the tests see whether the database was used
        self.inserts = 0

    def find_one_by_host(self, host):
        self.finds += 1
        return self._rows.get(host)

    def insert_one(self, host):
        self.inserts += 1
        row = Instance(host, len(self._rows) + 1)
        self._rows[host] = row
        return row


class KeyValueCache:
    def __init__(self):
        self._items = {}

    def has(self, key):
        return key in self._items

    def get(self, key):
        return self._items.get(key)

    def set(self, key, value):
        self._items[key] = value

    def dispose(self):
        self._items.clear()


class FederatedInstanceService:
    def __init__(self, repository, cache):
        self._repository = repository
        self._cache = cache

    def fetch_or_register(self, host):
        host = host.lower()
        cached = self._cache.get(host)
        if cached is not None:
            return cached
        found = self._repository.find_one_by_host(host)
        if found is None:
            found = self._repository.insert_one(host)
        self._cache.set(host, found)
        return found

    def lookup(self, host):
        host = host.lower()
        if self._cache.has(host):
            return self._cache.get(host)
        found = self._repository.find_one_by_host(host)
        self._cache.set(host, found)
        return found
'''
prod["javascript"] = '''
class InMemoryInstanceRepository {
  constructor() {
    this.rows = new Map();
    this.finds = 0; // counters let the tests see whether the database was used
    this.inserts = 0;
  }

  findOneByHost(host) {
    this.finds++;
    return this.rows.get(host) ?? null;
  }

  insertOne(host) {
    this.inserts++;
    const row = { host, id: this.rows.size + 1 };
    this.rows.set(host, row);
    return row;
  }
}

class KeyValueCache {
  constructor() { this.items = new Map(); }
  has(key) { return this.items.has(key); }
  get(key) { return this.items.get(key); }
  set(key, value) { this.items.set(key, value); }
  dispose() { this.items.clear(); }
}

class FederatedInstanceService {
  constructor(repository, cache) {
    this.repository = repository;
    this.cache = cache;
  }

  fetchOrRegister(host) {
    host = host.toLowerCase();
    const cached = this.cache.get(host);
    if (cached) return cached;
    let found = this.repository.findOneByHost(host);
    if (found == null) found = this.repository.insertOne(host);
    this.cache.set(host, found);
    return found;
  }

  lookup(host) {
    host = host.toLowerCase();
    if (this.cache.has(host)) return this.cache.get(host);
    const found = this.repository.findOneByHost(host);
    this.cache.set(host, found);
    return found;
  }
}

module.exports = { FederatedInstanceService, InMemoryInstanceRepository, KeyValueCache };
'''
prod["java"] = '''
import java.util.HashMap;
import java.util.Map;

record Instance(String host, int id) {}

class InMemoryInstanceRepository {
    private final Map<String, Instance> rows = new HashMap<>();
    int finds = 0;    // counters let the tests see whether the database was used
    int inserts = 0;

    Instance findOneByHost(String host) {
        finds++;
        return rows.get(host);
    }

    Instance insertOne(String host) {
        inserts++;
        Instance row = new Instance(host, rows.size() + 1);
        rows.put(host, row);
        return row;
    }
}

class KeyValueCache {
    private final Map<String, Instance> items = new HashMap<>();

    boolean has(String key) { return items.containsKey(key); }

    Instance get(String key) { return items.get(key); }

    void set(String key, Instance value) { items.put(key, value); }

    void dispose() { items.clear(); }
}

public class FederatedInstanceService {
    private final InMemoryInstanceRepository repository;
    private final KeyValueCache cache;

    public FederatedInstanceService(InMemoryInstanceRepository repository, KeyValueCache cache) {
        this.repository = repository;
        this.cache = cache;
    }

    public Instance fetchOrRegister(String host) {
        host = host.toLowerCase();
        Instance cached = cache.get(host);
        if (cached != null) return cached;
        Instance found = repository.findOneByHost(host);
        if (found == null) found = repository.insertOne(host);
        cache.set(host, found);
        return found;
    }

    public Instance lookup(String host) {
        host = host.toLowerCase();
        if (cache.has(host)) return cache.get(host);
        Instance found = repository.findOneByHost(host);
        cache.set(host, found);
        return found;
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <cctype>
#include <map>
#include <optional>
#include <string>

struct Instance {
    std::string host;
    int id;
};

class InMemoryInstanceRepository {
public:
    int finds = 0;    // counters let the tests see whether the database was used
    int inserts = 0;

    std::optional<Instance> findOneByHost(const std::string& host) {
        ++finds;
        auto it = rows_.find(host);
        if (it == rows_.end()) return std::nullopt;
        return it->second;
    }

    Instance insertOne(const std::string& host) {
        ++inserts;
        Instance row{host, static_cast<int>(rows_.size()) + 1};
        rows_[host] = row;
        return row;
    }

private:
    std::map<std::string, Instance> rows_;
};

class KeyValueCache {
public:
    bool has(const std::string& key) const { return items_.count(key) > 0; }
    std::optional<Instance> get(const std::string& key) const {
        auto it = items_.find(key);
        return it == items_.end() ? std::nullopt : it->second;
    }
    void set(const std::string& key, const std::optional<Instance>& value) { items_[key] = value; }
    void dispose() { items_.clear(); }

private:
    std::map<std::string, std::optional<Instance>> items_;
};

class FederatedInstanceService {
public:
    FederatedInstanceService(InMemoryInstanceRepository& repository, KeyValueCache& cache)
        : repository_(repository), cache_(cache) {}

    Instance fetchOrRegister(std::string host) {
        host = lower(host);
        if (auto cached = cache_.get(host)) return *cached;
        auto found = repository_.findOneByHost(host);
        Instance instance = found ? *found : repository_.insertOne(host);
        cache_.set(host, instance);
        return instance;
    }

    std::optional<Instance> lookup(std::string host) {
        host = lower(host);
        if (cache_.has(host)) return cache_.get(host);
        auto found = repository_.findOneByHost(host);
        cache_.set(host, found);
        return found;
    }

private:
    static std::string lower(std::string s) {
        std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return std::tolower(c); });
        return s;
    }

    InMemoryInstanceRepository& repository_;
    KeyValueCache& cache_;
};
'''
tests = {}
tests["python"] = ("from federated_instance_service import FederatedInstanceService, InMemoryInstanceRepository, KeyValueCache", '''
def run(text):
    repo, cache = InMemoryInstanceRepository(), KeyValueCache()
    service = FederatedInstanceService(repo, cache)
    out = []
    for command in text.split(";"):
        parts = command.split(" ")
        if parts[0] == "dropcache":
            cache.dispose()
            continue
        finds, inserts = repo.finds, repo.inserts
        if parts[0] == "fetch":
            result = service.fetch_or_register(parts[1])
        else:
            result = service.lookup(parts[1])
        source = "insert" if repo.inserts > inserts else "db" if repo.finds > finds else "cache"
        out.append(("none" if result is None else "%s#%d" % (result.host, result.id)) + "@" + source)
    return "~".join(out)
''')
tests["javascript"] = ("const { FederatedInstanceService, InMemoryInstanceRepository, KeyValueCache } = require('./federatedInstanceService');", '''
function run(text) {
  const repo = new InMemoryInstanceRepository();
  const cache = new KeyValueCache();
  const service = new FederatedInstanceService(repo, cache);
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'dropcache') {
      cache.dispose();
      continue;
    }
    const finds = repo.finds, inserts = repo.inserts;
    const result = parts[0] === 'fetch' ? service.fetchOrRegister(parts[1]) : service.lookup(parts[1]);
    const source = repo.inserts > inserts ? 'insert' : repo.finds > finds ? 'db' : 'cache';
    out.push((result == null ? 'none' : `${result.host}#${result.id}`) + '@' + source);
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static String run(String text) {
        InMemoryInstanceRepository repo = new InMemoryInstanceRepository();
        KeyValueCache cache = new KeyValueCache();
        FederatedInstanceService service = new FederatedInstanceService(repo, cache);
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            if (parts[0].equals("dropcache")) {
                cache.dispose();
                continue;
            }
            int finds = repo.finds, inserts = repo.inserts;
            Instance result = parts[0].equals("fetch") ? service.fetchOrRegister(parts[1]) : service.lookup(parts[1]);
            String source = repo.inserts > inserts ? "insert" : repo.finds > finds ? "db" : "cache";
            out.add((result == null ? "none" : result.host() + "#" + result.id()) + "@" + source);
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <optional>", '''
static std::string run(const std::string& text) {
    InMemoryInstanceRepository repo;
    KeyValueCache cache;
    FederatedInstanceService service(repo, cache);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        if (parts[0] == "dropcache") {
            cache.dispose();
            continue;
        }
        int finds = repo.finds, inserts = repo.inserts;
        std::optional<Instance> result;
        if (parts[0] == "fetch") result = service.fetchOrRegister(parts[1]);
        else result = service.lookup(parts[1]);
        std::string source = repo.inserts > inserts ? "insert" : repo.finds > finds ? "db" : "cache";
        out.push_back((result ? result->host + "#" + std::to_string(result->id) : "none") + "@" + source);
    }
    return join(out, "~");
}
''')
emit("cache_aside", "federated_instance_service", "FederatedInstanceService", "federatedInstanceService", prod, tests)


===== generator script: p_factory.py =====
from gen import *
prod = {}
prod["python"] = '''
class PrettyConsoleBackend:
    name = "pretty"

    def write(self, level, message):
        return f"[{level.upper()}] {message}"


class JsonConsoleBackend:
    name = "json"

    def write(self, level, message):
        return '{"level":"%s","message":"%s"}' % (level, message)


def create_logging_backend(fmt):
    if fmt is None or fmt == "pretty":
        return PrettyConsoleBackend()
    if fmt == "json":
        return JsonConsoleBackend()
    raise ValueError("logging.format must be either pretty or json")
'''
prod["javascript"] = '''
class PrettyConsoleBackend {
  get name() { return 'pretty'; }
  write(level, message) { return `[${level.toUpperCase()}] ${message}`; }
}

class JsonConsoleBackend {
  get name() { return 'json'; }
  write(level, message) { return JSON.stringify({ level, message }); }
}

function createLoggingBackend(format) {
  if (format == null || format === 'pretty') return new PrettyConsoleBackend();
  if (format === 'json') return new JsonConsoleBackend();
  throw new Error('logging.format must be either pretty or json');
}

module.exports = { createLoggingBackend };
'''
prod["java"] = '''
interface LogBackend {
    String name();
    String write(String level, String message);
}

class PrettyConsoleBackend implements LogBackend {
    public String name() { return "pretty"; }

    public String write(String level, String message) {
        return "[" + level.toUpperCase() + "] " + message;
    }
}

class JsonConsoleBackend implements LogBackend {
    public String name() { return "json"; }

    public String write(String level, String message) {
        return "{\\"level\\":\\"" + level + "\\",\\"message\\":\\"" + message + "\\"}";
    }
}

public class LoggingFactory {
    public static LogBackend createLoggingBackend(String format) {
        if (format == null || format.equals("pretty")) return new PrettyConsoleBackend();
        if (format.equals("json")) return new JsonConsoleBackend();
        throw new IllegalArgumentException("logging.format must be either pretty or json");
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <cctype>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>

class LogBackend {
public:
    virtual ~LogBackend() = default;
    virtual std::string name() const = 0;
    virtual std::string write(const std::string& level, const std::string& message) const = 0;
};

class PrettyConsoleBackend : public LogBackend {
public:
    std::string name() const override { return "pretty"; }
    std::string write(const std::string& level, const std::string& message) const override {
        std::string upper = level;
        std::transform(upper.begin(), upper.end(), upper.begin(), [](unsigned char c) { return std::toupper(c); });
        return "[" + upper + "] " + message;
    }
};

class JsonConsoleBackend : public LogBackend {
public:
    std::string name() const override { return "json"; }
    std::string write(const std::string& level, const std::string& message) const override {
        return "{\\"level\\":\\"" + level + "\\",\\"message\\":\\"" + message + "\\"}";
    }
};

inline std::unique_ptr<LogBackend> createLoggingBackend(const std::optional<std::string>& format) {
    if (!format || *format == "pretty") return std::make_unique<PrettyConsoleBackend>();
    if (*format == "json") return std::make_unique<JsonConsoleBackend>();
    throw std::invalid_argument("logging.format must be either pretty or json");
}
'''
tests = {}
tests["python"] = ("from logging_factory import create_logging_backend", '''
def run(text):
    fmt = {"-": None, "<empty>": ""}.get(text, text)
    try:
        backend = create_logging_backend(fmt)
        return backend.name + ":" + backend.write("info", "hi")
    except ValueError as e:
        return "ERR:" + str(e)
''')
tests["javascript"] = ("const { createLoggingBackend } = require('./loggingFactory');", '''
function run(text) {
  const format = text === '-' ? null : text === '<empty>' ? '' : text;
  try {
    const backend = createLoggingBackend(format);
    return backend.name + ':' + backend.write('info', 'hi');
  } catch (e) {
    return 'ERR:' + e.message;
  }
}
''')
tests["java"] = ("", '''
    static String run(String text) {
        String format = text.equals("-") ? null : text.equals("<empty>") ? "" : text;
        try {
            LogBackend backend = LoggingFactory.createLoggingBackend(format);
            return backend.name() + ":" + backend.write("info", "hi");
        } catch (IllegalArgumentException e) {
            return "ERR:" + e.getMessage();
        }
    }
''')
tests["cpp"] = ("#include <optional>", '''
static std::string run(const std::string& text) {
    std::optional<std::string> format;
    if (text == "<empty>") format = "";
    else if (text != "-") format = text;
    try {
        auto backend = createLoggingBackend(format);
        return backend->name() + ":" + backend->write("info", "hi");
    } catch (const std::invalid_argument& e) {
        return std::string("ERR:") + e.what();
    }
}
''')
emit("factory", "logging_factory", "LoggingFactory", "loggingFactory", prod, tests)


===== generator script: p_front.py =====
from gen import *
prod = {}
prod["python"] = '''
from collections import namedtuple

Endpoint = namedtuple("Endpoint", "name require_credential execute")
Response = namedtuple("Response", "status text")


class ApiController:
    def __init__(self, authenticate, limit=2):
        self._authenticate = authenticate
        self._limit = limit
        self._endpoints = {}
        self._calls = {}

    def register(self, endpoint):
        self._endpoints[endpoint.name] = endpoint

    def handle(self, name, token, body):
        endpoint = self._endpoints.get(name)
        if endpoint is None:
            return Response(404, "no such endpoint")
        user = self._authenticate(token)
        if endpoint.require_credential and user is None:
            return Response(401, "credential required")
        actor = user or "anon"
        calls = self._calls.get(actor, 0)
        if calls >= self._limit:
            return Response(429, "rate limited")
        self._calls[actor] = calls + 1
        return Response(200, endpoint.execute(body, user))
'''
prod["javascript"] = '''
class ApiController {
  constructor(authenticate, limit = 2) {
    this.authenticate = authenticate;
    this.limit = limit;
    this.endpoints = new Map();
    this.calls = new Map();
  }

  register(endpoint) { this.endpoints.set(endpoint.name, endpoint); }

  handle(name, token, body) {
    const endpoint = this.endpoints.get(name);
    if (!endpoint) return { status: 404, text: 'no such endpoint' };
    const user = this.authenticate(token);
    if (endpoint.requireCredential && user == null) return { status: 401, text: 'credential required' };
    const actor = user ?? 'anon';
    const calls = this.calls.get(actor) ?? 0;
    if (calls >= this.limit) return { status: 429, text: 'rate limited' };
    this.calls.set(actor, calls + 1);
    return { status: 200, text: endpoint.execute(body, user) };
  }
}

module.exports = { ApiController };
'''
prod["java"] = '''
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;

record Endpoint(String name, boolean requireCredential, BiFunction<String, String, String> execute) {}

record Response(int status, String text) {}

public class ApiController {
    private final Function<String, String> authenticate;
    private final int limit;
    private final Map<String, Endpoint> endpoints = new HashMap<>();
    private final Map<String, Integer> calls = new HashMap<>();

    public ApiController(Function<String, String> authenticate, int limit) {
        this.authenticate = authenticate;
        this.limit = limit;
    }

    public void register(Endpoint endpoint) {
        endpoints.put(endpoint.name(), endpoint);
    }

    public Response handle(String name, String token, String body) {
        Endpoint endpoint = endpoints.get(name);
        if (endpoint == null) return new Response(404, "no such endpoint");
        String user = authenticate.apply(token);
        if (endpoint.requireCredential() && user == null) return new Response(401, "credential required");
        String actor = user == null ? "anon" : user;
        int count = calls.getOrDefault(actor, 0);
        if (count >= limit) return new Response(429, "rate limited");
        calls.put(actor, count + 1);
        return new Response(200, endpoint.execute().apply(body, user));
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <functional>
#include <map>
#include <optional>
#include <string>

struct Endpoint {
    std::string name;
    bool requireCredential;
    std::function<std::string(const std::string& body, const std::optional<std::string>& user)> execute;
};

struct Response {
    int status;
    std::string text;
};

class ApiController {
public:
    using Authenticator = std::function<std::optional<std::string>(const std::string& token)>;

    ApiController(Authenticator authenticate, int limit = 2) : authenticate_(std::move(authenticate)), limit_(limit) {}

    void registerEndpoint(const Endpoint& endpoint) { endpoints_[endpoint.name] = endpoint; }

    Response handle(const std::string& name, const std::string& token, const std::string& body) {
        auto it = endpoints_.find(name);
        if (it == endpoints_.end()) return {404, "no such endpoint"};
        auto user = authenticate_(token);
        if (it->second.requireCredential && !user) return {401, "credential required"};
        std::string actor = user.value_or("anon");
        int& count = calls_[actor];
        if (count >= limit_) return {429, "rate limited"};
        ++count;
        return {200, it->second.execute(body, user)};
    }

private:
    Authenticator authenticate_;
    int limit_;
    std::map<std::string, Endpoint> endpoints_;
    std::map<std::string, int> calls_;
};
'''
tests = {}
tests["python"] = ("from api_controller import ApiController, Endpoint", '''
def build():
    tokens = {"t-alice": "alice", "t-bob": "bob"}
    controller = ApiController(lambda token: tokens.get(token))
    controller.register(Endpoint("ping", False, lambda body, user: "pong"))
    controller.register(Endpoint("notes/create", True, lambda body, user: "created %s by %s" % (body, user)))
    controller.register(Endpoint("i", True, lambda body, user: user))
    return controller


def run(text):
    controller = build()
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 3)
        response = controller.handle(parts[1], parts[2], parts[3] if len(parts) > 3 else "")
        out.append("%d %s" % (response.status, response.text))
    return "~".join(out)
''')
tests["javascript"] = ("const { ApiController } = require('./apiController');", '''
function build() {
  const tokens = { 't-alice': 'alice', 't-bob': 'bob' };
  const controller = new ApiController(token => tokens[token] ?? null);
  controller.register({ name: 'ping', requireCredential: false, execute: () => 'pong' });
  controller.register({ name: 'notes/create', requireCredential: true, execute: (body, user) => `created ${body} by ${user}` });
  controller.register({ name: 'i', requireCredential: true, execute: (body, user) => user });
  return controller;
}

function run(text) {
  const controller = build();
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    const response = controller.handle(parts[1], parts[2], parts.slice(3).join(' '));
    out.push(`${response.status} ${response.text}`);
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static ApiController build() {
        Map<String, String> tokens = Map.of("t-alice", "alice", "t-bob", "bob");
        ApiController controller = new ApiController(tokens::get, 2);
        controller.register(new Endpoint("ping", false, (body, user) -> "pong"));
        controller.register(new Endpoint("notes/create", true, (body, user) -> "created " + body + " by " + user));
        controller.register(new Endpoint("i", true, (body, user) -> user));
        return controller;
    }

    static String run(String text) {
        ApiController controller = build();
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 4);
            Response response = controller.handle(parts[1], parts[2], parts.length > 3 ? parts[3] : "");
            out.add(response.status() + " " + response.text());
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <optional>", '''
static ApiController build() {
    std::map<std::string, std::string> tokens = {{"t-alice", "alice"}, {"t-bob", "bob"}};
    ApiController controller([tokens](const std::string& token) -> std::optional<std::string> {
        auto it = tokens.find(token);
        if (it == tokens.end()) return std::nullopt;
        return it->second;
    });
    controller.registerEndpoint({"ping", false, [](const std::string&, const std::optional<std::string>&) { return std::string("pong"); }});
    controller.registerEndpoint({"notes/create", true, [](const std::string& body, const std::optional<std::string>& user) {
        return "created " + body + " by " + *user;
    }});
    controller.registerEndpoint({"i", true, [](const std::string&, const std::optional<std::string>& user) { return *user; }});
    return controller;
}

static std::string run(const std::string& text) {
    ApiController controller = build();
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 4);
        Response response = controller.handle(parts[1], parts[2], parts.size() > 3 ? parts[3] : "");
        out.push_back(std::to_string(response.status) + " " + response.text);
    }
    return join(out, "~");
}
''')
emit("front_controller", "api_controller", "ApiController", "apiController", prod, tests)


===== generator script: p_jobqueue.py =====
from gen import *
prod = {}
prod["python"] = '''
from collections import namedtuple

Job = namedtuple("Job", "id label to body")
JobResult = namedtuple("JobResult", "id label result attempts")


class JobQueue:
    def __init__(self, max_attempts=12):
        self._jobs = []
        self._next_id = 1
        self._max_attempts = max_attempts

    def add(self, label, to, body):
        job = Job(self._next_id, label, to, body)
        self._next_id += 1
        self._jobs.append(job)
        return job.id

    def run(self, processor):
        # The worker: takes jobs in FIFO order and retries a failing job up to max_attempts times.
        results = []
        while self._jobs:
            job = self._jobs.pop(0)
            result, attempts = None, 0
            while result is None and attempts < self._max_attempts:
                attempts += 1
                try:
                    result = processor(job)
                except RuntimeError:
                    pass
            results.append(JobResult(job.id, job.label, result or "failed", attempts))
        return results


class DeliverService:
    def __init__(self, queue):
        self._queue = queue

    def deliver(self, to, body):
        label = to.replace("https://", "").replace("/inbox", "")
        return self._queue.add(label, to, body)


class DeliverProcessor:
    def __init__(self, blocked_hosts, transport):
        self._blocked_hosts = blocked_hosts
        self._transport = transport

    def process(self, job):
        host = job.to.split("/")[2]
        if host in self._blocked_hosts:
            return "skip (blocked)"
        self._transport.send(job.to, job.body)
        return "delivered"
'''
prod["javascript"] = '''
class JobQueue {
  constructor(maxAttempts = 12) {
    this.jobs = [];
    this.nextId = 1;
    this.maxAttempts = maxAttempts;
  }

  add(label, to, body) {
    const job = { id: this.nextId++, label, to, body };
    this.jobs.push(job);
    return job.id;
  }

  // The worker: takes jobs in FIFO order and retries a failing job up to maxAttempts times.
  run(processor) {
    const results = [];
    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      let result = null;
      let attempts = 0;
      while (result === null && attempts < this.maxAttempts) {
        attempts++;
        try {
          result = processor(job);
        } catch (e) {
          // failed attempt, try again
        }
      }
      results.push({ id: job.id, label: job.label, result: result ?? 'failed', attempts });
    }
    return results;
  }
}

class DeliverService {
  constructor(queue) { this.queue = queue; }

  deliver(to, body) {
    const label = to.replace('https://', '').replace('/inbox', '');
    return this.queue.add(label, to, body);
  }
}

class DeliverProcessor {
  constructor(blockedHosts, transport) {
    this.blockedHosts = blockedHosts;
    this.transport = transport;
  }

  process(job) {
    const host = job.to.split('/')[2];
    if (this.blockedHosts.has(host)) return 'skip (blocked)';
    this.transport.send(job.to, job.body);
    return 'delivered';
  }
}

module.exports = { JobQueue, DeliverService, DeliverProcessor };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.function.Function;

record Job(int id, String label, String to, String body) {}

record JobResult(int id, String label, String result, int attempts) {}

interface Transport {
    void send(String to, String body);
}

public class JobQueue {
    private final Queue<Job> jobs = new LinkedList<>();
    private final int maxAttempts;
    private int nextId = 1;

    public JobQueue(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public int add(String label, String to, String body) {
        Job job = new Job(nextId++, label, to, body);
        jobs.add(job);
        return job.id();
    }

    /** The worker: takes jobs in FIFO order and retries a failing job up to maxAttempts times. */
    public List<JobResult> run(Function<Job, String> processor) {
        List<JobResult> results = new ArrayList<>();
        while (!jobs.isEmpty()) {
            Job job = jobs.poll();
            String result = null;
            int attempts = 0;
            while (result == null && attempts < maxAttempts) {
                attempts++;
                try {
                    result = processor.apply(job);
                } catch (RuntimeException e) {
                    // failed attempt, try again
                }
            }
            results.add(new JobResult(job.id(), job.label(), result == null ? "failed" : result, attempts));
        }
        return results;
    }
}

class DeliverService {
    private final JobQueue queue;

    DeliverService(JobQueue queue) {
        this.queue = queue;
    }

    int deliver(String to, String body) {
        String label = to.replace("https://", "").replace("/inbox", "");
        return queue.add(label, to, body);
    }
}

class DeliverProcessor {
    private final Set<String> blockedHosts;
    private final Transport transport;

    DeliverProcessor(Set<String> blockedHosts, Transport transport) {
        this.blockedHosts = blockedHosts;
        this.transport = transport;
    }

    String process(Job job) {
        String host = job.to().split("/")[2];
        if (blockedHosts.contains(host)) return "skip (blocked)";
        transport.send(job.to(), job.body());
        return "delivered";
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <deque>
#include <functional>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

struct Job {
    int id;
    std::string label;
    std::string to;
    std::string body;
};

struct JobResult {
    int id;
    std::string label;
    std::string result;
    int attempts;
};

class Transport {
public:
    virtual ~Transport() = default;
    virtual void send(const std::string& to, const std::string& body) = 0;
};

class JobQueue {
public:
    explicit JobQueue(int maxAttempts = 12) : maxAttempts_(maxAttempts) {}

    int add(const std::string& label, const std::string& to, const std::string& body) {
        jobs_.push_back({nextId_++, label, to, body});
        return jobs_.back().id;
    }

    // The worker: takes jobs in FIFO order and retries a failing job up to maxAttempts times.
    std::vector<JobResult> run(const std::function<std::string(const Job&)>& processor) {
        std::vector<JobResult> results;
        while (!jobs_.empty()) {
            Job job = jobs_.front();
            jobs_.pop_front();
            std::optional<std::string> result;
            int attempts = 0;
            while (!result && attempts < maxAttempts_) {
                ++attempts;
                try {
                    result = processor(job);
                } catch (const std::runtime_error&) {
                    // failed attempt, try again
                }
            }
            results.push_back({job.id, job.label, result.value_or("failed"), attempts});
        }
        return results;
    }

private:
    std::deque<Job> jobs_;
    int maxAttempts_;
    int nextId_ = 1;
};

class DeliverService {
public:
    explicit DeliverService(JobQueue& queue) : queue_(queue) {}

    int deliver(const std::string& to, const std::string& body) {
        std::string label = to;
        for (const std::string part : {"https://", "/inbox"}) {
            auto pos = label.find(part);
            if (pos != std::string::npos) label.erase(pos, part.size());
        }
        return queue_.add(label, to, body);
    }

private:
    JobQueue& queue_;
};

class DeliverProcessor {
public:
    DeliverProcessor(const std::set<std::string>& blockedHosts, Transport& transport)
        : blockedHosts_(blockedHosts), transport_(transport) {}

    std::string process(const Job& job) {
        size_t start = job.to.find("//") + 2;
        std::string host = job.to.substr(start, job.to.find('/', start) - start);
        if (blockedHosts_.count(host)) return "skip (blocked)";
        transport_.send(job.to, job.body);
        return "delivered";
    }

private:
    const std::set<std::string>& blockedHosts_;
    Transport& transport_;
};
'''
tests = {}
tests["python"] = ("from job_queue import JobQueue, DeliverService, DeliverProcessor", '''
class FakeTransport:
    def __init__(self):
        self.tried = set()

    def send(self, url, body):
        host = url.split("/")[2]
        if host.endswith(".down"):
            raise RuntimeError("unreachable")
        if host.endswith(".flaky") and url not in self.tried:
            self.tried.add(url)
            raise RuntimeError("timeout")


def run(text):
    queue, blocked = JobQueue(), set()
    service = DeliverService(queue)
    processor = DeliverProcessor(blocked, FakeTransport())
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 2)
        if parts[0] == "add":
            service.deliver(parts[1], parts[2])
        elif parts[0] == "block":
            blocked.add(parts[1])
        elif parts[0] == "run":
            for r in queue.run(processor.process):
                out.append("%d:%s:%s@%d" % (r.id, r.label, r.result, r.attempts))
    return "~".join(out)
''')
tests["javascript"] = ("const { JobQueue, DeliverService, DeliverProcessor } = require('./jobQueue');", '''
class FakeTransport {
  constructor() { this.tried = new Set(); }
  send(url) {
    const host = url.split('/')[2];
    if (host.endsWith('.down')) throw new Error('unreachable');
    if (host.endsWith('.flaky') && !this.tried.has(url)) {
      this.tried.add(url);
      throw new Error('timeout');
    }
  }
}

function run(text) {
  const queue = new JobQueue();
  const blocked = new Set();
  const service = new DeliverService(queue);
  const processor = new DeliverProcessor(blocked, new FakeTransport());
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'add') service.deliver(parts[1], parts.slice(2).join(' '));
    else if (parts[0] === 'block') blocked.add(parts[1]);
    else if (parts[0] === 'run') {
      for (const r of queue.run(job => processor.process(job))) out.push(`${r.id}:${r.label}:${r.result}@${r.attempts}`);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static class FakeTransport implements Transport {
        private final Set<String> tried = new HashSet<>();

        public void send(String url, String body) {
            String host = url.split("/")[2];
            if (host.endsWith(".down")) throw new RuntimeException("unreachable");
            if (host.endsWith(".flaky") && tried.add(url)) throw new RuntimeException("timeout");
        }
    }

    static String run(String text) {
        JobQueue queue = new JobQueue(12);
        Set<String> blocked = new HashSet<>();
        DeliverService service = new DeliverService(queue);
        DeliverProcessor processor = new DeliverProcessor(blocked, new FakeTransport());
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 3);
            if (parts[0].equals("add")) {
                service.deliver(parts[1], parts[2]);
            } else if (parts[0].equals("block")) {
                blocked.add(parts[1]);
            } else if (parts[0].equals("run")) {
                for (JobResult r : queue.run(processor::process)) {
                    out.add(r.id() + ":" + r.label() + ":" + r.result() + "@" + r.attempts());
                }
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <set>\n#include <stdexcept>", '''
class FakeTransport : public Transport {
public:
    void send(const std::string& url, const std::string&) override {
        size_t start = url.find("//") + 2;
        std::string host = url.substr(start, url.find('/', start) - start);
        auto endsWith = [&](const std::string& suffix) {
            return host.size() >= suffix.size() && host.compare(host.size() - suffix.size(), suffix.size(), suffix) == 0;
        };
        if (endsWith(".down")) throw std::runtime_error("unreachable");
        if (endsWith(".flaky") && tried_.insert(url).second) throw std::runtime_error("timeout");
    }

private:
    std::set<std::string> tried_;
};

static std::string run(const std::string& text) {
    JobQueue queue;
    std::set<std::string> blocked;
    FakeTransport transport;
    DeliverService service(queue);
    DeliverProcessor processor(blocked, transport);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 3);
        if (parts[0] == "add") {
            service.deliver(parts[1], parts[2]);
        } else if (parts[0] == "block") {
            blocked.insert(parts[1]);
        } else if (parts[0] == "run") {
            for (const auto& r : queue.run([&](const Job& job) { return processor.process(job); }))
                out.push_back(std::to_string(r.id) + ":" + r.label + ":" + r.result + "@" + std::to_string(r.attempts));
        }
    }
    return join(out, "~");
}
''')
emit("job_queue", "job_queue", "JobQueue", "jobQueue", prod, tests)


===== generator script: p_observer.py =====
from gen import *
prod = {}
prod["python"] = '''
from collections import namedtuple

Committed = namedtuple("Committed", "key value old_value")


class PreferencesManager:
    def __init__(self):
        self._state = {}
        self._listeners = []

    def on(self, listener):
        self._listeners.append(listener)

    def off(self, listener):
        if listener in self._listeners:
            self._listeners.remove(listener)

    def commit(self, key, value):
        old_value = self._state.get(key)
        self._state[key] = value
        event = Committed(key, value, old_value)
        for listener in list(self._listeners):
            listener(event)
'''
prod["javascript"] = '''
const { EventEmitter } = require('events');

// The subject is a plain Node EventEmitter; observers subscribe with on('committed', fn).
class PreferencesManager extends EventEmitter {
  constructor() {
    super();
    this.state = new Map();
  }

  commit(key, value) {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    this.emit('committed', { key, value, oldValue });
  }
}

module.exports = { PreferencesManager };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

record CommitEvent(String key, String value, String oldValue) {}

public class PreferencesManager {
    private final Map<String, String> state = new HashMap<>();
    private final List<Consumer<CommitEvent>> listeners = new ArrayList<>();

    public void on(Consumer<CommitEvent> listener) {
        listeners.add(listener);
    }

    public void off(Consumer<CommitEvent> listener) {
        listeners.remove(listener);
    }

    public void commit(String key, String value) {
        String oldValue = state.put(key, value);
        CommitEvent event = new CommitEvent(key, value, oldValue);
        for (Consumer<CommitEvent> listener : new ArrayList<>(listeners)) listener.accept(event);
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <functional>
#include <map>
#include <optional>
#include <string>
#include <utility>
#include <vector>

struct CommitEvent {
    std::string key;
    std::string value;
    std::optional<std::string> oldValue;
};

class PreferencesManager {
public:
    using Listener = std::function<void(const CommitEvent&)>;

    // std::function cannot be compared, so on() hands back a handle for off().
    int on(Listener listener) {
        listeners_.emplace_back(++lastHandle_, std::move(listener));
        return lastHandle_;
    }

    void off(int handle) {
        listeners_.erase(std::remove_if(listeners_.begin(), listeners_.end(),
                                        [handle](const auto& l) { return l.first == handle; }),
                         listeners_.end());
    }

    void commit(const std::string& key, const std::string& value) {
        std::optional<std::string> oldValue;
        if (auto it = state_.find(key); it != state_.end()) oldValue = it->second;
        state_[key] = value;
        CommitEvent event{key, value, oldValue};
        auto snapshot = listeners_;
        for (const auto& [handle, listener] : snapshot) listener(event);
    }

private:
    int lastHandle_ = 0;
    std::map<std::string, std::string> state_;
    std::vector<std::pair<int, Listener>> listeners_;
};
'''
tests = {}
tests["python"] = ("from preferences_manager import PreferencesManager", '''
def run(text):
    manager = PreferencesManager()
    out, listeners = [], {}

    def make(name):
        def listener(event):
            if name == "boom":
                raise RuntimeError("listener failed")
            old = "none" if event.old_value is None else event.old_value
            out.append("%s:%s=%s(was %s)" % (name, event.key, event.value, old))
        return listener

    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "on":
                listeners[parts[1]] = make(parts[1])
                manager.on(listeners[parts[1]])
            elif parts[0] == "off":
                manager.off(listeners.get(parts[1]))
            elif parts[0] == "commit":
                manager.commit(parts[1], parts[2])
        except RuntimeError as e:
            out.append("ERR:" + str(e))
    return "~".join(out)
''')
tests["javascript"] = ("const { PreferencesManager } = require('./preferencesManager');", '''
function run(text) {
  const manager = new PreferencesManager();
  const out = [];
  const listeners = {};
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'on') {
        const name = parts[1];
        listeners[name] = (event) => {
          if (name === 'boom') throw new Error('listener failed');
          out.push(`${name}:${event.key}=${event.value}(was ${event.oldValue ?? 'none'})`);
        };
        manager.on('committed', listeners[name]);
      } else if (parts[0] === 'off') {
        manager.off('committed', listeners[parts[1]] ?? (() => {})); // EventEmitter rejects undefined, so pass a function that was never registered
      } else if (parts[0] === 'commit') {
        manager.commit(parts[1], parts[2]);
      }
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("import java.util.function.Consumer;", '''
    static String run(String text) {
        PreferencesManager manager = new PreferencesManager();
        List<String> out = new ArrayList<>();
        Map<String, Consumer<CommitEvent>> listeners = new HashMap<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("on")) {
                    String name = parts[1];
                    listeners.put(name, event -> {
                        if (name.equals("boom")) throw new IllegalStateException("listener failed");
                        String old = event.oldValue() == null ? "none" : event.oldValue();
                        out.add(name + ":" + event.key() + "=" + event.value() + "(was " + old + ")");
                    });
                    manager.on(listeners.get(name));
                } else if (parts[0].equals("off")) {
                    manager.off(listeners.get(parts[1]));
                } else if (parts[0].equals("commit")) {
                    manager.commit(parts[1], parts[2]);
                }
            } catch (IllegalStateException e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <stdexcept>", '''
static std::string run(const std::string& text) {
    PreferencesManager manager;
    std::vector<std::string> out;
    std::map<std::string, int> handles;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "on") {
                std::string name = parts[1];
                handles[name] = manager.on([name, &out](const CommitEvent& event) {
                    if (name == "boom") throw std::runtime_error("listener failed");
                    out.push_back(name + ":" + event.key + "=" + event.value + "(was " +
                                  event.oldValue.value_or("none") + ")");
                });
            } else if (parts[0] == "off") {
                auto it = handles.find(parts[1]);
                if (it != handles.end()) manager.off(it->second);
            } else if (parts[0] == "commit") {
                manager.commit(parts[1], parts[2]);
            }
        } catch (const std::runtime_error& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
}
''')
emit("observer", "preferences_manager", "PreferencesManager", "preferencesManager", prod, tests)


===== generator script: p_plugin.py =====
from gen import *
prod = {}
prod["python"] = '''
class PluginHost:
    def __init__(self):
        self._contexts = set()
        self._handlers = []  # (plugin id, handler type, function)

    def install(self, plugin_id, setup):
        self._contexts.add(plugin_id)

        def add_handler(handler_type, fn):
            self._handlers.append((plugin_id, handler_type, fn))

        setup(add_handler)  # an error here propagates; handlers added so far stay registered

    def abort(self, plugin_id):
        if plugin_id not in self._contexts:
            return
        self._contexts.discard(plugin_id)
        self._handlers = [h for h in self._handlers if h[0] != plugin_id]

    def get_handlers(self, handler_type):
        return [fn for _, t, fn in self._handlers if t == handler_type]
'''
prod["javascript"] = '''
class PluginHost {
  constructor() {
    this.contexts = new Set();
    this.handlers = []; // { pluginId, type, fn }
  }

  install(pluginId, setup) {
    this.contexts.add(pluginId);
    const addHandler = (type, fn) => this.handlers.push({ pluginId, type, fn });
    setup(addHandler); // an error here propagates; handlers added so far stay registered
  }

  abort(pluginId) {
    if (!this.contexts.delete(pluginId)) return;
    this.handlers = this.handlers.filter(h => h.pluginId !== pluginId);
  }

  getHandlers(type) {
    return this.handlers.filter(h => h.type === type).map(h => h.fn);
  }
}

module.exports = { PluginHost };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;

interface HandlerRegistrar {
    void addHandler(String type, Function<String, String> fn);
}

public class PluginHost {
    private record Handler(String pluginId, String type, Function<String, String> fn) {}

    private final Set<String> contexts = new HashSet<>();
    private final List<Handler> handlers = new ArrayList<>();

    public void install(String pluginId, Consumer<HandlerRegistrar> setup) {
        contexts.add(pluginId);
        // an error from setup propagates; handlers added so far stay registered
        setup.accept((type, fn) -> handlers.add(new Handler(pluginId, type, fn)));
    }

    public void abort(String pluginId) {
        if (!contexts.remove(pluginId)) return;
        handlers.removeIf(h -> h.pluginId().equals(pluginId));
    }

    public List<Function<String, String>> getHandlers(String type) {
        List<Function<String, String>> result = new ArrayList<>();
        for (Handler h : handlers) if (h.type().equals(type)) result.add(h.fn());
        return result;
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <functional>
#include <set>
#include <string>
#include <vector>

class PluginHost {
public:
    using Handler = std::function<std::string(const std::string&)>;
    using Registrar = std::function<void(const std::string& type, Handler fn)>;

    void install(const std::string& pluginId, const std::function<void(const Registrar&)>& setup) {
        contexts_.insert(pluginId);
        // an exception from setup propagates; handlers added so far stay registered
        setup([this, pluginId](const std::string& type, Handler fn) {
            handlers_.push_back({pluginId, type, std::move(fn)});
        });
    }

    void abort(const std::string& pluginId) {
        if (contexts_.erase(pluginId) == 0) return;
        handlers_.erase(std::remove_if(handlers_.begin(), handlers_.end(),
                                       [&](const Entry& e) { return e.pluginId == pluginId; }),
                        handlers_.end());
    }

    std::vector<Handler> getHandlers(const std::string& type) const {
        std::vector<Handler> result;
        for (const auto& e : handlers_) if (e.type == type) result.push_back(e.fn);
        return result;
    }

private:
    struct Entry {
        std::string pluginId;
        std::string type;
        Handler fn;
    };

    std::set<std::string> contexts_;
    std::vector<Entry> handlers_;
};
'''
tests = {}
tests["python"] = ("from plugin_host import PluginHost", '''
def plugin_setup(name):
    def setup(add_handler):
        if name == "upper":
            add_handler("note_view_interruptor", lambda t: t.upper())
        elif name == "exclaim":
            add_handler("note_view_interruptor", lambda t: t + "!")
        elif name == "share":
            add_handler("note_action", lambda t: "Share")
        elif name == "bad":
            add_handler("note_view_interruptor", lambda t: t + "?")
            raise RuntimeError("boom")
    return setup


def run(text):
    host, out = PluginHost(), []
    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "install":
                host.install(parts[1], plugin_setup(parts[1]))
            elif parts[0] == "abort":
                host.abort(parts[1])
            elif parts[0] == "view":
                value = parts[1]
                for fn in host.get_handlers("note_view_interruptor"):
                    value = fn(value)
                out.append(value)
            elif parts[0] == "actions":
                out.append(",".join(fn("") for fn in host.get_handlers("note_action")))
        except RuntimeError as e:
            out.append("ERR:" + str(e))
    return "~".join(out)
''')
tests["javascript"] = ("const { PluginHost } = require('./pluginHost');", '''
function pluginSetup(name) {
  return (addHandler) => {
    if (name === 'upper') addHandler('note_view_interruptor', t => t.toUpperCase());
    else if (name === 'exclaim') addHandler('note_view_interruptor', t => t + '!');
    else if (name === 'share') addHandler('note_action', () => 'Share');
    else if (name === 'bad') {
      addHandler('note_view_interruptor', t => t + '?');
      throw new Error('boom');
    }
  };
}

function run(text) {
  const host = new PluginHost();
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'install') {
        host.install(parts[1], pluginSetup(parts[1]));
      } else if (parts[0] === 'abort') {
        host.abort(parts[1]);
      } else if (parts[0] === 'view') {
        out.push(host.getHandlers('note_view_interruptor').reduce((value, fn) => fn(value), parts[1]));
      } else if (parts[0] === 'actions') {
        out.push(host.getHandlers('note_action').map(fn => fn('')).join(','));
      }
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("import java.util.function.Consumer;\nimport java.util.function.Function;", '''
    static Consumer<HandlerRegistrar> pluginSetup(String name) {
        return registrar -> {
            if (name.equals("upper")) registrar.addHandler("note_view_interruptor", t -> t.toUpperCase());
            else if (name.equals("exclaim")) registrar.addHandler("note_view_interruptor", t -> t + "!");
            else if (name.equals("share")) registrar.addHandler("note_action", t -> "Share");
            else if (name.equals("bad")) {
                registrar.addHandler("note_view_interruptor", t -> t + "?");
                throw new IllegalStateException("boom");
            }
        };
    }

    static String run(String text) {
        PluginHost host = new PluginHost();
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("install")) {
                    host.install(parts[1], pluginSetup(parts[1]));
                } else if (parts[0].equals("abort")) {
                    host.abort(parts[1]);
                } else if (parts[0].equals("view")) {
                    String value = parts[1];
                    for (Function<String, String> fn : host.getHandlers("note_view_interruptor")) value = fn.apply(value);
                    out.add(value);
                } else if (parts[0].equals("actions")) {
                    List<String> labels = new ArrayList<>();
                    for (Function<String, String> fn : host.getHandlers("note_action")) labels.add(fn.apply(""));
                    out.add(String.join(",", labels));
                }
            } catch (IllegalStateException e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <algorithm>\n#include <cctype>\n#include <stdexcept>", '''
static std::function<void(const PluginHost::Registrar&)> pluginSetup(const std::string& name) {
    return [name](const PluginHost::Registrar& addHandler) {
        if (name == "upper") {
            addHandler("note_view_interruptor", [](const std::string& t) {
                std::string s = t;
                std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) { return std::toupper(c); });
                return s;
            });
        } else if (name == "exclaim") {
            addHandler("note_view_interruptor", [](const std::string& t) { return t + "!"; });
        } else if (name == "share") {
            addHandler("note_action", [](const std::string&) { return std::string("Share"); });
        } else if (name == "bad") {
            addHandler("note_view_interruptor", [](const std::string& t) { return t + "?"; });
            throw std::runtime_error("boom");
        }
    };
}

static std::string run(const std::string& text) {
    PluginHost host;
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "install") {
                host.install(parts[1], pluginSetup(parts[1]));
            } else if (parts[0] == "abort") {
                host.abort(parts[1]);
            } else if (parts[0] == "view") {
                std::string value = parts[1];
                for (const auto& fn : host.getHandlers("note_view_interruptor")) value = fn(value);
                out.push_back(value);
            } else if (parts[0] == "actions") {
                std::vector<std::string> labels;
                for (const auto& fn : host.getHandlers("note_action")) labels.push_back(fn(""));
                out.push_back(join(labels, ","));
            }
        } catch (const std::runtime_error& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
}
''')
emit("plugin_architecture", "plugin_host", "PluginHost", "pluginHost", prod, tests)


===== generator script: p_proxy.py =====
from gen import *
prod = {}
prod["python"] = '''
from abc import ABC, abstractmethod

NOOP = "noop"


class AnalyticsInstance(ABC):
    @abstractmethod
    def track(self, event): ...

    @abstractmethod
    def page(self, name): ...

    @abstractmethod
    def identify(self, user): ...


class RealAnalytics(AnalyticsInstance):
    def track(self, event):
        return "real:track " + event

    def page(self, name):
        return "real:page " + name

    def identify(self, user):
        return "real:identify " + user


class AnalyticsProxy(AnalyticsInstance):
    def __init__(self, analytics=None):
        self._analytics = analytics

    def set_analytics(self, analytics):
        if self._analytics is not None:
            raise RuntimeError("Analytics instance already exists.")
        self._analytics = analytics

    def track(self, event):
        return NOOP if self._analytics is None else self._analytics.track(event)

    def page(self, name):
        return NOOP if self._analytics is None else self._analytics.page(name)

    def identify(self, user):
        return NOOP if self._analytics is None else self._analytics.identify(user)
'''
prod["javascript"] = '''
const NOOP = 'noop';

class RealAnalytics {
  track(event) { return 'real:track ' + event; }
  page(name) { return 'real:page ' + name; }
  identify(user) { return 'real:identify ' + user; }
}

class AnalyticsProxy {
  constructor(analytics) { this.analytics = analytics ?? null; }

  setAnalytics(analytics) {
    if (this.analytics) throw new Error('Analytics instance already exists.');
    this.analytics = analytics;
  }

  track(event) { return this.analytics?.track(event) ?? NOOP; }
  page(name) { return this.analytics?.page(name) ?? NOOP; }
  identify(user) { return this.analytics?.identify(user) ?? NOOP; }
}

module.exports = { AnalyticsProxy, RealAnalytics };
'''
prod["java"] = '''
interface AnalyticsInstance {
    String track(String event);
    String page(String name);
    String identify(String user);
}

class RealAnalytics implements AnalyticsInstance {
    public String track(String event) { return "real:track " + event; }

    public String page(String name) { return "real:page " + name; }

    public String identify(String user) { return "real:identify " + user; }
}

public class AnalyticsProxy implements AnalyticsInstance {
    private static final String NOOP = "noop";
    private AnalyticsInstance analytics;

    public AnalyticsProxy() {}

    public void setAnalytics(AnalyticsInstance analytics) {
        if (this.analytics != null) throw new IllegalStateException("Analytics instance already exists.");
        this.analytics = analytics;
    }

    public String track(String event) {
        return analytics == null ? NOOP : analytics.track(event);
    }

    public String page(String name) {
        return analytics == null ? NOOP : analytics.page(name);
    }

    public String identify(String user) {
        return analytics == null ? NOOP : analytics.identify(user);
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <memory>
#include <stdexcept>
#include <string>

class AnalyticsInstance {
public:
    virtual ~AnalyticsInstance() = default;
    virtual std::string track(const std::string& event) = 0;
    virtual std::string page(const std::string& name) = 0;
    virtual std::string identify(const std::string& user) = 0;
};

class RealAnalytics : public AnalyticsInstance {
public:
    std::string track(const std::string& event) override { return "real:track " + event; }
    std::string page(const std::string& name) override { return "real:page " + name; }
    std::string identify(const std::string& user) override { return "real:identify " + user; }
};

class AnalyticsProxy : public AnalyticsInstance {
public:
    void setAnalytics(std::unique_ptr<AnalyticsInstance> analytics) {
        if (analytics_) throw std::runtime_error("Analytics instance already exists.");
        analytics_ = std::move(analytics);
    }

    std::string track(const std::string& event) override { return analytics_ ? analytics_->track(event) : "noop"; }
    std::string page(const std::string& name) override { return analytics_ ? analytics_->page(name) : "noop"; }
    std::string identify(const std::string& user) override { return analytics_ ? analytics_->identify(user) : "noop"; }

private:
    std::unique_ptr<AnalyticsInstance> analytics_;
};
'''
tests = {}
tests["python"] = ("from analytics_proxy import AnalyticsProxy, RealAnalytics", '''
def run(text):
    proxy = AnalyticsProxy()
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 1)
        try:
            if parts[0] == "set":
                proxy.set_analytics(RealAnalytics())
            else:
                out.append(getattr(proxy, parts[0])(parts[1]))
        except RuntimeError as e:
            out.append("ERR:" + str(e))
    return "~".join(out)
''')
tests["javascript"] = ("const { AnalyticsProxy, RealAnalytics } = require('./analyticsProxy');", '''
function run(text) {
  const proxy = new AnalyticsProxy();
  const out = [];
  for (const command of text.split(';')) {
    const [verb, arg] = command.split(' ');
    try {
      if (verb === 'set') proxy.setAnalytics(new RealAnalytics());
      else out.push(proxy[verb](arg));
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static String run(String text) {
        AnalyticsProxy proxy = new AnalyticsProxy();
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 2);
            try {
                switch (parts[0]) {
                    case "set" -> proxy.setAnalytics(new RealAnalytics());
                    case "track" -> out.add(proxy.track(parts[1]));
                    case "page" -> out.add(proxy.page(parts[1]));
                    default -> out.add(proxy.identify(parts[1]));
                }
            } catch (IllegalStateException e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <memory>\n#include <stdexcept>", '''
static std::string run(const std::string& text) {
    AnalyticsProxy proxy;
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 2);
        try {
            if (parts[0] == "set") proxy.setAnalytics(std::make_unique<RealAnalytics>());
            else if (parts[0] == "track") out.push_back(proxy.track(parts[1]));
            else if (parts[0] == "page") out.push_back(proxy.page(parts[1]));
            else out.push_back(proxy.identify(parts[1]));
        } catch (const std::runtime_error& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
}
''')
emit("proxy", "analytics_proxy", "AnalyticsProxy", "analyticsProxy", prod, tests)


===== generator script: p_pubsub.py =====
from gen import *
prod = {}
prod["python"] = '''
import json


class Broker:
    """Stands in for Redis plus the per-connection channel emitters."""

    def __init__(self):
        self._subscribers = {}

    def subscribe(self, channel, handler):
        self._subscribers.setdefault(channel, []).append(handler)

    def unsubscribe(self, channel, handler):
        handlers = self._subscribers.get(channel, [])
        if handler in handlers:
            handlers.remove(handler)

    def publish(self, channel, message):
        handlers = list(self._subscribers.get(channel, []))
        for handler in handlers:
            handler(channel, message)
        return len(handlers)


class GlobalEventService:
    def __init__(self, broker):
        self._broker = broker

    def publish_main_stream(self, user_id, event_type, body):
        return self._publish("mainStream:" + user_id, event_type, body)

    def publish_broadcast_stream(self, event_type, body):
        return self._publish("broadcast", event_type, body)

    def _publish(self, channel, event_type, body):
        message = json.dumps({"type": event_type, "body": body}, separators=(",", ":"))
        return self._broker.publish(channel, message)
'''
prod["javascript"] = '''
// Stands in for Redis plus the per-connection channel emitters.
class Broker {
  constructor() { this.subscribers = new Map(); }

  subscribe(channel, handler) {
    if (!this.subscribers.has(channel)) this.subscribers.set(channel, []);
    this.subscribers.get(channel).push(handler);
  }

  unsubscribe(channel, handler) {
    const handlers = this.subscribers.get(channel) ?? [];
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  }

  publish(channel, message) {
    const handlers = [...(this.subscribers.get(channel) ?? [])];
    for (const handler of handlers) handler(channel, message);
    return handlers.length;
  }
}

class GlobalEventService {
  constructor(broker) { this.broker = broker; }

  publishMainStream(userId, type, body) { return this.publish('mainStream:' + userId, type, body); }

  publishBroadcastStream(type, body) { return this.publish('broadcast', type, body); }

  publish(channel, type, body) {
    return this.broker.publish(channel, JSON.stringify({ type, body }));
  }
}

module.exports = { Broker, GlobalEventService };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;

/** Stands in for Redis plus the per-connection channel emitters. */
class Broker {
    private final Map<String, List<BiConsumer<String, String>>> subscribers = new HashMap<>();

    void subscribe(String channel, BiConsumer<String, String> handler) {
        subscribers.computeIfAbsent(channel, c -> new ArrayList<>()).add(handler);
    }

    void unsubscribe(String channel, BiConsumer<String, String> handler) {
        List<BiConsumer<String, String>> handlers = subscribers.get(channel);
        if (handlers != null) handlers.remove(handler);
    }

    int publish(String channel, String message) {
        List<BiConsumer<String, String>> handlers = new ArrayList<>(subscribers.getOrDefault(channel, List.of()));
        for (BiConsumer<String, String> handler : handlers) handler.accept(channel, message);
        return handlers.size();
    }
}

public class GlobalEventService {
    private final Broker broker;

    public GlobalEventService(Broker broker) {
        this.broker = broker;
    }

    public int publishMainStream(String userId, String type, String body) {
        return publish("mainStream:" + userId, type, body);
    }

    public int publishBroadcastStream(String type, String body) {
        return publish("broadcast", type, body);
    }

    private int publish(String channel, String type, String body) {
        return broker.publish(channel, "{\\"type\\":\\"" + type + "\\",\\"body\\":\\"" + body + "\\"}");
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <functional>
#include <map>
#include <string>
#include <utility>
#include <vector>

// Stands in for Redis plus the per-connection channel emitters.
class Broker {
public:
    using Handler = std::function<void(const std::string& channel, const std::string& message)>;

    // std::function cannot be compared, so subscribe() returns a token for unsubscribe().
    int subscribe(const std::string& channel, Handler handler) {
        subscribers_[channel].emplace_back(++lastToken_, std::move(handler));
        return lastToken_;
    }

    void unsubscribe(const std::string& channel, int token) {
        auto& handlers = subscribers_[channel];
        handlers.erase(std::remove_if(handlers.begin(), handlers.end(),
                                      [token](const auto& h) { return h.first == token; }),
                       handlers.end());
    }

    int publish(const std::string& channel, const std::string& message) {
        auto handlers = subscribers_[channel];
        for (const auto& [token, handler] : handlers) handler(channel, message);
        return static_cast<int>(handlers.size());
    }

private:
    int lastToken_ = 0;
    std::map<std::string, std::vector<std::pair<int, Handler>>> subscribers_;
};

class GlobalEventService {
public:
    explicit GlobalEventService(Broker& broker) : broker_(broker) {}

    int publishMainStream(const std::string& userId, const std::string& type, const std::string& body) {
        return publish("mainStream:" + userId, type, body);
    }

    int publishBroadcastStream(const std::string& type, const std::string& body) {
        return publish("broadcast", type, body);
    }

private:
    int publish(const std::string& channel, const std::string& type, const std::string& body) {
        return broker_.publish(channel, "{\\"type\\":\\"" + type + "\\",\\"body\\":\\"" + body + "\\"}");
    }

    Broker& broker_;
};
'''
tests = {}
tests["python"] = ("from event_bus import Broker, GlobalEventService", '''
def run(text):
    broker = Broker()
    events = GlobalEventService(broker)
    out, handlers = [], {}

    def handler_for(name):
        return lambda channel, message: out.append("%s<-%s:%s" % (name, channel, message))

    for command in text.split(";"):
        parts = command.split(" ", 3)
        if parts[0] == "sub":
            handler = handlers.setdefault((parts[1], parts[2]), handler_for(parts[1]))
            broker.subscribe(parts[2], handler)
        elif parts[0] == "unsub":
            broker.unsubscribe(parts[2], handlers[(parts[1], parts[2])])
        elif parts[0] == "main":
            if events.publish_main_stream(parts[1], parts[2], parts[3]) == 0:
                out.append("dropped:mainStream:" + parts[1])
        elif parts[0] == "broadcast":
            if events.publish_broadcast_stream(parts[1], parts[2]) == 0:
                out.append("dropped:broadcast")
    return "~".join(out)
''')
tests["javascript"] = ("const { Broker, GlobalEventService } = require('./eventBus');", '''
function run(text) {
  const broker = new Broker();
  const events = new GlobalEventService(broker);
  const out = [];
  const handlers = new Map();
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    const rest = (n) => parts.slice(n).join(' ');
    if (parts[0] === 'sub') {
      const key = parts[1] + ' ' + parts[2];
      if (!handlers.has(key)) handlers.set(key, (channel, message) => out.push(`${parts[1]}<-${channel}:${message}`));
      broker.subscribe(parts[2], handlers.get(key));
    } else if (parts[0] === 'unsub') {
      broker.unsubscribe(parts[2], handlers.get(parts[1] + ' ' + parts[2]));
    } else if (parts[0] === 'main') {
      if (events.publishMainStream(parts[1], parts[2], rest(3)) === 0) out.push('dropped:mainStream:' + parts[1]);
    } else if (parts[0] === 'broadcast') {
      if (events.publishBroadcastStream(parts[1], rest(2)) === 0) out.push('dropped:broadcast');
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("import java.util.function.BiConsumer;", '''
    static String run(String text) {
        Broker broker = new Broker();
        GlobalEventService events = new GlobalEventService(broker);
        List<String> out = new ArrayList<>();
        Map<String, BiConsumer<String, String>> handlers = new HashMap<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 4);
            if (parts[0].equals("sub")) {
                String name = parts[1];
                BiConsumer<String, String> handler = handlers.computeIfAbsent(name + " " + parts[2],
                        k -> (channel, message) -> out.add(name + "<-" + channel + ":" + message));
                broker.subscribe(parts[2], handler);
            } else if (parts[0].equals("unsub")) {
                broker.unsubscribe(parts[2], handlers.get(parts[1] + " " + parts[2]));
            } else if (parts[0].equals("main")) {
                if (events.publishMainStream(parts[1], parts[2], parts[3]) == 0) out.add("dropped:mainStream:" + parts[1]);
            } else if (parts[0].equals("broadcast")) {
                String body = command.split(" ", 3)[2];
                if (events.publishBroadcastStream(parts[1], body) == 0) out.add("dropped:broadcast");
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>", '''
static std::string run(const std::string& text) {
    Broker broker;
    GlobalEventService events(broker);
    std::vector<std::string> out;
    std::map<std::string, int> tokens;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 4);
        if (parts[0] == "sub") {
            std::string name = parts[1];
            tokens[name + " " + parts[2]] = broker.subscribe(parts[2], [name, &out](const std::string& channel, const std::string& message) {
                out.push_back(name + "<-" + channel + ":" + message);
            });
        } else if (parts[0] == "unsub") {
            broker.unsubscribe(parts[2], tokens[parts[1] + " " + parts[2]]);
        } else if (parts[0] == "main") {
            if (events.publishMainStream(parts[1], parts[2], parts[3]) == 0) out.push_back("dropped:mainStream:" + parts[1]);
        } else if (parts[0] == "broadcast") {
            auto three = splitN(command, ' ', 3);
            if (events.publishBroadcastStream(three[1], three[2]) == 0) out.push_back("dropped:broadcast");
        }
    }
    return join(out, "~");
}
''')
emit("publish_subscribe", "event_bus", "GlobalEventService", "eventBus", prod, tests)


===== generator script: p_repo.py =====
from gen import *
prod = {}
prod["python"] = '''
class EntityNotFound(Exception):
    def __init__(self):
        super().__init__("EntityNotFound")


class InMemoryRepository:
    """Stands in for TypeORM's Repository<T>: the persistence side."""

    def __init__(self):
        self._rows = []
        self._last_id = 0

    def insert(self, entity):
        self._last_id += 1
        self._rows.append(dict(entity, id=str(self._last_id)))
        return {"id": str(self._last_id)}

    def find_one_by(self, criteria):
        for row in self._rows:
            if all(row.get(k) == v for k, v in criteria.items()):
                return row
        return None

    def find_one_or_fail(self, criteria):
        row = self.find_one_by(criteria)
        if row is None:
            raise EntityNotFound()
        return row

    def count(self):
        return len(self._rows)


class MiRepository:
    """Misskey's extension: insert, then read the stored row back (miRepository.insertOne)."""

    def insert_one(self, entity):
        identifiers = self.insert(entity)
        return self.find_one_or_fail(identifiers)


class UsersRepository(MiRepository, InMemoryRepository):
    pass


class UserService:
    def __init__(self, users_repository):
        self._users = users_repository

    def register(self, name):
        return self._users.insert_one({"name": name})

    def find_by_name(self, name):
        return self._users.find_one_by({"name": name})

    def get_by_name(self, name):
        return self._users.find_one_or_fail({"name": name})

    def count(self):
        return self._users.count()
'''
prod["javascript"] = '''
class EntityNotFound extends Error {
  constructor() { super('EntityNotFound'); }
}

// Stands in for TypeORM's Repository<T>: the persistence side.
class InMemoryRepository {
  constructor() {
    this.rows = [];
    this.lastId = 0;
  }

  insert(entity) {
    this.lastId++;
    this.rows.push({ ...entity, id: String(this.lastId) });
    return { id: String(this.lastId) };
  }

  findOneBy(criteria) {
    return this.rows.find(row => Object.entries(criteria).every(([k, v]) => row[k] === v)) ?? null;
  }

  findOneOrFail(criteria) {
    const row = this.findOneBy(criteria);
    if (row === null) throw new EntityNotFound();
    return row;
  }

  count() { return this.rows.length; }
}

// Misskey's extension: insert, then read the stored row back (miRepository.insertOne).
const miRepository = {
  insertOne(entity) {
    const identifiers = this.insert(entity);
    return this.findOneOrFail(identifiers);
  },
};

// Like db.getRepository(...).extend(miRepository) in the source.
function extend(repository, extension) {
  return Object.assign(repository, extension);
}

class UserService {
  constructor(usersRepository) { this.users = usersRepository; }
  register(name) { return this.users.insertOne({ name }); }
  findByName(name) { return this.users.findOneBy({ name }); }
  getByName(name) { return this.users.findOneOrFail({ name }); }
  count() { return this.users.count(); }
}

module.exports = { InMemoryRepository, miRepository, extend, UserService };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class EntityNotFound extends RuntimeException {
    EntityNotFound() {
        super("EntityNotFound");
    }
}

/** Misskey's extension: insert, then read the stored row back (miRepository.insertOne). */
interface MiRepository {
    Map<String, String> insert(Map<String, String> entity);

    Map<String, String> findOneOrFail(Map<String, String> criteria);

    default Map<String, String> insertOne(Map<String, String> entity) {
        Map<String, String> identifiers = insert(entity);
        return findOneOrFail(identifiers);
    }
}

/** Stands in for TypeORM's Repository<T>: the persistence side. */
public class InMemoryRepository {
    private final List<Map<String, String>> rows = new ArrayList<>();
    private int lastId = 0;

    public Map<String, String> insert(Map<String, String> entity) {
        Map<String, String> row = new HashMap<>(entity);
        row.put("id", String.valueOf(++lastId));
        rows.add(row);
        return Map.of("id", row.get("id"));
    }

    public Map<String, String> findOneBy(Map<String, String> criteria) {
        for (Map<String, String> row : rows) {
            if (criteria.entrySet().stream().allMatch(e -> e.getValue().equals(row.get(e.getKey())))) return row;
        }
        return null;
    }

    public Map<String, String> findOneOrFail(Map<String, String> criteria) {
        Map<String, String> row = findOneBy(criteria);
        if (row == null) throw new EntityNotFound();
        return row;
    }

    public int count() {
        return rows.size();
    }
}

class UsersRepository extends InMemoryRepository implements MiRepository {}

class UserService {
    private final UsersRepository users;

    UserService(UsersRepository users) {
        this.users = users;
    }

    Map<String, String> register(String name) { return users.insertOne(Map.of("name", name)); }

    Map<String, String> findByName(String name) { return users.findOneBy(Map.of("name", name)); }

    Map<String, String> getByName(String name) { return users.findOneOrFail(Map.of("name", name)); }

    int count() { return users.count(); }
}
'''
prod["cpp"] = '''
#pragma once
#include <map>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

using Entity = std::map<std::string, std::string>;

class EntityNotFound : public std::runtime_error {
public:
    EntityNotFound() : std::runtime_error("EntityNotFound") {}
};

// Stands in for TypeORM's Repository<T>: the persistence side.
class InMemoryRepository {
public:
    Entity insert(const Entity& entity) {
        Entity row = entity;
        row["id"] = std::to_string(++lastId_);
        rows_.push_back(row);
        return {{"id", row["id"]}};
    }

    std::optional<Entity> findOneBy(const Entity& criteria) const {
        for (const auto& row : rows_) {
            bool matches = true;
            for (const auto& [key, value] : criteria) {
                auto it = row.find(key);
                matches = matches && it != row.end() && it->second == value;
            }
            if (matches) return row;
        }
        return std::nullopt;
    }

    Entity findOneOrFail(const Entity& criteria) const {
        auto row = findOneBy(criteria);
        if (!row) throw EntityNotFound();
        return *row;
    }

    size_t count() const { return rows_.size(); }

private:
    std::vector<Entity> rows_;
    int lastId_ = 0;
};

// Misskey's extension, mixed into any repository: insert, then read the stored row back.
template <class Base>
class MiRepository : public Base {
public:
    Entity insertOne(const Entity& entity) {
        Entity identifiers = this->insert(entity);
        return this->findOneOrFail(identifiers);
    }
};

using UsersRepository = MiRepository<InMemoryRepository>;

class UserService {
public:
    explicit UserService(UsersRepository& users) : users_(users) {}

    Entity registerUser(const std::string& name) { return users_.insertOne({{"name", name}}); }
    std::optional<Entity> findByName(const std::string& name) const { return users_.findOneBy({{"name", name}}); }
    Entity getByName(const std::string& name) const { return users_.findOneOrFail({{"name", name}}); }
    size_t count() const { return users_.count(); }

private:
    UsersRepository& users_;
};
'''
tests = {}
tests["python"] = ("from repository import UsersRepository, UserService, EntityNotFound", '''
def show(entity):
    return "{" + ",".join("%s=%s" % (k, entity[k]) for k in sorted(entity)) + "}"


def run(text):
    service = UserService(UsersRepository())
    out = []
    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "insert":
                out.append(show(service.register(parts[1])))
            elif parts[0] == "find":
                found = service.find_by_name(parts[1])
                out.append("none" if found is None else show(found))
            elif parts[0] == "findorfail":
                out.append(show(service.get_by_name(parts[1])))
            elif parts[0] == "count":
                out.append(str(service.count()))
        except EntityNotFound as e:
            out.append("ERR:" + str(e))
    return "~".join(out)
''')
tests["javascript"] = ("const { InMemoryRepository, miRepository, extend, UserService } = require('./repository');", '''
function show(entity) {
  return '{' + Object.keys(entity).sort().map(k => `${k}=${entity[k]}`).join(',') + '}';
}

function run(text) {
  const service = new UserService(extend(new InMemoryRepository(), miRepository));
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'insert') out.push(show(service.register(parts[1])));
      else if (parts[0] === 'find') {
        const found = service.findByName(parts[1]);
        out.push(found === null ? 'none' : show(found));
      } else if (parts[0] === 'findorfail') out.push(show(service.getByName(parts[1])));
      else if (parts[0] === 'count') out.push(String(service.count()));
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static String show(Map<String, String> entity) {
        List<String> fields = new ArrayList<>();
        for (String key : new TreeSet<>(entity.keySet())) fields.add(key + "=" + entity.get(key));
        return "{" + String.join(",", fields) + "}";
    }

    static String run(String text) {
        UserService service = new UserService(new UsersRepository());
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            try {
                if (parts[0].equals("insert")) {
                    out.add(show(service.register(parts[1])));
                } else if (parts[0].equals("find")) {
                    Map<String, String> found = service.findByName(parts[1]);
                    out.add(found == null ? "none" : show(found));
                } else if (parts[0].equals("findorfail")) {
                    out.add(show(service.getByName(parts[1])));
                } else if (parts[0].equals("count")) {
                    out.add(String.valueOf(service.count()));
                }
            } catch (EntityNotFound e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <optional>", '''
static std::string show(const Entity& entity) {
    std::vector<std::string> fields;
    for (const auto& [key, value] : entity) fields.push_back(key + "=" + value);
    return "{" + join(fields, ",") + "}";
}

static std::string run(const std::string& text) {
    UsersRepository repository;
    UserService service(repository);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        try {
            if (parts[0] == "insert") {
                out.push_back(show(service.registerUser(parts[1])));
            } else if (parts[0] == "find") {
                auto found = service.findByName(parts[1]);
                out.push_back(found ? show(*found) : "none");
            } else if (parts[0] == "findorfail") {
                out.push_back(show(service.getByName(parts[1])));
            } else if (parts[0] == "count") {
                out.push_back(std::to_string(service.count()));
            }
        } catch (const EntityNotFound& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
}
''')
emit("repository", "repository", "InMemoryRepository", "repository", prod, tests)


===== generator script: p_router.py =====
from gen import *
prod = {}
prod["python"] = '''
from collections import namedtuple

Route = namedtuple("Route", "path component login_required")
Resolved = namedtuple("Resolved", "route component params query hash popup")


class Router:
    def __init__(self, routes, logged_in, not_found_component):
        self._routes = routes
        self._logged_in = logged_in
        self._not_found = not_found_component
        self._listeners = []
        self.current = None

    def on_change(self, listener):
        self._listeners.append(listener)

    def resolve(self, full_path):
        path, _, hash_ = full_path.partition("#")
        path, _, query = path.partition("?")
        segments = [s for s in path.split("/") if s]
        for route in self._routes:
            pattern = [s for s in route.path.split("/") if s]
            if len(pattern) != len(segments):
                continue
            params = {}
            for p, s in zip(pattern, segments):
                if p.startswith(":"):
                    params[p[1:]] = s
                elif p != s:
                    break
            else:
                return Resolved(route, route.component, params, query, hash_, False)
        return Resolved(None, self._not_found, {}, query, hash_, False)

    def navigate(self, full_path):
        res = self.resolve(full_path)
        if res.route is not None and res.route.login_required and not self._logged_in:
            res = res._replace(component=self._not_found, popup=True)
        self.current = res
        if res.route is not None:
            for listener in list(self._listeners):
                listener(res)
        return res
'''
prod["javascript"] = '''
class Router {
  constructor(routes, loggedIn, notFoundComponent) {
    this.routes = routes;
    this.loggedIn = loggedIn;
    this.notFound = notFoundComponent;
    this.listeners = [];
    this.current = null;
  }

  onChange(listener) { this.listeners.push(listener); }

  resolve(fullPath) {
    const [beforeHash, hash = ''] = fullPath.split('#');
    const [path, query = ''] = beforeHash.split('?');
    const segments = path.split('/').filter(Boolean);
    for (const route of this.routes) {
      const pattern = route.path.split('/').filter(Boolean);
      if (pattern.length !== segments.length) continue;
      const params = {};
      const matches = pattern.every((p, i) => {
        if (p.startsWith(':')) { params[p.slice(1)] = segments[i]; return true; }
        return p === segments[i];
      });
      if (matches) return { route, component: route.component, params, query, hash, popup: false };
    }
    return { route: null, component: this.notFound, params: {}, query, hash, popup: false };
  }

  navigate(fullPath) {
    let res = this.resolve(fullPath);
    if (res.route && res.route.loginRequired && !this.loggedIn) {
      res = { ...res, component: this.notFound, popup: true };
    }
    this.current = res;
    if (res.route) for (const listener of [...this.listeners]) listener(res);
    return res;
  }
}

module.exports = { Router };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

record Route(String path, String component, boolean loginRequired) {}

record Resolved(Route route, String component, Map<String, String> params, String query, String hash, boolean popup) {}

public class Router {
    private final List<Route> routes;
    private final boolean loggedIn;
    private final String notFound;
    private final List<Consumer<Resolved>> listeners = new ArrayList<>();
    private Resolved current;

    public Router(List<Route> routes, boolean loggedIn, String notFoundComponent) {
        this.routes = routes;
        this.loggedIn = loggedIn;
        this.notFound = notFoundComponent;
    }

    public void onChange(Consumer<Resolved> listener) {
        listeners.add(listener);
    }

    public Resolved resolve(String fullPath) {
        String[] hashSplit = fullPath.split("#", 2);
        String hash = hashSplit.length > 1 ? hashSplit[1] : "";
        String[] querySplit = hashSplit[0].split("\\\\?", 2);
        String query = querySplit.length > 1 ? querySplit[1] : "";
        List<String> segments = segmentsOf(querySplit[0]);
        for (Route route : routes) {
            List<String> pattern = segmentsOf(route.path());
            if (pattern.size() != segments.size()) continue;
            Map<String, String> params = new HashMap<>();
            boolean matches = true;
            for (int i = 0; i < pattern.size() && matches; i++) {
                if (pattern.get(i).startsWith(":")) params.put(pattern.get(i).substring(1), segments.get(i));
                else matches = pattern.get(i).equals(segments.get(i));
            }
            if (matches) return new Resolved(route, route.component(), params, query, hash, false);
        }
        return new Resolved(null, notFound, Map.of(), query, hash, false);
    }

    public Resolved navigate(String fullPath) {
        Resolved res = resolve(fullPath);
        if (res.route() != null && res.route().loginRequired() && !loggedIn) {
            res = new Resolved(res.route(), notFound, res.params(), res.query(), res.hash(), true);
        }
        current = res;
        if (res.route() != null) {
            for (Consumer<Resolved> listener : new ArrayList<>(listeners)) listener.accept(res);
        }
        return res;
    }

    private static List<String> segmentsOf(String path) {
        List<String> segments = new ArrayList<>();
        for (String s : path.split("/")) if (!s.isEmpty()) segments.add(s);
        return segments;
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <functional>
#include <map>
#include <string>
#include <vector>

struct Route {
    std::string path;
    std::string component;
    bool loginRequired;
};

struct Resolved {
    bool matched;
    std::string component;
    std::map<std::string, std::string> params;
    std::string query;
    std::string hash;
    bool popup;
    bool loginRequired;
};

class Router {
public:
    Router(std::vector<Route> routes, bool loggedIn, std::string notFound)
        : routes_(std::move(routes)), loggedIn_(loggedIn), notFound_(std::move(notFound)) {}

    void onChange(std::function<void(const Resolved&)> listener) { listeners_.push_back(std::move(listener)); }

    Resolved resolve(const std::string& fullPath) const {
        std::string path = fullPath, query, hash;
        if (auto h = path.find('#'); h != std::string::npos) { hash = path.substr(h + 1); path.erase(h); }
        if (auto q = path.find('?'); q != std::string::npos) { query = path.substr(q + 1); path.erase(q); }
        auto segments = segmentsOf(path);
        for (const auto& route : routes_) {
            auto pattern = segmentsOf(route.path);
            if (pattern.size() != segments.size()) continue;
            std::map<std::string, std::string> params;
            bool matches = true;
            for (size_t i = 0; i < pattern.size() && matches; ++i) {
                if (pattern[i][0] == ':') params[pattern[i].substr(1)] = segments[i];
                else matches = pattern[i] == segments[i];
            }
            if (matches) return {true, route.component, params, query, hash, false, route.loginRequired};
        }
        return {false, notFound_, {}, query, hash, false, false};
    }

    Resolved navigate(const std::string& fullPath) {
        Resolved res = resolve(fullPath);
        if (res.matched && res.loginRequired && !loggedIn_) {
            res.component = notFound_;
            res.popup = true;
        }
        if (res.matched) {
            for (const auto& listener : listeners_) listener(res);
        }
        return res;
    }

private:
    static std::vector<std::string> segmentsOf(const std::string& path) {
        std::vector<std::string> segments;
        size_t start = 0;
        while (start <= path.size()) {
            size_t end = path.find('/', start);
            if (end == std::string::npos) end = path.size();
            if (end > start) segments.push_back(path.substr(start, end - start));
            start = end + 1;
        }
        return segments;
    }

    std::vector<Route> routes_;
    bool loggedIn_;
    std::string notFound_;
    std::vector<std::function<void(const Resolved&)>> listeners_;
};
'''
tests = {}
tests["python"] = ("from nirax import Router, Route", '''
ROUTES = [Route("/", "home", False), Route("/notes/:id", "note-detail", False),
          Route("/settings", "settings", True), Route("/search", "search", False)]


def describe(res):
    text = res.component
    for key in sorted(res.params):
        text += " %s=%s" % (key, res.params[key])
    if res.query:
        text += " query=" + res.query
    if res.hash:
        text += " hash=" + res.hash
    return text + (" popup" if res.popup else "")


def run(text):
    logged_in, router, changes, out = False, None, [0], []
    for command in text.split(";"):
        parts = command.split(" ")
        if parts[0] == "login":
            logged_in = parts[1] == "on"
        elif parts[0] == "nav":
            if router is None:
                router = Router(ROUTES, logged_in, "notfound")
                router.on_change(lambda res: changes.__setitem__(0, changes[0] + 1))
            out.append(describe(router.navigate(parts[1])))
    out.append("changes=%d" % changes[0])
    return "~".join(out)
''')
tests["javascript"] = ("const { Router } = require('./nirax');", '''
const ROUTES = [
  { path: '/', component: 'home', loginRequired: false },
  { path: '/notes/:id', component: 'note-detail', loginRequired: false },
  { path: '/settings', component: 'settings', loginRequired: true },
  { path: '/search', component: 'search', loginRequired: false },
];

function describe(res) {
  let text = res.component;
  for (const key of Object.keys(res.params).sort()) text += ` ${key}=${res.params[key]}`;
  if (res.query) text += ' query=' + res.query;
  if (res.hash) text += ' hash=' + res.hash;
  return text + (res.popup ? ' popup' : '');
}

function run(text) {
  let loggedIn = false, router = null, changes = 0;
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'login') {
      loggedIn = parts[1] === 'on';
    } else if (parts[0] === 'nav') {
      if (router === null) {
        router = new Router(ROUTES, loggedIn, 'notfound');
        router.onChange(() => { changes++; });
      }
      out.push(describe(router.navigate(parts[1])));
    }
  }
  out.push('changes=' + changes);
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static String describe(Resolved res) {
        StringBuilder text = new StringBuilder(res.component());
        for (String key : new TreeSet<>(res.params().keySet())) text.append(" ").append(key).append("=").append(res.params().get(key));
        if (!res.query().isEmpty()) text.append(" query=").append(res.query());
        if (!res.hash().isEmpty()) text.append(" hash=").append(res.hash());
        return text + (res.popup() ? " popup" : "");
    }

    static String run(String text) {
        List<Route> routes = List.of(new Route("/", "home", false), new Route("/notes/:id", "note-detail", false),
                new Route("/settings", "settings", true), new Route("/search", "search", false));
        boolean loggedIn = false;
        Router router = null;
        int[] changes = {0};
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            if (parts[0].equals("login")) {
                loggedIn = parts[1].equals("on");
            } else if (parts[0].equals("nav")) {
                if (router == null) {
                    router = new Router(routes, loggedIn, "notfound");
                    router.onChange(res -> changes[0]++);
                }
                out.add(describe(router.navigate(parts[1])));
            }
        }
        out.add("changes=" + changes[0]);
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <memory>", '''
static std::string describe(const Resolved& res) {
    std::string text = res.component;
    for (const auto& [key, value] : res.params) text += " " + key + "=" + value;
    if (!res.query.empty()) text += " query=" + res.query;
    if (!res.hash.empty()) text += " hash=" + res.hash;
    return text + (res.popup ? " popup" : "");
}

static std::string run(const std::string& text) {
    std::vector<Route> routes = {{"/", "home", false}, {"/notes/:id", "note-detail", false},
                                 {"/settings", "settings", true}, {"/search", "search", false}};
    bool loggedIn = false;
    std::unique_ptr<Router> router;
    int changes = 0;
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        if (parts[0] == "login") {
            loggedIn = parts[1] == "on";
        } else if (parts[0] == "nav") {
            if (!router) {
                router = std::make_unique<Router>(routes, loggedIn, "notfound");
                router->onChange([&changes](const Resolved&) { ++changes; });
            }
            out.push_back(describe(router->navigate(parts[1])));
        }
    }
    out.push_back("changes=" + std::to_string(changes));
    return join(out, "~");
}
''')
emit("router", "nirax", "Router", "nirax", prod, tests)


===== generator script: p_service.py =====
from gen import *
prod = {}
prod["python"] = '''
from dataclasses import dataclass
from typing import Optional


@dataclass
class Announcement:
    id: int
    title: str
    user_id: Optional[str] = None
    is_active: bool = True


class AnnouncementRepository:
    def __init__(self):
        self._rows = {}
        self._reads = set()

    def insert(self, announcement):
        self._rows[announcement.id] = announcement

    def find(self, announcement_id):
        return self._rows.get(announcement_id)

    def all(self):
        return [self._rows[i] for i in sorted(self._rows)]

    def add_read(self, user_id, announcement_id):
        if (user_id, announcement_id) in self._reads:
            return False
        self._reads.add((user_id, announcement_id))
        return True

    def has_read(self, user_id, announcement_id):
        return (user_id, announcement_id) in self._reads


class AnnouncementService:
    def __init__(self, repository, events, moderation_log):
        self._repository = repository
        self._events = events
        self._moderation_log = moderation_log
        self._next_id = 1

    def create(self, title, user_id=None, moderator=None):
        announcement = Announcement(self._next_id, title, user_id)
        self._next_id += 1
        self._repository.insert(announcement)
        if user_id is not None:
            self._events.publish_main_stream(user_id, "announcementCreated")
            if moderator is not None:
                self._moderation_log.log(moderator, "createUserAnnouncement")
        else:
            self._events.publish_broadcast_stream("announcementCreated")
            if moderator is not None:
                self._moderation_log.log(moderator, "createGlobalAnnouncement")
        return announcement

    def unread(self, user_id):
        return [a for a in self._repository.all()
                if a.is_active and a.user_id in (None, user_id) and not self._repository.has_read(user_id, a.id)]

    def read(self, user_id, announcement_id):
        if not self._repository.add_read(user_id, announcement_id):
            return
        announcement = self._repository.find(announcement_id)
        if announcement is not None and announcement.user_id == user_id:
            announcement.is_active = False
        if not self.unread(user_id):
            self._events.publish_main_stream(user_id, "readAllAnnouncements")

    def get(self, announcement_id, me=None):
        announcement = self._repository.find(announcement_id)
        if announcement is None or (announcement.user_id is not None and announcement.user_id != me):
            raise LookupError("not found")
        read = None if me is None else self._repository.has_read(me, announcement_id)
        return announcement, read
'''
prod["javascript"] = '''
class AnnouncementRepository {
  constructor() {
    this.rows = new Map();
    this.reads = new Set();
  }

  insert(announcement) { this.rows.set(announcement.id, announcement); }

  find(id) { return this.rows.get(id) ?? null; }

  all() { return [...this.rows.values()].sort((a, b) => a.id - b.id); }

  addRead(userId, id) {
    const key = userId + ':' + id;
    if (this.reads.has(key)) return false;
    this.reads.add(key);
    return true;
  }

  hasRead(userId, id) { return this.reads.has(userId + ':' + id); }
}

class AnnouncementService {
  constructor(repository, events, moderationLog) {
    this.repository = repository;
    this.events = events;
    this.moderationLog = moderationLog;
    this.nextId = 1;
  }

  create(title, userId = null, moderator = null) {
    const announcement = { id: this.nextId++, title, userId, isActive: true };
    this.repository.insert(announcement);
    if (userId !== null) {
      this.events.publishMainStream(userId, 'announcementCreated');
      if (moderator !== null) this.moderationLog.log(moderator, 'createUserAnnouncement');
    } else {
      this.events.publishBroadcastStream('announcementCreated');
      if (moderator !== null) this.moderationLog.log(moderator, 'createGlobalAnnouncement');
    }
    return announcement;
  }

  unread(userId) {
    return this.repository.all().filter(a =>
      a.isActive && (a.userId === null || a.userId === userId) && !this.repository.hasRead(userId, a.id));
  }

  read(userId, id) {
    if (!this.repository.addRead(userId, id)) return;
    const announcement = this.repository.find(id);
    if (announcement !== null && announcement.userId === userId) announcement.isActive = false;
    if (this.unread(userId).length === 0) this.events.publishMainStream(userId, 'readAllAnnouncements');
  }

  get(id, me = null) {
    const announcement = this.repository.find(id);
    if (announcement === null || (announcement.userId !== null && announcement.userId !== me)) {
      throw new Error('not found');
    }
    return { announcement, read: me === null ? null : this.repository.hasRead(me, id) };
  }
}

module.exports = { AnnouncementService, AnnouncementRepository };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.TreeMap;

class Announcement {
    final int id;
    final String title;
    final String userId;
    boolean isActive = true;

    Announcement(int id, String title, String userId) {
        this.id = id;
        this.title = title;
        this.userId = userId;
    }
}

record Packed(Announcement announcement, Boolean read) {}

interface EventPublisher {
    void publishMainStream(String userId, String type);
    void publishBroadcastStream(String type);
}

interface ModerationLog {
    void log(String moderator, String type);
}

class AnnouncementRepository {
    private final TreeMap<Integer, Announcement> rows = new TreeMap<>();
    private final Set<String> reads = new HashSet<>();

    void insert(Announcement announcement) { rows.put(announcement.id, announcement); }

    Announcement find(int id) { return rows.get(id); }

    List<Announcement> all() { return new ArrayList<>(rows.values()); }

    boolean addRead(String userId, int id) { return reads.add(userId + ":" + id); }

    boolean hasRead(String userId, int id) { return reads.contains(userId + ":" + id); }
}

public class AnnouncementService {
    private final AnnouncementRepository repository;
    private final EventPublisher events;
    private final ModerationLog moderationLog;
    private int nextId = 1;

    public AnnouncementService(AnnouncementRepository repository, EventPublisher events, ModerationLog moderationLog) {
        this.repository = repository;
        this.events = events;
        this.moderationLog = moderationLog;
    }

    public Announcement create(String title, String userId, String moderator) {
        Announcement announcement = new Announcement(nextId++, title, userId);
        repository.insert(announcement);
        if (userId != null) {
            events.publishMainStream(userId, "announcementCreated");
            if (moderator != null) moderationLog.log(moderator, "createUserAnnouncement");
        } else {
            events.publishBroadcastStream("announcementCreated");
            if (moderator != null) moderationLog.log(moderator, "createGlobalAnnouncement");
        }
        return announcement;
    }

    public List<Announcement> unread(String userId) {
        List<Announcement> result = new ArrayList<>();
        for (Announcement a : repository.all()) {
            boolean visible = a.userId == null || a.userId.equals(userId);
            if (a.isActive && visible && !repository.hasRead(userId, a.id)) result.add(a);
        }
        return result;
    }

    public void read(String userId, int id) {
        if (!repository.addRead(userId, id)) return;
        Announcement announcement = repository.find(id);
        if (announcement != null && userId.equals(announcement.userId)) announcement.isActive = false;
        if (unread(userId).isEmpty()) events.publishMainStream(userId, "readAllAnnouncements");
    }

    public Packed get(int id, String me) {
        Announcement announcement = repository.find(id);
        if (announcement == null || (announcement.userId != null && !announcement.userId.equals(me))) {
            throw new NoSuchElementException("not found");
        }
        return new Packed(announcement, me == null ? null : repository.hasRead(me, id));
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <map>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct Announcement {
    int id;
    std::string title;
    std::optional<std::string> userId;
    bool isActive = true;
};

struct Packed {
    Announcement announcement;
    std::optional<bool> read;
};

class EventPublisher {
public:
    virtual ~EventPublisher() = default;
    virtual void publishMainStream(const std::string& userId, const std::string& type) = 0;
    virtual void publishBroadcastStream(const std::string& type) = 0;
};

class ModerationLog {
public:
    virtual ~ModerationLog() = default;
    virtual void log(const std::string& moderator, const std::string& type) = 0;
};

class AnnouncementRepository {
public:
    void insert(const Announcement& announcement) { rows_[announcement.id] = announcement; }

    Announcement* find(int id) {
        auto it = rows_.find(id);
        return it == rows_.end() ? nullptr : &it->second;
    }

    std::vector<Announcement*> all() {
        std::vector<Announcement*> result;
        for (auto& [id, announcement] : rows_) result.push_back(&announcement);
        return result;
    }

    bool addRead(const std::string& userId, int id) { return reads_.insert({userId, id}).second; }

    bool hasRead(const std::string& userId, int id) const { return reads_.count({userId, id}) > 0; }

private:
    std::map<int, Announcement> rows_;
    std::set<std::pair<std::string, int>> reads_;
};

class AnnouncementService {
public:
    AnnouncementService(AnnouncementRepository& repository, EventPublisher& events, ModerationLog& moderationLog)
        : repository_(repository), events_(events), moderationLog_(moderationLog) {}

    Announcement create(const std::string& title, const std::optional<std::string>& userId,
                        const std::optional<std::string>& moderator) {
        Announcement announcement{nextId_++, title, userId};
        repository_.insert(announcement);
        if (userId) {
            events_.publishMainStream(*userId, "announcementCreated");
            if (moderator) moderationLog_.log(*moderator, "createUserAnnouncement");
        } else {
            events_.publishBroadcastStream("announcementCreated");
            if (moderator) moderationLog_.log(*moderator, "createGlobalAnnouncement");
        }
        return announcement;
    }

    std::vector<int> unread(const std::string& userId) {
        std::vector<int> result;
        for (Announcement* a : repository_.all()) {
            bool visible = !a->userId || *a->userId == userId;
            if (a->isActive && visible && !repository_.hasRead(userId, a->id)) result.push_back(a->id);
        }
        return result;
    }

    void read(const std::string& userId, int id) {
        if (!repository_.addRead(userId, id)) return;
        Announcement* announcement = repository_.find(id);
        if (announcement && announcement->userId && *announcement->userId == userId) announcement->isActive = false;
        if (unread(userId).empty()) events_.publishMainStream(userId, "readAllAnnouncements");
    }

    Packed get(int id, const std::optional<std::string>& me) {
        Announcement* announcement = repository_.find(id);
        if (!announcement || (announcement->userId && announcement->userId != me)) {
            throw std::runtime_error("not found");
        }
        std::optional<bool> read;
        if (me) read = repository_.hasRead(*me, id);
        return {*announcement, read};
    }

private:
    AnnouncementRepository& repository_;
    EventPublisher& events_;
    ModerationLog& moderationLog_;
    int nextId_ = 1;
};
'''
tests = {}
tests["python"] = ("from announcement_service import AnnouncementService, AnnouncementRepository", '''
class Events:
    def __init__(self, out):
        self.out = out

    def publish_main_stream(self, user_id, event_type):
        self.out.append("event:main:%s %s" % (user_id, event_type))

    def publish_broadcast_stream(self, event_type):
        self.out.append("event:broadcast " + event_type)


class ModLog:
    def __init__(self, out):
        self.out = out

    def log(self, moderator, kind):
        self.out.append("modlog:" + kind)


def run(text):
    out, repo = [], AnnouncementRepository()
    service = AnnouncementService(repo, Events(out), ModLog(out))
    for command in text.split(";"):
        parts = command.split(" ", 3)
        if parts[0] == "create":
            start = len(out)
            user = None if parts[1] == "-" else parts[1]
            created = service.create(parts[3], user, "admin" if parts[2] == "mod" else None)
            out.insert(start, "created#%d" % created.id)
        elif parts[0] == "read":
            target = repo.find(int(parts[2]))
            was_active = target is not None and target.is_active
            service.read(parts[1], int(parts[2]))
            if was_active and not target.is_active:
                out.append("deactivated#%d" % target.id)
        elif parts[0] == "get":
            try:
                announcement, read = service.get(int(parts[1]), None if parts[2] == "-" else parts[2])
                out.append("announcement#%d title=%s" % (announcement.id, announcement.title) +
                           ("" if read is None else " read=" + str(read).lower()))
            except LookupError as e:
                out.append("ERR:" + str(e))
        elif parts[0] == "unread":
            ids = [str(a.id) for a in service.unread(parts[1])]
            out.append("unread:" + (",".join(ids) or "none"))
    return "~".join(out)
''')
tests["javascript"] = ("const { AnnouncementService, AnnouncementRepository } = require('./announcementService');", '''
function run(text) {
  const out = [];
  const events = {
    publishMainStream: (userId, type) => out.push(`event:main:${userId} ${type}`),
    publishBroadcastStream: (type) => out.push('event:broadcast ' + type),
  };
  const moderationLog = { log: (moderator, kind) => out.push('modlog:' + kind) };
  const repo = new AnnouncementRepository();
  const service = new AnnouncementService(repo, events, moderationLog);
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'create') {
      const start = out.length;
      const created = service.create(parts.slice(3).join(' '), parts[1] === '-' ? null : parts[1], parts[2] === 'mod' ? 'admin' : null);
      out.splice(start, 0, `created#${created.id}`);
    } else if (parts[0] === 'read') {
      const target = repo.find(Number(parts[2]));
      const wasActive = target !== null && target.isActive;
      service.read(parts[1], Number(parts[2]));
      if (wasActive && !target.isActive) out.push(`deactivated#${target.id}`);
    } else if (parts[0] === 'get') {
      try {
        const { announcement, read } = service.get(Number(parts[1]), parts[2] === '-' ? null : parts[2]);
        out.push(`announcement#${announcement.id} title=${announcement.title}` + (read === null ? '' : ` read=${read}`));
      } catch (e) {
        out.push('ERR:' + e.message);
      }
    } else if (parts[0] === 'unread') {
      out.push('unread:' + (service.unread(parts[1]).map(a => a.id).join(',') || 'none'));
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static String run(String text) {
        List<String> out = new ArrayList<>();
        EventPublisher events = new EventPublisher() {
            public void publishMainStream(String userId, String type) { out.add("event:main:" + userId + " " + type); }

            public void publishBroadcastStream(String type) { out.add("event:broadcast " + type); }
        };
        ModerationLog moderationLog = (moderator, type) -> out.add("modlog:" + type);
        AnnouncementRepository repo = new AnnouncementRepository();
        AnnouncementService service = new AnnouncementService(repo, events, moderationLog);
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 4);
            if (parts[0].equals("create")) {
                int start = out.size();
                Announcement created = service.create(parts[3], parts[1].equals("-") ? null : parts[1],
                        parts[2].equals("mod") ? "admin" : null);
                out.add(start, "created#" + created.id);
            } else if (parts[0].equals("read")) {
                Announcement target = repo.find(Integer.parseInt(parts[2]));
                boolean wasActive = target != null && target.isActive;
                service.read(parts[1], Integer.parseInt(parts[2]));
                if (wasActive && !target.isActive) out.add("deactivated#" + target.id);
            } else if (parts[0].equals("get")) {
                try {
                    Packed packed = service.get(Integer.parseInt(parts[1]), parts[2].equals("-") ? null : parts[2]);
                    out.add("announcement#" + packed.announcement().id + " title=" + packed.announcement().title
                            + (packed.read() == null ? "" : " read=" + packed.read()));
                } catch (NoSuchElementException e) {
                    out.add("ERR:" + e.getMessage());
                }
            } else if (parts[0].equals("unread")) {
                List<String> ids = new ArrayList<>();
                for (Announcement a : service.unread(parts[1])) ids.add(String.valueOf(a.id));
                out.add("unread:" + (ids.isEmpty() ? "none" : String.join(",", ids)));
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <optional>\n#include <stdexcept>", '''
class Events : public EventPublisher {
public:
    explicit Events(std::vector<std::string>& out) : out_(out) {}
    void publishMainStream(const std::string& userId, const std::string& type) override {
        out_.push_back("event:main:" + userId + " " + type);
    }
    void publishBroadcastStream(const std::string& type) override { out_.push_back("event:broadcast " + type); }

private:
    std::vector<std::string>& out_;
};

class ModLog : public ModerationLog {
public:
    explicit ModLog(std::vector<std::string>& out) : out_(out) {}
    void log(const std::string&, const std::string& type) override { out_.push_back("modlog:" + type); }

private:
    std::vector<std::string>& out_;
};

static std::string run(const std::string& text) {
    std::vector<std::string> out;
    Events events(out);
    ModLog moderationLog(out);
    AnnouncementRepository repo;
    AnnouncementService service(repo, events, moderationLog);
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 4);
        if (parts[0] == "create") {
            size_t start = out.size();
            std::optional<std::string> user = parts[1] == "-" ? std::nullopt : std::optional<std::string>(parts[1]);
            std::optional<std::string> mod = parts[2] == "mod" ? std::optional<std::string>("admin") : std::nullopt;
            Announcement created = service.create(parts[3], user, mod);
            out.insert(out.begin() + start, "created#" + std::to_string(created.id));
        } else if (parts[0] == "read") {
            int id = std::stoi(parts[2]);
            Announcement* target = repo.find(id);
            bool wasActive = target && target->isActive;
            service.read(parts[1], id);
            if (wasActive && !target->isActive) out.push_back("deactivated#" + std::to_string(id));
        } else if (parts[0] == "get") {
            try {
                std::optional<std::string> me = parts[2] == "-" ? std::nullopt : std::optional<std::string>(parts[2]);
                Packed packed = service.get(std::stoi(parts[1]), me);
                out.push_back("announcement#" + std::to_string(packed.announcement.id) + " title=" + packed.announcement.title +
                              (packed.read ? std::string(" read=") + (*packed.read ? "true" : "false") : ""));
            } catch (const std::runtime_error& e) {
                out.push_back(std::string("ERR:") + e.what());
            }
        } else if (parts[0] == "unread") {
            std::vector<std::string> ids;
            for (int id : service.unread(parts[1])) ids.push_back(std::to_string(id));
            out.push_back("unread:" + (ids.empty() ? std::string("none") : join(ids, ",")));
        }
    }
    return join(out, "~");
}
''')
emit("service_layer", "announcement_service", "AnnouncementService", "announcementService", prod, tests)


===== generator script: p_strategy.py =====
from gen import *
prod = {}
prod["python"] = '''
from typing import Protocol


class LogBackend(Protocol):
    def write(self, level: str, message: str) -> str: ...


class BootstrapConsoleBackend:
    def write(self, level, message):
        return f"{level}: {message}"


class PrettyConsoleBackend:
    def write(self, level, message):
        return f"[{level.upper()}] {message}"


class JsonConsoleBackend:
    def write(self, level, message):
        return '{"level":"%s","message":"%s"}' % (level, message)


class LogManager:
    def __init__(self, backend):
        self._backend = backend

    def set_backend(self, backend):
        if backend is None:
            raise ValueError("backend is required")
        self._backend = backend

    def log(self, level, message):
        return self._backend.write(level, message)
'''
prod["javascript"] = '''
class BootstrapConsoleBackend {
  write(level, message) { return `${level}: ${message}`; }
}

class PrettyConsoleBackend {
  write(level, message) { return `[${level.toUpperCase()}] ${message}`; }
}

class JsonConsoleBackend {
  write(level, message) { return JSON.stringify({ level, message }); }
}

class LogManager {
  constructor(backend) { this.backend = backend; }

  setBackend(backend) {
    if (backend == null) throw new Error('backend is required');
    this.backend = backend;
  }

  log(level, message) { return this.backend.write(level, message); }
}

module.exports = { LogManager, BootstrapConsoleBackend, PrettyConsoleBackend, JsonConsoleBackend };
'''
prod["java"] = '''
interface LogBackend {
    String write(String level, String message);
}

class BootstrapConsoleBackend implements LogBackend {
    public String write(String level, String message) {
        return level + ": " + message;
    }
}

class PrettyConsoleBackend implements LogBackend {
    public String write(String level, String message) {
        return "[" + level.toUpperCase() + "] " + message;
    }
}

class JsonConsoleBackend implements LogBackend {
    public String write(String level, String message) {
        return "{\\"level\\":\\"" + level + "\\",\\"message\\":\\"" + message + "\\"}";
    }
}

public class LogManager {
    private LogBackend backend;

    public LogManager(LogBackend backend) {
        this.backend = backend;
    }

    public void setBackend(LogBackend backend) {
        if (backend == null) throw new IllegalArgumentException("backend is required");
        this.backend = backend;
    }

    public String log(String level, String message) {
        return backend.write(level, message);
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <cctype>
#include <memory>
#include <stdexcept>
#include <string>

class LogBackend {
public:
    virtual ~LogBackend() = default;
    virtual std::string write(const std::string& level, const std::string& message) const = 0;
};

class BootstrapConsoleBackend : public LogBackend {
public:
    std::string write(const std::string& level, const std::string& message) const override {
        return level + ": " + message;
    }
};

class PrettyConsoleBackend : public LogBackend {
public:
    std::string write(const std::string& level, const std::string& message) const override {
        std::string upper = level;
        std::transform(upper.begin(), upper.end(), upper.begin(), [](unsigned char c) { return std::toupper(c); });
        return "[" + upper + "] " + message;
    }
};

class JsonConsoleBackend : public LogBackend {
public:
    std::string write(const std::string& level, const std::string& message) const override {
        return "{\\"level\\":\\"" + level + "\\",\\"message\\":\\"" + message + "\\"}";
    }
};

class LogManager {
public:
    explicit LogManager(std::shared_ptr<LogBackend> backend) : backend_(std::move(backend)) {}

    void setBackend(std::shared_ptr<LogBackend> backend) {
        if (!backend) throw std::invalid_argument("backend is required");
        backend_ = std::move(backend);
    }

    std::string log(const std::string& level, const std::string& message) const {
        return backend_->write(level, message);
    }

private:
    std::shared_ptr<LogBackend> backend_;
};
'''
tests = {}
tests["python"] = ("from log_manager import *", '''
def run(text):
    manager = LogManager(BootstrapConsoleBackend())
    backends = {"bootstrap": BootstrapConsoleBackend(), "pretty": PrettyConsoleBackend(),
                "json": JsonConsoleBackend(), "null": None}
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 2)
        try:
            if parts[0] == "set":
                manager.set_backend(backends[parts[1]])
            elif parts[0] == "log":
                out.append(manager.log(parts[1], parts[2]))
        except ValueError as e:
            out.append("ERR:" + str(e))
    return "~".join(out)
''')
tests["javascript"] = ("const { LogManager, BootstrapConsoleBackend, PrettyConsoleBackend, JsonConsoleBackend } = require('./logManager');", '''
function run(text) {
  const manager = new LogManager(new BootstrapConsoleBackend());
  const backends = { bootstrap: new BootstrapConsoleBackend(), pretty: new PrettyConsoleBackend(), json: new JsonConsoleBackend(), null: null };
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'set') manager.setBackend(backends[parts[1]]);
      else if (parts[0] === 'log') out.push(manager.log(parts[1], parts.slice(2).join(' ')));
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}
''')
tests["java"] = ("", '''
    static String run(String text) {
        LogManager manager = new LogManager(new BootstrapConsoleBackend());
        Map<String, LogBackend> backends = new HashMap<>();
        backends.put("bootstrap", new BootstrapConsoleBackend());
        backends.put("pretty", new PrettyConsoleBackend());
        backends.put("json", new JsonConsoleBackend());
        backends.put("null", null);
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ", 3);
            try {
                if (parts[0].equals("set")) manager.setBackend(backends.get(parts[1]));
                else if (parts[0].equals("log")) out.add(manager.log(parts[1], parts[2]));
            } catch (IllegalArgumentException e) {
                out.add("ERR:" + e.getMessage());
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <memory>", '''
static std::string run(const std::string& text) {
    LogManager manager(std::make_shared<BootstrapConsoleBackend>());
    std::map<std::string, std::shared_ptr<LogBackend>> backends = {
        {"bootstrap", std::make_shared<BootstrapConsoleBackend>()},
        {"pretty", std::make_shared<PrettyConsoleBackend>()},
        {"json", std::make_shared<JsonConsoleBackend>()},
        {"null", nullptr}};
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ', 3);
        try {
            if (parts[0] == "set") manager.setBackend(backends[parts[1]]);
            else if (parts[0] == "log") out.push_back(manager.log(parts[1], parts[2]));
        } catch (const std::invalid_argument& e) {
            out.push_back(std::string("ERR:") + e.what());
        }
    }
    return join(out, "~");
}
''')
emit("strategy", "log_manager", "LogManager", "logManager", prod, tests)


===== generator script: p_template.py =====
from gen import *
prod = {}
prod["python"] = '''
from abc import ABC, abstractmethod

COLUMN_PREFIX = "___"
RANGE_MAX = 1000


class Chart(ABC):
    def __init__(self):
        self.rows = []

    @abstractmethod
    def tick_major(self, group): ...

    @abstractmethod
    def tick_minor(self, group): ...

    def tick(self, major, group=None):
        data = self.tick_major(group) if major else self.tick_minor(group)
        columns = {COLUMN_PREFIX + key.replace(".", "_"): max(0, min(RANGE_MAX, value))
                   for key, value in data.items()}
        if columns:
            self.rows.append(columns)
        return columns


class UsersChart(Chart):
    def tick_major(self, group):
        return {"total": 1500, "local.total": 40}

    def tick_minor(self, group):
        return {"local.total": 41}


class NotesChart(Chart):
    def tick_major(self, group):
        return {"total": -5}

    def tick_minor(self, group):
        return {}
'''
prod["javascript"] = '''
const COLUMN_PREFIX = '___';
const RANGE_MAX = 1000;

class Chart {
  constructor() { this.rows = []; }

  tickMajor(group) { throw new Error('tickMajor is abstract'); }

  tickMinor(group) { throw new Error('tickMinor is abstract'); }

  tick(major, group = null) {
    const data = major ? this.tickMajor(group) : this.tickMinor(group);
    const columns = {};
    for (const [key, value] of Object.entries(data)) {
      columns[COLUMN_PREFIX + key.replaceAll('.', '_')] = Math.max(0, Math.min(RANGE_MAX, value));
    }
    if (Object.keys(columns).length > 0) this.rows.push(columns);
    return columns;
  }
}

class UsersChart extends Chart {
  tickMajor() { return { total: 1500, 'local.total': 40 }; }
  tickMinor() { return { 'local.total': 41 }; }
}

class NotesChart extends Chart {
  tickMajor() { return { total: -5 }; }
  tickMinor() { return {}; }
}

module.exports = { Chart, UsersChart, NotesChart };
'''
prod["java"] = '''
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public abstract class Chart {
    private static final String COLUMN_PREFIX = "___";
    private static final int RANGE_MAX = 1000;
    final List<Map<String, Integer>> rows = new ArrayList<>();

    protected abstract Map<String, Integer> tickMajor(String group);

    protected abstract Map<String, Integer> tickMinor(String group);

    public final Map<String, Integer> tick(boolean major, String group) {
        Map<String, Integer> data = major ? tickMajor(group) : tickMinor(group);
        Map<String, Integer> columns = new TreeMap<>();
        for (Map.Entry<String, Integer> e : data.entrySet()) {
            int clamped = Math.max(0, Math.min(RANGE_MAX, e.getValue()));
            columns.put(COLUMN_PREFIX + e.getKey().replace('.', '_'), clamped);
        }
        if (!columns.isEmpty()) rows.add(columns);
        return columns;
    }
}

class UsersChart extends Chart {
    protected Map<String, Integer> tickMajor(String group) {
        return Map.of("total", 1500, "local.total", 40);
    }

    protected Map<String, Integer> tickMinor(String group) {
        return Map.of("local.total", 41);
    }
}

class NotesChart extends Chart {
    protected Map<String, Integer> tickMajor(String group) {
        return Map.of("total", -5);
    }

    protected Map<String, Integer> tickMinor(String group) {
        return Map.of();
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <algorithm>
#include <map>
#include <string>
#include <vector>

using Columns = std::map<std::string, int>;

class Chart {
public:
    virtual ~Chart() = default;

    Columns tick(bool major, const std::string& group = "") {
        Columns data = major ? tickMajor(group) : tickMinor(group);
        Columns columns;
        for (const auto& [key, value] : data) {
            std::string name = key;
            std::replace(name.begin(), name.end(), '.', '_');
            columns["___" + name] = std::clamp(value, 0, kRangeMax);
        }
        if (!columns.empty()) rows_.push_back(columns);
        return columns;
    }

protected:
    virtual Columns tickMajor(const std::string& group) = 0;
    virtual Columns tickMinor(const std::string& group) = 0;

private:
    static constexpr int kRangeMax = 1000;
    std::vector<Columns> rows_;
};

class UsersChart : public Chart {
protected:
    Columns tickMajor(const std::string&) override { return {{"total", 1500}, {"local.total", 40}}; }
    Columns tickMinor(const std::string&) override { return {{"local.total", 41}}; }
};

class NotesChart : public Chart {
protected:
    Columns tickMajor(const std::string&) override { return {{"total", -5}}; }
    Columns tickMinor(const std::string&) override { return {}; }
};
'''
tests = {}
tests["python"] = ("from chart import Chart, UsersChart, NotesChart", '''
class FaultyChart(Chart):
    def tick_major(self, group):
        raise RuntimeError("source unavailable")

    def tick_minor(self, group):
        return {}


def run(text):
    name, kind = text.split(" ")
    chart = {"users": UsersChart, "notes": NotesChart, "faulty": FaultyChart}[name]()
    try:
        columns = chart.tick(kind == "major")
    except RuntimeError as e:
        return "ERR:" + str(e)
    return ",".join("%s=%d" % (k, columns[k]) for k in sorted(columns)) or "none"
''')
tests["javascript"] = ("const { Chart, UsersChart, NotesChart } = require('./chart');", '''
class FaultyChart extends Chart {
  tickMajor() { throw new Error('source unavailable'); }
  tickMinor() { return {}; }
}

function run(text) {
  const [name, kind] = text.split(' ');
  const chart = { users: new UsersChart(), notes: new NotesChart(), faulty: new FaultyChart() }[name];
  try {
    const columns = chart.tick(kind === 'major');
    return Object.keys(columns).sort().map(k => `${k}=${columns[k]}`).join(',') || 'none';
  } catch (e) {
    return 'ERR:' + e.message;
  }
}
''')
tests["java"] = ("", '''
    static class FaultyChart extends Chart {
        protected Map<String, Integer> tickMajor(String group) {
            throw new IllegalStateException("source unavailable");
        }

        protected Map<String, Integer> tickMinor(String group) {
            return Map.of();
        }
    }

    static String run(String text) {
        String[] parts = text.split(" ");
        Chart chart = switch (parts[0]) {
            case "users" -> new UsersChart();
            case "notes" -> new NotesChart();
            default -> new FaultyChart();
        };
        try {
            Map<String, Integer> columns = chart.tick(parts[1].equals("major"), null);
            List<String> out = new ArrayList<>();
            for (Map.Entry<String, Integer> e : columns.entrySet()) out.add(e.getKey() + "=" + e.getValue());
            return out.isEmpty() ? "none" : String.join(",", out);
        } catch (IllegalStateException e) {
            return "ERR:" + e.getMessage();
        }
    }
''')
tests["cpp"] = ("#include <memory>\n#include <stdexcept>", '''
class FaultyChart : public Chart {
protected:
    Columns tickMajor(const std::string&) override { throw std::runtime_error("source unavailable"); }
    Columns tickMinor(const std::string&) override { return {}; }
};

static std::string run(const std::string& text) {
    auto parts = splitN(text, ' ');
    std::unique_ptr<Chart> chart;
    if (parts[0] == "users") chart = std::make_unique<UsersChart>();
    else if (parts[0] == "notes") chart = std::make_unique<NotesChart>();
    else chart = std::make_unique<FaultyChart>();
    try {
        Columns columns = chart->tick(parts[1] == "major");
        std::vector<std::string> out;
        for (const auto& [key, value] : columns) out.push_back(key + "=" + std::to_string(value));
        return out.empty() ? "none" : join(out, ",");
    } catch (const std::runtime_error& e) {
        return std::string("ERR:") + e.what();
    }
}
''')
emit("template_method", "chart", "Chart", "chart", prod, tests)


===== generator script: p_twolevel.py =====
from gen import *
prod = {}
prod["python"] = '''
class MemorySingleCache:
    def __init__(self, lifetime, clock):
        self._lifetime = lifetime
        self._clock = clock
        self._value = None
        self._cached_at = None

    def set(self, value):
        self._value = value
        self._cached_at = self._clock()

    def get(self):
        if self._cached_at is None:
            return None
        if self._clock() - self._cached_at > self._lifetime:
            self.delete()
            return None
        return self._value

    def delete(self):
        self._value = None
        self._cached_at = None


class RedisSingleCache:
    def __init__(self, redis, name, memory_lifetime, fetcher, clock):
        self._redis = redis
        self._key = "singlecache:" + name
        self._memory = MemorySingleCache(memory_lifetime, clock)
        self._fetcher = fetcher

    def set(self, value):
        self._memory.set(value)
        self._redis.set(self._key, value)

    def get(self):
        cached = self._memory.get()
        if cached is not None:
            return cached
        remote = self._redis.get(self._key)
        if remote is None:
            return None
        self._memory.set(remote)
        return remote

    def delete(self):
        self._memory.delete()
        self._redis.delete(self._key)

    def fetch(self):
        cached = self.get()
        if cached is not None:
            return cached
        value = self._fetcher()
        self.set(value)
        return value
'''
prod["javascript"] = '''
class MemorySingleCache {
  constructor(lifetime, clock) {
    this.lifetime = lifetime;
    this.clock = clock;
    this.value = undefined;
    this.cachedAt = null;
  }

  set(value) {
    this.value = value;
    this.cachedAt = this.clock();
  }

  get() {
    if (this.cachedAt == null) return undefined;
    if (this.clock() - this.cachedAt > this.lifetime) {
      this.delete();
      return undefined;
    }
    return this.value;
  }

  delete() {
    this.value = undefined;
    this.cachedAt = null;
  }
}

class RedisSingleCache {
  constructor(redis, name, memoryLifetime, fetcher, clock) {
    this.redis = redis;
    this.key = 'singlecache:' + name;
    this.memory = new MemorySingleCache(memoryLifetime, clock);
    this.fetcher = fetcher;
  }

  set(value) {
    this.memory.set(value);
    this.redis.set(this.key, value);
  }

  get() {
    const cached = this.memory.get();
    if (cached !== undefined) return cached;
    const remote = this.redis.get(this.key);
    if (remote === undefined) return undefined;
    this.memory.set(remote);
    return remote;
  }

  delete() {
    this.memory.delete();
    this.redis.delete(this.key);
  }

  fetch() {
    const cached = this.get();
    if (cached !== undefined) return cached;
    const value = this.fetcher();
    this.set(value);
    return value;
  }
}

module.exports = { RedisSingleCache };
'''
prod["java"] = '''
import java.util.function.LongSupplier;
import java.util.function.Supplier;

/** The second level (Redis in Misskey). */
interface RemoteStore {
    String get(String key);
    void set(String key, String value);
    void delete(String key);
}

class MemorySingleCache {
    private final long lifetime;
    private final LongSupplier clock;
    private String value;
    private Long cachedAt;

    MemorySingleCache(long lifetime, LongSupplier clock) {
        this.lifetime = lifetime;
        this.clock = clock;
    }

    void set(String value) {
        this.value = value;
        this.cachedAt = clock.getAsLong();
    }

    String get() {
        if (cachedAt == null) return null;
        if (clock.getAsLong() - cachedAt > lifetime) {
            delete();
            return null;
        }
        return value;
    }

    void delete() {
        value = null;
        cachedAt = null;
    }
}

public class RedisSingleCache {
    private final RemoteStore redis;
    private final String key;
    private final MemorySingleCache memory;
    private final Supplier<String> fetcher;

    public RedisSingleCache(RemoteStore redis, String name, long memoryLifetime, Supplier<String> fetcher, LongSupplier clock) {
        this.redis = redis;
        this.key = "singlecache:" + name;
        this.memory = new MemorySingleCache(memoryLifetime, clock);
        this.fetcher = fetcher;
    }

    public void set(String value) {
        memory.set(value);
        redis.set(key, value);
    }

    public String get() {
        String cached = memory.get();
        if (cached != null) return cached;
        String remote = redis.get(key);
        if (remote == null) return null;
        memory.set(remote);
        return remote;
    }

    public void delete() {
        memory.delete();
        redis.delete(key);
    }

    public String fetch() {
        String cached = get();
        if (cached != null) return cached;
        String value = fetcher.get();
        set(value);
        return value;
    }
}
'''
prod["cpp"] = '''
#pragma once
#include <functional>
#include <optional>
#include <string>

// The second level (Redis in Misskey).
class RemoteStore {
public:
    virtual ~RemoteStore() = default;
    virtual std::optional<std::string> get(const std::string& key) = 0;
    virtual void set(const std::string& key, const std::string& value) = 0;
    virtual void remove(const std::string& key) = 0;
};

class MemorySingleCache {
public:
    MemorySingleCache(long lifetime, std::function<long()> clock) : lifetime_(lifetime), clock_(std::move(clock)) {}

    void set(const std::string& value) {
        value_ = value;
        cachedAt_ = clock_();
    }

    std::optional<std::string> get() {
        if (!cachedAt_) return std::nullopt;
        if (clock_() - *cachedAt_ > lifetime_) {
            remove();
            return std::nullopt;
        }
        return value_;
    }

    void remove() {
        value_.reset();
        cachedAt_.reset();
    }

private:
    long lifetime_;
    std::function<long()> clock_;
    std::optional<std::string> value_;
    std::optional<long> cachedAt_;
};

class RedisSingleCache {
public:
    RedisSingleCache(RemoteStore& redis, const std::string& name, long memoryLifetime,
                     std::function<std::string()> fetcher, std::function<long()> clock)
        : redis_(redis), key_("singlecache:" + name), memory_(memoryLifetime, std::move(clock)), fetcher_(std::move(fetcher)) {}

    void set(const std::string& value) {
        memory_.set(value);
        redis_.set(key_, value);
    }

    std::optional<std::string> get() {
        if (auto cached = memory_.get()) return cached;
        auto remote = redis_.get(key_);
        if (!remote) return std::nullopt;
        memory_.set(*remote);
        return remote;
    }

    void remove() {
        memory_.remove();
        redis_.remove(key_);
    }

    std::string fetch() {
        if (auto cached = get()) return *cached;
        std::string value = fetcher_();
        set(value);
        return value;
    }

private:
    RemoteStore& redis_;
    std::string key_;
    MemorySingleCache memory_;
    std::function<std::string()> fetcher_;
};
'''
tests = {}
tests["python"] = ("from redis_single_cache import RedisSingleCache", '''
class FakeRedis:
    def __init__(self):
        self.data = {}
        self.reads = 0

    def get(self, key):
        self.reads += 1
        return self.data.get(key)

    def set(self, key, value):
        self.data[key] = value

    def delete(self, key):
        self.data.pop(key, None)


def run(text):
    redis, now, calls = FakeRedis(), [0], [0]

    def fetcher():
        calls[0] += 1
        return "v%d" % calls[0]

    def new_cache():
        return RedisSingleCache(redis, "demo", 100, fetcher, lambda: now[0])

    def answered(action):
        reads, fetched = redis.reads, calls[0]
        value = action()
        if value is None:
            return "none"
        level = "fetcher" if calls[0] > fetched else "L2" if redis.reads > reads else "L1"
        return "%s@%s" % (value, level)

    cache = new_cache()
    out = []
    for command in text.split(";"):
        parts = command.split(" ")
        if parts[0] == "fetch":
            out.append(answered(cache.fetch))
        elif parts[0] == "get":
            out.append(answered(cache.get))
        elif parts[0] == "delete":
            cache.delete()
        elif parts[0] == "tick":
            now[0] += int(parts[1])
        elif parts[0] == "newproc":
            cache = new_cache()
    return "~".join(out)
''')
tests["javascript"] = ("const { RedisSingleCache } = require('./redisSingleCache');", '''
class FakeRedis {
  constructor() { this.data = new Map(); this.reads = 0; }
  get(key) { this.reads++; return this.data.get(key); }
  set(key, value) { this.data.set(key, value); }
  delete(key) { this.data.delete(key); }
}

function run(text) {
  const redis = new FakeRedis();
  let now = 0;
  let calls = 0;
  const fetcher = () => `v${++calls}`;
  const newCache = () => new RedisSingleCache(redis, 'demo', 100, fetcher, () => now);
  const answered = (action) => {
    const reads = redis.reads, fetched = calls;
    const value = action();
    if (value === undefined) return 'none';
    const level = calls > fetched ? 'fetcher' : redis.reads > reads ? 'L2' : 'L1';
    return `${value}@${level}`;
  };
  let cache = newCache();
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'fetch') out.push(answered(() => cache.fetch()));
    else if (parts[0] === 'get') out.push(answered(() => cache.get()));
    else if (parts[0] === 'delete') cache.delete();
    else if (parts[0] === 'tick') now += Number(parts[1]);
    else if (parts[0] === 'newproc') cache = newCache();
  }
  return out.join('~');
}
''')
tests["java"] = ("import java.util.function.Supplier;", '''
    static class FakeRedis implements RemoteStore {
        final Map<String, String> data = new HashMap<>();
        int reads = 0;

        public String get(String key) { reads++; return data.get(key); }

        public void set(String key, String value) { data.put(key, value); }

        public void delete(String key) { data.remove(key); }
    }

    static String run(String text) {
        FakeRedis redis = new FakeRedis();
        long[] now = {0};
        int[] calls = {0};
        Supplier<String> fetcher = () -> "v" + (++calls[0]);
        RedisSingleCache[] cache = {new RedisSingleCache(redis, "demo", 100, fetcher, () -> now[0])};
        List<String> out = new ArrayList<>();
        for (String command : text.split(";")) {
            String[] parts = command.split(" ");
            if (parts[0].equals("fetch") || parts[0].equals("get")) {
                int reads = redis.reads, fetched = calls[0];
                String value = parts[0].equals("fetch") ? cache[0].fetch() : cache[0].get();
                if (value == null) {
                    out.add("none");
                } else {
                    String level = calls[0] > fetched ? "fetcher" : redis.reads > reads ? "L2" : "L1";
                    out.add(value + "@" + level);
                }
            } else if (parts[0].equals("delete")) {
                cache[0].delete();
            } else if (parts[0].equals("tick")) {
                now[0] += Long.parseLong(parts[1]);
            } else if (parts[0].equals("newproc")) {
                cache[0] = new RedisSingleCache(redis, "demo", 100, fetcher, () -> now[0]);
            }
        }
        return String.join("~", out);
    }
''')
tests["cpp"] = ("#include <map>\n#include <memory>", '''
class FakeRedis : public RemoteStore {
public:
    std::map<std::string, std::string> data;
    int reads = 0;

    std::optional<std::string> get(const std::string& key) override {
        ++reads;
        auto it = data.find(key);
        if (it == data.end()) return std::nullopt;
        return it->second;
    }
    void set(const std::string& key, const std::string& value) override { data[key] = value; }
    void remove(const std::string& key) override { data.erase(key); }
};

static std::string run(const std::string& text) {
    FakeRedis redis;
    long now = 0;
    int calls = 0;
    auto fetcher = [&calls] { return "v" + std::to_string(++calls); };
    auto clock = [&now] { return now; };
    auto cache = std::make_unique<RedisSingleCache>(redis, "demo", 100, fetcher, clock);
    std::vector<std::string> out;
    for (const auto& command : splitN(text, ';')) {
        auto parts = splitN(command, ' ');
        if (parts[0] == "fetch" || parts[0] == "get") {
            int reads = redis.reads, fetched = calls;
            std::optional<std::string> value;
            if (parts[0] == "fetch") value = cache->fetch();
            else value = cache->get();
            if (!value) {
                out.push_back("none");
            } else {
                std::string level = calls > fetched ? "fetcher" : redis.reads > reads ? "L2" : "L1";
                out.push_back(*value + "@" + level);
            }
        } else if (parts[0] == "delete") {
            cache->remove();
        } else if (parts[0] == "tick") {
            now += std::stol(parts[1]);
        } else if (parts[0] == "newproc") {
            cache = std::make_unique<RedisSingleCache>(redis, "demo", 100, fetcher, clock);
        }
    }
    return join(out, "~");
}
''')
emit("two_level_cache", "redis_single_cache", "RedisSingleCache", "redisSingleCache", prod, tests)


===== generator script: readme_data.py =====
# Per-pattern README content and per-language notes. Facts about the source were checked at HEAD 53ac680.
P = {}
P["strategy"] = dict(
    title="Strategy: Logging Output Strategy",
    fixture="strategy",
    why="LogManager is the cleanest Strategy in the audit input: one context, one interface, three interchangeable implementations and a setter that swaps them while the program runs.",
    source=[
        "Strategy interface `LogBackend`: packages/backend/src/logging/LogBackend.ts:12-24",
        "Concrete strategies: BootstrapConsoleBackend.ts:22, JsonConsoleBackend.ts:104, PrettyConsoleBackend.ts:37 (same directory)",
        "Context `LogManager`: LogManager.ts:220; `setBackend` 255-256; delegation `backend.write` 367, `writeAccess` 412, `flush`/`close` 294-296",
        "Default strategy installed at start-up: logging-runtime.ts:18",
    ],
    shows="`LogManager` never formats or prints anything itself. Every record goes to `this.backend.write(record)`, and `setBackend` replaces the object, so the output format changes for all later records without touching the manager.",
    caveats="None beyond the usual simplification. In the source the Factory pattern (`createLoggingBackend`) picks the backend that gets passed to `setBackend`; the Factory snippet models that part separately.",
    model="A `LogManager` holds a backend with one method, `write(level, message)`, which returns the formatted line. Three backends: bootstrap (`info: text`), pretty (`[INFO] text`) and JSON (`{\"level\":\"info\",\"message\":\"text\"}`). The real code writes a record object to the console and has `flush`, `close` and `writeAccess`; those are left out. Rejecting a null backend is a rule of the model; the source's `setBackend` itself has no such check.",
    limits="The JSON backend in the Java, Python and C++ versions builds the string by concatenation, so a message containing a double quote would be escaped differently from the JavaScript version (`JSON.stringify`). The fixture avoids quotes.",
)
P["factory"] = dict(
    title="Factory: Logging Backend Factory",
    fixture="factory",
    why="It is the only Factory instance in the audit input that is not marked uncertain. It is small and has a clear error case.",
    source=[
        "`createLoggingBackend(format)`: packages/backend/src/logging/logging-runtime.ts:21-25",
        "Product interface `LogBackend`: logging/LogBackend.ts:12-24",
        "Concrete products: PrettyConsoleBackend.ts:37, JsonConsoleBackend.ts:104",
        "Caller `configureLogging`, which validates first and then calls `logManager.setBackend`: logging-runtime.ts:28-32",
    ],
    shows="The caller passes a configuration string and gets back a `LogBackend` without naming a concrete class. An absent value or `'pretty'` gives the pretty backend, `'json'` gives the JSON backend, and anything else throws before the current backend is replaced.",
    caveats="This is a simple factory function (a conditional that returns one of two classes). It is not GoF Factory Method or Abstract Factory, there is no creator hierarchy, and the function is not exported. It also lives in the same file as the Strategy evidence, so the two instances share a code area.",
    model="`create_logging_backend(format)` returns a backend that reports its `name` and can format a line. Absent value and `pretty` give pretty, `json` gives JSON, everything else (including an empty string and `JSON`) raises `logging.format must be either pretty or json`.",
    limits="The model has two products, like the source. It does not model the file-level default manager or configuration objects.",
)
P["adapter"] = dict(
    title="Adapter: Telemetry Backend Adapter Layer",
    fixture="adapter",
    why="It shows Adapter in its most literal form: the application owns an interface and one class translates it to a third-party SDK with a different call shape.",
    source=[
        "Target `TelemetryAdapter` and option type: packages/backend/src/core/telemetry/adapters/TelemetryAdapter.ts:11-48",
        "Adapter `SentryTelemetryAdapter`: adapters/SentryTelemetryAdapter.ts:71-112 (`captureMessage` 86-92, `startSpan` 103-105, `shutdown` 107-110; timeout constant at line 12)",
        "Client (registry holding `TelemetryAdapter[]`): packages/backend/src/core/telemetry/telemetry-registry.ts:16-52",
        "Adaptee: the `@sentry/node` module, not part of the repository source",
    ],
    shows="The registry only calls `captureMessage`, `startSpan` and `shutdown` on `TelemetryAdapter`. `SentryTelemetryAdapter` turns `(message, {level, userId})` into `Sentry.captureMessage(message, {level, user: {id}, extra})`, wraps `startSpan(name, fn)` as `Sentry.startSpan({name}, fn)`, and calls `Sentry.close(5000)` on shutdown.",
    caveats="Only one adapter exists in the repository, so the adapter layer's value is mostly prospective. In the model, two instances of the same adapter class are used to exercise the registry's fan-out and span nesting; that is not a second backend.",
    model="`SentryTelemetryAdapter` translates to a fake Sentry client that records the calls it receives. The registry fans messages out to all adapters, nests spans (outermost adapter first) and runs the function directly when there are no adapters. An error thrown inside a span passes through unchanged. The fake client is part of the test, not the production file.",
    limits="`extra`, `getActiveTraceContext` and the Promise/async parts of the source are left out.",
)
P["template_method"] = dict(
    title="Template Method: Misskey Chart Processing Framework",
    fixture="template_method",
    why="`Chart.tick` is a textbook skeleton method with two abstract steps, and 16 chart classes fill in those steps.",
    source=[
        "Abstract class `Chart`: packages/backend/src/core/chart/core.ts:177",
        "Abstract steps `tickMajor` / `tickMinor`: core.ts:196, 201",
        "Template method `tick`: core.ts:583-584 onward (column naming, clamping, skipping empty results, persisting)",
        "Example concrete charts: core/chart/charts/active-users.ts:41, 45 and 15 other files that extend `Chart<`",
    ],
    shows="`tick` decides which hook to call, then performs the common work (prefix and rename columns, clamp to the column range, skip when empty, update hour and day records). The subclasses only say what numbers to compute.",
    caveats="Persistence in the source goes through database repositories and is asynchronous. In the model, \"persisting\" is appending to an in-memory list.",
    model="`Chart.tick(major)` calls `tick_major` or `tick_minor`, prefixes each key with `___` and replaces `.` with `_` (as `COLUMN_PREFIX` and `COLUMN_DELIMITER` do in the source), clamps values to 0..1000, and stores the result only when it is not empty. `UsersChart` and `NotesChart` are the concrete classes; a failing chart is defined in the test.",
    limits="The source clamps with each column's declared range (`small` or `big`), not a fixed 0..1000. The grouping and the hour/day records are not modelled.",
)
P["proxy"] = dict(
    title="Proxy: AnalyticsProxy",
    fixture="proxy",
    why="`AnalyticsProxy` is a small class in a single file and implements the same interface as the object it stands in for.",
    source=[
        "Proxy `AnalyticsProxy implements AnalyticsInstance`: packages/frontend/src/analytics.ts:12-78",
        "Late binding of the real subject `setAnalytics`: analytics.ts:21-26",
        "Shared proxy instance: analytics.ts:80; real instance installed by `initAnalytics` (after dynamic `import('analytics')`)",
    ],
    shows="Application code calls `analytics.track(...)` and similar methods from the start. Until `initAnalytics` has loaded the library and called `setAnalytics`, each method returns a no-op; afterwards the same call is forwarded to the real instance. The class comment says it exists so the code works without loading the analytics module.",
    caveats="It overlaps with Null Object because it returns no-ops when the real object is missing. I classify it as Proxy because it stands in for one specific subject, shares its interface and forwards to it, with the lazily loaded library as the real subject.",
    model="`AnalyticsProxy` and `RealAnalytics` share an interface with `track`, `page` and `identify`. Before `set` the proxy returns `noop`; afterwards it returns what the real object returns (`real:track login`). A second `set` raises `Analytics instance already exists.` The source has more methods (`ready`, `on`, `storage`, ...), which are not modelled.",
    limits="The real library is replaced by a small class; lazy loading itself is not modelled, only the late binding.",
)
L = {}  # (pattern, language) -> notes
L[("strategy", "java")] = "The strategy is a nominal interface (`LogBackend`); the compiler rejects a backend without `write`, and null is rejected by an explicit check in `setBackend`."
L[("strategy", "python")] = "`LogBackend` is a `typing.Protocol` used as documentation; backends do not inherit from it and nothing is enforced at runtime, so a backend without `write` only fails when called."
L[("strategy", "javascript")] = "There is no interface at all: backends are plain classes with a `write` method (duck typing), so a missing method also only fails when called. `JSON.stringify` handles escaping here."
L[("strategy", "cpp")] = "Abstract base class with a pure virtual `write`; the backend is held through `std::shared_ptr`, so swapping it also settles ownership and lifetime. A null pointer is rejected explicitly."
L[("factory", "java")] = "Java has no free functions, so the factory is a static method on `LoggingFactory`; it returns the `LogBackend` interface type."
L[("factory", "python")] = "A module-level function; `None` and `\"pretty\"` both give the pretty backend. Products are chosen by exact string comparison."
L[("factory", "javascript")] = "A module-level function; `format == null` also matches `undefined`. Products have no declared common interface."
L[("factory", "cpp")] = "A free inline function returning `std::unique_ptr<LogBackend>`; the absent-versus-empty distinction is explicit in the type (`std::optional<std::string>`), which the other languages express with null or a sentinel."
L[("adapter", "java")] = "Both the Target and the Adaptee need declared interfaces (`TelemetryAdapter`, `SentryClient`) because the type system must know the SDK's shape; `<T> T startSpan` keeps the span's return type."
L[("adapter", "python")] = "The Target is an ABC, but the Sentry SDK shape is not declared anywhere; the adapter is handed any object with matching methods. Options are a plain dict."
L[("adapter", "javascript")] = "Neither Target nor Adaptee is declared; the registry and adapter agree only through method names, so a typo shows up at call time."
L[("adapter", "cpp")] = "Virtual functions cannot be templates, so `startSpan` is fixed to `std::string` instead of a generic return type like the TypeScript original; the closure is a `std::function`."
L[("template_method", "java")] = "`tick` is `final` and the hooks are `protected abstract`, so subclasses cannot replace the skeleton and the compiler rejects a subclass missing a hook."
L[("template_method", "python")] = "An ABC with `@abstractmethod` hooks; instantiating `Chart` directly raises `TypeError`, but nothing stops a subclass from overriding `tick`."
L[("template_method", "javascript")] = "No abstract keyword: the base hooks throw when called, and `tick` can be overridden freely. Errors from a missing hook appear only at run time."
L[("template_method", "cpp")] = "`tick` is a non-virtual public method calling protected pure virtual hooks; an abstract `Chart` cannot be instantiated, and the hooks are not part of the public interface."
L[("proxy", "java")] = "The proxy implements the same interface and checks for null on each call; the real subject is created by the caller and set once."
L[("proxy", "python")] = "Same shape as Java with an ABC as the shared interface; absence is `None` and the single-assignment rule raises `RuntimeError`."
L[("proxy", "javascript")] = "`?.` and `??` make each forwarded call one line, as in the TypeScript source. Side effect: a real object that returns `null` or `undefined` would also be replaced by the no-op value."
L[("proxy", "cpp")] = "The proxy owns the real subject through `std::unique_ptr` (set by move), so the subject's lifetime is tied to the proxy; there is no automatic null check, it is written out."

P["observer"] = dict(
    title="Observer: PreferencesManager Observer",
    fixture="observer",
    why="The audit input has five Observer instances (global events, note capture, theme manager, deck columns, preferences). I picked PreferencesManager because one class is clearly the subject, its event type is declared, and the observer registration sits in a different file.",
    source=[
        "Subject `PreferencesManager extends EventEmitter<PreferencesManagerEvents>`: packages/frontend/src/preferences/manager.ts:194",
        "Event type map `PreferencesManagerEvents`: manager.ts:105",
        "Notification `this.emit('committed', {key, value, oldValue})` inside `commit`: manager.ts:258-275 (emit at 267)",
        "Observer registration `prefer.on('committed', ...)`: packages/frontend/src/preferences.ts:116",
    ],
    shows="A committed change is announced with one `emit('committed', ...)`. `preferences.ts` subscribes once and reacts by recording the update time and posting a message to the other tabs. The manager does not know who listens.",
    caveats="Subject and observer roles are not declared classes. The subject machinery (`on`, `off`, `emit`) comes from the EventEmitter3 library, and the observer is a callback function. The other four Observer instances use the same mechanism and are not implemented separately.",
    model="`PreferencesManager.commit(key, value)` stores the value and notifies every registered listener with `(key, value, oldValue)`. Listeners are called in registration order, an unsubscribed listener is not called, unsubscribing an unknown listener does nothing, and an error thrown by a listener propagates to the committer and stops the remaining listeners (this is how a synchronous emit behaves).",
    limits="Scopes, profiles, cloud sync and storage are not modelled. The source's event also carries more fields than the model's three.",
)
P["two_level_cache"] = dict(
    title="Two-Level Cache: RedisSingleCache L1/L2 Cache",
    fixture="two_level_cache",
    why="`RedisSingleCache` is the instance recorded in the input and its `get`/`fetch`/`set` show both levels clearly. (`RedisKVCache` right above it is the keyed sibling and is not used.)",
    source=[
        "`RedisSingleCache`: packages/backend/src/misc/cache.ts:113-205 (`get` reads memory, then Redis; `set` writes both; `fetch` falls back to the fetcher; `delete` clears both)",
        "Level 1 `MemorySingleCache`: cache.ts:340",
        "Fetcher passed in through the constructor options: cache.ts:116, 125-133",
    ],
    shows="`get()` returns the in-process value if it is fresh, otherwise reads Redis and copies the result into memory, and `fetch()` calls the fetcher only when both levels are empty, then writes both. Other worker processes share the Redis level but each has its own memory level.",
    caveats="Redis key expiry (the source sets `EX` from the lifetime) is not modelled; only the memory level expires.",
    model="L1 is a single value with a lifetime of 100 time units and a fake clock; L2 is a key-value fake that counts reads; the fetcher returns `v1`, `v2`, ... Results are tagged with the level that answered (`fetcher`, `L2`, `L1`). `newproc` creates a second cache object on the same Redis fake to show another process finding the value in L2.",
    limits="No serialization converters, no async calls, no TTL in L2. The source awaits Redis writes on purpose (see the comment at cache.ts:178-184); the model is synchronous.",
)
P["cache_aside"] = dict(
    title="Cache-Aside: Federated Instance Cache-Aside",
    fixture="cache_aside",
    why="`FederatedInstanceService` is plain application code that asks the cache first and fills it itself, which is the defining trait of Cache-Aside.",
    source=[
        "Cache construction (a `RedisKVCache` named `federatedInstance`): packages/backend/src/core/FederatedInstanceService.ts:30",
        "`fetchOrRegister`: FederatedInstanceService.ts:50-71 (cache `get` 53, repository `findOneBy` 56, `insertOne` 59, `cache.set` 65 and 68)",
        "Second lookup method that also caches a missing instance as null: FederatedInstanceService.ts:76-90",
        "`update` refreshes the cached copy after a write: FederatedInstanceService.ts:~96-103",
    ],
    shows="The service checks `federatedInstanceCache.get(host)`, goes to the database on a miss, inserts the row if the instance is new, and then writes the result into the cache itself. The cache never loads anything on its own.",
    caveats="The cache here is a `RedisKVCache`, which is itself two-level (see the Two-Level Cache snippet), so the two instances share infrastructure. Cache-Aside is about who owns the lookup logic, which in this class is the service.",
    model="A repository keyed by host with auto-increment ids, a key-value cache that can hold \"known missing\", and a service with `fetch_or_register` (returns the instance, registering it if needed) and `lookup` (returns null if unknown and caches that). Hosts are lower-cased as a stand-in for `toPuny`. The result is tagged with where it came from: `cache`, `db` or `insert`.",
    limits="Cache expiry, Redis, the `update`/`delete` paths and the real `toPuny` conversion are not modelled. The repository's `finds`/`inserts` counters exist only so the tests can tell where a result came from.",
)
P["publish_subscribe"] = dict(
    title="Publish-Subscribe: Global Event Publication and Streaming Subscription",
    fixture="publish_subscribe",
    why="It is the clearest publisher/subscriber pair in the backend: one service publishes without knowing the consumer, and another class subscribes and forwards.",
    source=[
        "Publisher `GlobalEventService.publish` writing JSON to `redisForPub.publish`: packages/backend/src/core/GlobalEventService.ts:352-361",
        "`publishBroadcastStream` 369, `publishMainStream` 374 (same file)",
        "Subscriber `redisForSub.on('message', ...)`: packages/backend/src/server/api/StreamingApiServerService.ts:104",
        "Per-connection fan-out through an in-process emitter (`ev.emit(data.channel, data.message)`): StreamingApiServerService.ts:116-122",
    ],
    shows="Producers call `publishMainStream(userId, type, value)` or `publishBroadcastStream(type, value)`. The message goes to Redis, and the streaming server, which was subscribed since start-up, turns it into events for each WebSocket connection. Publishers never reference connections.",
    caveats="Redis is used as a single channel keyed by host, and the selection by `mainStream:<id>` happens afterwards in-process. The model merges both steps into one broker with channel subscriptions, so it simplifies how the source routes messages.",
    model="`Broker.subscribe(channel, handler)`, `unsubscribe`, and `publish(channel, message)` which returns how many handlers received the message. `GlobalEventService` builds the channel name (`mainStream:<userId>` or `broadcast`) and a JSON message `{\"type\":..,\"body\":..}`. A message to a channel with no subscribers is dropped (the command output shows `dropped:<channel>`), like a Redis publish with no listeners.",
    limits="No real network, no connection lifecycle, no ordering guarantees beyond registration order.",
)
P["job_queue"] = dict(
    title="Job Queue: Federation Delivery Asynchronous Job Queue",
    fixture="job_queue",
    why="Delivery of ActivityPub activities is the best-documented queue in the code: a producer, a worker that processes the job, retry settings and a skip rule.",
    source=[
        "Producer `QueueService` adds delivery jobs with a label built from the inbox URL, `deliverQueue.add` at packages/backend/src/core/QueueService.ts:166 (attempts default `?? 12` at 167) and `addBulk` at 210",
        "Worker `new Bull.Worker(QUEUE.DELIVER, ...)` calling the processor: packages/backend/src/queue/QueueProcessorService.ts:265-269",
        "Consumer `DeliverProcessorService.process(job)`: packages/backend/src/queue/processors/DeliverProcessorService.ts:53 (returns `'skip (blocked)'` for a blocked host)",
    ],
    shows="The code that produces an activity only enqueues a job and returns; a separate worker takes jobs from the BullMQ queue and runs `process` on them, and BullMQ retries a failed job up to `deliverJobMaxAttempts` (12 by default).",
    caveats="BullMQ and Redis provide the queue, persistence and retry mechanics. Misskey supplies the producer and the processor, so the model reimplements the queue itself to have something runnable.",
    model="`JobQueue.add` stores a job and returns its id; `run(processor)` takes jobs in FIFO order and retries a job when the processor throws, up to 12 attempts. `DeliverService` builds the label like the source (`https://` and `/inbox` removed), and `DeliverProcessor` skips blocked hosts, otherwise sends via a transport. Results are reported as `id:label:result@attempts`.",
    limits="No delay or back-off between attempts, no concurrency, no persistence, and a single queue. Hosts ending in `.down` always fail and hosts ending in `.flaky` fail once; those are test-fake rules, not Misskey's.",
)
P["front_controller"] = dict(
    title="Front Controller: Misskey API Front Controller",
    fixture="front_controller",
    why="All API requests pass through one component that authenticates, rate-limits and dispatches, which is what the Front Controller pattern describes.",
    source=[
        "Registration of every endpoint (loop over `endpoints`, `moduleRef.get('ep:' + name).exec`): packages/backend/src/server/api/ApiServerService.ts:65-102",
        "Controller `ApiCallService.handleRequest`: packages/backend/src/server/api/ApiCallService.ts:194 (authentication at 212); `handleMultipartRequest` 233",
        "Rate limiting: ApiCallService.ts:387-391",
        "Dispatch `ep.exec(...)`: ApiCallService.ts:498",
    ],
    shows="Whatever the endpoint, the request goes through the same `handleRequest`: look up the credential, apply the endpoint's rate limit, then call the endpoint's `exec`. Endpoint classes do not repeat that logic.",
    caveats="Fastify gets one route per endpoint (the loop in `ApiServerService`), not a single route that dispatches by name. The shared pre-processing sits in `ApiCallService`, so I treat it as a Front Controller with a framework doing the routing, not a literal single-entry servlet.",
    model="`ApiController.handle(name, token, body)` returns a status and text. It answers 404 for an unknown endpoint, 401 when the endpoint needs a credential and the token does not resolve to a user, 429 when the actor has already made two successful requests, and otherwise 200 with the endpoint's result. Actors are the user or `anon`. The three endpoints (`ping`, `notes/create`, `i`) are defined by the test.",
    limits="Parameter validation, multipart handling, per-endpoint limits, time windows and the API's real error format are not modelled. The limit is a fixed 2 calls per actor and never resets.",
)
P["router"] = dict(
    title="Router: Nirax Frontend Router",
    fixture="router",
    why="Nirax is Misskey's own router and has a clear resolve, navigate and notify cycle.",
    source=[
        "`Nirax extends EventEmitter<RouterEvents>`: packages/frontend/src/lib/nirax.ts:218",
        "`resolve(fullPath)` splits path, query and hash and matches route definitions: nirax.ts:257 onward",
        "`navigate` with the login-required handling and `emit('change', ...)`: nirax.ts:411-430 (emit at 425)",
        "Catch-all route `path: '/:(*)'`: packages/frontend/src/router.definition.ts:607",
    ],
    shows="A path is parsed into a route plus parameters, the router becomes that route, and `change` is emitted so the UI can swap the page. A route that requires login shows the not-found component with a login popup flag when the user is logged out.",
    caveats="Router is an architectural/UI pattern, not GoF. In the source the router is also an Observer subject (its `change` event), which I use in the model for the change counter.",
    model="Routes are `(path, component, loginRequired)`. `:name` segments capture parameters. `navigate(path)` returns the component, params, query and hash; if the route needs login and the user is logged out, the component becomes `notfound` and `popup` is set. A change event is emitted for matched routes only; an unmatched path resolves to `notfound` without an event, as with the catch-all in the source.",
    limits="No history, no nested routes, no `resolveForNavigation`, no redirects, and no query parsing beyond keeping the raw string.",
)
P["service_layer"] = dict(
    title="Service Layer: Misskey Core Application Service Layer",
    fixture="service_layer",
    why="`AnnouncementService` is the smallest service that combines persistence, event publication and moderation logging, and an endpoint class that calls it.",
    source=[
        "`AnnouncementService` (injected repositories, `IdService`, `GlobalEventService`, `ModerationLogService`): packages/backend/src/core/AnnouncementService.ts:10-31",
        "Use cases: `getUnreadAnnouncements` 45, `create` 69, `update` 121, `delete` 160, `getAnnouncement` 183, `read` 202-224 (same file)",
        "Caller: packages/backend/src/server/api/endpoints/admin/announcements/create.ts:72-75 (`announcementService.create`)",
        "Module wiring: packages/backend/src/core/CoreModule.ts:168, 321",
    ],
    shows="An endpoint calls one method, and the service decides everything the operation involves: it inserts the row, publishes the right event (to one user or to everyone), and writes a moderation log entry when a moderator did it. `read` ignores duplicates, deactivates a user's own announcement and announces when nothing is left unread.",
    caveats="\"Service Layer\" is a broad architectural label. The evidence here is the use-case boundary of one service plus the 76 `*Service.ts` files in `core/`; I read only this one in detail.",
    model="`AnnouncementService` is built from a repository, an event publisher and a moderation log (all injected). `create` publishes `announcementCreated` to `main:<user>` or `broadcast` and logs when a moderator is given; `unread(user)` lists active announcements visible to the user that they have not read; `read` follows the source's rules; `get` raises `not found` for unknown ids and for other users' private announcements. Output lines for events and logs appear in order, and a `deactivated#id` line is a state check made after a `read`.",
    limits="No packing/serialization, no `update`/`delete`, no pagination, ids come from a counter and `isActive`/`isRead` are simplified.",
)
P["plugin_architecture"] = dict(
    title="Plugin Architecture: Misskey Frontend Plugin Architecture",
    fixture="plugin_architecture",
    why="The frontend has an explicit host (install, launch, abort), a handler registry and call sites that apply the registered handlers, so the extension points are easy to see.",
    source=[
        "`installPlugin`: packages/frontend/src/plugin.ts:136",
        "Handler registry `pluginHandlers` and `addPluginHandler`: plugin.ts:227-236",
        "`launchPlugins`/`launchPlugin` (script exec, error is logged and rethrown): plugin.ts:238-311",
        "`abortPlugin` (drops the context and the plugin's handlers): plugin.ts:313-320",
        "Handler registrations such as `note_view_interruptor`: plugin.ts:381-427; lookup `getPluginHandlers`: plugin.ts:462-463",
    ],
    shows="A plugin is a script that, while running, registers handlers for named extension points. The host only keeps the list and hands out handlers by type when asked, and aborting a plugin removes its handlers.",
    caveats="The source's plugins are AiScript programs run in a sandbox; the extension-point registry is the part I model. The host is one module (not a separate kernel process), so \"microkernel\" is used loosely.",
    model="`PluginHost.install(id, setup)` records the plugin and runs `setup`, which can add handlers through a callback; `abort(id)` removes the plugin's handlers; `get_handlers(type)` returns them in installation order. If `setup` throws, the error propagates and handlers registered before the error stay until `abort`, which is what the source does (nothing in `launchPlugin` removes them). The test defines four plugins: `upper`, `exclaim`, `share` and `bad`.",
    limits="No sandbox, no plugin metadata or permissions, no persistence, no log, and only two handler types are exercised.",
)
P["repository"] = dict(
    title="Repository: Misskey Persistence Repository Layer",
    fixture="repository",
    why="It is the persistence abstraction every service uses. The audit marked it as a weaker fit, so this README is explicit about what the source does and does not show.",
    source=[
        "Extension interface `MiRepository<T>` and implementation `miRepository.insertOne`: packages/backend/src/models/_.ts:89-97",
        "Typed repositories such as `UsersRepository = Repository<MiUser> & MiRepository<MiUser>`: models/_.ts:184 (`AnnouncementsRepository`), 229 (`UsersRepository`)",
        "Provider that builds each repository: packages/backend/src/models/RepositoryModule.ts:91-95 (`db.getRepository(MiUser).extend(miRepository)`)",
        "Clients: services such as `UserService` and `AnnouncementService` get repositories injected through DI tokens",
    ],
    shows="Services do not touch the data source. They receive a repository object (`DI.usersRepository`) and call `findOneBy`, `update`, `insertOne` and similar on it, so persistence is hidden behind that object and swapped by DI.",
    caveats="The repository abstraction comes from TypeORM's `Repository<T>`, not from Misskey. Misskey adds the DI wiring and one extension method (`insertOne`) and does not define a domain-specific repository interface. I count it as the Repository pattern by way of a framework idiom, and I'm not claiming Misskey designed its own.",
    model="The cross-language example models the repository collaboration with an in-memory store. It does not reproduce TypeORM. `InMemoryRepository` plays `Repository<T>` (`insert`, `findOneBy`, `findOneOrFail`, `count`), `MiRepository` adds `insertOne` (insert, then read the row back by its identifiers) and is mixed in to give `UsersRepository`, and `UserService` receives it through its constructor.",
    limits="No SQL, relations, transactions, entity metadata or DI container; entities are string maps.",
)
L[("observer", "java")] = "An own listener list of `Consumer<CommitEvent>`; `off` removes by object identity and notification iterates over a copy, so a listener can unsubscribe while being notified. There is only one event type, so there are no event names."
L[("observer", "python")] = "A plain list of callables with a `namedtuple` event; single event type, no event names. Notification iterates over a copy of the list."
L[("observer", "javascript")] = "The subject extends Node's built-in `EventEmitter`, so `on`/`off`/`emit` come from the runtime (the TypeScript source uses EventEmitter3 the same way). `off` with an undefined listener throws a TypeError, so the test passes a never-registered function for the unknown-listener case."
L[("observer", "cpp")] = "`std::function` objects cannot be compared, so `on` returns an integer handle that `off` takes; notification runs over a copy of the listener list. The old value is a `std::optional`."
L[("two_level_cache", "java")] = "Absent is `null` (no `Optional`); the second level is a `RemoteStore` interface and the clock is a `LongSupplier`."
L[("two_level_cache", "python")] = "Absent is `None`; the Redis object and the clock are plain duck-typed collaborators."
L[("two_level_cache", "javascript")] = "Absent is `undefined`, as in the TypeScript source; synchronous here, where the source awaits Redis."
L[("two_level_cache", "cpp")] = "`std::optional<std::string>` makes absence part of the type; Redis is reached through a `RemoteStore&`, so the cache does not own it; `delete` is renamed `remove` because it is a keyword."
L[("cache_aside", "java")] = "A `HashMap` may hold null, so a cached \"not found\" can only be told apart from a miss with `containsKey` (the `has` method); `Instance` is a record."
L[("cache_aside", "python")] = "A dict holding `None` for known-missing hosts, so `has` is needed; the entity is a `namedtuple`."
L[("cache_aside", "javascript")] = "`Map` with `null` for known-missing; `fetchOrRegister` uses a truthiness check, so a cached null counts as a miss there, as in the source's `if (cached)`."
L[("cache_aside", "cpp")] = "Known-missing is an empty `std::optional<Instance>` stored in the map; repository and cache are injected by reference."
L[("publish_subscribe", "java")] = "Handlers are `BiConsumer<String,String>` and unsubscribe works by object identity; JSON is built by string concatenation."
L[("publish_subscribe", "python")] = "Handlers are callables; the message is built with `json.dumps` using compact separators."
L[("publish_subscribe", "javascript")] = "Handlers are functions in a `Map` of arrays; `JSON.stringify` builds the message."
L[("publish_subscribe", "cpp")] = "Handlers are `std::function`, which cannot be compared, so `subscribe` returns a token for `unsubscribe`; JSON is built by concatenation."
L[("job_queue", "java")] = "Processor is a `Function<Job,String>`; a failing attempt is any `RuntimeException`; `Job` and `JobResult` are records."
L[("job_queue", "python")] = "Processor is any callable; only `RuntimeError` counts as a failed attempt, other exception types would propagate and stop the run."
L[("job_queue", "javascript")] = "Any thrown value counts as a failed attempt (there are no checked or typed exceptions to filter on)."
L[("job_queue", "cpp")] = "Only `std::runtime_error` counts as a failed attempt; the result is held in a `std::optional<std::string>` until a processor call succeeds."
L[("front_controller", "java")] = "`Endpoint` is a record holding a `BiFunction`; the authenticator returns null for an unknown token."
L[("front_controller", "python")] = "`Endpoint` is a `namedtuple` and the authenticator any callable returning a user or `None`."
L[("front_controller", "javascript")] = "Endpoints are plain objects; `??` turns a missing user into the `anon` actor."
L[("front_controller", "cpp")] = "The user is a `std::optional<std::string>`; the method is called `registerEndpoint` because `register` is a C++ keyword."
L[("router", "java")] = "`Route` and `Resolved` are records, and an unmatched path is a `Resolved` with a null route (the catch-all)."
L[("router", "python")] = "`Resolved` is a `namedtuple` and `_replace` creates the login-required variant; matching uses `for ... else`."
L[("router", "javascript")] = "Object spread builds the modified result; path pieces come from `split` and destructuring defaults."
L[("router", "cpp")] = "`Resolved` has a `matched` flag instead of a nullable route; the standard library has no split, so segments are split by hand."
L[("service_layer", "java")] = "Collaborators are constructor-injected interfaces (`EventPublisher`, `ModerationLog`); `Packed.read` is a boxed `Boolean` so null can mean \"no user given\"."
L[("service_layer", "python")] = "The entity is a dataclass and collaborators are duck-typed objects; `LookupError` stands for the not-found error."
L[("service_layer", "javascript")] = "Entities are object literals and missing values are `null`; collaborators are plain objects with the right methods."
L[("service_layer", "cpp")] = "Collaborators are abstract classes held by reference; the repository's `find` returns a non-owning raw pointer (null when missing) and the read flag is a `std::optional<bool>`."
L[("plugin_architecture", "java")] = "`setup` is a `Consumer<HandlerRegistrar>` and handlers are `Function<String,String>`; a private record holds the registry entries."
L[("plugin_architecture", "python")] = "`setup` receives an `add_handler` closure; handlers are plain callables stored in tuples."
L[("plugin_architecture", "javascript")] = "Same closure-based registration; handlers are arrow functions and the registry holds plain objects."
L[("plugin_architecture", "cpp")] = "Handlers are `std::function` values the host owns; an exception thrown from `setup` propagates through `install` and handlers added before it remain registered."
L[("repository", "java")] = "`MiRepository` is an interface whose default method `insertOne` is mixed into `UsersRepository` (`extends InMemoryRepository implements MiRepository`)."
L[("repository", "python")] = "`MiRepository` is a mixin listed before `InMemoryRepository` in the bases, so its `insert_one` calls the other base's `insert` and `find_one_or_fail`."
L[("repository", "javascript")] = "`extend(repository, miRepository)` copies the method onto the instance, like `.extend(miRepository)` in the TypeScript source."
L[("repository", "cpp")] = "`MiRepository<Base>` is a class template deriving from the repository, so the mixin is resolved at compile time; entities are `std::map<string,string>`."


===== generator script: gen_readme.py =====
import os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
from readme_data import P, L
TEAM = os.path.expanduser("~/design_patterns_case_study/TEAM_TEMPLATE")
CODE = os.path.join(TEAM, "Part3/code")
LANG = {"java": "Java", "python": "Python", "javascript": "JavaScript", "cpp": "C++"}
def lang_files(d):
    fs = sorted(f for f in os.listdir(d) if f != "README.md")
    prod = [f for f in fs if not re.search(r"(Test\.java|^test_.*\.py|\.test\.js|\.test\.cpp)$", f)][0]
    test = [f for f in fs if f != prod][0]
    return prod, test
def cmds(lang, prod, test, fixture):
    fx = "../../../test-cases/%s.txt" % fixture
    if lang == "java":
        cls = test[:-5]
        return ["javac -d build *.java", "java -cp build %s %s" % (cls, fx)]
    if lang == "python":
        return ["python3 -B %s %s" % (test, fx)]
    if lang == "javascript":
        return ["node %s %s" % (test, fx)]
    return ["mkdir -p build", "g++ -std=c++17 -Wall -Wextra -o build/test %s" % test, "build/test %s" % fx]
for p in sys.argv[1:]:
    d = P[p]
    n = sum(1 for l in open(os.path.join(TEAM, "Part3/test-cases/%s.txt" % d["fixture"])) if l.strip() and not l.startswith("#"))
    body = "# %s\n\n**Why this instance:** %s\n\n**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):\n\n%s\n\n**How the source shows the pattern:** %s\n\n**Caveats:** %s\n\n**The small model:** %s\n\n**Not modelled:** %s\n\n**Shared test cases:** `Part3/test-cases/%s.txt` has %d cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.\n" % (
        d["title"], d["why"], "\n".join("- " + s for s in d["source"]), d["shows"], d["caveats"], d["model"], d["limits"], d["fixture"], n)
    open(os.path.join(CODE, "pattern_" + p, "README.md"), "w").write(body)
    for lang, name in LANG.items():
        ld = os.path.join(CODE, "pattern_" + p, lang)
        prod, test = lang_files(ld)
        c = cmds(lang, prod, test, d["fixture"])
        txt = "# %s: %s\n\n- Production code: `%s`\n- Test runner: `%s` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)\n\nRun from `Part3/code/pattern_%s/%s/`:\n\n```\n%s\n```\n\nRemove the `build/` folder afterwards if one was created; compiled output is not part of the submission.\n\n**Language notes:** %s\n" % (
            d["title"].split(":")[0], name, prod, test, p, lang, "\n".join(c), L[(p, lang)])
        open(os.path.join(ld, "README.md"), "w").write(txt)
print("ok")


===== generator script: quick.sh =====
#!/bin/bash
# quick local check: quick.sh <pattern> <fixture-name>
P=$1; F=<project-root>/TEAM_TEMPLATE/Part3/test-cases/$2.txt
D=<project-root>/TEAM_TEMPLATE/Part3/code/pattern_$P
B=$(mktemp -d -p <scratchpad>)
echo "== $P"
(cd $D/python && python3 -B test_*.py $F | grep -v PASS)
(cd $D/javascript && node *.test.js $F | grep -v PASS)
(cd $D/java && javac -d $B *.java && java -cp $B $(ls *Test.java | sed 's/.java//') $F | grep -v PASS)
(cd $D/cpp && g++ -std=c++17 -Wall -Wextra -o $B/t *.test.cpp && $B/t $F | grep -v PASS)

