/** Gráficos em SVG/HTML puro (sem biblioteca). Sempre com leitura textual acessível. */

export function Rosca({ dados, centro, rotuloCentro, tamanho = 168 }) {
  const total = dados.reduce((s, d) => s + d.valor, 0)
  const r = 54
  const c = 2 * Math.PI * r
  const visiveis = dados.filter((d) => d.valor > 0)
  const inicios = visiveis.map((_, i) => visiveis.slice(0, i).reduce((s, d) => s + (d.valor / total) * c, 0))

  return (
    <div className="rosca">
      <svg width={tamanho} height={tamanho} viewBox="0 0 140 140" role="img" aria-label={dados.map((d) => `${d.rotulo}: ${d.valor}`).join('; ')}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--creme-200)" strokeWidth="16" />
        {total > 0 &&
          visiveis.map((d, i) => {
              const comprimento = (d.valor / total) * c
              return (
                <circle
                  key={d.rotulo}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  style={{ stroke: d.cor }}
                  strokeWidth="16"
                  strokeDasharray={`${comprimento} ${c - comprimento}`}
                  strokeDashoffset={-inicios[i]}
                  transform="rotate(-90 70 70)"
                />
              )
            })}
        <text x="70" y="70" textAnchor="middle" className="rosca__numero">
          {centro}
        </text>
        <text x="70" y="88" textAnchor="middle" className="rosca__rotulo">
          {rotuloCentro}
        </text>
      </svg>
      <ul className="legenda">
        {dados.map((d) => (
          <li key={d.rotulo}>
            <span className="legenda__ponto" style={{ background: d.cor }} />
            <span>{d.rotulo}</span>
            <strong>{d.valor}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Barras({ dados, max, formato = (v) => v, cor = 'var(--bordo-600)' }) {
  const topo = max ?? Math.max(1, ...dados.map((d) => d.valor))
  return (
    <ul className="barras">
      {dados.map((d) => (
        <li key={d.rotulo} className="barras__linha">
          <span className="barras__rotulo" title={d.rotulo}>
            {d.rotulo}
          </span>
          <span className="barras__trilho">
            <span className="barras__preenche" style={{ width: `${(d.valor / topo) * 100}%`, background: d.cor ?? cor }} />
          </span>
          <span className="barras__valor">{formato(d.valor)}</span>
        </li>
      ))}
    </ul>
  )
}
