import { Link } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { Carga, Estatisticas, Progresso, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Rosca } from '../../components/ui/Graficos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import { LIMITES, ROTULO_TIPO, diasAte, formatarData, plural, primeiroNome, progressoPeriodo } from '../../util'
import { t } from '../../i18n/index.jsx'

export default function AlunoInicio() {
  const { usuario } = useAuth()
  const { carregando, erro, recarregar, periodo, minhas, ofertadas, plano } = useAluno()

  const primeira = minhas.filter((m) => m.tipo === 'OBRIGATORIA').length
  const alternativas = minhas.filter((m) => m.tipo === 'OPTATIVA').length
  const total = LIMITES.OBRIGATORIA + LIMITES.OPTATIVA
  const creditos = minhas.reduce((s, m) => s + (ofertadas.find((d) => d.id === m.disciplinaId)?.creditos ?? 0), 0)
  const dias = periodo ? diasAte(periodo.fim) : null

  return (
    <>
      <Hero
        foto="campus"
        posicao="center 42%"
        titulo={t('Boas-vindas, {nome}', { nome: primeiroNome(t(usuario.nome)) })}
        acoes={
          periodo && (
            <>
              <Link to="/catalogo" className="btn btn--ouro">
               {t('Explorar o catálogo')}
              </Link>
              <Link to="/matricula" className="btn btn--claro">
               {t('Montar plano de matrícula')}
              </Link>
            </>
          )
        }
      >
        {periodo
          ? t('As matrículas de {semestre} estão abertas até {data}.', { semestre: periodo.semestre, data: formatarData(periodo.fim) })
          : t('Não há período de matrículas aberto no momento.')}
      </Hero>

      <div className="pagina-corpo">
        <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
          {!periodo ? (
            <Vazio
              icone="calendario"
              titulo={t('Matrículas fechadas')}
              texto={t('Quando a secretaria abrir o próximo período, você poderá montar seu plano aqui.')}
            />
          ) : (
            <>
              <Estatisticas
                itens={[
                  { valor: `${primeira}/${LIMITES.OBRIGATORIA}`, rotulo: t('Primeira opção'), detalhe: t('disciplinas matriculadas') },
                  { valor: `${alternativas}/${LIMITES.OPTATIVA}`, rotulo: t('Alternativas'), detalhe: t('disciplinas matriculadas') },
                  { valor: creditos, rotulo: t('Créditos'), detalhe: t('nas disciplinas matriculadas') },
                  {
                    valor: dias,
                    rotulo: dias === 1 ? t('Dia restante') : t('Dias restantes'),
                    detalhe: t('até {data}', { data: formatarData(periodo.fim) }),
                  },
                ]}
              />

              <div className="duas-colunas">
                <Secao id="plano" titulo={t('Seu plano')} descricao={t('As 6 vagas do semestre: 4 de primeira opção e 2 alternativas.')}>
                  <Rosca
                    centro={`${minhas.length}`}
                    rotuloCentro={t('de {total} vagas', { total })}
                    dados={[
                      { rotulo: t('Primeira opção'), valor: primeira, cor: 'var(--bordo-600)' },
                      { rotulo: t('Alternativas'), valor: alternativas, cor: 'var(--ouro-500)' },
                      { rotulo: t('Vagas livres'), valor: total - minhas.length, cor: 'var(--creme-300)' },
                    ]}
                  />
                  {plano.length > 0 && (
                    <p className="nota nota--ambar">
                      {plural(plano.length, 'disciplina aguarda', 'disciplinas aguardam')} {t('confirmação no')}{' '}
                      <Link to="/matricula">{t('plano de matrícula')}</Link>.
                    </p>
                  )}
                </Secao>

                <Secao id="prazo" titulo={t('Prazo do semestre')} descricao={t('Período de matrículas de {semestre}.', { semestre: periodo.semestre })}>
                  <Progresso valor={Math.round(progressoPeriodo(periodo.inicio, periodo.fim) * 100)} max={100} rotulo={t('Progresso do período de matrículas')} tom="ouro" />
                  <div className="linha-tempo">
                    <span>{formatarData(periodo.inicio)}</span>
                    <span>{formatarData(periodo.fim)}</span>
                  </div>
                  <ul className="regras">
                    <li>{t('Disciplinas com menos de 3 alunos ao fim do período são canceladas.')}</li>
                    <li>{t('Cada disciplina aceita até 60 alunos; ao lotar, as inscrições se encerram.')}</li>
                    <li>{t('Você pode cancelar matrículas até o fim do período.')}</li>
                  </ul>
                </Secao>
              </div>

              <Secao
                id="matriculas"
                titulo={t('Matrículas atuais')}
                acoes={
                  <Link to="/minhas-matriculas" className="btn btn--secundario btn--sm">
                   {t('Ver todas')}
                  </Link>
                }
              >
                {minhas.length === 0 ? (
                  <Vazio
                    titulo={t('Você ainda não se matriculou')}
                    texto={t('Escolha disciplinas no catálogo e confirme o plano.')}
                    acao={
                      <Link to="/catalogo" className="btn btn--primario">
                       {t('Ir para o catálogo')}
                      </Link>
                    }
                  />
                ) : (
                  <ul className="lista-simples">
                    {minhas.map((m) => (
                      <li key={m.id}>
                        <span>
                          <strong>{m.disciplinaCodigo}</strong> {t(m.disciplinaNome)}
                        </span>
                        <Selo tom={m.tipo === 'OBRIGATORIA' ? 'bordo' : 'ouro'}>{ROTULO_TIPO[m.tipo]}</Selo>
                      </li>
                    ))}
                  </ul>
                )}
              </Secao>
            </>
          )}
        </Carga>
      </div>
    </>
  )
}
