class User:                                   # DomainObject (entity)
    def __init__(self, id, name, age, phone, address):
        self.id, self.name, self.age, self.phone, self.address = id, name, age, phone, address

    def text(self):
        return "User#%d:%s|%d|%s|%s" % (self.id, self.name, self.age, self.phone, self.address)


class UserDto:                                # DataTransferObject: data only, no id
    def __init__(self, name, age, phone, address):
        self.name, self.age, self.phone, self.address = name, age, phone, address

    def text(self):
        return "%s|%d|%s|%s" % (self.name, self.age, self.phone, self.address)


class UserAssembler:                          # Assembler: the only place that knows both shapes
    def to_dto(self, user):
        return UserDto(user.name, user.age, user.phone, user.address)

    def to_entity(self, dto):
        return User(0, dto.name, dto.age, dto.phone, dto.address)
