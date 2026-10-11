class Vendor{submit(payload){return {accepted:true,id:'LAB-1',payload}}}class Adapter{constructor(v){this.v=v}order(p,t){if(!p||!t)throw Error('missing');const r=this.v.submit({patient:{id:p},test:{code:t}});if(!r.accepted)throw Error('rejected');return r.id}}if(new Adapter(new Vendor()).order('P1','CBC')!=='LAB-1')throw Error('adapter');
console.log('PASS');
