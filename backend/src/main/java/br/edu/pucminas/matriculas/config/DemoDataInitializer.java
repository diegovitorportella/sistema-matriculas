package br.edu.pucminas.matriculas.config;

import static br.edu.pucminas.matriculas.enums.TipoMatricula.OBRIGATORIA;
import static br.edu.pucminas.matriculas.enums.TipoMatricula.OPTATIVA;

import br.edu.pucminas.matriculas.model.Aluno;
import br.edu.pucminas.matriculas.model.Curso;
import br.edu.pucminas.matriculas.model.Disciplina;
import br.edu.pucminas.matriculas.model.Professor;
import br.edu.pucminas.matriculas.model.Secretaria;
import br.edu.pucminas.matriculas.repository.AlunoRepository;
import br.edu.pucminas.matriculas.repository.CursoRepository;
import br.edu.pucminas.matriculas.repository.DisciplinaRepository;
import br.edu.pucminas.matriculas.repository.ProfessorRepository;
import br.edu.pucminas.matriculas.repository.UsuarioRepository;
import br.edu.pucminas.matriculas.service.MatriculaService;
import br.edu.pucminas.matriculas.service.PeriodoService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Dados ficticios para demonstracao publica (DEMO_ENABLED=true).
 * So executa quando o banco ainda nao tem as contas demo e usa os servicos reais,
 * portanto as regras de matricula (limites 4+2, periodo aberto, cobranca) valem aqui tambem.
 */
@Component
@Order(2)
@ConditionalOnProperty(name = "app.demo.habilitado", havingValue = "true")
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final UsuarioRepository usuarios;
    private final ProfessorRepository professores;
    private final AlunoRepository alunos;
    private final CursoRepository cursos;
    private final DisciplinaRepository disciplinas;
    private final PeriodoService periodos;
    private final MatriculaService matriculas;
    private final PasswordEncoder encoder;
    private final String senha;

    public DemoDataInitializer(UsuarioRepository usuarios, ProfessorRepository professores, AlunoRepository alunos,
            CursoRepository cursos, DisciplinaRepository disciplinas, PeriodoService periodos,
            MatriculaService matriculas, PasswordEncoder encoder,
            @Value("${app.demo.senha:demo12345}") String senha) {
        this.usuarios = usuarios;
        this.professores = professores;
        this.alunos = alunos;
        this.cursos = cursos;
        this.disciplinas = disciplinas;
        this.periodos = periodos;
        this.matriculas = matriculas;
        this.encoder = encoder;
        this.senha = senha;
    }

    @Override
    public void run(String... args) {
        if (usuarios.existsByLogin("demo.aluno")) {
            return;
        }
        log.info("Criando dados de demonstracao...");

        Secretaria sec = new Secretaria();
        sec.setNome("Secretaria Demonstração");
        sec.setLogin("demo.secretaria");
        sec.setSenhaHash(encoder.encode(senha));
        usuarios.save(sec);

        Curso es = curso("Engenharia de Software", 240);
        Curso cc = curso("Ciência da Computação", 250);
        Curso ad = curso("Administração", 220);

        Professor helena = professor("Helena Duarte", "demo.professor");
        Professor rodrigo = professor("Rodrigo Almeida", "prof.rodrigo");
        Professor marina = professor("Marina Costa", "prof.marina");
        Professor paulo = professor("Paulo Viana", "prof.paulo");
        Professor luciana = professor("Luciana Prado", "prof.luciana");

        List<Disciplina> d = new ArrayList<>();
        d.add(disciplina("ES101", "Cálculo Diferencial e Integral", 6, helena));
        d.add(disciplina("ES102", "Algoritmos e Programação", 6, helena));
        d.add(disciplina("ES103", "Estruturas de Dados", 4, helena));
        d.add(disciplina("ES104", "Engenharia de Software", 4, rodrigo));
        d.add(disciplina("ES105", "Banco de Dados", 4, rodrigo));
        d.add(disciplina("ES106", "Física Geral", 4, marina));
        d.add(disciplina("ES107", "Gestão de Projetos", 4, marina));
        d.add(disciplina("ES108", "Ética e Sociedade", 2, marina));
        d.add(disciplina("ES109", "Engenharia de Requisitos", 4, paulo));
        d.add(disciplina("ES110", "Redes de Computadores", 4, paulo));
        d.add(disciplina("ES111", "Inteligência Artificial", 4, luciana));
        d.add(disciplina("ES112", "Computação Gráfica", 4, null));

        // Como no cadastro normal (DisciplinaController), as disciplinas passam a compor o curso.
        es.getDisciplinas().addAll(d);
        cursos.save(es);

        List<String> ids = d.stream().map(Disciplina::getId).toList();
        LocalDate hoje = LocalDate.now();
        String semestre = hoje.getYear() + "/" + (hoje.getMonthValue() <= 6 ? 1 : 2);
        periodos.gerarCurriculo(semestre, ids);
        // Período longo: a demonstração pública não pode "expirar" sozinha.
        periodos.abrir(semestre, hoje.minusDays(5), hoje.plusYears(2));

        Aluno demo = aluno("Aluno Demonstração", "demo.aluno", "20260000", es);
        String[] nomes = { "Ana Beatriz Souza", "Bruno Carvalho Lima", "Camila Ferreira", "Daniel Ribeiro",
                "Eduarda Nogueira", "Felipe Andrade", "Gabriela Mendes", "Henrique Tavares", "Isabela Moreira",
                "João Pedro Rocha", "Larissa Teixeira", "Mateus Barbosa", "Natália Pires" };
        Curso[] doCurso = { es, es, cc, es, ad, cc, es, ad, cc, es, ad, cc, es };
        List<Aluno> turma = new ArrayList<>();
        for (int i = 0; i < nomes.length; i++) {
            turma.add(aluno(nomes[i], "aluno" + (i + 1), String.format("2026%04d", i + 1), doCurso[i]));
        }

        // Aluno demo: 2 obrigatorias ja confirmadas; ainda da para montar o resto do plano.
        inscrever(demo, ids, new int[] { 0, 1 }, new int[] {});
        inscrever(turma.get(0), ids, new int[] { 0, 1, 2, 3 }, new int[] { 5, 6 });
        inscrever(turma.get(1), ids, new int[] { 0, 1, 2, 4 }, new int[] { 5 });
        inscrever(turma.get(2), ids, new int[] { 0, 1, 3, 4 }, new int[] { 6, 7 });
        inscrever(turma.get(3), ids, new int[] { 0, 2, 3, 4 }, new int[] {});
        inscrever(turma.get(4), ids, new int[] { 0, 1, 2, 3 }, new int[] { 7 });
        inscrever(turma.get(5), ids, new int[] { 1, 2, 4, 5 }, new int[] {});
        inscrever(turma.get(6), ids, new int[] { 0, 3, 4, 5 }, new int[] { 8 });
        inscrever(turma.get(7), ids, new int[] { 1, 2, 3, 6 }, new int[] {});
        inscrever(turma.get(8), ids, new int[] { 0, 1, 4, 7 }, new int[] { 8 });
        inscrever(turma.get(9), ids, new int[] { 2, 3, 5, 6 }, new int[] {});
        inscrever(turma.get(10), ids, new int[] { 0, 4, 6, 7 }, new int[] { 9 });
        inscrever(turma.get(11), ids, new int[] { 1, 3, 5, 7 }, new int[] {});
        // turma.get(12) fica sem matriculas, para mostrar o estado vazio.

        log.info("Dados de demonstracao criados (semestre {}). Contas: demo.aluno, demo.professor, demo.secretaria.", semestre);
    }

    private void inscrever(Aluno a, List<String> ids, int[] obrigatorias, int[] optativas) {
        for (int i : obrigatorias) {
            matriculas.matricular(a, ids.get(i), OBRIGATORIA);
        }
        for (int i : optativas) {
            matriculas.matricular(a, ids.get(i), OPTATIVA);
        }
    }

    private Curso curso(String nome, int creditos) {
        Curso c = new Curso();
        c.setNome(nome);
        c.setCreditos(creditos);
        return cursos.save(c);
    }

    private Professor professor(String nome, String login) {
        Professor p = new Professor();
        p.setNome(nome);
        p.setLogin(login);
        p.setSenhaHash(encoder.encode(senha));
        return professores.save(p);
    }

    private Aluno aluno(String nome, String login, String matricula, Curso curso) {
        Aluno a = new Aluno();
        a.setNome(nome);
        a.setLogin(login);
        a.setMatricula(matricula);
        a.setCurso(curso);
        a.setSenhaHash(encoder.encode(senha));
        return alunos.save(a);
    }

    private Disciplina disciplina(String codigo, String nome, int creditos, Professor professor) {
        Disciplina x = new Disciplina();
        x.setCodigo(codigo);
        x.setNome(nome);
        x.setCreditos(creditos);
        x.setProfessor(professor);
        return disciplinas.save(x);
    }
}
