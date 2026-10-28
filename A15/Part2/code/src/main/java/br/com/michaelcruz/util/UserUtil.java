package br.com.michaelcruz.util;

import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dao.UserDAO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Optional;

@ApplicationScoped
public class UserUtil {
    @Inject
    UserDAO userDAO;

    //Converter User para DTO
    public UserDTO convertToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();

        userDTO.setId(user.getId());
        userDTO.setAge(user.getAge());
        userDTO.setName(user.getName());
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());

        return userDTO;
    }

}
