import { TODAS_AS_FOTOS } from './Foto.jsx'
import Modal from './Modal.jsx'
import { t } from '../../i18n/index.jsx'

export default function CreditosFotos({ aberto, onFechar }) {
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={t('Créditos das fotografias')} largura="lg">
      <p className="modal__texto">
        {t('As imagens são fotografias reais de campi e bibliotecas de universidades internacionais, usadas aqui como referência visual do projeto. Elas não representam instalações da Horizon University, que é fictícia. Todas têm licença livre do Wikimedia Commons.')}
      </p>
      <ul className="creditos">
        {Object.values(TODAS_AS_FOTOS).map((f) => (
          <li key={f.arquivo} className="creditos__item">
            <img src={f.arquivo} alt="" loading="lazy" className="creditos__miniatura" />
            <div>
              <p className="creditos__lugar">{f.lugar}</p>
              <p className="creditos__meta">
                {t('Foto:')} {f.autor}.{' '}
                {f.urlLicenca ? (
                  <a href={f.urlLicenca} target="_blank" rel="noopener noreferrer">
                    {f.licenca}
                  </a>
                ) : (
                  f.licenca
                )}
                {'. '}
                <a href={f.fonte} target="_blank" rel="noopener noreferrer">
                  {t('Fonte')}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
