import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const previewDir = path.join(root, "..", "tmp", "spreadsheets");
const fontFamily = "Arial";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"'; i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value); value = "";
    } else if (char === "\n") {
      row.push(value); rows.push(row); row = []; value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }
  if (value.length || row.length) { row.push(value); rows.push(row); }
  return rows.filter((item) => item.some((cell) => cell !== ""));
}

function columnName(index) {
  let n = index + 1;
  let result = "";
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

function coerce(rows, name) {
  const numeric = {
    "Pattern Counts": new Set([3]),
    "Cross Language": new Set([4, 5, 9]),
    Metrics: new Set([1, 2, 3, 4, 5, 6, 7, 8]),
    Contributions: new Set([3, 6]),
  }[name] || new Set();
  return rows.map((row, r) => row.map((cell, c) => {
    if (r > 0 && numeric.has(c) && cell !== "") return Number(cell);
    return cell;
  }));
}

function styleDataSheet(sheet, rows, options = {}) {
  const lastRow = rows.length;
  const lastCol = columnName(rows[0].length - 1);
  const used = sheet.getRange(`A1:${lastCol}${lastRow}`);
  used.format.font = { name: fontFamily, size: 10, color: "#1F2937" };
  used.format.verticalAlignment = "center";
  const header = sheet.getRange(`A1:${lastCol}1`);
  header.format = {
    fill: "#1F4E78",
    font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: "#FFFFFF" },
  };
  header.format.rowHeight = 34;
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  if (options.freezeColumns) sheet.freezePanes.freezeColumns(options.freezeColumns);
  const table = sheet.tables.add(`A1:${lastCol}${lastRow}`, true, options.tableName);
  table.style = "TableStyleMedium2";
  table.showBandedRows = true;
  table.showFilterButton = true;

  for (let c = 0; c < rows[0].length; c += 1) {
    const col = sheet.getRange(`${columnName(c)}1:${columnName(c)}${lastRow}`);
    col.format.columnWidth = Math.min(Math.max(12, options.widths?.[c] || 16), 48);
    if ((options.wrapColumns || []).includes(c)) col.format.wrapText = true;
  }
  if (lastRow > 1) sheet.getRange(`A2:${lastCol}${lastRow}`).format.rowHeight = options.rowHeight || 42;
  sheet.tabColor = options.tabColor || "#5B9BD5";
}

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const specs = [
  ["patterns.csv", "Patterns", "PatternsTable", [18, 20, 18, 28, 44, 48, 48], [3, 4, 5, 6], 55],
  ["pattern_counts.csv", "Pattern Counts", "PatternCountsTable", [18, 22, 28, 12], [], 22],
  ["patterns_evolution.csv", "Evolution", "EvolutionTable", [18, 20, 18, 28, 42, 46, 46, 20, 42], [3, 4, 5, 6, 8], 58],
  ["cross_language.csv", "Cross Language", "CrossLanguageTable", [16, 25, 15, 38, 12, 14, 27, 48, 16, 18, 48], [1, 3, 6, 7, 8, 10], 52],
  ["llm.csv", "LLM Records", "LLMTable", [24, 28, 44, 38, 44, 52, 44], [0, 1, 2, 3, 4, 5, 6], 56],
  ["metrics.csv", "Metrics", "MetricsTable", [18, 18, 14, 14, 14, 16, 18, 24, 24, 50], [9], 34],
  ["contributions.csv", "Contributions", "ContributionsTable", [28, 18, 18, 18, 42, 48, 16, 18], [4, 5], 46],
];

for (const [file, name, tableName, widths, wrapColumns, rowHeight] of specs) {
  const text = await fs.readFile(path.join(dataDir, file), "utf8");
  const rows = coerce(parseCsv(text), name);
  const sheet = workbook.worksheets.add(name);
  sheet.getRange("A1").write(rows);
  styleDataSheet(sheet, rows, {
    tableName,
    widths,
    wrapColumns,
    rowHeight,
    freezeColumns: name === "Evolution" || name === "Patterns" ? 1 : 0,
    tabColor: name === "Metrics" ? "#70AD47" : name === "Contributions" ? "#A5A5A5" : "#5B9BD5",
  });
  if (name === "Cross Language") {
    sheet.getRange(`E2:F${rows.length}`).format.numberFormat = "0";
    sheet.getRange(`J2:J${rows.length}`).format.numberFormat = "0";
  }
  if (name === "Metrics") sheet.getRange(`B2:I${rows.length}`).format.numberFormat = "0";
  if (name === "Contributions") {
    sheet.getRange(`D2:D${rows.length}`).format.numberFormat = "0%";
    sheet.getRange(`D2:D${rows.length}`).values = rows.slice(1).map((row) => [row[3] / 100]);
    sheet.getRange(`H2:H${rows.length}`).conditionalFormats.add("containsText", {
      text: "Pending",
      format: { fill: "#FFF2CC", font: { bold: true, color: "#9C6500" } },
    });
  }
}

summary.showGridLines = false;
summary.tabColor = "#17365D";
summary.getRange("A2:H2").merge();
summary.getRange("A2").values = [["B4 Property Rental Design Pattern Case Study"]];
summary.getRange("A2:H2").format = {
  font: { name: fontFamily, size: 16, bold: true, color: "#17365D" },
  verticalAlignment: "center",
};
summary.getRange("A3:H3").format.borders = { bottom: { style: "medium", color: "#5B9BD5" } };
summary.getRange("A5:B12").values = [
  ["Metric", "Value"],
  ["Baseline pattern instances", null],
  ["Final pattern instances", null],
  ["Final distinct pattern types", null],
  ["Final production LOC", null],
  ["Production LOC added", null],
  ["Final tests passed", null],
  ["Contribution allocation", null],
];
summary.getRange("B6:B12").formulas = [
  ["=COUNTA(Patterns!A2:A100)"],
  ["=MAX(Metrics!G2:G5)"],
  ["=MAX(Metrics!F2:F5)"],
  ["=MAX(Metrics!B2:B5)"],
  ["=Metrics!B5-Metrics!B2"],
  ["=MAX(Metrics!D2:D5)"],
  ["=SUM(Contributions!D2:D5)"],
];
summary.getRange("A5:B5").format = {
  fill: "#1F4E78",
  font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
};
summary.getRange("A6:A12").format.font = { name: fontFamily, size: 10, bold: true, color: "#1F2937" };
summary.getRange("B6:B12").format = {
  fill: "#EAF2F8",
  font: { name: fontFamily, size: 11, bold: true, color: "#17365D" },
  horizontalAlignment: "right",
};
summary.getRange("B12").format.numberFormat = "0%";
summary.getRange("A5:B12").format.borders = { preset: "outside", style: "thin", color: "#9EADBA" };
summary.getRange("D5:H5").merge();
summary.getRange("D5").values = [["Evolution snapshots"]];
summary.getRange("D5:H5").format = {
  fill: "#1F4E78",
  font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "left",
};
summary.getRange("D6:H10").values = [
  ["Snapshot", "Production LOC", "Checks passed", "Pattern types", "Instances"],
  ["Original code", 2055, 1, 5, 5],
  ["After CH01", 2143, 2, 6, 6],
  ["After CH02", 2303, 4, 7, 7],
  ["After CH03", 2450, 10, 8, 8],
];
summary.getRange("D6:H6").format = {
  fill: "#D9EAF7",
  font: { name: fontFamily, size: 10, bold: true, color: "#17365D" },
  horizontalAlignment: "center",
};
summary.getRange("D6:H10").format.borders = { preset: "outside", style: "thin", color: "#9EADBA" };
summary.getRange("E7:H10").format.numberFormat = "0";
summary.getRange("D13:H13").merge();
summary.getRange("D13").values = [["Verification status"]];
summary.getRange("D13:H13").format = { fill: "#1F4E78", font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" } };
summary.getRange("D14:H19").values = [
  ["Check", "Result", "Evidence", "Owner", "Action"],
  ["Baseline Laravel suite", "1/2; stock mismatch disclosed", "Part1/evidence/test_results.txt", "Sahith", "Review upstream expectation"],
  ["Evolved Laravel suite", "2/2 passed", "Part2/evidence/test_results.txt", "Surya", "None"],
  ["Evolution acceptance", "10/10 passed", "Part2/evidence/test_results.txt", "Manoj", "None"],
  ["Eight language suites", "All passed", "Part3/evidence/cross_language_runs.txt", "Sanithya / Manoj", "None"],
  ["Human acknowledgement", "Pending", "HUMAN_VERIFICATION.md", "All members", "Sign before PR"],
];
summary.getRange("D14:H14").format = { fill: "#D9EAF7", font: { name: fontFamily, size: 10, bold: true, color: "#17365D" }, horizontalAlignment: "center" };
summary.getRange("D14:H19").format.borders = { preset: "outside", style: "thin", color: "#9EADBA" };
summary.getRange("D15:H19").format.wrapText = true;
summary.getRange("D15:H19").format.rowHeight = 28;
summary.getRange("E19").format = { fill: "#FFF2CC", font: { name: fontFamily, bold: true, color: "#9C6500" } };
summary.getRange("A21:H23").merge();
summary.getRange("A21").values = [["Limitations: the public baseline has no dedicated lease entity or application-level notification workflow; the educational contract stores hash evidence rather than a legally binding signature; process timings include runtime startup. Faculty approval and member signatures remain human inputs."]];
summary.getRange("A21:H23").format = {
  fill: "#F2F2F2",
  font: { name: fontFamily, size: 10, italic: true, color: "#4B5563" },
  wrapText: true,
  verticalAlignment: "center",
};
summary.getRange("A1:H24").format.font.name = fontFamily;
summary.getRange("A:A").format.columnWidth = 28;
summary.getRange("B:B").format.columnWidth = 18;
summary.getRange("C:C").format.columnWidth = 3;
summary.getRange("D:D").format.columnWidth = 24;
summary.getRange("E:E").format.columnWidth = 24;
summary.getRange("F:F").format.columnWidth = 34;
summary.getRange("G:G").format.columnWidth = 20;
summary.getRange("H:H").format.columnWidth = 24;
summary.getRange("A2:H2").format.rowHeight = 28;
summary.getRange("A21:H23").format.rowHeight = 24;

workbook.recalculate();

await fs.mkdir(previewDir, { recursive: true });
for (const name of ["Summary", "Patterns", "Pattern Counts", "Evolution", "Cross Language", "LLM Records", "Metrics", "Contributions"]) {
  const preview = await workbook.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, `${name.replaceAll(" ", "_")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const inspect = await workbook.inspect({ kind: "table", range: "Summary!A1:H23", include: "values,formulas", tableMaxRows: 25, tableMaxCols: 10 });
await fs.writeFile(path.join(previewDir, "summary_inspect.ndjson"), inspect.ndjson, "utf8");
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(previewDir, "error_scan.ndjson"), errors.ndjson, "utf8");

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(dataDir, "B4_Dataset.xlsx"));
