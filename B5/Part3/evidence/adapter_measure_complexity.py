#!/usr/bin/env python3
"""S2-N01 metrics using frozen Strategy LOC/McCabe helpers (same decision rule)."""
import json
from pathlib import Path
from measure_complexity import count_loc, py_functions, extract_brace_functions

ROOT=Path(__file__).resolve().parents[1]
FILES={
    'Java':['adapter/java/Main.java'],
    'Python':['adapter/python/main.py'],
    'JavaScript':['adapter/javascript/main.js'],
    'C++':['adapter/cpp/main.hpp','adapter/cpp/main.cpp'],
}

def functions(lang,src):
    if lang=='Python': return py_functions(src)
    if lang=='Java':
        found=extract_brace_functions(src,r'^\s*(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:List<[^\n]+?>|long|boolean|OfferProvider|NormalizedOffer)\s+(\w+)\s*\([^;{}]*?\)\s*\{')
        for constructor in ('AdapterError','NormalizedOffer','AtlasAdapter','BeaconAdapter'):
            found.update({f'{constructor}.{k}':v for k,v in extract_brace_functions(src,rf'^\s*({constructor})\s*\([^;{{}}]*?\)\s*\{{').items()})
        return found
    if lang=='JavaScript':
        return extract_brace_functions(src,r'^\s*(?:function\s+)?(constructor|fields|offersFor|find|getOffer|loadRows|parseCents)\s*\([^;{}]*?\)\s*\{')
    pattern=r'^\s*(?:static\s+)?[^\n;{}]*?\s+(NormalizedOffer::fields|split|readRaw|cents|validCurrency|present|AtlasAdapter::offersFor|BeaconAdapter::offersFor|ProviderRegistry::find|BookingOfferClient::getOffer)\s*\([^;{}]*?\)\s*(?:const\s*)?\{'
    found=extract_brace_functions(src,pattern)
    for label in ('AtlasAdapter','BeaconAdapter'):
        found.update({f'{label}.{k}':v for k,v in extract_brace_functions(src,rf'^\s*({label}::{label})\s*\([^;{{}}]*?\)\s*:\s*[^;{{}}]*\{{').items()})
    return found

def main():
    stats={}
    for lang, files in FILES.items():
        paths=[ROOT/p for p in files]
        src='\n'.join(p.read_text(encoding='utf-8') for p in paths)
        found=functions(lang,src)
        if not found: raise RuntimeError(f'No functions extracted: {lang}')
        stats[lang]={'production_files':files,'source_loc':sum(count_loc(p) for p in paths),
                     'max_function_cc':max(found.values()),'functions_cc':found,
                     'methodology':'Frozen Strategy measure_complexity.py McCabe-style decisions; adapted function extraction only'}
    p=ROOT/'evidence/adapter_static_metrics.json'
    p.write_text(json.dumps(stats,indent=2)+'\n',encoding='utf-8')
    for k,v in stats.items():print(f'{k}: LOC={v["source_loc"]}, max_CC={v["max_function_cc"]}, functions={v["functions_cc"]}')
if __name__=='__main__': main()
