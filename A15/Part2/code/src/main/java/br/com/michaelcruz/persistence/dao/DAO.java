package br.com.michaelcruz.persistence.dao;

import java.util.List;
import java.util.Optional;

public interface DAO<T> {

    Optional<T> findById(Long id);
    List<T> getAll();

}
