import { useState } from 'react'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { curriculos, periodos } from '../../services'
import { Carga, CabecalhoPagina, EsqueletoTabela, Estatisticas, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import Foto from '../../components/ui/Foto.jsx'
import Icone from '../../components/ui/Icone.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useToast } from '../../toast.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, contem, formatarData, plural } from '../../util'

const hoje = () => new Date().toISOString().slice(0, 10)

function situacaoDoPeriodo(periodo) {
  if (!periodo) return { tom: 'neutro', texto: 'Sem período' }
  if (periodo.encerrado) return { tom: 'neutro', texto: 'Encerrado' }
  if (periodo.aberto) return { tom: 'verde', texto: 'Aberto' }
  return { tom: 'ambar', texto: 'Fora das datas' }
}

export default function Semestre() {
  const notificar = useToast()
  const s = useSecretaria()
  const [novo, setNovo] = useState(false)
  const [abrindo, setAbrindo] = useState(null)
  const [expandido, setExpandido] = useState(null)

  const comPeriodo = s.curriculos.filter((c) => c.periodoId).length

  return (
    <>
      <CabecalhoPagina
        titulo="Currículo semestral"
        descricao="Defina quais disciplinas são ofertadas em cada semestre e abra o período de matrículas para os alunos."
        acoes={
          <button type="button" className="btn btn--primario" onClick={() => setNovo(true)}>
            <Icone nome="mais" tamanho={18} /> Novo currículo
          </button>
        }
      />

      <Carga carregando={s.carregando} erro={s.erro} onTentar={s.recarregar} esqueleto={<EsqueletoTabela />}>
        {s.curriculos.length === 0 ? (
          <Vazio
            icone="calendario"
            titulo="Nenhum currículo gerado"
            texto="Escolha as disciplinas ofertadas no semestre. Depois, abra o período para os alunos se matricularem."
            acao={
              <button type="button" className="btn btn--primario" onClick={() => setNovo(true)}>
                Novo currículo
              </button>
            }
          />
        ) : (
          <>
            <Estatisticas
              itens={[
                { valor: s.curriculos.length, rotulo: s.curriculos.length === 1 ? 'Currículo' : 'Currículos' },
                { valor: comPeriodo, rotulo: 'Com período de matrículas' },
                { valor: s.curriculos.length - comPeriodo, rotulo: 'Aguardando período' },
              ]}
            />

            <ul className="curriculos">
              {s.curriculos.map((c) => {
                const periodo = s.periodos.find((p) => p.id === c.periodoId)
                const sit = situacaoDoPeriodo(periodo)
                const aberto = expandido === c.id
                return (
                  <li key={c.id} className="curriculo">
                    <div className="curriculo__linha">
                      <div>
                        <h2 className="curriculo__semestre">{c.semestre}</h2>
                        <p className="curriculo__meta">
                          {plural(c.disciplinas.length, 'disciplina ofertada', 'disciplinas ofertadas')}
                          {periodo && `. Matrículas de ${formatarData(periodo.inicio)} a ${formatarData(periodo.fim)}`}
                        </p>
                      </div>
                      <div className="curriculo__acoes">
                        <Selo tom={sit.tom}>{sit.texto}</Selo>
                        {!periodo && (
                          <button type="button" className="btn btn--secundario btn--sm" onClick={() => setAbrindo(c)}>
                            Abrir período
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--sm btn--secundario"
                          aria-expanded={aberto}
                          aria-controls={`curriculo-${c.id}`}
                          onClick={() => setExpandido(aberto ? null : c.id)}
                        >
                          {aberto ? 'Ocultar disciplinas' : 'Ver disciplinas'}
                          <Icone nome="baixo" tamanho={16} className={aberto ? 'gira' : ''} />
                        </button>
                      </div>
                    </div>
                    {aberto && (
                      <div id={`curriculo-${c.id}`} className="curriculo__detalhe">
                        {c.disciplinas.length === 0 ? (
                          <p className="secao__texto">Este currículo não tem disciplinas.</p>
                        ) : (
                          <div className="tabela-caixa">
                            <table className="tabela">
                              <thead>
                                <tr>
                                  <th scope="col">Disciplina</th>
                                  <th scope="col">Professor</th>
                                  <th scope="col">Créditos</th>
                                  <th scope="col">Situação</th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.disciplinas.map((d) => (
                                  <tr key={d.id}>
                                    <td>
                                      <strong>{d.codigo}</strong> {d.nome}
                                    </td>
                                    <td>{d.professorNome || <Selo tom="ambar">Sem professor</Selo>}</td>
                                    <td>{d.creditos}</td>
                                    <td>
                                      <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <p className="nota">
                          Regras: cada disciplina precisa de {MIN_ALUNOS} alunos ao fim do período para ser confirmada e aceita até {MAX_ALUNOS}; ao lotar, as
                          inscrições se encerram.
                        </p>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Carga>

      <ModalNovoCurriculo aberto={novo} onFechar={() => setNovo(false)} disciplinas={s.disciplinas} onCriado={s.recarregar} notificar={notificar} />
      <ModalAbrirPeriodo curriculo={abrindo} onFechar={() => setAbrindo(null)} onAberto={s.recarregar} notificar={notificar} />
    </>
  )
}

function ModalNovoCurriculo({ aberto, onFechar, disciplinas, onCriado, notificar }) {
  const [semestre, setSemestre] = useState('')
  const [marcadas, setMarcadas] = useState([])
  const [q, setQ] = useState('')
  const [salvando, setSalvando] = useState(false)

  const visiveis = disciplinas.filter((d) => contem(d, q, ['codigo', 'nome', 'professorNome']))
  const creditos = disciplinas.filter((d) => marcadas.includes(d.id)).reduce((t, d) => t + d.creditos, 0)

  function fechar() {
    if (salvando) return
    setSemestre('')
    setMarcadas([])
    setQ('')
    onFechar()
  }

  const alternar = (id) => setMarcadas((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

  async function enviar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await curriculos.gerar({ semestre: semestre.trim(), disciplinaIds: marcadas })
      notificar(`Currículo de ${semestre.trim()} gerado. Agora abra o período de matrículas.`)
      setSemestre('')
      setMarcadas([])
      setQ('')
      onFechar()
      await onCriado()
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={fechar}
      titulo="Novo currículo semestral"
      largura="lg"
      rodape={
        <>
          <span className="modal__resumo">
            {plural(marcadas.length, 'disciplina selecionada', 'disciplinas selecionadas')}, {creditos} créditos
          </span>
          <button type="button" className="btn btn--secundario" onClick={fechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" form="form-curriculo" className="btn btn--primario" disabled={salvando || !semestre.trim() || marcadas.length === 0}>
            {salvando ? 'Gerando…' : 'Gerar currículo'}
          </button>
        </>
      }
    >
      <form id="form-curriculo" onSubmit={enviar}>
        <label className="campo campo--curto">
          <span className="campo__rotulo">Semestre</span>
          <input value={semestre} onChange={(e) => setSemestre(e.target.value)} placeholder="Ex.: 2027/1" required />
        </label>

        <fieldset className="escolha">
          <legend className="campo__rotulo">Disciplinas ofertadas no semestre</legend>
          {disciplinas.length === 0 ? (
            <Vazio titulo="Nenhuma disciplina cadastrada" texto="Cadastre disciplinas antes de gerar o currículo." />
          ) : (
            <>
              <div className="barra-ferramentas">
                <div className="barra-ferramentas__busca">
                  <Icone nome="busca" tamanho={18} className="busca__icone" />
                  <input type="search" placeholder="Filtrar disciplinas" aria-label="Filtrar disciplinas" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              </div>
              <ul className="escolha__grade">
                {visiveis.map((d) => (
                  <li key={d.id}>
                    <label className={`escolha__carta${marcadas.includes(d.id) ? ' escolha__carta--marcada' : ''}`}>
                      <input type="checkbox" checked={marcadas.includes(d.id)} onChange={() => alternar(d.id)} />
                      <Foto id={fotoDaDisciplina(d)} className="escolha__foto" posicao="center 30%" />
                      <span className="escolha__texto">
                        <strong>{d.codigo}</strong>
                        <span>{d.nome}</span>
                        <small>
                          {d.creditos} créditos. {d.professorNome || 'Sem professor'}
                        </small>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </fieldset>
      </form>
    </Modal>
  )
}

function ModalAbrirPeriodo({ curriculo, onFechar, onAberto, notificar }) {
  const [inicio, setInicio] = useState(hoje())
  const [fim, setFim] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await periodos.abrir({ semestre: curriculo.semestre, inicio, fim })
      notificar(`Período de matrículas de ${curriculo.semestre} criado.`)
      setFim('')
      onFechar()
      await onAberto()
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={Boolean(curriculo)}
      onFechar={() => !salvando && onFechar()}
      titulo={curriculo ? `Abrir período de ${curriculo.semestre}` : ''}
      largura="sm"
      rodape={
        <>
          <button type="button" className="btn btn--secundario" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" form="form-periodo" className="btn btn--primario" disabled={salvando || !fim}>
            {salvando ? 'Abrindo…' : 'Abrir período'}
          </button>
        </>
      }
    >
      <form id="form-periodo" onSubmit={enviar} className="grade-campos grade-campos--coluna">
        <p className="modal__texto">Durante o período, os alunos podem se matricular e cancelar matrículas no catálogo deste semestre.</p>
        <label className="campo">
          <span className="campo__rotulo">Início</span>
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
        </label>
        <label className="campo">
          <span className="campo__rotulo">Fim</span>
          <input type="date" value={fim} min={inicio} onChange={(e) => setFim(e.target.value)} required />
        </label>
      </form>
    </Modal>
  )
}
