import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { alunos, cursos, curriculos, disciplinas, periodos, professores } from '../services'
import { contem, diasAte, formatarData, plural } from '../util'
import { ShellDados } from './ShellDados.js'
import { t, useIdioma } from '../i18n/index.jsx'

const SecretariaContext = createContext(null)
export const useSecretaria = () => useContext(SecretariaContext)

const VAZIO = { alunos: [], professores: [], disciplinas: [], cursos: [], curriculos: [], periodos: [] }

export function SecretariaProvider({ children }) {
  const { idioma } = useIdioma() // avisos e busca são recalculados ao trocar de idioma
  const [estado, setEstado] = useState({ carregando: true, erro: null, dados: VAZIO })

  const carregar = useCallback(async () => {
    const chamadas = {
      alunos: alunos.listar(),
      professores: professores.listar(),
      disciplinas: disciplinas.listar(),
      cursos: cursos.listar(),
      curriculos: curriculos.listar(),
      periodos: periodos.listar(),
    }
    const chaves = Object.keys(chamadas)
    const resultados = await Promise.allSettled(Object.values(chamadas))
    const dados = { ...VAZIO }
    let erro = null
    resultados.forEach((r, i) => {
      if (r.status === 'fulfilled') dados[chaves[i]] = r.value
      else erro = erro ?? r.reason?.message
    })
    const todasFalharam = resultados.every((r) => r.status === 'rejected')
    setEstado({ carregando: false, erro: todasFalharam ? erro : null, dados })
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const { dados } = estado
  const periodoAberto = useMemo(() => dados.periodos.find((p) => p.aberto) ?? null, [dados.periodos])

  const avisos = useMemo(() => {
    const lista = []
    if (estado.carregando) return lista
    if (periodoAberto) {
      const dias = diasAte(periodoAberto.fim)
      lista.push({
        id: 'periodo',
        tom: dias <= 3 ? 'ambar' : 'info',
        titulo: t('Matrículas de {semestre} terminam em {prazo}', { semestre: periodoAberto.semestre, prazo: plural(dias, 'dia', 'dias') }),
        texto: t('Prazo final: {data}. Encerre o período para ativar ou cancelar as disciplinas.', { data: formatarData(periodoAberto.fim) }),
        to: '/matriculas',
      })
    }
    const foraDatas = dados.periodos.filter((p) => !p.aberto && !p.encerrado)
    for (const p of foraDatas) {
      lista.push({ id: `fora-${p.id}`, tom: 'ambar', titulo: t('Período {semestre} fora das datas', { semestre: p.semestre }), texto: t('O prazo acabou, mas o período ainda não foi encerrado.'), to: '/matriculas' })
    }
    const semPeriodo = dados.curriculos.filter((c) => !c.periodoId)
    if (semPeriodo.length > 0) {
      lista.push({ id: 'sem-periodo', tom: 'info', titulo: plural(semPeriodo.length, 'currículo sem período', 'currículos sem período'), texto: t('Abra o período de matrículas para que os alunos possam se inscrever.'), to: '/semestre' })
    }
    const semProfessor = dados.disciplinas.filter((d) => !d.professorId)
    if (semProfessor.length > 0) {
      lista.push({ id: 'sem-prof', tom: 'ambar', titulo: plural(semProfessor.length, 'disciplina sem professor', 'disciplinas sem professor'), texto: t('Associe um professor para que ele consulte a turma.'), to: '/disciplinas' })
    }
    const canceladas = dados.disciplinas.filter((d) => d.status === 'CANCELADA')
    if (canceladas.length > 0) {
      lista.push({ id: 'canceladas', tom: 'info', titulo: plural(canceladas.length, 'disciplina cancelada', 'disciplinas canceladas'), texto: t('Ficaram com menos de 3 alunos ao fim do período.'), to: '/relatorios' })
    }
    return lista
  }, [estado.carregando, periodoAberto, dados, idioma])

  const buscar = useCallback(
    (termo) => {
      const pega = (lista, campos, grupo, rota, titulo, sub) =>
        lista
          .filter((i) => contem(i, termo, campos))
          .slice(0, 3)
          .map((i) => ({ grupo, titulo: titulo(i), subtitulo: sub?.(i), to: `${rota}?q=${encodeURIComponent(termo)}` }))
      return [
        ...pega(dados.alunos, ['nome', 'matricula', 'login'], t('Alunos'), '/alunos', (a) => a.nome, (a) => t('Matrícula {matricula}', { matricula: a.matricula })),
        ...pega(dados.professores, ['nome', 'login'], t('Professores'), '/professores', (p) => p.nome),
        ...pega(dados.disciplinas, ['codigo', 'nome', 'professorNome'], t('Disciplinas'), '/disciplinas', (d) => `${d.codigo} ${t(d.nome)}`, (d) => d.professorNome),
        ...pega(dados.cursos, ['nome'], t('Cursos'), '/cursos', (c) => t(c.nome)),
      ]
    },
    [dados, idioma],
  )

  const valor = useMemo(() => ({ ...estado, ...dados, periodoAberto, recarregar: carregar }), [estado, dados, periodoAberto, carregar])

  return (
    <SecretariaContext.Provider value={valor}>
      <ShellDados.Provider value={{ avisos, buscar }}>{children}</ShellDados.Provider>
    </SecretariaContext.Provider>
  )
}
