import GestaoPage from '../../components/GestaoPage.jsx'
import { Avatar, Selo } from '../../components/ui/Basicos.jsx'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { fotoDaDisciplina } from '../../data/areas.js'
import { alunos, cursos, disciplinas, professores } from '../../services'
import { ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA } from '../../util'
import { t } from '../../i18n/index.jsx'

const pessoa = (i) => (
  <div className="tabela__pessoa">
    <Avatar nome={t(i.nome)} />
    <div>
      <strong>{t(i.nome)}</strong>
      <small>{i.login}</small>
    </div>
  </div>
)

export function Alunos() {
  return (
    <GestaoPage
      titulo={t('Alunos')}
      descricao={t('Cadastro de alunos, com curso e acesso ao portal.')}
      singular="aluno"
      chave="alunos"
      servico={alunos}
      buscaCampos={['nome', 'matricula', 'login', 'cursoNome']}
      filtros={[{ rotulo: t('Curso'), valor: (a) => t(a.cursoNome) || t('Sem curso') }]}
      colunas={[
        { rotulo: t('Aluno'), render: pessoa },
        { rotulo: t('Matrícula'), render: (a) => a.matricula },
        { rotulo: t('Curso'), render: (a) => t(a.cursoNome) || t('Sem curso') },
      ]}
      campos={[
        { nome: 'nome', rotulo: t('Nome completo'), obrigatorio: true },
        { nome: 'matricula', rotulo: t('Número de matrícula'), obrigatorio: true },
        { nome: 'login', rotulo: t('Usuário de acesso'), obrigatorio: true },
        { nome: 'senha', rotulo: t('Senha'), tipo: 'password', senha: true },
        { nome: 'cursoId', rotulo: t('Curso'), tipo: 'select', opcoes: { chave: 'cursos', rotulo: 'nome' } },
      ]}
    />
  )
}

export function Professores() {
  const { disciplinas: todas } = useSecretaria()
  return (
    <GestaoPage
      titulo={t('Professores')}
      descricao={t('Cadastro de professores e acesso ao portal.')}
      singular="professor"
      chave="professores"
      servico={professores}
      buscaCampos={['nome', 'login']}
      colunas={[
        { rotulo: t('Professor'), render: pessoa },
        {
          rotulo: t('Disciplinas'),
          render: (p) => {
            const n = todas.filter((d) => d.professorId === p.id).length
            return n === 0 ? 'Nenhuma' : n
          },
        },
      ]}
      campos={[
        { nome: 'nome', rotulo: t('Nome completo'), obrigatorio: true },
        { nome: 'login', rotulo: t('Usuário de acesso'), obrigatorio: true },
        { nome: 'senha', rotulo: t('Senha'), tipo: 'password', senha: true },
      ]}
    />
  )
}

export function Disciplinas() {
  return (
    <GestaoPage
      titulo={t('Disciplinas')}
      descricao={t('Cada disciplina precisa de 3 alunos para ser confirmada e aceita até 60.')}
      singular="disciplina"
      genero="a"
      chave="disciplinas"
      servico={disciplinas}
      rotuloItem={(d) => `${d.codigo} ${t(d.nome)}`}
      buscaCampos={['codigo', 'nome', 'professorNome']}
      filtros={[
        { rotulo: t('Situação'), valor: (d) => ROTULO_STATUS_DISCIPLINA[d.status] },
        { rotulo: t('Professor'), valor: (d) => d.professorNome || t('Sem professor') },
      ]}
      colunas={[
        {
          rotulo: t('Disciplina'),
          render: (d) => (
            <div className="tabela__pessoa">
              <img className="tabela__miniatura" alt="" src={`/fotos/${fotoDaDisciplina(d)}.jpg`} loading="lazy" />
              <div>
                <strong>{d.codigo}</strong>
                <small>{t(d.nome)}</small>
              </div>
            </div>
          ),
        },
        { rotulo: t('Professor'), render: (d) => d.professorNome || <Selo tom="ambar">{t('Sem professor')}</Selo> },
        { rotulo: t('Créditos'), render: (d) => d.creditos },
        { rotulo: t('Situação'), render: (d) => <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo> },
      ]}
      campos={[
        { nome: 'codigo', rotulo: t('Código'), obrigatorio: true },
        { nome: 'nome', rotulo: t('Nome da disciplina'), obrigatorio: true },
        { nome: 'creditos', rotulo: t('Créditos'), tipo: 'number', obrigatorio: true, min: 1 },
        { nome: 'professorId', rotulo: t('Professor'), tipo: 'select', opcoes: { chave: 'professores', rotulo: 'nome' } },
        { nome: 'cursoId', rotulo: t('Curso'), tipo: 'select', soCriacao: true, opcoes: { chave: 'cursos', rotulo: 'nome' } },
      ]}
    />
  )
}

export function Cursos() {
  const { alunos: todos } = useSecretaria()
  return (
    <GestaoPage
      titulo={t('Cursos')}
      descricao={t('Cursos da universidade e o total de créditos de cada um.')}
      singular="curso"
      chave="cursos"
      servico={cursos}
      buscaCampos={['nome']}
      colunas={[
        { rotulo: t('Curso'), render: (c) => <strong>{t(c.nome)}</strong> },
        { rotulo: t('Créditos'), render: (c) => c.creditos },
        { rotulo: t('Alunos'), render: (c) => todos.filter((a) => a.cursoId === c.id).length },
      ]}
      campos={[
        { nome: 'nome', rotulo: t('Nome do curso'), obrigatorio: true },
        { nome: 'creditos', rotulo: t('Total de créditos'), tipo: 'number', obrigatorio: true, min: 1 },
      ]}
    />
  )
}
