import { Link, useSearchParams } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { Carga, CabecalhoPagina, EsqueletoCartas, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import Foto from '../../components/ui/Foto.jsx'
import Icone from '../../components/ui/Icone.jsx'
import { useToast } from '../../toast.jsx'
import { LIMITES, ROTULO_TIPO, contem, formatarData, plural } from '../../util'

export default function Catalogo() {
  const notificar = useToast()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const { carregando, erro, recarregar, periodo, ofertadas, plano, situacao, adicionar, remover, usados } = useAluno()

  const filtradas = ofertadas.filter((d) => contem(d, q, ['codigo', 'nome', 'professorNome']))

  function escolher(d, tipo) {
    const problema = adicionar(d.id, tipo)
    if (problema) notificar(problema, 'erro')
    else notificar(`${d.codigo} entrou no plano como ${ROTULO_TIPO[tipo].toLowerCase()}. Falta confirmar.`)
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Catálogo de disciplinas"
        descricao={
          periodo
            ? `Disciplinas do currículo de ${periodo.semestre}. Escolha como cada uma entra no seu plano; a matrícula só vale depois da confirmação.`
            : 'O catálogo fica disponível durante o período de matrículas.'
        }
        acoes={
          plano.length > 0 && (
            <Link to="/matricula" className="btn btn--primario">
              Revisar plano ({plano.length})
            </Link>
          )
        }
      />

      <Carga carregando={carregando} erro={erro} onTentar={recarregar} esqueleto={<EsqueletoCartas />}>
        {!periodo ? (
          <Vazio icone="calendario" titulo="Fora do período de matrículas" texto="Quando a secretaria abrir o período, as disciplinas aparecerão aqui." />
        ) : (
          <>
            <div className="barra-ferramentas">
              <div className="barra-ferramentas__busca">
                <Icone nome="busca" tamanho={18} className="busca__icone" />
                <label className="so-leitor" htmlFor="filtro-catalogo">
                  Filtrar disciplinas
                </label>
                <input
                  id="filtro-catalogo"
                  type="search"
                  placeholder="Filtrar por nome, código ou professor"
                  value={q}
                  onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
                />
              </div>
              <p className="barra-ferramentas__resumo" aria-live="polite">
                {plural(filtradas.length, 'disciplina', 'disciplinas')}. Prazo final: {formatarData(periodo.fim)}.
              </p>
            </div>

            {filtradas.length === 0 ? (
              <Vazio
                icone="busca"
                titulo="Nenhuma disciplina encontrada"
                texto={q ? `Nada corresponde a “${q}”.` : 'O currículo deste semestre ainda não tem disciplinas.'}
                acao={
                  q && (
                    <button type="button" className="btn btn--secundario" onClick={() => setParams({}, { replace: true })}>
                      Limpar filtro
                    </button>
                  )
                }
              />
            ) : (
              <ul className="grade-cartas">
                {filtradas.map((d) => {
                  const estado = situacao(d.id)
                  const noPlano = plano.find((p) => p.disciplinaId === d.id)
                  return (
                    <li key={d.id}>
                      <article className="carta">
                        <div className="carta__foto">
                          <Foto id={fotoDaDisciplina(d)} posicao="center 30%" />
                        </div>
                        <div className="carta__corpo">
                          <div className="carta__topo">
                            <p className="carta__codigo">{d.codigo}</p>
                            <Selo>{d.creditos} créditos</Selo>
                          </div>
                          <h3 className="carta__titulo">{d.nome}</h3>
                          <p className="carta__meta">{d.professorNome || 'Professor a definir'}</p>

                          <div className="carta__acoes">
                            {estado === 'matriculado' && (
                              <Selo tom="verde" icone="check">
                                Matriculado
                              </Selo>
                            )}
                            {estado === 'no-plano' && (
                              <>
                                <Selo tom="ouro">No plano como {ROTULO_TIPO[noPlano.tipo].toLowerCase()}</Selo>
                                <button type="button" className="btn-texto" onClick={() => remover(d.id)}>
                                  Remover
                                </button>
                              </>
                            )}
                            {estado === 'livre' && (
                              <>
                                {['OBRIGATORIA', 'OPTATIVA'].map((tipo) => {
                                  const cheio = usados(tipo) >= LIMITES[tipo]
                                  return (
                                    <button
                                      key={tipo}
                                      type="button"
                                      className={`btn btn--sm ${tipo === 'OBRIGATORIA' ? 'btn--secundario' : 'btn--ouro'}`}
                                      disabled={cheio}
                                      title={cheio ? 'Todas as vagas deste tipo já estão ocupadas' : undefined}
                                      onClick={() => escolher(d, tipo)}
                                    >
                                      {ROTULO_TIPO[tipo]}
                                    </button>
                                  )
                                })}
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </Carga>
    </>
  )
}
