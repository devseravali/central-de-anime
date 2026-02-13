export function normalizarTextoComparacao(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9\s]/g, '') 
    .replace(/\s+/g, ' ') 
}
