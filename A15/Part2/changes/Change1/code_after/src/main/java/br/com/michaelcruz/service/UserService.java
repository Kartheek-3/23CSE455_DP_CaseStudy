package br.com.michaelcruz.service;

import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.dao.UserDAO;
import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.persistence.model.User;

import br.com.michaelcruz.util.UserUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;

import java.util.Optional;

@ApplicationScoped
public class UserService {

    @Inject
    UserDAO userDAO;

    @Inject
    UserUtil userUtil;


    public void createUser(@Valid UserDTO userDTO){
        User user = new User();

        user.setName(userDTO.getName());
        user.setAge(userDTO.getAge());
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());

        this.userDAO.save(user);
    }

    public UserDTO getUserDetails(Long userId) {
        Optional<User> userOptional = userDAO.findById(userId);

        if (userOptional != null && userOptional.isPresent()) {
            User user = userOptional.get();
            return userUtil.convertToUserDTO(user);
        }
        throw new NotFoundException("Usuário não encontrado");
    }

}
