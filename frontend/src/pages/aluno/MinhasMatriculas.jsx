import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useAluno } from '../../contexts/AlunoDados.jsx'
import { Carga, CabecalhoPagina, Estatisticas, EsqueletoTabela, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Confirmar } from '../../components/ui/Modal.jsx'
import { useToast } from '../../toast.jsx'
import { ROTULO_TIPO, formatarData } from '../../util'
import { t } from '../../i18n/index.jsx'

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
      notificar(t('Matrícula em {codigo} cancelada. A vaga foi liberada.', { codigo: cancelando.disciplinaCodigo }))
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
        titulo={t('Minhas matrículas')}
        descricao={periodo ? t('Matrículas ativas no semestre {semestre}. Cancelamentos são aceitos até {data}.', { semestre: periodo.semestre, data: formatarData(periodo.fim) }) : t('Seu histórico de matrículas aparece aqui durante o período.')}
        acoes={
          periodo && (
            <Link to="/matricula" className="btn btn--secundario">
             {t('Ir para o plano')}
            </Link>
          )
        }
      />

      <Carga carregando={carregando} erro={erro} onTentar={recarregar} esqueleto={<EsqueletoTabela />}>
        {!periodo ? (
          <Vazio icone="calendario" titulo={t('Sem período aberto')} texto={t('Quando houver um período de matrículas, suas disciplinas aparecerão aqui.')} />
        ) : minhas.length === 0 ? (
          <Vazio
            titulo={t('Você ainda não tem matrículas')}
            texto={t('Escolha disciplinas no catálogo e confirme o plano.')}
            acao={
              <Link to="/catalogo" className="btn btn--primario">
               {t('Ir para o catálogo')}
              </Link>
            }
          />
        ) : (
          <>
            <Estatisticas
              itens={[
                { valor: minhas.length, rotulo: minhas.length === 1 ? t('Disciplina') : t('Disciplinas') },
                { valor: creditos, rotulo: t('Créditos') },
                { valor: `${minhas.filter((m) => m.tipo === 'OBRIGATORIA').length}/4`, rotulo: t('Primeira opção') },
                { valor: `${minhas.filter((m) => m.tipo === 'OPTATIVA').length}/2`, rotulo: t('Alternativas') },
              ]}
            />
            <div className="tabela-caixa espaco-topo">
              <table className="tabela tabela--cartoes">
                <thead>
                  <tr>
                    <th scope="col">{t('Disciplina')}</th>
                    <th scope="col">{t('Professor')}</th>
                    <th scope="col">{t('Créditos')}</th>
                    <th scope="col">{t('Tipo')}</th>
                    <th scope="col">{t('Matriculado em')}</th>
                    <th scope="col" className="tabela__acoes-cab">
                     {t('Ação')}
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
                              <small>{t(m.disciplinaNome)}</small>
                            </div>
                          </div>
                        </td>
                        <td data-rotulo={t('Professor')}>{d?.professorNome || t('A definir')}</td>
                        <td data-rotulo={t('Créditos')}>{d?.creditos ?? '-'}</td>
                        <td data-rotulo={t('Tipo')}>
                          <Selo tom={m.tipo === 'OBRIGATORIA' ? 'bordo' : 'ouro'}>{ROTULO_TIPO[m.tipo]}</Selo>
                        </td>
                        <td data-rotulo={t('Matriculado em')}>{formatarData(m.dataMatricula)}</td>
                        <td className="tabela__celula-acoes">
                          <div className="tabela__acoes">
                            <button type="button" className="btn-texto btn-texto--perigo" onClick={() => setCancelando(m)}>
                             {t('Cancelar')}
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
        titulo={t('Cancelar matrícula')}
        rotuloConfirmar={t('Cancelar matrícula')}
        texto={
          cancelando && (
            <p>
              {t('Cancelar a matrícula em')} <strong>{cancelando.disciplinaCodigo}</strong> ({t(cancelando.disciplinaNome)})?{' '}
              {t('A vaga será liberada e o sistema de cobranças será atualizado.')}
            </p>
          )
        }
      />
    </>
  )
}
