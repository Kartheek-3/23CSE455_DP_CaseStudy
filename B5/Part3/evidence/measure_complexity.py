#!/usr/bin/env python3
"""Auditable McCabe-style measurement for the four short production snippets.

Counts only production files, never runners or fixtures. Functions identified by
AST for Python and balanced-brace function bodies for other three languages.
Complexity = 1 + if/elif, loops, switch cases, catch/except, ternaries, and
one for EACH &&/||/and/or short-circuit operation. Switch/default and plain
else do not add decisions. These are source-level approximate McCabe-style
counts, not runtime instrumentation.
"""
import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    'Java': ['strategy/java/Main.java'],
    'Python': ['strategy/python/main.py'],
    'JavaScript': ['strategy/javascript/main.js'],
    'C++': ['strategy/cpp/main.hpp', 'strategy/cpp/main.cpp'],
}


def count_loc(path):
    s = path.read_text()
    excluded = set()
    if path.suffix == '.py':
        tree = ast.parse(s)
        if ast.get_docstring(tree) and isinstance(tree.body[0], ast.Expr):
            excluded.update(range(tree.body[0].lineno, tree.body[0].end_lineno + 1))
        for n in ast.walk(tree):
            if isinstance(n, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
                if getattr(n, "body", None) and isinstance(n.body[0], ast.Expr) and isinstance(n.body[0].value, ast.Constant) and isinstance(n.body[0].value.value, str):
                    excluded.update(range(n.body[0].lineno, n.body[0].end_lineno + 1))
    return sum(1 for i, line in enumerate(s.splitlines(), 1)
               if line.strip() and i not in excluded and
               not line.lstrip().startswith((('//', '/*', '*/', '*') if path.suffix != '.py' else ('#',))))


def py_functions(src):
    tree = ast.parse(src)
    results = {}
    class Walker(ast.NodeVisitor):
        def __init__(self): self.stack = []
        def visit_ClassDef(self, node):
            self.stack.append(node.name)
            self.generic_visit(node)
            self.stack.pop()
        def visit_FunctionDef(self, node):
            points = 1
            for v in ast.walk(node):
                if isinstance(v, (ast.If, ast.IfExp, ast.For, ast.AsyncFor,
                                  ast.While, ast.ExceptHandler)):
                    points += 1
                elif isinstance(v, ast.BoolOp):
                    points += len(v.values) - 1
                elif isinstance(v, ast.Match):
                    points += len(v.cases)
            results['.'.join(self.stack + [node.name])] = points
    Walker().visit(tree)
    return results


def clear_strings_and_comments(body):
    # Remove quoted strings and regex literals from token searches; retain code.
    body = re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`', '""', body)
    body = re.sub(r'(?m)^\s*//.*$', '', body)
    body = re.sub(r'(?m)^\s*#.*$', '', body)
    body = re.sub(r'/\*[\s\S]*?\*/', '', body)
    body = re.sub(r'/\^-[?]?[\\a-zA-Z0-9+*\[\]$]+/', '', body)
    return body


def extract_brace_functions(source, pattern):
    out = {}
    for m in re.finditer(pattern, source, flags=re.MULTILINE | re.DOTALL):
        label = m.group(1)
        opener = source.find('{', m.start(), m.end())
        if opener < 0: continue
        depth, closer = 0, None
        for i in range(opener, len(source)):
            if source[i] == '{': depth += 1
            elif source[i] == '}':
                depth -= 1
                if depth == 0:
                    closer = i
                    break
        if closer is not None:
            body = clear_strings_and_comments(source[opener+1:closer])
            decisions = len(re.findall(r'\b(?:if|for|while|catch|case)\s*(?:\(|\b)', body))
            decisions += body.count('&&') + body.count('||')
            decisions += len(re.findall(r'\s\?\s', body))
            key = label
            if key in out:
                key = f"{label}#{sum(x == label or x.startswith(label + chr(35)) for x in out) + 1}"
            out[key] = 1 + decisions
    return out


def functions(language, src):
    if language == 'Python': return py_functions(src)
    if language == 'Java':
        pattern = r'\b(?:public|private|protected)\s+(?:static\s+)?(?:String|int|void)\s+(\w+)\s*\([^)]*\)\s*\{'
    elif language == 'JavaScript':
        pattern = r'^\s*(constructor|feeRate|evaluate)\s*\([^)]*\)\s*\{'
    else:
        pattern = r'\b(?:int|bool|std::string)\s+((?:\w+::)?\w+)\s*\([^;]*?\)\s*(?:const\s*)?\{'
    return extract_brace_functions(src, pattern)


def run():
    result = {}
    for lang, files in FILES.items():
        paths = [ROOT / p for p in files]
        source = (ROOT / files[-1]).read_text()
        funcs = functions(lang, source)
        assert funcs, f'Function detection failed: {lang}'
        result[lang] = {
            'production_files': files,
            'source_loc': sum(count_loc(p) for p in paths),
            'max_function_cc': max(funcs.values()),
            'functions_cc': funcs,
        }
    (ROOT / 'evidence' / 'static_metrics.json').write_text(json.dumps(result, indent=2) + '\n')
    for lang, values in result.items():
        print(f'{lang}: LOC={values["source_loc"]} MAX_CC={values["max_function_cc"]}: {values["functions_cc"]}')

if __name__ == '__main__': run()
