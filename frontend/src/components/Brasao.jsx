const VARIANTES = {
  // Somente o escudo: legível em tamanhos pequenos (barra lateral, carregamento, favicon)
  escudo: { arquivo: '/brasao-escudo.webp', proporcao: 1030 / 818 },
  // Brasão com a faixa "HORIZON UNIVERSITY": só para tamanhos grandes (tela de login)
  completo: { arquivo: '/brasao.webp', proporcao: 1362 / 1015 },
  // Completo com o texto "UNIVERSITY" em creme, para fundos escuros
  completoClaro: { arquivo: '/brasao-claro.webp', proporcao: 1362 / 1015 },
}

/**
 * Brasão da Horizon University (instituição fictícia), com fundo transparente.
 * `tamanho` é a largura em pixels. Por padrão mostra só o escudo; use `completo` em tamanhos grandes
 * (e `sobreEscuro` junto, em fundos escuros, para o texto da faixa continuar legível).
 */
export default function Brasao({ tamanho = 48, completo = false, sobreEscuro = false, titulo = 'Brasão da Horizon University', className }) {
  const variante = completo ? (sobreEscuro ? 'completoClaro' : 'completo') : 'escudo'
  const { arquivo, proporcao } = VARIANTES[variante]
  const classes = ['brasao', sobreEscuro ? 'brasao--escuro' : '', className].filter(Boolean).join(' ')
  return <img className={classes} src={arquivo} width={tamanho} height={Math.round(tamanho * proporcao)} alt={titulo} decoding="async" />
}
