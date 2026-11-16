const BASE = import.meta.env.VITE_API_URL || '/api'
const CHAVE_TOKEN = 'matriculas.token'

export class ApiError extends Error {
  constructor(mensagem, status) {
    super(mensagem)
    this.status = status
  }
}

export function lerToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token)
    else localStorage.removeItem(CHAVE_TOKEN)
  } catch {
    /* armazenamento indisponível: a sessão vale só até recarregar */
  }
}

function mensagemPadrao(status) {
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Item não encontrado.'
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.'
  return 'Não foi possível concluir a ação.'
}

export async function api(caminho, { method = 'GET', corpo } = {}) {
  const headers = {}
  const token = lerToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'

  let resposta
  try {
    resposta = await fetch(BASE + caminho, {
      method,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível falar com o servidor. Confira se o back-end está em execução.', 0)
  }

  if (resposta.status === 401 && token && caminho !== '/auth/login') {
    window.dispatchEvent(new Event('sessao-expirada'))
  }

  let dados = null
  const texto = await resposta.text()
  if (texto) {
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = null
    }
  }

  if (!resposta.ok) {
    throw new ApiError(dados?.erro || mensagemPadrao(resposta.status), resposta.status)
  }
  return dados
}
