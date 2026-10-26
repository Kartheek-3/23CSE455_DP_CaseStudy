class Ticket:
    def __init__(self):
        self.value = None


class BatchLoader:
    def __init__(self, batch_fn):
        self.batch_fn = batch_fn
        self.cache = {}
        self.pending = []

    def load(self, key):
        if key not in self.cache:
            self.cache[key] = Ticket()
            self.pending.append(key)
        return self.cache[key]

    def dispatch(self):
        if not self.pending:
            return
        keys, self.pending = self.pending, []
        for key, value in zip(keys, self.batch_fn(keys)):
            self.cache[key].value = value


class UserRepository:
    def __init__(self, users):
        self.users = users
        self.queries = []

    def find_by_ids(self, ids):
        self.queries.append(",".join(ids))
        wanted = set(ids)
        return [u for u in self.users if u["id"] in wanted]


def create_user_batch_fn(repo):
    def batch(ids):
        by_id = {u["id"]: u for u in repo.find_by_ids(ids)}
        return [by_id.get(i) for i in ids]

    return batch
