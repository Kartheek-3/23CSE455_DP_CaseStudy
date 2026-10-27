const {Totp, Recovery, Login} = require("./sample.js");
const fs = require("fs");
function execute(a,b,c) {
  let used = false;
  const recovery = code => { if (code !== "R-1" || used) return false; used = true; return true; };
  const login = new Login(a === "totp" ? new Totp(code => code === "123456") : new Recovery(recovery));
  return [0,1].map(() => login.authenticate(b) ? "ok" : "fail").join(":");
}
let count=0;
for(const line of fs.readFileSync(process.argv[2],"utf8").trimEnd().split("\n")) {
  const [a,b,c,expected]=line.split("\t");
  const actual=execute(a,b,c);
  if(actual!==expected)throw Error(JSON.stringify({a,b,c,actual,expected}));
  count++;
}
console.log(`PASS ${count}/${count}`);
