package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.model.NotificacaoCobranca;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificacaoCobrancaRepository extends MongoRepository<NotificacaoCobranca, String> {

    Optional<NotificacaoCobranca> findByAlunoAndSemestre(Aluno aluno, String semestre);
}
