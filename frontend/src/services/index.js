import { api } from '../api'

/** Camada de serviços: um ponto único para os endpoints reais do back-end. */

const crud = (base) => ({
  listar: () => api(base),
  criar: (corpo) => api(base, { method: 'POST', corpo }),
  atualizar: (id, corpo) => api(`${base}/${id}`, { method: 'PUT', corpo }),
  remover: (id) => api(`${base}/${id}`, { method: 'DELETE' }),
})

export const autenticacao = {
  eu: () => api('/auth/me'),
}

export const cursos = crud('/cursos')

export const disciplinas = {
  ...crud('/disciplinas'),
  ofertadas: () => api('/disciplinas/ofertadas'),
}

export const professores = {
  ...crud('/professores'),
  minhasDisciplinas: () => api('/professores/me/disciplinas'),
  alunosDaDisciplina: (disciplinaId) => api(`/professores/me/disciplinas/${disciplinaId}/alunos`),
}

export const alunos = crud('/alunos')

export const curriculos = {
  listar: () => api('/curriculos'),
  gerar: (corpo) => api('/curriculos', { method: 'POST', corpo }),
}

export const periodos = {
  listar: () => api('/periodos'),
  /** Período aberto agora, ou null (a API responde 404 quando não há). */
  async atual() {
    try {
      return await api('/periodos/atual')
    } catch (e) {
      if (e.status === 404) return null
      throw e
    }
  },
  abrir: (corpo) => api('/periodos', { method: 'POST', corpo }),
  encerrar: (id) => api(`/periodos/${id}/encerrar`, { method: 'POST' }),
}

export const matriculas = {
  minhas: () => api('/matriculas/minhas'),
  matricular: (disciplinaId, tipo) => api('/matriculas', { method: 'POST', corpo: { disciplinaId, tipo } }),
  cancelar: (id) => api(`/matriculas/${id}`, { method: 'DELETE' }),
}
