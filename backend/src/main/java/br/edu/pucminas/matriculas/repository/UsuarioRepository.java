package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Usuario;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByLogin(String login);

    boolean existsByLogin(String login);
}
