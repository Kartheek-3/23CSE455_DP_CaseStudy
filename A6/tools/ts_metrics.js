// Source LOC and cyclomatic complexity for TypeScript, using the TypeScript compiler API.
// lizard 1.17.13 does not recognise functions inside decorated TypeScript classes, so this
// script applies the same counting rule to TypeScript:
//   NLOC = non-blank lines that are not only comments;
//   CC(function) = 1 + number of if, for, for-in, for-of, while, do, case, catch, ?:, &&, ||, ??.
// Usage: node tools/ts_metrics.js <path-to-typescript-module> <src-dir> [file ...]
const fs = require("fs");
const path = require("path");
const ts = require(process.argv[2]);
const srcDir = process.argv[3];
const only = process.argv.slice(4);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".ts") ? [path.join(dir, e.name)] : []);
}

function nloc(sf) {
  const text = sf.getFullText();
  const codeLines = new Set();
  const scan = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, text);
  for (let k = scan.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = scan.scan()) {
    if (k === ts.SyntaxKind.NewLineTrivia || k === ts.SyntaxKind.WhitespaceTrivia ||
        k === ts.SyntaxKind.SingleLineCommentTrivia || k === ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const start = sf.getLineAndCharacterOfPosition(scan.getTokenPos()).line;
    const end = sf.getLineAndCharacterOfPosition(scan.getTextPos()).line;
    for (let l = start; l <= end; l++) codeLines.add(l);
  }
  return codeLines.size;
}

const DECISION = new Set([ts.SyntaxKind.IfStatement, ts.SyntaxKind.ForStatement, ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement, ts.SyntaxKind.WhileStatement, ts.SyntaxKind.DoStatement, ts.SyntaxKind.CaseClause,
  ts.SyntaxKind.CatchClause, ts.SyntaxKind.ConditionalExpression]);
const LOGICAL = new Set([ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken]);
const isFn = (n) => ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isArrowFunction(n) ||
  ts.isFunctionExpression(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n);

function functionsCC(sf) {
  const out = [];
  const visitFn = (fn) => {
    let cc = 1;
    const inner = (n) => {
      if (n !== fn && isFn(n)) { visitFn(n); return; }
      if (DECISION.has(n.kind)) cc++;
      if (ts.isBinaryExpression(n) && LOGICAL.has(n.operatorToken.kind)) cc++;
      ts.forEachChild(n, inner);
    };
    ts.forEachChild(fn, inner);
    out.push(cc);
  };
  const top = (n) => { if (isFn(n)) visitFn(n); else ts.forEachChild(n, top); };
  top(sf);
  return out;
}

const files = only.length ? only.map((f) => path.join(srcDir, f)) : walk(srcDir);
const rows = files.filter(fs.existsSync).map((f) => {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true);
  const ccs = functionsCC(sf);
  return { file: path.relative(srcDir, f).split(path.sep).join("/"), nloc: nloc(sf), functions: ccs.length,
    max_cc: ccs.length ? Math.max(...ccs) : 0 };
});
const total = rows.reduce((a, r) => ({ nloc: a.nloc + r.nloc, functions: a.functions + r.functions,
  max_cc: Math.max(a.max_cc, r.max_cc) }), { nloc: 0, functions: 0, max_cc: 0 });
console.log(JSON.stringify({ srcDir, files: rows.length, total, rows }, null, 2));
