import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useRotuloMigalha } from '../../components/layout/Migalhas.jsx'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { Avatar, Carga, Estatisticas, Progresso, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import Icone from '../../components/ui/Icone.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, baixarCsv, contem, plural } from '../../util'

function situacaoTexto(status, n) {
  if (status === 'CANCELADA') return 'Cancelada: terminou o período de matrículas com menos de 3 alunos.'
  if (n >= MAX_ALUNOS) return `Turma lotada: ${MAX_ALUNOS} alunos, matrículas encerradas.`
  if (status === 'ATIVA') return 'Confirmada: terá aulas no próximo semestre.'
  if (n < MIN_ALUNOS) return `Faltam ${MIN_ALUNOS - n} ${MIN_ALUNOS - n === 1 ? 'aluno' : 'alunos'} para a disciplina ser confirmada.`
  return 'Já atingiu o mínimo de 3 alunos; será confirmada ao fim do período.'
}

export default function TurmaDetalhe() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const { carregando, erro, recarregar, disciplinas, alunos } = useProfessor()

  const disciplina = disciplinas.find((d) => d.id === id)
  useRotuloMigalha(disciplina ? disciplina.nome : null)

  const lista = alunos[id] ?? []
  const filtrados = lista.filter((a) => contem(a, q, ['nome', 'matricula', 'cursoNome']))

  function exportar() {
    baixarCsv(`alunos-${disciplina.codigo}.csv`, [
      ['Matrícula', 'Nome', 'Curso'],
      ...lista.map((a) => [a.matricula, a.nome, a.cursoNome ?? '']),
    ])
  }

  return (
    <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
      {!disciplina ? (
        <Vazio
          icone="alerta"
          titulo="Disciplina não encontrada"
          texto="Ela não existe ou não está associada ao seu usuário."
          acao={
            <Link to="/turmas" className="btn btn--primario">
              Voltar às disciplinas
            </Link>
          }
        />
      ) : (
        <>
          <Hero foto={fotoDaDisciplina(disciplina)} posicao="center 35%" tamanho="sm" titulo={disciplina.nome}>
            <span className="hero__selos">
              <Selo tom={TOM_STATUS_DISCIPLINA[disciplina.status]}>{ROTULO_STATUS_DISCIPLINA[disciplina.status]}</Selo>
              <span>
                {disciplina.codigo}, {disciplina.creditos} créditos
              </span>
            </span>
          </Hero>

          <div className="pagina-corpo">
            <Estatisticas
              itens={[
                { valor: lista.length, rotulo: lista.length === 1 ? 'Aluno matriculado' : 'Alunos matriculados' },
                { valor: MAX_ALUNOS, rotulo: 'Capacidade', detalhe: 'máximo de alunos' },
                { valor: MIN_ALUNOS, rotulo: 'Mínimo', detalhe: 'para a disciplina ser confirmada' },
              ]}
            />
            <div className="capacidade">
              <Progresso valor={lista.length} max={MAX_ALUNOS} marca={MIN_ALUNOS} rotulo="Ocupação da turma" tom={lista.length >= MIN_ALUNOS ? 'verde' : 'bordo'} />
              <p className="nota">{situacaoTexto(disciplina.status, lista.length)}</p>
            </div>

            <section className="secao" aria-labelledby="lista-alunos">
              <div className="secao__topo">
                <h2 id="lista-alunos">Alunos matriculados</h2>
                {lista.length > 0 && (
                  <button type="button" className="btn btn--secundario btn--sm" onClick={exportar}>
                    <Icone nome="baixar" tamanho={16} /> Exportar CSV
                  </button>
                )}
              </div>

              {lista.length === 0 ? (
                <Vazio titulo="Ainda não há alunos matriculados" texto="Os alunos aparecem aqui assim que se matricularem nesta disciplina." />
              ) : (
                <>
                  <div className="barra-ferramentas">
                    <div className="barra-ferramentas__busca">
                      <Icone nome="busca" tamanho={18} className="busca__icone" />
                      <label className="so-leitor" htmlFor="filtro-alunos">
                        Filtrar alunos
                      </label>
                      <input
                        id="filtro-alunos"
                        type="search"
                        placeholder="Filtrar por nome ou matrícula"
                        value={q}
                        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
                      />
                    </div>
                  </div>
                  <div className="tabela-caixa">
                    <table className="tabela tabela--cartoes">
                      <thead>
                        <tr>
                          <th scope="col">Aluno</th>
                          <th scope="col">Matrícula</th>
                          <th scope="col">Curso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtrados.map((a) => (
                          <tr key={a.id}>
                            <td>
                              <div className="tabela__pessoa">
                                <Avatar nome={a.nome} />
                                <strong>{a.nome}</strong>
                              </div>
                            </td>
                            <td data-rotulo="Matrícula">{a.matricula}</td>
                            <td data-rotulo="Curso">{a.cursoNome || 'Sem curso'}</td>
                          </tr>
                        ))}
                        {filtrados.length === 0 && (
                          <tr>
                            <td colSpan={3}>Nenhum aluno corresponde a “{q}”.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <p className="tabela__rodape">
                      {plural(filtrados.length, 'aluno', 'alunos')} {q ? 'no filtro' : 'na turma'}
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
