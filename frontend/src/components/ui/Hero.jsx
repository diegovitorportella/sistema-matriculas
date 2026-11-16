import Foto, { LegendaFoto } from './Foto.jsx'

/** Faixa de abertura com fotografia de campus e título institucional. */
export default function Hero({ foto, posicao = 'center', titulo, children, acoes, tamanho = 'md' }) {
  return (
    <section className={`hero hero--${tamanho}`}>
      <Foto id={foto} posicao={posicao} className="hero__foto" carregamento="eager" />
      <div className="hero__veu" aria-hidden="true" />
      <div className="hero__texto">
        <h1>{titulo}</h1>
        {children && <div className="hero__apoio">{children}</div>}
        {acoes && <div className="hero__acoes">{acoes}</div>}
      </div>
      <LegendaFoto id={foto} className="hero__legenda" />
    </section>
  )
}
