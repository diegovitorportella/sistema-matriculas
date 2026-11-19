import { iniciais } from '../../util'
import Icone from './Icone.jsx'
import { t } from '../../i18n/index.jsx'

/** Selo de situação. Sempre acompanha um texto (nunca só cor). */
export function Selo({ tom = 'neutro', icone, children }) {
  return (
    <span className={`selo selo--${tom}`}>
      {icone && <Icone nome={icone} tamanho={14} />}
      {children}
    </span>
  )
}

export function Avatar({ nome, tamanho = 'md' }) {
  return (
    <span className={`avatar avatar--${tamanho}`} aria-hidden="true">
      {iniciais(nome)}
    </span>
  )
}

export function CabecalhoPagina({ titulo, descricao, acoes }) {
  return (
    <header className="cabecalho-pagina">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p className="cabecalho-pagina__texto">{descricao}</p>}
      </div>
      {acoes && <div className="cabecalho-pagina__acoes">{acoes}</div>}
    </header>
  )
}

export function Secao({ titulo, descricao, acoes, children, id }) {
  return (
    <section className="secao" aria-labelledby={id}>
      <div className="secao__topo">
        <div>
          <h2 id={id}>{titulo}</h2>
          {descricao && <p className="secao__texto">{descricao}</p>}
        </div>
        {acoes}
      </div>
      {children}
    </section>
  )
}

export function Vazio({ titulo, texto, acao, icone = 'livro' }) {
  return (
    <div className="vazio">
      <Icone nome={icone} tamanho={32} className="vazio__icone" />
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {acao}
    </div>
  )
}

export function Estatisticas({ itens }) {
  return (
    <dl className="estatisticas">
      {itens.map((i) => (
        <div key={i.rotulo} className="estatistica">
          <dt className="estatistica__rotulo">{i.rotulo}</dt>
          <dd className="estatistica__valor">{i.valor}</dd>
          {i.detalhe && <p className="estatistica__detalhe">{i.detalhe}</p>}
        </div>
      ))}
    </dl>
  )
}

/** Barra de progresso com marcador opcional (ex.: mínimo de 3 alunos). */
export function Progresso({ valor, max, marca, rotulo, tom = 'bordo' }) {
  const pct = Math.min(100, Math.max(0, (valor / max) * 100))
  return (
    <div
      className="progresso"
      role="progressbar"
      aria-valuenow={valor}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={rotulo}
    >
      <div className={`progresso__barra progresso__barra--${tom}`} style={{ width: `${pct}%` }} />
      {marca != null && <span className="progresso__marca" style={{ left: `${(marca / max) * 100}%` }} />}
    </div>
  )
}

export function Esqueleto({ linhas = 3, altura }) {
  return (
    <div className="esqueleto" aria-hidden="true" style={altura ? { height: altura } : undefined}>
      {altura ? null : Array.from({ length: linhas }, (_, i) => <span key={i} className="esqueleto__linha" />)}
    </div>
  )
}

export function EsqueletoCartas({ n = 6 }) {
  return (
    <div className="grade-cartas" aria-busy="true" aria-label={t('Carregando')}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="carta carta--esqueleto">
          <div className="esqueleto" style={{ height: '9rem' }} />
          <div className="carta__corpo">
            <Esqueleto linhas={3} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EsqueletoTabela({ linhas = 6 }) {
  return (
    <div className="tabela-caixa" aria-busy="true" aria-label={t('Carregando')}>
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="tabela-esqueleto">
          <span className="esqueleto__linha" />
        </div>
      ))}
    </div>
  )
}

/** Mostra esqueleto enquanto carrega e painel de erro com nova tentativa. */
export function Carga({ carregando, erro, onTentar, esqueleto, children }) {
  if (carregando) return esqueleto ?? <Esqueleto linhas={4} />
  if (erro) {
    return (
      <div className="erro-painel" role="alert">
        <Icone nome="alerta" />
        <div>
          <p className="erro-painel__titulo">{t('Não foi possível carregar esta página.')}</p>
          <p>{erro}</p>
          {onTentar && (
            <button type="button" className="btn btn--secundario btn--sm" onClick={onTentar}>
             {t('Tentar novamente')}
            </button>
          )}
        </div>
      </div>
    )
  }
  return children
}
