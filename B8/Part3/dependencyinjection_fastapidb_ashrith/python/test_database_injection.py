from database_injection import get_db, MemberRepository
db=get_db(); repo=MemberRepository(db)
assert repo.db is db and repo.list_members()=="database result"
print("FastAPI-style database injection test passed")
