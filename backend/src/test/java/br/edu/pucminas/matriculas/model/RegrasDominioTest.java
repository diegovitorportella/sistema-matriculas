package br.edu.pucminas.matriculas.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.edu.pucminas.matriculas.enums.StatusDisciplina;
import br.edu.pucminas.matriculas.enums.StatusMatricula;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class RegrasDominioTest {

    @Test
    void disciplinaTemVagaAteOLimiteDe60() {
        Disciplina d = new Disciplina();
        d.setMatriculadosAtivos(59);
        assertTrue(d.temVaga());
        d.setMatriculadosAtivos(60);
        assertFalse(d.temVaga());
    }

    @Test
    void disciplinaComMenosDe3AlunosEhCancelada() {
        Disciplina d = new Disciplina();
        d.setMatriculadosAtivos(2);
        d.avaliarAtivacao();
        assertEquals(StatusDisciplina.CANCELADA, d.getStatus());
    }

    @Test
    void disciplinaComPeloMenos3AlunosFicaAtiva() {
        Disciplina d = new Disciplina();
        d.setMatriculadosAtivos(3);
        d.avaliarAtivacao();
        assertEquals(StatusDisciplina.ATIVA, d.getStatus());
    }

    @Test
    void periodoEstaAbertoSomenteDentroDasDatasENaoEncerrado() {
        PeriodoMatricula p = new PeriodoMatricula();
        p.setInicio(LocalDate.now().minusDays(1));
        p.setFim(LocalDate.now().plusDays(1));
        assertTrue(p.estaAberto());

        p.setEncerrado(true);
        assertFalse(p.estaAberto());

        p.setEncerrado(false);
        p.setInicio(LocalDate.now().plusDays(1));
        p.setFim(LocalDate.now().plusDays(5));
        assertFalse(p.estaAberto());
    }

    @Test
    void cancelarMatriculaMudaStatus() {
        Matricula m = new Matricula();
        assertEquals(StatusMatricula.ATIVA, m.getStatus());
        m.cancelar();
        assertEquals(StatusMatricula.CANCELADA, m.getStatus());
    }
}
