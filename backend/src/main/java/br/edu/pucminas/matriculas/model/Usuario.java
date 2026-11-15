package br.edu.pucminas.matriculas.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "usuarios")
public abstract class Usuario {

    @Id
    private String id;
    private String nome;
    private String login;
    private String senhaHash;

    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder();

    /** Valida a senha informada contra o hash BCrypt armazenado. */
    public boolean autenticar(String senha) {
        return senha != null && senhaHash != null && ENCODER.matches(senha, senhaHash);
    }

    /** Perfil de acesso, derivado do tipo concreto do usuário. */
    public String perfil() {
        return getClass().getSimpleName().toUpperCase();
    }
}
