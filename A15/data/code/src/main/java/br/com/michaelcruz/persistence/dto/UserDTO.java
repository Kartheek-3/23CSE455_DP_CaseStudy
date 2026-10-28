package br.com.michaelcruz.persistence.dto;

import jakarta.validation.constraints.NotNull;

public class UserDTO {

    Long id;

    @NotNull(message = "Precisa ser informado o nome do usuário")
    String name;

    @NotNull(message = "Precisa ser informada a idade do usuário")
    int age;

    @NotNull(message = "Precisa ser informado um número de telefone para contato")
    String phone;

    @NotNull(message = "Precisa ser informado o endereço do usuário")
    String address;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
