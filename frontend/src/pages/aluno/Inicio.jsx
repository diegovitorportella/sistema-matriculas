import { Link } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { Carga, Estatisticas, Progresso, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Rosca } from '../../components/ui/Graficos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import { LIMITES, ROTULO_TIPO, diasAte, formatarData, plural, primeiroNome, progressoPeriodo } from '../../util'

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
        titulo={`Boas-vindas, ${primeiroNome(usuario.nome)}`}
        acoes={
          periodo && (
            <>
              <Link to="/catalogo" className="btn btn--ouro">
                Explorar o catálogo
              </Link>
              <Link to="/matricula" className="btn btn--claro">
                Montar plano de matrícula
              </Link>
            </>
          )
        }
      >
        {periodo
          ? `As matrículas de ${periodo.semestre} estão abertas até ${formatarData(periodo.fim)}.`
          : 'Não há período de matrículas aberto no momento.'}
      </Hero>

      <div className="pagina-corpo">
        <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
          {!periodo ? (
            <Vazio
              icone="calendario"
              titulo="Matrículas fechadas"
              texto="Quando a secretaria abrir o próximo período, você poderá montar seu plano aqui."
            />
          ) : (
            <>
              <Estatisticas
                itens={[
                  { valor: `${primeira}/${LIMITES.OBRIGATORIA}`, rotulo: 'Primeira opção', detalhe: 'disciplinas matriculadas' },
                  { valor: `${alternativas}/${LIMITES.OPTATIVA}`, rotulo: 'Alternativas', detalhe: 'disciplinas matriculadas' },
                  { valor: creditos, rotulo: 'Créditos', detalhe: 'nas disciplinas matriculadas' },
                  {
                    valor: dias,
                    rotulo: dias === 1 ? 'Dia restante' : 'Dias restantes',
                    detalhe: `até ${formatarData(periodo.fim)}`,
                  },
                ]}
              />

              <div className="duas-colunas">
                <Secao id="plano" titulo="Seu plano" descricao="As 6 vagas do semestre: 4 de primeira opção e 2 alternativas.">
                  <Rosca
                    centro={`${minhas.length}`}
                    rotuloCentro={`de ${total} vagas`}
                    dados={[
                      { rotulo: 'Primeira opção', valor: primeira, cor: 'var(--bordo-600)' },
                      { rotulo: 'Alternativas', valor: alternativas, cor: 'var(--ouro-500)' },
                      { rotulo: 'Vagas livres', valor: total - minhas.length, cor: 'var(--creme-300)' },
                    ]}
                  />
                  {plano.length > 0 && (
                    <p className="nota nota--ambar">
                      {plural(plano.length, 'disciplina aguarda', 'disciplinas aguardam')} confirmação no{' '}
                      <Link to="/matricula">plano de matrícula</Link>.
                    </p>
                  )}
                </Secao>

                <Secao id="prazo" titulo="Prazo do semestre" descricao={`Período de matrículas de ${periodo.semestre}.`}>
                  <Progresso valor={Math.round(progressoPeriodo(periodo.inicio, periodo.fim) * 100)} max={100} rotulo="Progresso do período de matrículas" tom="ouro" />
                  <div className="linha-tempo">
                    <span>{formatarData(periodo.inicio)}</span>
                    <span>{formatarData(periodo.fim)}</span>
                  </div>
                  <ul className="regras">
                    <li>Disciplinas com menos de 3 alunos ao fim do período são canceladas.</li>
                    <li>Cada disciplina aceita até 60 alunos; ao lotar, as inscrições se encerram.</li>
                    <li>Você pode cancelar matrículas até o fim do período.</li>
                  </ul>
                </Secao>
              </div>

              <Secao
                id="matriculas"
                titulo="Matrículas atuais"
                acoes={
                  <Link to="/minhas-matriculas" className="btn btn--secundario btn--sm">
                    Ver todas
                  </Link>
                }
              >
                {minhas.length === 0 ? (
                  <Vazio
                    titulo="Você ainda não se matriculou"
                    texto="Escolha disciplinas no catálogo e confirme o plano."
                    acao={
                      <Link to="/catalogo" className="btn btn--primario">
                        Ir para o catálogo
                      </Link>
                    }
                  />
                ) : (
                  <ul className="lista-simples">
                    {minhas.map((m) => (
                      <li key={m.id}>
                        <span>
                          <strong>{m.disciplinaCodigo}</strong> {m.disciplinaNome}
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
