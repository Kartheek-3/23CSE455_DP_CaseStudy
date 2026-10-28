package br.com.michaelcruz.persistence.dao;

import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserDAO implements DAO<User>{

    @Inject
    EntityManager entityManager;

    @Override
    public Optional<User> findById(Long id) {
        try {
            return Optional.of(entityManager.find(User.class, id));
        } catch (NotFoundException ex) {
            throw new NotFoundException("Usuário não encontrado");
        }
    }

    @Transactional
    public User save(User data) {
        this.entityManager.persist(data);
        return null;
    }

    @Override
    public List<User> getAll() {
        return null;
    }
}
