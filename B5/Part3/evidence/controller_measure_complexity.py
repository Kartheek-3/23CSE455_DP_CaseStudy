#!/usr/bin/env python3
"""Controller production-only LOC and CC, reusing frozen Strategy counting functions.

Exactly the original measure_complexity.py count_loc/py_functions/extract_brace_functions
and McCabe decision-point rule, with Controller-specific function discovery patterns.
Constructor expressions and default trivial constructors have base CC=1.
"""
import json
import re
from pathlib import Path
from measure_complexity import count_loc, py_functions, extract_brace_functions

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    'Java': ['controller/java/Main.java'],
    'Python': ['controller/python/main.py'],
    'JavaScript': ['controller/javascript/main.js'],
    'C++': ['controller/cpp/main.hpp', 'controller/cpp/main.cpp'],
}


def discovered_functions(language, source):
    if language == 'Python':
        return py_functions(source)
    if language == 'Java':
        pattern = r'^\s*(?:(?:public|protected|private)\s+)?(?:static\s+)?(?:String|boolean|void|Trip|TripMember|Account|TripStore|CoverTaskQueue|TripCreationController)\s+(\w+)\s*\([^)]*\)\s*\{'
        # Separately include constructor bodies; their syntax does not have a return type.
        functions = extract_brace_functions(source, pattern)
        for class_name in ['Trip', 'TripMember', 'Account', 'TripCreationController']:
            cons = extract_brace_functions(source, rf'^\s*({class_name})\s*\([^)]*\)\s*\{{')
            for key, cc in cons.items():
                functions[f'{key}#constructor'] = cc
        return functions
    if language == 'JavaScript':
        return extract_brace_functions(source, r'^\s*(?:function\s+)?(constructor|addMembership|add|enqueue|create|validGregorian)\s*\([^)]*\)\s*\{')
    pattern = r'^\s*(?:void|bool|std::string)\s+((?:\w+::)?\w+)\s*\([^;]*?\)\s*(?:const\s*)?\{'
    functions = extract_brace_functions(source, pattern)
    for name in ['Account', 'TripCreationController']:
        cons = extract_brace_functions(source, rf'^\s*({name}::{name})\s*\([^)]*\)\s*:\s*[^\{{]*\{{')
        functions.update({f'{k}#constructor': cc for k, cc in cons.items()})
    return functions


def main():
    data = {}
    for lang, files in FILES.items():
        paths = [ROOT / f for f in files]
        source = '\n'.join(p.read_text(encoding='utf-8') for p in paths)
        funcs = discovered_functions(lang, source)
        if not funcs:
            raise AssertionError(f'No production functions found: {lang}')
        data[lang] = {
            'production_files': files,
            'source_loc': sum(count_loc(p) for p in paths),
            'max_function_cc': max(funcs.values()),
            'functions_cc': funcs,
        }
    (ROOT / 'evidence' / 'controller_static_metrics.json').write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
    for lang, item in data.items():
        print(f'{lang}: LOC={item["source_loc"]}; maximum CC={item["max_function_cc"]}; functions={item["functions_cc"]}')


if __name__ == '__main__':
    main()
