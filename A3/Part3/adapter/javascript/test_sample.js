const {EmailAdapter} = require("./sample.js");
const fs = require("fs");
function execute(a,b,c) {
  const vendor = payload => {
    if (payload.to !== a || payload.html !== b) throw Error("payload mismatch");
    if (c === "throw") throw Error("simulated");
    return Number(c);
  };
  return new EmailAdapter(vendor).send(a, b);
}
let count=0;
for(const line of fs.readFileSync(process.argv[2],"utf8").trimEnd().split("\n")) {
  const [a,b,c,expected]=line.split("\t");
  const actual=execute(a,b,c);
  if(actual!==expected)throw Error(JSON.stringify({a,b,c,actual,expected}));
  count++;
}
console.log(`PASS ${count}/${count}`);
