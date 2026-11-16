import { Link, useSearchParams } from 'react-router-dom'
import { fotoDaDisciplina } from '../../data/areas.js'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { Carga, CabecalhoPagina, EsqueletoCartas, Progresso, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import Foto from '../../components/ui/Foto.jsx'
import Icone from '../../components/ui/Icone.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, contem, plural } from '../../util'

export default function Turmas() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const { carregando, erro, recarregar, disciplinas, alunos } = useProfessor()
  const filtradas = disciplinas.filter((d) => contem(d, q, ['codigo', 'nome']))

  return (
    <>
      <CabecalhoPagina
        titulo="Minhas disciplinas"
        descricao="Escolha uma disciplina para ver os detalhes e a lista de alunos matriculados."
      />

      <Carga carregando={carregando} erro={erro} onTentar={recarregar} esqueleto={<EsqueletoCartas n={3} />}>
        {disciplinas.length === 0 ? (
          <Vazio titulo="Você ainda não tem disciplinas" texto="A secretaria associa o professor a cada disciplina." />
        ) : (
          <>
            <div className="barra-ferramentas">
              <div className="barra-ferramentas__busca">
                <Icone nome="busca" tamanho={18} className="busca__icone" />
                <label className="so-leitor" htmlFor="filtro-turmas">
                  Filtrar disciplinas
                </label>
                <input
                  id="filtro-turmas"
                  type="search"
                  placeholder="Filtrar por nome ou código"
                  value={q}
                  onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
                />
              </div>
            </div>

            {filtradas.length === 0 ? (
              <Vazio icone="busca" titulo="Nenhuma disciplina encontrada" texto={`Nada corresponde a “${q}”.`} />
            ) : (
              <ul className="grade-cartas">
                {filtradas.map((d) => {
                  const n = alunos[d.id]?.length ?? 0
                  return (
                    <li key={d.id}>
                      <article className="carta">
                        <div className="carta__foto">
                          <Foto id={fotoDaDisciplina(d)} posicao="center 30%" />
                        </div>
                        <div className="carta__corpo">
                          <div className="carta__topo">
                            <p className="carta__codigo">{d.codigo}</p>
                            <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo>
                          </div>
                          <h3 className="carta__titulo">
                            <Link to={`/turmas/${d.id}`} className="carta__link">
                              {d.nome}
                            </Link>
                          </h3>
                          <div className="carta__capacidade">
                            <Progresso valor={n} max={MAX_ALUNOS} marca={MIN_ALUNOS} rotulo={`${n} de ${MAX_ALUNOS} alunos`} tom={n >= MIN_ALUNOS ? 'verde' : 'bordo'} />
                            <p className="carta__meta">
                              {plural(n, 'aluno matriculado', 'alunos matriculados')} de {MAX_ALUNOS}
                            </p>
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
