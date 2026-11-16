package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.Dtos.AlunoRequest;
import br.edu.pucminas.matriculas.dto.Dtos.AlunoResponse;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.exception.RegraNegocioException;
import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.repository.AlunoRepository;
import br.edu.pucminas.matriculas.repository.CursoRepository;
import br.edu.pucminas.matriculas.repository.UsuarioRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
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
@RequestMapping("/api/alunos")
@PreAuthorize("hasRole('SECRETARIA')")
public class AlunoController {

    private final AlunoRepository alunos;
    private final UsuarioRepository usuarios;
    private final CursoRepository cursos;
    private final PasswordEncoder encoder;

    public AlunoController(AlunoRepository alunos, UsuarioRepository usuarios, CursoRepository cursos,
            PasswordEncoder encoder) {
        this.alunos = alunos;
        this.usuarios = usuarios;
        this.cursos = cursos;
        this.encoder = encoder;
    }

    @GetMapping
    public List<AlunoResponse> listar() {
        return alunos.listarTodos().stream().map(AlunoResponse::de).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AlunoResponse criar(@Valid @RequestBody AlunoRequest req) {
        if (req.senha() == null || req.senha().isBlank()) {
            throw new RegraNegocioException("Senha é obrigatória");
        }
        if (usuarios.existsByLogin(req.login())) {
            throw new RegraNegocioException("Login já em uso");
        }
        Aluno a = new Aluno();
        a.setSenhaHash(encoder.encode(req.senha()));
        aplicar(a, req);
        return AlunoResponse.de(alunos.save(a));
    }

    @PutMapping("/{id}")
    public AlunoResponse atualizar(@PathVariable String id, @Valid @RequestBody AlunoRequest req) {
        Aluno a = alunos.findById(id).orElseThrow(() -> new NaoEncontradoException("Aluno não encontrado"));
        if (!a.getLogin().equals(req.login()) && usuarios.existsByLogin(req.login())) {
            throw new RegraNegocioException("Login já em uso");
        }
        if (req.senha() != null && !req.senha().isBlank()) {
            a.setSenhaHash(encoder.encode(req.senha()));
        }
        aplicar(a, req);
        return AlunoResponse.de(alunos.save(a));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable String id) {
        if (!alunos.existeComId(id)) {
            throw new NaoEncontradoException("Aluno não encontrado");
        }
        alunos.deleteById(id);
    }

    private void aplicar(Aluno a, AlunoRequest req) {
        a.setNome(req.nome());
        a.setLogin(req.login());
        a.setMatricula(req.matricula());
        if (req.cursoId() != null && !req.cursoId().isBlank()) {
            a.setCurso(cursos.findById(req.cursoId())
                    .orElseThrow(() -> new NaoEncontradoException("Curso não encontrado")));
        }
    }
}
