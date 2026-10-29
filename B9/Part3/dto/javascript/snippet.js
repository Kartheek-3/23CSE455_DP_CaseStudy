class TransferRequest{constructor(sender,receiver,amount){Object.assign(this,{sender,receiver,amount});}}function toCommand(request){return [request.sender,request.receiver,request.amount];}
function demo(){return JSON.stringify(toCommand(new TransferRequest("a","b",10)))===JSON.stringify(["a","b",10]);}module.exports={demo};

