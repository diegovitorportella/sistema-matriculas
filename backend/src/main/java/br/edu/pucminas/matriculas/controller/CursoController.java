package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.Dtos.CursoRequest;
import br.edu.pucminas.matriculas.dto.Dtos.CursoResponse;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.model.Curso;
import br.edu.pucminas.matriculas.repository.CursoRepository;
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
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoRepository cursos;

    public CursoController(CursoRepository cursos) {
        this.cursos = cursos;
    }

    @GetMapping
    public List<CursoResponse> listar() {
        return cursos.findAll().stream().map(CursoResponse::de).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SECRETARIA')")
    public CursoResponse criar(@Valid @RequestBody CursoRequest req) {
        Curso c = new Curso();
        c.setNome(req.nome());
        c.setCreditos(req.creditos());
        return CursoResponse.de(cursos.save(c));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SECRETARIA')")
    public CursoResponse atualizar(@PathVariable String id, @Valid @RequestBody CursoRequest req) {
        Curso c = cursos.findById(id).orElseThrow(() -> new NaoEncontradoException("Curso não encontrado"));
        c.setNome(req.nome());
        c.setCreditos(req.creditos());
        return CursoResponse.de(cursos.save(c));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SECRETARIA')")
    public void remover(@PathVariable String id) {
        if (!cursos.existsById(id)) {
            throw new NaoEncontradoException("Curso não encontrado");
        }
        cursos.deleteById(id);
    }
}
