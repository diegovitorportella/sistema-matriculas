package br.edu.pucminas.matriculas.model;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "curriculos")
public class Curriculo {

    @Id
    private String id;
    private String semestre;

    @DBRef
    private List<Disciplina> disciplinas = new ArrayList<>();

    @DBRef
    private PeriodoMatricula periodoMatricula;

    public void adicionarDisciplina(Disciplina disciplina) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
