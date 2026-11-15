package br.edu.pucminas.matriculas.repository;

import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.enums.TipoMatricula;
import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Matricula;
import br.edu.pucminas.matriculas.model.PeriodoMatricula;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MatriculaRepository extends MongoRepository<Matricula, String> {

    List<Matricula> findByAlunoAndPeriodo(Aluno aluno, PeriodoMatricula periodo);

    List<Matricula> findByAlunoAndPeriodoAndStatus(Aluno aluno, PeriodoMatricula periodo, StatusMatricula status);

    List<Matricula> findByDisciplinaAndStatus(Disciplina disciplina, StatusMatricula status);

    long countByAlunoAndPeriodoAndTipoAndStatus(Aluno aluno, PeriodoMatricula periodo,
            TipoMatricula tipo, StatusMatricula status);

    long countByDisciplinaAndPeriodoAndStatus(Disciplina disciplina, PeriodoMatricula periodo,
            StatusMatricula status);

    boolean existsByAlunoAndDisciplinaAndPeriodoAndStatus(Aluno aluno, Disciplina disciplina,
            PeriodoMatricula periodo, StatusMatricula status);
}
