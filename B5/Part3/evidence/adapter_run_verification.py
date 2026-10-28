#!/usr/bin/env python3
"""S2-N01: immutable fixtures, actual compile/test and 1+5 fresh processes."""
import csv,hashlib,json,statistics,subprocess,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
JOBS=[
 ('Java','java',['javac','Main.java','TestMain.java'],['java','TestMain']),
 ('Python','python',None,['python3','test_main.py']),
 ('JavaScript','javascript',None,['node','test_main.js']),
 ('C++','cpp',['g++','-std=c++17','-O2','-Wall','-Wextra','-pedantic','main.cpp','test_main.cpp','-o','adapter_tests'],['./adapter_tests']),
]
VERSIONS=[('java',['java','-version']),('javac',['javac','-version']),('python3',['python3','--version']),('node',['node','--version']),('g++',['g++','--version'])]

def run(cmd,where):
    start=time.perf_counter_ns()
    p=subprocess.run(cmd,cwd=where,capture_output=True,text=True)
    return p,(time.perf_counter_ns()-start)/1000000

def main():
    frozen=json.loads((ROOT/'adapter/frozen_fixtures_sha256.json').read_text())
    for name,h in frozen.items():
        if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=h: raise RuntimeError('Fixture mutated: '+name)
    rows=(ROOT/'common_specs/adapter_cases.tsv').read_text().splitlines()
    expected=(ROOT/'common_specs/adapter_expected.tsv').read_text().splitlines()[1:]
    if len(rows)!=11 or len(expected)!=10:raise RuntimeError('Invalid fixture counts')
    versions={}
    for name,command in VERSIONS:
        process,_=run(command,ROOT)
        if process.returncode:raise RuntimeError('Missing version: '+name)
        versions[name]=(process.stdout or process.stderr).strip().splitlines()[0]
    (ROOT/'evidence/adapter_environment_versions.json').write_text(json.dumps(versions,indent=2)+'\n')
    compilation=[];results={}
    for lang,folder,compile_cmd,test_cmd in JOBS:
        cwd=ROOT/'adapter'/folder
        if compile_cmd:
            process,_=run(compile_cmd,cwd)
            compilation.append({'language':lang,'command':' '.join(compile_cmd),'exit_code':process.returncode,'stdout':process.stdout,'stderr':process.stderr})
            if process.returncode:raise RuntimeError(f'{lang} compile failed: {process.stderr}')
        proc,_=run(test_cmd,cwd)
        evidence=(f'Command: {" ".join(test_cmd)}\nWorking directory: Part3/adapter/{folder}\nExit code: {proc.returncode}\n\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}')
        (cwd/'test_result.txt').write_text(evidence,encoding='utf-8')
        signature='passed=10/10 failures=0 errors=0 skipped=0; extra_isolation_checks=passed'
        if proc.returncode or proc.stdout.splitlines()!=expected or signature not in proc.stderr:
            raise RuntimeError(f'{lang} failed: {evidence}')
        measurements=[]
        for i in range(6):
            trial,elapsed=run(test_cmd,cwd)
            if trial.returncode or trial.stdout.splitlines()!=expected or signature not in trial.stderr:
                raise RuntimeError(f'{lang} repeat {i} failed')
            measurements.append({'run':'warmup' if i==0 else f'measure_{i}', 'elapsed_ms':round(elapsed,6),
                                 'exit_code':trial.returncode, 'passed':10,'total':10})
        with (cwd/'timings.csv').open('w',newline='',encoding='utf-8') as f:
            writer=csv.DictWriter(f,fieldnames=['run','elapsed_ms','exit_code','passed','total'])
            writer.writeheader();writer.writerows(measurements)
        times=[x['elapsed_ms'] for x in measurements[1:]]
        results[lang]={'language_folder':folder,'test_command':' '.join(test_cmd),'exit_code':0,'passed':10,'total':10,
                       'failures':0,'errors':0,'skipped':0, 'additional_isolation_checks':'passed',
                       'warmup_ms':measurements[0]['elapsed_ms'], 'five_measurements_ms':times,
                       'median_process_ms':statistics.median(times)}
        print(lang,'10/10',times,'median=',results[lang]['median_process_ms'],flush=True)
    (ROOT/'evidence/adapter_compilation_results.json').write_text(json.dumps(compilation,indent=2)+'\n')
    (ROOT/'evidence/adapter_execution_results.json').write_text(json.dumps(results,indent=2)+'\n')
    print('Versions:',json.dumps(versions))
if __name__=='__main__': main()
