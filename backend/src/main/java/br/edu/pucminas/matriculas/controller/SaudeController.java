package br.edu.pucminas.matriculas.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verificação de disponibilidade para monitores externos (por exemplo UptimeRobot).
 * É pública e não consulta o banco nem expõe dados.
 */
@RestController
@RequestMapping("/api/saude")
public class SaudeController {

    @GetMapping
    public Map<String, String> saude() {
        return Map.of("status", "ok");
    }
}
