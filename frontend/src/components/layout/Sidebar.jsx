import { NavLink } from 'react-router-dom'
import Brasao from '../Brasao.jsx'
import Icone from '../ui/Icone.jsx'

export default function Sidebar({ itens, aberto, onFechar }) {
  // Agrupa preservando a ordem; itens sem grupo ficam no primeiro bloco.
  const grupos = []
  for (const item of itens) {
    const nome = item.grupo ?? ''
    let g = grupos.find((x) => x.nome === nome)
    if (!g) {
      g = { nome, itens: [] }
      grupos.push(g)
    }
    g.itens.push(item)
  }

  return (
    <aside className={`sidebar${aberto ? ' sidebar--aberta' : ''}`} aria-label="Menu institucional">
      <div className="sidebar__marca">
        <Brasao tamanho={44} />
        <div>
          <p className="sidebar__nome">Horizon University</p>
          <p className="sidebar__local">Belo Horizonte, Brazil</p>
        </div>
        <button type="button" className="btn-icone btn-icone--claro sidebar__fechar" onClick={onFechar} aria-label="Fechar menu">
          <Icone nome="x" />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Principal">
        {grupos.map((g) => (
          <div key={g.nome || 'principal'} className="nav-grupo">
            {g.nome && <p className="nav-grupo__nome">{g.nome}</p>}
            <ul>
              {g.itens.map((i) => (
                <li key={i.path}>
                  <NavLink to={i.path} className="nav-link" onClick={onFechar}>
                    <Icone nome={i.icone} />
                    {i.rotulo ?? i.titulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <p className="sidebar__lema">Veritas · Scientia · Progressus</p>
    </aside>
  )
}
