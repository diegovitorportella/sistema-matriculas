package br.edu.pucminas.matriculas.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.pucminas.matriculas.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SaudeController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "app.jwt.secret=segredo-de-teste-com-mais-de-32-caracteres-0123")
class SaudeControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void saudeEPublica() throws Exception {
        mvc.perform(get("/api/saude")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ok"));
        mvc.perform(head("/api/saude")).andExpect(status().isOk());
    }

    @Test
    void demaisRotasContinuamProtegidas() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/alunos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/saude/qualquer")).andExpect(status().isUnauthorized());
    }
}
