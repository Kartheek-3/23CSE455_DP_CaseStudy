class Ticket {
    constructor() {
        this.value = null;
    }
}

class BatchLoader {
    constructor(batchFn) {
        this.batchFn = batchFn;
        this.cache = new Map();
        this.pending = [];
    }

    load(key) {
        if (!this.cache.has(key)) {
            this.cache.set(key, new Ticket());
            this.pending.push(key);
        }
        return this.cache.get(key);
    }

    dispatch() {
        if (this.pending.length === 0) {
            return;
        }
        const keys = this.pending;
        this.pending = [];
        const values = this.batchFn(keys);
        keys.forEach((key, i) => {
            this.cache.get(key).value = values[i];
        });
    }
}

class UserRepository {
    constructor(users) {
        this.users = users;
        this.queries = [];
    }

    findByIds(ids) {
        this.queries.push(ids.join(","));
        const wanted = new Set(ids);
        return this.users.filter((u) => wanted.has(u.id));
    }
}

function createUserBatchFn(repo) {
    return (ids) => {
        const byId = new Map(repo.findByIds(ids).map((u) => [u.id, u]));
        return ids.map((id) => (byId.has(id) ? byId.get(id) : null));
    };
}

module.exports = { Ticket, BatchLoader, UserRepository, createUserBatchFn };
