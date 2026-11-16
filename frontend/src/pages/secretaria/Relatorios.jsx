import { useSecretaria } from '../../contexts/SecretariaDados.jsx'
import { Carga, CabecalhoPagina, Estatisticas, Secao, Selo, Vazio } from '../../components/ui/Basicos.jsx'
import { Barras, Rosca } from '../../components/ui/Graficos.jsx'
import Icone from '../../components/ui/Icone.jsx'
import { ROTULO_STATUS_DISCIPLINA, baixarCsv, plural } from '../../util'

function contar(lista, chave) {
  const mapa = new Map()
  for (const i of lista) mapa.set(chave(i), (mapa.get(chave(i)) ?? 0) + 1)
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor)
}

export default function Relatorios() {
  const s = useSecretaria()

  const porStatus = (st) => s.disciplinas.filter((d) => d.status === st).length
  const alunosPorCurso = contar(s.alunos, (a) => a.cursoNome || 'Sem curso')
  const disciplinasPorProfessor = contar(s.disciplinas, (d) => d.professorNome || 'Sem professor')
  const atencao = s.disciplinas.filter((d) => !d.professorId || d.status === 'CANCELADA')
  const creditos = s.disciplinas.reduce((t, d) => t + d.creditos, 0)

  function exportar() {
    baixarCsv('disciplinas.csv', [
      ['Código', 'Disciplina', 'Créditos', 'Professor', 'Situação'],
      ...s.disciplinas.map((d) => [d.codigo, d.nome, d.creditos, d.professorNome ?? '', ROTULO_STATUS_DISCIPLINA[d.status]]),
    ])
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Panorama calculado com os cadastros atuais: disciplinas, professores, alunos e cursos."
        acoes={
          <>
            <button type="button" className="btn btn--secundario" onClick={exportar} disabled={s.disciplinas.length === 0}>
              <Icone nome="baixar" tamanho={18} /> Exportar disciplinas (CSV)
            </button>
            <button type="button" className="btn btn--primario" onClick={() => window.print()}>
              Imprimir
            </button>
          </>
        }
      />

      <Carga carregando={s.carregando} erro={s.erro} onTentar={s.recarregar}>
       <div className="pagina-corpo pagina-corpo--colado">
        <Estatisticas
          itens={[
            { valor: s.alunos.length, rotulo: 'Alunos' },
            { valor: s.professores.length, rotulo: 'Professores' },
            { valor: s.disciplinas.length, rotulo: 'Disciplinas', detalhe: `${creditos} créditos somados` },
            { valor: s.curriculos.length, rotulo: s.curriculos.length === 1 ? 'Currículo' : 'Currículos' },
          ]}
        />

        <div className="duas-colunas">
          <Secao id="rel-status" titulo="Disciplinas por situação" descricao="Inscrições abertas, confirmadas e canceladas ao fim dos períodos.">
            {s.disciplinas.length === 0 ? (
              <Vazio titulo="Sem disciplinas" texto="Cadastre disciplinas para ver este relatório." />
            ) : (
              <Rosca
                centro={s.disciplinas.length}
                rotuloCentro="disciplinas"
                dados={[
                  { rotulo: 'Inscrições abertas', valor: porStatus('ABERTA'), cor: 'var(--ouro-500)' },
                  { rotulo: 'Confirmadas', valor: porStatus('ATIVA'), cor: 'var(--verde-600)' },
                  { rotulo: 'Canceladas', valor: porStatus('CANCELADA'), cor: 'var(--erro-700)' },
                ]}
              />
            )}
          </Secao>

          <Secao id="rel-cursos" titulo="Alunos por curso">
            {alunosPorCurso.length === 0 ? <Vazio titulo="Sem alunos" texto="Cadastre alunos para ver este relatório." /> : <Barras dados={alunosPorCurso} />}
          </Secao>
        </div>

        <div className="duas-colunas">
          <Secao id="rel-professores" titulo="Disciplinas por professor">
            {disciplinasPorProfessor.length === 0 ? (
              <Vazio titulo="Sem disciplinas" texto="Cadastre disciplinas para ver este relatório." />
            ) : (
              <Barras dados={disciplinasPorProfessor} cor="var(--ouro-500)" />
            )}
          </Secao>

          <Secao id="rel-atencao" titulo="Disciplinas que pedem atenção" descricao="Sem professor associado ou canceladas.">
            {atencao.length === 0 ? (
              <p className="secao__texto">Nenhuma disciplina pede atenção.</p>
            ) : (
              <ul className="lista-simples">
                {atencao.map((d) => (
                  <li key={d.id}>
                    <span>
                      <strong>{d.codigo}</strong> {d.nome}
                    </span>
                    <span className="lista-simples__direita">
                      {!d.professorId && <Selo tom="ambar">Sem professor</Selo>}
                      {d.status === 'CANCELADA' && <Selo tom="erro">Cancelada</Selo>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {atencao.length > 0 && <p className="nota">{plural(atencao.length, 'disciplina', 'disciplinas')} nesta lista.</p>}
          </Secao>
        </div>
       </div>
      </Carga>
    </>
  )
}
