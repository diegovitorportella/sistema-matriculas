import { Link } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import { useShellDados } from '../../contexts/ShellDados.js'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { Carga, Estatisticas, Progresso, Secao, Vazio } from '../../components/ui/Basicos.jsx'
import { Rosca } from '../../components/ui/Graficos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import Icone from '../../components/ui/Icone.jsx'
import { diasAte, formatarData, plural, primeiroNome, progressoPeriodo } from '../../util'
import { t } from '../../i18n/index.jsx'

const ATALHOS = [
  { to: '/semestre', icone: 'calendario', titulo: 'Montar o currículo do semestre', texto: 'Escolha as disciplinas ofertadas.' },
  { to: '/alunos', icone: 'usuarios', titulo: 'Cadastrar alunos', texto: 'Dados de acesso e curso.' },
  { to: '/disciplinas', icone: 'livro', titulo: 'Gerir disciplinas', texto: 'Professores e créditos.' },
  { to: '/relatorios', icone: 'grafico', titulo: 'Ver relatórios', texto: 'Situação das disciplinas e das turmas.' },
]

export default function SecretariaInicio() {
  const { usuario } = useAuth()
  const s = useSecretaria()
  const { avisos } = useShellDados()
  const { periodoAberto: p } = s

  const porStatus = (st) => s.disciplinas.filter((d) => d.status === st).length

  return (
    <>
      <Hero
        foto="secretaria"
        posicao="center 62%"
        tamanho="sm"
        titulo={t('Secretaria acadêmica')}
        acoes={
          <Link to="/semestre" className="btn btn--ouro">
            {t('Currículo semestral')}
          </Link>
        }
      >
        {t('Olá, {nome}.', { nome: primeiroNome(t(usuario.nome)) })} {t('Acompanhe cadastros, períodos de matrícula e a situação das disciplinas.')}
      </Hero>

      <div className="pagina-corpo">
        <Carga carregando={s.carregando} erro={s.erro} onTentar={s.recarregar}>
          <Estatisticas
            itens={[
              { valor: s.alunos.length, rotulo: t('Alunos') },
              { valor: s.professores.length, rotulo: t('Professores') },
              { valor: s.disciplinas.length, rotulo: t('Disciplinas') },
              { valor: s.cursos.length, rotulo: t('Cursos') },
            ]}
          />

          <div className="duas-colunas">
            <Secao id="periodo" titulo={t('Período de matrículas')}>
              {p ? (
                <div className="painel-periodo">
                  <p className="painel-periodo__semestre">{p.semestre}</p>
                  <Progresso valor={Math.round(progressoPeriodo(p.inicio, p.fim) * 100)} max={100} rotulo={t('Progresso do período')} tom="ouro" />
                  <div className="linha-tempo">
                    <span>{formatarData(p.inicio)}</span>
                    <span>{formatarData(p.fim)}</span>
                  </div>
                  <p className="nota">
                    {t('Termina em {prazo}.', { prazo: plural(diasAte(p.fim), 'dia', 'dias') })} {t('Ao encerrar, disciplinas com menos de 3 alunos são canceladas.')}
                  </p>
                  <Link to="/matriculas" className="btn btn--primario btn--sm">
                    {t('Gerenciar período')}
                  </Link>
                </div>
              ) : (
                <Vazio
                  icone="calendario"
                  titulo={t('Nenhum período aberto')}
                  texto={t('Gere o currículo do semestre e abra o período para os alunos se matricularem.')}
                  acao={
                    <Link to="/semestre" className="btn btn--primario">
                      {t('Abrir período')}
                    </Link>
                  }
                />
              )}
            </Secao>

            <Secao id="situacao" titulo={t('Situação das disciplinas')}>
              {s.disciplinas.length === 0 ? (
                <Vazio titulo={t('Sem disciplinas')} texto={t('Cadastre disciplinas para acompanhar a situação.')} />
              ) : (
                <Rosca
                  centro={s.disciplinas.length}
                  rotuloCentro={t('disciplinas')}
                  dados={[
                    { rotulo: t('Inscrições abertas'), valor: porStatus('ABERTA'), cor: 'var(--ouro-500)' },
                    { rotulo: t('Confirmadas'), valor: porStatus('ATIVA'), cor: 'var(--verde-600)' },
                    { rotulo: t('Canceladas'), valor: porStatus('CANCELADA'), cor: 'var(--erro-700)' },
                  ]}
                />
              )}
            </Secao>
          </div>

          <div className="duas-colunas">
            <Secao id="avisos" titulo={t('Pontos de atenção')}>
              {avisos.length === 0 ? (
                <p className="secao__texto">{t('Nenhum ponto de atenção no momento.')}</p>
              ) : (
                <ul className="lista-simples">
                  {avisos.map((a) => (
                    <li key={a.id}>
                      <span>
                        <strong>{a.titulo}</strong>
                        <small className="bloco">{a.texto}</small>
                      </span>
                      {a.to && (
                        <Link to={a.to} className="btn-texto">
                          {t('Abrir')}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Secao>

            <Secao id="atalhos" titulo={t('Atalhos')}>
              <ul className="atalhos">
                {ATALHOS.map((a) => (
                  <li key={a.to}>
                    <Link to={a.to} className="atalho">
                      <Icone nome={a.icone} tamanho={22} />
                      <span>
                        <strong>{t(a.titulo)}</strong>
                        <small>{t(a.texto)}</small>
                      </span>
                      <Icone nome="seta" tamanho={18} className="atalho__seta" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Secao>
          </div>
        </Carga>
      </div>
    </>
  )
}
