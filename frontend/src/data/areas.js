import { normalizar } from '../util'

/**
 * A API não tem "área acadêmica". A fotografia de cada disciplina é escolhida
 * por palavras-chave do nome (apresentação visual); sem correspondência, usa
 * uma foto estável derivada do código.
 */
const REGRAS = [
  ['engenharia', ['engenharia', 'circuito', 'mecanic', 'eletric', 'eletron', 'materiais', 'termodin']],
  ['tecnologia', ['program', 'algoritm', 'software', 'computa', 'dados', 'redes', 'web', 'inteligencia', 'digital', 'informatic', 'sistemas']],
  ['ciencias', ['calculo', 'fisica', 'quimica', 'biolog', 'matematic', 'estatistic', 'algebra', 'geometr', 'ciencia']],
  ['administracao', ['gestao', 'administr', 'econom', 'contab', 'financ', 'marketing', 'empreend', 'negocio', 'mercado', 'projetos']],
  ['humanidades', ['etica', 'filosof', 'histor', 'sociolog', 'comunic', 'direito', 'portugues', 'redacao', 'ingles', 'humana', 'psicolog', 'arte']],
]

const SEM_AREA = ['geral', 'humanidades', 'ciencias', 'engenharia', 'tecnologia', 'administracao']

function hash(texto) {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export function fotoDaDisciplina(disciplina) {
  const texto = normalizar(`${disciplina.nome ?? ''} ${disciplina.codigo ?? ''}`)
  for (const [foto, palavras] of REGRAS) {
    if (palavras.some((p) => texto.includes(p))) return foto
  }
  return SEM_AREA[hash(disciplina.codigo || disciplina.id || '') % SEM_AREA.length]
}
