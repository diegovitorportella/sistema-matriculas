import FOTOS from '../../data/fotos.json'

/** Fotografias reais (Wikimedia Commons). Todas têm autor, licença e fonte em data/fotos.json. */
export function legendaDaFoto(id) {
  const f = FOTOS[id]
  return f ? `${f.lugar}. Foto: ${f.autor}, ${f.licenca}.` : ''
}

export default function Foto({ id, posicao = 'center', alt = '', className = '', carregamento = 'lazy' }) {
  const f = FOTOS[id]
  if (!f) return null
  return (
    <img
      className={`foto ${className}`}
      src={f.arquivo}
      alt={alt}
      loading={carregamento}
      decoding="async"
      style={{ objectPosition: posicao }}
    />
  )
}

export function LegendaFoto({ id, className = '' }) {
  const texto = legendaDaFoto(id)
  if (!texto) return null
  return <p className={`legenda-foto ${className}`}>{texto}</p>
}

export const TODAS_AS_FOTOS = FOTOS
