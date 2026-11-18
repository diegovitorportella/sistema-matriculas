const PROPORCAO = 1362 / 1015 // altura / largura dos arquivos recortados

/**
 * Brasão da Horizon University (instituição fictícia), com fundo transparente.
 * `tamanho` é a largura em pixels. Em fundos escuros use `sobreEscuro`, que troca
 * para a variante em que o texto "UNIVERSITY" (preto no original) fica creme.
 */
export default function Brasao({ tamanho = 48, sobreEscuro = false, titulo = 'Brasão da Horizon University', className }) {
  const classes = ['brasao', sobreEscuro ? 'brasao--escuro' : '', className].filter(Boolean).join(' ')
  return (
    <img
      className={classes}
      src={sobreEscuro ? '/brasao-claro.webp' : '/brasao.webp'}
      width={tamanho}
      height={Math.round(tamanho * PROPORCAO)}
      alt={titulo}
      decoding="async"
    />
  )
}
