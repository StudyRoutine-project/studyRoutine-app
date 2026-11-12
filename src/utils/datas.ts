export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function horarioValido(horario: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario);
}
