package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.Dtos.DisciplinaRequest;
import br.edu.pucminas.matriculas.dto.Dtos.DisciplinaResponse;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.model.Curso;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Professor;
import br.edu.pucminas.matriculas.repository.CursoRepository;
import br.edu.pucminas.matriculas.repository.DisciplinaRepository;
import br.edu.pucminas.matriculas.repository.ProfessorRepository;
import br.edu.pucminas.matriculas.service.MatriculaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/disciplinas")
public class DisciplinaController {

    private final DisciplinaRepository disciplinas;
    private final CursoRepository cursos;
    private final ProfessorRepository professores;
    private final MatriculaService matriculaService;

    public DisciplinaController(DisciplinaRepository disciplinas, CursoRepository cursos,
            ProfessorRepository professores, MatriculaService matriculaService) {
        this.disciplinas = disciplinas;
        this.cursos = cursos;
        this.professores = professores;
        this.matriculaService = matriculaService;
    }

    @GetMapping
    public List<DisciplinaResponse> listar() {
        return disciplinas.findAll().stream().map(DisciplinaResponse::de).toList();
    }

    /** Disciplinas do currículo do semestre com período de matrículas aberto. */
    @GetMapping("/ofertadas")
    @PreAuthorize("hasRole('ALUNO')")
    public List<DisciplinaResponse> ofertadas() {
        return matriculaService.ofertadas().stream().map(DisciplinaResponse::de).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SECRETARIA')")
    public DisciplinaResponse criar(@Valid @RequestBody DisciplinaRequest req) {
        Disciplina d = new Disciplina();
        aplicar(d, req);
        disciplinas.save(d);
        if (req.cursoId() != null && !req.cursoId().isBlank()) {
            Curso curso = cursos.findById(req.cursoId())
                    .orElseThrow(() -> new NaoEncontradoException("Curso não encontrado"));
            curso.getDisciplinas().add(d);
            cursos.save(curso);
        }
        return DisciplinaResponse.de(d);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SECRETARIA')")
    public DisciplinaResponse atualizar(@PathVariable String id, @Valid @RequestBody DisciplinaRequest req) {
        Disciplina d = disciplinas.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Disciplina não encontrada"));
        aplicar(d, req);
        return DisciplinaResponse.de(disciplinas.save(d));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SECRETARIA')")
    public void remover(@PathVariable String id) {
        if (!disciplinas.existsById(id)) {
            throw new NaoEncontradoException("Disciplina não encontrada");
        }
        disciplinas.deleteById(id);
    }

    private void aplicar(Disciplina d, DisciplinaRequest req) {
        d.setCodigo(req.codigo());
        d.setNome(req.nome());
        d.setCreditos(req.creditos());
        if (req.professorId() != null && !req.professorId().isBlank()) {
            Professor p = professores.findById(req.professorId())
                    .orElseThrow(() -> new NaoEncontradoException("Professor não encontrado"));
            d.setProfessor(p);
        }
    }
}
