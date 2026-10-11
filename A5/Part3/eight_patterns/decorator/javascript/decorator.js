class Reader {
  read(p) {
    return {
      patient_id:p,summary:'synthetic'
    }
  }
}
class AuditedReader {
  constructor(inner) {
    this.inner=inner;
    this.audit=[]
  }
  read(p) {
    const r=this.inner.read(p);
    this.audit.push(['read',p]);
    return r
  }
}
const a=new AuditedReader(new Reader());
if (a.read('P1').patient_id!=='P1'||a.audit.length!==1)throw Error('decorator');
console.log('PASS');
