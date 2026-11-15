package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Curriculo;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CurriculoRepository extends MongoRepository<Curriculo, String> {

    Optional<Curriculo> findBySemestre(String semestre);

    boolean existsBySemestre(String semestre);
}
