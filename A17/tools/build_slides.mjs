import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const team=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const root=path.dirname(team);
const build=path.join(root,'slide-build');
await fs.mkdir(build,{recursive:true});
const deck=Presentation.create({slideSize:{width:1280,height:720}});
const navy='#17324D', gray='#4B5563', rust='#A35425', cream='#FFFFFF';

function slide(title,number) {
  const s=deck.slides.add();
  s.background.fill=cream;
  textbox(s,title,{left:64,top:49,width:1120,height:66},38,true,navy);
  textbox(s,`A17 · PlantUML v1.2026.8 · ${number}/7`,{left:64,top:670,width:1120,height:24},15,false,gray);
  return s;
}
function textbox(s,value,position,fontSize=24,bold=false,color=gray) {
  const shape=s.shapes.add({geometry:'textbox',position,fill:'none',line:{style:'solid',fill:'none',width:0}});
  shape.text=value;
  shape.text.style={fontFamily:'Arial',fontSize,bold,color};
  return shape;
}
async function img(s,relative,position) {
  const bytes=await fs.readFile(path.join(team,relative));
  s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:relative,fit:'contain',position});
}

let s=deck.slides.add();s.background.fill=cream;
textbox(s,'Design patterns in PlantUML',{left:76,top:155,width:1120,height:90},54,true,navy);
textbox(s,'Class-diagram parsing, rendering and controlled evolution',{left:76,top:264,width:1100,height:70},29,false,gray);
textbox(s,'23CSE455 · Team A17 · 11 October 2026',{left:76,top:507,width:1100,height:35},21,false,rust);
textbox(s,'Sathvik Pasuvula · P Sai Satvik Chowdary',{left:76,top:552,width:1100,height:32},20,false,gray);

s=slide('The path from text to SVG',2);
textbox(s,'class Order\nclass Customer\nOrder --> Customer',{left:70,top:172,width:475,height:158},26,false,navy);
textbox(s,'The parser selects command objects. They construct Entity and Link objects in ClassDiagram. A layout backend returns a TextBlock, which the exporter draws to SVG or PNG.',{left:70,top:370,width:520,height:215},25,false,gray);
await img(s,'Part1/diagrams/architecture.png',{left:785,top:133,width:260,height:504});

s=slide('Five source-verified collaborations',3);
textbox(s,'Command\nFactory Method\nStrategy\nComposite\nAdapter',{left:75,top:164,width:360,height:440},32,true,navy);
textbox(s,'Class command dispatch\nClassDiagram product creation\nLayout backend selection\nText-block composition\nVizJs stream conversion',{left:472,top:166,width:700,height:440},30,false,gray);

s=slide('Three implemented changes',4);
textbox(s,'CH01  Review status\nCH02  Review palette\nCH03  SVG attribute',{left:70,top:155,width:520,height:210},30,true,navy);
textbox(s,'[review=pending] appears in the class header.\nPastel and mono are selectable fill policies.\nEnabled SVG exports data-review-status.',{left:70,top:375,width:580,height:190},24,false,gray);
await img(s,'Part2/evidence/CH02/palette.png',{left:785,top:210,width:330,height:332});

s=slide('The SVG serializer was a real extension point',5);
await img(s,'Part2/diagrams/review-policy.png',{left:60,top:148,width:1135,height:382});
textbox(s,'The first metadata patch reached UGroup but produced no attribute. PortableSvgDocument accepts only named keys; adding the new key fixed the failing integration check.',{left:70,top:556,width:1120,height:84},22,false,gray);

s=slide('Equivalent behavior in four languages',6);
textbox(s,'16 shared cases passed in each language',{left:70,top:151,width:1110,height:55},30,true,navy);
textbox(s,'Java          106 LOC        27.206 ms\nPython      101 LOC        16.827 ms\nJavaScript   97 LOC        21.728 ms\nC++           156 LOC         2.279 ms',{left:76,top:248,width:1120,height:300},27,false,navy);
textbox(s,'Median of five fresh processes after one warm-up. Startup and input/output are included; compilation is excluded.',{left:75,top:568,width:1115,height:66},20,false,gray);

s=slide('Verification and submission status',7);
textbox(s,'20 / 20',{left:75,top:158,width:350,height:74},48,true,navy);
textbox(s,'Final PlantUML integration checks passed',{left:430,top:171,width:770,height:58},26,false,gray);
textbox(s,'3,177 passed · 2 failed · 12 skipped (XML)',{left:75,top:283,width:1100,height:58},30,true,rust);
textbox(s,'The console reports 10 skipped; XML includes two more skipped entries in both trees. The same Picoweb tests fail. Human review, faculty approval and repository upload remain to be recorded.',{left:75,top:375,width:1110,height:140},22,false,gray);
textbox(s,'Source: pinned PlantUML commit 149874a1bb2b64c42889d7178cb89f6647ac14bc; report and evidence in A17.',{left:75,top:595,width:1110,height:44},16,false,gray);

for (let i=0;i<deck.slides.items.length;i++) {
  const png=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});
  await fs.writeFile(path.join(build,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
const skill='/Users/sathvik/.codex/plugins/cache/openai-primary-runtime/presentations/26.1009.11318/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const draft=path.join(build,'candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(draft);
const final=path.join(team,'Part3/A17_Slides.pptx');
const result=await finalizePresentation({
  workspaceDir:root,candidatePath:draft,finalPath:final,
  pythonExecutable:'/Users/sathvik/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
  integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],
  explicitTotalSlideCount:7,
  fontPolicy:{basis:'design',families:['Aptos']},
  verifyArtifactToolImport:true,
  receiptPath:path.join(build,'validation.json')
});
console.log(JSON.stringify(result));
