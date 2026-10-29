class VendorFx{quote(pair){return {USDEUR:.92}[pair];}}class RateProvider{constructor(vendor){this.vendor=vendor;}rate(source,target){return this.vendor.quote(source+target);}}
function demo(){return new RateProvider(new VendorFx()).rate("USD","EUR")===.92;}module.exports={demo};

