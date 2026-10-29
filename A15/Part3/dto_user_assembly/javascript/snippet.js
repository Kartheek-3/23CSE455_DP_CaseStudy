class User {                                   // DomainObject (entity)
  constructor(id, name, age, phone, address) { Object.assign(this, { id, name, age, phone, address }); }
  text() { return `User#${this.id}:${this.name}|${this.age}|${this.phone}|${this.address}`; }
}

class UserDto {                                // DataTransferObject: data only, no id
  constructor(name, age, phone, address) { Object.assign(this, { name, age, phone, address }); }
  text() { return `${this.name}|${this.age}|${this.phone}|${this.address}`; }
}

class UserAssembler {                          // Assembler: the only place that knows both shapes
  toDto(user) { return new UserDto(user.name, user.age, user.phone, user.address); }
  toEntity(dto) { return new User(0, dto.name, dto.age, dto.phone, dto.address); }
}

module.exports = { User, UserDto, UserAssembler };
