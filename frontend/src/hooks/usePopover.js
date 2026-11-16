import { useCallback, useEffect, useRef, useState } from 'react'

/** Abre/fecha um painel flutuante; fecha ao clicar fora ou com Esc. */
export function usePopover() {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  const fechar = useCallback(() => setAberto(false), [])
  const alternar = useCallback(() => setAberto((a) => !a), [])

  useEffect(() => {
    if (!aberto) return undefined
    const fora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    const tecla = (e) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])

  return { aberto, ref, fechar, alternar }
}
