export function normalizarTexto(texto: string) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/\s+/g, ' ').toLowerCase();
}
