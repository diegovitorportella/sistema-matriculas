package br.edu.pucminas.matriculas.model;

import br.edu.pucminas.matriculas.enums.TipoMatricula;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "usuarios")
public class Aluno extends Usuario {

    private String matricula;

    @DBRef
    private Curso curso;

    public Matricula matricular(Disciplina disciplina, TipoMatricula tipo) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public void cancelarMatricula(Matricula matricula) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public List<Matricula> consultarMatriculas() {
        throw new UnsupportedOperationException("Não implementado");
    }
}
