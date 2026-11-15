export function contar(total: number, singular: string, plural: string) {
  return `${total} ${total === 1 ? singular : plural}`;
}
