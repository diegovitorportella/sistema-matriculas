const CAMINHOS = {
  inicio: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5',
  livro: 'M3 5.5c3-1 6-1 9 1.2 3-2.2 6-2.2 9-1.2v13c-3-1-6-1-9 1.2-3-2.2-6-2.2-9-1.2zM12 6.7v13',
  prancheta: 'M9 4h6v3H9zM7 5.5H5.5v15h13v-15H17M9 12h6M9 16h4',
  lista: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c.8-3.6 3.7-5.5 7.5-5.5s6.7 1.9 7.5 5.5',
  usuarios: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 19.5c.7-3.2 3.1-5 6.5-5s5.8 1.8 6.5 5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c1.8.6 3 2.2 3.5 4.7',
  calendario: 'M4 6.5h16v13H4zM4 10.5h16M8 4v4M16 4v4',
  grafico: 'M4 20h17M7 20v-8M12 20V6M17 20v-5',
  predio: 'M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  chapeu: 'M2.5 9 12 4.5 21.5 9 12 13.5zM6.5 11.2v4.3c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.3M21.5 9v5',
  sino: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0',
  busca: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5 16 16',
  sair: 'M10 4.5H5.5v15H10M14 8l4 4-4 4M18 12H9',
  check: 'M5 12.5 10 17.5 19 7',
  x: 'M6 6l12 12M18 6 6 18',
  mais: 'M12 5v14M5 12h14',
  lapis: 'M4 20l1-4.5L16.5 4a2 2 0 0 1 3 3L8 18.5zM14.5 6l3.5 3.5',
  lixeira: 'M4.5 7h15M9 7V4.5h6V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5',
  relogio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  alerta: 'M12 4 21.5 20h-19zM12 10v4.5M12 17.2v.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.8v.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  seta: 'M5 12h14M13 6l6 6-6 6',
  baixo: 'M6 9.5l6 6 6-6',
  baixar: 'M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
}

export default function Icone({ nome, tamanho = 20, className }) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={CAMINHOS[nome] ?? CAMINHOS.info} />
    </svg>
  )
}
