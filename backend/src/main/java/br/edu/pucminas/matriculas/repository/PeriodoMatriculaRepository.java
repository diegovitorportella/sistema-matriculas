package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.PeriodoMatricula;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PeriodoMatriculaRepository extends MongoRepository<PeriodoMatricula, String> {

    boolean existsBySemestre(String semestre);
}
