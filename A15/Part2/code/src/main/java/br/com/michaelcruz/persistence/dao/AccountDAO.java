package br.com.michaelcruz.persistence.dao;

import br.com.michaelcruz.exception.NotFoundException;
import br.com.michaelcruz.persistence.model.Account;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class AccountDAO implements DAO<Account>{

    @Inject
    EntityManager entityManager;

    @Override
    public Optional<Account> findById(Long id) {
        Account account = this.entityManager.find(Account.class, id);

        if (account == null){
            throw new NotFoundException("A conta com o ID citado não foi encontrada");
        }

        return Optional.of(account);
    }

    @Transactional
    public void save(Account data) {
        this.entityManager.persist(data);
    }

    @Transactional
    public void update(Account data){
        Account account = data;
        this.entityManager.merge(account);
    }

    @Override
    public List<Account> getAll() {
        return entityManager.createQuery("SELECT a FROM Account a", Account.class).getResultList();
    }
}