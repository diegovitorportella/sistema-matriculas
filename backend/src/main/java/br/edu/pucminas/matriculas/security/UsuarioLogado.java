package br.edu.pucminas.matriculas.security;

import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.model.Professor;
import br.edu.pucminas.matriculas.repository.AlunoRepository;
import br.edu.pucminas.matriculas.repository.ProfessorRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/** Resolve o usuário a partir do subject (id) do JWT. */
@Component
public class UsuarioLogado {

    private final AlunoRepository alunos;
    private final ProfessorRepository professores;

    public UsuarioLogado(AlunoRepository alunos, ProfessorRepository professores) {
        this.alunos = alunos;
        this.professores = professores;
    }

    public Aluno aluno(Jwt jwt) {
        return alunos.findById(jwt.getSubject()).orElseThrow(() -> new NaoEncontradoException("Aluno não encontrado"));
    }

    public Professor professor(Jwt jwt) {
        return professores.findById(jwt.getSubject())
                .orElseThrow(() -> new NaoEncontradoException("Professor não encontrado"));
    }
}
