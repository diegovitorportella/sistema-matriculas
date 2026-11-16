/**
 * Brasão da Horizon University: escudo bordô com sol nascente sobre o horizonte
 * e um livro aberto. Desenho original, sem relação com escudos de outras instituições.
 */
export default function Brasao({ tamanho = 48, titulo = 'Brasão da Horizon University', className }) {
  const raios = [-80, -60, -40, -20, 0, 20, 40, 60, 80]
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho * 1.16}
      viewBox="0 0 120 140"
      role="img"
      aria-label={titulo}
    >
      <title>{titulo}</title>
      {/* Escudo */}
      <path
        d="M8 6h104v64c0 31-26 51-52 64C34 121 8 101 8 70z"
        fill="#661628"
        stroke="#d2be88"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 14h88v56c0 26-21 43-44 54-23-11-44-28-44-54z"
        fill="none"
        stroke="#d2be88"
        strokeWidth="1.2"
        opacity="0.7"
      />
      {/* Sol nascente */}
      <g transform="translate(60 58)">
        {raios.map((a) => (
          <line
            key={a}
            x1="0"
            y1="-21"
            x2="0"
            y2="-33"
            stroke="#d2be88"
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${a})`}
          />
        ))}
        <path d="M-17 0a17 17 0 0 1 34 0z" fill="#d2be88" />
      </g>
      {/* Horizonte */}
      <line x1="22" y1="58" x2="98" y2="58" stroke="#d2be88" strokeWidth="2.4" strokeLinecap="round" />
      {/* Livro aberto */}
      <path
        d="M60 88C52 82 41 81 33 84v21c8-3 19-2 27 4z"
        fill="#f7f2e8"
        stroke="#d2be88"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M60 88c8-6 19-7 27-4v21c-8-3-19-2-27 4z"
        fill="#eee6d5"
        stroke="#d2be88"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line x1="60" y1="88" x2="60" y2="109" stroke="#a98a4b" strokeWidth="1.4" />
    </svg>
  )
}
