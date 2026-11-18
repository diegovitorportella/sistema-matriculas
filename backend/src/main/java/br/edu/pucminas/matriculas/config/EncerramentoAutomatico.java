package br.edu.pucminas.matriculas.config;

import br.edu.pucminas.matriculas.service.PeriodoService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Encerra sozinho os períodos de matrículas cuja data final já passou, confirmando ou cancelando
 * cada disciplina (mínimo de 3 alunos). A secretaria continua podendo encerrar antes, manualmente.
 * Desative com PERIODO_ENCERRAMENTO_AUTOMATICO=false.
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "app.periodo.encerramento-automatico", havingValue = "true", matchIfMissing = true)
public class EncerramentoAutomatico {

    private final PeriodoService periodos;

    public EncerramentoAutomatico(PeriodoService periodos) {
        this.periodos = periodos;
    }

    @Scheduled(initialDelayString = "PT1M", fixedDelayString = "PT1H")
    void encerrarPeriodosVencidos() {
        periodos.encerrarVencidos();
    }
}
