package br.edu.pucminas.matriculas.model;

import br.edu.pucminas.matriculas.enums.StatusDisciplina;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "disciplinas")
public class Disciplina {

    public static final int MIN_ALUNOS = 3;
    public static final int MAX_ALUNOS = 60;

    @Id
    private String id;
    private String codigo;
    private String nome;
    private int creditos;
    private StatusDisciplina status = StatusDisciplina.ABERTA;
    private int minAlunos = MIN_ALUNOS;
    private int maxAlunos = MAX_ALUNOS;

    @DBRef
    private Professor professor;

    /** Total de matrículas ativas no período corrente; preenchido pelo serviço antes de consultar as regras. */
    @Transient
    private int matriculadosAtivos;

    public int totalMatriculados() {
        return matriculadosAtivos;
    }

    public boolean temVaga() {
        return totalMatriculados() < maxAlunos;
    }

    /** Ao fim do período: ATIVA se total >= minAlunos, senão CANCELADA. */
    public void avaliarAtivacao() {
        status = totalMatriculados() >= minAlunos ? StatusDisciplina.ATIVA : StatusDisciplina.CANCELADA;
    }
}
