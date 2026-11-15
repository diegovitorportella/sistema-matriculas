package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Aluno;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlunoRepository extends MongoRepository<Aluno, String> {
}
