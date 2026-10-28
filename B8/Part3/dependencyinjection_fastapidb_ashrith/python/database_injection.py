class DatabaseSession:
    def query(self): return "database result"
def get_db():
    # FastAPI dependency-provider equivalent; production code manages session lifetime.
    return DatabaseSession()
class MemberRepository:
    def __init__(self, db: DatabaseSession): self.db = db
    def list_members(self): return self.db.query()
