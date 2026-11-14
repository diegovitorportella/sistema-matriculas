package br.edu.pucminas.matriculas.config;

import br.edu.pucminas.matriculas.model.Secretaria;
import br.edu.pucminas.matriculas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Garante que exista ao menos uma secretaria para o primeiro acesso. */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner criarSecretariaInicial(UsuarioRepository usuarios, PasswordEncoder encoder,
            @Value("${app.seed.login:secretaria}") String login,
            @Value("${app.seed.senha:secretaria123}") String senha) {
        return args -> {
            if (!usuarios.existsByLogin(login)) {
                Secretaria s = new Secretaria();
                s.setNome("Secretaria");
                s.setLogin(login);
                s.setSenhaHash(encoder.encode(senha));
                usuarios.save(s);
            }
        };
    }
}
