interface DatabaseSession { String query(); }
class SqliteSession implements DatabaseSession { public String query(){return "database result";} }
class MemberRepository {
 private final DatabaseSession db;
 MemberRepository(DatabaseSession db){this.db=db;}
 String listMembers(){return db.query();}
}
