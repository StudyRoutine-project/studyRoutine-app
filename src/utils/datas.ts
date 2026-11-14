const formatoDiaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarPrazoResumido(data: string, horario: string | null) {
  const [, mes, dia] = data.split('-');
  const prazo = `${dia}/${mes}`;
  return horario ? `${prazo} às ${horario.slice(0, 5)}` : prazo;
}

export function dataLocal(data: Date) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function diasAte(data: string, agora: number) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const hoje = new Date(agora);
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((new Date(ano, mes - 1, dia).getTime() - inicioHoje.getTime()) / 86_400_000);
}

function nomeDiaSemana(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const nome = formatoDiaSemana.format(new Date(ano, mes - 1, dia));
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export function prazoVencido(data: string, horario: string | null, agora: number) {
  if (!horario) return data < dataLocal(new Date(agora));

  const hora = horario.length === 5 ? `${horario}:00` : horario;
  return new Date(`${data}T${hora}`).getTime() < agora;
}

export function descreverPrazo(data: string, horario: string | null, agora: number) {
  const dias = diasAte(data, agora);
  const hora = horario ? ` às ${horario.slice(0, 5)}` : '';

  if (prazoVencido(data, horario, agora)) {
    if (dias === 0) return `Venceu hoje${hora}`;
    if (dias === -1) return 'Venceu ontem';
    return `Venceu há ${-dias} dias`;
  }
  if (dias === 0) return `Hoje${hora}`;
  if (dias === 1) return `Amanhã${hora}`;
  if (dias > 1 && dias < 7) {
    return `${nomeDiaSemana(data)}, ${formatarPrazoResumido(data, horario)}`;
  }
  return formatarPrazoResumido(data, horario);
}

export function horarioValido(horario: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario);
}
