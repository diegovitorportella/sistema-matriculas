import { Link } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { Carga, Estatisticas, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Barras } from '../../components/ui/Graficos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, plural } from '../../util'

export default function ProfessorInicio() {
  const { usuario } = useAuth()
  const { carregando, erro, recarregar, disciplinas, alunos, totalAlunos } = useProfessor()

  const confirmadas = disciplinas.filter((d) => d.status === 'ATIVA').length
  const emAberto = disciplinas.filter((d) => d.status === 'ABERTA').length

  return (
    <>
      <Hero
        foto="professor"
        posicao="center 55%"
        titulo={`Bem-vindo, ${usuario.nome}`}
        acoes={
          <Link to="/turmas" className="btn btn--ouro">
            Ver minhas disciplinas
          </Link>
        }
      >
        Consulte as turmas, a situação de cada disciplina e a lista de alunos matriculados.
      </Hero>

      <div className="pagina-corpo">
        <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
          {disciplinas.length === 0 ? (
            <Vazio
              titulo="Você ainda não tem disciplinas"
              texto="A secretaria associa o professor a cada disciplina. Quando isso acontecer, as turmas aparecem aqui."
            />
          ) : (
            <>
              <Estatisticas
                itens={[
                  { valor: disciplinas.length, rotulo: disciplinas.length === 1 ? 'Disciplina' : 'Disciplinas' },
                  { valor: totalAlunos, rotulo: 'Alunos matriculados', detalhe: 'somando todas as turmas' },
                  { valor: confirmadas, rotulo: 'Confirmadas', detalhe: 'com 3 alunos ou mais ao fim do período' },
                  { valor: emAberto, rotulo: 'Em andamento', detalhe: 'ainda no período de matrículas' },
                ]}
              />

              <div className="duas-colunas">
                <Secao id="alunos-por-disciplina" titulo="Alunos por disciplina" descricao={`Cada disciplina precisa de ${MIN_ALUNOS} alunos para ser confirmada e aceita até ${MAX_ALUNOS}.`}>
                  <Barras
                    dados={disciplinas.map((d) => ({ rotulo: `${d.codigo} ${d.nome}`, valor: alunos[d.id]?.length ?? 0 }))}
                    max={Math.max(MIN_ALUNOS, ...disciplinas.map((d) => alunos[d.id]?.length ?? 0))}
                  />
                </Secao>

                <Secao
                  id="turmas"
                  titulo="Suas turmas"
                  acoes={
                    <Link to="/turmas" className="btn btn--secundario btn--sm">
                      Ver todas
                    </Link>
                  }
                >
                  <ul className="lista-simples">
                    {disciplinas.map((d) => (
                      <li key={d.id}>
                        <Link to={`/turmas/${d.id}`}>
                          <strong>{d.codigo}</strong> {d.nome}
                        </Link>
                        <span className="lista-simples__direita">
                          <small>{plural(alunos[d.id]?.length ?? 0, 'aluno', 'alunos')}</small>
                          <Selo tom={TOM_STATUS_DISCIPLINA[d.status]}>{ROTULO_STATUS_DISCIPLINA[d.status]}</Selo>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Secao>
              </div>
            </>
          )}
        </Carga>
      </div>
    </>
  )
}
