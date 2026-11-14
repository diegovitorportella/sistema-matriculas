package br.edu.pucminas.matriculas.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class UsuarioTest {

    private Usuario novoAluno(String senha) {
        Aluno aluno = new Aluno();
        aluno.setSenhaHash(new BCryptPasswordEncoder().encode(senha));
        return aluno;
    }

    @Test
    void autenticaComSenhaCorreta() {
        assertTrue(novoAluno("abc123").autenticar("abc123"));
    }

    @Test
    void rejeitaSenhaIncorretaOuNula() {
        Usuario aluno = novoAluno("abc123");
        assertFalse(aluno.autenticar("errada"));
        assertFalse(aluno.autenticar(null));
    }

    @Test
    void perfilDerivaDoTipoConcreto() {
        assertEquals("ALUNO", new Aluno().perfil());
        assertEquals("PROFESSOR", new Professor().perfil());
        assertEquals("SECRETARIA", new Secretaria().perfil());
    }
}
