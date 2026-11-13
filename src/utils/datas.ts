export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarPrazoResumido(data: string, horario: string | null) {
  const [, mes, dia] = data.split('-');
  const prazo = `${dia}/${mes}`;
  return horario ? `${prazo} · ${horario.slice(0, 5)}` : prazo;
}

export function horarioValido(horario: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario);
}
