import { Link } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import { useProfessor } from '../../contexts/ProfessorDados.jsx'
import { Carga, Estatisticas, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Barras } from '../../components/ui/Graficos.jsx'
import Hero from '../../components/ui/Hero.jsx'
import { MAX_ALUNOS, MIN_ALUNOS, ROTULO_STATUS_DISCIPLINA, TOM_STATUS_DISCIPLINA, plural } from '../../util'
import { t } from '../../i18n/index.jsx'

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
        titulo={t('Bem-vindo, {nome}', { nome: t(usuario.nome) })}
        acoes={
          <Link to="/turmas" className="btn btn--ouro">
           {t('Ver minhas disciplinas')}
          </Link>
        }
      >
       {t('Consulte as turmas, a situação de cada disciplina e a lista de alunos matriculados.')}
      </Hero>

      <div className="pagina-corpo">
        <Carga carregando={carregando} erro={erro} onTentar={recarregar}>
          {disciplinas.length === 0 ? (
            <Vazio
              titulo={t('Você ainda não tem disciplinas')}
              texto={t('A secretaria associa o professor a cada disciplina. Quando isso acontecer, as turmas aparecem aqui.')}
            />
          ) : (
            <>
              <Estatisticas
                itens={[
                  { valor: disciplinas.length, rotulo: disciplinas.length === 1 ? t('Disciplina') : t('Disciplinas') },
                  { valor: totalAlunos, rotulo: t('Alunos matriculados'), detalhe: t('somando todas as turmas') },
                  { valor: confirmadas, rotulo: t('Confirmadas'), detalhe: t('com 3 alunos ou mais ao fim do período') },
                  { valor: emAberto, rotulo: t('Em andamento'), detalhe: t('ainda no período de matrículas') },
                ]}
              />

              <div className="duas-colunas">
                <Secao id="alunos-por-disciplina" titulo={t('Alunos por disciplina')} descricao={t('Cada disciplina precisa de {min} alunos para ser confirmada e aceita até {max}.', { min: MIN_ALUNOS, max: MAX_ALUNOS })}>
                  <Barras
                    dados={disciplinas.map((d) => ({ rotulo: `${d.codigo} ${t(d.nome)}`, valor: alunos[d.id]?.length ?? 0 }))}
                    max={Math.max(MIN_ALUNOS, ...disciplinas.map((d) => alunos[d.id]?.length ?? 0))}
                  />
                </Secao>

                <Secao
                  id="turmas"
                  titulo={t('Suas turmas')}
                  acoes={
                    <Link to="/turmas" className="btn btn--secundario btn--sm">
                     {t('Ver todas')}
                    </Link>
                  }
                >
                  <ul className="lista-simples">
                    {disciplinas.map((d) => (
                      <li key={d.id}>
                        <Link to={`/turmas/${d.id}`}>
                          <strong>{d.codigo}</strong> {t(d.nome)}
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
