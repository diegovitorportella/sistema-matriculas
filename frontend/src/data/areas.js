/**
 * A API não tem "área acadêmica" nem imagem por disciplina. A fotografia de cada
 * disciplina é só apresentação: gira entre as fotos disponíveis a partir do número
 * do código (ES101, ES102, ...), de modo que disciplinas consecutivas recebem fotos
 * diferentes e a mesma disciplina mantém a mesma foto em todas as telas.
 * A ordem abaixo alterna ambientes (edifício, biblioteca, praça) para que cartões
 * vizinhos no catálogo não se pareçam.
 */
const FOTOS = [
  'biblioteca',
  'engenharia',
  'campus',
  'humanidades',
  'tecnologia',
  'login',
  'ciencias',
  'administracao',
  'geral',
  'professor',
  'secretaria',
]

function hash(texto) {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export function fotoDaDisciplina(disciplina) {
  const codigo = String(disciplina.codigo || disciplina.id || '')
  const numero = codigo.match(/(\d+)\s*$/)
  const indice = numero ? Number(numero[1]) : hash(codigo)
  return FOTOS[indice % FOTOS.length]
}
