#!/usr/bin/env python3
"""Reuse frozen McCabe counting helpers; extend only role-specific function discovery."""
import json
import re
from pathlib import Path
from measure_complexity import count_loc, py_functions, extract_brace_functions

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    'Java': ['information_expert/java/Main.java'],
    'Python': ['information_expert/python/main.py'],
    'JavaScript': ['information_expert/javascript/main.js'],
    'C++': ['information_expert/cpp/main.hpp', 'information_expert/cpp/main.cpp'],
}


def functions(language, source):
    if language == 'Python':
        return py_functions(source)
    if language == 'Java':
        pattern = r'^\s*(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:void|String|boolean|LinkResult)\s+(\w+)\s*\([^)]*\)\s*\{'
        found = extract_brace_functions(source, pattern)
        for name in ['TripItem', 'Trip', 'LinkResult', 'InboxItem']:
            found.update({f'{key}#constructor': value for key, value in extract_brace_functions(source, rf'^\s*({name})\s*\([^)]*\)\s*\{{').items()})
        return found
    if language == 'JavaScript':
        found = extract_brace_functions(source, r'^\s*(?:function\s+)?(missing|display|constructor|linkOrCreateTripItem|review)\s*\([^)]*\)\s*\{')
        return found
    found = extract_brace_functions(source, r'^\s*(?:static\s+)?(?:bool|std::string|LinkResult)\s+((?:\w+::)?\w+)\s*\([^;]*?\)\s*(?:const\s*)?\{')
    ctor = extract_brace_functions(source, r'^\s*(InboxItem::InboxItem)\s*\([^;]*?\)\s*:\s*[^\{]*\{')
    found.update({f'{key}#constructor': value for key, value in ctor.items()})
    return found


def main():
    stats = {}
    for language, files in FILES.items():
        paths = [ROOT / p for p in files]
        source = '\n'.join(p.read_text(encoding='utf-8') for p in paths)
        funcs = functions(language, source)
        if not funcs:
            raise RuntimeError(f'No methods discovered in {language}')
        stats[language] = {
            'production_files': files,
            'source_loc': sum(count_loc(p) for p in paths),
            'max_function_cc': max(funcs.values()),
            'functions_cc': funcs,
            'methodology': 'Frozen McCabe-style 1 + decisions; original count_loc/py_functions/extract_brace_functions'
        }
    (ROOT / 'evidence' / 'information_expert_static_metrics.json').write_text(json.dumps(stats, indent=2) + '\n', encoding='utf-8')
    for language, m in stats.items():
        print(f'{language}: LOC={m["source_loc"]} max_function_cc={m["max_function_cc"]} functions={m["functions_cc"]}')

if __name__ == '__main__':
    main()
