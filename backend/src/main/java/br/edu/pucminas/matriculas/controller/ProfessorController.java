package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.Dtos.AlunoResponse;
import br.edu.pucminas.matriculas.dto.Dtos.DisciplinaResponse;
import br.edu.pucminas.matriculas.dto.Dtos.ProfessorRequest;
import br.edu.pucminas.matriculas.dto.Dtos.ProfessorResponse;
import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.exception.RegraNegocioException;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Professor;
import br.edu.pucminas.matriculas.repository.DisciplinaRepository;
import br.edu.pucminas.matriculas.repository.MatriculaRepository;
import br.edu.pucminas.matriculas.repository.ProfessorRepository;
import br.edu.pucminas.matriculas.repository.UsuarioRepository;
import br.edu.pucminas.matriculas.security.UsuarioLogado;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
@RequestMapping("/api/professores")
public class ProfessorController {

    private final ProfessorRepository professores;
    private final UsuarioRepository usuarios;
    private final DisciplinaRepository disciplinas;
    private final MatriculaRepository matriculas;
    private final PasswordEncoder encoder;
    private final UsuarioLogado logado;

    public ProfessorController(ProfessorRepository professores, UsuarioRepository usuarios,
            DisciplinaRepository disciplinas, MatriculaRepository matriculas, PasswordEncoder encoder,
            UsuarioLogado logado) {
        this.professores = professores;
        this.usuarios = usuarios;
        this.disciplinas = disciplinas;
        this.matriculas = matriculas;
        this.encoder = encoder;
        this.logado = logado;
    }

    // ---------- CRUD (secretaria) ----------

    @GetMapping
    @PreAuthorize("hasRole('SECRETARIA')")
    public List<ProfessorResponse> listar() {
        return professores.listarTodos().stream().map(ProfessorResponse::de).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SECRETARIA')")
    public ProfessorResponse criar(@Valid @RequestBody ProfessorRequest req) {
        if (req.senha() == null || req.senha().isBlank()) {
            throw new RegraNegocioException("Senha é obrigatória");
        }
        if (usuarios.existsByLogin(req.login())) {
            throw new RegraNegocioException("Login já em uso");
        }
        Professor p = new Professor();
        p.setNome(req.nome());
        p.setLogin(req.login());
        p.setSenhaHash(encoder.encode(req.senha()));
        return ProfessorResponse.de(professores.save(p));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SECRETARIA')")
    public ProfessorResponse atualizar(@PathVariable String id, @Valid @RequestBody ProfessorRequest req) {
        Professor p = professores.findById(id).orElseThrow(() -> new NaoEncontradoException("Professor não encontrado"));
        if (!p.getLogin().equals(req.login()) && usuarios.existsByLogin(req.login())) {
            throw new RegraNegocioException("Login já em uso");
        }
        p.setNome(req.nome());
        p.setLogin(req.login());
        if (req.senha() != null && !req.senha().isBlank()) {
            p.setSenhaHash(encoder.encode(req.senha()));
        }
        return ProfessorResponse.de(professores.save(p));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SECRETARIA')")
    public void remover(@PathVariable String id) {
        if (!professores.existeComId(id)) {
            throw new NaoEncontradoException("Professor não encontrado");
        }
        professores.deleteById(id);
    }

    // ---------- Visão do próprio professor ----------

    @GetMapping("/me/disciplinas")
    @PreAuthorize("hasRole('PROFESSOR')")
    public List<DisciplinaResponse> minhasDisciplinas(@AuthenticationPrincipal Jwt jwt) {
        return disciplinas.findByProfessor(logado.professor(jwt)).stream().map(DisciplinaResponse::de).toList();
    }

    @GetMapping("/me/disciplinas/{disciplinaId}/alunos")
    @PreAuthorize("hasRole('PROFESSOR')")
    public List<AlunoResponse> alunosDaDisciplina(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String disciplinaId) {
        Professor professor = logado.professor(jwt);
        Disciplina d = disciplinas.findById(disciplinaId)
                .orElseThrow(() -> new NaoEncontradoException("Disciplina não encontrada"));
        if (d.getProfessor() == null || !d.getProfessor().getId().equals(professor.getId())) {
            throw new NaoEncontradoException("Disciplina não encontrada");
        }
        return matriculas.findByDisciplinaAndStatus(d, StatusMatricula.ATIVA).stream()
                .map(m -> AlunoResponse.de(m.getAluno())).toList();
    }
}
