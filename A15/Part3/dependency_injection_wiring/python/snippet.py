class MissingDependency(Exception):
    pass


class Bean:                                     # anything the container manages
    def needs(self):
        return []

    def inject(self, name, dep):
        pass


class RealDao(Bean):
    def kind(self):
        return "real"


class FakeDao(Bean):
    def kind(self):
        return "fake"


class Service(Bean):                            # ManagedBean with one injection point (Dao); never creates it itself
    def __init__(self):
        self.dao = None

    def needs(self):
        return ["Dao"]

    def inject(self, name, dep):
        self.dao = dep

    def describe(self):
        return "Service->Dao:" + (self.dao.kind() if self.dao else "unwired")


class Container:                                # Container: creates nothing, but wires every declared need
    def __init__(self):
        self.beans = {}

    def register(self, name, bean):
        self.beans[name] = bean

    def get(self, name):
        return self.beans[name]

    def wire(self):
        for bean in self.beans.values():
            for need in bean.needs():
                if need not in self.beans:
                    raise MissingDependency(need)
                bean.inject(need, self.beans[need])
