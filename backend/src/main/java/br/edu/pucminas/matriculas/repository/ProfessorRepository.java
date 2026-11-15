package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Professor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfessorRepository extends MongoRepository<Professor, String> {
}
