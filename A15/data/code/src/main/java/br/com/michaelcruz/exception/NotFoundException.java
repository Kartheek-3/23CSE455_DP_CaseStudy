package br.com.michaelcruz.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

public class NotFoundException extends WebApplicationException {

    public NotFoundException(String message){
        super(Response.status(Response.Status.NOT_FOUND).entity(message).build());
    }
}
