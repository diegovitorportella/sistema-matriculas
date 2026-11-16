import { useEffect, useId, useRef } from 'react'
import Icone from './Icone.jsx'

/** Diálogo modal sobre <dialog> nativo: foco preso, Esc fecha, clique no fundo fecha. */
export default function Modal({ aberto, onFechar, titulo, children, rodape, largura = 'md' }) {
  const ref = useRef(null)
  const idTitulo = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      className={`modal modal--${largura}`}
      aria-labelledby={idTitulo}
      onClose={onFechar}
      onMouseDown={(e) => {
        if (e.target === ref.current) onFechar()
      }}
    >
      {aberto && (
        <div className="modal__corpo">
          <header className="modal__topo">
            <h2 id={idTitulo}>{titulo}</h2>
            <button type="button" className="btn-icone" onClick={onFechar} aria-label="Fechar">
              <Icone nome="x" />
            </button>
          </header>
          <div className="modal__conteudo">{children}</div>
          {rodape && <footer className="modal__rodape">{rodape}</footer>}
        </div>
      )}
    </dialog>
  )
}

/** Confirmação para ações que não podem ser desfeitas. */
export function Confirmar({ aberto, onFechar, onConfirmar, titulo, texto, rotuloConfirmar, ocupado, perigo }) {
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={titulo}
      largura="sm"
      rodape={
        <>
          <button type="button" className="btn btn--secundario" onClick={onFechar} disabled={ocupado}>
            Voltar
          </button>
          <button
            type="button"
            className={`btn ${perigo ? 'btn--perigo' : 'btn--primario'}`}
            onClick={onConfirmar}
            disabled={ocupado}
          >
            {ocupado ? 'Aguarde…' : rotuloConfirmar}
          </button>
        </>
      }
    >
      <div className="modal__texto">{texto}</div>
    </Modal>
  )
}
