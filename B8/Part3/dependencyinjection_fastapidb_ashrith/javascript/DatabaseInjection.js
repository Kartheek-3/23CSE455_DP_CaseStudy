class DatabaseSession { query(){return "database result";} }
const getDb=()=>new DatabaseSession();
class MemberRepository { constructor(db){this.db=db;} listMembers(){return this.db.query();} }
module.exports={getDb,MemberRepository};
