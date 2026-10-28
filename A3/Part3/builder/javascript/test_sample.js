const {HeaderBuilder} = require("./sample.js");
const fs = require("fs");
function execute(a,b,c) {
  try { return new HeaderBuilder().add("X-Test", "old").add(a,b).remove(c).build().get("X-Test") || "missing"; }
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
