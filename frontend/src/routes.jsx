import { AlunoProvider } from './contexts/AlunoDados.jsx'
import { ProfessorProvider } from './contexts/ProfessorDados.jsx'
import { SecretariaProvider } from './contexts/SecretariaDados.jsx'
import Perfil from './pages/comum/Perfil.jsx'
import AlunoInicio from './pages/aluno/Inicio.jsx'
import Catalogo from './pages/aluno/Catalogo.jsx'
import MinhasMatriculas from './pages/aluno/MinhasMatriculas.jsx'
import Plano from './pages/aluno/Plano.jsx'
import ProfessorInicio from './pages/professor/Inicio.jsx'
import TurmaDetalhe from './pages/professor/TurmaDetalhe.jsx'
import Turmas from './pages/professor/Turmas.jsx'
import { Alunos, Cursos, Disciplinas, Professores } from './pages/secretaria/Cadastros.jsx'
import SecretariaInicio from './pages/secretaria/Inicio.jsx'
import Periodos from './pages/secretaria/Periodos.jsx'
import Relatorios from './pages/secretaria/Relatorios.jsx'
import Semestre from './pages/secretaria/Semestre.jsx'

/**
 * Rotas de cada perfil. `nav: true` aparece na barra lateral; `pai` define a trilha
 * de migalhas. As rotas anteriores ao redesign foram preservadas:
 * /matricula, /turmas, /cursos, /disciplinas, /professores, /alunos e /semestre.
 */
const ALUNO = [
  { path: '/inicio', titulo: 'Início', icone: 'inicio', nav: true, elemento: <AlunoInicio /> },
  { path: '/catalogo', titulo: 'Catálogo de disciplinas', rotulo: 'Catálogo', icone: 'livro', nav: true, elemento: <Catalogo /> },
  { path: '/matricula', titulo: 'Plano de matrícula', icone: 'prancheta', nav: true, elemento: <Plano /> },
  { path: '/minhas-matriculas', titulo: 'Minhas matrículas', icone: 'lista', nav: true, elemento: <MinhasMatriculas /> },
  { path: '/perfil', titulo: 'Meu perfil', elemento: <Perfil /> },
]

const PROFESSOR = [
  { path: '/inicio', titulo: 'Início', icone: 'inicio', nav: true, elemento: <ProfessorInicio /> },
  { path: '/turmas', titulo: 'Minhas disciplinas', icone: 'livro', nav: true, elemento: <Turmas /> },
  { path: '/turmas/:id', titulo: 'Disciplina', pai: '/turmas', elemento: <TurmaDetalhe /> },
  { path: '/perfil', titulo: 'Meu perfil', elemento: <Perfil /> },
]

const SECRETARIA = [
  { path: '/inicio', titulo: 'Início', icone: 'inicio', nav: true, elemento: <SecretariaInicio /> },
  { path: '/semestre', titulo: 'Currículo semestral', icone: 'calendario', grupo: 'Acadêmico', nav: true, elemento: <Semestre /> },
  { path: '/matriculas', titulo: 'Períodos de matrícula', icone: 'prancheta', grupo: 'Acadêmico', nav: true, elemento: <Periodos /> },
  { path: '/disciplinas', titulo: 'Disciplinas', icone: 'livro', grupo: 'Acadêmico', nav: true, elemento: <Disciplinas /> },
  { path: '/cursos', titulo: 'Cursos', icone: 'chapeu', grupo: 'Acadêmico', nav: true, elemento: <Cursos /> },
  { path: '/alunos', titulo: 'Alunos', icone: 'usuarios', grupo: 'Pessoas', nav: true, elemento: <Alunos /> },
  { path: '/professores', titulo: 'Professores', icone: 'usuario', grupo: 'Pessoas', nav: true, elemento: <Professores /> },
  { path: '/relatorios', titulo: 'Relatórios', icone: 'grafico', grupo: 'Análise', nav: true, elemento: <Relatorios /> },
  { path: '/perfil', titulo: 'Meu perfil', elemento: <Perfil /> },
]

export const PERFIS = {
  ALUNO: { rotas: ALUNO, Provedor: AlunoProvider },
  PROFESSOR: { rotas: PROFESSOR, Provedor: ProfessorProvider },
  SECRETARIA: { rotas: SECRETARIA, Provedor: SecretariaProvider },
}
