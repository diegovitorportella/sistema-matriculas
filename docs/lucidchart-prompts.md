# Prompts para o Lucidchart AI

## 1. Diagrama de Casos de Uso

Create a UML Use Case Diagram for a University Enrollment System (Sistema de Matrículas), with all labels in Brazilian Portuguese. Draw a system boundary box titled "Sistema de Matrículas".

Actors (stick figures outside the boundary): Aluno, Professor, Secretaria (left/right sides), and "Sistema de Cobranças" (external system, right side).

Use cases (ovals inside the boundary):
- Autenticar (Login) — associated with Aluno, Professor and Secretaria
- Gerenciar Cursos — Secretaria
- Gerenciar Disciplinas — Secretaria
- Gerenciar Professores — Secretaria
- Gerenciar Alunos — Secretaria
- Gerar Currículo do Semestre — Secretaria
- Gerenciar Período de Matrículas — Secretaria
- Consolidar Disciplinas (ativar/cancelar) — Secretaria
- Matricular-se em Disciplinas — Aluno
- Cancelar Matrícula — Aluno
- Consultar Minhas Matrículas — Aluno
- Consultar Alunos por Disciplina — Professor
- Notificar Cobrança — associated with Sistema de Cobranças

Relationships:
- «include» from Matricular-se em Disciplinas, Cancelar Matrícula, Consultar Minhas Matrículas, Consultar Alunos por Disciplina and all Secretaria use cases to Autenticar.
- «include» from Matricular-se em Disciplinas to Notificar Cobrança.
- «extend» from Consolidar Disciplinas to Gerenciar Período de Matrículas (triggered when the period ends).
Keep a clean layout with no crossing lines where possible.

## 2. Diagrama de Classes

Create a UML Class Diagram for a University Enrollment System, with class names, attributes and methods in Brazilian Portuguese (camelCase). Show visibility (+/-) and types.

LAYOUT: clean and NON-OVERLAPPING. Use straight lines, large spacing between classes, no line crossing through any class box or label. Put Usuario at the top center with Aluno, Professor and Secretaria below it (generalization arrows pointing up to Usuario). Put Curso, Curriculo, Disciplina and PeriodoMatricula in a middle row, and Matricula, NotificacaoCobranca and the enumerations in the bottom row. Place multiplicities next to the line ends, not on top of boxes.

Classes:
- Usuario (abstract): -id: String, -nome: String, -login: String, -senhaHash: String; +autenticar(senha: String): boolean
- Aluno extends Usuario: -matricula: String; +matricular(disciplina: Disciplina, tipo: TipoMatricula): Matricula, +cancelarMatricula(matricula: Matricula): void, +consultarMatriculas(): List<Matricula>
- Professor extends Usuario: +consultarAlunos(disciplina: Disciplina): List<Aluno>
- Secretaria extends Usuario: +gerarCurriculo(semestre: String): Curriculo, +abrirPeriodoMatriculas(inicio: Date, fim: Date): PeriodoMatricula, +encerrarPeriodoMatriculas(periodo: PeriodoMatricula): void
- Curso: -id: String, -nome: String, -creditos: int
- Disciplina: -id: String, -codigo: String, -nome: String, -creditos: int, -status: StatusDisciplina, -minAlunos: int = 3, -maxAlunos: int = 60; +totalMatriculados(): int, +temVaga(): boolean, +avaliarAtivacao(): void
- Curriculo: -id: String, -semestre: String; +adicionarDisciplina(d: Disciplina): void
- PeriodoMatricula: -id: String, -inicio: Date, -fim: Date, -semestre: String; +estaAberto(): boolean
- Matricula: -id: String, -tipo: TipoMatricula, -status: StatusMatricula, -dataMatricula: Date; +cancelar(): void
- NotificacaoCobranca: -id: String, -semestre: String, -dataEnvio: Date, -enviada: boolean; +enviar(): void

Enumerations: TipoMatricula {OBRIGATORIA, OPTATIVA}; StatusMatricula {ATIVA, CANCELADA}; StatusDisciplina {ABERTA, ATIVA, CANCELADA}.

Relationships with multiplicities:
- Curso 1 — 1..* Disciplina (composition/aggregation: "é constituído por")
- Aluno * — 1 Curso
- Professor 1 — 0..* Disciplina ("leciona")
- Curriculo 1 — 1..* Disciplina (aggregation)
- Curriculo 1 — 1 PeriodoMatricula
- Aluno 1 — 0..6 Matricula (max 4 OBRIGATORIA + 2 OPTATIVA)
- Disciplina 1 — 0..60 Matricula
- Matricula * — 1 PeriodoMatricula
- Aluno 1 — 0..* NotificacaoCobranca; NotificacaoCobranca references the Matriculas of the semester
