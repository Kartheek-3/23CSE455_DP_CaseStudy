const {Positive, Funds, HighValue} = require("./sample.js");
const fs = require("fs");
function execute(a,b,c) {
  try { return new Positive(new Funds(new HighValue(Number(c)))).allows(Number(a),Number(b)) ? "allow" : "reject"; }
  catch (error) { return "error"; }
}
let count=0;
for(const line of fs.readFileSync(process.argv[2],"utf8").trimEnd().split("\n")) {
  const [a,b,c,expected]=line.split("\t");
  const actual=execute(a,b,c);
  if(actual!==expected)throw Error(JSON.stringify({a,b,c,actual,expected}));
  count++;
}
console.log(`PASS ${count}/${count}`);
