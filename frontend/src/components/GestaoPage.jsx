import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSecretaria } from '../contexts/SecretariaDados.jsx'
import { useToast } from '../toast.jsx'
import { contem, plural } from '../util'
import { Carga, CabecalhoPagina, EsqueletoTabela, Vazio } from './ui/Basicos.jsx'
import Icone from './ui/Icone.jsx'
import Modal, { Confirmar } from './ui/Modal.jsx'
import { idiomaAtual, t } from '../i18n/index.jsx'

/**
 * Página de gestão (lista, busca, filtros, cadastro e edição em modal).
 * Os dados vêm do SecretariaProvider; as gravações usam o serviço informado.
 *
 * campos: { nome, rotulo, tipo?, obrigatorio?, senha?, soCriacao?, min?, opcoes?: { chave, rotulo } }
 * colunas: { rotulo, render(item) }
 * filtros: { rotulo, valor(item) }
 */
export default function GestaoPage({
  titulo,
  descricao,
  singular,
  genero = 'o',
  chave,
  servico,
  colunas,
  campos,
  buscaCampos,
  filtros = [],
  rotuloItem = (i) => t(i.nome),
}) {
  const notificar = useToast()
  const secretaria = useSecretaria()
  const itens = secretaria[chave]
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [selecionados, setSelecionados] = useState({})

  const [formulario, setFormulario] = useState(null) // { item|null, valores }
  const [salvando, setSalvando] = useState(false)
  const [removendo, setRemovendo] = useState(null)
  const [removendoOcupado, setRemovendoOcupado] = useState(false)

  const novo = genero === 'a' ? 'Nova' : 'Novo'
  const artigoDe = genero === 'a' ? 'da' : 'do'
  // Frases em português montadas com gênero; cada uma é traduzida inteira (ex.: 'Nova disciplina').
  const rotuloNovo = `${novo} ${singular}`
  const pluralPt = singular === 'curso' ? 'cursos' : singular === 'professor' ? 'professores' : `${singular}s`

  const filtrados = itens.filter(
    (i) => contem(i, q, buscaCampos) && filtros.every((f) => !selecionados[f.rotulo] || f.valor(i) === selecionados[f.rotulo]),
  )

  function abrirNovo() {
    setFormulario({ item: null, valores: {} })
  }

  function abrirEdicao(item) {
    setFormulario({ item, valores: Object.fromEntries(campos.map((c) => [c.nome, item[c.nome] ?? ''])) })
  }

  async function salvar(e) {
    e.preventDefault()
    const { item, valores } = formulario
    const corpo = {}
    for (const c of campos) {
      if (c.soCriacao && item) continue
      let v = valores[c.nome] ?? ''
      if (c.tipo === 'number') v = v === '' ? 0 : Number(v)
      if ((c.tipo === 'select' || c.senha) && v === '') v = null
      corpo[c.nome] = v
    }
    setSalvando(true)
    try {
      if (item) await servico.atualizar(item.id, corpo)
      else await servico.criar(corpo)
      notificar(`${singular[0].toUpperCase()}${singular.slice(1)} ${item ? 'atualizad' : 'cadastrad'}${genero}.`)
      setFormulario(null)
      await secretaria.recarregar()
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  async function remover() {
    setRemovendoOcupado(true)
    try {
      await servico.remover(removendo.id)
      notificar(t(`${singular[0].toUpperCase()}${singular.slice(1)} removid${genero}.`))
      setRemovendo(null)
      await secretaria.recarregar()
    } catch (err) {
      notificar(err.message, 'erro')
    } finally {
      setRemovendoOcupado(false)
    }
  }

  const opcoesDo = (campo) => secretaria[campo.opcoes.chave] ?? []

  return (
    <>
      <CabecalhoPagina
        titulo={titulo}
        descricao={descricao}
        acoes={
          <button type="button" className="btn btn--primario" onClick={abrirNovo}>
            <Icone nome="mais" tamanho={18} /> {t(rotuloNovo)}
          </button>
        }
      />

      <Carga carregando={secretaria.carregando} erro={secretaria.erro} onTentar={secretaria.recarregar} esqueleto={<EsqueletoTabela />}>
        {itens.length === 0 ? (
          <Vazio
            titulo={t(`Nenhum${genero === 'a' ? 'a' : ''} ${singular} cadastrad${genero}`)}
            texto={t('Use “{acao}” para começar.', { acao: t(rotuloNovo) })}
            acao={
              <button type="button" className="btn btn--primario" onClick={abrirNovo}>
                {t(rotuloNovo)}
              </button>
            }
          />
        ) : (
          <>
            <div className="barra-ferramentas">
              <div className="barra-ferramentas__busca">
                <Icone nome="busca" tamanho={18} className="busca__icone" />
                <label className="so-leitor" htmlFor="filtro-gestao">
                  {t('Filtrar {titulo}', { titulo: String(titulo).toLowerCase() })}
                </label>
                <input
                  id="filtro-gestao"
                  type="search"
                  placeholder={t('Filtrar por nome ou código')}
                  value={q}
                  onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
                />
              </div>
              {filtros.map((f) => {
                const valores = [...new Set(itens.map(f.valor))].sort((a, b) => a.localeCompare(b, idiomaAtual() === 'en' ? 'en' : 'pt-BR'))
                return (
                  <label key={f.rotulo} className="barra-ferramentas__filtro">
                    <span className="so-leitor">{f.rotulo}</span>
                    <select
                      aria-label={f.rotulo}
                      value={selecionados[f.rotulo] ?? ''}
                      onChange={(e) => setSelecionados({ ...selecionados, [f.rotulo]: e.target.value })}
                    >
                      <option value="">{t('{rotulo}: todos', { rotulo: f.rotulo })}</option>
                      {valores.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              })}
            </div>

            <div className="tabela-caixa">
              <table className="tabela tabela--cartoes">
                <thead>
                  <tr>
                    {colunas.map((c) => (
                      <th key={c.rotulo} scope="col">
                        {c.rotulo}
                      </th>
                    ))}
                    <th scope="col" className="tabela__acoes-cab">
                     {t('Ações')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((item) => (
                    <tr key={item.id}>
                      {colunas.map((c) => (
                        <td key={c.rotulo} data-rotulo={c.rotulo}>{c.render(item)}</td>
                      ))}
                      <td className="tabela__celula-acoes">
                        <div className="tabela__acoes">
                          <button type="button" className="btn-texto" onClick={() => abrirEdicao(item)} aria-label={t('Editar {item}', { item: rotuloItem(item) })}>
                           {t('Editar')}
                          </button>
                          <button type="button" className="btn-texto btn-texto--perigo" onClick={() => setRemovendo(item)} aria-label={t('Remover {item}', { item: rotuloItem(item) })}>
                           {t('Remover')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={colunas.length + 1}>{t('Nenhum resultado para os filtros atuais.')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="tabela__rodape">
                {plural(filtrados.length, singular, pluralPt)} {filtrados.length !== itens.length && t('de {total}', { total: itens.length })}
              </p>
            </div>
          </>
        )}
      </Carga>

      <Modal
        aberto={Boolean(formulario)}
        onFechar={() => !salvando && setFormulario(null)}
        titulo={formulario?.item ? t(`Editar ${singular}`) : t(rotuloNovo)}
        rodape={
          <>
            <button type="button" className="btn btn--secundario" onClick={() => setFormulario(null)} disabled={salvando}>
             {t('Cancelar')}
            </button>
            <button type="submit" form="form-gestao" className="btn btn--primario" disabled={salvando}>
              {salvando ? t('Salvando…') : t('Salvar')}
            </button>
          </>
        }
      >
        {formulario && (
          <form id="form-gestao" onSubmit={salvar} className="grade-campos">
            {campos
              .filter((c) => !(c.soCriacao && formulario.item))
              .map((c) => (
                <label key={c.nome} className="campo">
                  <span className="campo__rotulo">{c.rotulo}</span>
                  {c.tipo === 'select' ? (
                    <select
                      value={formulario.valores[c.nome] ?? ''}
                      onChange={(e) => setFormulario({ ...formulario, valores: { ...formulario.valores, [c.nome]: e.target.value } })}
                    >
                      <option value="">{t('Nenhum')}</option>
                      {opcoesDo(c).map((o) => (
                        <option key={o.id} value={o.id}>
                          {t(o[c.opcoes.rotulo])}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={c.tipo ?? 'text'}
                      min={c.min}
                      value={formulario.valores[c.nome] ?? ''}
                      required={c.obrigatorio || (c.senha && !formulario.item)}
                      autoComplete={c.senha ? 'new-password' : 'off'}
                      onChange={(e) => setFormulario({ ...formulario, valores: { ...formulario.valores, [c.nome]: e.target.value } })}
                    />
                  )}
                  {c.senha && formulario.item && <span className="campo__ajuda">{t('Deixe em branco para manter a senha atual.')}</span>}
                </label>
              ))}
          </form>
        )}
      </Modal>

      <Confirmar
        aberto={Boolean(removendo)}
        onFechar={() => setRemovendo(null)}
        onConfirmar={remover}
        ocupado={removendoOcupado}
        perigo
        titulo={t(`Remover ${singular}`)}
        rotuloConfirmar={t('Remover')}
        texto={
          removendo && (
            <p>
              {t(`Remover ${artigoDe === 'da' ? 'a' : 'o'} ${singular}`)} <strong>{rotuloItem(removendo)}</strong>? {t('Esta ação não pode ser desfeita.')}
            </p>
          )
        }
      />
    </>
  )
}
