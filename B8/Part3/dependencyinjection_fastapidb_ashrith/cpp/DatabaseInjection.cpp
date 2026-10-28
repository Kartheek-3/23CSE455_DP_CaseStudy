#include <cassert>
#include <iostream>
#include <string>
struct DatabaseSession { virtual ~DatabaseSession()=default; virtual std::string query()=0; };
struct SqliteSession:DatabaseSession { std::string query() override{return "database result";} };
struct MemberRepository { DatabaseSession& db; explicit MemberRepository(DatabaseSession& d):db(d){} std::string listMembers(){return db.query();} };
int main(){SqliteSession db; MemberRepository repo(db); assert(repo.listMembers()=="database result"); std::cout<<"Database injection test passed\\n";}
