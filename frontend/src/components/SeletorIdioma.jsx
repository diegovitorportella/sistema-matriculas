import { useIdioma } from '../i18n/index.jsx'

/** Alterna entre português e inglês. O rótulo de cada botão está no próprio idioma. */
export default function SeletorIdioma({ className = '' }) {
  const { idioma, mudar } = useIdioma()
  return (
    <div className={`seletor-idioma ${className}`.trim()} role="group" aria-label="Idioma / Language">
      <button type="button" lang="pt-BR" aria-pressed={idioma === 'pt'} title="Português" onClick={() => mudar('pt')}>
        PT
      </button>
      <button type="button" lang="en" aria-pressed={idioma === 'en'} title="English" onClick={() => mudar('en')}>
        EN
      </button>
    </div>
  )
}
