package br.edu.pucminas.matriculas.model;

import java.time.LocalDateTime;
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
@Document(collection = "notificacoes_cobranca")
public class NotificacaoCobranca {

    @Id
    private String id;
    private String semestre;
    private LocalDateTime dataEnvio;
    private boolean enviada;

    @DBRef
    private Aluno aluno;

    @DBRef
    private List<Matricula> matriculas = new ArrayList<>();

    public void enviar() {
        throw new UnsupportedOperationException("Não implementado");
    }
}
