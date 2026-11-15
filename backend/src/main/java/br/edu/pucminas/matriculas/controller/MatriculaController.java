package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.Dtos.MatriculaRequest;
import br.edu.pucminas.matriculas.dto.Dtos.MatriculaResponse;
import br.edu.pucminas.matriculas.security.UsuarioLogado;
import br.edu.pucminas.matriculas.service.MatriculaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matriculas")
@PreAuthorize("hasRole('ALUNO')")
public class MatriculaController {

    private final MatriculaService service;
    private final UsuarioLogado logado;

    public MatriculaController(MatriculaService service, UsuarioLogado logado) {
        this.service = service;
        this.logado = logado;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatriculaResponse matricular(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody MatriculaRequest req) {
        return MatriculaResponse.de(service.matricular(logado.aluno(jwt), req.disciplinaId(), req.tipo()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        service.cancelar(logado.aluno(jwt), id);
    }

    @GetMapping("/minhas")
    public List<MatriculaResponse> minhas(@AuthenticationPrincipal Jwt jwt) {
        return service.minhas(logado.aluno(jwt)).stream().map(MatriculaResponse::de).toList();
    }
}
