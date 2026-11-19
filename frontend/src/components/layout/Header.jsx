import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import { useShellDados } from '../../contexts/ShellDados.js'
import { usePopover } from '../../hooks/usePopover.js'
import { ROTULO_PERFIL } from '../../util'
import { Avatar } from '../ui/Basicos.jsx'
import Icone from '../ui/Icone.jsx'
import Migalhas from './Migalhas.jsx'
import SeletorIdioma from '../SeletorIdioma.jsx'
import { t } from '../../i18n/index.jsx'

export default function Header({ rotas, onMenu }) {
  return (
    <header className="header">
      <button type="button" className="btn-icone header__menu" onClick={onMenu} aria-label={t('Abrir menu')}>
        <Icone nome="menu" />
      </button>
      <Migalhas rotas={rotas} />
      <div className="header__acoes">
        <Busca />
        <Avisos />
        <MenuPerfil />
        <SeletorIdioma />
      </div>
    </header>
  )
}

function Busca() {
  const { buscar } = useShellDados()
  const navegar = useNavigate()
  const [termo, setTermo] = useState('')
  const { aberto, ref, fechar, alternar } = usePopover()

  const resultados = termo.trim().length >= 2 ? buscar(termo) : []
  const grupos = []
  for (const r of resultados) {
    let g = grupos.find((x) => x.nome === r.grupo)
    if (!g) {
      g = { nome: r.grupo, itens: [] }
      grupos.push(g)
    }
    g.itens.push(r)
  }

  function ir(r) {
    navegar(r.to)
    setTermo('')
    fechar()
  }

  return (
    <div className="busca" ref={ref}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (resultados[0]) ir(resultados[0])
        }}
      >
        <label className="so-leitor" htmlFor="busca-global">
          {t('Buscar')}
        </label>
        <Icone nome="busca" tamanho={18} className="busca__icone" />
        <input
          id="busca-global"
          type="search"
          placeholder={t('Buscar')}
          autoComplete="off"
          value={termo}
          aria-expanded={aberto && termo.trim().length >= 2}
          aria-controls="busca-resultados"
          onChange={(e) => {
            setTermo(e.target.value)
            if (!aberto) alternar()
          }}
          onFocus={() => {
            if (!aberto) alternar()
          }}
        />
      </form>
      {aberto && termo.trim().length >= 2 && (
        <div className="popover popover--busca" id="busca-resultados">
          {resultados.length === 0 ? (
            <p className="popover__vazio">{t('Nada encontrado para “{termo}”.', { termo: termo.trim() })}</p>
          ) : (
            grupos.map((g) => (
              <div key={g.nome}>
                <p className="popover__grupo">{g.nome}</p>
                <ul>
                  {g.itens.map((r, i) => (
                    <li key={`${r.to}-${i}`}>
                      <button type="button" className="popover__item" onClick={() => ir(r)}>
                        <span>{r.titulo}</span>
                        {r.subtitulo && <small>{r.subtitulo}</small>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const ICONE_AVISO = { info: 'info', ambar: 'alerta', verde: 'check' }

function Avisos() {
  const { avisos } = useShellDados()
  const { aberto, ref, fechar, alternar } = usePopover()

  return (
    <div className="sino" ref={ref}>
      <button
        type="button"
        className="btn-icone"
        onClick={alternar}
        aria-expanded={aberto}
        aria-label={avisos.length > 0 ? t('Avisos, {n} no total', { n: avisos.length }) : t('Avisos')}
      >
        <Icone nome="sino" />
        {avisos.length > 0 && <span className="sino__contador">{avisos.length}</span>}
      </button>
      {aberto && (
        <div className="popover popover--avisos">
          <p className="popover__titulo">{t('Avisos')}</p>
          {avisos.length === 0 ? (
            <p className="popover__vazio">{t('Nenhum aviso no momento.')}</p>
          ) : (
            <ul>
              {avisos.map((a) => {
                const conteudo = (
                  <>
                    <Icone nome={ICONE_AVISO[a.tom] ?? 'info'} tamanho={18} className={`aviso-icone aviso-icone--${a.tom}`} />
                    <span>
                      <strong>{a.titulo}</strong>
                      <small>{a.texto}</small>
                    </span>
                  </>
                )
                return (
                  <li key={a.id}>
                    {a.to ? (
                      <Link to={a.to} className="popover__item popover__item--aviso" onClick={fechar}>
                        {conteudo}
                      </Link>
                    ) : (
                      <div className="popover__item popover__item--aviso">{conteudo}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          <p className="popover__nota">{t('Avisos calculados com os dados atuais do sistema.')}</p>
        </div>
      )}
    </div>
  )
}

function MenuPerfil() {
  const { usuario, sair } = useAuth()
  const { aberto, ref, fechar, alternar } = usePopover()

  return (
    <div className="menu-perfil" ref={ref}>
      <button type="button" className="menu-perfil__botao" onClick={alternar} aria-expanded={aberto} aria-haspopup="menu">
        <Avatar nome={t(usuario.nome)} />
        <span className="menu-perfil__texto">
          <strong>{t(usuario.nome)}</strong>
          <small>{ROTULO_PERFIL[usuario.perfil] ?? usuario.perfil}</small>
        </span>
        <Icone nome="baixo" tamanho={16} />
      </button>
      {aberto && (
        <div className="popover popover--perfil" role="menu">
          <Link to="/perfil" role="menuitem" className="popover__item" onClick={fechar}>
            <Icone nome="usuario" tamanho={18} /> {t('Meu perfil')}
          </Link>
          <button type="button" role="menuitem" className="popover__item" onClick={sair}>
            <Icone nome="sair" tamanho={18} /> {t('Sair')}
          </button>
        </div>
      )}
    </div>
  )
}
