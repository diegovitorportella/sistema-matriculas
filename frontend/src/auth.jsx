import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, guardarToken, lerToken } from './api'

const AuthContext = createContext(null)

/** O rascunho do plano de matrícula é do usuário: nunca pode sobrar para a próxima sessão. */
function limparRascunho() {
  try {
    sessionStorage.removeItem('matriculas.plano')
  } catch {
    /* sem armazenamento: nada a limpar */
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (!lerToken()) {
      setPronto(true)
      return
    }
    api('/auth/me')
      .then((u) => setUsuario({ nome: u.nome, perfil: u.perfil }))
      .catch(() => guardarToken(null))
      .finally(() => setPronto(true))
  }, [])

  useEffect(() => {
    const expirou = () => {
      guardarToken(null)
      limparRascunho()
      setUsuario(null)
    }
    window.addEventListener('sessao-expirada', expirou)
    return () => window.removeEventListener('sessao-expirada', expirou)
  }, [])

  const entrar = useCallback(async (login, senha) => {
    const r = await api('/auth/login', { method: 'POST', corpo: { login, senha } })
    limparRascunho()
    guardarToken(r.token)
    setUsuario({ nome: r.nome, perfil: r.perfil })
  }, [])

  const sair = useCallback(() => {
    guardarToken(null)
    limparRascunho()
    setUsuario(null)
  }, [])

  const valor = useMemo(() => ({ usuario, pronto, entrar, sair }), [usuario, pronto, entrar, sair])
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
