import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CreditosFotos from '../ui/CreditosFotos.jsx'
import Header from './Header.jsx'
import { MigalhasProvider } from './Migalhas.jsx'
import Sidebar from './Sidebar.jsx'
import { t } from '../../i18n/index.jsx'

export default function AppShell({ rotas }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [creditos, setCreditos] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const navegacao = rotas.filter((r) => r.nav)

  return (
    <MigalhasProvider>
      <div className="app">
        <a href="#conteudo" className="pular-conteudo">
          {t('Pular para o conteúdo')}
        </a>
        <Sidebar itens={navegacao} aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
        {menuAberto && <div className="app__veu" onClick={() => setMenuAberto(false)} aria-hidden="true" />}
        <div className="app__main">
          <Header rotas={rotas} onMenu={() => setMenuAberto(true)} />
          <main id="conteudo" className="conteudo" tabIndex={-1}>
            <Outlet />
          </main>
          <footer className="rodape">
            <p>{t('Horizon University, Belo Horizonte, Brazil. Instituição fictícia criada para fins acadêmicos.')}</p>
            <button type="button" className="btn-texto" onClick={() => setCreditos(true)}>
              {t('Créditos das fotografias')}
            </button>
          </footer>
        </div>
      </div>
      <CreditosFotos aberto={creditos} onFechar={() => setCreditos(false)} />
    </MigalhasProvider>
  )
}
