import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Brasao from './components/Brasao.jsx'
import AppShell from './components/layout/AppShell.jsx'
import Login from './pages/comum/Login.jsx'
import { PERFIS } from './routes.jsx'

function TelaCarregando({ texto = 'Carregando' }) {
  return (
    <div className="tela-carregando" role="status">
      <Brasao tamanho={56} />
      <p>{texto}…</p>
    </div>
  )
}

export default function App() {
  const { usuario, pronto } = useAuth()

  if (!pronto) return <TelaCarregando />

  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const config = PERFIS[usuario.perfil]
  if (!config) {
    return (
      <div className="tela-carregando">
        <p>Este perfil não tem acesso configurado no portal.</p>
      </div>
    )
  }

  const { rotas, Provedor } = config
  return (
    <Provedor>
      <Routes>
        <Route element={<AppShell rotas={rotas} />}>
          {rotas.map((r) => (
            <Route key={r.path} path={r.path} element={r.elemento} />
          ))}
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Route>
      </Routes>
    </Provedor>
  )
}
