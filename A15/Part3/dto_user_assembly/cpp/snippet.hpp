#pragma once
#include <string>

struct User {                                   // DomainObject (entity)
    long id; std::string name; int age; std::string phone, address;
    std::string text() const {
        return "User#" + std::to_string(id) + ":" + name + "|" + std::to_string(age) + "|" + phone + "|" + address;
    }
};

struct UserDto {                                // DataTransferObject: data only, no id
    std::string name; int age; std::string phone, address;
    std::string text() const { return name + "|" + std::to_string(age) + "|" + phone + "|" + address; }
};

struct UserAssembler {                          // Assembler: the only place that knows both shapes
    UserDto toDto(const User& u) const { return {u.name, u.age, u.phone, u.address}; }
    User toEntity(const UserDto& d) const { return {0, d.name, d.age, d.phone, d.address}; }
};
