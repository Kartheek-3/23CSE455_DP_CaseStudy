class User {                                   // DomainObject (entity)
    final long id; final String name; final int age; final String phone; final String address;
    User(long id, String name, int age, String phone, String address) {
        this.id = id; this.name = name; this.age = age; this.phone = phone; this.address = address;
    }
    String text() { return "User#" + id + ":" + name + "|" + age + "|" + phone + "|" + address; }
}

class UserDto {                                // DataTransferObject: data only, no id
    final String name; final int age; final String phone; final String address;
    UserDto(String name, int age, String phone, String address) {
        this.name = name; this.age = age; this.phone = phone; this.address = address;
    }
    String text() { return name + "|" + age + "|" + phone + "|" + address; }
}

class UserAssembler {                          // Assembler: the only place that knows both shapes
    UserDto toDto(User u) { return new UserDto(u.name, u.age, u.phone, u.address); }
    User toEntity(UserDto d) { return new User(0, d.name, d.age, d.phone, d.address); }
}
