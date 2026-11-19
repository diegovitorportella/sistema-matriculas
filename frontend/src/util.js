import { idiomaAtual, t, t as traduzir } from './i18n/index.jsx'

/** Converte "2026-11-30" em "30/11/2026" (ou "11/30/2026" em inglês) sem passar por fuso horário. */
export function formatarData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return idiomaAtual() === 'en' ? `${mes}/${dia}/${ano}` : `${dia}/${mes}/${ano}`
}

/** O aluno escolhe: primeira opção (obrigatória no back-end) ou alternativa (optativa). */
// Rótulos como getters: são traduzidos na hora do uso, então acompanham a troca de idioma.
export const ROTULO_TIPO = {
  get OBRIGATORIA() { return t('Primeira opção') },
  get OPTATIVA() { return t('Alternativa') },
}
export const ROTULO_PERFIL = {
  get ALUNO() { return t('Aluno') },
  get PROFESSOR() { return t('Professor') },
  get SECRETARIA() { return t('Secretaria') },
}
export const ROTULO_STATUS_DISCIPLINA = {
  get ABERTA() { return t('Inscrições abertas') },
  get ATIVA() { return t('Confirmada') },
  get CANCELADA() { return t('Cancelada') },
}

/** Regras do enunciado: 4 de primeira opção, 2 alternativas, mínimo 3 e máximo 60 por disciplina. */
export const LIMITES = { OBRIGATORIA: 4, OPTATIVA: 2 }
export const MIN_ALUNOS = 3
export const MAX_ALUNOS = 60

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function primeiroNome(nome = '') {
  return nome.trim().split(/\s+/)[0] || ''
}

/** Minúsculas e sem acentos, para busca. */
export function normalizar(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function contem(item, termo, campos) {
  const t = normalizar(termo.trim())
  if (!t) return true
  // casa com o texto original e com a tradução (ex.: 'Banco de Dados' e 'Databases')
  return campos.some((c) => normalizar(item[c] ?? '').includes(t) || normalizar(traduzir(item[c] ?? '')).includes(t))
}

function meiaNoite(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

/** Dias inteiros de hoje até a data (negativo se já passou). */
export function diasAte(iso) {
  if (!iso) return null
  const hoje = new Date()
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((meiaNoite(iso) - base) / 86400000)
}

/** Fração (0 a 1) do período já decorrida hoje. */
export function progressoPeriodo(inicio, fim) {
  if (!inicio || !fim) return 0
  const i = meiaNoite(inicio).getTime()
  const f = meiaNoite(fim).getTime()
  const agora = Date.now()
  if (f <= i) return 1
  return Math.min(1, Math.max(0, (agora - i) / (f - i)))
}

/** "1 aluno" / "3 alunos": as duas formas passam pela tradução. */
export function plural(n, singular, pluralTxt) {
  return `${n} ${t(n === 1 ? singular : pluralTxt)}`
}

export function baixarCsv(nomeArquivo, linhas) {
  const csv = linhas
    .map((l) => l.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}

/** Tom do selo para cada situação de disciplina. */
export const TOM_STATUS_DISCIPLINA = { ABERTA: 'ouro', ATIVA: 'verde', CANCELADA: 'erro' }
