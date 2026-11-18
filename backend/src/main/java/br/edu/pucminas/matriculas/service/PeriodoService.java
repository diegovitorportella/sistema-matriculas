package br.edu.pucminas.matriculas.service;

import br.edu.pucminas.matriculas.dto.Dtos.ConsolidacaoResponse;
import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.exception.RegraNegocioException;
import br.edu.pucminas.matriculas.model.Curriculo;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.PeriodoMatricula;
import br.edu.pucminas.matriculas.repository.CurriculoRepository;
import br.edu.pucminas.matriculas.repository.DisciplinaRepository;
import br.edu.pucminas.matriculas.repository.MatriculaRepository;
import br.edu.pucminas.matriculas.repository.PeriodoMatriculaRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PeriodoService {

    private static final Logger log = LoggerFactory.getLogger(PeriodoService.class);

    private final PeriodoMatriculaRepository periodos;
    private final CurriculoRepository curriculos;
    private final DisciplinaRepository disciplinas;
    private final MatriculaRepository matriculas;

    public PeriodoService(PeriodoMatriculaRepository periodos, CurriculoRepository curriculos,
            DisciplinaRepository disciplinas, MatriculaRepository matriculas) {
        this.periodos = periodos;
        this.curriculos = curriculos;
        this.disciplinas = disciplinas;
        this.matriculas = matriculas;
    }

    public Curriculo gerarCurriculo(String semestre, List<String> disciplinaIds) {
        if (curriculos.existsBySemestre(semestre)) {
            throw new RegraNegocioException("Já existe currículo para o semestre " + semestre);
        }
        Curriculo curriculo = new Curriculo();
        curriculo.setSemestre(semestre);
        if (disciplinaIds != null) {
            for (String id : disciplinaIds) {
                Disciplina d = disciplinas.findById(id)
                        .orElseThrow(() -> new NaoEncontradoException("Disciplina não encontrada: " + id));
                curriculo.adicionarDisciplina(d);
            }
        }
        return curriculos.save(curriculo);
    }

    public PeriodoMatricula abrir(String semestre, LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw new RegraNegocioException("A data final não pode ser anterior à inicial");
        }
        Curriculo curriculo = curriculos.findBySemestre(semestre).orElseThrow(() ->
                new RegraNegocioException("Gere o currículo do semestre " + semestre + " antes de abrir o período"));
        if (periodos.existsBySemestre(semestre)) {
            throw new RegraNegocioException("Já existe período de matrículas para o semestre " + semestre);
        }
        PeriodoMatricula periodo = new PeriodoMatricula();
        periodo.setSemestre(semestre);
        periodo.setInicio(inicio);
        periodo.setFim(fim);
        periodos.save(periodo);
        curriculo.setPeriodoMatricula(periodo);
        curriculos.save(curriculo);
        return periodo;
    }

    public Optional<PeriodoMatricula> periodoAberto() {
        return periodos.findAll().stream().filter(PeriodoMatricula::estaAberto).findFirst();
    }

    /** Encerra o período e ativa/cancela cada disciplina do currículo (mínimo de alunos). */
    public List<ConsolidacaoResponse> encerrar(String periodoId) {
        PeriodoMatricula periodo = periodos.findById(periodoId)
                .orElseThrow(() -> new NaoEncontradoException("Período não encontrado"));
        if (periodo.isEncerrado()) {
            throw new RegraNegocioException("Período já encerrado");
        }
        periodo.setEncerrado(true);
        periodos.save(periodo);

        Curriculo curriculo = curriculos.findBySemestre(periodo.getSemestre())
                .orElseThrow(() -> new NaoEncontradoException("Currículo do período não encontrado"));
        List<ConsolidacaoResponse> resultado = new ArrayList<>();
        for (Disciplina d : curriculo.getDisciplinas().stream().filter(Objects::nonNull).toList()) {
            long total = matriculas.countByDisciplinaAndPeriodoAndStatus(d, periodo, StatusMatricula.ATIVA);
            d.setMatriculadosAtivos((int) total);
            d.avaliarAtivacao();
            disciplinas.save(d);
            resultado.add(new ConsolidacaoResponse(d.getId(), d.getCodigo(), d.getNome(),
                    (int) total, d.getStatus()));
        }
        return resultado;
    }

    /**
     * Encerra, aplicando a mesma consolidação de {@link #encerrar(String)}, os períodos cuja data final já passou
     * e que a secretaria ainda não encerrou. Retorna quantos períodos foram encerrados.
     */
    public int encerrarVencidos() {
        LocalDate hoje = LocalDate.now();
        int total = 0;
        for (PeriodoMatricula p : periodos.findAll()) {
            if (p.isEncerrado() || p.getFim() == null || !hoje.isAfter(p.getFim())) {
                continue;
            }
            try {
                encerrar(p.getId());
                total++;
                log.info("Período {} encerrado automaticamente após o fim em {}", p.getSemestre(), p.getFim());
            } catch (RuntimeException e) {
                log.warn("Não foi possível encerrar automaticamente o período {}: {}", p.getSemestre(), e.getMessage());
            }
        }
        return total;
    }
}
