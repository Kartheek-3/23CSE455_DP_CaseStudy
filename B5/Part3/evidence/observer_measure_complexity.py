#!/usr/bin/env python3
"""Observer production-only metrics using exactly the Strategy McCabe-style counting rule.

Reuse Strategy's existing LOC and brace/AST decision counting helpers unchanged.
Only the language-specific method discovery regex is adapted for Observer names/types.
"""
import json
import re
from pathlib import Path
from measure_complexity import count_loc, py_functions, extract_brace_functions

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    'Java': ['observer/java/Main.java'],
    'Python': ['observer/python/main.py'],
    'JavaScript': ['observer/javascript/main.js'],
    'C++': ['observer/cpp/main.hpp', 'observer/cpp/main.cpp'],
}


def discovered_functions(language, source):
    if language == 'Python':
        return py_functions(source)
    if language == 'Java':
        # Visibility is optional; includes the Java observer-contract interface methods.
        pattern = r'^\s*(?:(?:public|protected|private)\s+)?(?:static\s+)?(?:void|int|String|List<MailMessage>)\s+(\w+)\s*\([^)]*\)\s*\{'
    elif language == 'JavaScript':
        pattern = r'^\s*(constructor|onDelivered|register|unregister|deliver)\s*\([^)]*\)\s*\{'
    else:
        pattern = r'^\s*(?:void|const\s+std::vector<MailMessage>&)\s+(\w+::\w+)\s*\([^)]*\)\s*(?:const\s*)?\{'
    return extract_brace_functions(source, pattern)


def main():
    results = {}
    for language, files in FILES.items():
        source = (ROOT / files[-1]).read_text(encoding='utf-8')
        funcs = discovered_functions(language, source)
        if not funcs:
            raise RuntimeError(f'Cannot discover production methods for {language}')
        results[language] = {
            'production_files': files,
            'source_loc': sum(count_loc(ROOT / f) for f in files),
            'max_function_cc': max(funcs.values()),
            'functions_cc': funcs,
        }
    output = ROOT / 'evidence' / 'observer_static_metrics.json'
    output.write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
    for language, item in results.items():
        print(f'{language}: LOC={item["source_loc"]} max CC={item["max_function_cc"]} functions={item["functions_cc"]}')


if __name__ == '__main__':
    main()
