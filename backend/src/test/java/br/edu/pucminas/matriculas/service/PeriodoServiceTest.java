package br.edu.pucminas.matriculas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.pucminas.matriculas.enums.StatusDisciplina;
import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.model.Curriculo;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.PeriodoMatricula;
import br.edu.pucminas.matriculas.repository.CurriculoRepository;
import br.edu.pucminas.matriculas.repository.DisciplinaRepository;
import br.edu.pucminas.matriculas.repository.MatriculaRepository;
import br.edu.pucminas.matriculas.repository.PeriodoMatriculaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PeriodoServiceTest {

    private PeriodoMatriculaRepository periodos;
    private CurriculoRepository curriculos;
    private DisciplinaRepository disciplinas;
    private MatriculaRepository matriculas;
    private PeriodoService service;

    @BeforeEach
    void preparar() {
        periodos = mock(PeriodoMatriculaRepository.class);
        curriculos = mock(CurriculoRepository.class);
        disciplinas = mock(DisciplinaRepository.class);
        matriculas = mock(MatriculaRepository.class);
        service = new PeriodoService(periodos, curriculos, disciplinas, matriculas);
    }

    private PeriodoMatricula periodo(String id, String semestre, LocalDate fim, boolean encerrado) {
        PeriodoMatricula p = new PeriodoMatricula();
        p.setId(id);
        p.setSemestre(semestre);
        p.setInicio(fim.minusDays(30));
        p.setFim(fim);
        p.setEncerrado(encerrado);
        return p;
    }

    private Disciplina disciplina(String id) {
        Disciplina d = new Disciplina();
        d.setId(id);
        d.setCodigo(id);
        return d;
    }

    @Test
    void encerraPeriodoVencidoConfirmandoOuCancelandoDisciplinas() {
        PeriodoMatricula vencido = periodo("p1", "2026/1", LocalDate.now().minusDays(1), false);
        Disciplina cheia = disciplina("d1");
        Disciplina vazia = disciplina("d2");
        Curriculo curriculo = new Curriculo();
        curriculo.setSemestre("2026/1");
        curriculo.setDisciplinas(List.of(cheia, vazia));

        when(periodos.findAll()).thenReturn(List.of(vencido));
        when(periodos.findById("p1")).thenReturn(Optional.of(vencido));
        when(curriculos.findBySemestre("2026/1")).thenReturn(Optional.of(curriculo));
        when(matriculas.countByDisciplinaAndPeriodoAndStatus(eq(cheia), eq(vencido), eq(StatusMatricula.ATIVA))).thenReturn(3L);
        when(matriculas.countByDisciplinaAndPeriodoAndStatus(eq(vazia), eq(vencido), eq(StatusMatricula.ATIVA))).thenReturn(2L);

        assertEquals(1, service.encerrarVencidos());
        assertTrue(vencido.isEncerrado());
        assertEquals(StatusDisciplina.ATIVA, cheia.getStatus());
        assertEquals(StatusDisciplina.CANCELADA, vazia.getStatus());
    }

    @Test
    void naoMexeEmPeriodoAbertoOuJaEncerrado() {
        PeriodoMatricula aberto = periodo("p2", "2026/2", LocalDate.now(), false);
        PeriodoMatricula jaEncerrado = periodo("p3", "2025/2", LocalDate.now().minusDays(90), true);
        when(periodos.findAll()).thenReturn(List.of(aberto, jaEncerrado));

        assertEquals(0, service.encerrarVencidos());
        assertFalse(aberto.isEncerrado());
        verify(periodos, never()).findById(any());
    }

    @Test
    void falhaEmUmPeriodoNaoImpedeOsDemais() {
        PeriodoMatricula semCurriculo = periodo("p4", "2024/1", LocalDate.now().minusDays(5), false);
        PeriodoMatricula normal = periodo("p5", "2024/2", LocalDate.now().minusDays(2), false);
        Curriculo curriculo = new Curriculo();
        curriculo.setSemestre("2024/2");

        when(periodos.findAll()).thenReturn(List.of(semCurriculo, normal));
        when(periodos.findById("p4")).thenReturn(Optional.of(semCurriculo));
        when(periodos.findById("p5")).thenReturn(Optional.of(normal));
        when(curriculos.findBySemestre("2024/1")).thenReturn(Optional.empty());
        when(curriculos.findBySemestre("2024/2")).thenReturn(Optional.of(curriculo));

        assertEquals(1, service.encerrarVencidos());
        assertTrue(normal.isEncerrado());
    }
}
