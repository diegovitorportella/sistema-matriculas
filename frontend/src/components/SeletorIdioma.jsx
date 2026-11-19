import { useEffect, useRef } from 'react'
import { consumirFoco, useIdioma } from '../i18n/index.jsx'

const OPCOES = [
  { id: 'pt', rotulo: 'PT', lang: 'pt-BR', nome: 'Português' },
  { id: 'en', rotulo: 'EN', lang: 'en', nome: 'English' },
]

/**
 * Alterna entre português e inglês. Os rótulos são os mesmos nos dois idiomas e têm largura fixa,
 * então o controle não muda de tamanho nem de lugar quando o idioma troca.
 */
export default function SeletorIdioma({ className = '' }) {
  const { idioma, mudar } = useIdioma()
  const refs = useRef({})

  // Depois da troca as telas remontam: devolve o foco ao botão que a pessoa tinha acionado.
  useEffect(() => {
    const id = consumirFoco()
    if (id) refs.current[id]?.focus()
  }, [])

  return (
    <div className={`seletor-idioma ${className}`.trim()} role="group" aria-label="Idioma / Language">
      {OPCOES.map((o) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[o.id] = el
          }}
          type="button"
          lang={o.lang}
          aria-pressed={idioma === o.id}
          aria-label={o.nome}
          title={o.nome}
          onClick={() => mudar(o.id)}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  )
}
