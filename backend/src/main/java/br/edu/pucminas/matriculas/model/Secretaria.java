package br.edu.pucminas.matriculas.model;

import java.time.LocalDate;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@NoArgsConstructor
@Document(collection = "usuarios")
public class Secretaria extends Usuario {

    public Curriculo gerarCurriculo(String semestre) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public PeriodoMatricula abrirPeriodoMatriculas(LocalDate inicio, LocalDate fim) {
        throw new UnsupportedOperationException("Não implementado");
    }

    public void encerrarPeriodoMatriculas(PeriodoMatricula periodo) {
        throw new UnsupportedOperationException("Não implementado");
    }
}
