import { createContext, useContext } from 'react'

/**
 * Contrato entre cada provedor de perfil e o cabeçalho:
 *  - avisos: [{ id, tom: 'info'|'ambar'|'verde', titulo, texto, to? }]  (calculados de dados reais)
 *  - buscar(termo): [{ grupo, titulo, subtitulo?, to }]
 */
export const ShellDados = createContext({ avisos: [], buscar: () => [] })

export function useShellDados() {
  return useContext(ShellDados)
}
