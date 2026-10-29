class FixedRate{convert(amount){return amount*.92;}}class SameCurrency{convert(amount){return amount;}}class Factory{select(source,target){return source===target?new SameCurrency():new FixedRate();}}
function demo(){const f=new Factory();return Math.abs(f.select("USD","EUR").convert(10)-9.2)<1e-9&&f.select("EUR","EUR").convert(10)===10;}module.exports={demo};

