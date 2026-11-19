import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useRotuloMigalha } from '../../components/layout/Migalhas.jsx'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { Avatar, Carga, Estatisticas, Progresso, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import Icone from '../../components/ui/Icone.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, baixarCsv, contem, plural } from '../../util'
import { t } from '../../i18n/index.jsx'

function situacaoTexto(status, n) {
  if (status === 'CANCELADA') return t('Cancelada: terminou o período de matrículas com menos de 3 alunos.')
  if (n >= MAX_ALUNOS) return t('Turma lotada: {max} alunos, matrículas encerradas.', { max: MAX_ALUNOS })
  if (status === 'ATIVA') return t('Confirmada: terá aulas no próximo semestre.')
  if (n < MIN_ALUNOS) return t('Faltam {n} para a disciplina ser confirmada.', { n: plural(MIN_ALUNOS - n, 'aluno', 'alunos') })
  return t('Já atingiu o mínimo de 3 alunos; será confirmada ao fim do período.')
}

export default function TurmaDetalhe() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const { carregando, erro, recarregar, disciplinas, alunos } = useProfessor()

  const disciplina = disciplinas.find((d) => d.id === id)
  useRotuloMigalha(disciplina ? t(disciplina.nome) : null)

  const lista = alunos[id] ?? []
  const filtrados = lista.filter((a) => contem(a, q, ['nome', 'matricula', 'cursoNome']))

  function exportar() {
    baixarCsv(`alunos-${disciplina.codigo}.csv`, [
      [t('Matrícula'), t('Nome'), t('Curso')],
      ...lista.map((a) => [a.matricula, t(a.nome), t(a.cursoNome ?? '')]),
    ])
  }

  return (
    <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
      {!disciplina ? (
        <Vazio
          icone="alerta"
          titulo={t('Disciplina não encontrada')}
          texto={t('Ela não existe ou não está associada ao seu usuário.')}
          acao={
            <Link to="/turmas" className="btn btn--primario">
             {t('Voltar às disciplinas')}
            </Link>
          }
        />
      ) : (
        <>
          <Hero foto={fotoDaDisciplina(disciplina)} posicao="center 35%" tamanho="sm" titulo={t(disciplina.nome)}>
            <span className="hero__selos">
              <Selo tom={TOM_STATUS_DISCIPLINA[disciplina.status]}>{ROTULO_STATUS_DISCIPLINA[disciplina.status]}</Selo>
              <span>
                {t('{codigo}, {n} créditos', { codigo: disciplina.codigo, n: disciplina.creditos })}
              </span>
            </span>
          </Hero>

          <div className="pagina-corpo">
            <Estatisticas
              itens={[
                { valor: lista.length, rotulo: lista.length === 1 ? t('Aluno matriculado') : t('Alunos matriculados') },
                { valor: MAX_ALUNOS, rotulo: t('Capacidade'), detalhe: t('máximo de alunos') },
                { valor: MIN_ALUNOS, rotulo: t('Mínimo'), detalhe: t('para a disciplina ser confirmada') },
              ]}
            />
            <div className="capacidade">
              <Progresso valor={lista.length} max={MAX_ALUNOS} marca={MIN_ALUNOS} rotulo={t('Ocupação da turma')} tom={lista.length >= MIN_ALUNOS ? 'verde' : 'bordo'} />
              <p className="nota">{situacaoTexto(disciplina.status, lista.length)}</p>
            </div>

            <section className="secao" aria-labelledby="lista-alunos">
              <div className="secao__topo">
                <h2 id="lista-alunos">{t('Alunos matriculados')}</h2>
                {lista.length > 0 && (
                  <button type="button" className="btn btn--secundario btn--sm" onClick={exportar}>
                    <Icone nome="baixar" tamanho={16} /> {t('Exportar CSV')}
                  </button>
                )}
              </div>

              {lista.length === 0 ? (
                <Vazio titulo={t('Ainda não há alunos matriculados')} texto={t('Os alunos aparecem aqui assim que se matricularem nesta disciplina.')} />
              ) : (
                <>
                  <div className="barra-ferramentas">
                    <div className="barra-ferramentas__busca">
                      <Icone nome="busca" tamanho={18} className="busca__icone" />
                      <label className="so-leitor" htmlFor="filtro-alunos">
                       {t('Filtrar alunos')}
                      </label>
                      <input
                        id="filtro-alunos"
                        type="search"
                        placeholder={t('Filtrar por nome ou matrícula')}
                        value={q}
                        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
                      />
                    </div>
                  </div>
                  <div className="tabela-caixa">
                    <table className="tabela tabela--cartoes">
                      <thead>
                        <tr>
                          <th scope="col">{t('Aluno')}</th>
                          <th scope="col">{t('Matrícula')}</th>
                          <th scope="col">{t('Curso')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtrados.map((a) => (
                          <tr key={a.id}>
                            <td>
                              <div className="tabela__pessoa">
                                <Avatar nome={t(a.nome)} />
                                <strong>{t(a.nome)}</strong>
                              </div>
                            </td>
                            <td data-rotulo={t('Matrícula')}>{a.matricula}</td>
                            <td data-rotulo={t('Curso')}>{t(a.cursoNome) || t('Sem curso')}</td>
                          </tr>
                        ))}
                        {filtrados.length === 0 && (
                          <tr>
                            <td colSpan={3}>{t('Nenhum aluno corresponde a “{q}”.', { q })}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <p className="tabela__rodape">
                      {plural(filtrados.length, 'aluno', 'alunos')} {q ? t('no filtro') : t('na turma')}
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </Carga>
  )
}
