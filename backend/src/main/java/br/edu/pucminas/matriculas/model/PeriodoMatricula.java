package br.edu.pucminas.matriculas.model;

import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "periodos_matricula")
public class PeriodoMatricula {

    @Id
    private String id;
    private String semestre;
    private LocalDate inicio;
    private LocalDate fim;

    public boolean estaAberto() {
        throw new UnsupportedOperationException("Não implementado");
    }
}
