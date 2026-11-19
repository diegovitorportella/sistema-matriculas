import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { t } from '../../i18n/index.jsx'

const MigalhaContext = createContext({ rotulo: null, definir: () => {} })

export function MigalhasProvider({ children }) {
  const [rotulo, definir] = useState(null)
  const valor = useMemo(() => ({ rotulo, definir }), [rotulo])
  return <MigalhaContext.Provider value={valor}>{children}</MigalhaContext.Provider>
}

/** Páginas de detalhe informam o nome do item (ex.: a disciplina) para a última migalha. */
export function useRotuloMigalha(rotulo) {
  const { definir } = useContext(MigalhaContext)
  useEffect(() => {
    definir(rotulo ?? null)
    return () => definir(null)
  }, [rotulo, definir])
}

function trilha(pathname, rotas, ultimo) {
  const atual = rotas.find((r) => matchPath({ path: r.path, end: true }, pathname))
  if (!atual) return []
  const cadeia = []
  let r = atual
  while (r) {
    cadeia.unshift(r)
    r = r.pai ? rotas.find((x) => x.path === r.pai) : null
  }
  return cadeia.map((r, i) => ({
    rotulo: i === cadeia.length - 1 && ultimo ? ultimo : t(r.titulo),
    to: i < cadeia.length - 1 ? r.path : null,
  }))
}

export default function Migalhas({ rotas }) {
  const { pathname } = useLocation()
  const { rotulo } = useContext(MigalhaContext)
  const itens = trilha(pathname, rotas, rotulo)
  const inicio = rotas.find((r) => r.path === '/inicio')

  // A página inicial é a raiz; nas demais, ela abre a trilha.
  const completa = pathname === '/inicio' ? itens : [{ rotulo: t('Início'), to: inicio?.path ?? '/inicio' }, ...itens]

  return (
    <nav className="migalhas" aria-label={t('Você está em')}>
      <ol>
        {completa.map((m, i) => (
          <li key={`${m.rotulo}-${i}`}>
            {m.to ? (
              <Link to={m.to}>{m.rotulo}</Link>
            ) : (
              <span aria-current="page">{m.rotulo}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
