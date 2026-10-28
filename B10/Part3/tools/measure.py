"""Timing script for the Part 3 test runners (dev tool, not part of the comparison).

For each pattern and language:
  1. compile outside the timed runs (javac / g++ -std=c++14 -O2),
  2. run the test-runner process once as a warmup,
  3. run it five more times and time each run with time.perf_counter() around subprocess.run().
The measured time is the whole process: interpreter/JVM startup, reading the CSV and running all cases.
Every individual run time and the median of the five measured runs are written to
Part3/evidence/timings_<pattern>.txt.

Usage (from Part3/):  python tools/measure.py [pattern ...]     (default: all patterns)
"""
import os
import statistics
import subprocess
import sys
import time

PART3 = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def find_venv(start):
    """Return the .venv-mycodo folder in the nearest parent of start (it lives outside the team folder)."""
    d = os.path.abspath(start)
    while not os.path.isdir(os.path.join(d, '.venv-mycodo')):
        if os.path.dirname(d) == d:
            raise SystemExit('.venv-mycodo not found in any parent folder')
        d = os.path.dirname(d)
    return os.path.join(d, '.venv-mycodo')


EVIDENCE = os.path.join(PART3, 'evidence')
# Java needs JDK 21. If JAVA_HOME is set, its bin folder is put first on PATH so that "javac"/"java"
# below are that JDK (on the measuring machine the java on PATH is 1.8).
if os.environ.get('JAVA_HOME'):
    os.environ['PATH'] = os.path.join(os.environ['JAVA_HOME'], 'bin') + os.pathsep + os.environ['PATH']
JAVAC = 'javac'
JAVA = 'java'
PYTHON = 'python'
NODE = 'node'
GXX = 'g++'
LANGUAGES = ['java', 'python', 'javascript', 'cpp']

# pattern key -> (folder, display name, {language: (production file, test runner file)})
PATTERNS = {
    'template_method': ('template_method_setpoint_interpolation', 'Template Method', {
        'java': ('DateMethod.java', 'SetpointInterpolationTest.java'),
        'python': ('setpoint_interpolation.py', 'test_setpoint_interpolation.py'),
        'javascript': ('setpoint_interpolation.js', 'test_setpoint_interpolation.js'),
        'cpp': ('setpoint_interpolation.hpp', 'test_setpoint_interpolation.cpp')}),
    'strategy': ('strategy_setpoint_schedule', 'Strategy', {
        'java': ('AbstractMethod.java', 'SetpointScheduleTest.java'),
        'python': ('setpoint_schedule.py', 'test_setpoint_schedule.py'),
        'javascript': ('setpoint_schedule.js', 'test_setpoint_schedule.js'),
        'cpp': ('setpoint_schedule.hpp', 'test_setpoint_schedule.cpp')}),
    'adapter': ('adapter_sensor_driver', 'Adapter', {
        'java': ('AbstractInput.java', 'SensorDriverTest.java'),
        'python': ('sensor_driver.py', 'test_sensor_driver.py'),
        'javascript': ('sensor_driver.js', 'test_sensor_driver.js'),
        'cpp': ('sensor_driver.hpp', 'test_sensor_driver.cpp')}),
    'proxy': ('proxy_daemon_rpc', 'Proxy', {
        'java': ('DaemonControl.java', 'DaemonRpcTest.java'),
        'python': ('daemon_rpc.py', 'test_daemon_rpc.py'),
        'javascript': ('daemon_rpc.js', 'test_daemon_rpc.js'),
        'cpp': ('daemon_rpc.hpp', 'test_daemon_rpc.cpp')}),
    'command': ('command_automation_actions', 'Command', {
        'java': ('AbstractFunctionAction.java', 'AutomationActionsTest.java'),
        'python': ('automation_actions.py', 'test_automation_actions.py'),
        'javascript': ('automation_actions.js', 'test_automation_actions.js'),
        'cpp': ('automation_actions.hpp', 'test_automation_actions.cpp')}),
    'plugin': ('plugin_module_loading', 'Plugin', {
        'java': ('InputController.java', 'ModuleLoadingTest.java'),
        'python': ('module_loading.py', 'test_module_loading.py'),
        'javascript': ('module_loading.js', 'test_module_loading.js'),
        'cpp': ('module_loading.hpp', 'test_module_loading.cpp')}),
    'layer_supertype': ('layer_supertype_module_base', 'Layer Supertype', {
        'java': ('AbstractBaseController.java', 'ModuleBaseTest.java'),
        'python': ('module_base.py', 'test_module_base.py'),
        'javascript': ('module_base.js', 'test_module_base.js'),
        'cpp': ('module_base.hpp', 'test_module_base.cpp')}),
    'active_record': ('active_record_user_role', 'Active Record', {
        'java': ('CRUDMixin.java', 'UserRoleTest.java'),
        'python': ('user_role.py', 'test_user_role.py'),
        'javascript': ('user_role.js', 'test_user_role.js'),
        'cpp': ('user_role.hpp', 'test_user_role.cpp')}),
}


def folder(pattern, language):
    return os.path.join(PART3, PATTERNS[pattern][0], language)


def rel(path):
    """Path relative to the team folder, for logs."""
    return os.path.relpath(path, os.path.dirname(PART3)).replace(os.sep, '/')


def shown(command, cwd):
    """Command as text for logs: absolute paths (the C++ executable) relative to the working folder."""
    return ' '.join(os.path.relpath(c, cwd) if os.path.isabs(c) else c for c in command)


def compile_command(pattern, language):
    production, runner = PATTERNS[pattern][2][language]
    if language == 'java':
        return [JAVAC, '-d', 'out', production, runner]
    if language == 'cpp':
        return [GXX, '-std=c++14', '-O2', '-Wall', '-o', runner.replace('.cpp', '.exe'), runner]
    return None


def run_command(pattern, language):
    production, runner = PATTERNS[pattern][2][language]
    if language == 'java':
        return [JAVA, '-cp', 'out', runner.replace('.java', '')]
    if language == 'python':
        return [PYTHON, runner]
    if language == 'javascript':
        return [NODE, runner]
    return [os.path.join(folder(pattern, language), runner.replace('.cpp', '.exe'))]


def compile_runner(pattern, language):
    command = compile_command(pattern, language)
    if command is None:
        return None
    return subprocess.run(command, cwd=folder(pattern, language), capture_output=True, text=True)


def timed_run(pattern, language):
    start = time.perf_counter()
    result = subprocess.run(run_command(pattern, language), cwd=folder(pattern, language),
                            capture_output=True, text=True)
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    return elapsed_ms, result


def measure(pattern):
    lines = [f'# Timings for {PATTERNS[pattern][1]} ({PATTERNS[pattern][0]})',
             '# time.perf_counter() around subprocess.run(); 1 warmup + 5 measured runs; milliseconds',
             f'# machine: <host> (one Windows PC), measured with Python {sys.version.split()[0]}', '']
    for language in LANGUAGES:
        compiled = compile_runner(pattern, language)
        if compiled is not None and compiled.returncode != 0:
            lines += [f'[{language}] compile FAILED', compiled.stdout + compiled.stderr, '']
            continue
        warmup_ms, _ = timed_run(pattern, language)
        runs = []
        last = None
        for _ in range(5):
            elapsed_ms, last = timed_run(pattern, language)
            runs.append(elapsed_ms)
        lines += [f'[{language}]',
                  f'working folder: {rel(folder(pattern, language))}',
                  f'compile command: {shown(compile_command(pattern, language) or ["(none)"], folder(pattern, language))}',
                  f'run command: {shown(run_command(pattern, language), folder(pattern, language))}',
                  f'warmup_ms: {warmup_ms:.3f}']
        lines += [f'run_{i + 1}_ms: {ms:.3f}' for i, ms in enumerate(runs)]
        lines += [f'median_ms: {statistics.median(runs):.3f}',
                  f'last run exit code: {last.returncode}; last line: {last.stdout.strip().splitlines()[-1] if last.stdout.strip() else ""}',
                  '']
    path = os.path.join(EVIDENCE, f'timings_{pattern}.txt')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'wrote {path}')


if __name__ == '__main__':
    for key in (sys.argv[1:] or list(PATTERNS)):
        measure(key)
