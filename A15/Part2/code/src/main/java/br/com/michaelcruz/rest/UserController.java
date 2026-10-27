package br.com.michaelcruz.rest;

import br.com.michaelcruz.persistence.dto.UserDTO;
import br.com.michaelcruz.service.UserService;
import jakarta.inject.Inject;;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/users")
public class UserController {

    @Inject
    UserService userService;

    @POST
    public Response createUser(UserDTO userDTO){
        this.userService.createUser(userDTO);
        return Response.status(Response.Status.CREATED).entity("Usuário criado com sucesso").build();
    }
}
