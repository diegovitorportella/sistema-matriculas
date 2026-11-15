package br.edu.pucminas.matriculas.dto;

import br.edu.pucminas.matriculas.enums.StatusDisciplina;
import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.enums.TipoMatricula;
import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.model.Curriculo;
import br.edu.pucminas.matriculas.model.Curso;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Matricula;
import br.edu.pucminas.matriculas.model.PeriodoMatricula;
import br.edu.pucminas.matriculas.model.Professor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/** Records de entrada/saída da API. Entidades nunca são expostas (evita vazar senhaHash). */
public final class Dtos {

    private Dtos() {
    }

    // ---------- Curso ----------
    public record CursoRequest(@NotBlank String nome, @Min(1) int creditos) {
    }

    public record CursoResponse(String id, String nome, int creditos) {
        public static CursoResponse de(Curso c) {
            return new CursoResponse(c.getId(), c.getNome(), c.getCreditos());
        }
    }

    // ---------- Disciplina ----------
    public record DisciplinaRequest(@NotBlank String codigo, @NotBlank String nome, @Min(1) int creditos,
            String cursoId, String professorId) {
    }

    public record DisciplinaResponse(String id, String codigo, String nome, int creditos,
            StatusDisciplina status, String professorId, String professorNome) {
        public static DisciplinaResponse de(Disciplina d) {
            Professor p = d.getProfessor();
            return new DisciplinaResponse(d.getId(), d.getCodigo(), d.getNome(), d.getCreditos(), d.getStatus(),
                    p == null ? null : p.getId(), p == null ? null : p.getNome());
        }
    }

    // ---------- Professor / Aluno ----------
    public record ProfessorRequest(@NotBlank String nome, @NotBlank String login, String senha) {
    }

    public record ProfessorResponse(String id, String nome, String login) {
        public static ProfessorResponse de(Professor p) {
            return new ProfessorResponse(p.getId(), p.getNome(), p.getLogin());
        }
    }

    public record AlunoRequest(@NotBlank String nome, @NotBlank String login, String senha,
            @NotBlank String matricula, String cursoId) {
    }

    public record AlunoResponse(String id, String nome, String login, String matricula,
            String cursoId, String cursoNome) {
        public static AlunoResponse de(Aluno a) {
            Curso c = a.getCurso();
            return new AlunoResponse(a.getId(), a.getNome(), a.getLogin(), a.getMatricula(),
                    c == null ? null : c.getId(), c == null ? null : c.getNome());
        }
    }

    // ---------- Currículo / Período ----------
    public record CurriculoRequest(@NotBlank String semestre, List<String> disciplinaIds) {
    }

    public record CurriculoResponse(String id, String semestre, List<DisciplinaResponse> disciplinas,
            String periodoId) {
        public static CurriculoResponse de(Curriculo c) {
            return new CurriculoResponse(c.getId(), c.getSemestre(),
                    c.getDisciplinas().stream().filter(Objects::nonNull).map(DisciplinaResponse::de).toList(),
                    c.getPeriodoMatricula() == null ? null : c.getPeriodoMatricula().getId());
        }
    }

    public record PeriodoRequest(@NotBlank String semestre, @NotNull LocalDate inicio, @NotNull LocalDate fim) {
    }

    public record PeriodoResponse(String id, String semestre, LocalDate inicio, LocalDate fim,
            boolean encerrado, boolean aberto) {
        public static PeriodoResponse de(PeriodoMatricula p) {
            return new PeriodoResponse(p.getId(), p.getSemestre(), p.getInicio(), p.getFim(),
                    p.isEncerrado(), p.estaAberto());
        }
    }

    public record ConsolidacaoResponse(String disciplinaId, String codigo, String nome,
            int matriculados, StatusDisciplina status) {
    }

    // ---------- Matrícula ----------
    public record MatriculaRequest(@NotBlank String disciplinaId, @NotNull TipoMatricula tipo) {
    }

    public record MatriculaResponse(String id, String disciplinaId, String disciplinaCodigo,
            String disciplinaNome, TipoMatricula tipo, StatusMatricula status, LocalDate dataMatricula,
            String semestre) {
        public static MatriculaResponse de(Matricula m) {
            Disciplina d = m.getDisciplina();
            PeriodoMatricula p = m.getPeriodo();
            return new MatriculaResponse(m.getId(), d.getId(), d.getCodigo(), d.getNome(), m.getTipo(),
                    m.getStatus(), m.getDataMatricula(), p == null ? null : p.getSemestre());
        }
    }
}
