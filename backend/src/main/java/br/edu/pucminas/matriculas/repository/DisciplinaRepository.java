package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Professor;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DisciplinaRepository extends MongoRepository<Disciplina, String> {

    List<Disciplina> findByProfessor(Professor professor);
}
