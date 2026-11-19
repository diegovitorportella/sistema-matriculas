import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { Carga, CabecalhoPagina, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import Foto from '../../components/ui/Foto.jsx'
import Icone from '../../components/ui/Icone.jsx'
import Modal, { Confirmar } from '../../components/ui/Modal.jsx'
import { useToast } from '../../toast.jsx'
import { LIMITES, ROTULO_TIPO, formatarData, plural } from '../../util'

const GRUPOS = [
  { tipo: 'OBRIGATORIA', titulo: 'Primeira opção', texto: 'Quatro disciplinas que você pretende cursar.', classe: 'primeira' },
  { tipo: 'OPTATIVA', titulo: 'Alternativas', texto: 'Duas disciplinas de reserva.', classe: 'alternativa' },
]

export default function Plano() {
  const notificar = useToast()
  const aluno = useAluno()
  const { carregando, erro, recarregar, periodo, ofertadas, minhas, plano } = aluno

  const [revisando, setRevisando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [cancelando, setCancelando] = useState(null)
  const [cancelandoOcupado, setCancelandoOcupado] = useState(false)

  const disciplinaDe = (id) => ofertadas.find((d) => d.id === id)
  const creditosPlano = plano.reduce((s, p) => s + (disciplinaDe(p.disciplinaId)?.creditos ?? 0), 0)

  async function confirmar() {
    setEnviando(true)
    try {
      const r = await aluno.confirmar()
      setResultado(r)
      setRevisando(false)
    } catch (e) {
      notificar(e.message, 'erro')
    } finally {
      setEnviando(false)
    }
  }

  async function cancelarMatricula() {
    setCancelandoOcupado(true)
    try {
      await aluno.cancelar(cancelando)
      notificar(`Matrícula em ${cancelando.disciplinaCodigo} cancelada. A vaga foi liberada.`)
      setCancelando(null)
    } catch (e) {
      notificar(e.message, 'erro')
    } finally {
      setCancelandoOcupado(false)
    }
  }

  function trocar(id) {
    const problema = aluno.trocarTipo(id)
    if (problema) notificar(problema, 'erro')
  }

  const aprovados = resultado?.filter((r) => r.ok) ?? []
  const falhas = resultado?.filter((r) => !r.ok) ?? []

  return (
    <>
      <CabecalhoPagina
        titulo="Plano de matrícula"
        descricao={
          periodo
            ? `Semestre ${periodo.semestre}. Monte o plano com 4 disciplinas de primeira opção e 2 alternativas, revise e confirme até ${formatarData(periodo.fim)}.`
            : 'O plano de matrícula fica disponível durante o período de matrículas.'
        }
        acoes={
          periodo && (
            <>
              <Link to="/catalogo" className="btn btn--secundario">
                Adicionar do catálogo
              </Link>
              <button type="button" className="btn btn--primario" disabled={plano.length === 0} onClick={() => setRevisando(true)}>
                Revisar e confirmar
              </button>
            </>
          )
        }
      />

      <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
        {!periodo ? (
          <Vazio icone="calendario" titulo="Fora do período de matrículas" texto="Quando a secretaria abrir o período, você poderá montar seu plano." />
        ) : (
          <>
            {resultado && (
              <section className="confirmacao" aria-live="polite">
                <div className="confirmacao__topo">
                  <Icone nome={falhas.length === 0 ? 'check' : 'alerta'} tamanho={28} />
                  <div>
                    <h2>
                      {falhas.length === 0
                        ? 'Matrícula confirmada'
                        : aprovados.length > 0
                          ? 'Matrícula confirmada em parte'
                          : 'Não foi possível confirmar'}
                    </h2>
                    <p>
                      {plural(aprovados.length, 'disciplina matriculada', 'disciplinas matriculadas')}
                      {falhas.length > 0 && `, ${plural(falhas.length, 'recusada', 'recusadas')} pelo sistema`}.
                      {aprovados.length > 0 && ' O sistema de cobranças foi notificado.'}
                    </p>
                  </div>
                  <button type="button" className="btn-icone" aria-label="Dispensar resultado" onClick={() => setResultado(null)}>
                    <Icone nome="x" />
                  </button>
                </div>
                <ul className="confirmacao__lista">
                  {resultado.map((r) => (
                    <li key={r.disciplina.id}>
                      <span>
                        <strong>{r.disciplina.codigo}</strong> {r.disciplina.nome}
                      </span>
                      {r.ok ? (
                        <Selo tom="verde" icone="check">
                          {ROTULO_TIPO[r.tipo]}
                        </Selo>
                      ) : (
                        <span className="confirmacao__erro">{r.erro}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="confirmacao__acoes">
                  <Link to="/minhas-matriculas" className="btn btn--primario btn--sm">
                    Ver minhas matrículas
                  </Link>
                  {falhas.length > 0 && <span className="campo__ajuda">As recusadas continuam no plano para você ajustar.</span>}
                </div>
              </section>
            )}

            <div className="quadro">
              {GRUPOS.map((g) => {
                const confirmadas = minhas.filter((m) => m.tipo === g.tipo)
                const rascunhos = plano.filter((p) => p.tipo === g.tipo)
                const limite = LIMITES[g.tipo]
                const livres = Math.max(0, limite - confirmadas.length - rascunhos.length)
                return (
                  <section key={g.tipo} className={`grupo grupo--${g.classe}`} aria-label={g.titulo}>
                    <div className="grupo__topo">
                      <h2>{g.titulo}</h2>
                      <span className="grupo__conta">
                        {confirmadas.length + rascunhos.length} de {limite}
                      </span>
                    </div>
                    <p className="grupo__texto">{g.texto}</p>
                    <ul className="vagas">
                      {confirmadas.map((m) => {
                        const d = disciplinaDe(m.disciplinaId) ?? { id: m.disciplinaId, nome: m.disciplinaNome, codigo: m.disciplinaCodigo }
                        return (
                          <li key={m.id} className={`vaga vaga--cheia vaga--${g.classe}`}>
                            <Foto id={fotoDaDisciplina(d)} className="vaga__foto" posicao="center 30%" />
                            <div className="vaga__corpo">
                              <Selo tom="verde" icone="check">
                                Matriculado
                              </Selo>
                              <p className="vaga__codigo">{m.disciplinaCodigo}</p>
                              <p className="vaga__nome">{m.disciplinaNome}</p>
                              <button type="button" className="btn-texto vaga__acao" onClick={() => setCancelando(m)}>
                                Cancelar matrícula
                              </button>
                            </div>
                          </li>
                        )
                      })}
                      {rascunhos.map((p) => {
                        const d = disciplinaDe(p.disciplinaId)
                        if (!d) return null
                        return (
                          <li key={p.disciplinaId} className="vaga vaga--rascunho">
                            <Foto id={fotoDaDisciplina(d)} className="vaga__foto" posicao="center 30%" />
                            <div className="vaga__corpo">
                              <Selo tom="ouro">Aguardando confirmação</Selo>
                              <p className="vaga__codigo">{d.codigo}</p>
                              <p className="vaga__nome">{d.nome}</p>
                              <button type="button" className="btn-texto vaga__acao" onClick={() => aluno.remover(d.id)}>
                                Remover do plano
                              </button>
                            </div>
                          </li>
                        )
                      })}
                      {Array.from({ length: livres }, (_, i) => (
                        <li key={`livre-${i}`} className="vaga vaga--livre">
                          <Link to="/catalogo" className="vaga__livre-link">
                            <Icone nome="mais" />
                            <span>Escolher no catálogo</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>

            <aside className="resumo-plano">
              <p>
                <strong>{plural(plano.length, 'disciplina', 'disciplinas')} aguardando confirmação</strong>
                {plano.length > 0 && `, ${creditosPlano} créditos`}. Depois de confirmada, a matrícula notifica o sistema de cobranças e só pode ser desfeita
                com o cancelamento até {formatarData(periodo.fim)}.
              </p>
            </aside>

            {minhas.length === 0 && plano.length === 0 && (
              <Secao id="comecar" titulo="Por onde começar">
                <p className="secao__texto">
                  Abra o <Link to="/catalogo">catálogo de disciplinas</Link>, escolha as que quer cursar e volte aqui para revisar e confirmar.
                </p>
              </Secao>
            )}
          </>
        )}
      </Carga>

      <Modal
        aberto={revisando}
        onFechar={() => !enviando && setRevisando(false)}
        titulo="Revisar matrícula"
        largura="lg"
        rodape={
          <>
            <button type="button" className="btn btn--secundario" onClick={() => setRevisando(false)} disabled={enviando}>
              Voltar ao plano
            </button>
            <button type="button" className="btn btn--primario" onClick={confirmar} disabled={enviando || plano.length === 0}>
              {enviando ? 'Confirmando…' : `Confirmar ${plural(plano.length, 'disciplina', 'disciplinas')}`}
            </button>
          </>
        }
      >
        <p className="modal__texto">
          Confira as disciplinas e o tipo de cada uma. Se uma delas estiver lotada ou fora das regras, o sistema recusa só ela e mantém as demais.
        </p>
        <div className="tabela-caixa">
          <table className="tabela tabela--cartoes">
            <thead>
              <tr>
                <th scope="col">Disciplina</th>
                <th scope="col">Professor</th>
                <th scope="col">Créditos</th>
                <th scope="col">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {plano.map((p) => {
                const d = disciplinaDe(p.disciplinaId)
                return (
                  <tr key={p.disciplinaId}>
                    <td>
                      <strong>{d?.codigo}</strong> {d?.nome}
                    </td>
                    <td data-rotulo="Professor">{d?.professorNome || 'A definir'}</td>
                    <td data-rotulo="Créditos">{d?.creditos}</td>
                    <td data-rotulo="Tipo">
                      <button type="button" className="btn btn--secundario btn--sm" onClick={() => trocar(p.disciplinaId)} disabled={enviando} title="Alternar entre primeira opção e alternativa">
                        {ROTULO_TIPO[p.tipo]}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="campo__ajuda">Total do plano: {creditosPlano} créditos.</p>
      </Modal>

      <Confirmar
        aberto={Boolean(cancelando)}
        onFechar={() => setCancelando(null)}
        onConfirmar={cancelarMatricula}
        ocupado={cancelandoOcupado}
        perigo
        titulo="Cancelar matrícula"
        rotuloConfirmar="Cancelar matrícula"
        texto={
          cancelando && (
            <p>
              Cancelar a matrícula em <strong>{cancelando.disciplinaCodigo}</strong> ({cancelando.disciplinaNome})? A vaga será liberada e o
              sistema de cobranças será atualizado.
            </p>
          )
        }
      />
    </>
  )
}
