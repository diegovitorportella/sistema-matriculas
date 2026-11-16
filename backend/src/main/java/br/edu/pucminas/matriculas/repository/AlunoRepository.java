package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Aluno;
import java.util.List;
import org.springframework.data.mongodb.repository.ExistsQuery;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface AlunoRepository extends MongoRepository<Aluno, String> {

    // Alunos, professores e secretaria compartilham a colecao "usuarios", e findAll()/existsById()
    // nao filtram pelo tipo. As consultas abaixo restringem explicitamente pelo _class.

    @Query("{ '_class': 'br.edu.pucminas.matriculas.model.Aluno' }")
    List<Aluno> listarTodos();

    @ExistsQuery("{ '_id': ?0, '_class': 'br.edu.pucminas.matriculas.model.Aluno' }")
    boolean existeComId(String id);
}
