import { useAuth } from '../../auth.jsx'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { Avatar, CabecalhoPagina, Selo } from '../../components/ui/Basicos.jsx'
import Foto, { LegendaFoto } from '../../components/ui/Foto.jsx'
import { LIMITES, ROTULO_PERFIL } from '../../util'
import { t } from '../../i18n/index.jsx'

/** Perfil somente leitura: a API não oferece edição de dados pessoais. */
export default function Perfil() {
  const { usuario } = useAuth()
  const aluno = useAluno()
  const professor = useProfessor()
  const secretaria = useSecretaria()

  const linhas = [[t('Perfil de acesso'), ROTULO_PERFIL[usuario.perfil] ?? usuario.perfil], [t('Instituição'), 'Horizon University, Belo Horizonte, Brazil']]
  let orientacao = ''

  if (usuario.perfil === 'ALUNO' && aluno && !aluno.carregando) {
    linhas.push([t('Período de matrículas'), aluno.periodo ? t('{semestre}, aberto', { semestre: aluno.periodo.semestre }) : t('Nenhum aberto no momento')])
    linhas.push([t('Matrículas ativas'), t('{n} de {total} vagas', { n: aluno.minhas.length, total: LIMITES.OBRIGATORIA + LIMITES.OPTATIVA })])
    orientacao = t('Para corrigir nome, curso ou senha, procure a secretaria.')
  }
  if (usuario.perfil === 'PROFESSOR' && professor && !professor.carregando) {
    linhas.push([t('Disciplinas'), String(professor.disciplinas.length)])
    linhas.push([t('Alunos matriculados'), String(professor.totalAlunos)])
    orientacao = t('Para corrigir seus dados ou alterar a senha, procure a secretaria.')
  }
  if (usuario.perfil === 'SECRETARIA' && secretaria && !secretaria.carregando) {
    linhas.push([t('Alunos cadastrados'), String(secretaria.alunos.length)])
    linhas.push([t('Professores cadastrados'), String(secretaria.professores.length)])
    orientacao = t('Dados de alunos e professores são editados nas páginas de gestão.')
  }

  return (
    <>
      <CabecalhoPagina titulo={t('Meu perfil')} />
      <div className="perfil">
        <section className="perfil__dados">
          <div className="perfil__identidade">
            <Avatar nome={t(usuario.nome)} tamanho="lg" />
            <div>
              <h2>{t(usuario.nome)}</h2>
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
