import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth.jsx'
import Brasao from '../../components/Brasao.jsx'
import Foto, { LegendaFoto } from '../../components/ui/Foto.jsx'
import CreditosFotos from '../../components/ui/CreditosFotos.jsx'
import Icone from '../../components/ui/Icone.jsx'

const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === 'true'
const SENHA_DEMO = import.meta.env.VITE_SENHA_DEMO || 'demo12345'
const ACESSOS_DEMO = [
  { rotulo: 'Entrar como aluno', login: 'demo.aluno' },
  { rotulo: 'Entrar como professor', login: 'demo.professor' },
  { rotulo: 'Entrar como secretaria', login: 'demo.secretaria' },
]

export default function Login() {
  const { entrar, usuario } = useAuth()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [creditos, setCreditos] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  async function enviar(e, credenciais) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(credenciais?.login ?? login.trim(), credenciais?.senha ?? senha)
    } catch (err) {
      setErro(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="entrada">
      <section className="entrada__foto" aria-label="Horizon University">
        <Foto id="login" posicao="48% center" className="entrada__imagem" carregamento="eager" />
        <div className="entrada__veu" aria-hidden="true" />
        <div className="entrada__marca">
          <Brasao tamanho={168} completo sobreEscuro />
          <p className="entrada__local">Belo Horizonte, Brazil</p>
        </div>
        <div className="entrada__rodape-foto">
          <p className="entrada__lema">Veritas · Scientia · Progressus</p>
          <LegendaFoto id="login" />
        </div>
      </section>

      <section className="entrada__painel">
        <form className="entrada__form" onSubmit={enviar} noValidate>
          <div className="entrada__cabecalho">
            <Brasao tamanho={64} className="entrada__brasao-pequeno" />
            <h1>Portal acadêmico</h1>
            <p className="entrada__texto">Entre com o usuário e a senha fornecidos pela secretaria.</p>
          </div>

          <label className="campo">
            <span className="campo__rotulo">Usuário</span>
            <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" autoFocus required />
          </label>

          <label className="campo">
            <span className="campo__rotulo">Senha</span>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
          </label>

          {erro && (
            <p className="erro-form" role="alert">
              <Icone nome="alerta" tamanho={18} />
              {erro}
            </p>
          )}

          <button type="submit" className="btn btn--primario btn--largo" disabled={enviando || !login || !senha}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {MODO_DEMO && (
          <div className="entrada__demo">
            <p className="entrada__demo-titulo">Explorar a demonstração</p>
            <p className="entrada__demo-texto">Contas de exemplo com dados fictícios já cadastrados.</p>
            <div className="entrada__demo-acoes">
              {ACESSOS_DEMO.map((a) => (
                <button key={a.login} type="button" className="btn btn--secundario" disabled={enviando}
                  onClick={(e) => enviar(e, { login: a.login, senha: SENHA_DEMO })}>
                  {a.rotulo}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="entrada__creditos">
          Instituição fictícia, criada para fins acadêmicos.{' '}
          <button type="button" className="btn-texto" onClick={() => setCreditos(true)}>
            Créditos das fotografias
          </button>
        </p>
      </section>
      <CreditosFotos aberto={creditos} onFechar={() => setCreditos(false)} />
    </div>
  )
}
