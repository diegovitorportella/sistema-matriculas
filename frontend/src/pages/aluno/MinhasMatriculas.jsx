import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { Carga, CabecalhoPagina, Estatisticas, EsqueletoTabela, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Confirmar } from '../../components/ui/Modal.jsx'
import { useToast } from '../../toast.jsx'
import { ROTULO_TIPO, formatarData } from '../../util'

export default function MinhasMatriculas() {
  const notificar = useToast()
  const aluno = useAluno()
  const { carregando, erro, recarregar, periodo, minhas, ofertadas } = aluno
  const [cancelando, setCancelando] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const detalhe = (m) => ofertadas.find((d) => d.id === m.disciplinaId)
  const creditos = minhas.reduce((s, m) => s + (detalhe(m)?.creditos ?? 0), 0)

  async function cancelar() {
    setOcupado(true)
    try {
      await aluno.cancelar(cancelando)
      notificar(`Matrícula em ${cancelando.disciplinaCodigo} cancelada. A vaga foi liberada.`)
      setCancelando(null)
    } catch (e) {
      notificar(e.message, 'erro')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Minhas matrículas"
        descricao={periodo ? `Matrículas ativas no semestre ${periodo.semestre}. Cancelamentos são aceitos até ${formatarData(periodo.fim)}.` : 'Seu histórico de matrículas aparece aqui durante o período.'}
        acoes={
          periodo && (
            <Link to="/matricula" className="btn btn--secundario">
              Ir para o plano
            </Link>
          )
        }
      />

      <Carga carregando={carregando} erro={erro} onTentar={recarregar} esqueleto={<EsqueletoTabela />}>
        {!periodo ? (
          <Vazio icone="calendario" titulo="Sem período aberto" texto="Quando houver um período de matrículas, suas disciplinas aparecerão aqui." />
        ) : minhas.length === 0 ? (
          <Vazio
            titulo="Você ainda não tem matrículas"
            texto="Escolha disciplinas no catálogo e confirme o plano."
            acao={
              <Link to="/catalogo" className="btn btn--primario">
                Ir para o catálogo
              </Link>
            }
          />
        ) : (
          <>
            <Estatisticas
              itens={[
                { valor: minhas.length, rotulo: minhas.length === 1 ? 'Disciplina' : 'Disciplinas' },
                { valor: creditos, rotulo: 'Créditos' },
                { valor: `${minhas.filter((m) => m.tipo === 'OBRIGATORIA').length}/4`, rotulo: 'Primeira opção' },
                { valor: `${minhas.filter((m) => m.tipo === 'OPTATIVA').length}/2`, rotulo: 'Alternativas' },
              ]}
            />
            <div className="tabela-caixa espaco-topo">
              <table className="tabela">
                <thead>
                  <tr>
                    <th scope="col">Disciplina</th>
                    <th scope="col">Professor</th>
                    <th scope="col">Créditos</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Matriculado em</th>
                    <th scope="col" className="tabela__acoes-cab">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {minhas.map((m) => {
                    const d = detalhe(m)
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="tabela__pessoa">
                            <img className="tabela__miniatura" alt="" src={`/fotos/${fotoDaDisciplina(d ?? { codigo: m.disciplinaCodigo, nome: m.disciplinaNome })}.jpg`} loading="lazy" />
                            <div>
                              <strong>{m.disciplinaCodigo}</strong>
                              <small>{m.disciplinaNome}</small>
                            </div>
                          </div>
                        </td>
                        <td>{d?.professorNome || 'A definir'}</td>
                        <td>{d?.creditos ?? '-'}</td>
                        <td>
                          <Selo tom={m.tipo === 'OBRIGATORIA' ? 'bordo' : 'ouro'}>{ROTULO_TIPO[m.tipo]}</Selo>
                        </td>
                        <td>{formatarData(m.dataMatricula)}</td>
                        <td>
                          <div className="tabela__acoes">
                            <button type="button" className="btn-texto btn-texto--perigo" onClick={() => setCancelando(m)}>
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Carga>

      <Confirmar
        aberto={Boolean(cancelando)}
        onFechar={() => setCancelando(null)}
        onConfirmar={cancelar}
        ocupado={ocupado}
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
