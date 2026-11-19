import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { periodos } from '../../services'
import { Carga, CabecalhoPagina, EsqueletoTabela, Progresso, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Confirmar } from '../../components/ui/Modal.jsx'
import { useToast } from '../../toast.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, diasAte, formatarData, plural, progressoPeriodo } from '../../util'

export default function Periodos() {
  const notificar = useToast()
  const s = useSecretaria()
  const [encerrando, setEncerrando] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [resultado, setResultado] = useState(null)

  async function encerrar() {
    setOcupado(true)
    try {
      const r = await periodos.encerrar(encerrando.id)
      setResultado({ semestre: encerrando.semestre, linhas: r })
      notificar(`Período de ${encerrando.semestre} encerrado. Disciplinas confirmadas ou canceladas.`)
      setEncerrando(null)
      await s.recarregar()
    } catch (e) {
      notificar(e.message, 'erro')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Períodos de matrícula"
        descricao="Acompanhe os períodos e encerre cada um para confirmar ou cancelar as disciplinas pelo número de inscritos."
        acoes={
          <Link to="/semestre" className="btn btn--secundario">
            Currículo semestral
          </Link>
        }
      />

      <Carga carregando={s.carregando} erro={s.erro} onTentar={s.recarregar} esqueleto={<EsqueletoTabela />}>
        {resultado && (
          <section className="confirmacao" aria-live="polite">
            <div className="confirmacao__topo">
              <div>
                <h2>Resultado de {resultado.semestre}</h2>
                <p>Inscritos por disciplina no momento do encerramento. Este total só é exibido agora, ao fechar o período.</p>
              </div>
              <button type="button" className="btn btn--secundario btn--sm" onClick={() => setResultado(null)}>
                Dispensar
              </button>
            </div>
            <div className="tabela-caixa">
              <table className="tabela tabela--cartoes">
                <thead>
                  <tr>
                    <th scope="col">Disciplina</th>
                    <th scope="col">Inscritos</th>
                    <th scope="col">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.linhas.map((r) => (
                    <tr key={r.disciplinaId}>
                      <td>
                        <strong>{r.codigo}</strong> {r.nome}
                      </td>
                      <td data-rotulo="Inscritos">
                        <div className="inscritos">
                          <span>{r.matriculados}</span>
                          <Progresso valor={r.matriculados} max={MAX_ALUNOS} marca={MIN_ALUNOS} rotulo={`${r.matriculados} inscritos`} tom={r.matriculados >= MIN_ALUNOS ? 'verde' : 'bordo'} />
                        </div>
                      </td>
                      <td data-rotulo="Situação">
                        <Selo tom={r.status === 'ATIVA' ? 'verde' : 'erro'} icone={r.status === 'ATIVA' ? 'check' : 'x'}>
                          {r.status === 'ATIVA' ? 'Ativa no próximo semestre' : 'Cancelada, menos de 3 inscritos'}
                        </Selo>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {s.periodos.length === 0 ? (
          <Vazio
            icone="calendario"
            titulo="Nenhum período de matrículas"
            texto="Gere o currículo de um semestre e abra o período para os alunos se matricularem."
            acao={
              <Link to="/semestre" className="btn btn--primario">
                Ir para o currículo semestral
              </Link>
            }
          />
        ) : (
          <ul className="curriculos">
            {s.periodos.map((p) => {
              const curriculo = s.curriculos.find((c) => c.periodoId === p.id)
              const dias = diasAte(p.fim)
              let sit = { tom: 'verde', texto: 'Aberto' }
              if (p.encerrado) sit = { tom: 'neutro', texto: 'Encerrado' }
              else if (!p.aberto) sit = { tom: 'ambar', texto: 'Fora das datas' }
              return (
                <li key={p.id} className="curriculo">
                  <div className="curriculo__linha">
                    <div className="curriculo__bloco">
                      <h2 className="curriculo__semestre">{p.semestre}</h2>
                      <p className="curriculo__meta">
                        {formatarData(p.inicio)} a {formatarData(p.fim)}.{' '}
                        {curriculo ? plural(curriculo.disciplinas.length, 'disciplina', 'disciplinas') : 'Sem currículo'}
                      </p>
                      {!p.encerrado && (
                        <div className="curriculo__progresso">
                          <Progresso valor={Math.round(progressoPeriodo(p.inicio, p.fim) * 100)} max={100} rotulo="Progresso do período" tom="ouro" />
                          <small>{dias >= 0 ? `Termina em ${plural(dias, 'dia', 'dias')}` : `Prazo vencido há ${plural(-dias, 'dia', 'dias')}`}</small>
                        </div>
                      )}
                    </div>
                    <div className="curriculo__acoes">
                      <Selo tom={sit.tom}>{sit.texto}</Selo>
                      {!p.encerrado && (
                        <button type="button" className="btn btn--secundario btn--sm" onClick={() => setEncerrando(p)}>
                          Encerrar período
                        </button>
                      )}
                    </div>
                  </div>
                  {p.encerrado && curriculo && (
                    <div className="curriculo__detalhe">
                      <h3 className="curriculo__subtitulo">Situação final das disciplinas</h3>
                      <ul className="lista-simples">
                        {curriculo.disciplinas.map((d) => (
                          <li key={d.id}>
                            <span>
                              <strong>{d.codigo}</strong> {d.nome}
                            </span>
                            <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <Secao id="limites" titulo="Como acompanhar as turmas">
          <p className="secao__texto">
            Os alunos de cada disciplina aparecem na turma do professor responsável. O total de inscritos por disciplina é mostrado aqui quando você
            encerra o período, junto com o resultado: confirmada com 3 alunos ou mais, cancelada com menos.
          </p>
        </Secao>
      </Carga>

      <Confirmar
        aberto={Boolean(encerrando)}
        onFechar={() => setEncerrando(null)}
        onConfirmar={encerrar}
        ocupado={ocupado}
        perigo
        titulo={encerrando ? `Encerrar período de ${encerrando.semestre}` : ''}
        rotuloConfirmar="Encerrar período"
        texto={
          <>
            <p>As matrículas e os cancelamentos deste semestre deixam de ser aceitos. Cada disciplina do currículo será avaliada:</p>
            <ul className="regras">
              <li>{MIN_ALUNOS} inscritos ou mais: a disciplina fica ativa no semestre seguinte.</li>
              <li>Menos de {MIN_ALUNOS} inscritos: a disciplina é cancelada.</li>
            </ul>
            <p>Esta ação não pode ser desfeita.</p>
          </>
        }
      />
    </>
  )
}
