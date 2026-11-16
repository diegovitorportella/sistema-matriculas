import { useAuth } from '../../auth.jsx'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { Avatar, CabecalhoPagina, Selo } from '../../components/ui/Basicos.jsx'
import Foto, { LegendaFoto } from '../../components/ui/Foto.jsx'
import { LIMITES, ROTULO_PERFIL } from '../../util'

/** Perfil somente leitura: a API não oferece edição de dados pessoais. */
export default function Perfil() {
  const { usuario } = useAuth()
  const aluno = useAluno()
  const professor = useProfessor()
  const secretaria = useSecretaria()

  const linhas = [['Perfil de acesso', ROTULO_PERFIL[usuario.perfil] ?? usuario.perfil], ['Instituição', 'Horizon University, Belo Horizonte, Brazil']]
  let orientacao = ''

  if (usuario.perfil === 'ALUNO' && aluno && !aluno.carregando) {
    linhas.push(['Período de matrículas', aluno.periodo ? `${aluno.periodo.semestre}, aberto` : 'Nenhum aberto no momento'])
    linhas.push(['Matrículas ativas', `${aluno.minhas.length} de ${LIMITES.OBRIGATORIA + LIMITES.OPTATIVA} vagas`])
    orientacao = 'Para corrigir nome, curso ou senha, procure a secretaria.'
  }
  if (usuario.perfil === 'PROFESSOR' && professor && !professor.carregando) {
    linhas.push(['Disciplinas', String(professor.disciplinas.length)])
    linhas.push(['Alunos matriculados', String(professor.totalAlunos)])
    orientacao = 'Para corrigir seus dados ou alterar a senha, procure a secretaria.'
  }
  if (usuario.perfil === 'SECRETARIA' && secretaria && !secretaria.carregando) {
    linhas.push(['Alunos cadastrados', String(secretaria.alunos.length)])
    linhas.push(['Professores cadastrados', String(secretaria.professores.length)])
    orientacao = 'Dados de alunos e professores são editados nas páginas de gestão.'
  }

  return (
    <>
      <CabecalhoPagina titulo="Meu perfil" />
      <div className="perfil">
        <section className="perfil__dados">
          <div className="perfil__identidade">
            <Avatar nome={usuario.nome} tamanho="lg" />
            <div>
              <h2>{usuario.nome}</h2>
              <Selo tom="bordo">{ROTULO_PERFIL[usuario.perfil] ?? usuario.perfil}</Selo>
            </div>
          </div>
          <dl className="lista-definicoes">
            {linhas.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {orientacao && <p className="nota">{orientacao}</p>}
        </section>
        <figure className="perfil__foto">
          <Foto id="biblioteca" posicao="center 40%" />
          <LegendaFoto id="biblioteca" className="perfil__legenda" />
        </figure>
      </div>
    </>
  )
}
