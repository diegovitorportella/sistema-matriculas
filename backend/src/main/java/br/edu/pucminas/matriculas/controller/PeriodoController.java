package br.edu.pucminas.matriculas.controller;

import br.edu.pucminas.matriculas.dto.Dtos.ConsolidacaoResponse;
import br.edu.pucminas.matriculas.dto.Dtos.CurriculoRequest;
import br.edu.pucminas.matriculas.dto.Dtos.CurriculoResponse;
import br.edu.pucminas.matriculas.dto.Dtos.PeriodoRequest;
import br.edu.pucminas.matriculas.dto.Dtos.PeriodoResponse;
import br.edu.pucminas.matriculas.exception.NaoEncontradoException;
import br.edu.pucminas.matriculas.repository.CurriculoRepository;
import br.edu.pucminas.matriculas.repository.PeriodoMatriculaRepository;
import br.edu.pucminas.matriculas.service.PeriodoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PeriodoController {

    private final PeriodoService service;
    private final PeriodoMatriculaRepository periodos;
    private final CurriculoRepository curriculos;

    public PeriodoController(PeriodoService service, PeriodoMatriculaRepository periodos,
            CurriculoRepository curriculos) {
        this.service = service;
        this.periodos = periodos;
        this.curriculos = curriculos;
    }

    // ---------- Currículos ----------

    @GetMapping("/curriculos")
    public List<CurriculoResponse> listarCurriculos() {
        return curriculos.findAll().stream().map(CurriculoResponse::de).toList();
    }

    @PostMapping("/curriculos")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SECRETARIA')")
    public CurriculoResponse gerarCurriculo(@Valid @RequestBody CurriculoRequest req) {
        return CurriculoResponse.de(service.gerarCurriculo(req.semestre(), req.disciplinaIds()));
    }

    // ---------- Períodos de matrícula ----------

    @GetMapping("/periodos")
    public List<PeriodoResponse> listarPeriodos() {
        return periodos.findAll().stream().map(PeriodoResponse::de).toList();
    }

    /** Período aberto agora (404 se não houver). */
    @GetMapping("/periodos/atual")
    public PeriodoResponse atual() {
        return service.periodoAberto().map(PeriodoResponse::de)
                .orElseThrow(() -> new NaoEncontradoException("Não há período de matrículas aberto"));
    }

    @PostMapping("/periodos")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SECRETARIA')")
    public PeriodoResponse abrir(@Valid @RequestBody PeriodoRequest req) {
        return PeriodoResponse.de(service.abrir(req.semestre(), req.inicio(), req.fim()));
    }

    @PostMapping("/periodos/{id}/encerrar")
    @PreAuthorize("hasRole('SECRETARIA')")
    public List<ConsolidacaoResponse> encerrar(@PathVariable String id) {
        return service.encerrar(id);
    }
}
