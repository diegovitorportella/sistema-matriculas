import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import EN, { PADROES_EN } from './en.js'

/**
 * Internacionalização sem biblioteca. O texto em português é a própria chave: se não houver tradução,
 * o texto original aparece, então nada quebra por falta de uma entrada.
 *  - t('Olá, {nome}', { nome })  → interpola {chaves}
 *  - dados da demonstração (nomes de cursos e disciplinas) também passam por t()
 *  - mensagens do servidor, que podem ter partes variáveis, usam PADROES_EN (expressões regulares)
 */
const CHAVE = 'matriculas.idioma'
export const IDIOMAS = ['pt', 'en']

function lerSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    return IDIOMAS.includes(salvo) ? salvo : 'pt'
  } catch {
    return 'pt'
  }
}

let atual = lerSalvo()

export function idiomaAtual() {
  return atual
}

// Trocar o idioma remonta as telas; guarda qual botão tinha o foco para devolvê-lo (teclado e leitor de tela).
let focoPendente = null
export function consumirFoco() {
  const f = focoPendente
  focoPendente = null
  return f
}

function interpolar(texto, vars) {
  if (!vars) return texto
  return texto.replace(/\{(\w+)\}/g, (m, nome) => (vars[nome] === undefined || vars[nome] === null ? m : String(vars[nome])))
}

function porPadrao(texto) {
  for (const [regex, modelo] of PADROES_EN) {
    const m = texto.match(regex)
    if (m) return modelo.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? '')
  }
  return undefined
}

/** Traduz um texto para o idioma atual; sem tradução, devolve o original. */
export function t(texto, vars) {
  if (typeof texto !== 'string' || texto === '') return texto
  if (atual !== 'en') return interpolar(texto, vars)
  const chave = texto.replace(/\s+/g, ' ').trim()
  return interpolar(EN[chave] ?? porPadrao(chave) ?? texto, vars)
}

const Contexto = createContext({ idioma: 'pt', mudar: () => {} })

export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(atual)

  useEffect(() => {
    document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR'
  }, [idioma])

  const mudar = useCallback((novo) => {
    if (!IDIOMAS.includes(novo)) return
    atual = novo // antes de renderizar, para que t() já responda no novo idioma
    focoPendente = novo
    try {
      localStorage.setItem(CHAVE, novo)
    } catch {
      /* sem armazenamento: a escolha vale só nesta sessão */
    }
    setIdioma(novo)
  }, [])

  const valor = useMemo(() => ({ idioma, mudar }), [idioma, mudar])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useIdioma() {
  return useContext(Contexto)
}
