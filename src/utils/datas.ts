export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarPrazoResumido(data: string, horario: string | null) {
  const [, mes, dia] = data.split('-');
  const prazo = `${dia}/${mes}`;
  return horario ? `${prazo} · ${horario.slice(0, 5)}` : prazo;
}

export function dataLocal(data: Date) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function prazoVencido(data: string, horario: string | null, agora: number) {
  if (!horario) return data < dataLocal(new Date(agora));

  const hora = horario.length === 5 ? `${horario}:00` : horario;
  return new Date(`${data}T${hora}`).getTime() < agora;
}

export function horarioValido(horario: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario);
}
