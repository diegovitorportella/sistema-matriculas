import GestaoPage from '../../components/GestaoPage.jsx'
import { Avatar, Selo } from '../../components/ui/Basicos.jsx'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { fotoDaDisciplina } from '../../data/areas.js'
import { alunos, cursos, disciplinas, professores } from '../../services'
import { ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA } from '../../util'

const pessoa = (i) => (
  <div className="tabela__pessoa">
    <Avatar nome={i.nome} />
    <div>
      <strong>{i.nome}</strong>
      <small>{i.login}</small>
    </div>
  </div>
)

export function Alunos() {
  return (
    <GestaoPage
      titulo="Alunos"
      descricao="Cadastro de alunos, com curso e acesso ao portal."
      singular="aluno"
      chave="alunos"
      servico={alunos}
      buscaCampos={['nome', 'matricula', 'login', 'cursoNome']}
      filtros={[{ rotulo: 'Curso', valor: (a) => a.cursoNome || 'Sem curso' }]}
      colunas={[
        { rotulo: 'Aluno', render: pessoa },
        { rotulo: 'Matrícula', render: (a) => a.matricula },
        { rotulo: 'Curso', render: (a) => a.cursoNome || 'Sem curso' },
      ]}
      campos={[
        { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true },
        { nome: 'matricula', rotulo: 'Número de matrícula', obrigatorio: true },
        { nome: 'login', rotulo: 'Usuário de acesso', obrigatorio: true },
        { nome: 'senha', rotulo: 'Senha', tipo: 'password', senha: true },
        { nome: 'cursoId', rotulo: 'Curso', tipo: 'select', opcoes: { chave: 'cursos', rotulo: 'nome' } },
      ]}
    />
  )
}

export function Professores() {
  const { disciplinas: todas } = useSecretaria()
  return (
    <GestaoPage
      titulo="Professores"
      descricao="Cadastro de professores e acesso ao portal."
      singular="professor"
      chave="professores"
      servico={professores}
      buscaCampos={['nome', 'login']}
      colunas={[
        { rotulo: 'Professor', render: pessoa },
        {
          rotulo: 'Disciplinas',
          render: (p) => {
            const n = todas.filter((d) => d.professorId === p.id).length
            return n === 0 ? 'Nenhuma' : n
          },
        },
      ]}
      campos={[
        { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true },
        { nome: 'login', rotulo: 'Usuário de acesso', obrigatorio: true },
        { nome: 'senha', rotulo: 'Senha', tipo: 'password', senha: true },
      ]}
    />
  )
}

export function Disciplinas() {
  return (
    <GestaoPage
      titulo="Disciplinas"
      descricao="Cada disciplina precisa de 3 alunos para ser confirmada e aceita até 60."
      singular="disciplina"
      genero="a"
      chave="disciplinas"
      servico={disciplinas}
      rotuloItem={(d) => `${d.codigo} ${d.nome}`}
      buscaCampos={['codigo', 'nome', 'professorNome']}
      filtros={[
        { rotulo: 'Situação', valor: (d) => ROTULO_STATUS_DISCIPLINA[d.status] },
        { rotulo: 'Professor', valor: (d) => d.professorNome || 'Sem professor' },
      ]}
      colunas={[
        {
          rotulo: 'Disciplina',
          render: (d) => (
            <div className="tabela__pessoa">
              <img className="tabela__miniatura" alt="" src={`/fotos/${fotoDaDisciplina(d)}.jpg`} loading="lazy" />
              <div>
                <strong>{d.codigo}</strong>
                <small>{d.nome}</small>
              </div>
            </div>
          ),
        },
        { rotulo: 'Professor', render: (d) => d.professorNome || <Selo tom="ambar">Sem professor</Selo> },
        { rotulo: 'Créditos', render: (d) => d.creditos },
        { rotulo: 'Situação', render: (d) => <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo> },
      ]}
      campos={[
        { nome: 'codigo', rotulo: 'Código', obrigatorio: true },
        { nome: 'nome', rotulo: 'Nome da disciplina', obrigatorio: true },
        { nome: 'creditos', rotulo: 'Créditos', tipo: 'number', obrigatorio: true, min: 1 },
        { nome: 'professorId', rotulo: 'Professor', tipo: 'select', opcoes: { chave: 'professores', rotulo: 'nome' } },
        { nome: 'cursoId', rotulo: 'Curso', tipo: 'select', soCriacao: true, opcoes: { chave: 'cursos', rotulo: 'nome' } },
      ]}
    />
  )
}

export function Cursos() {
  const { alunos: todos } = useSecretaria()
  return (
    <GestaoPage
      titulo="Cursos"
      descricao="Cursos da universidade e o total de créditos de cada um."
      singular="curso"
      chave="cursos"
      servico={cursos}
      buscaCampos={['nome']}
      colunas={[
        { rotulo: 'Curso', render: (c) => <strong>{c.nome}</strong> },
        { rotulo: 'Créditos', render: (c) => c.creditos },
        { rotulo: 'Alunos', render: (c) => todos.filter((a) => a.cursoId === c.id).length },
      ]}
      campos={[
        { nome: 'nome', rotulo: 'Nome do curso', obrigatorio: true },
        { nome: 'creditos', rotulo: 'Total de créditos', tipo: 'number', obrigatorio: true, min: 1 },
      ]}
    />
  )
}
