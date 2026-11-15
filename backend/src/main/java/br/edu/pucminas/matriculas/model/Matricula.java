package br.edu.pucminas.matriculas.model;

import br.edu.pucminas.matriculas.enums.StatusMatricula;
import br.edu.pucminas.matriculas.enums.TipoMatricula;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "matriculas")
public class Matricula {

    @Id
    private String id;
    private TipoMatricula tipo;
    private StatusMatricula status = StatusMatricula.ATIVA;
    private LocalDate dataMatricula;

    @DBRef
    private Aluno aluno;

    @DBRef
    private Disciplina disciplina;

    @DBRef
    private PeriodoMatricula periodo;

    public void cancelar() {
        this.status = StatusMatricula.CANCELADA;
    }
}
