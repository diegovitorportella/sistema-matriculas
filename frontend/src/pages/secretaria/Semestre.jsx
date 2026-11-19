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
import { t } from '../../i18n/index.jsx'

const hoje = () => new Date().toISOString().slice(0, 10)

function situacaoDoPeriodo(periodo) {
  if (!periodo) return { tom: 'neutro', texto: t('Sem período') }
  if (periodo.encerrado) return { tom: 'neutro', texto: t('Encerrado') }
  if (periodo.aberto) return { tom: 'verde', texto: t('Aberto') }
  return { tom: 'ambar', texto: t('Fora das datas') }
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
        titulo={t('Currículo semestral')}
        descricao={t('Defina quais disciplinas são ofertadas em cada semestre e abra o período de matrículas para os alunos.')}
        acoes={
          <button type="button" className="btn btn--primario" onClick={() => setNovo(true)}>
            <Icone nome="mais" tamanho={18} /> {t('Novo currículo')}
          </button>
        }
      />

      <Carga carregando={s.carregando} erro={s.erro} onTentar={s.recarregar} esqueleto={<EsqueletoTabela />}>
        {s.curriculos.length === 0 ? (
          <Vazio
            icone="calendario"
            titulo={t('Nenhum currículo gerado')}
            texto={t('Escolha as disciplinas ofertadas no semestre. Depois, abra o período para os alunos se matricularem.')}
            acao={
              <button type="button" className="btn btn--primario" onClick={() => setNovo(true)}>
               {t('Novo currículo')}
              </button>
            }
          />
        ) : (
          <>
            <Estatisticas
              itens={[
                { valor: s.curriculos.length, rotulo: s.curriculos.length === 1 ? t('Currículo') : t('Currículos') },
                { valor: comPeriodo, rotulo: t('Com período de matrículas') },
                { valor: s.curriculos.length - comPeriodo, rotulo: t('Aguardando período') },
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
                          {plural(c.disciplinas.length, t('disciplina ofertada'), t('disciplinas ofertadas'))}
                          {periodo && `. ${t('Matrículas de {inicio} a {fim}', { inicio: formatarData(periodo.inicio), fim: formatarData(periodo.fim) })}`}
                        </p>
                      </div>
                      <div className="curriculo__acoes">
                        <Selo tom={sit.tom}>{sit.texto}</Selo>
                        {!periodo && (
                          <button type="button" className="btn btn--secundario btn--sm" onClick={() => setAbrindo(c)}>
                           {t('Abrir período')}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--sm btn--secundario"
                          aria-expanded={aberto}
                          aria-controls={`curriculo-${c.id}`}
                          onClick={() => setExpandido(aberto ? null : c.id)}
                        >
                          {aberto ? t('Ocultar disciplinas') : t('Ver disciplinas')}
                          <Icone nome="baixo" tamanho={16} className={aberto ? 'gira' : ''} />
                        </button>
                      </div>
                    </div>
                    {aberto && (
                      <div id={`curriculo-${c.id}`} className="curriculo__detalhe">
                        {c.disciplinas.length === 0 ? (
                          <p className="secao__texto">{t('Este currículo não tem disciplinas.')}</p>
                        ) : (
                          <div className="tabela-caixa">
                            <table className="tabela tabela--cartoes">
                              <thead>
                                <tr>
                                  <th scope="col">{t('Disciplina')}</th>
                                  <th scope="col">{t('Professor')}</th>
                                  <th scope="col">{t('Créditos')}</th>
                                  <th scope="col">{t('Situação')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.disciplinas.map((d) => (
                                  <tr key={d.id}>
                                    <td>
                                      <strong>{d.codigo}</strong> {t(d.nome)}
                                    </td>
                                    <td data-rotulo={t('Professor')}>{d.professorNome || <Selo tom="ambar">{t('Sem professor')}</Selo>}</td>
                                    <td data-rotulo={t('Créditos')}>{d.creditos}</td>
                                    <td data-rotulo={t('Situação')}>
                                      <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <p className="nota">
                          {t('Regras: cada disciplina precisa de {min} alunos ao fim do período para ser confirmada e aceita até {max}; ao lotar, as inscrições se encerram.', { min: MIN_ALUNOS, max: MAX_ALUNOS })}
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
  const creditos = disciplinas.filter((d) => marcadas.includes(d.id)).reduce((soma, d) => soma + d.creditos, 0)

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
      notificar(t('Currículo de {semestre} gerado. Agora abra o período de matrículas.', { semestre: semestre.trim() }))
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
      titulo={t('Novo currículo semestral')}
      largura="lg"
      rodape={
        <>
          <span className="modal__resumo">
            {plural(marcadas.length, 'disciplina selecionada', 'disciplinas selecionadas')}, {t('{n} créditos', { n: creditos })}
          </span>
          <button type="button" className="btn btn--secundario" onClick={fechar} disabled={salvando}>
           {t('Cancelar')}
          </button>
          <button type="submit" form="form-curriculo" className="btn btn--primario" disabled={salvando || !semestre.trim() || marcadas.length === 0}>
            {salvando ? t('Gerando…') : t('Gerar currículo')}
          </button>
        </>
      }
    >
      <form id="form-curriculo" onSubmit={enviar}>
        <label className="campo campo--curto">
          <span className="campo__rotulo">{t('Semestre')}</span>
          <input value={semestre} onChange={(e) => setSemestre(e.target.value)} placeholder={t('Ex.: 2027/1')} required />
        </label>

        <fieldset className="escolha">
          <legend className="campo__rotulo">{t('Disciplinas ofertadas no semestre')}</legend>
          {disciplinas.length === 0 ? (
            <Vazio titulo={t('Nenhuma disciplina cadastrada')} texto={t('Cadastre disciplinas antes de gerar o currículo.')} />
          ) : (
            <>
              <div className="barra-ferramentas">
                <div className="barra-ferramentas__busca">
                  <Icone nome="busca" tamanho={18} className="busca__icone" />
                  <input type="search" placeholder={t('Filtrar disciplinas')} aria-label={t('Filtrar disciplinas')} value={q} onChange={(e) => setQ(e.target.value)} />
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
                        <span>{t(d.nome)}</span>
                        <small>
                          {t('{n} créditos.', { n: d.creditos })} {d.professorNome || t('Sem professor')}
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
      notificar(t('Período de matrículas de {semestre} criado.', { semestre: curriculo.semestre }))
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
      titulo={curriculo ? t('Abrir período de {semestre}', { semestre: curriculo.semestre }) : ''}
      largura="sm"
      rodape={
        <>
          <button type="button" className="btn btn--secundario" onClick={onFechar} disabled={salvando}>
           {t('Cancelar')}
          </button>
          <button type="submit" form="form-periodo" className="btn btn--primario" disabled={salvando || !fim}>
            {salvando ? t('Abrindo…') : t('Abrir período')}
          </button>
        </>
      }
    >
      <form id="form-periodo" onSubmit={enviar} className="grade-campos grade-campos--coluna">
        <p className="modal__texto">{t('Durante o período, os alunos podem se matricular e cancelar matrículas no catálogo deste semestre.')}</p>
        <label className="campo">
          <span className="campo__rotulo">{t('Início')}</span>
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
        </label>
        <label className="campo">
          <span className="campo__rotulo">{t('Fim')}</span>
          <input type="date" value={fim} min={inicio} onChange={(e) => setFim(e.target.value)} required />
        </label>
      </form>
    </Modal>
  )
}
