import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const team = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const data = JSON.parse(await fs.readFile(path.join(team, 'tools/workbook_data.json'), 'utf8'));
const wb = Workbook.create();
const blue = '#17324D', pale = '#EAF0F6', ink = '#202B36';

const summary = wb.worksheets.add('Overview');
summary.showGridLines = false;
summary.getRange('A2').values = [['PlantUML case study | Team A17']];
summary.getRange('A2').format.font = {name:'Arial',size:16,bold:true,color:blue};
summary.getRange('A4:B11').values = [
  ['Selected release','v1.2026.8'],
  ['Pinned commit','149874a1bb2b64c42889d7178cb89f6647ac14bc'],
  ['Confirmed baseline types',5],
  ['Confirmed baseline instances',5],
  ['Final instances',6],
  ['Evolution checks','20 / 20'],
  ['Cross-language checks','16 / 16 per language'],
  ['Full upstream tests','3,177 passed; 2 failed; 12 skipped in XML (10 in console), both snapshots']
];
summary.getRange('A4:A11').format.font={name:'Arial',size:10,bold:true,color:blue};
summary.getRange('B4:B11').format.font={name:'Arial',size:10,color:ink};
summary.getRange('A4:A11').format.columnWidth=28;
summary.getRange('B4:B11').format.columnWidth=66;
summary.getRange('A13').values=[['Measurement and source notes']];
summary.getRange('A13').format.font={name:'Arial',size:11,bold:true,color:blue};
summary.getRange('A14:B18').values=[
  ['Scope','Five requested pattern types in the selected class-diagram path'],
  ['Metric method','Lizard 1.24.1, same nine Java files in each snapshot'],
  ['Timing','One warm-up and five process runs; median includes startup and I/O'],
  ['LLM record','Actual interaction; human review and access tier pending'],
  ['Source','PlantUML pinned commit; exact locations in Patterns and Evolution']
];
summary.getRange('A14:A18').format.font={name:'Arial',size:10,bold:true,color:blue};
summary.getRange('B14:B18').format.font={name:'Arial',size:10,color:ink};
summary.tabColor=blue;

const names={
  'patterns.csv':'Patterns',
  'pattern_counts.csv':'Counts',
  'patterns_evolution.csv':'Evolution',
  'evolution_metrics.csv':'Metrics',
  'cross_language.csv':'Cross language',
  'llm.csv':'LLM record',
  'human_verification.csv':'Human review'
};
const numberFields=new Set(['count','source_loc','max_function_cc','median_process_ms']);
for (const [csvName,sheetName] of Object.entries(names)) {
  const sheet=wb.worksheets.add(sheetName);
  sheet.showGridLines=false;
  const records=data[csvName];
  const headers=records.headers;
  const rows=records.rows.map(row=>row.map((value,i)=>
    numberFields.has(headers[i]) && value!=='' ? Number(value) : value));
  const matrix=[headers,...rows];
  sheet.getRangeByIndexes(0,0,matrix.length,headers.length).values=matrix;
  sheet.getRangeByIndexes(0,0,1,headers.length).format={
    fill:blue,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},
    rowHeight:31,verticalAlignment:'center'
  };
  sheet.getRangeByIndexes(1,0,Math.max(rows.length,1),headers.length).format.font={name:'Arial',size:10,color:ink};
  sheet.getRangeByIndexes(1,0,Math.max(rows.length,1),headers.length).format.rowHeight=
    sheetName==='Patterns'||sheetName==='Evolution' ? 250 : 38;
  for (let i=0;i<headers.length;i++) {
    const h=headers[i];
    let width=22;
    if (h==='participant_roles'||h==='source_locations'||h==='intent_and_evidence') width=72;
    else if (h==='change_description'||h==='language_notes'||h==='evaluation') width=62;
    else if (h==='source_version'||h==='runtime_compiler') width=48;
    else if (h.endsWith('_path')||h.endsWith('_file')||h==='test_command') width=48;
    else if (h==='instance_name') width=43;
    else if (h==='pattern_name') width=22;
    sheet.getRangeByIndexes(0,i,matrix.length,1).format.columnWidth=width;
    if (h==='participant_roles'||h==='source_locations'||h==='intent_and_evidence'||
        h==='change_description'||h==='language_notes'||h==='evaluation') {
      sheet.getRangeByIndexes(1,i,Math.max(rows.length,1),1).format.wrapText=true;
      sheet.getRangeByIndexes(1,i,Math.max(rows.length,1),1).format.verticalAlignment='top';
    }
  }
  sheet.freezePanes.freezeRows(1);
  if (rows.length>0) {
    sheet.getRangeByIndexes(0,0,matrix.length,headers.length).format.borders={
      insideHorizontal:{style:'thin',color:pale}
    };
  }
}
wb.recalculate();
const check=await wb.inspect({kind:'region',sheetId:summary.sheetId,range:'A2:B11',maxChars:2000});
console.log(check.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final error scan'});
console.log(errors.ndjson);
for (const sheetName of ['Overview','Patterns','Counts','Evolution','Metrics','Cross language','LLM record','Human review']) {
  const sheet=wb.worksheets.getItem(sheetName);
  const cols=Math.min(sheet.getUsedRange().columnCount,5);
  const preview=await wb.render({sheetName,range:`A1:${String.fromCharCode(64+cols)}6`,scale:1,format:'png'});
  await fs.writeFile(path.join(team,'tools',`preview_${sheetName.replaceAll(' ','_')}.png`),new Uint8Array(await preview.arrayBuffer()));
}
const blob=await SpreadsheetFile.exportXlsx(wb);
await blob.save(path.join(team,'data/A17_Dataset.xlsx'));
console.log('Workbook exported');
