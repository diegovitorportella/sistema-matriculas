import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { disciplinas, matriculas, periodos } from '../services'
import { LIMITES, contem, diasAte, formatarData, plural } from '../util'
import { ShellDados } from './ShellDados.js'
import { t, useIdioma } from '../i18n/index.jsx'

const AlunoContext = createContext(null)
export const useAluno = () => useContext(AlunoContext)

const CHAVE_PLANO = 'matriculas.plano'

function lerPlano() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_PLANO)
    const lista = bruto ? JSON.parse(bruto) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function guardarPlano(plano) {
  try {
    sessionStorage.setItem(CHAVE_PLANO, JSON.stringify(plano))
  } catch {
    /* rascunho vale só até recarregar */
  }
}

export function AlunoProvider({ children }) {
  const { idioma } = useIdioma() // avisos e busca são recalculados ao trocar de idioma
  const [estado, setEstado] = useState({ carregando: true, erro: null, periodo: null, ofertadas: [], minhas: [] })
  const [plano, setPlanoBruto] = useState(lerPlano)

  const setPlano = useCallback((fn) => {
    setPlanoBruto((atual) => {
      const novo = typeof fn === 'function' ? fn(atual) : fn
      guardarPlano(novo)
      return novo
    })
  }, [])

  const carregar = useCallback(async () => {
    try {
      const periodo = await periodos.atual()
      if (!periodo) {
        setEstado({ carregando: false, erro: null, periodo: null, ofertadas: [], minhas: [] })
        return
      }
      const [todas, ofertadas] = await Promise.all([matriculas.minhas(), disciplinas.ofertadas()])
      setEstado({
        carregando: false,
        erro: null,
        periodo,
        ofertadas,
        minhas: todas.filter((m) => m.status === 'ATIVA'),
      })
    } catch (e) {
      setEstado((s) => ({ ...s, carregando: false, erro: e.message }))
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const { periodo, ofertadas, minhas } = estado

  // O rascunho só vale para disciplinas ainda ofertadas e ainda não matriculadas.
  const planoValido = useMemo(
    () =>
      plano.filter(
        (p) => ofertadas.some((d) => d.id === p.disciplinaId) && !minhas.some((m) => m.disciplinaId === p.disciplinaId),
      ),
    [plano, ofertadas, minhas],
  )

  const usados = useCallback(
    (tipo) => minhas.filter((m) => m.tipo === tipo).length + planoValido.filter((p) => p.tipo === tipo).length,
    [minhas, planoValido],
  )

  const situacao = useCallback(
    (disciplinaId) => {
      if (minhas.some((m) => m.disciplinaId === disciplinaId)) return 'matriculado'
      if (planoValido.some((p) => p.disciplinaId === disciplinaId)) return 'no-plano'
      return 'livre'
    },
    [minhas, planoValido],
  )

  /** Devolve uma mensagem de erro, ou null quando a disciplina entrou no plano. */
  const adicionar = useCallback(
    (disciplinaId, tipo) => {
      if (situacao(disciplinaId) !== 'livre') return t('Esta disciplina já está no seu plano ou matriculada.')
      if (usados(tipo) >= LIMITES[tipo]) {
        return tipo === 'OBRIGATORIA'
          ? t('As 4 vagas de primeira opção já estão ocupadas.')
          : t('As 2 vagas de alternativa já estão ocupadas.')
      }
      setPlano((p) => [...p, { disciplinaId, tipo }])
      return null
    },
    [situacao, usados, setPlano],
  )

  const remover = useCallback((disciplinaId) => setPlano((p) => p.filter((x) => x.disciplinaId !== disciplinaId)), [setPlano])

  const trocarTipo = useCallback(
    (disciplinaId) => {
      const atual = planoValido.find((p) => p.disciplinaId === disciplinaId)
      if (!atual) return null
      const novo = atual.tipo === 'OBRIGATORIA' ? 'OPTATIVA' : 'OBRIGATORIA'
      if (usados(novo) >= LIMITES[novo]) return t('Não há vaga livre nesse tipo.')
      setPlano((p) => p.map((x) => (x.disciplinaId === disciplinaId ? { ...x, tipo: novo } : x)))
      return null
    },
    [planoValido, usados, setPlano],
  )

  /** Envia cada disciplina do plano ao back-end e devolve o resultado individual. */
  const confirmar = useCallback(async () => {
    const ordenado = [...planoValido].sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'OBRIGATORIA' ? -1 : 1))
    const resultados = []
    for (const item of ordenado) {
      const disciplina = ofertadas.find((d) => d.id === item.disciplinaId)
      try {
        const m = await matriculas.matricular(item.disciplinaId, item.tipo)
        resultados.push({ disciplina, tipo: item.tipo, ok: true, matricula: m })
      } catch (e) {
        resultados.push({ disciplina, tipo: item.tipo, ok: false, erro: e.message })
      }
    }
    const aprovados = new Set(resultados.filter((r) => r.ok).map((r) => r.disciplina.id))
    setPlano((p) => p.filter((x) => !aprovados.has(x.disciplinaId)))
    await carregar()
    return resultados
  }, [planoValido, ofertadas, setPlano, carregar])

  const cancelar = useCallback(
    async (matricula) => {
      await matriculas.cancelar(matricula.id)
      await carregar()
    },
    [carregar],
  )

  const avisos = useMemo(() => {
    const lista = []
    if (estado.carregando || estado.erro) return lista
    if (!periodo) {
      lista.push({ id: 'fechado', tom: 'info', titulo: t('Matrículas fechadas'), texto: t('Não há período de matrículas aberto no momento.') })
      return lista
    }
    const dias = diasAte(periodo.fim)
    lista.push({
      id: 'prazo',
      tom: dias <= 3 ? 'ambar' : 'info',
      titulo: dias === 0 ? t('Último dia de matrículas') : t('Matrículas terminam em {prazo}', { prazo: plural(dias, 'dia', 'dias') }),
      texto: t('Prazo final: {data}. Depois dele, disciplinas com menos de 3 alunos são canceladas.', { data: formatarData(periodo.fim) }),
      to: '/matricula',
    })
    const livres = LIMITES.OBRIGATORIA - usados('OBRIGATORIA')
    if (livres > 0) {
      lista.push({
        id: 'livres',
        tom: 'info',
        titulo: plural(livres, 'vaga de primeira opção livre', 'vagas de primeira opção livres'),
        texto: t('Escolha disciplinas no catálogo para completar o plano.'),
        to: '/catalogo',
      })
    }
    if (planoValido.length > 0) {
      lista.push({
        id: 'rascunho',
        tom: 'ambar',
        titulo: plural(planoValido.length, 'disciplina aguardando confirmação', 'disciplinas aguardando confirmação'),
        texto: t('Revise o plano e confirme para efetivar a matrícula.'),
        to: '/matricula',
      })
    }
    if (minhas.length === LIMITES.OBRIGATORIA + LIMITES.OPTATIVA) {
      lista.push({ id: 'completo', tom: 'verde', titulo: t('Plano completo'), texto: t('Suas 6 vagas estão preenchidas.'), to: '/minhas-matriculas' })
    }
    return lista
  }, [estado.carregando, estado.erro, periodo, usados, planoValido.length, minhas.length, idioma])

  const buscar = useCallback(
    (termo) =>
      ofertadas
        .filter((d) => contem(d, termo, ['codigo', 'nome', 'professorNome']))
        .slice(0, 6)
        .map((d) => ({
          grupo: t('Disciplinas'),
          titulo: `${d.codigo} ${t(d.nome)}`,
          subtitulo: d.professorNome || t('Professor a definir'),
          to: `/catalogo?q=${encodeURIComponent(d.codigo)}`,
        })),
    [ofertadas, idioma],
  )

  const valor = useMemo(
    () => ({
      ...estado,
      plano: planoValido,
      usados,
      situacao,
      adicionar,
      remover,
      trocarTipo,
      confirmar,
      cancelar,
      recarregar: carregar,
    }),
    [estado, planoValido, usados, situacao, adicionar, remover, trocarTipo, confirmar, cancelar, carregar],
  )

  return (
    <AlunoContext.Provider value={valor}>
      <ShellDados.Provider value={{ avisos, buscar }}>{children}</ShellDados.Provider>
    </AlunoContext.Provider>
  )
}
