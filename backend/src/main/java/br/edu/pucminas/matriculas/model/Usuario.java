package br.edu.pucminas.matriculas.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
@NoArgsConstructor
public abstract class Usuario {

    @Id
    private String id;
    private String nome;
    private String login;
    private String senhaHash;

    /** Valida a senha informada contra o hash armazenado (implementação na etapa de Autenticação). */
    public boolean autenticar(String senha) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
