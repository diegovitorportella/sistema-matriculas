package br.edu.pucminas.matriculas.service;

import br.edu.pucminas.matriculas.enums.StatusDisciplina;
import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.enums.TipoMatricula;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.exception.RegraNegocioException;
import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.model.Curriculo;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Matricula;
import br.edu.pucminas.matriculas.model.NotificacaoCobranca;
import br.edu.pucminas.matriculas.model.PeriodoMatricula;
import br.edu.pucminas.matriculas.repository.CurriculoRepository;
import br.edu.pucminas.matriculas.repository.DisciplinaRepository;
import br.edu.pucminas.matriculas.repository.MatriculaRepository;
import br.edu.pucminas.matriculas.repository.NotificacaoCobrancaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MatriculaService {

    public static final int MAX_OBRIGATORIAS = 4;
    public static final int MAX_OPTATIVAS = 2;

    private static final Logger log = LoggerFactory.getLogger(MatriculaService.class);

    private final MatriculaRepository matriculas;
    private final DisciplinaRepository disciplinas;
    private final CurriculoRepository curriculos;
    private final NotificacaoCobrancaRepository notificacoes;
    private final PeriodoService periodoService;

    public MatriculaService(MatriculaRepository matriculas, DisciplinaRepository disciplinas,
            CurriculoRepository curriculos, NotificacaoCobrancaRepository notificacoes,
            PeriodoService periodoService) {
        this.matriculas = matriculas;
        this.disciplinas = disciplinas;
        this.curriculos = curriculos;
        this.notificacoes = notificacoes;
        this.periodoService = periodoService;
    }

    public Matricula matricular(Aluno aluno, String disciplinaId, TipoMatricula tipo) {
        PeriodoMatricula periodo = periodoAbertoOuErro();
        Disciplina disciplina = disciplinas.findById(disciplinaId)
                .orElseThrow(() -> new NaoEncontradoException("Disciplina não encontrada"));

        Curriculo curriculo = curriculos.findBySemestre(periodo.getSemestre())
                .orElseThrow(() -> new RegraNegocioException("Semestre sem currículo"));
        boolean ofertada = curriculo.getDisciplinas().stream().filter(Objects::nonNull)
                .anyMatch(d -> d.getId().equals(disciplina.getId()));
        if (!ofertada) {
            throw new RegraNegocioException("Disciplina não faz parte do currículo do semestre");
        }
        if (disciplina.getStatus() == StatusDisciplina.CANCELADA) {
            throw new RegraNegocioException("Disciplina cancelada");
        }
        if (matriculas.existsByAlunoAndDisciplinaAndPeriodoAndStatus(aluno, disciplina, periodo,
                StatusMatricula.ATIVA)) {
            throw new RegraNegocioException("Aluno já matriculado nesta disciplina");
        }

        long jaNoTipo = matriculas.countByAlunoAndPeriodoAndTipoAndStatus(aluno, periodo, tipo,
                StatusMatricula.ATIVA);
        int limite = tipo == TipoMatricula.OBRIGATORIA ? MAX_OBRIGATORIAS : MAX_OPTATIVAS;
        if (jaNoTipo >= limite) {
            throw new RegraNegocioException("Limite de " + limite + " disciplinas "
                    + (tipo == TipoMatricula.OBRIGATORIA ? "obrigatórias" : "optativas") + " atingido");
        }

        disciplina.setMatriculadosAtivos((int) matriculas.countByDisciplinaAndPeriodoAndStatus(
                disciplina, periodo, StatusMatricula.ATIVA));
        if (!disciplina.temVaga()) {
            throw new RegraNegocioException("Disciplina lotada (máximo de " + disciplina.getMaxAlunos()
                    + " alunos); matrículas encerradas");
        }

        Matricula matricula = new Matricula();
        matricula.setAluno(aluno);
        matricula.setDisciplina(disciplina);
        matricula.setPeriodo(periodo);
        matricula.setTipo(tipo);
        matricula.setStatus(StatusMatricula.ATIVA);
        matricula.setDataMatricula(LocalDate.now());
        matriculas.save(matricula);

        notificarCobranca(aluno, periodo);
        return matricula;
    }

    public void cancelar(Aluno aluno, String matriculaId) {
        Matricula matricula = matriculas.findById(matriculaId)
                .orElseThrow(() -> new NaoEncontradoException("Matrícula não encontrada"));
        if (!matricula.getAluno().getId().equals(aluno.getId())) {
            throw new NaoEncontradoException("Matrícula não encontrada");
        }
        if (matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new RegraNegocioException("Matrícula já cancelada");
        }
        if (!matricula.getPeriodo().estaAberto()) {
            throw new RegraNegocioException("Fora do período de matrículas");
        }
        matricula.cancelar();
        matriculas.save(matricula);
        notificarCobranca(aluno, matricula.getPeriodo());
    }

    public List<Matricula> minhas(Aluno aluno) {
        return periodoService.periodoAberto()
                .map(p -> matriculas.findByAlunoAndPeriodo(aluno, p))
                .orElseGet(List::of);
    }

    public List<Disciplina> ofertadas() {
        return periodoService.periodoAberto()
                .flatMap(p -> curriculos.findBySemestre(p.getSemestre()))
                .map(c -> c.getDisciplinas().stream().filter(Objects::nonNull).toList())
                .orElseGet(List::of);
    }

    /** Mantém uma notificação por aluno/semestre com as matrículas ativas e a envia (simulado). */
    private void notificarCobranca(Aluno aluno, PeriodoMatricula periodo) {
        NotificacaoCobranca n = notificacoes.findByAlunoAndSemestre(aluno, periodo.getSemestre())
                .orElseGet(() -> {
                    NotificacaoCobranca nova = new NotificacaoCobranca();
                    nova.setAluno(aluno);
                    nova.setSemestre(periodo.getSemestre());
                    return nova;
                });
        n.setMatriculas(matriculas.findByAlunoAndPeriodoAndStatus(aluno, periodo, StatusMatricula.ATIVA));
        n.enviar();
        notificacoes.save(n);
        log.info("Sistema de cobranças notificado: aluno={} semestre={} disciplinas={}",
                aluno.getLogin(), periodo.getSemestre(), n.getMatriculas().size());
    }

    private PeriodoMatricula periodoAbertoOuErro() {
        return periodoService.periodoAberto()
                .orElseThrow(() -> new RegraNegocioException("Não há período de matrículas aberto"));
    }
}
