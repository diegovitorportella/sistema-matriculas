package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.LoginRequest;
import br.edu.pucminas.matriculas.dto.LoginResponse;
import br.edu.pucminas.matriculas.repository.UsuarioRepository;
import br.edu.pucminas.matriculas.security.JwtService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarios;
    private final JwtService jwt;

    public AuthController(UsuarioRepository usuarios, JwtService jwt) {
        this.usuarios = usuarios;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return usuarios.findByLogin(req.login())
                .filter(u -> u.autenticar(req.senha()))
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(
                        new LoginResponse(jwt.gerarToken(u), u.getNome(), u.perfil())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("erro", "Usuário ou senha inválidos")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt token) {
        return usuarios.findById(token.getSubject())
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(
                        new LoginResponse(null, u.getNome(), u.perfil())))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
