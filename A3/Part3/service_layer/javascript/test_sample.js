const {PostingService} = require("./sample.js");
const fs = require("fs");
function execute(a,b,c) {
  const store = {account: c === "yes" ? {balance: Number(a)} : null,
    load() { return this.account; }, save(account) { this.account = account; }};
  let notices = 0;
  new PostingService(store, () => notices++).post(Number(b));
  return (store.account ? store.account.balance : "missing") + ":" + notices;
}
let count=0;
for(const line of fs.readFileSync(process.argv[2],"utf8").trimEnd().split("\n")) {
  const [a,b,c,expected]=line.split("\t");
  const actual=execute(a,b,c);
  if(actual!==expected)throw Error(JSON.stringify({a,b,c,actual,expected}));
  count++;
}
console.log(`PASS ${count}/${count}`);
