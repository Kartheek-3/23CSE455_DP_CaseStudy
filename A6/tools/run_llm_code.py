"""Extracts the Java/Python/JavaScript/C++ code blocks from a saved LLM answer, compiles and runs them,
and writes the log next to the answer as <name>_coderun.txt (evidence for the verification note).

Usage (from the A6 folder):  python tools/run_llm_code.py prompts/K_Harish_output_02.md <scratch-dir>
"""
import re
import subprocess
import sys
from pathlib import Path

LANGS = {"java": "java", "python": "python", "javascript": "javascript", "js": "javascript", "cpp": "cpp", "c++": "cpp"}


def blocks(md):
    out = {}
    for lang, code in re.findall(r"```([\w+]+)\n(.*?)\n```", md, re.S):
        key = LANGS.get(lang.lower())
        if key and key not in out and len(code.splitlines()) > 10:  # first substantial block per language
            out[key] = code + "\n"
    return out


def run(cmd, cwd):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def main():
    answer = Path(sys.argv[1])
    work = Path(sys.argv[2]) / answer.stem
    work.mkdir(parents=True, exist_ok=True)
    code = blocks(answer.read_text(encoding="utf-8"))
    log = [f"# Compile/run of the code blocks in {answer.as_posix()}", ""]
    for lang in ("java", "python", "javascript", "cpp"):
        if lang not in code:
            log += [f"## {lang}: no code block found", ""]
            continue
        src = code[lang]
        if lang == "java":
            cls = re.search(r"public\s+(?:final\s+)?class\s+(\w+)", src)
            name = (cls.group(1) if cls else "Main") + ".java"
            (work / name).write_text(src, encoding="utf-8")
            rc, out = run(["javac", name], work)
            if rc == 0:
                rc, out = run(["java", "-cp", ".", name[:-5]], work)
            cmd = f"javac {name} && java {name[:-5]}"
        elif lang == "python":
            (work / "llm_snippet.py").write_text(src, encoding="utf-8")
            rc, out = run([sys.executable, "llm_snippet.py"], work)
            cmd = "python llm_snippet.py"
        elif lang == "javascript":
            (work / "llm_snippet.cjs").write_text(src, encoding="utf-8")
            rc, out = run(["node", "llm_snippet.cjs"], work)
            cmd = "node llm_snippet.cjs"
        else:
            (work / "llm_snippet.cpp").write_text(src, encoding="utf-8")
            rc, out = run(["docker", "run", "--rm", "-v", f"{work.resolve().as_posix()}:/src", "-w", "/src", "gcc:13", "bash", "-c",
                           "g++ -std=c++17 -Wall -Wextra -pedantic llm_snippet.cpp -o /tmp/t && /tmp/t"], work)
            cmd = "g++ -std=c++17 -Wall -Wextra -pedantic llm_snippet.cpp (gcc:13) && run"
        log += [f"## {lang}: exit code {rc}", f"command: {cmd}", "```", out, "```", ""]
        print(f"{lang:10s} exit {rc}")
    target = answer.with_name(answer.stem.replace("_output_", "_coderun_") + ".txt")
    target.write_text("\n".join(log), encoding="utf-8")
    print("log:", target.as_posix())


if __name__ == "__main__":
    main()
