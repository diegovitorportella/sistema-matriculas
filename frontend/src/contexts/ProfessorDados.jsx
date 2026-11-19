import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { professores } from '../services'
import { MAX_ALUNOS, MIN_ALUNOS, contem, plural } from '../util'
import { ShellDados } from './ShellDados.js'
import { t, useIdioma } from '../i18n/index.jsx'

const ProfessorContext = createContext(null)
export const useProfessor = () => useContext(ProfessorContext)

export function ProfessorProvider({ children }) {
  const { idioma } = useIdioma() // avisos e busca são recalculados ao trocar de idioma
  const [estado, setEstado] = useState({ carregando: true, erro: null, disciplinas: [], alunos: {} })

  const carregar = useCallback(async () => {
    try {
      const lista = await professores.minhasDisciplinas()
      const pares = await Promise.all(
        lista.map(async (d) => {
          try {
            return [d.id, await professores.alunosDaDisciplina(d.id)]
          } catch {
            return [d.id, []]
          }
        }),
      )
      setEstado({ carregando: false, erro: null, disciplinas: lista, alunos: Object.fromEntries(pares) })
    } catch (e) {
      setEstado((s) => ({ ...s, carregando: false, erro: e.message }))
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const { disciplinas, alunos } = estado
  const totalAlunos = useMemo(() => Object.values(alunos).reduce((s, l) => s + l.length, 0), [alunos])

  const avisos = useMemo(() => {
    const lista = []
    for (const d of disciplinas) {
      const n = alunos[d.id]?.length ?? 0
      if (d.status === 'CANCELADA') {
        lista.push({ id: `c-${d.id}`, tom: 'ambar', titulo: t('{codigo} foi cancelada', { codigo: d.codigo }), texto: t('A disciplina terminou o período de matrículas com menos de 3 alunos.'), to: `/turmas/${d.id}` })
      } else if (d.status === 'ABERTA' && n < MIN_ALUNOS) {
        lista.push({ id: `m-${d.id}`, tom: 'info', titulo: t('{codigo} tem {n}', { codigo: d.codigo, n: plural(n, 'aluno', 'alunos') }), texto: t('São necessários {min} para confirmar a disciplina.', { min: MIN_ALUNOS }), to: `/turmas/${d.id}` })
      } else if (n >= MAX_ALUNOS) {
        lista.push({ id: `l-${d.id}`, tom: 'verde', titulo: t('{codigo} atingiu {max} alunos', { codigo: d.codigo, max: MAX_ALUNOS }), texto: t('As matrículas dessa disciplina estão encerradas.'), to: `/turmas/${d.id}` })
      }
    }
    return lista
  }, [disciplinas, alunos, idioma])

  const buscar = useCallback(
    (termo) => {
      const resultados = disciplinas
        .filter((d) => contem(d, termo, ['codigo', 'nome']))
        .slice(0, 4)
        .map((d) => ({ grupo: t('Minhas disciplinas'), titulo: `${d.codigo} ${t(d.nome)}`, to: `/turmas/${d.id}` }))
      for (const d of disciplinas) {
        for (const a of alunos[d.id] ?? []) {
          if (resultados.length >= 8) break
          if (contem(a, termo, ['nome', 'matricula'])) {
            resultados.push({
              grupo: t('Alunos'),
              titulo: a.nome,
              subtitulo: t('{codigo}, matrícula {matricula}', { codigo: d.codigo, matricula: a.matricula }),
              to: `/turmas/${d.id}?q=${encodeURIComponent(a.nome)}`,
            })
          }
        }
      }
      return resultados
    },
    [disciplinas, alunos, idioma],
  )

  const valor = useMemo(() => ({ ...estado, totalAlunos, recarregar: carregar }), [estado, totalAlunos, carregar])

  return (
    <ProfessorContext.Provider value={valor}>
      <ShellDados.Provider value={{ avisos, buscar }}>{children}</ShellDados.Provider>
    </ProfessorContext.Provider>
  )
}
