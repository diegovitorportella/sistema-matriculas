import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const proximo = useRef(1)

  const notificar = useCallback((mensagem, tipo = 'ok') => {
    const id = proximo.current++
    setAvisos((atuais) => [...atuais, { id, mensagem, tipo }])
    setTimeout(() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), 6000)
  }, [])

  const valor = useMemo(() => notificar, [notificar])

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((a) => (
          <p key={a.id} className={`aviso aviso--${a.tipo}`}>
            {a.mensagem}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
