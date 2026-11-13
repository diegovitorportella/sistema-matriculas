package br.edu.pucminas.matriculas.model;

import java.util.List;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@NoArgsConstructor
@Document(collection = "usuarios")
public class Professor extends Usuario {

    public List<Aluno> consultarAlunos(Disciplina disciplina) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
