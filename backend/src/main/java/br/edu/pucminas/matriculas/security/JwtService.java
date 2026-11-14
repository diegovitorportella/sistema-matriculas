package br.edu.pucminas.matriculas.security;

import br.edu.pucminas.matriculas.model.Usuario;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final Duration validade;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.expiracao-minutos:120}") long minutos) {
        this.encoder = encoder;
        this.validade = Duration.ofMinutes(minutos);
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(usuario.getId())
                .issuedAt(agora)
                .expiresAt(agora.plus(validade))
                .claim("login", usuario.getLogin())
                .claim("roles", List.of(usuario.perfil()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
