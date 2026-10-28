"""Build Part3/llm/pattern_crosslanguage.csv from the raw evidence (dev tool).

Every number is read from the raw tool output in Part3/evidence/:
  source_loc        = lizard NLOC of the production file (per-file table of lizard_<pattern>.txt)
  max_function_cc   = highest CCN among lizard's function rows for that file
  test_result       = "<passed>/<total>" from the final line of tests_<pattern>_<language>.txt
  median_process_ms = median_ms of that language in timings_<pattern>.txt
Usage (from Part3/):  python tools/collect_results.py
"""
import csv
import os
import re

from measure import EVIDENCE, LANGUAGES, PART3, PATTERNS, compile_command, run_command, shown
from measure import folder as language_folder

INSTANCES = {'template_method': 'Date/Daily Setpoint Interpolation', 'strategy': 'Setpoint Schedule Calculation',
             'adapter': 'Sensor Driver Adaptation', 'proxy': 'Daemon RPC Client', 'command': 'Automation/Alert Actions',
             'plugin': 'Input/Output Module Loading', 'layer_supertype': 'Daemon Module Base',
             'active_record': 'User and Role Persistence'}
RUNTIME = {'java': 'OpenJDK 21.0.2 (javac 21.0.2)', 'python': 'CPython 3.12.7',
           'javascript': 'Node.js v23.11.0', 'cpp': 'MinGW g++ 6.3.0 -std=c++14 -O2'}

NOTES = {
    'template_method': {
        'java': 'Concrete base DateMethod with a final template calculateSetpoint and a protected hook ignoreDate overridden (@Override) by DailyMethod; checked at compile time; objects garbage-collected.',
        'python': 'Plain base class DateMethod; DailyMethod overrides the hook ignore_date; nothing stops a subclass from overriding the template; checked only at run time; garbage-collected.',
        'javascript': 'ES class DateMethod with hook ignoreDate overridden via extends; method lookup only at run time; garbage-collected.',
        'cpp': 'Non-virtual calculate_setpoint calls a protected virtual ignore_date overridden (override) by DailyMethod; checked at compile time; rows by value, method owned by std::unique_ptr in the runner.'},
    'strategy': {
        'java': 'Concrete base class AbstractMethod (also the fallback strategy) with overriding subclasses; createMethodHandler returns the base type; checked at compile time; garbage-collected.',
        'python': 'Duck-typed strategies sharing the AbstractMethod base; calculate_setpoint resolved at run time; garbage-collected.',
        'javascript': 'Class hierarchy with calculateSetpoint resolved at run time; results as [setpoint, ended] arrays; garbage-collected.',
        'cpp': 'Virtual calculate_setpoint; create_method_handler returns std::unique_ptr<AbstractMethod>; CascadeMethod owns its linked strategies in a vector of unique_ptr; checked at compile time.'},
    'adapter': {
        'java': 'Target is an abstract class (abstract getMeasurement); adapters hold the adaptee by reference (object adapter); checked at compile time; garbage-collected.',
        'python': 'Target base class raises NotImplementedError; adapters hold the adaptee (object adapter); checked at run time; garbage-collected.',
        'javascript': 'Target base class throws in getMeasurement; adapters hold the adaptee; checked at run time; garbage-collected.',
        'cpp': 'Target has a pure virtual get_measurement; adapters hold non-owning pointers to adaptees owned by the caller; checked at compile time.'},
    'proxy': {
        'java': 'Explicit Subject interface DaemonApi implemented by Daemon, RemoteProxy and DaemonControl; checked at compile time; garbage-collected.',
        'python': 'No Subject interface (as in the source): RemoteProxy forwards any attribute via __getattr__; mismatches only fail at run time; garbage-collected.',
        'javascript': 'RemoteProxy returns an ES Proxy whose get trap forwards any method to the daemon; checked at run time; garbage-collected.',
        'cpp': 'Abstract DaemonApi with pure virtual methods; DaemonControl::proxy returns std::unique_ptr<RemoteProxy>; network holds non-owning Daemon pointers; checked at compile time.'},
    'command': {
        'java': 'Abstract class with abstract runAction and a DictVars request class; invoker maps ids to commands; checked at compile time; garbage-collected.',
        'python': 'Base run_action is a no-op (as in the source); dict_vars is a dict so a missing message raises KeyError naturally; checked at run time; garbage-collected.',
        'javascript': 'Base class with runAction; an explicit appendMessage check is needed because undefined + string does not throw; checked at run time; garbage-collected.',
        'cpp': 'Pure virtual run_action; ActionInvoker owns commands via std::unique_ptr; commands hold receivers by reference; checked at compile time.'},
    'plugin': {
        'java': 'Catalogue of Supplier<PluginModule> lambdas with constructor references (SoilInputModule::new); plugin contract is an abstract class; checked at compile time; garbage-collected.',
        'python': 'Catalogue of lambdas returning module objects; classes are first-class values instantiated by the host; checked at run time; garbage-collected.',
        'javascript': 'Classes are values with static INPUT_INFORMATION fields; host calls new on the loaded class; checked at run time; garbage-collected.',
        'cpp': 'std::function factories plus a template make_input<T>; loader returns std::unique_ptr<PluginModule>, host returns std::unique_ptr<AbstractInput>; checked at compile time.'},
    'layer_supertype': {
        'java': 'Abstract class AbstractBaseController inherited by AbstractInput/AbstractFunction; options in Map<String,Object>; checked at compile time; garbage-collected.',
        'python': 'Plain base class shared by two members; options in a dict; checked at run time; garbage-collected.',
        'javascript': 'Base class shared via extends; options in a plain object; checked at run time; garbage-collected.',
        'cpp': 'Base class with protected helpers; OptionValue struct instead of std::variant (C++14); OptionStore held by reference; checked at compile time.'},
    'active_record': {
        'java': 'Abstract CRUDMixin with abstract column-metadata methods implemented by User/Role; Session keeps object references; checked at compile time; garbage-collected.',
        'python': 'Mixin base class; models declare UNIQUE/REQUIRED class attributes read with getattr; checked at run time; garbage-collected.',
        'javascript': 'Base class with static UNIQUE/REQUIRED fields and obj[column] access; checked at run time; garbage-collected.',
        'cpp': 'Abstract CRUDMixin with pure virtual column metadata; Session stores non-owning raw pointers and the runner owns records via std::unique_ptr; delete() renamed del() because delete is a keyword.'},
}


def lizard_numbers(key, production_path):
    text = open(os.path.join(EVIDENCE, f'lizard_{key}.txt'), encoding='utf-8').read()
    nloc = None
    for line in text.splitlines():
        m = re.match(r'^\s*(\d+)\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+\d+\s+(\S+)$', line)
        if m and m.group(2) == production_path:
            nloc = int(m.group(1))
    ccns = [int(m.group(1)) for m in re.finditer(r'^\s*\d+\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\S+@\d+-\d+@(\S+)$', text, re.M)
            if m.group(2) == production_path]
    return nloc, max(ccns)


def test_result(key, language):
    text = open(os.path.join(EVIDENCE, f'tests_{key}_{language}.txt'), encoding='utf-8').read()
    m = re.findall(r'tests: (\d+)/(\d+) passed', text)
    return f'{m[-1][0]}/{m[-1][1]}' if m else 'not_run - no test output'


def median_ms(key, language):
    text = open(os.path.join(EVIDENCE, f'timings_{key}.txt'), encoding='utf-8').read()
    block = text.split(f'[{language}]')[1].split('\n[')[0]
    return re.search(r'median_ms: ([\d.]+)', block).group(1)


def test_command(key, language):
    cwd = f'Part3/{PATTERNS[key][0]}/{language}'
    steps = [compile_command(key, language), run_command(key, language)]
    text = ' && '.join(shown(s, language_folder(key, language)) for s in steps if s)
    return f'(cd {cwd}) {text}'


LANGUAGE_NAME = {'java': 'Java', 'python': 'Python', 'javascript': 'JavaScript', 'cpp': 'C++'}

rows = []
for key, (folder, name, files) in PATTERNS.items():
    for language in LANGUAGES:
        production = files[language][0]
        nloc, max_cc = lizard_numbers(key, f'{language}/{production}')
        rows.append([name, INSTANCES[key], LANGUAGE_NAME[language], f'Part3/{folder}/{language}/{production}', nloc, max_cc,
                     RUNTIME[language], test_command(key, language), test_result(key, language),
                     median_ms(key, language), NOTES[key][language]])

out = os.path.join(PART3, 'llm', 'pattern_crosslanguage.csv')
with open(out, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['pattern_name', 'instance_name', 'language', 'snippet_path', 'source_loc', 'max_function_cc',
                     'runtime_compiler', 'test_command', 'test_result', 'median_process_ms', 'language_notes'])
    writer.writerows(rows)
print(f'wrote {out} ({len(rows)} rows)')
for r in rows:
    print(f'{r[0]:16s} {r[2]:10s} loc={r[4]:4} cc={r[5]:3} {r[8]:6s} {r[9]:>8s} ms')
